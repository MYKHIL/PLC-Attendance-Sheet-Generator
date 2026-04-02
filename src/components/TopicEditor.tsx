import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { MeetingWeek } from '../types';

interface Props {
  weeks: MeetingWeek[];
  onWeeksChange: (weeks: MeetingWeek[]) => void;
  onRegenerate: (count: number) => void;
}

export const TopicEditor: React.FC<Props> = ({ weeks, onWeeksChange, onRegenerate }) => {
  const [weekCount, setWeekCount] = React.useState((weeks?.length) || 12);

  const updateTopic = (index: number, topic: string) => {
    const newWeeks = [...weeks];
    newWeeks[index] = { ...newWeeks[index], topic };
    onWeeksChange(newWeeks);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-800">Meeting Schedule</h3>
          <p className="text-sm text-gray-500">Adjust topics and week count for the term.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <Calendar size={18} className="text-gray-400" />
            <input
              type="number"
              min="1"
              max="52"
              value={weekCount}
              onChange={(e) => setWeekCount(parseInt(e.target.value) || 1)}
              className="w-12 bg-transparent outline-none font-medium"
            />
            <span className="text-sm text-gray-500">Weeks</span>
          </div>
          <button
            onClick={() => onRegenerate(weekCount)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <RefreshCw size={18} />
            Generate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(weeks || []).map((week, idx) => (
          <div key={idx} className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2 gap-2">
              <div className="flex items-center gap-1">
                <span className="font-bold text-indigo-600">Week</span>
                <input
                  type="number"
                  value={week.weekNum}
                  onChange={(e) => {
                    const newWeeks = [...weeks];
                    newWeeks[idx] = { ...newWeeks[idx], weekNum: parseInt(e.target.value) || 0 };
                    onWeeksChange(newWeeks);
                  }}
                  className="font-bold text-indigo-600 bg-transparent w-12 outline-none"
                />
              </div>
              <input
                type="date"
                value={week.date}
                onChange={(e) => {
                  const newWeeks = [...weeks];
                  newWeeks[idx] = { ...newWeeks[idx], date: e.target.value };
                  onWeeksChange(newWeeks);
                }}
                className="text-sm text-gray-500 font-medium bg-transparent outline-none"
              />
            </div>
            <textarea
              value={week.topic}
              onChange={(e) => updateTopic(idx, e.target.value)}
              className="w-full p-3 bg-gray-50 border border-transparent focus:border-indigo-200 focus:bg-white rounded-lg outline-none transition-all resize-none text-sm leading-relaxed"
              rows={3}
              placeholder="Enter meeting topic..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};
