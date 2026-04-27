// src/sections/admin/AdminOverviewSection.tsx
"use client";

import { DollarSign, TrendingUp, Users, Package, Calendar } from "lucide-react";

const stats = [
  { title: "Revenue", value: "$12,450", change: "+18%", icon: DollarSign },
  { title: "Orders", value: "87", change: "+12%", icon: Package },
  { title: "Customers", value: "241", change: "-3%", icon: Users },
  { title: "Bookings", value: "14", change: "+5%", icon: Calendar },
];

export default function AdminOverviewSection() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm">{stat.title}</p>
                  <p className="text-4xl font-semibold text-emerald-950 mt-2">{stat.value}</p>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <Icon className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-6 text-emerald-600 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>{stat.change} this month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
        <h2 className="font-medium text-emerald-950 mb-4">Recent Activity</h2>
        <div className="space-y-4 text-sm">
          {/* Mock rows — replace with real data */}
          <div className="flex justify-between items-center py-3 border-b">
            <div>New booking • Emma Thompson</div>
            <div className="text-emerald-600">$450 • Today</div>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <div>Service completed • John Rivera</div>
            <div className="text-emerald-600">$120 • Yesterday</div>
          </div>
        </div>
      </div>
    </div>
  );
}
