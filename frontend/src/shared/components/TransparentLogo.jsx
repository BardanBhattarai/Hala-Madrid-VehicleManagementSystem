import React, { useEffect, useState } from 'react';

/**
 * A premium React component that dynamically processes an image on-the-fly, 
 * converting its white background into perfect transparency using HTML5 Canvas.
 */
export default function TransparentLogo({ src, className, alt = "Logo" }) {
  const [processedSrc, setProcessedSrc] = useState(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setProcessedSrc(src);
          return;
        }

        ctx.drawImage(img, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        // Loop through pixels and set white-ish pixels to transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Check if the pixel is near-white (threshold 235 to capture compression artifacts)
          if (r > 235 && g > 235 && b > 235) {
            data[i + 3] = 0; // Set alpha channel to 0 (fully transparent)
          }
        }
        
        ctx.putImageData(imgData, 0, 0);
        setProcessedSrc(canvas.toDataURL());
      } catch (err) {
        console.error('[TransparentLogo] Canvas extraction failed, falling back to original src:', err);
        // Fallback gracefully to the original image if canvas is blocked or fails
        setProcessedSrc(src);
      }
    };

    img.onerror = () => {
      setProcessedSrc(src);
    };
  }, [src]);

  if (!processedSrc) {
    return <div className={`${className} bg-slate-200/25 animate-pulse`} />;
  }

  return (
    <img 
      src={processedSrc} 
      className={className} 
      alt={alt} 
      style={{ mixBlendMode: 'normal' }}
    />
  );
}
