with open("B:/projects/ACC/index.html", "r", encoding="utf-8") as f:
    content = f.read()

print("Original length:", len(content))

# 1. Add GSAP script tag if not present
gsap_tag = '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>'
if "gsap.min.js" not in content:
    auth_script_marker = '<script src="https://www.gstatic.com/firebasejs/10.13.2/firebase-auth-compat.js"></script>'
    if auth_script_marker in content:
        content = content.replace(auth_script_marker, auth_script_marker + "\n  " + gsap_tag)
        print("Added GSAP CDN script tag")
    else:
        print("Could not find auth_script_marker")

# 2. Add Originkit Click Effects code
click_effects_code = """
    // ========================================================
    // CLICK EFFECTS — ORIGINKIT (SNIPER, RINGS, BURST, PARTICLES, CROSSHAIR, WAVY)
    // ========================================================
    (function initOriginKitClickEffects() {
      const config = {
        color: "#06d6a0", // ACC Emerald Green accent (or dynamic brand color)
        interactionMode: "sniper", // "rings" | "burst" | "particles" | "crosshair" | "wavy" | "sniper"
        duration: 0.35,
        strokeWidth: 2,
        effectSize: 90,
        rotation: 0
      };

      window.OriginKitClickEffects = {
        setMode: function(mode) { if (mode) config.interactionMode = mode; },
        setColor: function(color) { if (color) config.color = color; },
        getConfig: function() { return config; }
      };

      function getClickContainer() {
        let container = document.getElementById("originkit-mouse-effects-layer");
        if (!container && typeof document !== "undefined" && document.body) {
          container = document.createElement("div");
          container.id = "originkit-mouse-effects-layer";
          container.style.cssText = "position: fixed; inset: 0; pointer-events: none; z-index: 999999; overflow: visible;";
          document.body.appendChild(container);
        }
        return container;
      }

      if (typeof document !== "undefined") {
        document.addEventListener("click", function(e) {
          const container = getClickContainer();
          if (!container) return;

          const x = e.clientX;
          const y = e.clientY;
          const { color, interactionMode, duration, strokeWidth, effectSize, rotation } = config;

          const svgStyle = `position: absolute; left: ${x - effectSize / 2}px; top: ${y - effectSize / 2}px; width: ${effectSize}px; height: ${effectSize}px; pointer-events: none; overflow: visible; transform: rotate(${rotation}deg); transform-origin: center;`;

          if (interactionMode === "sniper") {
            // 1. Sniper 4-axis Crosshair Lines
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.style.cssText = svgStyle;
            
            const angles = [0, 90, 180, 270];
            const lineData = angles.map((deg) => {
              const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
              const centerX = effectSize / 2;
              const centerY = effectSize / 2;
              line.setAttribute("x1", centerX);
              line.setAttribute("y1", centerY);
              line.setAttribute("x2", centerX);
              line.setAttribute("y2", centerY);
              line.setAttribute("stroke", color);
              line.setAttribute("stroke-width", strokeWidth);
              line.setAttribute("stroke-linecap", "square");
              svg.appendChild(line);
              return { line, angle: deg * (Math.PI / 180) };
            });
            container.appendChild(svg);

            lineData.forEach(({ line, angle }) => {
              const centerX = effectSize / 2;
              const centerY = effectSize / 2;
              const lineLength = effectSize * 0.2;
              const startX = centerX + 5 * Math.cos(angle);
              const startY = centerY - 5 * Math.sin(angle);
              const endX = centerX + (5 + lineLength) * Math.cos(angle);
              const endY = centerY - (5 + lineLength) * Math.sin(angle);

              if (typeof gsap !== "undefined") {
                gsap.set(line, { attr: { x1: startX, y1: startY, x2: endX, y2: endY }, strokeWidth });
                gsap.timeline()
                  .to(line, {
                    attr: { x1: endX, y1: endY, x2: endX, y2: endY },
                    translateX: (5 + lineLength) * Math.cos(angle),
                    translateY: -(5 + lineLength) * Math.sin(angle),
                    duration: duration,
                    ease: "power2.out",
                    onComplete: () => { if (svg.parentNode) svg.parentNode.removeChild(svg); }
                  })
                  .to(line, { strokeWidth: 0, duration: duration * 0.4, ease: "linear" }, duration * 0.6);
              } else {
                line.setAttribute("x1", startX);
                line.setAttribute("y1", startY);
                line.setAttribute("x2", endX);
                line.setAttribute("y2", endY);
                if (line.animate) {
                  line.animate([
                    { transform: "translate(0, 0)", opacity: 1 },
                    { transform: `translate(${(5 + lineLength) * Math.cos(angle)}px, ${-(5 + lineLength) * Math.sin(angle)}px)`, opacity: 0 }
                  ], { duration: duration * 1000, easing: "ease-out" });
                }
                setTimeout(() => { if (svg.parentNode) svg.parentNode.removeChild(svg); }, duration * 1000);
              }
            });

            // 2. 8 radiating sniper kinetic particles
            const dotAngles = [
              Math.PI / 3, (2 * Math.PI) / 3, (4 * Math.PI) / 3, (5 * Math.PI) / 3,
              Math.PI / 6, (5 * Math.PI) / 6, (7 * Math.PI) / 6, (11 * Math.PI) / 6
            ];

            dotAngles.forEach((angle) => {
              const dot = document.createElement("div");
              dot.style.cssText = `position: absolute; left: ${x - strokeWidth / 2}px; top: ${y - strokeWidth / 2}px; width: ${strokeWidth}px; height: ${strokeWidth}px; background-color: ${color}; pointer-events: none; border-radius: 50%; transform-origin: center; transform: rotate(${rotation}deg);`;
              container.appendChild(dot);

              const targetX = Math.cos(angle) * (effectSize * 0.4);
              const targetY = Math.sin(angle) * (effectSize * 0.4);

              if (typeof gsap !== "undefined") {
                gsap.set(dot, { x: 0, y: 0, width: strokeWidth, height: strokeWidth });
                gsap.timeline()
                  .to(dot, {
                    x: targetX,
                    y: targetY,
                    duration: duration,
                    ease: "power2.out",
                    onComplete: () => { if (dot.parentNode) dot.parentNode.removeChild(dot); }
                  })
                  .to(dot, { width: 0, height: 0, duration: duration * 0.4, ease: "linear" }, duration * 0.6);
              } else {
                if (dot.animate) {
                  dot.animate([
                    { transform: "translate(0, 0) scale(1)", opacity: 1 },
                    { transform: `translate(${targetX}px, ${targetY}px) scale(0)`, opacity: 0 }
                  ], { duration: duration * 1000, easing: "ease-out" });
                }
                setTimeout(() => { if (dot.parentNode) dot.parentNode.removeChild(dot); }, duration * 1000);
              }
            });
          } else if (interactionMode === "rings") {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.style.cssText = svgStyle;
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", effectSize / 2);
            circle.setAttribute("cy", effectSize / 2);
            circle.setAttribute("r", effectSize / 4);
            circle.setAttribute("fill", "none");
            circle.setAttribute("stroke", color);
            circle.setAttribute("stroke-width", strokeWidth);
            svg.appendChild(circle);
            container.appendChild(svg);

            if (typeof gsap !== "undefined") {
              gsap.set(svg, { scale: 0.5 });
              gsap.timeline()
                .to(svg, {
                  scale: 2,
                  duration: duration,
                  ease: "power3.out",
                  onComplete: () => { if (svg.parentNode) svg.parentNode.removeChild(svg); }
                }, 0)
                .to(svg, { opacity: 0, duration: duration * 0.2, ease: "linear" }, duration * 0.8);
            } else {
              if (svg.animate) {
                svg.animate([
                  { transform: "scale(0.5)", opacity: 1 },
                  { transform: "scale(2)", opacity: 0 }
                ], { duration: duration * 1000, easing: "ease-out" });
              }
              setTimeout(() => { if (svg.parentNode) svg.parentNode.removeChild(svg); }, duration * 1000);
            }
          } else if (interactionMode === "burst" || interactionMode === "crosshair" || interactionMode === "particles") {
            // General multi-particle burst
            for (let i = 0; i < 8; i++) {
              const dot = document.createElement("div");
              dot.style.cssText = `position: absolute; left: ${x - strokeWidth / 2}px; top: ${y - strokeWidth / 2}px; width: ${strokeWidth * 2}px; height: ${strokeWidth * 2}px; background-color: ${color}; pointer-events: none; border-radius: 50%;`;
              container.appendChild(dot);
              const ang = i * 45 * (Math.PI / 180);
              const dist = effectSize * 0.25 + Math.random() * (effectSize * 0.25);
              const destX = Math.cos(ang) * dist;
              const destY = Math.sin(ang) * dist;

              if (typeof gsap !== "undefined") {
                gsap.to(dot, {
                  x: destX,
                  y: destY,
                  opacity: 0,
                  duration: duration,
                  ease: "power1.out",
                  onComplete: () => { if (dot.parentNode) dot.parentNode.removeChild(dot); }
                });
              } else {
                if (dot.animate) {
                  dot.animate([
                    { transform: "translate(0, 0)", opacity: 1 },
                    { transform: `translate(${destX}px, ${destY}px)`, opacity: 0 }
                  ], { duration: duration * 1000, easing: "ease-out" });
                }
                setTimeout(() => { if (dot.parentNode) dot.parentNode.removeChild(dot); }, duration * 1000);
              }
            }
          }
        });
      }
    })();
"""

if "initOriginKitClickEffects" not in content:
    content = content.replace("window.addEventListener(\"hashchange\", () => {", click_effects_code + "\n\n    window.addEventListener(\"hashchange\", () => {")
    print("Injected OriginKit Click Effects into index.html")

with open("B:/projects/ACC/index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Saved updated index.html with OriginKit Click Effects!")
