'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { recordsApi, patientsApi, clinicsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  patient: z.string().min(1, 'Patient is required'),
  clinic: z.string().optional(),
  record_type: z.string().min(1, 'Type is required'),
  title: z.string().min(3),
  description: z.string().min(5),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  visit_date: z.string().min(1),
  follow_up_date: z.string().optional(),
  weight_kg: z.string().optional(),
  height_cm: z.string().optional(),
  temperature_c: z.string().optional(),
  blood_pressure: z.string().optional(),
  pulse_rate: z.string().optional(),
  prescriptions: z.array(z.object({
    medication_name: z.string().min(1),
    dosage: z.string().min(1),
    frequency: z.string().min(1),
    duration: z.string().min(1),
    instructions: z.string().optional(),
  })).optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patient') || '';

  const { data: patients } = useQuery({ queryKey: ['patients-list'], queryFn: () => patientsApi.list({ page_size: 100 }).then(r => r.data.results) });
  const { data: clinics } = useQuery({ queryKey: ['clinics-list'], queryFn: () => clinicsApi.list({ page_size: 100 }).then(r => r.data.results) });

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { patient: patientId, priority: 'medium', prescriptions: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'prescriptions' });

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        weight_kg: data.weight_kg || null,
        height_cm: data.height_cm || null,
        temperature_c: data.temperature_c || null,
        pulse_rate: data.pulse_rate || null,
        clinic: data.clinic || null,
        follow_up_date: data.follow_up_date || null,
      };
      const res = await recordsApi.create(payload);
      toast.success('Medical record created!');
      router.push(`/dashboard/records/${res.data.id}`);
    } catch {
      toast.error('Failed to create record');
    }
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card">
      <h3 className="font-display font-semibold text-brand-navy text-sm mb-4 pb-3 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/records" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">New Medical Record</h1>
          <p className="text-gray-500 text-sm">Document a patient visit, procedure, or result.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Section title="Record Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Patient *</label>
              <select {...register('patient')} className="input">
                <option value="">Select patient</option>
                {patients?.map((p: { id: string; full_name: string; mapigo_id: string }) => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.mapigo_id})</option>
                ))}
              </select>
              {errors.patient && <p className="text-red-500 text-xs mt-1">{errors.patient.message}</p>}
            </div>
            <div>
              <label className="label">Clinic</label>
              <select {...register('clinic')} className="input">
                <option value="">Select clinic (optional)</option>
                {clinics?.map((c: { id: string; name: string; country: string }) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.country}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Record Type *</label>
              <select {...register('record_type')} className="input">
                <option value="">Select type</option>
                {['consultation','lab_result','prescription','imaging','surgery','vaccination','allergy','discharge','referral','other'].map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
              {errors.record_type && <p className="text-red-500 text-xs mt-1">{errors.record_type.message}</p>}
            </div>
            <div>
              <label className="label">Priority</label>
              <select {...register('priority')} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Title *</label>
              <input {...register('title')} className="input" placeholder="e.g. Initial Consultation, Blood Test Results..." />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Visit Date *</label>
              <input {...register('visit_date')} type="datetime-local" className="input" />
              {errors.visit_date && <p className="text-red-500 text-xs mt-1">{errors.visit_date.message}</p>}
            </div>
            <div>
              <label className="label">Follow-up Date</label>
              <input {...register('follow_up_date')} type="date" className="input" />
            </div>
          </div>
        </Section>

        <Section title="Clinical Notes">
          <div className="space-y-4">
            {[['description','Description *',true],['diagnosis','Diagnosis',false],['treatment','Treatment / Management',false],['notes','Additional Notes',false]].map(([field, label, required]) => (
              <div key={String(field)}>
                <label className="label">{String(label)}</label>
                <textarea {...register(field as keyof FormData)} className="input h-24 resize-none" placeholder={`Enter ${String(label).toLowerCase()}...`} />
                {required && errors[field as keyof typeof errors] && <p className="text-red-500 text-xs mt-1">{String((errors[field as keyof typeof errors] as {message?:string})?.message)}</p>}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Vitals (optional)">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[['weight_kg','Weight (kg)'],['height_cm','Height (cm)'],['temperature_c','Temperature (°C)'],['blood_pressure','Blood Pressure'],['pulse_rate','Pulse Rate (bpm)'],['oxygen_saturation','O2 Saturation (%)']].map(([field, label]) => (
              <div key={field}>
                <label className="label">{label}</label>
                <input {...register(field as keyof FormData)} className="input" placeholder="—" />
              </div>
            ))}
          </div>
        </Section>

        {/* Prescriptions */}
        <Section title="Prescriptions">
          <div className="space-y-4">
            {fields.map((field, i) => (
              <div key={field.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative">
                <button type="button" onClick={() => remove(i)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="label">Medication</label>
                    <input {...register(`prescriptions.${i}.medication_name`)} className="input" placeholder="e.g. Amoxicillin 500mg" />
                  </div>
                  <div><label className="label">Dosage</label>
                    <input {...register(`prescriptions.${i}.dosage`)} className="input" placeholder="e.g. 500mg" /></div>
                  <div><label className="label">Frequency</label>
                    <input {...register(`prescriptions.${i}.frequency`)} className="input" placeholder="e.g. 3x daily" /></div>
                  <div><label className="label">Duration</label>
                    <input {...register(`prescriptions.${i}.duration`)} className="input" placeholder="e.g. 7 days" /></div>
                  <div><label className="label">Instructions</label>
                    <input {...register(`prescriptions.${i}.instructions`)} className="input" placeholder="e.g. After meals" /></div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => append({ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' })}
              className="btn-secondary w-full justify-center border-dashed">
              <Plus className="w-4 h-4" /> Add Prescription
            </button>
          </div>
        </Section>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/records" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-2.5">
            {isSubmitting ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
              : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
