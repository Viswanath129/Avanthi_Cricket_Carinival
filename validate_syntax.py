# validate_syntax.py
import subprocess
from bs4 import BeautifulSoup

with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

scripts = soup.find_all('script')
print(f"Found {len(scripts)} script tags.")

for i, s in enumerate(scripts):
    if s.string:
        with open(f"temp_script_{i}.js", "w", encoding="utf-8") as out:
            out.write(s.string)
        res = subprocess.run(["node", "--check", f"temp_script_{i}.js"], capture_output=True, text=True)
        if res.returncode == 0:
            print(f"Script {i}: Valid JavaScript syntax!")
        else:
            print(f"Script {i} Error:\n", res.stderr)
