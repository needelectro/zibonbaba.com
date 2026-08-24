'use client';

import React from 'react';
import SuperadminLayout from '@/components/superadmin-layout';
import { Shield, Lock, Eye, AlertTriangle, KeyRound, CheckCircle2 } from 'lucide-react';

export default function SuperadminSecurityPage() {
  return (
    <SuperadminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Platform Security & Audit</h1>
          <p className="text-xs text-slate-400 mt-1">
            JWT session revocation, API key rotation, encryption standards, and intrusion logs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">SSL / TLS 1.3</h3>
            <p className="text-xs text-slate-400 mt-1">Strict transport security enabled across all edge nodes.</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">JWT Rotation</h3>
            <p className="text-xs text-slate-400 mt-1">7-day token expiration with automatic payload validation.</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">Bcrypt Passwords</h3>
            <p className="text-xs text-slate-400 mt-1">Salted cryptographic hashing on all account passwords.</p>
          </div>
        </div>
      </div>
    </SuperadminLayout>
  );
}
