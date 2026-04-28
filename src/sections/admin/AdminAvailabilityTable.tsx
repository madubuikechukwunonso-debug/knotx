// src/sections/admin/AdminAvailabilityTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Calendar, Ban, Save, RotateCw } from 'lucide-react';

type WorkingHour = {
  id?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
};

type StaffWithRelations = {
  id: number;
  displayName: string;
  bookingEnabled: boolean;
  workingHours: WorkingHour[];
  timeOffs: any[];
  blockedSlots: any[];
};

type Props = {
  staff: StaffWithRelations[];
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminAvailabilityTable({ staff }: Props) {
  const router = useRouter();
  const [modalType, setModalType] = useState<'workingHours' | 'blockedDate' | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffWithRelations | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [saving, setSaving] = useState(false);

  const openWorkingHours = (member: StaffWithRelations) => {
    setSelectedStaff(member);
    
    // Initialize with existing hours or defaults
    const existing = [...member.workingHours];
    const defaults: WorkingHour[] = DAYS.map((_, index) => {
      const existingHour = existing.find(h => h.dayOfWeek === index);
      if (existingHour) return existingHour;
      
      // Default schedule (your example)
      if (index === 0) return { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isWorking: false }; // Sunday closed
      if (index === 6) return { dayOfWeek: 6, startTime: '14:00', endTime: '19:00', isWorking: true }; // Saturday
      return { dayOfWeek: index, startTime: '08:00', endTime: '22:00', isWorking: true }; // Mon-Fri
    });
    
    setWorkingHours(defaults);
    setModalType('workingHours');
  };

  const openBlockDate = (member: StaffWithRelations) => {
    setSelectedStaff(member);
    setBlockDate('');
    setBlockReason('');
    setModalType('blockedDate');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedStaff(null);
    setWorkingHours([]);
  };

  const updateDay = (dayIndex: number, field: keyof WorkingHour, value: string | boolean) => {
    setWorkingHours(prev => 
      prev.map((day, idx) => 
        idx === dayIndex ? { ...day, [field]: value } : day
      )
    );
  };

  const setStandardHours = () => {
    const standard: WorkingHour[] = DAYS.map((_, index) => {
      if (index === 0) return { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isWorking: false }; // Sunday closed
      if (index === 6) return { dayOfWeek: 6, startTime: '14:00', endTime: '19:00', isWorking: true }; // Saturday
      return { dayOfWeek: index, startTime: '08:00', endTime: '22:00', isWorking: true }; // Mon-Fri 8am-10pm
    });
    setWorkingHours(standard);
  };

  const saveWorkingHours = async () => {
    if (!selectedStaff) return;
    setSaving(true);

    try {
      const response = await fetch('/api/admin/update-working-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffUserId: selectedStaff.id,
          workingHours: workingHours,
        }),
      });

      if (response.ok) {
        router.refresh();
        closeModal();
      } else {
        alert('Failed to save working hours');
      }
    } catch (error) {
      alert('Error saving working hours');
    } finally {
      setSaving(false);
    }
  };

  const blockFullDay = async () => {
    if (!selectedStaff || !blockDate) return;
    setSaving(true);

    try {
      const response = await fetch('/api/admin/block-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffUserId: selectedStaff.id,
          date: blockDate,
          reason: blockReason || 'Staff unavailable',
        }),
      });

      if (response.ok) {
        router.refresh();
        closeModal();
      } else {
        alert('Failed to block date');
      }
    } catch (error) {
      alert('Error blocking date');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="rounded-3xl border border-black/10 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between">
          <div>
            <h2 className="font-medium">Staff Availability</h2>
            <p className="text-xs text-black/50">Click "Hours" to edit working times • Click "Block" to close full days</p>
          </div>
          <div className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-2xl">
            {staff.length} staff members
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-black/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium">Staff Member</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Current Schedule</th>
              <th className="px-6 py-4 text-center text-xs font-medium">Status</th>
              <th className="px-6 py-4 text-right text-xs font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {staff.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-black/50">
                  No staff members yet. Add staff from the Staff section first.
                </td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.id} className="hover:bg-black/5">
                  <td className="px-6 py-5">
                    <div className="font-medium text-emerald-950 flex items-center gap-2">
                      {member.displayName}
                      {!member.bookingEnabled && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded">Disabled</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="text-xs space-y-1 max-w-[420px]">
                      {member.workingHours.length > 0 ? (
                        member.workingHours
                          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                          .map((wh, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-black/80">
                              <span className="font-medium w-[70px]">{DAYS[wh.dayOfWeek]}</span>
                              <span className={wh.isWorking ? 'text-emerald-700' : 'text-red-600'}>
                                {wh.isWorking ? `${wh.startTime} – ${wh.endTime}` : 'Closed'}
                              </span>
                            </div>
                          ))
                      ) : (
                        <span className="text-black/40 italic">No schedule set yet</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-3xl ${
                      member.bookingEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {member.bookingEnabled ? 'Accepting Bookings' : 'Not Available'}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openWorkingHours(member)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs border border-black/10 hover:bg-black hover:text-white rounded-2xl transition-colors"
                      >
                        <Clock size={14} /> Hours
                      </button>
                      <button
                        onClick={() => openBlockDate(member)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-2xl transition-colors"
                      >
                        <Ban size={14} /> Block Date
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* WORKING HOURS MODAL - GRAPHICAL SELECTOR */}
      {modalType === 'workingHours' && selectedStaff && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="px-8 py-6 border-b flex items-center justify-between bg-emerald-950 text-white">
              <div>
                <h2 className="text-2xl font-serif">Working Hours</h2>
                <p className="text-emerald-400 text-sm">{selectedStaff.displayName}</p>
              </div>
              <button onClick={closeModal} className="text-emerald-400 hover:text-white">✕</button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-black/60">Set the weekly schedule for this staff member</p>
                </div>
                <button
                  onClick={setStandardHours}
                  className="flex items-center gap-2 text-sm px-4 py-2 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-2xl"
                >
                  <RotateCw size={16} /> Use Standard Hours (Mon–Fri 8am–10pm, Sat 2–7pm)
                </button>
              </div>

              {/* Graphical Day Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {workingHours.map((day, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-3xl p-5 transition-all ${day.isWorking ? 'border-emerald-200 bg-emerald-50/50' : 'border-black/10 bg-white'}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-medium text-lg">{DAYS[day.dayOfWeek]}</div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={day.isWorking} 
                          onChange={(e) => updateDay(index, 'isWorking', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {day.isWorking ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-black/60 block mb-1.5">START TIME</label>
                          <input 
                            type="time" 
                            value={day.startTime} 
                            onChange={(e) => updateDay(index, 'startTime', e.target.value)}
                            className="w-full border border-black/20 px-4 py-3 rounded-2xl text-lg font-medium focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-black/60 block mb-1.5">END TIME</label>
                          <input 
                            type="time" 
                            value={day.endTime} 
                            onChange={(e) => updateDay(index, 'endTime', e.target.value)}
                            className="w-full border border-black/20 px-4 py-3 rounded-2xl text-lg font-medium focus:border-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-[118px] flex items-center justify-center text-red-600 text-sm font-medium">
                        Closed All Day
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t flex items-center justify-between bg-white">
              <button onClick={closeModal} className="px-8 py-3 text-sm border border-black/20 rounded-2xl hover:bg-black/5">
                Cancel
              </button>
              <button 
                onClick={saveWorkingHours} 
                disabled={saving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-8 py-3 rounded-2xl text-sm font-medium transition-colors"
              >
                <Save size={18} /> {saving ? 'Saving...' : 'Save Working Hours'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK FULL DATE MODAL */}
      {modalType === 'blockedDate' && selectedStaff && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <h2 className="text-2xl font-serif mb-2">Block Full Day</h2>
            <p className="text-black/60 mb-6">Close this date for <span className="font-medium">{selectedStaff.displayName}</span></p>

            <div className="space-y-5">
              <div>
                <label className="text-xs text-black/60 block mb-1.5">DATE TO BLOCK</label>
                <input 
                  type="date" 
                  value={blockDate} 
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full border border-black/20 px-4 py-3 rounded-2xl focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-black/60 block mb-1.5">REASON (OPTIONAL)</label>
                <input 
                  type="text" 
                  value={blockReason} 
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Vacation, personal day, holiday..."
                  className="w-full border border-black/20 px-4 py-3 rounded-2xl focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={closeModal} className="flex-1 py-4 border border-black/20 rounded-2xl text-sm">Cancel</button>
              <button 
                onClick={blockFullDay} 
                disabled={!blockDate || saving}
                className="flex-1 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-2xl text-sm font-medium"
              >
                {saving ? 'Blocking...' : 'Block This Date'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
