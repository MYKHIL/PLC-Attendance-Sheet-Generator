import React from 'react';
import { MeetingWeek } from '../types';
import { useDynamicScaling } from '../hooks/useDynamicScaling';

interface Props {
  header: string;
  subheader: string;
  term: string;
  venue: string;
  week: MeetingWeek;
  signatures: Record<string, string[]>;
  sheetsPerPage: 1 | 2 | 4;
}

export const PLCSheet: React.FC<Props> = ({ header, subheader, term, venue, week, signatures, sheetsPerPage }) => {
  const scaling = useDynamicScaling(week.shuffledTeachers?.length || 0, sheetsPerPage);

  return (
    <div 
      className="bg-white overflow-hidden"
      style={{ 
        width: sheetsPerPage === 4 ? '105mm' : '210mm', 
        height: sheetsPerPage === 1 ? '297mm' : '148.5mm',
        padding: scaling.padding,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        border: '0.1mm solid #e5e7eb' // Very thin border that won't distort layout
      }}
    >
      {/* Header */}
      <div className="text-center" style={{ marginBottom: `${parseInt(scaling.margin) * 1.5}px` }}>
        <div className="flex flex-col" style={{ gap: `${parseInt(scaling.fontSize) * 0.2}px` }}>
          <h1 
            className="font-bold text-gray-900 uppercase tracking-wide"
            style={{ fontSize: scaling.titleSize, fontFamily: "'Playfair Display', serif" }}
          >
            {header || 'SCHOOL NAME'}
          </h1>
          <h2 className="font-semibold text-gray-700" style={{ fontSize: scaling.labelSize }}>
            {subheader || 'DISTRICT NAME'}
          </h2>
          <div className="flex justify-center gap-12 font-bold text-gray-600 uppercase" style={{ fontSize: scaling.fontSize }}>
            <span>{term || 'TERM'}</span>
            <span>VENUE: {venue || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex justify-between items-end border-b-2 border-gray-800" style={{ marginBottom: `${parseInt(scaling.margin) * 0.5}px`, paddingBottom: `${parseInt(scaling.padding) * 0.5}px` }}>
        <div className="flex items-baseline gap-4">
          <span className="font-bold uppercase" style={{ fontSize: scaling.fontSize }}>Topic:</span>
          <span className="text-gray-800" style={{ fontSize: scaling.fontSize }}>{week.topic}</span>
        </div>
        <div className="flex gap-8 whitespace-nowrap">
          <div className="flex items-baseline gap-4">
            <span className="font-bold uppercase" style={{ fontSize: scaling.fontSize }}>Date:</span>
            <span style={{ fontSize: scaling.fontSize }}>{week.date}</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="font-bold uppercase" style={{ fontSize: scaling.fontSize }}>Week:</span>
            <span style={{ fontSize: scaling.fontSize }}>{week.weekNum}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-grow overflow-hidden border border-gray-800" style={{ marginTop: '0px' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50" style={{ height: '60px' }}>
              <th className="border border-gray-800 py-4 text-left uppercase font-bold" style={{ width: '40px', fontSize: scaling.fontSize, paddingLeft: '20px', paddingRight: '20px' }}>S/N</th>
              <th className="border border-gray-800 py-4 text-left uppercase font-bold" style={{ fontSize: scaling.fontSize, paddingLeft: '20px', paddingRight: '20px' }}>Staff Name</th>
              <th className="border border-gray-800 py-4 text-left uppercase font-bold" style={{ width: '30%', fontSize: scaling.fontSize, paddingLeft: '20px', paddingRight: '20px' }}>Signature</th>
            </tr>
          </thead>
          <tbody>
            {(week.shuffledTeachers || []).map((name, idx) => {
              const teacherSigs = signatures[name] || [];
              const selectedSig = teacherSigs.length > 0 
                ? teacherSigs[week.weekNum % teacherSigs.length] 
                : null;
              
              return (
                <tr key={idx}>
                  <td className="border border-gray-800 py-2 font-mono whitespace-nowrap text-center" style={{ fontSize: scaling.fontSize, paddingLeft: '10px', paddingRight: '10px' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="border border-gray-800 py-2 font-medium" style={{ fontSize: scaling.fontSize, paddingLeft: '20px', paddingRight: '20px' }}>
                    {name}
                  </td>
                  <td className="border border-gray-800 p-1 flex items-center justify-center" style={{ height: scaling.rowHeight }}>
                    {selectedSig && (
                      <img 
                        src={selectedSig} 
                        alt="Sig" 
                        className="max-h-full max-w-full object-scale-down"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer removed as requested */}
    </div>
  );
};
