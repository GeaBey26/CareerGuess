import os

mapping = {
    'Ã„Â°': 'İ',
    'Ã…Âž': 'Ş',
    'ÃƒÅ“': 'Ü',
    'Ãƒâ€“': 'Ö',
    'Ãƒâ€¡': 'Ç',
    'Ã„Å¸': 'ğ',
    'Ã…Å¸': 'ş',
    'ÃƒÂ¼': 'ü',
    'ÃƒÂ¶': 'ö',
    'ÃƒÂ§': 'ç',
    'Ã„Â±': 'ı',
    'Åž': 'Ş',
    'ÅŸ': 'ş',
    'ÄŸ': 'ğ',
    'Äž': 'Ğ',
    'Ä°': 'İ',
    'Ä±': 'ı',
    'Ã§': 'ç',
    'Ã‡': 'Ç',
    'Ã¶': 'ö',
    'Ã–': 'Ö',
    'Ã¼': 'ü',
    'Ãœ': 'Ü',
    'ğŸ': '??', # Placeholder for flags
    'Ã¢â€ Â': '←'
}

# Add common word-specific fixes just in case
word_fixes = {
    'ampiyonluYu': 'Şampiyonluğu',
    'ampiyonluu': 'Şampiyonluğu',
    'ampiyonlu': 'Şampiyonlu',
    'BaYar': 'Başarı',
    'DǬnya': 'Dünya',
    'Tenisi': 'Tenisçi'
}

js_files = [f for f in os.listdir('.') if f.endswith('.js') and f != 'firebase-config.js']

for file_name in js_files:
    print(f"Fixing {file_name}...")
    try:
        with open(file_name, 'rb') as f:
            content_bytes = f.read()
        
        # Try to decode as utf-8
        content = content_bytes.decode('utf-8', errors='replace')
        
        # Apply character mapping
        for mangled, correct in mapping.items():
            content = content.replace(mangled, correct)
            
        # Apply word mapping
        for mangled, correct in word_fixes.items():
            content = content.replace(mangled, correct)
            
        with open(file_name, 'w', encoding='utf-8') as f:
            f.write(content)
            
    except Exception as e:
        print(f"Error fixing {file_name}: {e}")

print("All files processed.")
