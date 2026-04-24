"use client";

export default function BudgetSection() {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8">
      <h2 className="text-2xl font-medium mb-6">Spending Overview</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="text-center border border-black/10 rounded-3xl p-6">
          <p className="text-xs uppercase tracking-widest text-black/50">This Month</p>
          <p className="text-4xl font-medium mt-3">$428</p>
        </div>
        <div className="text-center border border-black/10 rounded-3xl p-6">
          <p className="text-xs uppercase tracking-widest text-black/50">This Year</p>
          <p className="text-4xl font-medium mt-3">$2,840</p>
        </div>
        <div className="text-center border border-black/10 rounded-3xl p-6">
          <p className="text-xs uppercase tracking-widest text-black/50">Total Spent</p>
          <p className="text-4xl font-medium mt-3">$6,920</p>
        </div>
      </div>
    </div>
  );
}
