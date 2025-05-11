# AI Product Categorizer

A full-stack web application for AI-powered product image categorization, user management, and product listing. Built with React (Chakra UI) on the frontend and Flask (PyTorch, CLIP) on the backend.

---

## Features
- **User Authentication:** Register, login, logout, JWT-based session management
- **Admin Panel:** View all users and their details (admin only)
- **Profile Page:** View and update your profile information
- **Product Upload:** Upload product images, analyze with AI, and categorize
- **My Products:** List, view, and delete your own uploaded products
- **Responsive UI:** Mobile and desktop friendly, modern Chakra UI design
- **Security:** Only product owners can delete their products; JWT required for all critical endpoints

---

## Quick Start

### Backend Setup
1. `cd backend`
2. `python3 -m venv venv && source venv/bin/activate`
3. `pip install -r requirements.txt`
4. `flask run --host=0.0.0.0 --port=8000`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm start`

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)

---

## Folder Structure
```
AIProductCategorizer/
├── backend/
│   ├── app.py
│   ├── products.db
│   ├── requirements.txt
│   └── USED_TECHNOLOGIES.md
├── frontend/
│   ├── src/
│   ├── package.json
│   └── USED_TECHNOLOGIES.md
├── README.md
├── UPDATE.md
```

---

## Important Notes
- **User Isolation:** Each user can only see and manage their own products.
- **Admin Access:** Only users with the admin role can access the admin panel.
- **Security:** Passwords are hashed with bcrypt. JWT is used for all authentication.
- **AI Model:** Uses OpenAI CLIP for image categorization (runs locally, no external API calls).

---

## Documentation
- See `USED_TECHNOLOGIES.md` in each folder for detailed technology usage.
- See `UPDATE.md` for a list of all features added after the initial project setup.

---

## License
MIT

## Contact

GitHub: [SelSefa](https://github.com/SelSefa) 