import React from 'react';
import { Download, LayoutGrid, FileText, Grid2X2, Files, FileStack } from 'lucide-react';
import { PLCState } from '../types';
import { PLCSheet } from './PLCSheet';
import { exportToPDF, exportIndividualPDFs } from '../utils/pdfService';

interface Props {
  state: PLCState;
  onLayoutChange: (layout: 1 | 2 | 4) => void;
}

export const Preview: React.FC<Props> = ({ state, onLayoutChange }) => {
  const [isExporting, setIsExporting] = React.useState(false);
  const [downloadMode, setDownloadMode] = React.useState<'all' | 'individual'>('all');
  const [selectedWeeks, setSelectedWeeks] = React.useState<Set<number>>(
    new Set((state.weeksData || []).map(w => w.weekNum))
  );

  // Sync selected weeks when weeksData changes
  React.useEffect(() => {
    setSelectedWeeks(new Set((state.weeksData || []).map(w => w.weekNum)));
  }, [state.weeksData]);

  const toggleWeek = (weekNum: number) => {
    const next = new Set(selectedWeeks);
    if (next.has(weekNum)) next.delete(weekNum);
    else next.add(weekNum);
    setSelectedWeeks(next);
  };

  const toggleAll = () => {
    if (selectedWeeks.size === (state.weeksData || []).length) {
      setSelectedWeeks(new Set());
    } else {
      setSelectedWeeks(new Set((state.weeksData || []).map(w => w.weekNum)));
    }
  };

  const handleDownload = async () => {
    const selectedData = (state.weeksData || []).filter(w => selectedWeeks.has(w.weekNum));
    if (selectedData.length === 0) return;

    setIsExporting(true);
    const baseName = state.header || 'PLC_Sheet';

    if (downloadMode === 'all') {
      // Group sheets for multi-page export
      const groupCount = Math.ceil(selectedData.length / state.sheetsPerPage);
      const groupIds = Array.from({ length: groupCount }, (_, i) => `sheet-group-${i}`);
      await exportToPDF(groupIds, `Selected_Weeks_${baseName}`);
    } else {
      const elements = selectedData.map(w => ({
        id: `sheet-week-${w.weekNum}`,
        name: `Week_${w.weekNum}_${baseName}`
      }));
      await exportIndividualPDFs(elements);
    }
    setIsExporting(false);
  };

  // Helper to chunk data
  const getChunks = <T,>(arr: T[], size: number): T[][] => {
    if (!arr) return [];
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  // Only chunk the selected weeks for the export groups
  const selectedData = (state.weeksData || []).filter(w => selectedWeeks.has(w.weekNum));
  const weekChunks = getChunks<any>(selectedData, state.sheetsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-800">Print Preview & Export</h3>
          <p className="text-sm text-gray-500">Choose layout and download high-resolution PDF.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Week Selection Buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100 max-w-md">
            <span className="text-xs font-bold text-gray-400 uppercase px-2">Weeks:</span>
            {(state.weeksData || []).map((w) => (
              <button
                key={w.weekNum}
                onClick={() => toggleWeek(w.weekNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                  selectedWeeks.has(w.weekNum)
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {w.weekNum}
              </button>
            ))}
          </div>

          <button
            onClick={toggleAll}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-all"
          >
            {selectedWeeks.size === (state.weeksData || []).length 
              ? `Deselect All (${(state.weeksData || []).length})` 
              : `Select All (${(state.weeksData || []).length})`}
          </button>

          {/* Layout Selection */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {[1, 2, 4].map((num) => (
              <button
                key={num}
                onClick={() => onLayoutChange(num as 1 | 2 | 4)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  state.sheetsPerPage === num 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title={`${num} sheet${num > 1 ? 's' : ''} per page`}
              >
                {num === 1 && <FileText size={18} />}
                {num === 2 && <LayoutGrid size={18} />}
                {num === 4 && <Grid2X2 size={18} />}
                <span className="font-bold text-sm">{num}-Up</span>
              </button>
            ))}
          </div>

          {/* Download Mode Selection */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setDownloadMode('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                downloadMode === 'all' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Download all sheets in one PDF"
            >
              <FileStack size={18} />
              <span className="font-bold text-sm">One Doc</span>
            </button>
            <button
              onClick={() => setDownloadMode('individual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                downloadMode === 'individual' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Download each sheet as a separate PDF"
            >
              <Files size={18} />
              <span className="font-bold text-sm">Individual</span>
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={20} />
            )}
            {isExporting ? 'Generating...' : `Download (${selectedWeeks.size})`}
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="overflow-x-auto pb-8">
        <div 
          id="pdf-export-container" 
          className="bg-gray-200 p-8 min-w-max flex flex-col gap-12"
        >
          {weekChunks.map((weekGroup, groupIdx) => (
            <div key={groupIdx} className="mx-auto shadow-2xl">
              {/* This inner div is what gets captured. It must be exactly A4 and have no shadow/border that adds to its size. */}
              <div 
                id={`sheet-group-${groupIdx}`}
                className="bg-white flex flex-wrap content-start overflow-hidden"
                style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}
              >
                {weekGroup.map((week) => (
                  <div 
                    key={week.weekNum} 
                    className="relative group"
                  >
                    <div 
                      id={`sheet-week-${week.weekNum}`}
                      className="bg-white"
                    >
                      <PLCSheet
                        header={state.header}
                        subheader={state.subheader}
                        term={state.term}
                        venue={state.venue}
                        week={week}
                        signatures={state.signatures}
                        sheetsPerPage={state.sheetsPerPage}
                      />
                    </div>
                    {/* Dimming Overlay */}
                    {!selectedWeeks.has(week.weekNum) && (
                      <div className="absolute inset-0 bg-white/60 z-5 pointer-events-none" />
                    )}
                    {/* Selection Overlay */}
                    <div className="absolute top-4 right-4 z-10 transition-opacity">
                      <button
                        onClick={() => toggleWeek(week.weekNum)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all border-2 ${
                          selectedWeeks.has(week.weekNum)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white/80 backdrop-blur-sm text-gray-400 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
                        }`}
                      >
                        {selectedWeeks.has(week.weekNum) ? (
                          <span className="font-bold text-lg">✓</span>
                        ) : (
                          <span className="font-bold text-lg">+</span>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
