from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
import sqlite3
import clip
import time

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:4001"],
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'tiff', 'svg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Lazy loading for CLIP model
_model = None
_processor = None

# Veritabanı kurulumu
def init_db():
    conn = sqlite3.connect('products.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS products
        (id TEXT PRIMARY KEY,
         name TEXT,
         image_url TEXT,
         categories TEXT,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
    ''')
    conn.commit()
    conn.close()

# Uygulama başladığında veritabanını oluştur
init_db()

# CLIP modelini yükle
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

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
    "Appliances": {
        "prompt": "a product photo of {}, household appliance",
        "subcategories": {
            "Large Appliances": {
                "Refrigerators": ["refrigerator", "fridge freezer"],
                "Washing Machines": ["washing machine", "dryer"]
            },
            "Small Appliances": {
                "Toasters": ["toaster", "toaster oven"],
                "Vacuum Cleaners": ["vacuum cleaner", "handheld vacuum"]
            },
            "Kitchen Appliances": {
                "Microwave": ["microwave oven"],
                "Coffee Makers": ["coffee machine", "espresso maker"]
            }
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
    "Mobile & Computer Accessories": {
        "prompt": "a product photo of {}, clearly showing it is an accessory or case, not the main device",
        "subcategories": {
            "Phone Accessories": {
                "Cases & Covers": ["protective phone case", "phone cover", "smartphone case"],
                "Screen Protection": ["screen protector", "tempered glass"],
                "Holders": ["phone stand", "phone mount", "phone grip"]
            },
            "Computer Peripherals": ["computer keyboard", "computer mouse", "external drive"]
        }
    },
    "Travel & Luggage": {
        "prompt": "a product photo of {}, travel or luggage item",
        "subcategories": {
            "Luggage & Bags": ["suitcases", "travel bags", "backpacks"],
            "Travel Accessories": ["travel pillows", "luggage tags", "travel adapters"]
        }
    }
}

def flatten_categories(hierarchy, parent_category=""):
    """Hiyerarşik kategori yapısını düzleştirir"""
    flattened = []
    
    for category, data in hierarchy.items():
        full_category = f"{parent_category} - {category}" if parent_category else category
        
        if isinstance(data, dict):
            if "prompt" in data:  # Ana kategori
                subcats = data["subcategories"]
                if isinstance(subcats, dict):
                    for subcat, subdata in subcats.items():
                        if isinstance(subdata, list):  # Alt kategori liste
                            for item in subdata:
                                flattened.append((full_category, subcat, item))
                        elif isinstance(subdata, dict):  # Nested alt kategoriler
                            nested = flatten_categories({subcat: subdata}, full_category)
                            flattened.extend(nested)
                elif isinstance(subcats, list):  # Basit alt kategori listesi
                    for item in subcats:
                        flattened.append((full_category, "", item))
            else:  # Nested kategori
                nested = flatten_categories(data, full_category)
                flattened.extend(nested)
                
    return flattened

def generate_prompts(category_data):
    """Her kategori için dinamik promptlar oluşturur"""
    prompts = []
    categories = []
    
    # Kategorileri düzleştir
    flattened_categories = flatten_categories(category_data)
    
    for main_cat, sub_cat, item in flattened_categories:
        # Ana kategoriyi bul
        main_category = main_cat.split(" - ")[0]
        prompt_template = category_data[main_category]["prompt"]
        
        # Kategori yolunu oluştur
        category_path = f"{main_cat}"
        if sub_cat:
            category_path += f" - {sub_cat}"
        
        # Ana prompt
        prompts.append(prompt_template.format(item))
        categories.append(f"{category_path} - {item}")
        
        # Spesifik prompt
        prompts.append(f"a clear product photo of {item}")
        categories.append(f"{category_path} - {item}")
        
        # Türkçe prompt
        prompts.append(f"this is a {item} product photo")
        categories.append(f"{category_path} - {item}")
    
    return prompts, categories

def analyze_image(image_path):
    """Enhanced image analysis"""
    try:
        # Load and preprocess image
        image = Image.open(image_path).convert('RGB')
        processor = get_processor()
        model = get_model()

        # Generate dynamic prompts
        prompts, categories = generate_prompts(PRODUCT_HIERARCHY)
        
        # Process image with CLIP
        inputs = processor(images=image, return_tensors="pt", padding=True)
        image_features = model.get_image_features(**inputs)
        
        # Get text features for categories with improved prompts
        text_inputs = processor(text=prompts, return_tensors="pt", padding=True)
        text_features = model.get_text_features(**text_inputs)
        
        # Calculate similarities
        similarity = torch.nn.functional.cosine_similarity(
            image_features.unsqueeze(1), 
            text_features.unsqueeze(0), 
            dim=2
        ).squeeze()
        
        # Take average score for each set of three prompts (main category, specific, English)
        num_prompts_per_category = 3
        confidence_threshold = 0.25
        
        # Calculate average for each category
        averaged_similarity = similarity.view(-1, num_prompts_per_category).mean(dim=1)
        
        # Get top categories with confidence threshold
        top_scores, top_indices = averaged_similarity.topk(5)
        
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
        
        # Sort by confidence and take top 3
        results = sorted(results, key=lambda x: x["confidence"], reverse=True)[:3]
        
        return {
            "categories": results,
            "image_url": f"/uploads/{os.path.basename(image_path)}"
        }
        
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        return None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    if request.method == 'OPTIONS':
        return '', 200
        
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    try:
        # Save the file
        filename = secure_filename(file.filename)
        timestamp = str(int(time.time() * 1000))
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Analyze the image
        results = analyze_image(filepath)
        if not results:
            # Fotoğrafı sil
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': 'Failed to analyze image'}), 500
        
        # Eğer kategoriler boşsa kaydetme ve fotoğrafı sil
        if not results['categories'] or len(results['categories']) == 0:
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': 'No category found for this product.'}), 400
        
        # Save product to database
        product_id = timestamp
        product_data = {
            'id': product_id,
            'name': f"Product {product_id}",
            'image_url': f"/uploads/{unique_filename}",
            'categories': results['categories']
        }
        
        conn = sqlite3.connect('products.db')
        c = conn.cursor()
        c.execute('''
            INSERT INTO products (id, name, image_url, categories)
            VALUES (?, ?, ?, ?)
        ''', (
            product_data['id'],
            product_data['name'],
            product_data['image_url'],
            str(results['categories'])
        ))
        conn.commit()
        conn.close()
        
        return jsonify(product_data)
        
    except Exception as e:
        print(f"Error processing upload: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['GET', 'OPTIONS'])
def get_products():
    if request.method == 'OPTIONS':
        return '', 200
    conn = sqlite3.connect('products.db')
    c = conn.cursor()
    c.execute('SELECT * FROM products ORDER BY created_at DESC')
    products = c.fetchall()
    conn.close()
    
    product_list = []
    for product in products:
        product_list.append({
            'id': product[0],
            'name': product[1],
            'image_url': product[2],
            'categories': eval(product[3])  # String'i liste/dict'e çevir
        })
    
    return jsonify(product_list)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/products/<product_id>', methods=['DELETE', 'OPTIONS'])
def delete_product(product_id):
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Methods', 'DELETE')
        return response

    try:
        # Connect to database
        conn = sqlite3.connect('products.db')
        cursor = conn.cursor()

        # First check if product exists
        cursor.execute('SELECT image_url FROM products WHERE id = ?', (product_id,))
        result = cursor.fetchone()

        if not result:
            conn.close()
            return jsonify({'error': 'Product not found'}), 404

        image_url = result[0]
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], os.path.basename(image_url))

        # Delete from database first
        cursor.execute('DELETE FROM products WHERE id = ?', (product_id,))
        conn.commit()
        conn.close()

        # Then try to delete the image file if it exists
        if os.path.exists(image_path):
            os.remove(image_path)

        return jsonify({'message': 'Product deleted successfully'}), 200

    except Exception as e:
        # If there was a database connection, close it
        if 'conn' in locals():
            conn.close()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True) 