# 🚀 Setup Guide for Collaborators

## 📋 What You Need to Do After Cloning

When you clone this project from GitHub, some files are not included (they're in `.gitignore`). You need to set them up locally:

### **1. Backend Setup**

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create database and test users
python create_test_users.py
```

### **2. Frontend Setup**

```bash
cd frontend

# Install Node.js dependencies
npm install
```

### **3. Start the Application**

**Backend (Terminal 1):**
```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
python app.py
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
```

### **4. Access the Application**
- Frontend: http://localhost:4001
- Backend API: http://localhost:8000

### **5. Test Accounts**
- **Customer**: `user@user.com` / `usersuser`
- **Seller**: `admin@admin.com` / `adminadmin`

## 📁 Files That Will Be Created Automatically

After setup, these files/folders will be created locally:
- `backend/venv/` - Python virtual environment
- `backend/products.db` - SQLite database with test data
- `frontend/node_modules/` - NPM packages
- `backend/uploads/` - Will contain uploaded product images

## ⚠️ Important Notes

1. **Virtual Environment**: Always activate the virtual environment before running backend
2. **Database**: The database will be created with sample products and test users
3. **Dependencies**: Make sure you have Python 3.8+ and Node.js 14+ installed
4. **Ports**: Backend runs on port 8000, frontend on port 4001

## 🔧 Troubleshooting

- **Python not found**: Make sure Python is in your PATH
- **Permission errors**: Use virtual environment, avoid sudo
- **Port conflicts**: Change ports in app.py or package.json if needed
- **Module not found**: Ensure virtual environment is activated

---

*This project is ready to run after following these setup steps!* 