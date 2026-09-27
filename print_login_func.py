with open(r"B:\projects\ACC\index.html", "r", encoding="utf-8") as f:
    text = f.read()

s_login = text.find("function handleLoginSubmit")
e_login = text.find("function logoutUser", s_login)
print(text[s_login:e_login])
