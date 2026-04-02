'use client';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicsApi } from '@/lib/api';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Building2, CheckCircle, Phone, Mail, Globe, MapPin, Users, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ClinicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: clinic, isLoading } = useQuery({
    queryKey: ['clinic', id],
    queryFn: () => clinicsApi.get(id).then(r => r.data),
  });

  const { data: staff } = useQuery({
    queryKey: ['clinic-staff', id],
    queryFn: () => clinicsApi.staff(id).then(r => r.data),
  });

  const verify = useMutation({
    mutationFn: () => clinicsApi.verify(id),
    onSuccess: () => { toast.success('Clinic verified!'); qc.invalidateQueries({ queryKey: ['clinic', id] }); },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!clinic) return <div className="card text-center py-12 text-gray-400">Clinic not found</div>;

  const typeColors: Record<string, string> = {
    hospital: 'badge-red', clinic: 'badge-blue', health_center: 'badge-green',
    pharmacy: 'badge-yellow', laboratory: 'badge-gray',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/clinics" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge capitalize ${typeColors[clinic.clinic_type] || 'badge-gray'}`}>
                {clinic.clinic_type.replace('_', ' ')}
              </span>
              <span className={clinic.is_verified ? 'badge-green' : 'badge-yellow'}>
                {clinic.is_verified ? '✓ Verified' : 'Pending Verification'}
              </span>
            </div>
            <h1 className="page-title">{clinic.name}</h1>
          </div>
          {user?.role === 'admin' && !clinic.is_verified && (
            <button onClick={() => verify.mutate()} disabled={verify.isPending} className="btn-primary">
              <Shield className="w-4 h-4" /> Verify Clinic
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card">
            <h3 className="font-display font-semibold text-brand-navy text-sm mb-4">Clinic Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Registration No.', clinic.registration_number],
                ['Country', clinic.country],
                ['County / District', clinic.county_district || '—'],
                ['Admin', clinic.admin_name || '—'],
                ['Joined', format(new Date(clinic.joined_at), 'dd MMM yyyy')],
                ['Verified', clinic.verified_at ? format(new Date(clinic.verified_at), 'dd MMM yyyy') : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />{clinic.address}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />{clinic.phone}
              </div>
              {clinic.email && <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />{clinic.email}
              </div>}
              {clinic.website && <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="w-4 h-4 text-gray-400" />
                <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">{clinic.website}</a>
              </div>}
            </div>
          </div>

          {/* Staff */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-brand-navy text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-blue" /> Staff ({(staff as { results?: unknown[] })?.results?.length || 0})
              </h3>
            </div>
            <div className="space-y-2">
              {((staff as { results?: { id: string; user_name: string; user_email: string; role: string; is_active: boolean }[] })?.results || []).map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white text-xs font-bold">
                    {s.user_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{s.user_name}</p>
                    <p className="text-xs text-gray-400">{s.user_email}</p>
                  </div>
                  <span className="badge-blue capitalize text-xs">{s.role}</span>
                </div>
              ))}
              {!(staff as { results?: unknown[] })?.results?.length && (
                <p className="text-sm text-gray-400 text-center py-4">No staff assigned yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          {[
            { label: 'Total Patients', value: clinic.patient_count || 0, icon: Users, color: 'bg-blue-100 text-blue-600' },
            { label: 'Medical Records', value: clinic.record_count || 0, icon: Building2, color: 'bg-teal-100 text-teal-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-brand-navy">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            </div>
          ))}

          {clinic.is_verified && (
            <div className="card bg-green-50 border-green-100 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">Verified Facility</p>
                <p className="text-xs text-green-600 mt-0.5">Authorized to access the MapigoLink network</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
