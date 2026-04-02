'use client';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import {
  Users, FileText, Building2, Activity,
  TrendingUp, QrCode, AlertCircle, CheckCircle2
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { format } from 'date-fns';
import Link from 'next/link';

const COLORS = ['#1a56db', '#0ea5a0', '#0f9e6e', '#f59e0b', '#dc2626', '#8b5cf6'];

function StatCard({ title, value, sub, icon: Icon, color, trend }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: string;
}) {
  return (
    <div className="stat-card card-hover">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-display font-bold text-brand-navy mt-0.5">{value.toLocaleString()}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        {trend && <p className="text-xs text-green-600 font-medium mt-1">↑ {trend}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: () => dashboardApi.stats().then(r => r.data) });
  const { data: growth } = useQuery({ queryKey: ['growth'], queryFn: () => dashboardApi.patientGrowth().then(r => r.data) });
  const { data: activity } = useQuery({ queryKey: ['activity'], queryFn: () => dashboardApi.recordActivity().then(r => r.data) });
  const { data: topClinics } = useQuery({ queryKey: ['top-clinics'], queryFn: () => dashboardApi.topClinics().then(r => r.data) });
  const { data: recent } = useQuery({ queryKey: ['recent'], queryFn: () => dashboardApi.recentActivity().then(r => r.data) });

  const recordTypes = stats?.records?.by_type?.slice(0, 5) || [];
  const growthData = (growth || []).map((d: { month: string; count: number }) => ({
    month: format(new Date(d.month), 'MMM yy'),
    patients: d.count,
  }));
  const activityData = (activity || []).slice(-14).map((d: { day: string; count: number }) => ({
    day: format(new Date(d.day), 'dd MMM'),
    records: d.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning, {user?.first_name} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">Here's what's happening across the MapigoLink network.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/patients/new" className="btn-primary">
            <Users className="w-4 h-4" /> Register Patient
          </Link>
          <Link href="/dashboard/scan" className="btn-secondary">
            <QrCode className="w-4 h-4" /> Scan QR
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={stats?.patients?.total || 0}
          sub={`${stats?.patients?.new_this_month || 0} new this month`}
          icon={Users} color="bg-brand-blue" trend={`${stats?.patients?.new_this_week || 0} this week`} />
        <StatCard title="Medical Records" value={stats?.records?.total || 0}
          sub={`${stats?.records?.this_month || 0} created this month`}
          icon={FileText} color="bg-brand-teal" />
        <StatCard title="Active Clinics" value={stats?.clinics?.active || 0}
          sub={`${stats?.clinics?.pending || 0} pending verification`}
          icon={Building2} color="bg-brand-green" />
        <StatCard title="QR Scans Today" value={stats?.access_logs?.qr_scans_today || 0}
          sub={`${stats?.access_logs?.total_today || 0} total accesses`}
          icon={QrCode} color="bg-amber-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Patient growth */}
        <div className="card xl:col-span-2">
          <h3 className="font-display font-semibold text-brand-navy mb-4">Patient Registrations</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Line type="monotone" dataKey="patients" stroke="#1a56db" strokeWidth={2.5}
                dot={{ fill: '#1a56db', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Record types */}
        <div className="card">
          <h3 className="font-display font-semibold text-brand-navy mb-4">Records by Type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={recordTypes} dataKey="count" nameKey="record_type"
                cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {recordTypes.map((_: unknown, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, String(n).replace('_', ' ')]}
                contentStyle={{ borderRadius: '10px', border: 'none', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {recordTypes.slice(0, 4).map((r: { record_type: string; count: number }, i: number) => (
              <div key={r.record_type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600 capitalize">{r.record_type.replace('_', ' ')}</span>
                </div>
                <span className="font-semibold text-gray-800">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity + Top Clinics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card xl:col-span-2">
          <h3 className="font-display font-semibold text-brand-navy mb-4">Record Activity (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', fontSize: 12 }} />
              <Bar dataKey="records" fill="#0ea5a0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-display font-semibold text-brand-navy mb-4">Top Clinics</h3>
          <div className="space-y-3">
            {(topClinics || []).slice(0, 5).map((c: { id: string; name: string; country: string; record_count: number }, i: number) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.country}</p>
                </div>
                <span className="text-xs font-semibold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full">
                  {c.record_count} records
                </span>
              </div>
            ))}
            {!topClinics?.length && <p className="text-sm text-gray-400 text-center py-4">No clinic data yet</p>}
          </div>
        </div>
      </div>

      {/* Recent patients */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-brand-navy">Recently Registered Patients</h3>
          <Link href="/dashboard/patients" className="text-sm text-brand-blue hover:underline font-medium">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Patient</th><th>Mapigo ID</th><th>Country</th><th>Registered</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(recent?.recent_patients || []).map((p: {
                id: string; mapigo_id: string;
                first_name: string; last_name: string; country: string; created_at: string;
              }) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.first_name} {p.last_name}</td>
                  <td><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{p.mapigo_id}</span></td>
                  <td>{p.country}</td>
                  <td className="text-gray-400">{format(new Date(p.created_at), 'dd MMM yyyy')}</td>
                  <td>
                    <Link href={`/dashboard/patients/${p.id}`} className="text-brand-blue text-xs hover:underline font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {!recent?.recent_patients?.length && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-6">No patients yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
