/* =====================================================================
   js/warrior.js
   ---------------------------------------------------------------------
   THE PERSONALIZED WARRIOR PORTRAIT ENGINE

   The visitor's face is placed INSIDE an open-faced knight's helmet,
   like a sandwich of three layers:

       1. UNDER layer  - background glow, cape, weapon on the back,
                         and the dark inside of the helmet
       2. THE FACE     - cropped from the camera, color-graded, shaded
                         near the helmet rim, and given soft (feathered)
                         edges so it melts into the helmet's shadow
       3. OVER layer   - helmet shell with a face-shaped opening, plume,
                         neck guard (gorget), shoulder armor, breastplate
                         with the hero's emblem, and the hero's item

   Because the helmet shell is drawn ON TOP of the face, its rim hides
   the edges of the photo, so the face looks like it belongs inside.

   Output: one 960 x 1200 image (4:5). That SAME image is shown on the
   reveal screen and used for printing and the PDF.
   Everything happens on this device. Nothing is uploaded.
   ===================================================================== */

window.HQ = window.HQ || {};

(function () {
  "use strict";

  // Output size of the finished portrait (pixels). Art is designed at 400 x 500.
  const OUT_W = 960, OUT_H = 1200, S = OUT_W / 400;   // S = scale factor (2.4)

  // Where the face goes, in art units (an ellipse inside the helmet opening).
  const FACE = { cx: 200, cy: 214, rx: 60, ry: 88 };
  // The same area in output pixels (a rectangle around that ellipse).
  const FACE_PX = {
    x: (FACE.cx - FACE.rx) * S, y: (FACE.cy - FACE.ry) * S,
    w: FACE.rx * 2 * S, h: FACE.ry * 2 * S
  };
  const FACE_RATIO = FACE.rx / FACE.ry;                // width / height of the face area

  // The "mystery" armor shown while posing, before the Oracle names the hero.
  const MYSTERY = { id: "mystery", color: "#7FE7C4", lights: ["star", "lumen", "ember"] };

  /* ---------------- small art helpers ---------------- */
  function starPts(cx, cy, outer, inner, n) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = -Math.PI / 2 + (i * Math.PI) / n;
      pts.push((cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1));
    }
    return pts.join(" ");
  }
  const GLYPH = {
    star: () => `<polygon points="${starPts(0, 0, 16, 6.5, 8)}" fill="#E9C46A"/>`,
    lumen: () => `<path d="M-13,-3 Q-6.5,-7 0,-3 Q6.5,-7 13,-3 L13,10 Q6.5,6 0,10 Q-6.5,6 -13,10 Z" fill="#8FD3FF"/><path d="M0,-3 L0,10" stroke="#0B241D" stroke-width="1.3"/><path d="M0,-8 L0,-16 M-6,-9 L-9,-14 M6,-9 L9,-14" stroke="#8FD3FF" stroke-width="1.6" stroke-linecap="round"/>`,
    ember: () => `<path d="M0,-15 C5,-8 9,-3 7,3 C5.5,8 -5.5,8 -7,3 C-9,-3 -4,-7 0,-15 Z" fill="#FF8A3D"/><path d="M0,-6 C2.5,-2 3.5,1 2.5,3.5 C1.5,5.5 -1.5,5.5 -2.5,3.5 C-3.5,1 -2,-2 0,-6 Z" fill="#FFE2A8"/>`
  };
  // Emblem with 1, 2, or 3 lights (3 = the full Sigil arrangement).
  function emblem(lights, cx, cy, s) {
    if (lights.length === 1) return `<g transform="translate(${cx} ${cy}) scale(${s})">${GLYPH[lights[0]]()}</g>`;
    const spots = lights.length === 2 ? [[-11, 0], [11, 0]] : [[0, -10], [-11, 8], [11, 8]];
    return lights.map((l, i) => `<g transform="translate(${cx + spots[i][0] * s} ${cy + spots[i][1] * s}) scale(${s * 0.55})">${GLYPH[l]()}</g>`).join("");
  }

  // Shared gradients. "p" keeps ids unique.
  function defs(c, p) {
    return `<defs>
  <linearGradient id="${p}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E4A3C"/><stop offset="1" stop-color="#06140F"/></linearGradient>
  <radialGradient id="${p}glow" cx="0.5" cy="0.42" r="0.55"><stop offset="0" stop-color="${c}" stop-opacity="0.6"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
  <linearGradient id="${p}steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F1F5F7"/><stop offset="0.5" stop-color="#AEBBC3"/><stop offset="1" stop-color="#5E6E78"/></linearGradient>
  <linearGradient id="${p}shell" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6B7B85"/><stop offset="0.3" stop-color="#E8EEF1"/><stop offset="0.55" stop-color="#C3CED4"/><stop offset="1" stop-color="#56656E"/></linearGradient>
  <linearGradient id="${p}blade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C9D3D9"/><stop offset="0.5" stop-color="#FFFFFF"/><stop offset="1" stop-color="#9AA8B0"/></linearGradient>
  <linearGradient id="${p}cape" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A3152E"/><stop offset="1" stop-color="#4E0814"/></linearGradient>
  <filter id="${p}gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;
  }

  /* ---------------- LAYER 1: UNDER (behind the face) ---------------- */
  function underSVG(arch) {
    const c = arch.color, p = "u" + arch.id;
    let rays = "";
    for (let i = 0; i < 14; i++) {
      const a = (i * (360 / 14) * Math.PI) / 180, d = (3.5 * Math.PI) / 180;
      rays += `<polygon points="200,200 ${(200 + 560 * Math.cos(a - d)).toFixed(0)},${(200 + 560 * Math.sin(a - d)).toFixed(0)} ${(200 + 560 * Math.cos(a + d)).toFixed(0)},${(200 + 560 * Math.sin(a + d)).toFixed(0)}" fill="${c}" opacity="0.12"/>`;
    }
    // Sword hilt rising over the right shoulder (most heroes)
    const sword = (glow) => `<g transform="translate(316 196) rotate(24)"${glow ? ` filter="url(#${p}gl)"` : ""}>
      <rect x="-8" y="-42" width="16" height="300" fill="url(#${p}blade)" stroke="#2E3B42"/>
      <rect x="-42" y="-56" width="84" height="13" rx="4" fill="#E9C46A" stroke="#7A4E0E" stroke-width="2"/>
      <rect x="-6" y="-104" width="12" height="48" rx="3" fill="#5A3A12" stroke="#E9C46A"/>
      <circle cx="0" cy="-112" r="10" fill="#E9C46A" stroke="#7A4E0E" stroke-width="2"/><circle cx="0" cy="-112" r="4" fill="${c}"/></g>`;
    let back;
    switch (arch.id) {
      case "vanguard":
        back = `<line x1="352" y1="36" x2="352" y2="500" stroke="#6B4A1B" stroke-width="8" stroke-linecap="round"/><circle cx="352" cy="32" r="8" fill="#E9C46A"/>` +
          `<path d="M356,48 L398,48 L398,176 L377,158 L356,176 Z" fill="${c}" stroke="#E9C46A" stroke-width="2"/><polygon points="${starPts(377, 100, 15, 6, 8)}" fill="#7A4E0E"/>`;
        break;
      case "sage":
        back = `<line x1="48" y1="64" x2="48" y2="500" stroke="#6B4A1B" stroke-width="8" stroke-linecap="round"/><circle cx="48" cy="46" r="34" fill="${c}" opacity="0.35"/>` +
          `<polygon points="48,16 63,46 48,76 33,46" fill="${c}" stroke="#E9C46A" stroke-width="2"/>`;
        break;
      case "paragon":
        back = sword(true);
        break;
      default:
        back = sword(false);
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="${OUT_W}" height="${OUT_H}">${defs(c, p)}
  <rect width="400" height="500" fill="url(#${p}bg)"/>
  ${rays}
  <circle cx="200" cy="210" r="240" fill="url(#${p}glow)"/>
  ${back}
  <path d="M78,330 C56,400 40,460 30,500 L370,500 C360,460 344,400 322,330 Z" fill="url(#${p}cape)"/>
  <ellipse cx="200" cy="214" rx="76" ry="100" fill="#121619"/>
  <path d="M146,268 L254,268 L262,336 L138,336 Z" fill="#2B2420"/>
</svg>`;
  }

  /* ---------------- LAYER 3: OVER (in front of the face) ---------------- */
  function overSVG(arch) {
    const c = arch.color, p = "o" + arch.id;
    const SL = "#2E3B42";
    const pauldron = `<path d="M48,388 C42,340 84,312 142,324 C156,350 154,380 140,402 C108,412 70,408 48,388 Z" fill="url(#${p}steel)" stroke="${SL}" stroke-width="2"/>` +
      `<path d="M56,382 C80,396 116,398 144,390" stroke="#E9C46A" stroke-width="3" fill="none"/>` +
      `<path d="M50,410 C76,428 118,428 142,418 L140,402 C110,412 76,410 52,396 Z" fill="url(#${p}steel)" stroke="${SL}" stroke-width="1.5"/>` +
      `<circle cx="96" cy="350" r="4" fill="#E9C46A"/>`;
    let front = "";
    switch (arch.id) {
      case "guardian":
        front = `<path d="M10,404 L118,404 L118,462 Q118,516 64,546 Q10,516 10,462 Z" fill="url(#${p}steel)" stroke="#E9C46A" stroke-width="4"/>` +
          `<path d="M22,416 L106,416 L106,462 Q106,506 64,530 Q22,506 22,462 Z" fill="#7A2412"/>` + emblem(["ember"], 64, 462, 1.8);
        break;
      case "oathkeeper":
        front = `<g transform="translate(262 356) rotate(-12)"><circle cx="0" cy="0" r="15" fill="none" stroke="#E9C46A" stroke-width="6"/>` +
          `<rect x="-4" y="14" width="8" height="96" fill="#E9C46A" stroke="#7A4E0E"/><rect x="4" y="88" width="16" height="7" fill="#E9C46A"/><rect x="4" y="100" width="11" height="7" fill="#E9C46A"/></g>`;
        break;
      case "hearthbuilder":
        front = `<g transform="translate(66 404)"><circle cx="0" cy="46" r="46" fill="#FFB347" opacity="0.3"/><line x1="0" y1="0" x2="0" y2="14" stroke="#6B4A1B" stroke-width="3"/>` +
          `<path d="M-16,14 L16,14 L20,26 L-20,26 Z" fill="#E9C46A"/><rect x="-16" y="26" width="32" height="40" rx="5" fill="#FFD27A" stroke="#E9C46A" stroke-width="3"/>` +
          `<path d="M0,33 C5,40 7,45 5,52 C3,56 -3,56 -5,52 C-7,45 -4,40 0,33 Z" fill="#FF8A3D"/><path d="M-20,66 L20,66 L16,76 L-16,76 Z" fill="#E9C46A"/></g>`;
        break;
      case "sage":
        front = `<g transform="translate(296 420) rotate(-10)"><rect width="56" height="70" rx="4" fill="#24476B" stroke="#E9C46A" stroke-width="3"/>` +
          `<rect x="48" y="5" width="5" height="60" fill="#F3E7C8"/>` + emblem(["lumen"], 26, 35, 1.1) + `</g>`;
        break;
    }
    const sparkles = [[44, 120, 9], [356, 236, 7], [70, 250, 6], [334, 86, 10], [370, 330, 6], [30, 300, 7]]
      .map(([x, y, r]) => `<polygon points="${starPts(x, y, r, r * 0.28, 4)}" fill="${c}" opacity="0.9"/>`).join("");

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="${OUT_W}" height="${OUT_H}">${defs(c, p)}
  <path d="M132,300 Q200,330 268,300 L284,350 Q200,382 116,350 Z" fill="url(#${p}steel)" stroke="${SL}" stroke-width="2"/>
  <path d="M132,300 Q200,330 268,300" stroke="#E9C46A" stroke-width="3" fill="none"/>
  <path d="M112,350 Q200,328 288,350 L300,500 L100,500 Z" fill="url(#${p}steel)" stroke="${SL}" stroke-width="2"/>
  <path d="M200,342 L200,500" stroke="#FFFFFF" stroke-width="2" opacity="0.35"/>
  <path d="M118,470 Q200,488 282,470" stroke="${SL}" stroke-width="1.5" fill="none" opacity="0.5"/>
  <circle cx="200" cy="430" r="38" fill="#0B241D" stroke="#E9C46A" stroke-width="3"/>
  ${emblem(arch.lights, 200, 430, 1.6)}
  ${pauldron}
  <g transform="translate(400 0) scale(-1 1)">${pauldron}</g>
  <path d="M206,34 C198,12 226,2 256,8 C244,16 250,28 268,32 C248,40 226,42 206,34 Z" fill="${c}" stroke="#7A4E0E" stroke-width="1"/>
  <!-- Helmet shell: ONE outline that traces around the face opening, so the
       chin area stays open (like a real open-faced helmet) -->
  <path fill="url(#${p}shell)" stroke="${SL}" stroke-width="2"
        d="M156,292 L148,224 C148,162 170,134 200,132 C230,134 252,162 252,224 L244,292
           Q264,318 290,300 L294,226 C296,112 254,30 200,28 C146,30 104,112 106,226 L110,300 Q136,318 156,292 Z"/>
  <path d="M156,292 L148,224 C148,162 170,134 200,132 C230,134 252,162 252,224 L244,292" stroke="#E9C46A" stroke-width="3" fill="none"/>
  <path d="M116,150 Q200,96 284,150" stroke="#E9C46A" stroke-width="4" fill="none"/>
  <path d="M200,30 L200,104" stroke="#E9C46A" stroke-width="3"/>
  <circle cx="126" cy="252" r="4" fill="#E9C46A"/><circle cx="274" cy="252" r="4" fill="#E9C46A"/>
  <circle cx="130" cy="200" r="3" fill="#E9C46A"/><circle cx="270" cy="200" r="3" fill="#E9C46A"/>
  ${front}
  ${sparkles}
</svg>`;
  }

  /* ---------------- turning SVG text into drawable images ---------------- */
  function svgToImage(svg) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("armor image failed")); };
      img.src = url;
    });
  }
  const layerCache = {};
  // Load (once) the under + over layers for a hero (or the mystery armor).
  function layers(arch) {
    const a = arch || MYSTERY;
    if (!layerCache[a.id]) {
      layerCache[a.id] = Promise.all([svgToImage(underSVG(a)), svgToImage(overSVG(a))])
        .then(([under, over]) => ({ under, over }));
    }
    return layerCache[a.id];
  }

  /* ---------------- THE FACE ---------------- */

  // Cut the face area out of a camera frame.
  //   frac = how much of the camera's height the face area covers
  //          (smaller = more zoomed in). The result is mirrored, like a mirror.
  function cropFace(video, frac) {
    const out = document.createElement("canvas");
    out.width = Math.round(FACE_PX.w);
    out.height = Math.round(FACE_PX.h);
    const vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh) return null;                                    // camera not ready yet
    const ch = Math.min(vh, frac * vh), cw = Math.min(vw, ch * FACE_RATIO);
    const sx = Math.max(0, Math.min(vw - cw, vw / 2 - cw / 2));     // centered, kept inside the frame
    const sy = Math.max(0, Math.min(vh - ch, vh * 0.46 - ch / 2));  // a little above center (where faces are)
    const ctx = out.getContext("2d");
    ctx.filter = "saturate(1.08) contrast(1.06) brightness(1.04)";  // a touch of "hero lighting"
    ctx.translate(out.width, 0);
    ctx.scale(-1, 1);                                               // mirror image
    ctx.drawImage(video, sx, sy, cw, ch, 0, 0, out.width, out.height);
    return out;
  }

  // Convert "#RRGGBB" to "rgba(r,g,b,a)".
  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  // Fill the whole canvas with an ELLIPTICAL gradient (stops = [[pos, color], ...]).
  function ellipseGradient(ctx, w, h, cyFrac, stops) {
    ctx.save();
    ctx.translate(w / 2, h * cyFrac);
    ctx.scale(1, h / w);                                            // stretch a circle into an ellipse
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2);
    stops.forEach(([pos, col]) => g.addColorStop(pos, col));
    ctx.fillStyle = g;
    ctx.fillRect(-w, -w, w * 2, w * 2);
    ctx.restore();
  }

  // Blend the raw face so it "belongs" inside the helmet.
  function processFace(raw, color) {
    const w = raw.width, h = raw.height;
    const out = document.createElement("canvas");
    out.width = w; out.height = h;
    const ctx = out.getContext("2d");
    ctx.drawImage(raw, 0, 0);

    // 1. Shadow from the helmet rim: darker toward the edges (multiply)
    ctx.globalCompositeOperation = "multiply";
    ellipseGradient(ctx, w, h, 0.5, [[0, "#FFFFFF"], [0.7, "#FFFFFF"], [0.9, "#BBA796"], [1, "#6E5D52"]]);

    // 2. Magical light in the hero's color (soft-light keeps skin tones natural)
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = rgba(color, 0.28);
    ctx.fillRect(0, 0, w, h);

    // 3. Feathered edges: fully visible in the middle, fading out at the rim
    ctx.globalCompositeOperation = "destination-in";
    ellipseGradient(ctx, w, h, 0.5, [[0, "rgba(0,0,0,1)"], [0.82, "rgba(0,0,0,1)"], [1, "rgba(0,0,0,0)"]]);
    ctx.globalCompositeOperation = "source-over";
    return out;
  }

  // Draw the full portrait onto a 960 x 1200 canvas context.
  function composite(ctx, lyr, face) {
    ctx.clearRect(0, 0, OUT_W, OUT_H);
    ctx.drawImage(lyr.under, 0, 0, OUT_W, OUT_H);
    if (face) ctx.drawImage(face, FACE_PX.x, FACE_PX.y, FACE_PX.w, FACE_PX.h);
    ctx.drawImage(lyr.over, 0, 0, OUT_W, OUT_H);
  }

  // FINAL: the hero's personalized portrait as an image (data URL).
  // This exact image is shown on screen AND printed / saved as PDF.
  async function render(arch, rawFace) {
    const lyr = await layers(arch);
    const canvas = document.createElement("canvas");
    canvas.width = OUT_W; canvas.height = OUT_H;
    composite(canvas.getContext("2d"), lyr, rawFace ? processFace(rawFace, arch.color) : null);
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  HQ.warrior = { MYSTERY, OUT_W, OUT_H, layers, cropFace, processFace, composite, render };
})();
