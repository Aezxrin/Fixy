import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Search, Filter, Plus, Calendar } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState(''); // Хайлтын state
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [dateFrom, setDateFrom] = useState(''); 
  const [dateTo, setDateTo] = useState('');

  // 1. Дата татах функц (Хайлт болон Хуудаслалтыг хамт хүлээн авна)
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

  // Хайлт бичих үед (Debounce)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Filter эсвэл Огноо өөрчлөгдөх үед шууд шүүнэ
  useEffect(() => {
    fetchUsers(1);
  }, [statusFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Үйлчлүүлэгдийн удирдлага</h2>
          <p className="text-slate-500 mt-1">Платформ дээр бүртгэлтэй бүх үйлчлүүлэгчдийг удирдах.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium text-sm shadow-lg shadow-emerald-100">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          
          {/* ХАЙЛТ: Нэр, И-мэйл эсвэл Дуудлагын ID */}
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
          
          {/* ШҮҮЛТҮҮРҮҮД */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Огноо сонгох: Эхлэх */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 overflow-hidden focus-within:border-emerald-500 transition-colors">
              <Calendar className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="date" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm text-slate-600 outline-none bg-transparent"
                title="Эхлэх огноо"
              />
            </div>
            
            <span className="text-slate-400">-</span>
            
            {/* Огноо сонгох: Дуусах */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 overflow-hidden focus-within:border-emerald-500 transition-colors">
              <input 
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm text-slate-600 outline-none bg-transparent"
                title="Дуусах огноо"
              />
            </div>

            {/* Статусаар шүүх */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex items-center gap-2 text-slate-600 bg-white hover:bg-slate-50 text-sm font-medium px-4 py-2 pl-9 rounded-xl border border-slate-200 transition-colors appearance-none cursor-pointer outline-none"
              >
                <option value="all">Бүх төлөв</option>
                <option value="active">Идэвхтэй</option>
                <option value="suspended">Идэвхгүй</option>
              </select>
              <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* ... (Table болон Pagination хэсэг яг хэвээрээ байна) ... */}
        {loading ? (
          <div className="p-8 text-center text-slate-500">Уншиж байна...</div>
        ) : (
          <Table 
            data={users}
            columns={[
              { header: 'ID', accessor: 'id', className: 'w-16' },
              { 
                header: 'Нэр', 
                accessor: (item: any) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-medium text-xs">
                      {item.name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-900">{item.name}</span>
                  </div>
                )
              },
              { header: 'Email', accessor: 'email' },
              { header: 'Утас', accessor: (item: any) => item.phone || '-' },
              { 
                header: 'Status', 
                accessor: (item: any) => (
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    item.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {item.status}
                  </span>
                )
              },
              { 
                header: 'Бүртгүүлсэн огноо', 
                accessor: (item: any) => new Date(item.created_at).toLocaleDateString('mn-MN') 
              },
              { 
                header: 'Actions', 
                accessor: () => (
                  <div className="flex items-center gap-2">
                    <button className="text-xs font-medium text-emerald-600 hover:underline">Edit</button>
                    <button className="text-xs font-medium text-rose-600 hover:underline">Delete</button>
                  </div>
                ),
                className: 'text-right'
              }
            ]}
          />
        )}

        {/* Pagination */}
        {!loading && pagination && (
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500">Нийт {pagination.total} хэрэглэгч байна</p>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchUsers(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="px-3 py-1 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50">Өмнөх</button>
              <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm font-medium">{pagination.current_page}</span>
              <button onClick={() => fetchUsers(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page} className="px-3 py-1 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50">Дараах</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};