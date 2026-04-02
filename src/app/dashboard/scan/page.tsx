'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { patientsApi } from '@/lib/api';
import { QrCode, Search, CheckCircle, XCircle, User } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';

export default function ScanPage() {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [manualId, setManualId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  const lookupPatient = async (mapigo_id: string) => {
    setScanning(true); setError(''); setResult(null);
    try {
      const { data } = await patientsApi.scan(mapigo_id);
      setResult(data.patient);
      toast.success('Patient found!');
    } catch {
      setError('Patient not found. Please verify the Mapigo ID.');
      toast.error('Patient not found');
    } finally {
      setScanning(false);
    }
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanLoop();
      }
    } catch {
      toast.error('Camera not available. Use manual entry.');
      setMode('manual');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  const scanLoop = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) {
          try {
            const parsed = JSON.parse(code.data);
            if (parsed.mapigo_id) {
              stopCamera();
              lookupPatient(parsed.mapigo_id);
              return;
            }
          } catch { /* not JSON */ }
        }
      }
    }
    animFrameRef.current = requestAnimationFrame(scanLoop);
  };

  useEffect(() => {
    if (mode === 'camera') startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [mode]);

  const patient = result as {
    id?: string; mapigo_id?: string; full_name?: string; date_of_birth?: string;
    gender?: string; blood_group?: string; allergies?: string; country?: string; phone?: string;
  } | null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">QR Code Scanner</h1>
        <p className="text-gray-500 text-sm mt-0.5">Scan a patient QR code or enter their Mapigo ID manually.</p>
      </div>

      {/* Mode toggle */}
      <div className="card p-2 flex gap-2">
        {(['manual', 'camera'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all capitalize ${mode === m ? 'bg-brand-blue text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {m === 'camera' ? '📷 Camera Scan' : '⌨️ Manual Entry'}
          </button>
        ))}
      </div>

      {/* Camera scanner */}
      {mode === 'camera' && (
        <div className="card p-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-white/70 rounded-xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-400/70 animate-pulse" />
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">Point camera at patient QR code</p>
        </div>
      )}

      {/* Manual entry */}
      {mode === 'manual' && (
        <div className="card">
          <label className="label">Mapigo ID</label>
          <div className="flex gap-3">
            <input value={manualId} onChange={e => setManualId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && manualId && lookupPatient(manualId)}
              className="input font-mono text-base tracking-wider" placeholder="ML-2025-XXXXXX" />
            <button onClick={() => lookupPatient(manualId)} disabled={!manualId || scanning}
              className="btn-primary px-5 flex-shrink-0">
              {scanning ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Search className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Format: ML-YYYY-XXXXXX (e.g. ML-2025-AB1C2D)</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card border-red-100 bg-red-50 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {patient && (
        <div className="card border-green-100 bg-green-50 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="font-semibold text-green-700">Patient Found</p>
          </div>
          <div className="bg-white rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xl font-bold">
                {String(patient.full_name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-lg font-display font-bold text-brand-navy">{patient.full_name}</p>
                <span className="font-mono text-sm bg-blue-50 text-brand-blue px-2 py-0.5 rounded font-semibold">
                  {patient.mapigo_id}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100 text-sm">
              <div><p className="text-xs text-gray-400">Blood Group</p>
                <p className="font-bold text-red-600">{patient.blood_group || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Country</p>
                <p className="font-medium">{patient.country}</p></div>
              <div><p className="text-xs text-gray-400">Phone</p>
                <p className="font-medium">{patient.phone}</p></div>
              {patient.allergies && (
                <div className="col-span-2 sm:col-span-4 bg-amber-50 rounded-lg p-2">
                  <p className="text-xs font-semibold text-amber-600">⚠️ Allergies: {patient.allergies}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/dashboard/patients/${patient.id}`} className="btn-primary flex-1 justify-center">
              <User className="w-4 h-4" /> View Full Profile
            </Link>
            <Link href={`/dashboard/records/new?patient=${patient.id}`} className="btn-secondary flex-1 justify-center">
              + Add Record
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
