with open("B:/projects/ACC/index.html", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace(
    'if (typeof document !== "undefined") {\n        document.addEventListener("click"',
    'if (typeof document !== "undefined" && typeof document.addEventListener === "function") {\n        document.addEventListener("click"'
)

with open("B:/projects/ACC/index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated document.addEventListener guard in index.html")
