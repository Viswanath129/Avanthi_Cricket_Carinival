with open(r"B:\projects\ACC\index.html", "r", encoding="utf-8") as f:
    text = f.read()

s_pres = text.find("registerPresenceRecord() {")
e_pres = text.find("switchPresenceIdentity(", s_pres)
print(text[s_pres:e_pres])
