// src/sections/admin/AdminAvailabilityTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Trash2, Clock, Calendar, Ban } from 'lucide-react';

type StaffWithRelations = {
  id: number;
  displayName: string;
  bookingEnabled: boolean;
  workingHours: {
    id: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isWorking: boolean;
  }[];
  timeOffs: {
    id: number;
    startAt: Date;
    endAt: Date;
    reason?: string | null;
  }[];
  blockedSlots: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    reason?: string | null;
  }[];
};

type Props = {
  staff: StaffWithRelations[];
};

export default function AdminAvailabilityTable({ staff }: Props) {
  const router = useRouter();
  const [modalType, setModalType] = useState<'workingHours' | 'timeOff' | 'blockedSlot' | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffWithRelations | null>(null);

  const openModal = (type: 'workingHours' | 'timeOff' | 'blockedSlot', staffMember: StaffWithRelations) => {
    setSelectedStaff(staffMember);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedStaff(null);
  };

  const handleRefresh = () => router.refresh();

  return (
    <>
      <div className="rounded-3xl border border-black/10 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-black/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium">Staff Member</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Working Hours</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Time Off</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Blocked Slots</th>
              <th className="px-6 py-4 text-center text-xs font-medium">Booking</th>
              <th className="px-6 py-4 text-right text-xs font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-black/5">
                <td className="px-6 py-5">
                  <div className="font-medium text-emerald-950">{member.displayName}</div>
                </td>

                {/* Working Hours Summary */}
                <td className="px-6 py-5">
                  <div className="text-sm">
                    {member.workingHours.length > 0 ? (
                      member.workingHours.map((wh) => (
                        <div key={wh.id} className="text-xs flex items-center gap-2">
                          <span className="w-16">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][wh.dayOfWeek]}
                          </span>
                          <span className="font-medium">
                            {wh.isWorking ? `${wh.startTime} - ${wh.endTime}` : 'Closed'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-black/40 text-xs">No hours set</span>
                    )}
                  </div>
                </td>

                {/* Time Off */}
                <td className="px-6 py-5 text-xs text-black/70">
                  {member.timeOffs.length} period{member.timeOffs.length !== 1 ? 's' : ''}
                </td>

                {/* Blocked Slots */}
                <td className="px-6 py-5 text-xs text-black/70">
                  {member.blockedSlots.length} slot{member.blockedSlots.length !== 1 ? 's' : ''}
                </td>

                <td className="px-6 py-5 text-center">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-3xl ${
                      member.bookingEnabled
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {member.bookingEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>

                <td className="px-6 py-5 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => openModal('workingHours', member)}
                      className="flex items-center gap-1 text-xs text-black/70 hover:text-black"
                    >
                      <Clock size={16} />
                      Hours
                    </button>
                    <button
                      onClick={() => openModal('timeOff', member)}
                      className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                    >
                      <Calendar size={16} />
                      Off
                    </button>
                    <button
                      onClick={() => openModal('blockedSlot', member)}
                      className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                    >
                      <Ban size={16} />
                      Block
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals will be added here in the next iteration if you want them now */}
      {modalType && selectedStaff && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <h2 className="text-xl font-medium mb-6">
              {modalType === 'workingHours' && 'Edit Working Hours'}
              {modalType === 'timeOff' && 'Add Time Off'}
              {modalType === 'blockedSlot' && 'Block Time Slot'}
            </h2>
            <p className="text-black/60 mb-8">
              Managing availability for <span className="font-medium">{selectedStaff.displayName}</span>
            </p>
            <div className="text-center text-black/40 py-12">
              Modal forms coming in next step (reply “send modal forms”)
            </div>
            <button
              onClick={closeModal}
              className="w-full py-4 border border-black/10 rounded-3xl font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
