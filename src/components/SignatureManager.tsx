import React, { useState } from 'react';
import { Upload, PenTool, Camera, Trash2 } from 'lucide-react';
import { SignatureModal } from './SignatureModal';

interface Props {
  teachers: string[];
  signatures: Record<string, string>;
  onChange: (signatures: Record<string, string>) => void;
}

export const SignatureManager: React.FC<Props> = ({ teachers, signatures, onChange }) => {
  const [activeTeacher, setActiveTeacher] = useState<string | null>(null);

  const handleSaveSignature = (signature: string) => {
    if (activeTeacher) {
      onChange({
        ...signatures,
        [activeTeacher]: signature
      });
    }
  };

  const removeSignature = (name: string) => {
    const newSignatures = { ...signatures };
    delete newSignatures[name];
    onChange(newSignatures);
  };

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
              {signatures[name] && (
                <button
                  onClick={() => removeSignature(name)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="relative group aspect-[3/1] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {signatures[name] ? (
                <>
                  <img src={signatures[name]} alt="Signature" className="max-h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setActiveTeacher(name)}
                      className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 shadow-lg"
                    >
                      <PenTool size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setActiveTeacher(name)}
                  className="flex flex-col items-center text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  <div className="flex gap-2">
                    <PenTool size={20} />
                    <Camera size={20} />
                    <Upload size={20} />
                  </div>
                  <span className="text-xs mt-2 font-medium">Add Signature</span>
                </button>
              )}
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
          onClose={() => setActiveTeacher(null)}
          onSave={handleSaveSignature}
        />
      )}
    </div>
  );
};
