import React, { useRef, useState, useEffect, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Camera, PenTool, Upload, RefreshCw, Check, Eraser, Crop as CropIcon, Trash2, RotateCw, Sparkles, Loader2 } from 'lucide-react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { GoogleGenAI } from "@google/genai";

interface Props {
  name: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  initialSignature?: string;
}

export const SignatureModal: React.FC<Props> = React.memo(({ name, isOpen, onClose, onSave, initialSignature }) => {
  const [penColor, setPenColor] = useState('#0000FF');
  const [isEraser, setIsEraser] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (isOpen && sigCanvas.current && initialSignature) {
      sigCanvas.current.fromDataURL(initialSignature);
    }
  }, [isOpen, initialSignature]);

  const handleSave = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      onSave(sigCanvas.current.toDataURL('image/png'));
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col h-[500px] max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Signature for {name}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow relative bg-white overflow-hidden">
          <SignatureCanvas
            ref={sigCanvas}
            penColor={isEraser ? 'white' : penColor}
            canvasProps={{ 
              className: 'w-full h-full cursor-crosshair block',
              style: { width: '100%', height: '100%' }
            }}
          />
        </div>

        <div className="p-3 border-t border-gray-100 bg-white flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 px-1">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {[
                  { name: 'Black', value: 'black' },
                  { name: 'Blue', value: '#0000FF' },
                  { name: 'Red', value: '#FF0000' }
                ].map(color => (
                  <button
                    key={color.value}
                    onClick={() => { setPenColor(color.value); setIsEraser(false); }}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${!isEraser && penColor === color.value ? 'border-indigo-600 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
              <button
                onClick={() => setIsEraser(!isEraser)}
                className={`p-1.5 rounded-lg transition-all ${isEraser ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-100'}`}
                title="Eraser"
              >
                <Eraser size={18} />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-gray-50">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => sigCanvas.current?.clear()}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Clear Canvas"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2"
            >
              <Check size={16} />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
