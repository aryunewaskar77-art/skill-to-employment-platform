import os
import re

files = [
    'frontend/src/app/page.tsx',
    'frontend/src/app/dashboard/page.tsx'
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace Tailwind blue with orange (Saffron)
    content = content.replace('blue-', 'orange-')
    
    # Update the specific rgba shadow on the homepage to an orange tint
    content = content.replace('rgba(59,130,246,0.6)', 'rgba(249,115,22,0.6)')
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Colors updated!")
