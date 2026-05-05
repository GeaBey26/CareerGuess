import os
import re

def fix_content(content):
    # Common replacements for corrupted Turkish characters
    replacements = {
        r'in': 'Çin',
        r'in"': 'Çin"',
        r'nationality: "in"': 'nationality: "Çin"',
        r'G\?ney Kore': 'Güney Kore',
        r'Gney Kore': 'Güney Kore',
        r'Isve\?': 'İsveç',
        r'Isve': 'İsveç',
        r'Bel\?ika': 'Belçika',
        r'Belika': 'Belçika',
        r'Srbistan': 'Sırbistan',
        r'S\?rbistan': 'Sırbistan',
        r'ngiltere': 'İngiltere',
        r'ngiltere"': 'İngiltere"',
        r'İtalya"': 'İtalya"',
        r'İspanya"': 'İspanya"',
        r'zve': 'İsveç',
        r'Grcistan': 'Gürcistan',
        r'Brezilya"': 'Brezilya"',
        r'Fransa"': 'Fransa"',
        r'Almanya"': 'Almanya"',
        r'Gms': 'Gümüş',
        r'eyrek': 'Çeyrek',
        r'Altini': 'Altını'
    }
    
    for old, new in replacements.items():
        content = re.sub(old, new, content)
    return content

files = [f for f in os.listdir('.') if f.endswith('.js')]
for f in files:
    try:
        # Try reading with different encodings to catch the corrupted bytes
        for encoding in ['utf-8', 'latin-1', 'cp1254']:
            try:
                with open(f, 'r', encoding=encoding) as file:
                    content = file.read()
                break
            except:
                continue
        
        fixed = fix_content(content)
        
        # Save as UTF-8 (No BOM)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(fixed)
        print(f"Fixed encoding for {f}")
    except Exception as e:
        print(f"Error fixing {f}: {e}")
