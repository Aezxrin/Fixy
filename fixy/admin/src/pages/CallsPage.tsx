import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../components/Card'; 
import { Table } from '../components/Table'; 
import { Search, Clock, MapPin, User, Activity, Bell, CheckCircle, X, Eye, Wrench } from 'lucide-react';
import { cn } from '../utils/cn';
import { API_BASE_URL } from '../constants';

interface CallRequest {
  id: number;
  customer?: { name: string; };
  technician?: { name: string; }; // Сонгогдсон засварчин
  service_type: string;
  address: string; 
  description: string; // Эвдрэлийн тайлбар
  image_path?: string; // Зургийн зам
  status: string;
  created_at: string;
}

export const CallsPage = () => {
  const [calls, setCalls] = useState<CallRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewingCall, setViewingCall] = useState<CallRequest | null>(null);

  const fetchCalls = async (status = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = status && status !== 'all' 
        ? `${API_BASE_URL}/admin/calls?status=${status}`
        : `${API_BASE_URL}/admin/calls`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const fetchedData = response.data.data || response.data;
      setCalls(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (err) {
      console.error("Дуудлага татахад алдаа гарлаа", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls(filter);
    // 1 минутын интервалтайгаар дуудлагуудыг автоматаар шинэчлэх (Polling)
    const interval = setInterval(() => fetchCalls(filter), 60000);
    return () => clearInterval(interval);
  }, [filter]);

  return (
    <div className="space-y-8 p-1">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Засварын дуудлагууд</h2>
          <p className="text-slate-500 mt-1 text-sm text-balance">Хэрэглэгчээс ирсэн засварын хүсэлтүүдийг хянах.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl w-full md:w-80 border border-slate-100">
                <Search className="w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Хайх..." className="bg-transparent border-none focus:outline-none text-sm w-full" />
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {['all', 'pending', 'accepted', 'completed'].map((s) => (
                  <button 
                    key={s}
                    onClick={() => setFilter(s)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap uppercase tracking-tight",
                      filter === s ? "bg-slate-900 text-white shadow-md shadow-slate-200" : "hover:bg-slate-50 text-slate-500 border border-transparent"
                    )}
                  >
                    {s === 'all' ? 'Бүгд' : s}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Дуудлагуудыг уншиж байна...</span>
              </div>
            ) : (
              <Table 
                data={calls}
                columns={[
                  { header: 'ID', accessor: (item: CallRequest) => `REQ-${String(item.id).padStart(3, '0')}`, className: 'w-16 font-mono text-[11px]' },
                  { 
                    header: 'Хэрэглэгч', 
                    accessor: (item: CallRequest) => (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span className="font-semibold text-slate-700 text-sm truncate">{item.customer?.name || 'Тодорхойгүй'}</span>
                      </div>
                    )
                  },
                  { header: 'Үйлчилгээ', accessor: (item: CallRequest) => <span className="text-sm font-medium">{item.service_type}</span> },
                  { 
                    header: 'Засварчин', 
                    accessor: (item: CallRequest) => (
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-slate-300" />
                        <span className={cn("text-xs", item.technician?.name ? "text-emerald-600 font-semibold" : "text-slate-400 italic")}>
                          {item.technician?.name || 'Сонгож байна...'}
                        </span>
                      </div>
                    )
                  },
                  { 
                    header: 'Төлөв', 
                    accessor: (item: CallRequest) => (
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
                        item.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                        item.status === 'accepted' ? "bg-blue-50 text-blue-600 border-blue-100" :
                        item.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        "bg-slate-50 text-slate-500 border-slate-200"
                      )}>
                        {item.status === 'pending' ? 'Хүлээгдэж буй' : item.status}
                      </span>
                    )
                  },
                  { 
                    header: '', 
                    accessor: (item: CallRequest) => (
                      <button 
                        onClick={() => setViewingCall(item)} 
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
                      >
                        <Eye className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
                      </button>
                    ),
                    className: 'text-right'
                  }
                ]}
              />
            )}
          </Card>
        </div>

        {/* LIVE FEED ХЭСЭГ */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Live Feed</h3>
            </div>

            <div className="space-y-5">
              {calls.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 italic">Шинэ мэдээлэл алга</p>
              ) : (
                calls.slice(0, 5).map((call, index) => (
                  <div key={`feed-${call.id}`} className="flex gap-3 items-start relative">
                    {index !== Math.min(calls.length, 5) - 1 && (
                      <div className="absolute left-4 top-8 bottom-[-20px] w-px bg-slate-100"></div>
                    )}
                    
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm",
                      call.status === 'pending' ? "bg-amber-100 text-amber-500" :
                      call.status === 'completed' ? "bg-emerald-100 text-emerald-500" : "bg-blue-100 text-blue-500"
                    )}>
                      {call.status === 'pending' ? <Bell className="w-3.5 h-3.5" /> : 
                       call.status === 'completed' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    </div>

                    <div className="pt-1">
                      <p className="text-xs font-bold text-slate-800">
                        {call.status === 'pending' ? 'Шинэ дуудлага' : 'Төлөв шинэчлэгдсэн'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        {call.customer?.name} - {call.service_type}
                      </p>
                      <span className="text-[9px] text-slate-400 mt-1 block font-medium">
                        {new Date(call.created_at).toLocaleTimeString('mn-MN')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {viewingCall && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-[500px] max-w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Дуудлагын дэлгэрэнгүй</h3>
              <button onClick={() => setViewingCall(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Эвдрэлийн зураг */}
              {viewingCall.image_path ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Хавсаргасан зураг</p>
                  <img 
                    src={`${API_BASE_URL.replace('/api', '')}/storage/${viewingCall.image_path}`} 
                    alt="Problem" 
                    className="w-full h-48 object-cover rounded-2xl border border-slate-100 shadow-inner"
                    onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x200?text=No+Image"; }}
                  />
                </div>
              ) : (
                <div className="h-32 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                  <Activity className="w-6 h-6 text-slate-300" />
                  <span className="text-xs text-slate-400 italic">Зураг хавсаргаагүй</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Үйлчилгээ</p>
                  <p className="text-sm font-bold text-slate-900">{viewingCall.service_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Одоогийн төлөв</p>
                  <p className="text-sm font-bold text-blue-600">{viewingCall.status.toUpperCase()}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Хаяг</p>
                <div className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="font-medium">{viewingCall.address}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Тайлбар</p>
                <p className="text-sm text-slate-600 leading-relaxed italic bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                  "{viewingCall.description || 'Тайлбар бичээгүй'}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Сонгосон засварчин</p>
                      <p className="text-sm font-bold text-slate-800">{viewingCall.technician?.name || 'Хараахан сонгоогүй'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
               <button 
                  onClick={() => setViewingCall(null)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                >
                  Хаах
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};