# -*- coding: utf-8 -*-
# assemble_master.py

import os
from build_part1_core import PART1_CORE
from build_part2_views import PART2_VIEWS
from build_part3_views import PART3_VIEWS
from build_part4_engine import PART4_ENGINE

INDEX_PATH = r"B:\projects\ACC\index.html"
BACKUP_PATH = r"B:\projects\ACC\Acc-Auction-Os.html"

print("Assembling master ACC Player Auction Portal...")

# Combine the parts:
# PART1_CORE ends right before the <script> block and views.
# PART4_ENGINE starts with <script> and data, but views must be inside the <script> block.
# Let's inspect where PART4_ENGINE starts and where views belong.
# In PART4_ENGINE, we have <script> at the top.
# Let's place PART2_VIEWS and PART3_VIEWS right after section 5 in PART4_ENGINE or before renderCurrentView.

# Let's inspect PART4_ENGINE structure:
# It starts with:
#   <!-- JAVASCRIPT CORE ENGINE & LOGIC -->
#   <script>
#   ... Section 1 to 5 ...
# Then views can be injected right before section 9 (Routing & View Dispatcher).

split_marker = "// ========================================================\n    // 9. ROUTING, STRICT GUARDS & DISPATCHER"
if split_marker in PART4_ENGINE:
    p4_top, p4_bottom = PART4_ENGINE.split(split_marker, 1)
    full_html = PART1_CORE + p4_top + "\n" + PART2_VIEWS + "\n" + PART3_VIEWS + "\n    " + split_marker + p4_bottom
else:
    # Fallback injection right before </script>
    p4_top, p4_bottom = PART4_ENGINE.split("</script>", 1)
    full_html = PART1_CORE + p4_top + "\n" + PART2_VIEWS + "\n" + PART3_VIEWS + "\n  </script>" + p4_bottom

with open(INDEX_PATH, "w", encoding="utf-8") as f:
    f.write(full_html)

with open(BACKUP_PATH, "w", encoding="utf-8") as f:
    f.write(full_html)

print(f"Assembly complete! Written {len(full_html)} bytes to index.html and Acc-Auction-Os.html")
