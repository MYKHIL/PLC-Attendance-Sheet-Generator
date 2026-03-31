import { useState, useCallback } from 'react';
import { PLCState, MeetingWeek } from '../types';
import { getWednesdayOfWeek, formatDate, generateTopics, shuffleArray } from '../utils/logicUtils';

const INITIAL_STATE: PLCState = {
  header: '',
  subheader: '',
  term: '',
  venue: '',
  reopeningDate: new Date().toISOString().split('T')[0],
  teachers: [],
  weeksData: [],
  signatures: {},
  sheetsPerPage: 1,
  teachersRaw: '',
  weekCount: '12'
};

export const usePLCState = () => {
  const [state, setState] = useState<PLCState>(() => {
    const saved = localStorage.getItem('plc_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_STATE,
          ...parsed,
          teachers: Array.isArray(parsed.teachers) ? parsed.teachers : INITIAL_STATE.teachers,
          weeksData: Array.isArray(parsed.weeksData) ? parsed.weeksData : INITIAL_STATE.weeksData,
          signatures: parsed.signatures || INITIAL_STATE.signatures,
        };
      } catch (e) {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const updateState = useCallback((updates: Partial<PLCState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      localStorage.setItem('plc_state', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const generateSchedule = useCallback((numWeeks: number) => {
    const startWed = getWednesdayOfWeek(state.reopeningDate);
    const topics = generateTopics(numWeeks);
    
    const newWeeks: MeetingWeek[] = Array.from({ length: numWeeks }, (_, i) => {
      const date = new Date(startWed);
      date.setDate(startWed.getDate() + (i * 7));
      return {
        weekNum: i + 1,
        date: formatDate(date),
        topic: topics[i],
        shuffledTeachers: shuffleArray(state.teachers)
      };
    });

    updateState({ weeksData: newWeeks, weekCount: String(numWeeks) });
  }, [state.reopeningDate, state.teachers, updateState]);

  const exportState = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plc_config_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importState = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setState(imported);
        localStorage.setItem('plc_state', JSON.stringify(imported));
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const addTeacher = (name: string) => {
    if (!name.trim()) return;
    updateState({
      teachers: [...state.teachers, name.trim()]
    });
  };

  const removeTeacher = (index: number) => {
    const newTeachers = [...state.teachers];
    const removedTeacher = newTeachers.splice(index, 1)[0];
    
    // Also remove signature if it exists
    const newSignatures = { ...state.signatures };
    delete newSignatures[removedTeacher];

    updateState({
      teachers: newTeachers,
      signatures: newSignatures
    });
  };

  return { state, updateState, generateSchedule, exportState, importState, addTeacher, removeTeacher };
};
