# extract_and_write.py
import re

with open(r'B:\projects\ACC\generate_acc_2026.py', 'r', encoding='utf-8') as f:
    text = f.read()

# The HTML begins with <!DOCTYPE html>
start_idx = text.find('<!DOCTYPE html>')
if start_idx == -1:
    print("Error: <!DOCTYPE html> not found!")
    exit(1)

html_content = text[start_idx:]
# Clean up any trailing python string closing quotes if present
if html_content.endswith("'''\n") or html_content.endswith("'''"):
    html_content = html_content.rstrip("'\n")

# Write to Acc-Auction-Os.html and index.html
with open(r'B:\projects\ACC\Acc-Auction-Os.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

with open(r'B:\projects\ACC\index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Generated Acc-Auction-Os.html and index.html successfully!")
print("HTML Size:", len(html_content), "bytes.")
