// The readable HTML is primary. An animation may replace it only before the
// reader arrives, and only if preparation finishes within a bounded budget.
export function paperEnhancement({ load, ready, fallback, timeout = 3500 }) {
  let started = false, settled = false, controller, timer;
  const showText = () => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    controller?.abort();
    fallback();
  };
  const start = async () => {
    if (started || settled) return;
    started = true;
    controller = new AbortController();
    timer = setTimeout(showText, timeout);
    let scene;
    try {
      scene = await load(controller.signal);
      if (settled) { scene?.dispose(); return; }
      ready(scene);
      settled = true;
      clearTimeout(timer);
    } catch {
      scene?.dispose();
      showText();
    }
  };
  return { start, showText };
}

export async function prepareLetterFonts(fonts, signal) {
  if (!fonts?.load || signal.aborted) return;
  let timer, release;
  const stop = new Promise(resolve => {
    release = resolve;
    timer = setTimeout(resolve, 800);
    signal.addEventListener('abort', resolve, { once: true });
  });
  try {
    await Promise.race([
      Promise.allSettled([fonts.load('400 20px "Pine Words"'), fonts.load('400 34px "Motterdam"')]),
      stop,
    ]);
  } finally { clearTimeout(timer); signal.removeEventListener('abort', release); }
}
