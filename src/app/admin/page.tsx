'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import Header from '@/components/ui/Header';

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-start w-full py-6">
        <AdminDashboard onBack={() => router.push('/')} />
      </main>
    </div>
  );
}
