# AI Product Categorizer

AI Product Categorizer, ürün fotoğraflarını yapay zeka kullanarak otomatik olarak kategorilendiren bir web uygulamasıdır.

## Özellikler

- Ürün fotoğrafı yükleme ve önizleme
- Yapay zeka ile otomatik kategori tahmini
- Mobil ve masaüstü görünüm desteği
- Gerçek zamanlı kategori seçimi ve onaylama
- Ürün silme ve düzenleme özellikleri

## Teknolojiler

### Backend
- Python 3.x
- Flask
- SQLite
- TensorFlow/Keras

### Frontend
- React
- Chakra UI
- Axios

## Kurulum

### Backend Kurulumu

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend Kurulumu

```bash
cd frontend
npm install
npm start
```

## Kullanım

1. Frontend uygulaması varsayılan olarak http://localhost:4001 adresinde çalışır
2. Backend API http://localhost:8000 adresinde çalışır
3. Ürün fotoğrafı yüklemek için "Fotoğraf Yükle" butonunu kullanın
4. Yapay zeka modeli fotoğrafı analiz edip kategori önerileri sunacaktır
5. İstediğiniz kategoriyi seçip onaylayabilirsiniz

## Lisans

MIT

## İletişim

GitHub: [Kullanıcı Adınız] 