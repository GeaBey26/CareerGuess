import os

path = r'c:\Users\Monster\OneDrive\Masaüstü\Antrigravitiy WS\script.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """document.querySelectorAll('.card, .game-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.background = `
      radial-gradient(circle at ${x}px ${y}px, rgba(59,130,246,0.15), transparent 40%)
    `;
  });

  card.addEventListener('mouseleave', () => {
    card.style.background = 'rgba(255,255,255,0.03)';
  });
});"""

new_code = """document.querySelectorAll('.card, .game-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
});"""

# Normalize line endings for replacement
content = content.replace('\r\n', '\n')
old_code = old_code.replace('\r\n', '\n')
new_code = new_code.replace('\r\n', '\n')

if old_code in content:
    new_content = content.replace(old_code, new_code)
    with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(new_content)
    print("Successfully updated script.js")
else:
    print("Target code not found in script.js")
    # Let's try a less strict match
    import re
    pattern = re.escape(old_code).replace(r'\ ', r'\s+').replace(r'\n', r'\s+')
    if re.search(pattern, content):
        new_content = re.sub(pattern, new_code, content)
        with open(path, 'w', encoding='utf-8', newline='\r\n') as f:
            f.write(new_content)
        print("Successfully updated script.js using regex")
    else:
        print("Target code still not found")
