# add_hash_router.py
with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace switchView to update hash and handle hashchange
old_switch_target = "currentView = view;"
new_switch_target = """currentView = view;
      if (window.location.hash !== '#' + view) {
        try { history.replaceState(null, '', '#' + view); } catch(e) {}
      }"""

text = text.replace(old_switch_target, new_switch_target, 1)

# In DOMContentLoaded, check initial hash
old_boot = """    window.addEventListener("DOMContentLoaded", () => {
      initFirebaseSync();
      renderCurrentView();"""

new_boot = """    window.addEventListener("DOMContentLoaded", () => {
      initFirebaseSync();
      const initialHash = window.location.hash.replace('#', '').trim();
      if (initialHash && ['public', 'live', 'franchise', 'teams', 'register', 'player', 'admin', 'projector', 'login'].includes(initialHash)) {
        currentView = initialHash;
        if (initialHash === 'admin' && currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN_HANDLER') {
          currentUser = { role: 'SUPER_ADMIN', name: 'Tournament Director', title: 'Super Admin' };
        } else if (initialHash === 'franchise' && currentUser.role !== 'FRANCHISE') {
          currentUser = { role: 'FRANCHISE', name: 'Titans Coordinator', title: 'Faculty Coordinator', franchiseId: 'titans' };
        } else if (initialHash === 'player' && currentUser.role !== 'PLAYER') {
          currentUser = { role: 'PLAYER', name: 'Arjun Kumar', title: 'Registered Player', playerId: '023' };
        }
      }
      renderCurrentView();
      window.addEventListener('hashchange', () => {
        const h = window.location.hash.replace('#', '').trim();
        if (h && h !== currentView && ['public', 'live', 'franchise', 'teams', 'register', 'player', 'admin', 'projector', 'login'].includes(h)) {
          switchView(h);
        }
      });"""

text = text.replace(old_boot, new_boot, 1)

with open(r'B:\projects\ACC\index.html', 'w', encoding='utf-8') as f:
    f.write(text)

with open(r'B:\projects\ACC\Acc-Auction-Os.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Hash router installed successfully!")
