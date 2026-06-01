import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Search, Filter, Calendar, Loader2, X, CheckCircle2, Wrench, Download } from 'lucide-react'; 
import { cn } from '../utils/cn';
import { API_BASE_URL } from '../constants';

interface Service {
  id: number;
  name: string;
}

interface Technician {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
  service_type?: string | null;
  service?: Service[]; // <-- Модал дотор item.service?.map гэж хэрэглэж байгаа тул үүнийг нэмэв
}

export const TechniciansPage = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]); 
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  
  // Хайлт болон Шүүлтүүрийн State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [dateFrom, setDateFrom] = useState(''); 
  const [dateTo, setDateTo] = useState('');      
  
  // Огноо сонгох попап цонхны State
  const [isDateOpen, setIsDateOpen] = useState(false);
  
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  const fetchInitialData = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const techRes = await axios.get(`${API_BASE_URL}/admin/users`, {
        params: {
          role_id: 5,
          page: page,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined
        },
        headers
      });

      const servRes = await axios.get(`${API_BASE_URL}/admin/services`, { headers });
      
      setTechnicians(techRes.data.data || []);
      setPagination(techRes.data);
      setAvailableServices(servRes.data.data || []);
    } catch (error) {
      console.error("Дата татахад алдаа:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!editingTech) return;
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(`${API_BASE_URL}/admin/users/${editingTech.id}`, 
        { 
          status: newStatus,
          service_ids: selectedServiceIds 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setEditingTech(null);
      fetchInitialData(pagination?.current_page || 1);
    } catch (error) {
      console.error("Хадгалахад алдаа гарлаа:", error);
      alert('Алдаа гарлаа. Мэдээллээ шалгана уу.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleService = (serviceId: number) => {
    setSelectedServiceIds(prev => 
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };
  
  useEffect(() => {
    const delayDebounce = setTimeout(() => { fetchInitialData(1); }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => { fetchInitialData(1); }, [statusFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Засварчдын удирдлага</h2>
        <p className="text-slate-500 mt-1 text-sm">Үйлчилгээ үзүүлэгчид болон тэдний гүйцэтгэлийг удирдах хэсэг.</p>
      </div>

      <Card className="p-6 border-0 ring-1 ring-slate-100 shadow-sm rounded-[2rem]">
        
        {/* ХАЙЛТ БОЛОН ШҮҮЛТҮҮР */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          
          {/* Зүүн тал: Хайлтын талбар */}
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Нэр, И-мэйл, Үйлчилгээний төрөл..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-slate-50 pl-12 pr-4 py-2.5 rounded-xl border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
            />
          </div>

          {/* Баруун тал: Яг зураг дээрх 3 товч */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* 1. Статусаар шүүх (Товч шиг харагдах Select) */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl pl-10 pr-8 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer outline-none shadow-sm flex items-center h-[42px]"
              >
                <option value="all">Бүх төлөв</option>
                <option value="active">Идэвхтэй</option>
                <option value="pending">Хүлээгдэж буй</option>
                <option value="suspended">Идэвхгүй</option>
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 2. ХУГАЦАА ТОВЧ БОЛОН ПОПАП */}
            <div className="relative">
              <button 
                onClick={() => setIsDateOpen(!isDateOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-colors shadow-sm h-[42px] ${
                  dateFrom || dateTo 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Хугацаа
              </button>

              {/* Хугацаа сонгох Попап цонх */}
              {isDateOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDateOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-5 z-20 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-slate-800 text-sm">Хугацаа сонгох</h4>
                      <button onClick={() => setIsDateOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-full"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Эхлэх огноо</label>
                        <input 
                          type="date" 
                          value={dateFrom} 
                          onChange={(e) => setDateFrom(e.target.value)} 
                          className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Дуусах огноо</label>
                        <input 
                          type="date" 
                          value={dateTo} 
                          onChange={(e) => setDateTo(e.target.value)} 
                          className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-blue-500" 
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => { setDateFrom(''); setDateTo(''); setIsDateOpen(false); }} 
                          className="flex-1 px-3 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                          Цэвэрлэх
                        </button>
                        <button 
                          onClick={() => setIsDateOpen(false)} 
                          className="flex-1 px-3 py-2.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
                        >
                          Хэрэгжүүлэх
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ХҮСНЭГТ */}
        {loading ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Уншиж байна...
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <Table 
              data={technicians}
              columns={[
                { header: 'Засварчин', accessor: (item) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold uppercase">{item.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.email}</p>
                    </div>
                  </div>
                )
                },
                { 
                  header: 'Үйлчилгээнүүд', 
                  accessor: (item) => (
                    <div className="flex flex-wrap gap-1">
                      {item.service_type ? (
                        item.service_type.split(',').map((service: string, index: number) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase"
                          >
                            {service.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-300 text-[10px] italic">Одоогоор байхгүй</span>
                      )}
                    </div>
                  )
                }, // <--- ЭНД ТАСЛАЛ НЭМЭГДСЭН
                { header: 'Төлөв', accessor: (item) => (
                  <span className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                    item.status === 'active' ? "bg-emerald-50 text-emerald-600" :
                    item.status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                  )}>{item.status}</span>
                )
                },
                { header: 'Бүртгүүлсэн', accessor: (item) => <span className="text-slate-500 font-medium">{new Date(item.created_at).toLocaleDateString('mn-MN')}</span> },
                { header: 'Үйлдэл', accessor: (item) => (
                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => {
                        setEditingTech(item);
                        setNewStatus(item.status);
                        setSelectedServiceIds(item.service?.map(s => s.id) || []);
                      }}
                      className="px-4 py-2 bg-slate-50 text-emerald-600 text-xs font-bold rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >Удирдах</button>
                  </div>
                ), className: 'text-right'
                }
              ]}
            />
          </div>
        )}

        {/* ХУУДАСЛАЛТ (Pagination) */}
        {!loading && pagination && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-500">Нийт <strong className="text-slate-800">{pagination.total}</strong> засварчин байна</p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fetchInitialData(pagination.current_page - 1)} 
                disabled={pagination.current_page === 1} 
                className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                Өмнөх
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20">
                {pagination.current_page}
              </span>
              <button 
                onClick={() => fetchInitialData(pagination.current_page + 1)} 
                disabled={pagination.current_page === pagination.last_page} 
                className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                Дараах
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* MODAL: ЗАСВАРЧИН ТОХИРУУЛАХ */}
      {editingTech && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-[450px] max-w-[95%] shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Засварчин тохируулах</h3>
                <p className="text-sm text-slate-500 mt-1">{editingTech.name}</p>
              </div>
              <button onClick={() => setEditingTech(null)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <div className="space-y-6">
              {/* Status Section */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Аккаунтын төлөв</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-50 hover:bg-white transition-all">
                  <option value="pending">Хүлээгдэж буй (Pending)</option>
                  <option value="active">Идэвхтэй (Active)</option>
                  <option value="suspended">Идэвхгүй (Suspended)</option>
                </select>
              </div>

              {/* Services Section */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5"/> Чаддаг үйлчилгээнүүд
                </label>
                <div className="grid grid-cols-1 gap-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 max-h-56 overflow-y-auto custom-scrollbar">
                  {availableServices.map(service => {
                    const isSelected = selectedServiceIds.includes(service.id);
                    return (
                      <div 
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={cn(
                          "flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border",
                          isSelected ? "bg-white border-blue-500 shadow-sm" : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
                        )}
                      >
                        <span className={cn("text-sm font-bold", isSelected ? "text-blue-700" : "text-slate-600")}>
                          {service.name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button onClick={() => setEditingTech(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Цуцлах</button>
              <button 
                onClick={handleSaveAll} 
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-bold text-white bg-[#1a56ff] rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-sm active:scale-95 transition-all disabled:opacity-70"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin"/>}
                Хадгалах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};