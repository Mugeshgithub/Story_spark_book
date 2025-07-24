
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import './ZipGame.css';
import { Button } from './ui/button';
import { Undo, RefreshCw, TimerIcon, Play } from 'lucide-react';
import { Card } from './ui/card';

type Cell = {
  row: number;
  col: number;
};

type Puzzle = {
  gridSize: number;
  dots: { num: number; row: number; col: number }[];
  totalCells: number;
  solvedPath?: Cell[];
};

const allPuzzles: Puzzle[] = [
  {
    gridSize: 5,
    dots: [
      { num: 1, row: 0, col: 0 },
      { num: 2, row: 0, col: 4 },
      { num: 3, row: 4, col: 4 },
      { num: 4, row: 4, col: 2 },
      { num: 5, row: 2, col: 2 },
      { num: 6, row: 2, col: 0 },
    ],
    totalCells: 25,
  },
  {
    gridSize: 6,
    dots: [
        { num: 1, row: 5, col: 3 },
        { num: 2, row: 2, col: 3 },
        { num: 3, row: 2, col: 0 },
        { num: 4, row: 0, col: 0 },
        { num: 5, row: 0, col: 5 },
        { num: 6, row: 5, col: 5 },
    ],
    totalCells: 36,
  },
];

const generateSolvedPath = (puzzle: Puzzle): Cell[] => {
    // This is a placeholder for a real solver. For now, we'll hardcode one path.
    // In a real app, you might use a pathfinding algorithm or pre-calculate these.
    if (puzzle.gridSize === 5) {
        return [
            { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 },
            { row: 1, col: 4 }, { row: 2, col: 4 }, { row: 3, col: 4 }, { row: 4, col: 4 },
            { row: 4, col: 3 }, { row: 4, col: 2 },
            { row: 3, col: 2 }, { row: 2, col: 2 },
            { row: 1, col: 2 }, { row: 1, col: 1 }, { row: 1, col: 0 }, { row: 2, col: 0 },
            { row: 3, col: 0 }, { row: 3, col: 1 }, { row: 4, col: 1 }, { row: 4, col: 0 },
            { row: 3, col: 0 }, { row: 2, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }
        ].filter((cell, index, self) => index === self.findIndex(c => c.row === cell.row && c.col === cell.col));
    }
    // A default simple path for other puzzles
    const path: Cell[] = [];
    for(let r=0; r<puzzle.gridSize; ++r) {
        for(let c=0; c<puzzle.gridSize; ++c) {
            path.push({row: r, col: c});
        }
    }
    return path;
}


export function ZipGame() {
    const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle>(allPuzzles[0]);
    const [path, setPath] = useState<Cell[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'complete'>('idle');
    const [timer, setTimer] = useState(0);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const gameContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const randomPuzzle = allPuzzles[Math.floor(Math.random() * allPuzzles.length)];
        randomPuzzle.solvedPath = generateSolvedPath(randomPuzzle);
        setCurrentPuzzle(randomPuzzle);
        setPath(randomPuzzle.solvedPath || []);
    }, []);
    
    useEffect(() => {
        if (gameState === 'playing') {
            timerIntervalRef.current = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [gameState]);


    const startGame = useCallback(() => {
        const randomPuzzle = allPuzzles[Math.floor(Math.random() * allPuzzles.length)];
        randomPuzzle.solvedPath = generateSolvedPath(randomPuzzle);
        setCurrentPuzzle(randomPuzzle);
        setPath(randomPuzzle.dots.length > 0 ? [randomPuzzle.dots[0]] : []);
        setGameState('playing');
        setTimer(0);
    }, []);

    const handleUndo = () => {
        if (path.length > 1) {
            setPath(path.slice(0, -1));
        }
    };
    
    const getCellFromEvent = (e: React.MouseEvent | React.TouchEvent): Cell | null => {
        const container = gameContainerRef.current;
        if (!container) return null;

        const rect = container.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const col = Math.floor((x / rect.width) * currentPuzzle.gridSize);
        const row = Math.floor((y / rect.height) * currentPuzzle.gridSize);
        
        if (row >= 0 && row < currentPuzzle.gridSize && col >= 0 && col < currentPuzzle.gridSize) {
            return { row, col };
        }
        return null;
    };

    const updatePath = (newCell: Cell) => {
        if (!isDrawing) return;
        const lastCell = path[path.length - 1];
        if (!lastCell || (lastCell.row === newCell.row && lastCell.col === newCell.col)) return;

        const existingIndex = path.findIndex(p => p.row === newCell.row && p.col === newCell.col);

        // If cell is already in path, handle backtracking
        if (existingIndex !== -1) {
             // Only backtrack, don't jump
            if (existingIndex === path.length - 2) {
                 setPath(prev => prev.slice(0, -1));
            }
            return;
        }

        const dx = Math.abs(newCell.row - lastCell.row);
        const dy = Math.abs(newCell.col - lastCell.col);
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            setPath(prev => [...prev, newCell]);
        }
    };

    const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (gameState !== 'playing') return;
        
        const cell = getCellFromEvent(e);
        if (cell) {
            const lastCell = path[path.length - 1];
            if(lastCell && cell.row === lastCell.row && cell.col === lastCell.col) {
                setIsDrawing(true);
            }
        }
    };

    const handleInteractionMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || gameState !== 'playing') return;
        
        e.preventDefault();
        const cell = getCellFromEvent(e);
        if (cell) {
            updatePath(cell);
        }
    };

    const handleInteractionEnd = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (isDrawing) setIsDrawing(false);
    };

    useEffect(() => {
        if (path.length === 0 || gameState !== 'playing') return;
        
        const lastPathCell = path[path.length - 1];
        
        const lastDot = currentPuzzle.dots.reduce((max, dot) => (dot.num > max.num ? dot : max), currentPuzzle.dots[0]);
        
        let allDotsPassed = true;
        for (const dot of currentPuzzle.dots) {
            if (!path.some(p => p.row === dot.row && p.col === dot.col)) {
                allDotsPassed = false;
                break;
            }
        }

        if (lastDot && lastPathCell.row === lastDot.row && lastPathCell.col === lastDot.col && allDotsPassed && path.length === currentPuzzle.totalCells) {
            setGameState('complete');
        }
    }, [path, currentPuzzle, gameState]);
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const displayedPath = gameState === 'idle' ? (currentPuzzle.solvedPath || []) : path;

    return (
        <Card className="w-full mx-auto p-4 md:p-6 bg-background rounded-xl shadow-lg border flex flex-col items-center">
            <div
                ref={gameContainerRef}
                className={cn(
                    'grid gap-0 aspect-square w-full touch-none relative select-none',
                    `grid-cols-${currentPuzzle.gridSize}`,
                    `grid-rows-${currentPuzzle.gridSize}`
                )}
                onMouseDown={handleInteractionStart}
                onMouseMove={handleInteractionMove}
                onMouseUp={handleInteractionEnd}
                onMouseLeave={handleInteractionEnd}
                onTouchStart={handleInteractionStart}
                onTouchMove={handleInteractionMove}
                onTouchEnd={handleInteractionEnd}
            >
                {/* Background Grid */}
                {Array.from({ length: currentPuzzle.gridSize * currentPuzzle.gridSize }).map((_, i) => (
                    <div key={i} className="bg-muted/30 rounded-sm" />
                ))}

                {/* Path visualization */}
                {displayedPath.map((cell, index) => {
                    const ratio = Math.min(1, (index / (currentPuzzle.totalCells - 1)));
                    const green = [0, 184, 132];
                    const blue = [0, 123, 255];
                    const r = Math.round(green[0] * (1 - ratio) + blue[0] * ratio);
                    const g = Math.round(green[1] * (1 - ratio) + blue[1] * ratio);
                    const b = Math.round(green[2] * (1 - ratio) + blue[2] * ratio);
                    const color = `rgb(${r}, ${g}, ${b})`;

                    const prevCell = displayedPath[index - 1];
                    const nextCell = displayedPath[index + 1];

                    const isTurn = prevCell && nextCell && (prevCell.row !== nextCell.row && prevCell.col !== nextCell.col);
                    const isEnd = !prevCell || !nextCell;
                    const borderRadiusClass = (isTurn || isEnd) ? 'rounded-sm' : '';

                    return (
                        <div
                            key={`${cell.row}-${cell.col}`}
                            className="path-cell"
                            style={{
                                top: `calc(${cell.row} * (100% / ${currentPuzzle.gridSize}))`,
                                left: `calc(${cell.col} * (100% / ${currentPuzzle.gridSize}))`,
                                width: `calc(100% / ${currentPuzzle.gridSize})`,
                                height: `calc(100% / ${currentPuzzle.gridSize})`,
                            }}
                           
                        >
                            <div className={cn("path-cell-center", borderRadiusClass)} style={{ backgroundColor: color }} />
                            
                             {prevCell && prevCell.row === cell.row && prevCell.col < cell.col && (
                                <div className="path-segment-horizontal" style={{ backgroundColor: `rgb(${Math.round(green[0] * (1 - (index - 1) / (currentPuzzle.totalCells - 1)) + blue[0] * ((index-1)/(currentPuzzle.totalCells-1)) )}, ${Math.round(green[1] * (1 - (index-1)/(currentPuzzle.totalCells-1)) + blue[1] * ((index-1)/(currentPuzzle.totalCells-1)))}, ${Math.round(green[2] * (1 - (index-1)/(currentPuzzle.totalCells-1)) + blue[2] * ((index-1)/(currentPuzzle.totalCells-1)))})`, right: '50%' }} />
                            )}
                            {nextCell && nextCell.row === cell.row && nextCell.col > cell.col && (
                                <div className="path-segment-horizontal" style={{ backgroundColor: color, left: '50%' }} />
                            )}
                             {prevCell && prevCell.row === cell.row && prevCell.col > cell.col && (
                                <div className="path-segment-horizontal" style={{ backgroundColor: `rgb(${Math.round(green[0] * (1 - (index - 1) / (currentPuzzle.totalCells - 1)) + blue[0] * ((index-1)/(currentPuzzle.totalCells-1)) )}, ${Math.round(green[1] * (1 - (index-1)/(currentPuzzle.totalCells-1)) + blue[1] * ((index-1)/(currentPuzzle.totalCells-1)))}, ${Math.round(green[2] * (1 - (index-1)/(currentPuzzle.totalCells-1)) + blue[2] * ((index-1)/(currentPuzzle.totalCells-1)))})`, left: '50%' }} />
                            )}
                            {nextCell && nextCell.row === cell.row && nextCell.col < cell.col && (
                                <div className="path-segment-horizontal" style={{ backgroundColor: color, right: '50%' }} />
                            )}

                             {prevCell && prevCell.col === cell.col && prevCell.row < cell.row && (
                                <div className="path-segment-vertical" style={{ backgroundColor: `rgb(${Math.round(green[0] * (1 - (index - 1) / (currentPuzzle.totalCells - 1)) + blue[0] * ((index-1)/(currentPuzzle.totalCells-1)) )}, ${Math.round(green[1] * (1 - (index-1)/(currentPuzzle.totalCells-1)) + blue[1] * ((index-1)/(currentPuzzle.totalCells-1)))}, ${Math.round(green[2] * (1 - (index-1)/(currentPuzzle.totalCells-1)) + blue[2] * ((index-1)/(currentPuzzle.totalCells-1)))})`, bottom: '50%' }} />
                            )}
                            {nextCell && nextCell.col === cell.col && nextCell.row > cell.row && (
                                <div className="path-segment-vertical" style={{ backgroundColor: color, top: '50%' }} />
                            )}
                             {prevCell && prevCell.col === cell.col && prevCell.row > cell.row && (
                                <div className="path-segment-vertical" style={{ backgroundColor: `rgb(${Math.round(green[0] * (1 - (index - 1) / (currentPuzzle.totalCells - 1)) + blue[0] * ((index-1)/(currentPuzzle.totalCells-1)) )}, ${Math.round(green[1] * (1 - (index-1)/(currentPuzzle.totalCells-1)) + blue[1] * ((index-1)/(currentPuzzle.totalCells-1)))}, ${Math.round(green[2] * (1 - (index-1)/(currentPuzzle.totalCells-1)) + blue[2] * ((index-1)/(currentPuzzle.totalCells-1)))})`, top: '50%' }} />
                            )}
                            {nextCell && nextCell.col === cell.col && nextCell.row < cell.row && (
                                <div className="path-segment-vertical" style={{ backgroundColor: color, bottom: '50%' }} />
                            )}
                        </div>
                    );
                })}
                
                {/* Dots - Rendered last to be on top */}
                {currentPuzzle.dots.map(dot => {
                    const isPassed = displayedPath.some(p => p.row === dot.row && p.col === dot.col);
                    return (
                        <div
                            key={dot.num}
                            className={cn('dot-container', isPassed ? 'dot-passed' : 'dot-future')}
                            style={{
                                top: `calc(${dot.row} * (100% / ${currentPuzzle.gridSize}))`,
                                left: `calc(${dot.col} * (100% / ${currentPuzzle.gridSize}))`,
                                width: `calc(100% / ${currentPuzzle.gridSize})`,
                                height: `calc(100% / ${currentPuzzle.gridSize})`,
                            }}
                        >
                            <div className="dot-bg"></div>
                            <span className="dot-number">{dot.num}</span>
                        </div>
                    );
                })}

                 {gameState === 'idle' && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg animate-in fade-in duration-500 z-20">
                        <h3 className="font-semibold text-lg mb-4 text-foreground">A quick challenge?</h3>
                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-full" onClick={startGame}>
                            <Play className="h-6 w-6 fill-current" />
                        </Button>
                    </div>
                )}


                {gameState === 'complete' && (
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg animate-in fade-in duration-500 z-20">
                        <div className="heart-animation">
                            <div className="heart"></div>
                            <div className="heart"></div>
                            <div className="heart"></div>
                            <div className="heart"></div>
                            <div className="heart"></div>
                        </div>
                        <div className="text-center text-white z-10">
                            <h2 className="text-3xl font-bold mb-2">Complete!</h2>
                            <p>Great job! Time: {formatTime(timer)}</p>
                            <Button variant="outline" size="icon" className="mt-4 rounded-full" onClick={startGame}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center gap-4 mt-6 w-full">
                <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm">
                    <TimerIcon className="h-4 w-4"/>
                    <span>{formatTime(timer)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="zip-button" onClick={handleUndo} disabled={path.length <= 1 || gameState !== 'playing'}>
                        <Undo className="h-4 w-4" />
                        <span className="sr-only">Undo</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="zip-button" onClick={startGame} disabled={gameState !== 'playing'}>
                        <RefreshCw className="h-4 w-4" />
                         <span className="sr-only">Reset</span>
                    </Button>
                </div>
            </div>
             
        </Card>
    );
}
