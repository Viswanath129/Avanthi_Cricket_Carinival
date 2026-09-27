index_path = r"B:\projects\ACC\index.html"
backup_os_path = r"B:\projects\ACC\Acc-Auction-Os.html"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

target = '    let regBowling = "yes";'
replacement = '    let regBowling = "yes";\n    let playerJerseyName = "A. KUMAR";\n    let playerJerseySize = "L";'

if target in content:
    content = content.replace(target, replacement)
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(content)
    with open(backup_os_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Added playerJerseyName and playerJerseySize successfully!")
else:
    print("Target regBowling declaration not found!")
