# build_acc_os.py - Master Compiler for ACC Auction Portal 2026
import os

with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    master_html = f.read()

with open(r'B:\projects\ACC\Acc-Auction-Os.html', 'w', encoding='utf-8') as f:
    f.write(master_html)

print(f"Generated Acc-Auction-Os.html and index.html successfully ({len(master_html)} bytes).")
