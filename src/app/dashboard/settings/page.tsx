'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { User, Lock, Save, Camera } from 'lucide-react';

const profileSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  phone: z.string().optional(),
  country: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Current password required'),
  new_password: z.string().min(8, 'At least 8 characters'),
  confirm: z.string(),
}).refine(d => d.new_password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState<'profile' | 'security'>('profile');

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      country: user?.country || '',
    },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const updateProfile = useMutation({
    mutationFn: (data: ProfileForm) => authApi.updateProfile(data),
    onSuccess: ({ data }) => {
      setUser(data);
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const changePassword = useMutation({
    mutationFn: (data: PasswordForm) => authApi.changePassword({ old_password: data.old_password, new_password: data.new_password }),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      passwordForm.reset();
    },
    onError: () => toast.error('Failed to change password. Check your current password.'),
  });

  const TabBtn = ({ id, label, icon: Icon }: { id: 'profile' | 'security'; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
      <Icon className="w-4 h-4" />{label}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account preferences</p>
      </div>

      {/* Tab selector */}
      <div className="bg-gray-100 rounded-xl p-1 flex gap-1">
        <TabBtn id="profile" label="Profile" icon={User} />
        <TabBtn id="security" label="Security" icon={Lock} />
      </div>

      {tab === 'profile' && (
        <div className="card space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-brand-blue flex items-center justify-center text-white text-xl font-bold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                <Camera className="w-3 h-3 text-gray-500" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user?.full_name}</p>
              <p className="text-sm text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <form onSubmit={profileForm.handleSubmit(d => updateProfile.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input {...profileForm.register('first_name')} className="input" />
                {profileForm.formState.errors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.first_name.message}</p>
                )}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input {...profileForm.register('last_name')} className="input" />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input {...profileForm.register('phone')} className="input" placeholder="+254 700 000000" />
              </div>
              <div>
                <label className="label">Country</label>
                <input {...profileForm.register('country')} className="input" placeholder="Kenya" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={updateProfile.isPending} className="btn-primary">
                {updateProfile.isPending
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span>
                  : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="card">
          <h3 className="font-display font-semibold text-brand-navy mb-4">Change Password</h3>
          <form onSubmit={passwordForm.handleSubmit(d => changePassword.mutate(d))} className="space-y-4">
            {[
              { name: 'old_password' as const, label: 'Current Password' },
              { name: 'new_password' as const, label: 'New Password' },
              { name: 'confirm' as const, label: 'Confirm New Password' },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <input {...passwordForm.register(name)} type="password" className="input" placeholder="••••••••" />
                {passwordForm.formState.errors[name] && (
                  <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors[name]?.message}</p>
                )}
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={changePassword.isPending} className="btn-primary">
                {changePassword.isPending
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</span>
                  : <><Lock className="w-4 h-4" /> Change Password</>}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Password Requirements</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" />At least 8 characters long</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" />Mix of letters and numbers recommended</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-300" />Avoid common passwords</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
