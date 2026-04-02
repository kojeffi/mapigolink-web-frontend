'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { patientsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  date_of_birth: z.string().min(1, 'Required'),
  gender: z.enum(['M', 'F', 'O']),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal('')),
  country: z.string().min(2),
  nationality: z.string().min(2),
  national_id: z.string().optional(),
  passport_number: z.string().optional(),
  blood_group: z.string().optional(),
  allergies: z.string().optional(),
  chronic_conditions: z.string().optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="card">
    <h3 className="font-display font-semibold text-brand-navy text-base mb-4 pb-3 border-b border-gray-100">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Field = ({ label, error, children, full }: { label: string; error?: string; children: React.ReactNode; full?: boolean }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <label className="label">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default function NewPatientPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await patientsApi.create(data);
      toast.success(`Patient registered! ID: ${res.data.mapigo_id}`);
      router.push(`/dashboard/patients/${res.data.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      toast.error('Registration failed. Check the form.');
      console.error(axiosErr.response?.data);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/patients" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">Register New Patient</h1>
          <p className="text-gray-500 text-sm">A unique Mapigo ID and QR code will be auto-generated.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Section title="Personal Information">
          <Field label="First Name" error={errors.first_name?.message}>
            <input {...register('first_name')} className="input" placeholder="John" />
          </Field>
          <Field label="Last Name" error={errors.last_name?.message}>
            <input {...register('last_name')} className="input" placeholder="Doe" />
          </Field>
          <Field label="Date of Birth" error={errors.date_of_birth?.message}>
            <input {...register('date_of_birth')} type="date" className="input" />
          </Field>
          <Field label="Gender" error={errors.gender?.message}>
            <select {...register('gender')} className="input">
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </Field>
          <Field label="Nationality" error={errors.nationality?.message}>
            <input {...register('nationality')} className="input" placeholder="Kenyan" />
          </Field>
          <Field label="Country of Residence" error={errors.country?.message}>
            <input {...register('country')} className="input" placeholder="Kenya" />
          </Field>
          <Field label="National ID" error={errors.national_id?.message}>
            <input {...register('national_id')} className="input" placeholder="12345678" />
          </Field>
          <Field label="Passport Number" error={errors.passport_number?.message}>
            <input {...register('passport_number')} className="input" placeholder="A1234567" />
          </Field>
        </Section>

        <Section title="Contact Information">
          <Field label="Phone Number" error={errors.phone?.message}>
            <input {...register('phone')} className="input" placeholder="+254 700 000000" />
          </Field>
          <Field label="Email Address" error={errors.email?.message}>
            <input {...register('email')} type="email" className="input" placeholder="patient@example.com" />
          </Field>
          <Field label="Address" error={errors.address?.message} full>
            <textarea {...register('address')} className="input h-20 resize-none" placeholder="Physical address..." />
          </Field>
        </Section>

        <Section title="Medical Information">
          <Field label="Blood Group" error={errors.blood_group?.message}>
            <select {...register('blood_group')} className="input">
              <option value="">Unknown</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <div /> {/* spacer */}
          <Field label="Known Allergies" error={errors.allergies?.message} full>
            <textarea {...register('allergies')} className="input h-20 resize-none" placeholder="e.g. Penicillin, Aspirin..." />
          </Field>
          <Field label="Chronic Conditions" error={errors.chronic_conditions?.message} full>
            <textarea {...register('chronic_conditions')} className="input h-20 resize-none" placeholder="e.g. Diabetes Type 2, Hypertension..." />
          </Field>
        </Section>

        <Section title="Emergency Contact">
          <Field label="Contact Name" error={errors.emergency_contact_name?.message}>
            <input {...register('emergency_contact_name')} className="input" placeholder="Jane Doe" />
          </Field>
          <Field label="Relationship" error={errors.emergency_contact_relation?.message}>
            <input {...register('emergency_contact_relation')} className="input" placeholder="Spouse, Parent..." />
          </Field>
          <Field label="Phone Number" error={errors.emergency_contact_phone?.message}>
            <input {...register('emergency_contact_phone')} className="input" placeholder="+254 700 000000" />
          </Field>
        </Section>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/dashboard/patients" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="btn-primary py-2.5 px-6">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registering...
              </span>
            ) : (
              <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Register Patient</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
