import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const BackgroundElements = ({ mousePos }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef(mousePos);

  useEffect(() => {
    mouseRef.current = mousePos;
  }, [mousePos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let nodes = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Node {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) { this.x -= dx * 0.01; this.y -= dy * 0.01; }
      }
    }

    const init = () => {
      resize();
      nodes = Array.from({ length: 100 }, () => new Node());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.2;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x; const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.8 - dist / 150})`;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
        nodes[i].update();
        ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(nodes[i].x, nodes[i].y, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    init(); draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#020202]">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />
      <motion.div
        animate={{ rotate: [0, 5], scale: [1, 1.05, 1] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 69.28 0 51.96V17.32L30 0z' fill='none' stroke='%23ffffff' stroke-width='1.5'/%3E%3C/svg%3E")`, backgroundSize: '80px 138px' }}
      />
      <motion.div
        animate={{ x: mousePos.x - 400, y: mousePos.y - 400 }}
        transition={{ type: "spring", damping: 50, stiffness: 30 }}
        className="absolute w-[800px] h-[800px] bg-red-600/[0.15] blur-[180px] rounded-full"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
    </div>
  );
};

export default BackgroundElements;
