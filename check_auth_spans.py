with open(r"B:\projects\ACC\index.html", "r", encoding="utf-8") as f:
    text = f.read()

s_login = text.find("function handleLoginSubmit")
e_login = text.find("function logoutUser", s_login)
print("handleLoginSubmit span:", s_login, e_login)

s_pres = text.find("registerPresenceRecord() {")
e_pres = text.find("switchPresenceIdentity(", s_pres)
print("registerPresenceRecord span:", s_pres, e_pres)
