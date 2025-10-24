import React, { useRef, useEffect } from 'react';

interface ShinyEffectCanvasProps {
  mode: string;
}

const ShinyEffectCanvas: React.FC<ShinyEffectCanvasProps> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // FIX: useRef requires an initial value. Initialize with null and update type.
  const animationFrameId = useRef<number | null>(null);
  const time = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set a lower resolution for performance, then scale up with CSS
    const w = 150;
    const h = 150;
    canvas.width = w;
    canvas.height = h;

    const bases = {
        bronze: { r: 205, g: 127, b: 50 },
        silver: { r: 192, g: 192, b: 192 },
        gold: { r: 255, g: 215, b: 0 },
        platinum: { r: 173, g: 216, b: 230 } // mapped to 'diamond' effect
    };

    const getPlasma = (x: number, y: number, t: number) => {
        const scale1 = 50;
        const scale2 = 75;
        const scale3 = 100;
        let v1 = Math.sin(x / scale1 + t);
        let v2 = Math.sin(y / scale1 + t);
        let v3 = Math.sin((x + y) / scale2 + t * 1.5);
        let v4 = Math.sin((x - y) / scale3 + t * 2.0);
        return (v1 + v2 + v3 + v4 + 4) / 8; // Normalize to 0-1
    };

    const hslToRgb = (h: number, s: number, l: number) => {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    };

    const animate = () => {
        time.current += 0.02;
        const t = time.current;
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;
        const currentMode = mode === 'platinum' ? 'diamond' : mode;

        let centers: {x: number, y: number}[] = [];
        if (currentMode === 'diamond') {
            centers = [
                { x: (w/4) + (w/6) * Math.sin(t * 2), y: (h/4) + (h/6) * Math.cos(t * 1.7) },
                { x: (w*3/4) + (w/6) * Math.sin(t * 1.3), y: (h*3/4) + (h/6) * Math.cos(t * 2.1) },
                { x: (w/2) + (w/5) * Math.sin(t * 0.8), y: (h/2) + (h/5) * Math.cos(t * 1.9) }
            ];
        }

        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                const i = getPlasma(x, y, t);
                const idx = (y * w + x) * 4;

                let r, g, b;
                if (currentMode === 'rainbow') {
                    const hue = (t * 50 + i * 360) % 360;
                    const rgb = hslToRgb(hue / 360, 1, 0.5);
                    r = rgb.r;
                    g = rgb.g;
                    b = rgb.b;
                } else {
                    const base = bases[mode as keyof typeof bases] || bases.gold;
                    r = Math.floor(base.r + (255 - base.r) * i);
                    g = Math.floor(base.g + (255 - base.g) * i);
                    b = Math.floor(base.b + (255 - base.b) * i);
                }

                if (currentMode === 'diamond') {
                    let sparkle = 0;
                    for (let center of centers) {
                        let dx = x - center.x;
                        let dy = y - center.y;
                        let dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < w / 8) { // scale sparkle size with canvas width
                            let intensity = Math.exp( - (dist * dist) / (2 * 10 * 10) );
                            intensity *= 0.5 + 0.5 * Math.sin(t * 20 + (x + y) * 0.1);
                            sparkle = Math.max(sparkle, intensity);
                        }
                    }
                    r = Math.min(255, r + sparkle * (255 - r));
                    g = Math.min(255, g + sparkle * (255 - g));
                    b = Math.min(255, b + sparkle * (255 - b));
                }

                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
        animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 opacity-80" />;
};

export default ShinyEffectCanvas;