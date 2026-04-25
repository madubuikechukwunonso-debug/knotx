'use client';

import { useEffect, useState } from "react";

export default function BudgetSection() {
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    fetch("/api/budget")
      .then((r) => r.json())
      .then((d) => setTotalSpent(d.total || 0));
  }, []);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg">
      <h2 className="text-2xl font-serif mb-6">Budget Tracker</h2>
      <p className="text-5xl font-light">Total Spent: ${totalSpent}</p>
    </div>
  );
}
