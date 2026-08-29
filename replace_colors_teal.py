import os

files = [
    'frontend/src/app/page.tsx',
    'frontend/src/app/dashboard/page.tsx'
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace Tailwind orange with teal
    content = content.replace('orange-', 'teal-')
    
    # Update the specific rgba shadow to teal
    content = content.replace('rgba(249,115,22,0.6)', 'rgba(20,184,166,0.6)')
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Colors updated to teal!")
