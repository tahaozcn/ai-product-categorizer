# AI Product Categorizer

AI Product Categorizer is a web application that automatically categorizes product photos using artificial intelligence.

## Features

- Product photo upload and preview
- AI-powered automatic category prediction
- Mobile and desktop view support
- Real-time category selection and approval
- Product deletion and editing features

## Technologies

### Backend
- Python 3.x
- Flask
- SQLite
- TensorFlow/Keras

### Frontend
- React
- Chakra UI
- Axios

## Installation

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
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

## License

MIT

## Contact

GitHub: [SelSefa](https://github.com/SelSefa) 