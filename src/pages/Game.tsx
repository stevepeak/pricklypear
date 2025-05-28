import React, { useRef, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Very lightweight "Zen Cactus Defense" mini game using HTML Canvas
export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch (err) {
      console.error(err);
      return;
    }
    if (!ctx) return;

    let animationId: number;
    const width = canvas.width;
    const height = canvas.height;

    const player = { x: width / 2, y: height - 30, size: 20 };
    const messages: { x: number; y: number; type: "calm" | "thorny" }[] = [];
    let frame = 0;
    let hits = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") player.x -= 15;
      if (e.key === "ArrowRight") player.x += 15;
    };
    window.addEventListener("keydown", handleKeyDown);

    const reset = () => {
      messages.length = 0;
      frame = 0;
      hits = 0;
      setScore(0);
      setGameOver(false);
    };

    const loop = () => {
      animationId = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, width, height);

      // spawn new messages
      if (frame % 40 === 0) {
        messages.push({
          x: Math.random() * (width - 20) + 10,
          y: -20,
          type: Math.random() > 0.7 ? "calm" : "thorny",
        });
      }

      // update and draw messages
      messages.forEach((m) => {
        m.y += 2;
        ctx.fillStyle = m.type === "calm" ? "#4ade80" : "#f87171";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(m.type === "calm" ? "calm" : "thorn", m.x, m.y);
      });

      // collision detection
      messages.forEach((m) => {
        if (
          m.y > player.y - player.size &&
          m.y < player.y + player.size &&
          Math.abs(m.x - player.x) < player.size
        ) {
          if (m.type === "calm") setScore((s) => s + 1);
          else hits += 1;
          m.y = height + 10; // remove
        }
      });

      // remove off-screen messages
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].y > height + 20) messages.splice(i, 1);
      }

      // draw player
      ctx.fillStyle = "#0ea5e9";
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
      ctx.fill();

      frame++;

      if (hits > 5) {
        setGameOver(true);
        cancelAnimationFrame(animationId);
      }
    };

    reset();
    loop();
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Zen Cactus Defense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-muted-foreground">
            Dodge thorny thoughts and collect calming ones. Use your arrow keys
            to move the cactus.
          </div>
          <canvas
            ref={canvasRef}
            width={300}
            height={200}
            className="border w-full"
            data-testid="game-canvas"
          />
          <div className="mt-2 flex justify-between text-sm">
            <span>Score: {score}</span>
            {gameOver && <span>Game Over</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
