'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Pen, Check } from 'lucide-react';

interface SignaturePadProps {
    onSign: (signatureData: string) => void;
}

export function SignaturePad({ onSign }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    const clear = () => {
        sigCanvas.current?.clear();
        setIsEmpty(true);
    };

    const save = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            // Trim whitespace from signature
            const data = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            onSign(data);
        }
    };

    const handleEnd = () => {
        if (sigCanvas.current) {
            setIsEmpty(sigCanvas.current.isEmpty());
        }
    };

    return (
        <div className="border border-white/10 bg-[#050505] p-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-400">
                    <Pen size={14} />
                    <span className="font-mono text-xs uppercase tracking-wider">Digital Input</span>
                </div>
                {/* Crosshairs */}
                <div className="flex gap-1 opacity-50">
                    <div className="w-1 h-1 bg-blue-500" />
                    <div className="w-1 h-1 bg-blue-500" />
                    <div className="w-1 h-1 bg-blue-500" />
                </div>
            </div>

            <div className="relative border-2 border-dashed border-white/10 bg-[#111] mb-6 hover:border-blue-500/50 transition-colors group">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="#3B82F6" // Blue-500
                    backgroundColor="transparent"
                    canvasProps={{
                        className: 'w-full h-48 cursor-crosshair relative z-10',
                    }}
                    onEnd={handleEnd}
                />

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-4xl font-mono font-bold text-white/5 uppercase tracking-widest rotate-[-12deg]">
                        Sign Here
                    </span>
                </div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-5"
                    style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={clear}
                    className="flex items-center gap-2 text-xs font-mono text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider"
                >
                    <Eraser size={14} />
                    Reset_Pad
                </button>

                <button
                    onClick={save}
                    disabled={isEmpty}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold py-3 px-6 rounded uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
                >
                    <span>Accept & Initialize</span>
                    <Check size={14} />
                </button>
            </div>
        </div>
    );
}
