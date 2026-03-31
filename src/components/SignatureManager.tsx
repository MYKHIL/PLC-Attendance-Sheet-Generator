import React, { useState } from 'react';
import { Upload, PenTool, Camera, Trash2, Plus } from 'lucide-react';
import { SignatureModal } from './SignatureModal';

interface Props {
  teachers: string[];
  signatures: Record<string, string[]>;
  onChange: (signatures: Record<string, string[]>) => void;
}

export const SignatureManager: React.FC<Props> = ({ teachers, signatures, onChange }) => {
  const [activeTeacher, setActiveTeacher] = useState<string | null>(null);

  const handleSaveSignature = React.useCallback((signature: string) => {
    if (activeTeacher) {
      onChange({
        ...signatures,
        [activeTeacher]: [...(signatures[activeTeacher] || []), signature]
      });
    }
  }, [activeTeacher, signatures, onChange]);

  const removeSignature = (name: string, index: number) => {
    const newSignatures = { ...signatures };
    if (Array.isArray(newSignatures[name])) {
      newSignatures[name] = newSignatures[name].filter((_, i) => i !== index);
      if (newSignatures[name].length === 0) {
        delete newSignatures[name];
      }
      onChange(newSignatures);
    }
  };

  const handleClose = React.useCallback(() => {
    setActiveTeacher(null);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Staff Signatures</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(teachers || []).map((name) => (
          <div key={name} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-700">{name}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(Array.isArray(signatures[name]) ? signatures[name] : []).map((sig, idx) => (
                <div key={idx} className="relative group aspect-[3/1] bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={sig} alt="Signature" className="max-h-full object-contain" />
                  <button
                    onClick={() => removeSignature(name, idx)}
                    className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setActiveTeacher(name)}
                className="aspect-[3/1] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-indigo-500 hover:border-indigo-300 transition-all"
              >
                <Plus size={20} />
                <span className="text-xs mt-1 font-medium">Add</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {(teachers?.length || 0) === 0 && (
        <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500">
          No teachers added yet. Enter names in the list above.
        </div>
      )}

      {activeTeacher && (
        <SignatureModal
          name={activeTeacher}
          isOpen={!!activeTeacher}
          onClose={handleClose}
          onSave={handleSaveSignature}
        />
      )}
    </div>
  );
};
