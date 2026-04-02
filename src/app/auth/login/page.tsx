'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Heart, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password too short'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-brand flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-display font-bold text-xl tracking-tight">MapigoLink</span>
          </div>
          <p className="text-blue-200 text-sm">Cross-Border Health Record System</p>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-white leading-tight mb-4">
              Health records that<br />travel with you.
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed">
              Secure, instant access to patient records across borders. Empowering healthcare providers with the information they need.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Shield, label: 'Secure & Encrypted' },
              { icon: Globe, label: 'Cross-Border' },
              { icon: Heart, label: 'Patient First' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Icon className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-white text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-300 text-xs relative z-10">© 2025 MapigoLink. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-brand-navy">MapigoLink</span>
          </div>

          <div className="card shadow-lg border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-brand-navy mb-1">Sign in</h2>
              <p className="text-gray-500 text-sm">Access your MapigoLink dashboard</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <input {...register('email')} type="email" className="input" placeholder="you@clinic.org" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input {...register('password')} type={showPwd ? 'text' : 'password'} className="input pr-10" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="btn-primary w-full justify-center py-2.5 text-base">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                New clinic?{' '}
                <Link href="/auth/register" className="text-brand-blue font-medium hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Protected by end-to-end encryption · HIPAA compliant
          </p>
        </div>
      </div>
    </div>
  );
}
