# merge_visuals.py
# Seamlessly restores the FeralUI Pastel Atmosphere, Radial Gradient Mesh, SVG Grain Overlay,
# and UIverse Speeder Loading Animation directly from the deployed Firebase version.

with open(r'B:\projects\ACC\firebase_live.html', 'r', encoding='utf-8') as f:
    fb = f.read()

with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    current = f.read()

print("Analyzing firebase_live.html and index.html...")
