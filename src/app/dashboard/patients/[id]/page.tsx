'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi, recordsApi } from '@/lib/api';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  ArrowLeft, QrCode, FileText, Plus, RefreshCw,
  Phone, Mail, MapPin, Calendar, Droplets, AlertTriangle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const InfoRow = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <div><p className="text-xs text-gray-400">{label}</p><p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p></div>
  ) : null;

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientsApi.get(id).then(r => r.data),
  });

  const { data: records } = useQuery({
    queryKey: ['patient-records', id],
    queryFn: () => recordsApi.forPatient(id).then(r => r.data),
    enabled: !!id,
  });

  const regenQr = useMutation({
    mutationFn: () => patientsApi.regenerateQr(id),
    onSuccess: () => { toast.success('QR code regenerated!'); qc.invalidateQueries({ queryKey: ['patient', id] }); },
  });

  const priorityColor: Record<string, string> = {
    low: 'badge-green', medium: 'badge-blue', high: 'badge-yellow', critical: 'badge-red'
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!patient) return <div className="card text-center py-12 text-gray-400">Patient not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/patients" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg mt-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="page-title">{patient.full_name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-sm bg-blue-50 text-brand-blue px-2.5 py-0.5 rounded-lg font-semibold">
                  {patient.mapigo_id}
                </span>
                <span className={`badge ${patient.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                  {patient.status}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/records/new?patient=${id}`} className="btn-primary">
                <Plus className="w-4 h-4" /> Add Record
              </Link>
              <Link href={`/dashboard/patients/${id}/edit`} className="btn-secondary">Edit</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* QR Code */}
          <div className="card text-center">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Patient QR Code</p>
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <QRCodeSVG
                  value={JSON.stringify({ mapigo_id: patient.mapigo_id, name: patient.full_name, blood_group: patient.blood_group })}
                  size={160} fgColor="#0f2d5a" bgColor="transparent"
                  level="H"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">Scan to access patient records</p>
            <button onClick={() => regenQr.mutate()} disabled={regenQr.isPending}
              className="btn-secondary w-full justify-center text-xs py-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${regenQr.isPending ? 'animate-spin' : ''}`} />
              Regenerate QR
            </button>
          </div>

          {/* Medical Summary */}
          <div className="card space-y-3">
            <h3 className="font-display font-semibold text-brand-navy text-sm">Medical Summary</h3>
            {patient.blood_group && (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 rounded-lg">
                <Droplets className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-xs text-red-400">Blood Group</p>
                  <p className="text-sm font-bold text-red-600">{patient.blood_group}</p>
                </div>
              </div>
            )}
            {patient.allergies && (
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-xs font-semibold text-amber-600">Allergies</p>
                </div>
                <p className="text-xs text-amber-700">{patient.allergies}</p>
              </div>
            )}
            {patient.chronic_conditions && (
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-brand-blue mb-1">Chronic Conditions</p>
                <p className="text-xs text-blue-700">{patient.chronic_conditions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Details */}
          <div className="card">
            <h3 className="font-display font-semibold text-brand-navy text-sm mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoRow label="Date of Birth" value={format(new Date(patient.date_of_birth), 'dd MMM yyyy')} />
              <InfoRow label="Age" value={`${patient.age} years`} />
              <InfoRow label="Gender" value={patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'} />
              <InfoRow label="Nationality" value={patient.nationality} />
              <InfoRow label="Country" value={patient.country} />
              <InfoRow label="National ID" value={patient.national_id} />
              <InfoRow label="Passport" value={patient.passport_number} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />{patient.phone}
              </div>
              {patient.email && <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />{patient.email}
              </div>}
              {patient.address && <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />{patient.address}
              </div>}
            </div>
          </div>

          {/* Emergency Contact */}
          {patient.emergency_contact_name && (
            <div className="card bg-orange-50 border-orange-100">
              <h3 className="font-display font-semibold text-orange-700 text-sm mb-3">Emergency Contact</h3>
              <div className="grid grid-cols-3 gap-4">
                <InfoRow label="Name" value={patient.emergency_contact_name} />
                <InfoRow label="Phone" value={patient.emergency_contact_phone} />
                <InfoRow label="Relation" value={patient.emergency_contact_relation} />
              </div>
            </div>
          )}

          {/* Records */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-brand-navy text-sm">
                Medical Records ({Array.isArray(records) ? records.length : records?.results?.length || 0})
              </h3>
              <Link href={`/dashboard/records/new?patient=${id}`} className="btn-primary py-1.5 px-3 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Record
              </Link>
            </div>
            <div className="space-y-2">
              {(Array.isArray(records) ? records : records?.results || []).map((r: {
                id: string; title: string; record_type: string;
                priority: string; visit_date: string; clinic_name?: string;
              }) => (
                <Link key={r.id} href={`/dashboard/records/${r.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 group-hover:text-brand-blue">{r.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{r.record_type.replace('_', ' ')} · {r.clinic_name || 'No clinic'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`badge text-xs ${priorityColor[r.priority] || 'badge-gray'}`}>{r.priority}</span>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(r.visit_date), 'dd MMM yyyy')}
                    </p>
                  </div>
                </Link>
              ))}
              {!(Array.isArray(records) ? records : records?.results || []).length && (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No records yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
