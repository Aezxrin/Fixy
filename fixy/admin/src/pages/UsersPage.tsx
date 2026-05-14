import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Search, Filter, Calendar, X, Download } from 'lucide-react'; // Download icon нэмсэн
import { API_BASE_URL } from '../constants'; 

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
}

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  
  // Хайлт болон Шүүлтүүрийн State
  const [searchTerm, setSearchTerm] = useState(''); 
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [dateFrom, setDateFrom] = useState(''); 
  const [dateTo, setDateTo] = useState('');
  
  // Огноо сонгох цонхыг нээх/хаах State
  const [isDateOpen, setIsDateOpen] = useState(false);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        params: {
          role_id: 4,
          page: page,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data.data || []);
      setPagination(response.data);
    } catch (error) {
      console.error("Дата татахад алдаа гарлаа:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers(1);
  }, [statusFilter, dateFrom, dateTo]);

  // Тайлан татах туршилтын функц
  const handleExport = () => {
    alert("Excel тайлан татах үйлдэл тун удахгүй холбогдоно!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Үйлчлүүлэгдийн удирдлага</h2>
        <p className="text-slate-500 mt-1 text-sm">Платформ дээр бүртгэлтэй бүх үйлчлүүлэгчдийг удирдах хэсэг.</p>
      </div>

      <Card className="p-6 border-0 ring-1 ring-slate-100 shadow-sm rounded-[2rem]">
        
        {/* ХАЙЛТ БОЛОН ШҮҮЛТҮҮРИЙН ХЭСЭГ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          
          {/* Зүүн тал: Хайлтын талбар */}
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Нэр, И-мэйл, Дуудлагын ID..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-slate-50 pl-12 pr-4 py-2.5 rounded-xl border border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
            />
          </div>

          {/* Баруун тал: Шүүлтүүр болон Татах товчнууд */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* 1. Статусаар шүүх */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 appearance-none cursor-pointer outline-none hover:bg-slate-50 transition-colors"
              >
                <option value="all">Бүх төлөв</option>
                <option value="active">Идэвхтэй</option>
                <option value="suspended">Идэвхгүй</option>
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 2. ЗУРАГ ДЭЭРХ "ХУГАЦАА" ТОВЧ БОЛОН ПОПАП ЦОНХ */}
            <div className="relative">
              <button 
                onClick={() => setIsDateOpen(!isDateOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-colors shadow-sm ${
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

            {/* 3. ЗУРАГ ДЭЭРХ "ТАТАХ" ЦЭНХЭР ТОВЧ */}
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1a56ff] text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
            >
              <Download className="w-4 h-4" />
              Татах
            </button>

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
              data={users}
              columns={[
                { 
                  header: 'Нэр', 
                  accessor: (item: any) => (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold text-sm uppercase">
                        {item.name.substring(0, 2)}
                      </div>
                      <span className="font-bold text-slate-800">{item.name}</span>
                    </div>
                  )
                },
                { header: 'Email', accessor: (item: any) => <span className="text-slate-600">{item.email}</span> },
                { header: 'Утас', accessor: (item: any) => <span className="text-slate-600">{item.phone || '-'}</span> },
                { 
                  header: 'Status', 
                  accessor: (item: any) => (
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {item.status}
                    </span>
                  )
                },
                { 
                  header: 'Бүртгүүлсэн', 
                  accessor: (item: any) => <span className="text-slate-500 font-medium">{new Date(item.created_at).toLocaleDateString('mn-MN')}</span>
                },
                { 
                  header: 'Үйлдэл', 
                  accessor: () => (
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">Засах</button>
                      <button className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors">Устгах</button>
                    </div>
                  ),
                  className: 'text-right'
                }
              ]}
            />
          </div>
        )}

        {/* ХУУДАСЛАЛТ (Pagination) */}
        {!loading && pagination && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <p className="text-sm font-medium text-slate-500">Нийт <strong className="text-slate-800">{pagination.total}</strong> хэрэглэгч байна</p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fetchUsers(pagination.current_page - 1)} 
                disabled={pagination.current_page === 1} 
                className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                Өмнөх
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20">
                {pagination.current_page}
              </span>
              <button 
                onClick={() => fetchUsers(pagination.current_page + 1)} 
                disabled={pagination.current_page === pagination.last_page} 
                className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                Дараах
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};