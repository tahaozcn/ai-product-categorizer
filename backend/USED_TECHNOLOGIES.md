# Projede Kullanılan Temel Teknolojiler ve Bağımlılıklar

Aşağıda, bu projede kullanılan ana teknolojiler ve bağımlılıkların kısa açıklamaları yer almaktadır. Her birinin ne amaçla kullanıldığı da belirtilmiştir.

---

## Backend (Python)

- **Flask**
  - Web sunucusu ve REST API oluşturmak için ana framework.
- **Flask-CORS**
  - Frontend ile backend arasında güvenli cross-origin (CORS) iletişimi sağlamak için.
- **gunicorn**
  - Üretim ortamında Flask uygulamasını çalıştırmak için kullanılan WSGI HTTP sunucusu.
- **Pillow**
  - Yüklenen ürün görsellerini işlemek ve analiz etmek için kullanılan Python görüntü işleme kütüphanesi.
- **torch (PyTorch)**
  - Derin öğrenme modellerini (özellikle CLIP) çalıştırmak için kullanılan ana makine öğrenmesi framework'ü.
- **torchvision**
  - Görüntü işleme ve PyTorch ile entegrasyon için ek araçlar sağlar.
- **transformers**
  - OpenAI CLIP gibi modern derin öğrenme modellerini yüklemek ve kullanmak için.
- **numpy**
  - Sayısal işlemler ve tensör hesaplamaları için (PyTorch ve transformers gibi ML kütüphanelerinin temel bağımlılığıdır).
- **clip (openai/CLIP)**
  - Görsel ve metin tabanlı ürün kategorilendirme için kullanılan OpenAI CLIP modeli.

---

## Notlar
- **sqlite3**: Ürün verilerini saklamak için kullanılan gömülü veritabanı (Python'un standart kütüphanesi, ek kurulum gerektirmez).
- **Diğer bağımlılıklar** (ör. requests, openai, python-dotenv, psycopg2-binary, python-multipart) kodda veya modelde doğrudan kullanılmamaktadır ve temizlik sırasında kaldırılacaktır.

---

Bu dosya, projenin teknik sunumlarında ve dokümantasyonunda referans olarak kullanılabilir. 