'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordsApi } from '@/lib/api';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ArrowLeft, FileText, Pill, Paperclip, Activity,
  Calendar, Building2, User, AlertTriangle, Trash2, Edit
} from 'lucide-react';

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  high: 'bg-amber-100 text-amber-700 border-amber-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
};

function VitalItem({ label, value, unit }: { label: string; value?: string | number | null; unit?: string }) {
  if (!value) return null;
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-bold text-brand-navy">{value}<span className="text-xs font-normal text-gray-400 ml-1">{unit}</span></p>
    </div>
  );
}

export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: record, isLoading } = useQuery({
    queryKey: ['record', id],
    queryFn: () => recordsApi.get(id).then(r => r.data),
  });

  const deleteRecord = useMutation({
    mutationFn: () => recordsApi.delete(id),
    onSuccess: () => {
      toast.success('Record deleted');
      qc.invalidateQueries({ queryKey: ['records'] });
      router.push('/dashboard/records');
    },
    onError: () => toast.error('Failed to delete record'),
  });

  const confirmDelete = () => {
    if (window.confirm('Delete this medical record? This cannot be undone.')) {
      deleteRecord.mutate();
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!record) return <div className="card text-center py-12 text-gray-400">Record not found</div>;

  const hasVitals = record.weight_kg || record.height_cm || record.temperature_c ||
    record.blood_pressure || record.pulse_rate || record.oxygen_saturation;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/records" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg mt-1 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge border text-xs capitalize ${priorityColors[record.priority]}`}>
                  {record.priority} priority
                </span>
                <span className="badge-gray capitalize">{record.record_type?.replace('_', ' ')}</span>
              </div>
              <h1 className="page-title">{record.title}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{record.patient_name}</span>
                <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{record.clinic_name || 'No clinic'}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />
                  {format(new Date(record.visit_date), 'dd MMM yyyy, HH:mm')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/records/${id}/edit`} className="btn-secondary">
                <Edit className="w-4 h-4" /> Edit
              </Link>
              <button onClick={confirmDelete} disabled={deleteRecord.isPending} className="btn-danger">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Clinical notes */}
          <div className="card">
            <h3 className="font-display font-semibold text-brand-navy text-sm mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-blue" /> Clinical Notes
            </h3>
            <div className="space-y-4">
              {record.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{record.description}</p>
                </div>
              )}
              {record.diagnosis && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Diagnosis</p>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-sm text-blue-800 leading-relaxed">{record.diagnosis}</p>
                  </div>
                </div>
              )}
              {record.treatment && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Treatment / Management</p>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                    <p className="text-sm text-green-800 leading-relaxed">{record.treatment}</p>
                  </div>
                </div>
              )}
              {record.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Additional Notes</p>
                  <p className="text-sm text-gray-600 italic">{record.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Prescriptions */}
          {record.prescriptions?.length > 0 && (
            <div className="card">
              <h3 className="font-display font-semibold text-brand-navy text-sm mb-4 flex items-center gap-2">
                <Pill className="w-4 h-4 text-green-600" /> Prescriptions ({record.prescriptions.length})
              </h3>
              <div className="space-y-3">
                {record.prescriptions.map((p: {
                  id: string; medication_name: string; dosage: string;
                  frequency: string; duration: string; instructions?: string; is_dispensed: boolean;
                }) => (
                  <div key={p.id} className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Pill className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-gray-800">{p.medication_name}</p>
                        {p.is_dispensed && <span className="badge-green text-xs">Dispensed</span>}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {p.dosage} · {p.frequency} · {p.duration}
                      </p>
                      {p.instructions && <p className="text-xs text-gray-400 mt-0.5 italic">{p.instructions}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {record.attachments?.length > 0 && (
            <div className="card">
              <h3 className="font-display font-semibold text-brand-navy text-sm mb-4 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-gray-400" /> Attachments ({record.attachments.length})
              </h3>
              <div className="space-y-2">
                {record.attachments.map((a: {
                  id: string; name: string; attachment_type: string; file_url: string; uploaded_at: string;
                }) => (
                  <a key={a.id} href={a.file_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-blue hover:bg-blue-50 transition-all group">
                    <Paperclip className="w-4 h-4 text-gray-400 group-hover:text-brand-blue" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-brand-blue">{a.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{a.attachment_type} · {format(new Date(a.uploaded_at), 'dd MMM yyyy')}</p>
                    </div>
                    <span className="text-xs text-brand-blue opacity-0 group-hover:opacity-100">Download →</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Vitals */}
          {hasVitals && (
            <div className="card">
              <h3 className="font-display font-semibold text-brand-navy text-sm mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-teal" /> Vitals
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <VitalItem label="Weight" value={record.weight_kg} unit="kg" />
                <VitalItem label="Height" value={record.height_cm} unit="cm" />
                <VitalItem label="Temperature" value={record.temperature_c} unit="°C" />
                <VitalItem label="Blood Pressure" value={record.blood_pressure} unit="mmHg" />
                <VitalItem label="Pulse Rate" value={record.pulse_rate} unit="bpm" />
                <VitalItem label="O2 Saturation" value={record.oxygen_saturation} unit="%" />
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="card space-y-3">
            <h3 className="font-display font-semibold text-brand-navy text-sm mb-1">Record Details</h3>
            {[
              ['Created by', record.created_by_name],
              ['Clinic', record.clinic_name || 'Not specified'],
              ['Visit date', format(new Date(record.visit_date), 'dd MMM yyyy, HH:mm')],
              ['Follow-up', record.follow_up_date ? format(new Date(record.follow_up_date), 'dd MMM yyyy') : 'None'],
              ['Created', format(new Date(record.created_at), 'dd MMM yyyy')],
            ].map(([label, value]) => value && (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-400">{label}</span>
                <span className="font-medium text-gray-700 text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>

          {/* Patient link */}
          <Link href={`/dashboard/patients/${record.patient}`}
            className="card block card-hover text-center group">
            <User className="w-6 h-6 text-brand-blue mx-auto mb-2" />
            <p className="text-sm font-semibold text-brand-navy">{record.patient_name}</p>
            <p className="text-xs text-gray-400 mt-0.5 group-hover:text-brand-blue transition-colors">View patient profile →</p>
          </Link>

          {/* Follow-up warning */}
          {record.follow_up_date && new Date(record.follow_up_date) <= new Date() && (
            <div className="card bg-amber-50 border-amber-100 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-700">Follow-up Due</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Scheduled for {format(new Date(record.follow_up_date), 'dd MMM yyyy')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
