
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Brush, Eraser, Trash2, Palette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Toggle } from './ui/toggle';

interface DrawingCanvasProps {
    initialDataUrl?: string | null;
    onSave: (dataUrl: string) => void;
}

export function DrawingCanvas({ initialDataUrl, onSave }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [color, setColor] = useState('#F54291');
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
    }

    const context = canvas.getContext('2d');
    if (context) {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      contextRef.current = context;

      if (initialDataUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Important for loading from Firebase Storage
        img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
        }
        img.src = initialDataUrl;
      }
    }
  }, [initialDataUrl]);
  
  useEffect(() => {
    if (contextRef.current) {
        contextRef.current.strokeStyle = color;
        contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize]);

  const saveCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          // Check if canvas is blank
          const blank = document.createElement('canvas');
          blank.width = canvas.width;
          blank.height = canvas.height;
          const isBlank = canvas.toDataURL() === blank.toDataURL();
          
          onSave(isBlank ? "DELETE" : canvas.toDataURL());
      }
  }

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawMode) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    contextRef.current?.closePath();
    setIsDrawing(false);
    saveCanvas();
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawMode) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      onSave("DELETE"); // Special value to signify deletion
    }
  };
  
  const setEraser = () => {
      if (contextRef.current) {
        contextRef.current.globalCompositeOperation = 'destination-out';
      }
  };

  const setBrush = () => {
    if (contextRef.current) {
      contextRef.current.globalCompositeOperation = 'source-over';
      contextRef.current.strokeStyle = color;
    }
  }

  return (
    <div 
        className="absolute top-0 left-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
    >
        <div 
            className="absolute top-1/2 -translate-y-1/2 right-2 z-10 flex flex-col items-center gap-2 p-2 rounded-lg bg-background/80 border shadow-md backdrop-blur-sm"
            style={{ pointerEvents: 'auto' }}
        >
            <Toggle
                size="sm"
                pressed={isDrawMode}
                onPressedChange={(pressed) => {
                    setIsDrawMode(pressed);
                    if (pressed) setBrush();
                }}
                title={isDrawMode ? "Disable Drawing" : "Enable Drawing"}
            >
                <Brush className="h-4 w-4" />
            </Toggle>
            
            <div className="w-6 h-px bg-border" />
            
            <input
                type="color"
                value={color}
                onChange={(e) => {
                    setColor(e.target.value)
                    setBrush()
                }}
                className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                title="Select Color"
                disabled={!isDrawMode}
            />

            <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={setEraser}
                disabled={!isDrawMode}
                title="Eraser"
            >
                <Eraser className="h-4 w-4" />
            </Button>

            <Popover>
                <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" disabled={!isDrawMode} title="Brush Size">
                    <Palette className="h-4 w-4" />
                </Button>
                </PopoverTrigger>
                <PopoverContent side="left" className="w-48 space-y-2">
                    <Label htmlFor="brush-size">Brush Size</Label>
                    <Slider
                        id="brush-size"
                        min={1}
                        max={50}
                        step={1}
                        value={[brushSize]}
                        onValueChange={(value) => setBrushSize(value[0])}
                    />
                </PopoverContent>
            </Popover>

            <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={clearCanvas}
                disabled={!isDrawMode}
                title="Clear Canvas"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onMouseLeave={finishDrawing}
        className="w-full h-full"
        style={{ 
            pointerEvents: isDrawMode ? 'auto' : 'none',
            cursor: isDrawMode ? 'crosshair' : 'default',
        }}
      />
    </div>
  );
}
