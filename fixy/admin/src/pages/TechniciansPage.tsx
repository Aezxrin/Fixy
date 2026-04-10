import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Search, Filter, Plus, Calendar, Loader2, X, CheckCircle2, Wrench } from 'lucide-react';
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
  services?: Service[]; // Холбогдсон үйлчилгээнүүд
}

export const TechniciansPage = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]); // Бүх үйлчилгээнүүд
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [dateFrom, setDateFrom] = useState(''); 
  const [dateTo, setDateTo] = useState('');      
  
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);

  const fetchInitialData = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // 1. Засварчид татах
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

      // 2. Үйлчилгээний төрлүүд татах (Checkbox-д зориулж)
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
      
      // Статус болон Сонгосон үйлчилгээнүүдийг хамт хадгалах
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Засварчдын удирдлага</h2>
          <p className="text-slate-500 mt-1">Үйлчилгээ үзүүлэгчид болон тэдний гүйцэтгэлийг удирдах.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium text-sm shadow-lg shadow-emerald-100">
          <Plus className="w-4 h-4" />
          New Technician
        </button>
      </div>

      <Card>
        {/* Шүүлтүүрүүд хэсэг хэвээрээ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl w-full lg:w-80 border border-slate-100">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Нэр, И-мэйл, Дуудлагын ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm w-full"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 overflow-hidden focus-within:border-emerald-500 transition-colors">
              <Calendar className="w-4 h-4 text-slate-400 mr-2" />
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-sm text-slate-600 outline-none bg-transparent" />
            </div>
            <span className="text-slate-400">-</span>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 overflow-hidden focus-within:border-emerald-500 transition-colors">
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm text-slate-600 outline-none bg-transparent" />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="flex items-center gap-2 text-slate-600 bg-white hover:bg-slate-50 text-sm font-medium px-4 py-2 pl-9 rounded-xl border border-slate-200 appearance-none outline-none">
                <option value="all">Бүх төлөв</option>
                <option value="active">Идэвхтэй</option>
                <option value="pending">Pending</option>
                <option value="suspended">Идэвхгүй</option>
              </select>
              <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Уншиж байна...</div>
        ) : (
          <Table 
            data={technicians}
            columns={[
              { header: 'ID', accessor: (item) => `TECH-${String(item.id).padStart(3, '0')}` },
              { header: 'Technician', accessor: (item) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold uppercase">{item.name.charAt(0)}</div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.email}</p>
                    </div>
                  </div>
                )
              },
              { header: 'Services', accessor: (item) => (
                  <div className="flex flex-wrap gap-1">
                    {item.services && item.services.length > 0 ? item.services.map(s => (
                      <span key={s.id} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{s.name}</span>
                    )) : <span className="text-slate-300 text-[10px] italic">None</span>}
                  </div>
                )
              },
              { header: 'Status', accessor: (item) => (
                  <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                    item.status === 'active' ? "bg-emerald-50 text-emerald-600" :
                    item.status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                  )}>{item.status}</span>
                )
              },
              { header: 'Registered', accessor: (item) => new Date(item.created_at).toLocaleDateString('mn-MN') },
              { header: 'ACTIONS', accessor: (item) => (
                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => {
                        setEditingTech(item);
                        setNewStatus(item.status);
                        setSelectedServiceIds(item.services?.map(s => s.id) || []);
                      }}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >Manage</button>
                  </div>
                ), className: 'text-right'
              }
            ]}
          />
        )}
      </Card>

      {/* MODAL */}
      {editingTech && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[450px] max-w-[95%] shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Засварчин тохируулах</h3>
                <p className="text-sm text-slate-500">{editingTech.name}</p>
              </div>
              <button onClick={() => setEditingTech(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>

            <div className="space-y-6">
              {/* Status Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Аккаунтын төлөв</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none bg-slate-50">
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Services Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                  <Wrench className="w-3 h-3"/> Чаддаг үйлчилгээнүүд
                </label>
                <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-48 overflow-y-auto">
                  {availableServices.map(service => {
                    const isSelected = selectedServiceIds.includes(service.id);
                    return (
                      <div 
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border",
                          isSelected ? "bg-white border-emerald-500 shadow-sm" : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
                        )}
                      >
                        <span className={cn("text-sm font-medium", isSelected ? "text-emerald-700" : "text-slate-600")}>
                          {service.name}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setEditingTech(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Цуцлах</button>
              <button 
                onClick={handleSaveAll} 
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 flex items-center gap-2"
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