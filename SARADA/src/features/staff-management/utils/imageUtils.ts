/* ─────────────────────────────────────────── */
/*  IMAGE COMPRESSION HELPER                   */
/*  Resizes any photo to ≤200 px and encodes   */
/*  as JPEG @60% so it never bloats localStorage */
/* ─────────────────────────────────────────── */
export const compressImage = (
  dataUrl: string,
  maxPx = 200,
  quality = 0.6
): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) {
          height = Math.round((height * maxPx) / width);
          width = maxPx;
        } else {
          width = Math.round((width * maxPx) / height);
          height = maxPx;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl); // fallback – keep original
    img.src = dataUrl;
  });
