/* =====================================================================
   js/photo.js
   ---------------------------------------------------------------------
   THE ARMOR TRIAL: the photo step after the 5 questions.

   The visitor sees THEMSELVES live inside the warrior's helmet, so they
   can line up their face just by moving closer or farther (or using the
   zoom buttons). Then: 3-2-1, flash, "Use this warrior" or "Retake".

   What is kept: only the small face crop, in memory, for this visitor.
   It is never uploaded, never sent to the AI, and is erased on reset.
   If the camera is missing or blocked, the visitor can continue without
   a photo (the rest of the experience still works).
   ===================================================================== */

window.HQ = window.HQ || {};

(function () {
  "use strict";

  const SET = window.HQ_SETTINGS.photo;
  const $ = (id) => document.getElementById(id);

  const video = $("photoVideo");
  const canvas = $("photoCanvas");
  const ctx = canvas.getContext("2d");

  let stream = null;        // the live camera
  let looping = false;      // drawing live frames?
  let layers = null;        // the mystery armor images
  let frac = SET.defaultZoom;   // face-area size (smaller = zoomed in)
  let frozen = null;        // the captured raw face crop
  let timers = [];          // countdown timers
  let onDone = null;        // callback(faceOrNull) to the app
  let busy = false;         // countdown running?

  const show = (id, on) => { $(id).hidden = !on; };
  const msg = (t) => { $("photoMsg").textContent = t; };
  function clearTimers() { timers.forEach(clearTimeout); timers = []; $("photoCountdown").textContent = ""; }

  // Draw the current frame: armor + live (or frozen) face.
  function draw(rawFace) {
    if (!layers) return;
    const face = rawFace ? HQ.warrior.processFace(rawFace, HQ.warrior.MYSTERY.color) : null;
    HQ.warrior.composite(ctx, layers, face);
  }

  function loop() {
    if (!looping) return;
    draw(HQ.warrior.cropFace(video, frac));
    requestAnimationFrame(loop);
  }

  function stopStream() {
    looping = false;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    stream = null;
    video.srcObject = null;
  }

  // Open the photo step. "done" receives the raw face crop, or null if skipped.
  async function open(done) {
    onDone = done;
    frozen = null;
    busy = false;
    frac = SET.defaultZoom;
    clearTimers();
    show("photoTake", false); show("photoUse", false); show("photoRetake", false); show("photoZoom", false);
    show("photoSkip", true);
    $("photoSkip").textContent = "Continue without photo";
    msg("Waking the camera…");

    try { layers = await HQ.warrior.layers(HQ.warrior.MYSTERY); draw(null); } catch (e) { layers = null; }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      msg("This device can't open a camera here. You can continue without a photo.");
      $("photoSkip").textContent = "Continue";
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false
      });
      if (!onDone) { stopStream(); return; }                // closed while waiting for permission
      video.srcObject = stream;
      await video.play();
      looping = true;
      loop();
      msg("Move closer or farther until your face fills the helmet.");
      show("photoTake", true); show("photoZoom", true);
    } catch (e) {
      msg("The camera is unavailable or permission was denied. You can continue without a photo.");
      $("photoSkip").textContent = "Continue";
    }
  }

  // 3-2-1, then capture.
  function take() {
    if (!looping || busy) return;
    busy = true;
    show("photoTake", false); show("photoSkip", false);
    msg("Hold still, hero…");
    [3, 2, 1].forEach((n, i) => timers.push(setTimeout(() => { $("photoCountdown").textContent = n; HQ.audio.sfx("tick"); }, i * 900)));
    timers.push(setTimeout(() => {
      $("photoCountdown").textContent = "";
      const raw = HQ.warrior.cropFace(video, frac);
      if (!raw) { busy = false; show("photoTake", true); show("photoSkip", true); msg("The camera blinked. Try again!"); return; }
      frozen = raw;
      looping = false;                                      // freeze the picture
      draw(frozen);
      HQ.audio.sfx("shutter");
      const f = $("photoFlash");
      f.classList.remove("go"); void f.offsetWidth; f.classList.add("go");
      busy = false;
      msg("Behold your armor! Use this warrior, or retake.");
      show("photoUse", true); show("photoRetake", true); show("photoZoom", false);
    }, 2700));
  }

  function retake() {
    HQ.audio.sfx("click");
    frozen = null;
    show("photoUse", false); show("photoRetake", false);
    show("photoTake", true); show("photoSkip", true); show("photoZoom", true);
    msg("Move closer or farther until your face fills the helmet.");
    looping = true;
    loop();
  }

  function finish(face) {
    const cb = onDone;
    onDone = null;
    clearTimers();
    stopStream();                                           // camera light goes off
    if (cb) cb(face);
  }

  // Close and erase everything (used on reset).
  function close() {
    onDone = null;
    clearTimers();
    stopStream();
    frozen = null;
    busy = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Zoom: "+" makes the face bigger (smaller crop area).
  function zoom(dir) {
    frac = Math.max(0.28, Math.min(0.95, frac - dir * 0.06));
    HQ.audio.sfx("click");
  }

  $("photoTake").addEventListener("click", take);
  $("photoRetake").addEventListener("click", retake);
  $("photoUse").addEventListener("click", () => { HQ.audio.sfx("select"); finish(frozen); });
  $("photoSkip").addEventListener("click", () => { HQ.audio.sfx("click"); finish(null); });
  $("zoomIn").addEventListener("click", () => zoom(1));
  $("zoomOut").addEventListener("click", () => zoom(-1));

  HQ.photo = { open, close, take };
})();
