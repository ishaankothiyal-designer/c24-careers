export function deferredImage(source, onReady, ImageClass = Image) {
  let pending;
  return () => pending ||= new Promise(resolve => {
    const image = new ImageClass();
    image.decoding = 'async';
    image.onload = async () => {
      try {
        if (image.decode) await image.decode();
        onReady(image);
        resolve(true);
      } catch { resolve(false); }
    };
    image.onerror = () => resolve(false);
    image.src = source;
  });
}
