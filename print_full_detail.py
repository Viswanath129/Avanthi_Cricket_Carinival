with open(r"B:\projects\ACC\index.html", "r", encoding="utf-8") as f:
    text = f.read()

idx = text.find("function openPlayerDetailModal(")
end_idx = text.find("function", idx + 20)
print(text[idx:end_idx])
