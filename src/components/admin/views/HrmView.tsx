'use client';

import React, { useState } from 'react';
import KPICard from '../ui/KPICard';
import StatusBadge from '../ui/StatusBadge';
import { UserCheck, Users, Plus, Trash2, DollarSign, Briefcase } from 'lucide-react';

interface EmployeeRecord {
  id: string;
  name: string;
  role: string;
  dept: string;
  salary: number;
  attendance?: string;
  status: string;
}

interface HrmViewProps {
  employees: EmployeeRecord[];
  onAddEmployee: (e: React.FormEvent, name: string, role: string) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
  isLight: boolean;
}

export default function HrmView({
  employees = [],
  onAddEmployee,
  onDeleteEmployee,
  isLight
}: HrmViewProps) {
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('Operations Specialist');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return;
    await onAddEmployee(e, empName.trim(), empRole);
    setEmpName('');
  };

  const totalPayroll = employees.reduce((acc, e) => acc + (e.salary || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            Human Resources & Workforce Management
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Employee roster, departmental payroll allocation, and operational attendance tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <KPICard
          title="Workforce Size"
          value={employees.length}
          subtitle="Active staff records"
          icon={Users}
          color="blue"
          isLight={isLight}
        />
        <KPICard
          title="Monthly Payroll"
          value={`৳${totalPayroll.toLocaleString()}`}
          subtitle="Salary liabilities"
          icon={DollarSign}
          color="emerald"
          isLight={isLight}
        />
        <KPICard
          title="Avg Attendance"
          value="95.4%"
          subtitle="Biometric register"
          icon={UserCheck}
          color="amber"
          isLight={isLight}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Employee Form */}
        <div
          className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-500" /> Enrol New Staff Member
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-semibold">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className={`w-full p-2.5 rounded-xl border outline-none font-medium ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Operational Role *</label>
              <select
                value={empRole}
                onChange={(e) => setEmpRole(e.target.value)}
                className={`w-full p-2.5 rounded-xl border outline-none font-bold ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <option value="Operations Manager">Operations Manager</option>
                <option value="Warehouse Specialist">Warehouse Specialist</option>
                <option value="Customer Success Lead">Customer Success Lead</option>
                <option value="Financial Auditor">Financial Auditor</option>
                <option value="Logistics Coordinator">Logistics Coordinator</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-xs cursor-pointer"
            >
              Add Staff Member
            </button>
          </form>
        </div>

        {/* Employee Table */}
        <div
          className={`lg:col-span-2 rounded-2xl border overflow-hidden transition-all ${
            isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Workforce Roster ({employees.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-bold ${isLight ? 'bg-slate-50/70 border-slate-200 text-slate-500' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
                  <th className="py-3 px-4 font-black">Employee</th>
                  <th className="py-3 px-4">Role & Dept</th>
                  <th className="py-3 px-4 font-black">Salary (BDT)</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4 text-center">Payroll Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-semibold ${isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'}`}>
                {employees.map((emp) => (
                  <tr key={emp.id} className={isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{emp.role}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{emp.dept}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-500">৳{emp.salary.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-500 font-bold">{emp.attendance || '95%'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={emp.status || 'PAID'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onDeleteEmployee(emp.id)}
                        className="p-1.5 rounded-lg border bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20 transition cursor-pointer"
                        title="Delete staff record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
