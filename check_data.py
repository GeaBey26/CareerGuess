
import os

def check_brackets(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    brackets = {'(': ')', '[': ']', '{': '}'}
    line = 1
    col = 1
    for i, char in enumerate(content):
        if char == '\n':
            line += 1
            col = 1
        else:
            col += 1
            
        if char in brackets.keys():
            stack.append((char, line, col))
        elif char in brackets.values():
            if not stack:
                print(f"Extra closing bracket '{char}' at line {line}, col {col}")
                return False
            top, t_line, t_col = stack.pop()
            if brackets[top] != char:
                print(f"Mismatched bracket '{char}' at line {line}, col {col}. Expected closing for '{top}' from line {t_line}")
                return False
                
    if stack:
        for char, l, c in stack:
            print(f"Unclosed bracket '{char}' from line {l}, col {c}")
        return False
    
    print("Brackets are balanced!")
    return True

check_brackets('data.js')
