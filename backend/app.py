from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
import sqlite3
import time
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import json
import bcrypt

app = Flask(__name__)
CORS(app, supports_credentials=True, origins="*")

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'tiff', 'svg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Lazy loading for CLIP model
_model = None
_processor = None

# JWT config
app.config['SECRET_KEY'] = 'your-secret-key-here'  # In production, use environment variable
app.config['JWT_EXPIRATION_DELTA'] = datetime.timedelta(days=1)

# Database setup
def init_db():
    """Initialize the SQLite database and create tables if they do not exist."""
    conn = sqlite3.connect('products.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
         email TEXT UNIQUE NOT NULL,
         password_hash TEXT NOT NULL,
         role TEXT NOT NULL DEFAULT 'user',
         name_surname TEXT,
         address TEXT,
         phone TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS products
        (id TEXT PRIMARY KEY,
         name TEXT,
         description TEXT,
         image_url TEXT,
         categories TEXT,
         price REAL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         user_id INTEGER)
    ''')
    conn.commit()
    conn.close()

# Create the database when the app starts
init_db()

def get_model():
    global _model
    if _model is None:
        _model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
    return _model

def get_processor():
    global _processor
    if _processor is None:
        _processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    return _processor

# Ana kategoriler ve alt kategoriler
PRODUCT_HIERARCHY = {
    "Fashion & Clothing": {
        "prompt": "a product photo of {}, fashion or clothing item",
        "subcategories": {
            "Men's Clothing": ["shirts", "pants", "suits", "jackets", "t-shirts"],
            "Women's Clothing": ["dresses", "tops", "skirts", "pants", "blouses"],
            "Kids & Baby Clothing": ["children's wear", "baby clothes", "kids shoes"],
            "Shoes": ["sneakers", "boots", "sandals", "formal shoes", "sports shoes"],
            "Accessories": {
                "Bags": ["handbags", "backpacks", "wallets"],
                "Belts": ["leather belts", "fashion belts"],
                "Jewelry": ["necklaces", "bracelets", "rings"],
                "Earrings": ["stud earrings", "hoop earrings", "drop earrings"]
            }
        }
    },
    "Electronics": {
        "prompt": "a product photo of {}, electronic device or gadget, showing the complete device",
        "subcategories": {
            "Smartphones & Tablets": ["complete smartphone", "full mobile phone", "tablet device", "complete mobile device"],
            "Laptops & Computers": ["laptop computer", "desktop computer", "computer monitor"],
            "TV & Home Entertainment": ["television set", "sound system", "media player"],
            "Cameras": ["digital camera", "video camera", "camera lens"],
            "Wearables": {
                "Smartwatches": ["smart watch", "fitness tracker"]
            },
            "Accessories": {
                "Chargers": ["device charger", "charging adapter"],
                "Cables": ["connection cable", "charging cable"]
            }
        }
    },
    "Home & Furniture": {
        "prompt": "a product photo of {}, home or furniture item",
        "subcategories": {
            "Furniture": ["sofas", "beds", "tables", "chairs", "cabinets"],
            "Home Decor": ["wall art", "vases", "mirrors", "rugs", "cushions"],
            "Kitchenware": ["pots", "pans", "utensils", "dinnerware"],
            "Lighting": ["lamps", "ceiling lights", "wall lights"],
            "Storage & Organization": ["shelves", "storage boxes", "organizers"]
        }
    },
    "Beauty & Personal Care": {
        "prompt": "a product photo of {}, beauty or personal care product",
        "subcategories": {
            "Skincare": ["face cream", "serum", "moisturizer", "cleanser"],
            "Hair Care": ["shampoo", "conditioner", "hair treatment"],
            "Makeup": ["lipstick", "foundation", "mascara", "eyeshadow"],
            "Perfumes": ["perfume", "cologne", "fragrance"],
            "Men's Grooming": ["shaving cream", "aftershave", "beard care"]
        }
    },
    "Health & Wellness": {
        "prompt": "a product photo of {}, health or wellness item",
        "subcategories": {
            "Supplements & Vitamins": ["vitamins", "supplements", "protein powder"],
            "Fitness Equipment": ["yoga mat", "weights", "exercise bands"],
            "Medical Devices": ["blood pressure monitor", "thermometer", "health tracker"],
            "Hygiene Products": ["sanitizer", "masks", "personal hygiene items"]
        }
    },
    "Groceries & Food": {
        "prompt": "a product photo of {}, food or grocery item",
        "subcategories": {
            "Fresh Food": ["fruits", "vegetables", "meat", "dairy"],
            "Packaged Food": ["snacks", "canned food", "pasta", "cereals"],
            "Beverages": ["coffee", "tea", "soft drinks", "water"],
            "Organic & Healthy Food": ["organic products", "health food", "superfoods"]
        }
    },
    "Baby & Kids": {
        "prompt": "a product photo of {}, baby or kids item",
        "subcategories": {
            "Toys": ["educational toys", "stuffed animals", "building blocks"],
            "Diapers & Wipes": ["baby diapers", "wet wipes", "changing supplies"],
            "Baby Food": ["formula", "baby snacks", "baby cereals"],
            "Nursery Essentials": ["cribs", "strollers", "baby monitors"]
        }
    },
    "Sports & Outdoors": {
        "prompt": "a product photo of {}, sports or outdoor equipment",
        "subcategories": {
            "Exercise Equipment": ["treadmill", "exercise bike", "dumbbells"],
            "Outdoor Gear": ["camping gear", "hiking equipment", "backpacks"],
            "Sportswear": ["athletic wear", "sports shoes", "workout clothes"],
            "Bikes & Accessories": ["bicycles", "bike parts", "cycling gear"]
        }
    },
    "Books & Stationery": {
        "prompt": "a product photo of {}, book or stationery item",
        "subcategories": {
            "Fiction & Non-fiction": ["novels", "biographies", "textbooks"],
            "Academic & Educational": ["study guides", "reference books", "educational materials"],
            "Office Supplies": ["notebooks", "pens", "desk organizers"],
            "Art Supplies": ["paint supplies", "drawing materials", "craft items"]
        }
    },
    "Automotive & Tools": {
        "prompt": "a product photo of {}, automotive or tool item",
        "subcategories": {
            "Car Accessories": ["car covers", "car chargers", "car mats"],
            "Auto Parts": ["engine parts", "filters", "brake parts"],
            "Tools & Equipment": ["power tools", "hand tools", "tool sets"]
        }
    },
    "Pet Supplies": {
        "prompt": "a product photo of {}, pet supply item",
        "subcategories": {
            "Pet Food": ["dog food", "cat food", "pet treats"],
            "Toys & Accessories": ["pet toys", "collars", "leashes"],
            "Grooming Products": ["pet shampoo", "brushes", "grooming tools"]
        }
    },
    "Toys & Games": {
        "prompt": "a product photo of {}, toy or game item",
        "subcategories": {
            "Board Games": ["board games", "card games", "strategy games"],
            "Puzzles": ["jigsaw puzzles", "brain teasers", "3D puzzles"],
            "Educational Toys": ["learning toys", "science kits", "building sets"],
            "Collectibles": ["action figures", "model kits", "collectible cards"]
        }
    },
    "Travel & Luggages": {
        "prompt": "a product photo of {}, travel or luggage item",
        "subcategories": {
            "Luggage & Bags": ["suitcases", "travel bags", "backpacks"],
            "Travel Accessories": ["travel pillows", "luggage tags", "travel adapters"]
        }
    }
}

def flatten_categories(hierarchy, parent_category=""):
    """Flattens a hierarchical category structure into a list of tuples."""
    flattened = []
    for category, data in hierarchy.items():
        full_category = f"{parent_category} - {category}" if parent_category else category
        if isinstance(data, dict):
            if "prompt" in data:  # Main category
                subcats = data["subcategories"]
                if isinstance(subcats, dict):
                    for subcat, subdata in subcats.items():
                        if isinstance(subdata, list):  # Subcategory list
                            for item in subdata:
                                flattened.append((full_category, subcat, item))
                        elif isinstance(subdata, dict):  # Nested subcategories
                            nested = flatten_categories({subcat: subdata}, full_category)
                            flattened.extend(nested)
                elif isinstance(subcats, list):  # Simple subcategory list
                    for item in subcats:
                        flattened.append((full_category, "", item))
            else:  # Nested category
                nested = flatten_categories(data, full_category)
                flattened.extend(nested)
    return flattened

def generate_prompts(category_data):
    """Generates dynamic prompts for each category."""
    prompts = []
    categories = []
    # Flatten categories
    flattened_categories = flatten_categories(category_data)
    for main_cat, sub_cat, item in flattened_categories:
        # Find main category
        main_category = main_cat.split(" - ")[0]
        prompt_template = category_data[main_category]["prompt"]
        # Build category path
        category_path = f"{main_cat}"
        if sub_cat:
            category_path += f" - {sub_cat}"
        # Main prompt
        prompts.append(prompt_template.format(item))
        categories.append(f"{category_path} - {item}")
        # Specific prompt
        prompts.append(f"a clear product photo of {item}")
        categories.append(f"{category_path} - {item}")
        # English prompt
        prompts.append(f"this is a {item} product photo")
        categories.append(f"{category_path} - {item}")
    return prompts, categories

def analyze_image(image_path):
    """Analyze an image and return the top categories using the CLIP model."""
    try:
        print(f"Starting image analysis for: {image_path}")
        
        # Check if file exists
        if not os.path.exists(image_path):
            print(f"Error: Image file not found at {image_path}")
            return None
            
        # Load and preprocess image
        image = Image.open(image_path).convert('RGB')
        print(f"Image loaded successfully, size: {image.size}")
        
        processor = get_processor()
        model = get_model()
        print("Model and processor loaded successfully")
        
        # Generate dynamic prompts
        prompts, categories = generate_prompts(PRODUCT_HIERARCHY)
        print(f"Generated {len(prompts)} prompts for {len(categories)} categories")
        
        # Process image with CLIP
        inputs = processor(images=image, return_tensors="pt", padding=True)
        image_features = model.get_image_features(**inputs)
        print("Image features extracted")
        
        # Get text features for categories with improved prompts
        text_inputs = processor(text=prompts, return_tensors="pt", padding=True)
        text_features = model.get_text_features(**text_inputs)
        print("Text features extracted")
        
        # Calculate similarities
        similarity = torch.nn.functional.cosine_similarity(
            image_features.unsqueeze(1), 
            text_features.unsqueeze(0), 
            dim=2
        ).squeeze()
        print(f"Similarity calculation completed, shape: {similarity.shape}")
        
        # Take average score for each set of three prompts (main category, specific, English)
        num_prompts_per_category = 3
        confidence_threshold = 0.15  # Lowered threshold for more results
        
        # Calculate average for each category
        averaged_similarity = similarity.view(-1, num_prompts_per_category).mean(dim=1)
        print(f"Averaged similarity shape: {averaged_similarity.shape}")
        
        # Get top categories with confidence threshold
        top_scores, top_indices = averaged_similarity.topk(min(10, len(averaged_similarity)))
        print(f"Top scores: {top_scores}")
        
        # Filter results above threshold
        results = []
        seen_categories = set()  # Prevent duplicate categories
        
        for score, idx in zip(top_scores, top_indices):
            if score > confidence_threshold:
                category = categories[idx * num_prompts_per_category]
                if category not in seen_categories:
                    results.append({
                        "name": category,
                        "confidence": float(score)
                    })
                    seen_categories.add(category)
                    print(f"Added category: {category} with confidence: {float(score)}")
        
        # If no results above threshold, take top 3 anyway
        if len(results) == 0:
            print("No results above threshold, taking top 3...")
            for i in range(min(3, len(top_scores))):
                score = top_scores[i]
                idx = top_indices[i]
                category = categories[idx * num_prompts_per_category]
                if category not in seen_categories:
                    results.append({
                        "name": category,
                        "confidence": float(score)
                    })
                    seen_categories.add(category)
                    print(f"Force added category: {category} with confidence: {float(score)}")
        
        # Sort by confidence and take top 5
        results = sorted(results, key=lambda x: x["confidence"], reverse=True)[:5]
        print(f"Final results: {results}")
        
        return {
            "categories": results,
            "image_url": f"/uploads/{os.path.basename(image_path)}"
        }
        
    except Exception as e:
        print(f"Error in analyze_image: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def allowed_file(filename):
    """Check if the file extension is allowed for upload."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    """Upload a product image, analyze it, and save the product for the authenticated user."""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        payload = get_jwt_payload()
        if not payload or not payload.get('user_id'):
            return jsonify({'error': 'Authorization header missing or invalid'}), 401
        user_id = payload['user_id']
        
        # Form verilerini al
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        # Ürün bilgilerini al
        name = request.form.get('name')
        description = request.form.get('description')
        price = request.form.get('price')
        selected_categories = request.form.get('categories')  # JSON string olarak gelecek
        
        if not name or not description or not price or not selected_categories:
            return jsonify({'error': 'Missing required product information'}), 400
        
        # Parse categories
        import json
        categories_list = json.loads(selected_categories)
        
        # Save the file
        filename = secure_filename(file.filename)
        timestamp = str(int(time.time() * 1000))
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Get user info for seller name
        conn = sqlite3.connect('products.db')
        c = conn.cursor()
        
        c.execute('SELECT name_surname, email FROM users WHERE id = ?', (user_id,))
        user_info = c.fetchone()
        seller_name = user_info[0] if user_info and user_info[0] else user_info[1].split('@')[0] if user_info else 'Unknown Seller'
        
        # Save product to database
        product_id = timestamp
        insert_query = '''
            INSERT INTO products (id, name, description, image_url, categories, price, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        '''
        insert_values = (
            product_id,
            name,
            description,
            f"/uploads/{unique_filename}",
            json.dumps(categories_list),
            float(price),
            user_id
        )
        
        c.execute(insert_query, insert_values)
        conn.commit()
        conn.close()
        
        product_data = {
            'id': product_id,
            'name': name,
            'description': description,
            'image_url': f"/uploads/{unique_filename}",
            'categories': categories_list,
            'price': float(price),
            'seller': seller_name,
            'user_id': user_id
        }
        
        return jsonify(product_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['GET', 'POST'])
def get_products():
    """Get all products belonging to the authenticated user or add a new product."""
    if request.method == 'OPTIONS':
        return '', 200
    payload = get_jwt_payload()
    if not payload or not payload.get('user_id'):
        return jsonify({'error': 'Authorization header missing or invalid'}), 401
    user_id = payload['user_id']
    conn = sqlite3.connect('products.db')
    c = conn.cursor()
    if request.method == 'GET':
        # Use explicit column selection to ensure correct mapping
        c.execute('''
            SELECT id, name, image_url, categories, created_at, user_id, description, price 
            FROM products 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ''', (user_id,))
        products = c.fetchall()
        conn.close()
        
        product_list = []
        for product in products:
            try:
                # Correct column mapping: 0:id, 1:name, 2:image_url, 3:categories, 4:created_at, 5:user_id, 6:description, 7:price
                categories_data = product[3] if product[3] else '[]'
                if isinstance(categories_data, str):
                    categories = json.loads(categories_data)
                else:
                    categories = categories_data
            except (json.JSONDecodeError, TypeError):
                categories = []
                
            product_list.append({
                'id': product[0],
                'name': product[1],
                'image_url': product[2],
                'categories': categories,
                'description': product[6] if product[6] else f"Description for {product[1]}",
                'price': product[7] if product[7] else 0.0,
                'created_at': product[4]
            })
        return jsonify(product_list)
    elif request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        price = data.get('price')
        categories = data.get('categories')
        image = data.get('image')  # Demo amaçlı, gerçek uygulamada dosya upload ayrı olmalı
        if not name or not description or not price or not categories:
            return jsonify({'error': 'Missing required fields'}), 400
        # Demo: ürün id'si olarak timestamp kullan
        import time
        product_id = str(int(time.time() * 1000))
        c.execute('''
            INSERT INTO products (id, name, image_url, categories, price, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            product_id,
            name,
            image if image else '',
            str(categories),
            float(price),
            user_id
        ))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Product saved successfully!'}), 201

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/products/<product_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def manage_product(product_id):
    """Update or delete a product if the requesting user is the owner."""
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Methods', 'PUT, DELETE')
        return response
    
    payload = get_jwt_payload()
    if not payload or not payload.get('user_id'):
        return jsonify({'error': 'Authorization header missing or invalid'}), 401
    user_id = payload['user_id']
    
    try:
        conn = sqlite3.connect('products.db')
        cursor = conn.cursor()
        
        # First check if product exists and get its user_id
        cursor.execute('SELECT user_id FROM products WHERE id = ?', (product_id,))
        result = cursor.fetchone()
        if not result:
            conn.close()
            return jsonify({'error': 'Product not found'}), 404
        
        product_user_id = result[0]
        if str(product_user_id) != str(user_id):
            conn.close()
            return jsonify({'error': 'You are not authorized to modify this product.'}), 403
        
        if request.method == 'PUT':
            # Update product
            data = request.get_json()
            name = data.get('name')
            description = data.get('description') 
            price = data.get('price')
            
            if not name or not description or price is None:
                conn.close()
                return jsonify({'error': 'Missing required fields'}), 400
            
            cursor.execute('''
                UPDATE products 
                SET name = ?, description = ?, price = ? 
                WHERE id = ?
            ''', (name, description, float(price), product_id))
            
            conn.commit()
            conn.close()
            return jsonify({'message': 'Product updated successfully'}), 200
            
        elif request.method == 'DELETE':
            # Delete product (existing code)
            cursor.execute('SELECT image_url FROM products WHERE id = ?', (product_id,))
            result = cursor.fetchone()
            image_url = result[0] if result else None
            
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], os.path.basename(image_url)) if image_url else None
            
            # Delete from database first
            cursor.execute('DELETE FROM products WHERE id = ?', (product_id,))
            conn.commit()
            conn.close()
            
            # Then try to delete the image file if it exists
            if image_path and os.path.exists(image_path):
                os.remove(image_path)
            
            return jsonify({'message': 'Product deleted successfully'}), 200
            
    except Exception as e:
        if 'conn' in locals():
            conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register_user():
    """Register a new user with email and password."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'customer')  # gelen role'u kullan, yoksa customer
    
    # Sadece customer ve seller rollerini kabul et
    if role not in ['customer', 'seller']:
        role = 'customer'
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400
    conn = sqlite3.connect('products.db')
    c = conn.cursor()
    c.execute('SELECT id FROM users WHERE email = ?', (email,))
    if c.fetchone():
        conn.close()
        return jsonify({'error': 'Email already registered'}), 400
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    c.execute('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', (email, hashed_password, role))
    conn.commit()
    conn.close()
    return jsonify({'message': f'User registered successfully as {role}'}), 201

@app.route('/api/login', methods=['POST'])
def login_user():
    """Authenticate a user and return a JWT token."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400
    conn = sqlite3.connect('products.db')
    c = conn.cursor()
    c.execute('SELECT id, password_hash, role FROM users WHERE email = ?', (email,))
    user = c.fetchone()
    conn.close()
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user[1] if isinstance(user[1], bytes) else user[1].encode('utf-8')):
        return jsonify({'error': 'Invalid email or password.'}), 401
    payload = {
        'user_id': user[0],
        'email': email,
        'role': user[2],
        'exp': datetime.datetime.utcnow() + app.config['JWT_EXPIRATION_DELTA']
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    return jsonify({
        'token': token,
        'user': {
            'email': email,
            'role': user[2]
        }
    }), 200

# Admin kontrolü için decorator - Artık seller kontrolü yapacak
def seller_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header missing'}), 401
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            if payload.get('role') != 'seller':
                return jsonify({'error': 'Seller access required'}), 403
        except Exception as e:
            return jsonify({'error': 'Invalid or expired token'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Tüm kullanıcıları listele (seller yetkisi ile)
@app.route('/api/users', methods=['GET'])
@seller_required
def get_all_users():
    conn = sqlite3.connect('products.db')
    c = conn.cursor()
    c.execute('SELECT id, email, role, name_surname, address, phone FROM users')
    users = [
        {
            'id': row[0],
            'email': row[1],
            'role': row[2],
            'name_surname': row[3],
            'address': row[4],
            'phone': row[5]
        }
        for row in c.fetchall()
    ]
    conn.close()
    return jsonify(users)

# Belirli bir kullanıcının detaylarını getir (seller yetkisi ile)
@app.route('/api/users/<int:user_id>', methods=['GET'])
@seller_required
def get_user_detail(user_id):
    conn = sqlite3.connect('products.db')
    c = conn.cursor()
    c.execute('SELECT id, email, role FROM users WHERE id = ?', (user_id,))
    row = c.fetchone()
    conn.close()
    if row:
        user = {'id': row[0], 'email': row[1], 'role': row[2]}
        return jsonify(user)
    else:
        return jsonify({'error': 'User not found'}), 404

def get_jwt_payload():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except Exception:
        return None

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    payload = get_jwt_payload()
    if not payload:
        return jsonify({'error': 'Authorization header missing or invalid'}), 401
    is_seller = payload.get('role') == 'seller'
    is_self = payload.get('user_id') == user_id
    if not (is_seller or is_self):
        return jsonify({'error': 'Forbidden'}), 403

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name_surname = data.get('name_surname')
    address = data.get('address')
    phone = data.get('phone')

    conn = sqlite3.connect('products.db')
    c = conn.cursor()
    # Benzersiz email kontrolü
    if email:
        c.execute('SELECT id FROM users WHERE email = ? AND id != ?', (email, user_id))
        if c.fetchone():
            conn.close()
            return jsonify({'error': 'Email already in use.'}), 409

    # Mevcut kullanıcıyı çek
    c.execute('SELECT id, email, role, name_surname, address, phone FROM users WHERE id = ?', (user_id,))
    user = c.fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404

    # Alanları güncelle
    update_fields = []
    update_values = []
    if email:
        update_fields.append('email = ?')
        update_values.append(email)
    if password:
        update_fields.append('password_hash = ?')
        update_values.append(generate_password_hash(password))
    if name_surname is not None:
        update_fields.append('name_surname = ?')
        update_values.append(name_surname)
    if address is not None:
        update_fields.append('address = ?')
        update_values.append(address)
    if phone is not None:
        update_fields.append('phone = ?')
        update_values.append(phone)

    if update_fields:
        update_values.append(user_id)
        c.execute(f'UPDATE users SET {", ".join(update_fields)} WHERE id = ?', update_values)
        conn.commit()

    # Güncellenmiş kullanıcıyı döndür
    c.execute('SELECT id, email, role, name_surname, address, phone FROM users WHERE id = ?', (user_id,))
    updated_user = c.fetchone()
    conn.close()
    user_dict = {
        'id': updated_user[0],
        'email': updated_user[1],
        'role': updated_user[2],
        'name_surname': updated_user[3],
        'address': updated_user[4],
        'phone': updated_user[5]
    }
    return jsonify({'message': 'User updated successfully.', 'user': user_dict}), 200

@app.route('/api/users/self', methods=['PUT'])
def update_self():
    payload = get_jwt_payload()
    if not payload:
        return jsonify({'error': 'Authorization header missing or invalid'}), 401
    email = payload['email']
    conn = sqlite3.connect('products.db')
    c = conn.cursor()
    c.execute('SELECT id FROM users WHERE email = ?', (email,))
    user = c.fetchone()
    conn.close()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user_id = user[0]
    return update_user(user_id)

def load_users():
    if os.path.exists('users.json'):
        with open('users.json', 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    with open('users.json', 'w') as f:
        json.dump(users, f)

@app.route('/api/profile', methods=['GET'])
def get_profile():
    payload = get_jwt_payload()
    if not payload:
        return jsonify({'error': 'Authorization header missing or invalid'}), 401
    email = payload['email']
    conn = sqlite3.connect('products.db')
    c = conn.cursor()
    c.execute('SELECT id, email, role, name_surname, address, phone FROM users WHERE email = ?', (email,))
    user = c.fetchone()
    conn.close()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    # Tüm rollerde aynı bilgileri döndür
    return jsonify({
        'email': user[1],
        'role': user[2],
        'name_surname': user[3],
        'address': user[4],
        'phone': user[5]
    })

@app.route('/api/categorize', methods=['POST'])
def categorize_image():
    try:
        print("Received categorize request")
        
        if 'image' not in request.files:
            print("Error: No image in request files")
            return jsonify({'error': 'No image uploaded'}), 400
            
        file = request.files['image']
        if file.filename == '':
            print("Error: Empty filename")
            return jsonify({'error': 'No selected file'}), 400
            
        print(f"Processing file: {file.filename}")
        
        # Save the file
        filename = secure_filename(file.filename)
        timestamp = str(int(time.time() * 1000))
        unique_filename = f"temp_{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        file.save(filepath)
        print(f"File saved to: {filepath}")
        
        # Analyze the image
        results = analyze_image(filepath)
        
        # Clean up temporary file
        try:
            os.remove(filepath)
            print(f"Temporary file removed: {filepath}")
        except:
            print(f"Could not remove temporary file: {filepath}")
        
        if not results or not results.get('categories'):
            print("Error: AI categorization failed - no results")
            return jsonify({'error': 'AI categorization failed - could not analyze image'}), 500
            
        print(f"Categorization successful: {results}")
        return jsonify({'categories': results['categories']})
        
    except Exception as e:
        print(f"Error in categorize_image endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/all-products', methods=['GET', 'OPTIONS'])
def get_all_products():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        conn = sqlite3.connect('products.db')
        c = conn.cursor()
        c.execute('''
            SELECT p.id, p.name, p.image_url, p.categories, p.created_at, p.user_id, p.description, p.price, u.name_surname, u.email 
            FROM products p 
            LEFT JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        ''')
        products = c.fetchall()
        conn.close()
        
        product_list = []
        for product in products:
            try:
                # Correct column mapping based on actual schema:
                # 0: id, 1: name, 2: image_url, 3: categories, 4: created_at, 5: user_id, 6: description, 7: price, 8: name_surname, 9: email
                product_id = product[0]
                name = product[1]
                image_url = product[2]
                categories_data = product[3] if product[3] else '[]'
                description = product[6] if product[6] else f"Description for {name}"
                price = product[7] if product[7] else 0.0
                user_name_surname = product[8]
                user_email = product[9]
                
                # Safely parse categories JSON
                if isinstance(categories_data, str):
                    categories = json.loads(categories_data)
                else:
                    categories = categories_data
                    
            except (json.JSONDecodeError, TypeError) as e:
                categories = []  # Fallback to empty array
            
            seller_name = user_name_surname if user_name_surname else user_email.split('@')[0] if user_email else 'Unknown Seller'
            
            product_dict = {
                'id': product_id,
                'name': name,
                'description': description,
                'image_url': image_url,
                'categories': categories,
                'price': float(price),
                'seller': seller_name
            }
            
            product_list.append(product_dict)
            
        return jsonify(product_list)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def home():
    return jsonify({'message': 'AI Product Categorizer API is running!'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000) 