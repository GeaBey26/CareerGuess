import re
import os

def count_players(filename):
    if not os.path.exists(filename):
        print(f"File not found: {filename}")
        return

    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    difficulties = ['easy', 'medium', 'hard']
    counts = {d: 0 for d in difficulties}
    
    for d in difficulties:
        pattern = f'difficulty:\s*["\']{d}["\']'
        matches = re.findall(pattern, content)
        counts[d] = len(matches)
    
    # Check for Turkish flag 🇹🇷
    tr_count = content.count('🇹🇷')
    tr_lig_mentions = len(re.findall(r'Süper Lig|Fenerbahçe|Galatasaray|Beşiktaş|Trabzonspor|Halkbank|Vakıfbank|Eczacıbaşı', content, re.I))

    print(f"File: {filename}")
    for d, count in counts.items():
        print(f"  {d.capitalize()}: {count}")
    print(f"  Turkish Flags (🇹🇷): {tr_count}")
    print(f"  TR Team/League Mentions: {tr_lig_mentions}")
    print("-" * 30)

data_files = [
    'data.js', 
    'basketballData.js', 
    'volleyballData.js', 
    'tennisData.js', 
    'esportsData.js'
]

for f in data_files:
    count_players(f)
