"""
fix_encoding_final.py
Fixes UTF-8 mojibake in CareerGuess data files.
The corruption pattern: UTF-8 bytes were read/saved as if they were Latin-1,
so each multi-byte sequence appears as multiple garbage Latin-1 characters.
Fix: read raw bytes, decode as utf-8 (already correct bytes on disk),
then rewrite. If already broken, we need to encode as latin-1 first, then decode as utf-8.
"""

import os
import sys

BASE = r"c:\Users\Monster\OneDrive\Masaüstü\Antrigravitiy WS"

FILES_TO_FIX = [
    "data.js",
    "basketballData.js",
    "cricketData.js",
    "esportsData.js",
    "nflData.js",
    "nhlData.js",
    "tennisData.js",
    "volleyballData.js",
    "f1Data.js",  # check if needed
]

def fix_mojibake(text):
    """
    Attempt to fix mojibake: text was originally UTF-8, but encoded/stored
    as if it were Latin-1. So we encode back to latin-1 bytes, then decode as utf-8.
    """
    try:
        # Encode as latin-1 to recover the raw bytes, then decode as utf-8
        fixed = text.encode('latin-1').decode('utf-8')
        return fixed
    except (UnicodeDecodeError, UnicodeEncodeError):
        return text  # Return as-is if it can't be fixed

def needs_fix(text):
    """Check if the text contains common mojibake patterns from flag emojis."""
    # These are characteristic mojibake sequences for flag emojis
    return 'ğŸ' in text or 'Ä°' in text or 'Ã§' in text or 'ğ' in text

fixed_count = 0
skipped_count = 0
error_count = 0

for filename in FILES_TO_FIX:
    filepath = os.path.join(BASE, filename)
    
    if not os.path.exists(filepath):
        print(f"  SKIP (not found): {filename}")
        skipped_count += 1
        continue
    
    try:
        # Read raw bytes
        with open(filepath, 'rb') as f:
            raw_bytes = f.read()
        
        # Try to decode as utf-8 first (to see actual content)
        try:
            text_as_utf8 = raw_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # File is not valid utf-8, try latin-1
            text_as_utf8 = raw_bytes.decode('latin-1')
        
        if not needs_fix(text_as_utf8):
            print(f"  OK (no fix needed): {filename}")
            skipped_count += 1
            continue
        
        # Apply the mojibake fix
        fixed_text = fix_mojibake(text_as_utf8)
        
        if fixed_text == text_as_utf8:
            print(f"  WARN (fix had no effect): {filename}")
            skipped_count += 1
            continue
        
        # Write back as UTF-8 without BOM
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(fixed_text)
        
        print(f"  FIXED: {filename}")
        fixed_count += 1
        
    except Exception as e:
        print(f"  ERROR: {filename} -> {e}")
        error_count += 1

print(f"\n--- DONE ---")
print(f"Fixed:   {fixed_count}")
print(f"Skipped: {skipped_count}")
print(f"Errors:  {error_count}")

# Quick verification: show first 3 flag entries in data.js
verify_path = os.path.join(BASE, "data.js")
if os.path.exists(verify_path):
    with open(verify_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    print("\n--- Verification (first 5 player lines from data.js) ---")
    count = 0
    for line in lines:
        if 'flag:' in line and count < 5:
            print(line.rstrip())
            count += 1
