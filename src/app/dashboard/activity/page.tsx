'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recordsApi } from '@/lib/api';
import { format } from 'date-fns';
import { Activity, QrCode, Eye, Edit, Download } from 'lucide-react';

const accessIcons: Record<string, React.ElementType> = {
  view: Eye, qr_scan: QrCode, edit: Edit, download: Download,
};
const accessColors: Record<string, string> = {
  view: 'bg-blue-100 text-blue-600',
  qr_scan: 'bg-teal-100 text-teal-600',
  edit: 'bg-amber-100 text-amber-600',
  download: 'bg-purple-100 text-purple-600',
};

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['access-logs', page, type],
    queryFn: () => recordsApi.accessLogs({ page, access_type: type || undefined }).then(r => r.data),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Log</h1>
          <p className="text-gray-500 text-sm mt-0.5">All patient record accesses and QR scans</p>
        </div>
      </div>

      <div className="card p-4 flex gap-3">
        <select value={type} onChange={e => { setType(e.target.value); setPage(1); }} className="input w-auto min-w-[180px]">
          <option value="">All access types</option>
          <option value="view">View</option>
          <option value="qr_scan">QR Scan</option>
          <option value="edit">Edit</option>
          <option value="download">Download</option>
        </select>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Access Type</th>
                    <th>Patient</th>
                    <th>Accessed By</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.results || []).map((log: {
                    id: string; access_type: string; patient: string;
                    accessed_by_name: string; accessed_at: string;
                  }) => {
                    const Icon = accessIcons[log.access_type] || Activity;
                    return (
                      <tr key={log.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accessColors[log.access_type] || 'bg-gray-100 text-gray-500'}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="capitalize text-sm font-medium">{log.access_type.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="font-medium">{log.patient}</td>
                        <td className="text-gray-600">{log.accessed_by_name || '—'}</td>
                        <td className="text-gray-400 text-xs">
                          {format(new Date(log.accessed_at), 'dd MMM yyyy, HH:mm:ss')}
                        </td>
                      </tr>
                    );
                  })}
                  {!data?.results?.length && (
                    <tr><td colSpan={4} className="text-center py-16 text-gray-400">
                      <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      No activity recorded yet
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {data?.count > 20 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">Page {page} of {Math.ceil(data.count / 20)}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 disabled:opacity-40">← Prev</button>
                  <button onClick={() => setPage(p => p + 1)} disabled={!data.next} className="btn-secondary py-1.5 px-3 disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
