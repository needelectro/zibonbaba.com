'use client';

import {
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Map,
  ClipboardList,
  FileText,
  UserPlus,
  Circle,
} from 'lucide-react';

const stats = [
  { label: 'Active Deliveries', value: '18', icon: Truck, color: 'bg-blue-50 text-blue-600' },
  { label: 'Delivered Today', value: '34', icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
  { label: 'Failed', value: '2', icon: XCircle, color: 'bg-red-50 text-red-600' },
  { label: 'Avg Delivery Time', value: '1.8 days', icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
];

const deliveries = [
  { orderId: 'ORD-5401', customer: 'Karim Hassan', address: 'House 12, Mirpur-10, Dhaka', courier: 'Rashed Ali', status: 'Out for Delivery', date: '2026-07-14' },
  { orderId: 'ORD-5398', customer: 'Nusrat Jahan', address: 'Flat 3B, Gulshan-2, Dhaka', courier: 'Imran Khan', status: 'Dispatched', date: '2026-07-13' },
  { orderId: 'ORD-5391', customer: 'Sumon Mia', address: 'Agrabad, Chittagong', courier: 'Jakir Hossain', status: 'Delivered', date: '2026-07-12' },
  { orderId: 'ORD-5385', customer: 'Shila Akter', address: 'Banani, Dhaka-1213', courier: 'Rashed Ali', status: 'Out for Delivery', date: '2026-07-14' },
  { orderId: 'ORD-5379', customer: 'Tariqul Islam', address: 'Khulna City, Khulna', courier: 'Mamun Sheikh', status: 'Dispatched', date: '2026-07-13' },
  { orderId: 'ORD-5370', customer: 'Parvez Ahmed', address: 'Sylhet Sadar, Sylhet', courier: 'Imran Khan', status: 'Delivered', date: '2026-07-12' },
];

const couriers = [
  { name: 'Rashed Ali', deliveries: 6, rating: 4.8, status: 'Active' },
  { name: 'Imran Khan', deliveries: 5, rating: 4.6, status: 'Active' },
  { name: 'Jakir Hossain', deliveries: 4, rating: 4.7, status: 'Active' },
  { name: 'Mamun Sheikh', deliveries: 3, rating: 4.4, status: 'On Break' },
];

const statusColors: Record<string, string> = {
  Dispatched: 'bg-blue-100 text-blue-700',
  'Out for Delivery': 'bg-yellow-100 text-yellow-700',
  Delivered: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
};

export default function DeliveryDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Delivery & Courier Management</h1>
          <p className="text-gray-500 mt-1">Track all deliveries and manage courier assignments.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-[#FFC107] text-gray-900 font-semibold px-4 py-2 rounded-xl shadow hover:bg-yellow-400 transition">
            <UserPlus size={16} /> Assign Courier
          </button>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition">
            <ClipboardList size={16} /> Print Manifest
          </button>
          <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-xl shadow hover:bg-gray-700 transition">
            <FileText size={16} /> Generate Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Active Deliveries Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Truck size={18} className="text-[#FFC107]" /> Active Deliveries
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Order ID', 'Customer', 'Address', 'Courier', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left py-2.5 px-2 text-gray-500 font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.orderId} className="border-b border-gray-50 hover:bg-yellow-50/40 transition">
                    <td className="py-3 px-2 font-mono text-xs font-bold text-gray-600">{d.orderId}</td>
                    <td className="py-3 px-2 font-medium text-gray-800">{d.customer}</td>
                    <td className="py-3 px-2 text-gray-500 text-xs max-w-[150px] truncate">{d.address}</td>
                    <td className="py-3 px-2 text-gray-700">{d.courier}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[d.status]}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500 text-xs">{d.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Courier List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Courier Status</h2>
          <div className="space-y-3">
            {couriers.map((c) => (
              <div key={c.name} className="p-3 rounded-xl bg-gray-50 hover:bg-yellow-50 transition border border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-gray-800 text-sm">{c.name}</span>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    <Circle size={6} fill="currentColor" /> {c.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Truck size={12} /> {c.deliveries} active
                  </span>
                  <span className="flex items-center gap-1 text-yellow-600 font-semibold">
                    <Star size={12} fill="currentColor" /> {c.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Tracking Map Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Map size={18} className="text-[#FFC107]" /> Live Tracking Map
        </h2>
        <div className="relative rounded-xl overflow-hidden bg-gray-200" style={{ height: '280px' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg flex flex-col items-center gap-2">
              <Map size={40} className="text-gray-400" />
              <p className="text-lg font-semibold text-gray-500">Live Tracking Map</p>
              <p className="text-sm text-gray-400">Real-time courier positions will appear here</p>
              <button className="mt-2 bg-[#FFC107] text-gray-900 font-semibold text-sm px-5 py-2 rounded-xl hover:bg-yellow-400 transition">
                Load Live Map
              </button>
            </div>
          </div>
          {/* Decorative grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9CA3AF" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
