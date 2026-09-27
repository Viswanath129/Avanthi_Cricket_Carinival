# append_firebase_and_boot.py
with open(r'B:\projects\ACC\generate_acc_2026.py', 'a', encoding='utf-8') as f:
    f.write(r'''
    // ========================================================
    // 14. REAL-TIME CLOUD SYNCHRONIZATION (FIRESTORE)
    // ========================================================
    const DEFAULT_FIREBASE_CONFIG = {
      projectId: "studio-6471864054-30ce7",
      appId: "1:830366253821:web:74186cd15282b396053494",
      authDomain: "studio-6471864054-30ce7.firebaseapp.com"
    };
    let currentRoomId = "acc-main-2026";
    let isCloudSynced = true;

    function broadcastAuctionState() {
      // Broadcast state to local window & listeners
      const payload = {
        lotIndex,
        currentPrice,
        leadingBidderId,
        timerSeconds,
        auctionState,
        passedFranchises: Array.from(passedFranchises),
        franchises,
        salesHistory,
        bidHistory,
        auditLog,
        activeBucketIndex,
        drawMode,
        auctionRound,
        timestamp: Date.now()
      };

      try {
        localStorage.setItem(`acc_state_${currentRoomId}`, JSON.stringify(payload));
      } catch (e) {}

      // If online, sync to Firestore
      if (window.db && window.doc && window.setDoc) {
        try {
          const roomRef = window.doc(window.db, "acc_auctions", currentRoomId);
          window.setDoc(roomRef, payload, { merge: true }).catch(err => console.log("Cloud sync note:", err));
        } catch (err) {}
      }
    }

    function initFirebaseSync() {
      try {
        window.addEventListener("storage", (e) => {
          if (e.key === `acc_state_${currentRoomId}` && e.newValue) {
            try {
              const incoming = JSON.parse(e.newValue);
              lotIndex = incoming.lotIndex ?? lotIndex;
              currentPrice = incoming.currentPrice ?? currentPrice;
              leadingBidderId = incoming.leadingBidderId ?? leadingBidderId;
              timerSeconds = incoming.timerSeconds ?? timerSeconds;
              auctionState = incoming.auctionState ?? auctionState;
              if (incoming.franchises) franchises = incoming.franchises;
              if (incoming.salesHistory) salesHistory = incoming.salesHistory;
              if (incoming.bidHistory) bidHistory = incoming.bidHistory;
              if (incoming.auditLog) auditLog = incoming.auditLog;
              renderCurrentView();
            } catch (err) {}
          }
        });
      } catch (e) {}
    }

    // ========================================================
    // 15. INITIALIZATION ON PAGE BOOT
    // ========================================================
    window.addEventListener("DOMContentLoaded", () => {
      initFirebaseSync();
      renderCurrentView();
      startTimer();
      setTimeout(() => {
        const overlay = document.getElementById("speederOverlay");
        if (overlay) overlay.classList.add("hidden");
      }, 500);
    });
  </script>
</body>
</html>
''')
    print("Firebase sync and boot logic appended.")
