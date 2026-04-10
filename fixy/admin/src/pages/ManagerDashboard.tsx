import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Technician {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  status: string;
  id_card_image: string | null;     
  certificate_image: string | null;
}

export const ManagerDashboard: React.FC = () => {
  const [pendingTechnicians, setPendingTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingTechnicians = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); 
      const response = await axios.get('http://localhost:8000/api/manager/dashboard/pending-technicians', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPendingTechnicians(response.data.data);
      }
    } catch (err: any) {
      setError('Өгөгдөл татахад алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  // Энд [] байгаа тул хязгааргүй ажиллахгүй!
  useEffect(() => {
    fetchPendingTechnicians();
  }, []); 

  const handleVerify = async (id: number) => {
    if (!window.confirm('Энэ засварчныг баталгаажуулахдаа итгэлтэй байна уу?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/manager/technicians/${id}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Амжилттай баталгаажууллаа!');
      // Баталгаажсан хүнийг жагсаалтаас хасах
      setPendingTechnicians(pendingTechnicians.filter(tech => tech.id !== id));
    } catch (err) {
      alert('Баталгаажуулахад алдаа гарлаа.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Ачаалж байна...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Менежерийн Хянах Самбар</h2>
        <p className="text-slate-500 mt-1">Системд шинээр бүртгүүлсэн засварчдыг шалгаж баталгаажуулна уу.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Хүлээгдэж буй засварчид</h3>
          <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium">
            {pendingTechnicians.length} хүн
          </span>
        </div>

        {pendingTechnicians.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Одоогоор баталгаажуулалт хүлээсэн засварчин алга байна.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Нэр</th>
                  <th className="px-6 py-4">Имэйл / Утас</th>
                  <th className="px-6 py-4">Бичиг баримт</th> {/* Шинэ багана */}
                  <th className="px-6 py-4">Огноо</th>
                  <th className="px-6 py-4 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingTechnicians.map((tech) => (
                  <tr key={tech.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{tech.name}</td>
                    <td className="px-6 py-4">
                      <div>{tech.email}</div>
                      <div className="text-xs text-slate-400">{tech.phone || '-'}</div>
                    </td>
                    
                    {/* --- БИЧИГ БАРИМТ ХАРУУЛАХ ХЭСЭГ --- */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {tech.id_card_image ? (
                          <img 
                            src={`http://localhost:8000/storage/${tech.id_card_image}`} 
                            alt="ID"
                            className="w-12 h-12 object-cover rounded border cursor-zoom-in hover:scale-110 transition-transform"
                            onClick={() => window.open(`http://localhost:8000/storage/${tech.id_card_image}`, '_blank')}
                          />
                        ) : <span className="text-xs text-slate-400">Үнэмлэхгүй</span>}
                        
                        {tech.certificate_image ? (
                          <img 
                            src={`http://localhost:8000/storage/${tech.certificate_image}`} 
                            alt="Cert"
                            className="w-12 h-12 object-cover rounded border cursor-zoom-in hover:scale-110 transition-transform"
                            onClick={() => window.open(`http://localhost:8000/storage/${tech.certificate_image}`, '_blank')}
                          />
                        ) : <span className="text-xs text-slate-400">Сертификатгүй</span>}
                      </div>
                    </td>
                    {/* ---------------------------------- */}

                    <td className="px-6 py-4">
                      {new Date(tech.created_at).toLocaleDateString('mn-MN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleVerify(tech.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Зөвшөөрөх
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};