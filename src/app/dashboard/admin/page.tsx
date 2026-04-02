'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicsApi, authApi } from '@/lib/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Shield, CheckCircle, Clock, Users, Building2, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/dashboard');
  }, [user]);

  const qc = useQueryClient();

  const { data: pendingClinics } = useQuery({
    queryKey: ['pending-clinics'],
    queryFn: () => clinicsApi.list({ status: 'pending' }).then(r => r.data),
  });

  const { data: users } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => authApi.users({ page_size: 50 }).then(r => r.data),
  });

  const verifyClinics = useMutation({
    mutationFn: (id: string) => clinicsApi.verify(id),
    onSuccess: () => {
      toast.success('Clinic verified and activated!');
      qc.invalidateQueries({ queryKey: ['pending-clinics'] });
      qc.invalidateQueries({ queryKey: ['clinics'] });
    },
    onError: () => toast.error('Verification failed'),
  });

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    clinic_admin: 'bg-purple-100 text-purple-700',
    doctor: 'bg-blue-100 text-blue-700',
    nurse: 'bg-teal-100 text-teal-700',
    patient: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-navy rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="text-gray-500 text-sm">System administration and clinic verification</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pending Clinics */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-brand-navy flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Pending Clinic Verification
              {pendingClinics?.count > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingClinics.count}
                </span>
              )}
            </h3>
          </div>

          <div className="space-y-3">
            {pendingClinics?.results?.map((c: {
              id: string; name: string; clinic_type: string;
              country: string; registration_number: string; phone: string; joined_at: string;
            }) => (
              <div key={c.id} className="border border-amber-100 bg-amber-50 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 capitalize">{c.clinic_type.replace('_', ' ')} · {c.country}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{c.registration_number}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.phone}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Applied {format(new Date(c.joined_at), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => verifyClinics.mutate(c.id)}
                      disabled={verifyClinics.isPending}
                      className="btn-primary py-1.5 px-3 text-xs">
                      <CheckCircle className="w-3.5 h-3.5" /> Verify
                    </button>
                    <button className="btn-danger py-1.5 px-3 text-xs justify-center">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!pendingClinics?.results?.length && (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                <p className="text-sm">All clinics are verified!</p>
              </div>
            )}
          </div>
        </div>

        {/* Users Overview */}
        <div className="card">
          <h3 className="font-display font-semibold text-brand-navy mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-blue" />
            System Users ({users?.count || 0})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users?.results?.map((u: {
              id: string; full_name: string; email: string; role: string;
              country: string; is_active: boolean; date_joined: string;
            }) => (
              <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`badge text-xs capitalize ${roleColors[u.role] || 'badge-gray'}`}>
                    {u.role.replace('_', ' ')}
                  </span>
                  <span className={`text-xs ${u.is_active ? 'text-green-500' : 'text-gray-400'}`}>
                    {u.is_active ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>
            ))}
            {!users?.results?.length && (
              <p className="text-center text-gray-400 py-8">No users found</p>
            )}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card bg-brand-navy text-white">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-blue-300" />
          <h3 className="font-display font-semibold">System Information</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {[
            ['Version', 'MapigoLink v1.0'],
            ['Environment', 'Production'],
            ['API', 'Django 5.1 + DRF 3.15'],
            ['Database', 'PostgreSQL 16'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-blue-300 text-xs">{label}</p>
              <p className="font-medium text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
