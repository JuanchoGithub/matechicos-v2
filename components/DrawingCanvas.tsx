import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';

export interface DrawingCanvasRef {
  clearCanvas: () => void;
}

interface DrawingCanvasProps {
  children: React.ReactNode;
  mode: 'draw' | 'erase';
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ children, mode }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth] = useState(5);
  const [strokeColor] = useState('#4A90E2'); // brand-primary

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
      const context = canvas.getContext('2d');
      if(context) {
        context.lineCap = 'round';
        context.strokeStyle = strokeColor;
        context.lineWidth = lineWidth;
        contextRef.current = context;
      }
    }
  }, [lineWidth, strokeColor]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    if (contextRef.current) {
        if(mode === 'draw') {
            contextRef.current.globalCompositeOperation = 'source-over';
            contextRef.current.strokeStyle = strokeColor;
            contextRef.current.lineWidth = lineWidth;
        } else {
            contextRef.current.globalCompositeOperation = 'destination-out';
            contextRef.current.lineWidth = 20; // Eraser size
        }
    }
  }, [mode, strokeColor, lineWidth]);

  const finishDrawing = useCallback(() => {
    if (!contextRef.current || !isDrawing) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  }, [isDrawing]);

  useEffect(() => {
    // This makes drawing more robust, especially if the cursor leaves the canvas.
    window.addEventListener('mouseup', finishDrawing);
    window.addEventListener('touchend', finishDrawing);

    return () => {
      window.removeEventListener('mouseup', finishDrawing);
      window.removeEventListener('touchend', finishDrawing);
    };
  }, [finishDrawing]);


  const getEventCoordinates = (event: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    let clientX: number, clientY: number;

    if (window.TouchEvent && event.nativeEvent instanceof TouchEvent) {
        if (event.nativeEvent.touches.length === 0) { // This can happen on touchend
            if (event.nativeEvent.changedTouches.length > 0) {
                 clientX = event.nativeEvent.changedTouches[0].clientX;
                 clientY = event.nativeEvent.changedTouches[0].clientY;
            } else {
                return null;
            }
        } else {
            clientX = event.nativeEvent.touches[0].clientX;
            clientY = event.nativeEvent.touches[0].clientY;
        }
    } else {
        const mouseEvent = event as React.MouseEvent;
        clientX = mouseEvent.clientX;
        clientY = mouseEvent.clientY;
    }

    const cssX = clientX - rect.left;
    const cssY = clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = cssX * scaleX;
    const canvasY = cssY * scaleY;

    return { x: canvasX, y: canvasY };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (!contextRef.current) return;
    const coords = getEventCoordinates(event);
    if (!coords) return;
    
    const { x, y } = coords;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current) return;
    event.preventDefault(); // Prevent scrolling on touch devices
    const coords = getEventCoordinates(event);
    if (!coords) return;

    const { x, y } = coords;
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    clearCanvas,
  }));

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none select-none">
        {children}
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        className="absolute top-0 left-0 w-full h-full z-0 bg-transparent"
      />
    </div>
  );
});

export default DrawingCanvas;