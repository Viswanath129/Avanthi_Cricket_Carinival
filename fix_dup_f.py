with open("B:/projects/ACC/index.html", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '''const f = franchises.find(item => item.id === fId);
        const expectedFranchisePass = f ? generateFranchiseInitialPassword(f.name, f.id) : '';''',
    '''const targetFranchise = franchises.find(item => item.id === fId);
        const expectedFranchisePass = targetFranchise ? generateFranchiseInitialPassword(targetFranchise.name, targetFranchise.id) : '';'''
)

with open("B:/projects/ACC/index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed duplicate f declaration")
