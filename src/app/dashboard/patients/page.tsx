'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { patientsApi } from '@/lib/api';
import Link from 'next/link';
import { format } from 'date-fns';
import { Users, Plus, Search, QrCode, Filter } from 'lucide-react';
import clsx from 'clsx';

const statusBadge = (s: string) => ({
  active: 'badge-green', inactive: 'badge-gray', deceased: 'badge-red'
}[s] || 'badge-gray');

const genderLabel = (g: string) => ({ M: 'Male', F: 'Female', O: 'Other' }[g] || g);

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['patients', search, page, status],
    queryFn: () => patientsApi.list({ search, page, status: status || undefined }).then(r => r.data),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.count || 0} total registered patients</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/scan" className="btn-secondary">
            <QrCode className="w-4 h-4" /> Scan QR
          </Link>
          <Link href="/dashboard/patients/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Register Patient
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9" placeholder="Search by name, Mapigo ID, phone..." />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input w-auto min-w-[150px]">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="deceased">Deceased</option>
        </select>
      </div>

      {/* Table */}
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
                    <th>Patient</th>
                    <th>Mapigo ID</th>
                    <th>Age / Gender</th>
                    <th>Blood Group</th>
                    <th>Country</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.results?.map((p: {
                    id: string; mapigo_id: string; full_name: string;
                    age: number; gender: string; blood_group: string;
                    country: string; status: string; created_at: string; phone: string;
                  }) => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                            {p.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{p.full_name}</p>
                            <p className="text-xs text-gray-400">{p.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{p.mapigo_id}</span></td>
                      <td>{p.age} yrs · {genderLabel(p.gender)}</td>
                      <td>
                        {p.blood_group
                          ? <span className="badge-red badge font-semibold">{p.blood_group}</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td>{p.country}</td>
                      <td><span className={statusBadge(p.status)}>{p.status}</span></td>
                      <td className="text-gray-400">{format(new Date(p.created_at), 'dd MMM yyyy')}</td>
                      <td>
                        <Link href={`/dashboard/patients/${p.id}`}
                          className="text-brand-blue text-xs font-medium hover:underline">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!data?.results?.length && (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-gray-400">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No patients found</p>
                        <Link href="/dashboard/patients/new" className="text-brand-blue text-sm hover:underline mt-1 inline-block">
                          Register the first patient →
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.count > 20 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Page {page} of {Math.ceil(data.count / 20)}
                </p>
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
