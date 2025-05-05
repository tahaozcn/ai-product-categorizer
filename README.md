# AI Product Categorizer

AI Product Categorizer is a web application that automatically categorizes product photos using artificial intelligence.

## Features

- Product photo upload and preview
- AI-powered automatic category prediction (OpenAI CLIP model)
- Mobile and desktop view support
- Real-time category selection and approval
- Product deletion and editing features

## Technologies

### Backend
- Python 3.x
- Flask
- Flask-CORS
- SQLite (built-in)
- PyTorch (torch, torchvision)
- transformers (HuggingFace)
- OpenAI CLIP (clip)
- Pillow

### Frontend
- React
- Chakra UI
- Axios
- React Icons

## Installation

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 app.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Usage

1. Frontend application runs on http://localhost:4001 by default
2. Backend API runs on http://localhost:8000
3. Use the "Upload Photo" button to upload product photos
4. The AI model will analyze the photo and provide category suggestions
5. You can select and approve your desired category

## Test & Documentation
- Kapsamlı kod temizliği ve test süreci için: `TEST_1.md`
- Kullanılan teknolojilerin açıklamaları için: `backend/USED_TECHNOLOGIES.md`, `frontend/USED_TECHNOLOGIES.md`
- CORS ve güvenlik ayarları test edilmiştir.
- ESLint/linter uyarıları giderilmiştir.

## License

MIT

## Contact

GitHub: [SelSefa](https://github.com/SelSefa) 