import re

# Read missing block from generate_acc_2026.py
with open(r'B:\projects\ACC\generate_acc_2026.py', 'r', encoding='utf-8') as f:
    gen_lines = f.readlines()

missing_block = "".join(gen_lines[2115:2784])

# Read index.html
with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

target = "    // ========================================================\n    // 14. REAL-TIME CLOUD SYNCHRONIZATION (FIRESTORE)"

if target in index_content:
    new_index_content = index_content.replace(target, missing_block + "\n" + target)
    with open(r'B:\projects\ACC\index.html', 'w', encoding='utf-8') as f:
        f.write(new_index_content)
    with open(r'B:\projects\ACC\Acc-Auction-Os.html', 'w', encoding='utf-8') as f:
        f.write(new_index_content)
    print("Successfully inserted missing views into index.html and Acc-Auction-Os.html!")
else:
    print("Target section 14 header not found in index.html!")
