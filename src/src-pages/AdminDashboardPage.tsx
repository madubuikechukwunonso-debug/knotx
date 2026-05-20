// src/src-pages/AdminDashboardPage.tsx
'use client';

import { useState } from 'react';
import AdminSidebar, { AdminTabId, AdminTab } from '@/components/admin/AdminSidebar';
import AdminSubPage from './AdminSubPage';

// Import the NEW Overview design
import AdminOverviewSectionNew from '@/sections/admin/AdminOverviewSectionNew';

const tabs: AdminTab[] = [
  { 
    id: 'overview', 
    label: 'Overview', 
    description: 'Business dashboard & metrics', 
    icon: LayoutDashboard 
  },
  { id: 'services', label: 'Services', description: 'Manage offerings & pricing', icon: Scissors },
  { id: 'products', label: 'Products', description: 'Inventory & catalog', icon: Package },
  { id: 'gallery', label: 'Gallery', description: 'Photos & media', icon: Image },
  { id: 'orders', label: 'Orders', description: 'Customer orders', icon: ShoppingCart },
  { id: 'newsletter', label: 'Newsletter', description: 'Campaigns & subscribers', icon: Mail },
  { id: 'users', label: 'Users', description: 'Customer accounts', icon: Users },
  { id: 'staff', label: 'Staff', description: 'Team & permissions', icon: UserCheck },
  { id: 'messages', label: 'Messages', description: 'Inquiries & replies', icon: MessageCircle },
  { id: 'bookings', label: 'Bookings', description: 'Appointments', icon: Calendar },
  { id: 'availability', label: 'Availability', description: 'Staff schedules', icon: Clock },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');

  return (
    <div className="flex min-h-screen bg-[#f8f7f4]">
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        onChange={setActiveTab} 
        tabs={tabs} 
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-emerald-950">
              {tabs.find(t => t.id === activeTab)?.label || 'Admin'}
            </h1>
            <p className="text-emerald-600 text-sm mt-1">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>

          {/* Dynamic Content */}
          {activeTab === 'overview' ? (
            // ← Use the NEW design here
            <AdminOverviewSectionNew />
          ) : (
            <AdminSubPage tab={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}
