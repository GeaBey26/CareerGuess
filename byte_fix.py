import os

replacements = [
    (b'Tenis??i', 'Tenisçi'.encode('utf-8')),
    (b'Ba??ar??', 'Başarı'.encode('utf-8')),
    (b'S??rbistan', 'Sırbistan'.encode('utf-8')),
    (b'??spanya', 'İspanya'.encode('utf-8')),
    (b'??svi??re', 'İsviçre'.encode('utf-8')),
    (b'??talya', 'İtalya'.encode('utf-8')),
    (b'D??nya', 'Dünya'.encode('utf-8')),
    (b'??im', 'Çim'.encode('utf-8')),
    (b'??ampiyonlu??u', 'Şampiyonluğu'.encode('utf-8')),
    (b'??ampiyonu', 'Şampiyonu'.encode('utf-8')),
    (b'??lk', 'İlk'.encode('utf-8')),
    (b'??st', 'Üst'.encode('utf-8')),
    (b'Kar????lar', 'Karşılar'.encode('utf-8')),
    (b'Ya????nda', 'Yaşında'.encode('utf-8')),
    (b'??rkiye', 'Türkiye'.encode('utf-8')),
]

js_files = [f for f in os.listdir('.') if f.endswith('.js') and f != 'firebase-config.js']

for file_name in js_files:
    print(f"Byte-fixing {file_name}...")
    with open(file_name, 'rb') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(file_name, 'wb') as f:
        f.write(content)

print("Byte-level restoration completed.")
