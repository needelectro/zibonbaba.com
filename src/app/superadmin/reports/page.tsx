'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SuperAdminReportsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin?module=reports');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center font-black text-slate-950 shadow-xl">
        Z
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
        <span>Loading Financial & System Reports in Admin Panel...</span>
      </div>
    </div>
  );
}
