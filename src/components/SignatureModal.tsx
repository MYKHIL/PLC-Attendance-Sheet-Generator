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
}

export const SignatureModal: React.FC<Props> = React.memo(({ name, isOpen, onClose, onSave }) => {
  const [mode, setMode] = useState<'draw' | 'camera' | 'upload' | 'crop'>('draw');
  const [penColor, setPenColor] = useState('#0000FF');
  const [isEraser, setIsEraser] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  // Cropping state
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [rotatedSrc, setRotatedSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [previousMode, setPreviousMode] = useState<'camera' | 'upload'>('upload');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Update rotated source when rotation or original image changes
  useEffect(() => {
    if (imageToCrop) {
      const updateRotatedSrc = async () => {
        const src = await getRotatedImage(imageToCrop, rotation);
        setRotatedSrc(src);
      };
      updateRotatedSrc();
    }
  }, [imageToCrop, rotation]);

  const getRotatedImage = async (imageSrc: string, rotation: number): Promise<string> => {
    if (rotation === 0 || rotation === 360) return imageSrc;
    
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageSrc;

    const rotRad = (rotation * Math.PI) / 180;
    const bWidth = Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
    const bHeight = Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

    canvas.width = bWidth;
    canvas.height = bHeight;

    ctx.translate(bWidth / 2, bHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);

    return canvas.toDataURL('image/png');
  };

  useEffect(() => {
    if (mode === 'camera' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, isOpen, facingMode]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setMode('draw');
    }
  };

  const toggleCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setImageToCrop(dataUrl);
        setPreviousMode('camera');
        setMode('crop');
      }
    }
  };

  const trimCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const l = pixels.data.length;
    let i;
    const bound = {
      top: null as number | null,
      left: null as number | null,
      right: null as number | null,
      bottom: null as number | null
    };
    let x, y;

    for (i = 0; i < l; i += 4) {
      if (pixels.data[i + 3] !== 0) {
        x = (i / 4) % canvas.width;
        y = Math.floor((i / 4) / canvas.width);

        if (bound.top === null || y < bound.top) bound.top = y;
        if (bound.left === null || x < bound.left) bound.left = x;
        if (bound.right === null || x > bound.right) bound.right = x;
        if (bound.bottom === null || y > bound.bottom) bound.bottom = y;
      }
    }

    if (bound.top === null || bound.left === null || bound.right === null || bound.bottom === null) {
      return canvas;
    }

    const trimHeight = bound.bottom - bound.top + 1;
    const trimWidth = bound.right - bound.left + 1;
    const trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

    const copy = document.createElement('canvas');
    copy.width = trimWidth;
    copy.height = trimHeight;
    const copyCtx = copy.getContext('2d');
    if (copyCtx) {
      copyCtx.putImageData(trimmed, 0, 0);
    }
    return copy;
  };

  const handleDrawSave = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      try {
        // Try to get trimmed canvas, fallback to manual trim if library fails
        const canvas = sigCanvas.current.getTrimmedCanvas();
        onSave(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn("getTrimmedCanvas failed, falling back to manual trim", err);
        const fullCanvas = sigCanvas.current.getCanvas();
        const trimmedCanvas = trimCanvas(fullCanvas);
        onSave(trimmedCanvas.toDataURL('image/png'));
      }
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImageToCrop(dataUrl);
        setPreviousMode('upload');
        setMode('crop');
        setCrop(undefined); // Reset crop for new image
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (crop) return;
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        3 / 1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const createCroppedImage = async (imageSrc: string, pixelCrop: PixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/png');
  };

  const whitenWithAI = async (base64Image: string) => {
    setIsAIProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const base64Data = base64Image.split(',')[1];
      const mimeType = base64Image.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: 'This is a signature. Your ONLY task is to make the background perfectly white (#FFFFFF). DO NOT alter the signature itself in any way—preserve its exact shape, every stroke, and its original color. Do not add, remove, or smooth any parts of the signature. The signature must remain identical to the original, just on a pure white background. Return ONLY the resulting image.',
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("AI Whitening failed:", error);
      alert("AI enhancement failed. Please try again or finalize as is.");
      return null;
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleCropSave = async () => {
    if (rotatedSrc && completedCrop) {
      const croppedImage = await createCroppedImage(rotatedSrc, completedCrop);
      if (croppedImage) {
        onSave(croppedImage);
        onClose();
      }
    }
  };

  const handleAIWhiten = async () => {
    if (rotatedSrc && completedCrop) {
      const croppedImage = await createCroppedImage(rotatedSrc, completedCrop);
      if (croppedImage) {
        const enhancedImage = await whitenWithAI(croppedImage);
        if (enhancedImage) {
          onSave(enhancedImage);
          onClose();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Signature for {name}</h3>
            <p className="text-sm text-gray-500">Choose your preferred method</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setMode('draw')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${mode === 'draw' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <PenTool size={18} /> Draw
            </button>
            <button
              onClick={() => setMode('camera')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${mode === 'camera' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Camera size={18} /> Camera
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${mode === 'upload' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Upload size={18} /> Upload
            </button>
            {imageToCrop && (
              <button
                onClick={() => setMode('crop')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${mode === 'crop' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <CropIcon size={18} /> Crop
              </button>
            )}
          </div>

        <div className="p-0 bg-gray-900 flex-1 relative overflow-hidden flex items-center justify-center">
          {mode === 'draw' && (
            <div className="w-full h-full bg-white flex flex-col">
              {/* Canvas Area */}
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
            </div>
          )}

          {mode === 'camera' && (
            <div className="w-full h-full bg-black relative">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <button 
                onClick={toggleCamera}
                className="absolute top-4 left-4 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-all"
                title="Switch Camera"
              >
                <RefreshCw size={24} />
              </button>
            </div>
          )}

          {mode === 'upload' && (
            <div className="w-full h-full p-6 bg-gray-50">
              <label className="w-full h-full border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-indigo-300 transition-all group">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <span className="mt-4 font-bold text-gray-700">Click to upload image</span>
                <span className="text-sm text-gray-400">PNG, JPG or WEBP</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
          )}

          {mode === 'crop' && rotatedSrc && (
            <div className="w-full h-full relative group bg-gray-900 flex items-center justify-center overflow-auto p-4">
              <div className="max-w-full max-h-full">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                >
                  <img
                    ref={imgRef}
                    src={rotatedSrc}
                    alt="Crop"
                    onLoad={onImageLoad}
                    style={{ 
                      maxHeight: '400px', 
                      transform: `scale(${zoom})`,
                    }}
                  />
                </ReactCrop>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-100 bg-white flex flex-col gap-3">
          {/* Row 1: Mode-specific Custom Controls */}
          {(mode === 'draw' || mode === 'crop') && (
            <div className="flex items-center justify-between gap-4 px-1">
              {mode === 'draw' && (
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
              )}

              {mode === 'crop' && (
                <div className="flex flex-wrap items-center gap-3 flex-grow">
                  <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg flex-grow min-w-[120px]">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Zoom</span>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="flex-grow h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg flex-grow min-w-[160px]">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rot</span>
                    <input
                      type="range"
                      value={rotation}
                      min={0}
                      max={360}
                      step={1}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="flex-grow h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex items-center border-l border-gray-200 ml-1 pl-2">
                      <input
                        type="number"
                        value={rotation}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setRotation(isNaN(val) ? 0 : val % 361);
                        }}
                        className="w-8 text-[10px] bg-transparent border-none focus:ring-0 font-bold text-gray-700 p-0 text-center"
                      />
                      <span className="text-[9px] text-gray-400 font-bold">°</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Rotate 90°"
                  >
                    <RotateCw size={18} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Row 2: Action Buttons */}
          <div className="flex justify-between items-center pt-1 border-t border-gray-50">
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              {mode === 'draw' && (
                <button
                  onClick={() => sigCanvas.current?.clear()}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Clear Canvas"
                >
                  <RefreshCw size={18} />
                </button>
              )}

              {mode === 'crop' && (
                <button
                  onClick={() => {
                    setImageToCrop(null);
                    setMode(previousMode);
                    setRotation(0);
                  }}
                  className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                  title="Discard"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {mode === 'draw' && (
                <button
                  onClick={handleDrawSave}
                  className="px-5 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2"
                >
                  <Check size={16} />
                  Save
                </button>
              )}

              {mode === 'camera' && (
                <button
                  onClick={takeSnapshot}
                  className="px-5 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-2"
                >
                  <Camera size={16} />
                  Capture
                </button>
              )}

              {mode === 'crop' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAIWhiten}
                    disabled={isAIProcessing}
                    className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 text-sm font-bold rounded-lg hover:bg-indigo-50 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAIProcessing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Sparkles size={18} />
                    )}
                    AI Whiten
                  </button>
                  <button
                    onClick={handleCropSave}
                    disabled={isAIProcessing}
                    className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check size={18} />
                    Finalize
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
