let ctx;
export const isSoundOn = () => localStorage.getItem('px-sound') === '1';
export const toggleSound = () => { const v = !isSoundOn(); localStorage.setItem('px-sound', v ? '1' : '0'); return v; };
export function blip(freq = 660, dur = 0.07) {
  if (!isSoundOn()) return;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = freq; g.gain.value = 0.04;
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
  } catch { /* audio unavailable */ }
}
