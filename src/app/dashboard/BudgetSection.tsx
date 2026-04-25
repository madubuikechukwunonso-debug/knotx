'use client';

import { useEffect, useState } from "react";

export default function BudgetSection() {
  const [totalSpent, setTotalSpent] = useState(0);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [dailySpent, setDailySpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/budget")
      .then((r) => r.json())
      .then((d) => {
        setTotalSpent(d.total || 0);
        setMonthlySpent(d.monthly || 0);
        setDailySpent(d.daily || 0);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h2 className="text-2xl font-medium mb-6">Spending Overview</h2>
        <p className="text-black/40">Loading your spending data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg">
      <h2 className="text-2xl font-medium mb-8">Spending Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Daily Spending */}
        <div className="text-center border border-black/10 rounded-3xl p-6">
          <p className="text-xs uppercase tracking-widest text-black/50">Today</p>
          <p className="text-4xl font-medium mt-3">${dailySpent}</p>
          <p className="text-xs text-black/40 mt-1">Daily spend</p>
        </div>

        {/* Monthly Spending */}
        <div className="text-center border border-black/10 rounded-3xl p-6">
          <p className="text-xs uppercase tracking-widest text-black/50">This Month</p>
          <p className="text-4xl font-medium mt-3">${monthlySpent}</p>
          <p className="text-xs text-black/40 mt-1">Monthly total</p>
        </div>

        {/* Total Spent */}
        <div className="text-center border border-black/10 rounded-3xl p-6 bg-black text-white">
          <p className="text-xs uppercase tracking-widest opacity-70">Since Registration</p>
          <p className="text-4xl font-medium mt-3">${totalSpent}</p>
          <p className="text-xs opacity-70 mt-1">Total lifetime spend</p>
        </div>
      </div>
    </div>
  );
}
