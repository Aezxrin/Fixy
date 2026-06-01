import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { Search, RotateCcw, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../constants';

export const ArchivePage = () => {
  const [archivedRequests, setArchivedRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchArchivedData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/admin/archived-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArchivedRequests(res.data.data || []);
    } catch (error) {
      console.error("Архив татахад алдаа:", error);
    } finally {
      setLoading(false);
    }
  };

  const restoreRequest = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/admin/requests/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchArchivedData(); // Жагсаалтыг шинэчлэх
    } catch (error) {
      alert('Сэргээхэд алдаа гарлаа');
    }
  };

  useEffect(() => { fetchArchivedData(); }, []);

  // Хайлтын шүүлтүүр
  const filteredData = archivedRequests.filter(item => 
    item.id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Архивын хуудас</h2>
        <p className="text-slate-500 mt-1 text-sm">Архивлагдсан дуудлагын түүх болон сэргээх хэсэг.</p>
      </div>

      <Card className="p-6 border-0 ring-1 ring-slate-100 shadow-sm rounded-[2rem]">
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Дуудлагын ID-аар хайх..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-slate-50 pl-12 pr-4 py-2.5 rounded-xl border border-slate-100 outline-none text-sm"
          />
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-500 flex justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <Table 
              data={filteredData}
              columns={[
                { header: 'ID', accessor: (item) => <span className="font-bold">#{item.id}</span> },
                { header: 'Үйлчилгээ', accessor: (item) => item.service_type || 'Тодорхойгүй' },
                { header: 'Огноо', accessor: (item) => new Date(item.created_at).toLocaleDateString('mn-MN') },
                { header: 'Үйлдэл', accessor: (item) => (
                  <button 
                    onClick={() => restoreRequest(item.id)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Сэргээх
                  </button>
                )}
              ]}
            />
          </div>
        )}
      </Card>
    </div>
  );
};