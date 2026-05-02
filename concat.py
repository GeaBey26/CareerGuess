import os

parts = ['script_part1.js', 'script_part2.js', 'script_part3.js']
final_path = r'c:\Users\Monster\OneDrive\Masaüstü\Antrigravitiy WS\script.js'

with open(final_path, 'wb') as outfile:
    for part in parts:
        with open(part, 'rb') as infile:
            outfile.write(infile.read())
            outfile.write(b'\n')

print("Successfully concatenated files with binary safety.")
