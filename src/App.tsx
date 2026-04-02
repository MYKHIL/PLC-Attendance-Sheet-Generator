import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  School, 
  Users, 
  CalendarDays, 
  Eye, 
  Download, 
  Upload, 
  ChevronRight, 
  ChevronLeft,
  FileJson,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';
import { usePLCState } from './hooks/usePLCState';
import { SignatureManager } from './components/SignatureManager';
import { TopicEditor } from './components/TopicEditor';
import { Preview } from './components/Preview';
import { Step } from './types';

export default function App() {
  const { state, updateState, generateSchedule, exportState, importState, addTeacher, removeTeacher, updateTeacher } = usePLCState();
  const [currentStep, setCurrentStep] = React.useState<Step>('identity');
  const [newTeacherName, setNewTeacherName] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingTeacher, setEditingTeacher] = React.useState<{ index: number; name: string } | null>(null);
  const [deletingTeacher, setDeletingTeacher] = React.useState<{ index: number; name: string } | null>(null);

  const filteredTeachers = state.teachers
    .map((name, index) => ({ name, originalIdx: index }))
    .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeacherName.trim()) {
      addTeacher(newTeacherName);
      setNewTeacherName('');
    }
  };

  const steps = [
    { id: 'identity', label: 'Identity', icon: School },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'preview', label: 'Preview', icon: Eye },
  ];

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      importState(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <FileJson size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-800">PLC Sheet <span className="text-indigo-600">Pro</span></span>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors">
              <Upload size={18} />
              Import JSON
              <input type="file" className="hidden" accept=".json" onChange={handleImport} />
            </label>
            <button
              onClick={exportState}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-all"
            >
              <Download size={18} />
              Export State
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = steps.findIndex(s => s.id === currentStep) > idx;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setCurrentStep(step.id as Step)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110' 
                        : isPast 
                          ? 'bg-indigo-100 text-indigo-600' 
                          : 'bg-white text-gray-400 border border-gray-200'
                    }`}>
                      <Icon size={24} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${
                      isActive ? 'text-indigo-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div className="h-px w-8 sm:w-16 bg-gray-200 mt-[-20px]" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[60vh]"
          >
            {currentStep === 'identity' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">School Name (Header)</label>
                    <div className="relative">
                      <School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={state.header}
                        onChange={(e) => updateState({ header: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-200 focus:bg-white rounded-xl outline-none transition-all font-medium"
                        placeholder="Enter school name..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">District (Subheader)</label>
                    <div className="relative">
                      <School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={state.subheader}
                        onChange={(e) => updateState({ subheader: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-200 focus:bg-white rounded-xl outline-none transition-all font-medium"
                        placeholder="Enter district..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Term</label>
                    <input
                      type="text"
                      value={state.term}
                      onChange={(e) => updateState({ term: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-200 focus:bg-white rounded-xl outline-none transition-all font-medium"
                      placeholder="e.g. Second Term"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Venue</label>
                    <input
                      type="text"
                      value={state.venue}
                      onChange={(e) => updateState({ venue: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-200 focus:bg-white rounded-xl outline-none transition-all font-medium"
                      placeholder="e.g. Staff Room"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Reopening Date</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="date"
                        value={state.reopeningDate}
                        onChange={(e) => updateState({ reopeningDate: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-200 focus:bg-white rounded-xl outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Teachers List</label>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{state.teachers.length} Staff Members</span>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none transition-all font-medium"
                        placeholder="Search staff members..."
                      />
                    </div>

                    <form onSubmit={handleAddTeacher} className="flex gap-2">
                      <div className="relative flex-grow">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={newTeacherName}
                          onChange={(e) => setNewTeacherName(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-indigo-200 focus:bg-white rounded-xl outline-none transition-all font-medium"
                          placeholder="Enter teacher name..."
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        <Plus size={20} />
                        Add Staff
                      </button>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
                      <AnimatePresence>
                        {filteredTeachers.map(({ name, originalIdx }) => {
                          return (
                          <motion.div
                            key={`${name}-${originalIdx}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => {
                              const element = document.getElementById(`sig-card-${name}`);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm group hover:border-indigo-200 transition-all cursor-pointer"
                          >
                            <span className="font-medium text-gray-700 truncate">{name}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTeacher({ index: originalIdx, name });
                                }}
                                className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingTeacher({ index: originalIdx, name });
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </motion.div>
                        )})}
                      </AnimatePresence>
                      {filteredTeachers.length === 0 && (
                        <div className="col-span-full py-8 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                          {state.teachers.length === 0 ? 'No staff members added yet.' : 'No staff members match your search.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <SignatureManager 
                  teachers={state.teachers}
                  signatures={state.signatures}
                  onChange={(signatures) => updateState({ signatures })} 
                  searchTerm={searchTerm}
                />
              </div>
            )}

            {currentStep === 'schedule' && (
              <TopicEditor 
                weeks={state.weeksData} 
                onWeeksChange={(weeksData) => updateState({ weeksData })}
                onRegenerate={generateSchedule}
              />
            )}

            {currentStep === 'preview' && (
              <Preview 
                state={state} 
                onLayoutChange={(sheetsPerPage) => updateState({ sheetsPerPage })}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-12 flex justify-between items-center">
          <button
            onClick={() => {
              const idx = steps.findIndex(s => s.id === currentStep);
              if (idx > 0) setCurrentStep(steps[idx - 1].id as Step);
            }}
            disabled={currentStep === 'identity'}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 font-bold hover:text-indigo-600 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          
          <button
            onClick={() => {
              const idx = steps.findIndex(s => s.id === currentStep);
              if (idx < steps.length - 1) {
                if (currentStep === 'identity' && (state.weeks?.length || 0) === 0) {
                  generateSchedule(12); // Default to 12 weeks if none generated
                }
                setCurrentStep(steps[idx + 1].id as Step);
              }
            }}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
          >
            {currentStep === 'preview' ? 'Ready to Print' : 'Next Step'}
            <ChevronRight size={20} />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-400 font-medium tracking-widest uppercase">
          &copy; 2026 PLC Meeting Sheet System &bull; Professional Edition
        </p>
      </footer>

      {deletingTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Teacher</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove {deletingTeacher.name}? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingTeacher(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeTeacher(deletingTeacher.index);
                  setDeletingTeacher(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Teacher Name</h3>
            <input
              type="text"
              value={editingTeacher.name}
              onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setEditingTeacher(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateTeacher(editingTeacher.index, editingTeacher.name);
                  setEditingTeacher(null);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
