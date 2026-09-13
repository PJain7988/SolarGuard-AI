import os
import glob

FRONTEND_SRC = r"d:\AI_ML_Project\Solar_Panel_Detect\frontend\src"
OLD_URL = "http://localhost:8000"
NEW_URL = "https://solarguard-ai-7gw9.onrender.com"

# Find all jsx and js files
files = glob.glob(os.path.join(FRONTEND_SRC, "**", "*.jsx"), recursive=True)
files.extend(glob.glob(os.path.join(FRONTEND_SRC, "**", "*.js"), recursive=True))

count = 0
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if OLD_URL in content:
        new_content = content.replace(OLD_URL, NEW_URL)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
        count += 1

print(f"Successfully updated {count} files.")
