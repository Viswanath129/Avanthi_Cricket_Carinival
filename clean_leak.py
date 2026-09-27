# clean_leak.py
for fname in ['index.html', 'Acc-Auction-Os.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove any stray python print or quotes
    idx1 = content.find("id=\"toastContainer\"></div>")
    idx2 = content.find("<!-- JAVASCRIPT LOGIC ENGINE -->")
    if idx1 != -1 and idx2 != -1 and idx2 > idx1:
        between = content[idx1 + len("id=\"toastContainer\"></div>"):idx2]
        content = content[:idx1 + len("id=\"toastContainer\"></div>")] + "\n\n  " + content[idx2:]
        print(f"Cleaned between idx1 and idx2 in {fname}")

    with open(fname, 'w', encoding='utf-8') as f:
        f.write(content)

print("All stray leaks removed!")
