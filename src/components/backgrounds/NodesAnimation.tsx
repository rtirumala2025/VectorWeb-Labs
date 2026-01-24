'use client';

import { useEffect, useRef } from 'react';

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
}

interface NodesAnimationProps {
    className?: string;
    nodeCount?: number;
    connectionDistance?: number;
    nodeColor?: string;
    lineColor?: string;
}

export function NodesAnimation({
    className = '',
    nodeCount = 50,
    connectionDistance = 150,
    nodeColor = 'rgba(0, 71, 255, 0.8)',
    lineColor = 'rgba(0, 71, 255, 0.15)',
}: NodesAnimationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodesRef = useRef<Node[]>([]);
    const animationRef = useRef<number>();
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        const initNodes = () => {
            nodesRef.current = Array.from({ length: nodeCount }, () => ({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
            }));
        };

        const animate = () => {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

            const nodes = nodesRef.current;

            // Update positions
            nodes.forEach((node) => {
                node.x += node.vx;
                node.y += node.vy;

                // Bounce off edges
                if (node.x < 0 || node.x > canvas.offsetWidth) node.vx *= -1;
                if (node.y < 0 || node.y > canvas.offsetHeight) node.vy *= -1;

                // Mouse attraction
                const dx = mouseRef.current.x - node.x;
                const dy = mouseRef.current.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 200 && dist > 0) {
                    node.vx += (dx / dist) * 0.02;
                    node.vy += (dy / dist) * 0.02;
                }

                // Speed limit
                const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
                if (speed > 1) {
                    node.vx = (node.vx / speed) * 1;
                    node.vy = (node.vy / speed) * 1;
                }
            });

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        const opacity = 1 - dist / connectionDistance;
                        ctx.beginPath();
                        ctx.strokeStyle = lineColor.replace('0.15', String(0.15 * opacity));
                        ctx.lineWidth = 1;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            nodes.forEach((node) => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = nodeColor;
                ctx.fill();

                // Glow effect
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
                ctx.fillStyle = nodeColor.replace('0.8', '0.1');
                ctx.fill();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        resizeCanvas();
        initNodes();
        animate();

        window.addEventListener('resize', resizeCanvas);
        canvas.addEventListener('mousemove', handleMouseMove);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [nodeCount, connectionDistance, nodeColor, lineColor]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full ${className}`}
            style={{ opacity: 0.8 }}
        />
    );
}

export default NodesAnimation;
