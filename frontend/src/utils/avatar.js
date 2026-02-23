import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set worker so PDF.js can parse PDFs (required when using getDocument)
let workerSrcSet = false;
function setPdfWorker() {
  if (workerSrcSet) return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  workerSrcSet = true;
}

const MAX_AVATAR_SIZE = 400;
const AVATAR_QUALITY = 0.88;

/**
 * Render first page of a PDF to a data URL (JPEG), resized for avatar.
 * @param {File} file - PDF file
 * @returns {Promise<string>}
 */
async function pdfFirstPageToDataUrl(file) {
  setPdfWorker();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const w = viewport.width;
  const h = viewport.height;
  const scale = Math.min(1, MAX_AVATAR_SIZE / Math.max(w, h));
  const scaledViewport = page.getViewport({ scale });
  const cw = Math.round(scaledViewport.width);
  const ch = Math.round(scaledViewport.height);
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  await page.render({
    canvasContext: ctx,
    viewport: scaledViewport,
    intent: 'display',
  }).promise;
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Could not process PDF'));
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read result'));
        reader.readAsDataURL(blob);
      },
      'image/jpeg',
      AVATAR_QUALITY
    );
  });
}

/**
 * Resize an image file for use as an avatar; returns a data URL (JPEG).
 * Also accepts PDF files (first page is used).
 * @param {File} file
 * @returns {Promise<string>}
 */
export function resizeImageForAvatar(file) {
  const isPdf = file.type === 'application/pdf';
  if (isPdf) return pdfFirstPageToDataUrl(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const scale = Math.min(1, MAX_AVATAR_SIZE / Math.max(w, h));
      const cw = Math.round(w * scale);
      const ch = Math.round(h * scale);
      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, cw, ch);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Could not process image'));
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Could not read image'));
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        AVATAR_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Invalid image file'));
    };
    img.src = url;
  });
}
