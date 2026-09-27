with open("B:/projects/ACC/index.html", "r", encoding="utf-8") as f:
    content = f.read()

# For franchise password checking
content = content.replace(
    'if (secret !== user.passwordHash) {',
    '''const f = franchises.find(item => item.id === fId);
        const expectedFranchisePass = f ? generateFranchiseInitialPassword(f.name, f.id) : '';
        if (secret !== user.passwordHash && secret !== expectedFranchisePass) {'''
)

# For player password checking
content = content.replace(
    'if (secret !== user.passwordHash && secret !== "Player@2026") {',
    '''const expectedPlayerPass = generatePlayerInitialPassword(user.name);
        if (secret !== user.passwordHash && secret !== "Player@2026" && secret !== expectedPlayerPass) {'''
)

with open("B:/projects/ACC/index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated login submit password check for franchise and player!")
