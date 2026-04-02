'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clinicsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  name: z.string().min(3),
  clinic_type: z.string().min(1, 'Select a type'),
  registration_number: z.string().min(3),
  country: z.string().min(2),
  county_district: z.string().optional(),
  address: z.string().min(5),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function NewClinicPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await clinicsApi.create(data);
      toast.success('Clinic registered! Awaiting verification.');
      router.push('/dashboard/clinics');
    } catch {
      toast.error('Registration failed. Check all fields.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/clinics" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="page-title">Register Clinic</h1>
          <p className="text-gray-500 text-sm">Submit for government verification and activation.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card space-y-4">
          <h3 className="font-display font-semibold text-brand-navy text-sm pb-3 border-b border-gray-100">Clinic Information</h3>

          <div>
            <label className="label">Clinic Name *</label>
            <input {...register('name')} className="input" placeholder="Nairobi General Hospital" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Clinic Type *</label>
              <select {...register('clinic_type')} className="input">
                <option value="">Select type</option>
                <option value="hospital">Hospital</option>
                <option value="clinic">Clinic</option>
                <option value="health_center">Health Center</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="laboratory">Laboratory</option>
                <option value="specialist">Specialist Center</option>
              </select>
              {errors.clinic_type && <p className="text-red-500 text-xs mt-1">{errors.clinic_type.message}</p>}
            </div>
            <div>
              <label className="label">Registration Number *</label>
              <input {...register('registration_number')} className="input" placeholder="MOH/2024/001234" />
              {errors.registration_number && <p className="text-red-500 text-xs mt-1">{errors.registration_number.message}</p>}
            </div>
            <div>
              <label className="label">Country *</label>
              <input {...register('country')} className="input" placeholder="Kenya" />
              {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
            </div>
            <div>
              <label className="label">County / District</label>
              <input {...register('county_district')} className="input" placeholder="Nairobi County" />
            </div>
          </div>

          <div>
            <label className="label">Address *</label>
            <textarea {...register('address')} className="input h-20 resize-none" placeholder="Full physical address..." />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone *</label>
              <input {...register('phone')} className="input" placeholder="+254 20 000 0000" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="info@clinic.org" />
            </div>
            <div className="col-span-2">
              <label className="label">Website</label>
              <input {...register('website')} className="input" placeholder="https://clinic.org" />
            </div>
          </div>
        </div>

        <div className="card bg-amber-50 border-amber-100 flex items-start gap-3">
          <Building2 className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700">Pending Verification</p>
            <p className="text-xs text-amber-600 mt-0.5">
              After registration, your clinic will be reviewed by a MapigoLink administrator.
              Once verified, you'll have full access to patient records and the QR scan system.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/clinics" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-2.5">
            {isSubmitting
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registering...</span>
              : <><Building2 className="w-4 h-4" /> Register Clinic</>}
          </button>
        </div>
      </form>
    </div>
  );
}
