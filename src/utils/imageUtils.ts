/**
 * Utility to rasterize any image source (including SVG data URIs) to clean JPEG or PNG data URL.
 * Gemini API inlineData strictly supports raster image formats (image/png, image/jpeg, image/webp).
 */
export async function convertToRasterImageDataUrl(
  imageSource: string,
  targetWidth: number = 1000,
  targetHeight: number = 480
): Promise<{ dataUrl: string; mimeType: string }> {
  // If already a raster JPEG/PNG data URI or clean base64 image (not SVG), return as is
  if (
    imageSource.startsWith("data:image/jpeg") ||
    imageSource.startsWith("data:image/png") ||
    imageSource.startsWith("data:image/webp")
  ) {
    const mimeMatch = imageSource.match(/^data:(image\/[a-zA-Z]+);base64,/);
    return {
      dataUrl: imageSource,
      mimeType: mimeMatch ? mimeMatch[1] : "image/jpeg",
    };
  }

  // Rasterize SVG or arbitrary image format into JPEG using an in-memory Canvas
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Draw deep radiographic dark background
        ctx.fillStyle = "#0d1117";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const rasterDataUrl = canvas.toDataURL("image/jpeg", 0.92);
        resolve({
          dataUrl: rasterDataUrl,
          mimeType: "image/jpeg",
        });
      } else {
        // Fallback
        resolve({
          dataUrl: imageSource,
          mimeType: "image/jpeg",
        });
      }
    };

    img.onerror = () => {
      // Fallback
      resolve({
        dataUrl: imageSource,
        mimeType: "image/jpeg",
      });
    };

    img.src = imageSource;
  });
}
