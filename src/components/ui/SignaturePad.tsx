'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Pen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
        <div className="border border-steel bg-void p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-cobalt">
                    <Pen size={14} />
                    <span className="font-mono text-xs uppercase tracking-wider">Digital Signature</span>
                </div>
                {/* Crosshairs */}
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-cobalt" />
                    <div className="w-1 h-1 bg-cobalt" />
                    <div className="w-1 h-1 bg-cobalt" />
                </div>
            </div>

            <div className="relative border-2 border-dashed border-steel bg-[#1a1a1a] mb-4 hover:border-cobalt transition-colors">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="#0047FF"
                    backgroundColor="transparent"
                    canvasProps={{
                        className: 'w-full h-40 cursor-crosshair',
                    }}
                    onEnd={handleEnd}
                />

                {/* Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-10"
                    style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}
                />
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={clear}
                    className="flex items-center gap-2 text-xs font-mono text-red-500 hover:text-red-400 transition-colors"
                >
                    <Eraser size={12} />
                    CLEAR_PAD
                </button>

                <Button
                    variant="primary"
                    onClick={save}
                    disabled={isEmpty}
                    size="sm"
                >
                    CONFIRM_SIGNATURE
                </Button>
            </div>
        </div>
    );
}
