
import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, ChevronRight } from 'lucide-react';
import { getMedicalRecords, addMedicalRecord } from '../services/storageService';
import { MedicalRecord } from '../types';
import { useAuth } from '../context/AuthContext';

export const Medical: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<MedicalRecord>>({ type: 'General' });

  useEffect(() => {
    if (user) {
        setRecords(getMedicalRecords(user.id));
    }
  }, [user]);

  const handleSave = () => {
    if (!newRecord.title || !newRecord.description || !user) return;
    
    const record: MedicalRecord = {
        id: Date.now().toString(),
        userId: user.id,
        title: newRecord.title,
        description: newRecord.description,
        type: newRecord.type as any,
        date: new Date().toISOString(),
    };

    addMedicalRecord(user.id, record);
    setRecords(getMedicalRecords(user.id));
    setShowAdd(false);
    setNewRecord({ type: 'General' });
  };

  return (
    <div className="pb-24 px-6 pt-8 max-w-md mx-auto h-full overflow-y-auto relative">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-gray-800 font-rounded">Medical Vault</h1>
         <button 
            onClick={() => setShowAdd(true)}
            className="w-10 h-10 bg-pink-500 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
         >
            <Plus size={24} />
         </button>
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {['All', 'Prescriptions', 'Doctors', 'Allergies'].map((cat) => (
            <button key={cat} className="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm whitespace-nowrap hover:bg-pink-50 hover:border-pink-200 hover:text-pink-600 transition-colors">
                {cat}
            </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4 mt-2">
        {records.length === 0 ? (
            <div className="text-center py-12">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-400">No records yet.</p>
                <p className="text-xs text-gray-300">Tap + to add prescriptions or notes.</p>
            </div>
        ) : (
            records.map(rec => (
                <div key={rec.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${rec.type === 'Prescription' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
                        <FileText size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{rec.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{rec.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <Calendar size={12} />
                            <span>{new Date(rec.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-300 self-center" size={18} />
                </div>
            ))
        )}
      </div>

      {/* Add Modal Overlay */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up">
                <h2 className="text-xl font-bold mb-4">Add Record</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
                        <select 
                            className="w-full p-3 bg-gray-50 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-pink-200"
                            value={newRecord.type}
                            onChange={(e) => setNewRecord({...newRecord, type: e.target.value as any})}
                        >
                            <option value="General">General Note</option>
                            <option value="Prescription">Prescription</option>
                            <option value="Doctor">Doctor Info</option>
                            <option value="Allergy">Allergy</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-pink-200"
                            placeholder="e.g. Amoxicillin"
                            value={newRecord.title || ''}
                            onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Details</label>
                        <textarea 
                            className="w-full p-3 bg-gray-50 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-pink-200 h-24 resize-none"
                            placeholder="Dosage, instructions, etc..."
                            value={newRecord.description || ''}
                            onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSave} className="flex-1 py-3 rounded-xl font-medium bg-pink-500 text-white shadow-lg hover:bg-pink-600">Save</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
