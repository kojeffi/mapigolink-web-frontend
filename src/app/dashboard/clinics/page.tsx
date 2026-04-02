'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicsApi } from '@/lib/api';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Building2, Plus, Search, CheckCircle, Clock, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const typeColors: Record<string, string> = {
  hospital: 'badge-red', clinic: 'badge-blue', health_center: 'badge-green',
  pharmacy: 'badge-yellow', laboratory: 'badge-gray', specialist: 'bg-purple-100 text-purple-800 badge',
};

export default function ClinicsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['clinics', search, page],
    queryFn: () => clinicsApi.list({ search, page }).then(r => r.data),
    placeholderData: (prev) => prev,
  });

  const verify = useMutation({
    mutationFn: (id: string) => clinicsApi.verify(id),
    onSuccess: () => { toast.success('Clinic verified!'); qc.invalidateQueries({ queryKey: ['clinics'] }); },
    onError: () => toast.error('Verification failed'),
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinics</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.count || 0} clinics registered</p>
        </div>
        <Link href="/dashboard/clinics/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Register Clinic
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: data?.count || 0, icon: Building2, color: 'text-brand-blue' },
          { label: 'Active & Verified', value: data?.results?.filter((c: { is_verified: boolean }) => c.is_verified).length || 0, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Pending Review', value: data?.results?.filter((c: { status: string }) => c.status === 'pending').length || 0, icon: Clock, color: 'text-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3 p-4">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className="text-xl font-display font-bold text-brand-navy">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9" placeholder="Search clinics by name, country, registration number..." />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Clinic</th><th>Type</th><th>Country</th><th>Reg. No.</th>
                  <th>Status</th><th>Verified</th><th>Joined</th>
                  {user?.role === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data?.results?.map((c: {
                  id: string; name: string; clinic_type: string; country: string;
                  county_district?: string; registration_number: string;
                  status: string; is_verified: boolean; joined_at: string; phone: string;
                }) => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-brand-blue" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.county_district}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={typeColors[c.clinic_type] || 'badge-gray'}>
                        {c.clinic_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{c.country}</td>
                    <td><span className="font-mono text-xs text-gray-600">{c.registration_number}</span></td>
                    <td>
                      <span className={c.status === 'active' ? 'badge-green' : c.status === 'pending' ? 'badge-yellow' : 'badge-red'}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {c.is_verified
                        ? <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle className="w-3.5 h-3.5" /> Verified</span>
                        : <span className="text-gray-400 text-xs">Pending</span>}
                    </td>
                    <td className="text-gray-400">{format(new Date(c.joined_at), 'dd MMM yyyy')}</td>
                    {user?.role === 'admin' && (
                      <td>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/clinics/${c.id}`} className="text-brand-blue text-xs font-medium hover:underline">View</Link>
                          {!c.is_verified && (
                            <button onClick={() => verify.mutate(c.id)}
                              className="text-green-600 text-xs font-medium hover:underline flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Verify
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {!data?.results?.length && (
                  <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                    <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    No clinics found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
