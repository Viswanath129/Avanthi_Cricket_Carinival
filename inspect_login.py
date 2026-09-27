with open(r"B:\projects\ACC\index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if "function handleLoginSubmit" in l:
        print(f"handleLoginSubmit at line {i+1}")
        for j in range(i, min(len(lines), i+150)):
            print(f"{j+1}: {lines[j]}", end="")
        break
