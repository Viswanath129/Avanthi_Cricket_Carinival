import os

files = [
    r"B:\projects\ACC\index.html",
    r"B:\projects\ACC\Acc-Auction-Os.html",
    r"B:\projects\ACC\acc-auction-portal\dist\public\index.html"
]

for p in files:
    with open(p, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update .opal-bg-root CSS to include the SVG as background fallback
    old_bg_css = """.opal-bg-root {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      height: 100dvh;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }"""

    new_bg_css = """.opal-bg-root {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      height: 100dvh;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
      background: #F6F9FF url('Blue sky-2048x1166.svg') center/cover no-repeat;
    }"""
    content = content.replace(old_bg_css, new_bg_css)

    # 2. Update HTML video tag and source
    old_video_html = """  <!-- OPAL ANIMATED BACKGROUND — NATIVE VIDEO LIQUID GLASS UI -->
  <div class="opal-bg-root" aria-hidden="true">
    <video class="opal-bg-video" autoplay loop muted playsinline webkit-playsinline disablePictureInPicture poster="opal-poster.jpg">
      <source src="Opal.mp4" type="video/mp4">
    </video>
    <div class="opal-bg-scrim"></div>
  </div>"""

    new_video_html = """  <!-- BLUE SKY ANIMATED BACKGROUND — NATIVE VIDEO LIQUID GLASS UI -->
  <div class="opal-bg-root" aria-hidden="true">
    <video class="opal-bg-video" autoplay loop muted playsinline webkit-playsinline disablePictureInPicture poster="Blue sky-2048x1166.svg">
      <source src="Blue sky.mp4" type="video/mp4">
      <source src="Blue%20sky.mp4" type="video/mp4">
      <source src="Blue-sky.mp4" type="video/mp4">
    </video>
    <div class="opal-bg-scrim"></div>
  </div>"""
    content = content.replace(old_video_html, new_video_html)

    with open(p, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated background in", p)
