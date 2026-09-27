# patch_full_admin_system.py
import re

with open(r'B:\projects\ACC\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Let's inspect submitPlayerRegistration
old_submit_reg_idx = html.find('function submitPlayerRegistration() {')
end_submit_reg_idx = html.find('// ========================================================\n    // 8. CSV EXPORT & ROLE SWITCHER', old_submit_reg_idx)
if end_submit_reg_idx == -1:
    end_submit_reg_idx = html.find('function exportSquadsCSV', old_submit_reg_idx)

new_submit_reg = '''function submitPlayerRegistration() {
      if (!regFormData.name || !regFormData.roll) {
        showToast("Please provide name and roll number in Section 1", "error");
        return;
      }
      const derived = derivePlayerType(regFormData);
      const isDiscrepancy = !!regFormData.yearDiscrepancy;
      const newPlayer = {
        id: players.length + 1,
        name: regFormData.name,
        roll: regFormData.roll,
        program: regFormData.program,
        branch: regFormData.branch,
        year: String(regFormData.year),
        bucket: regFormData.bucket,
        derivedType: derived,
        battingStyle: regFormData.battingStyle || "Right Hand",
        battingPosition: regFormData.battingPosition || "Top Order (1-3)",
        bowlingArm: regFormData.bowlingArm || "Right Arm",
        bowlingType: regFormData.bowlingType || "None",
        bowlingRole: regFormData.bowlingRole || "None",
        basePrice: Number(regFormData.basePrice) || 80,
        status: isDiscrepancy ? "PENDING_REVIEW" : "AVAILABLE",
        discrepancy: isDiscrepancy,
        discrepancyNote: isDiscrepancy ? "Student flagged year discrepancy during registration" : "",
        cricHeroesUrl: regFormData.cricHeroesUrl || "",
        cricHeroesMobile: regFormData.cricHeroesMobile || "",
        cricHeroesStatus: regFormData.cricHeroesStatus || "PROFILE AVAILABLE",
        paymentStatus: "PAID",
        photo: regFormData.photo || "",
        bio: `Registered player from ${regFormData.branch}, Year ${regFormData.year}.`
      };
      players.push(newPlayer);

      auditLog.unshift({
        time: new Date().toLocaleTimeString(),
        action: "PLAYER REGISTERED",
        details: `${newPlayer.name} (${newPlayer.roll}, ${newPlayer.bucket}, Base: ${newPlayer.basePrice}C) registered. Status: ${newPlayer.status}`,
        actorRole: "PLAYER",
        actorUid: "reg_" + newPlayer.id
      });

      saveDatabase();
      broadcastAuthoritativeState();

      if (isDiscrepancy) {
        showToast("Registration submitted with Year Discrepancy flag. Forwarded to Super Admin Review Queue.", "warning");
      } else {
        showToast("Registration completed! Official Player Auction Pass generated.", "success");
      }

      showSpeeder("REGISTRATION COMPLETE", `${newPlayer.name} enrolled into ACC 2026 (#${newPlayer.id})`, 1000);
      setTimeout(() => {
        switchView("player");
        openPlayerPassModal(newPlayer.id);
      }, 700);
    }'''

if old_submit_reg_idx != -1 and end_submit_reg_idx != -1:
    html = html[:old_submit_reg_idx] + new_submit_reg + '\n\n    ' + html[end_submit_reg_idx:]
    print("Updated submitPlayerRegistration with full audit and discrepancy queue support!")

# Write updated HTML
with open(r'B:\projects\ACC\index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print(f"Updated index.html length: {len(html)}")
