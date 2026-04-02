'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recordsApi } from '@/lib/api';
import { format } from 'date-fns';
import Link from 'next/link';
import { FileText, Plus, Search } from 'lucide-react';

const priorityBadge: Record<string, string> = {
  low: 'badge-green', medium: 'badge-blue', high: 'badge-yellow', critical: 'badge-red',
};
const typeColors: Record<string, string> = {
  consultation: 'bg-blue-100 text-blue-700', lab_result: 'bg-purple-100 text-purple-700',
  prescription: 'bg-green-100 text-green-700', imaging: 'bg-amber-100 text-amber-700',
  vaccination: 'bg-teal-100 text-teal-700', surgery: 'bg-red-100 text-red-700',
};

export default function RecordsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [priority, setPriority] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['records', search, page, type, priority],
    queryFn: () => recordsApi.list({ search, page, record_type: type || undefined, priority: priority || undefined }).then(r => r.data),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Medical Records</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.count || 0} total records</p>
        </div>
        <Link href="/dashboard/records/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Record
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9" placeholder="Search records by title, diagnosis..." />
        </div>
        <select value={type} onChange={e => setType(e.target.value)} className="input w-auto min-w-[160px]">
          <option value="">All types</option>
          {['consultation','lab_result','prescription','imaging','vaccination','surgery','referral','discharge'].map(t => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value)} className="input w-auto min-w-[140px]">
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Title</th><th>Type</th><th>Patient</th>
                    <th>Priority</th><th>Clinic</th><th>Visit Date</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.results?.map((r: {
                    id: string; title: string; record_type: string; patient_name?: string;
                    priority: string; clinic_name?: string; visit_date: string;
                  }) => (
                    <tr key={r.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FileText className="w-3.5 h-3.5 text-brand-blue" />
                          </div>
                          <span className="font-medium text-gray-800">{r.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge text-xs capitalize ${typeColors[r.record_type] || 'badge-gray'}`}>
                          {r.record_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="font-medium">{r.patient_name || '—'}</td>
                      <td><span className={`badge ${priorityBadge[r.priority]}`}>{r.priority}</span></td>
                      <td className="text-gray-500">{r.clinic_name || '—'}</td>
                      <td className="text-gray-400">{format(new Date(r.visit_date), 'dd MMM yyyy')}</td>
                      <td>
                        <Link href={`/dashboard/records/${r.id}`} className="text-brand-blue text-xs font-medium hover:underline">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!data?.results?.length && (
                    <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                      <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      No records found
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {data?.count > 20 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">Page {page} of {Math.ceil(data.count / 20)}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 disabled:opacity-40">← Prev</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={!data.next} className="btn-secondary py-1.5 px-3 disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
