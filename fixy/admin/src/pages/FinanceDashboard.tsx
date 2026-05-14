import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, ArrowUpRight, Activity, 
  Banknote, CheckCircle, Clock, Info, Download 
} from 'lucide-react';
import { StatCard, Card } from '../components/Card';
import { API_BASE_URL } from '../constants';

export const FinanceDashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Хүлээгдэж буй мөнгө татах хүсэлтүүдийг татах
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/finance/withdrawals/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    });
      if (res.data.success) setRequests(res.data.data);
    } catch (err) {
      console.error('Санхүүгийн мэдээлэл татахад алдаа:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 2. Гүйлгээг баталгаажуулах (Шилжүүлсэн товч)
  const handleApprove = async (id: number) => {
    if (!window.confirm("Та банкны гүйлгээгээ хийж дууссан уу? 'Тийм' гэж дарвал засварчны баланс систем дээр хасагдах болно.")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/finance/withdrawals/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.filter(r => r.id !== id));
      alert("Гүйлгээ амжилттай баталгаажлаа.");
    } catch (err) {
      alert("Баталгаажуулахад алдаа гарлаа.");
    }
  };

  const totalWithdrawAmount = requests.reduce((sum, r) => sum + Number(r.amount), 0);

  if (loading) return <div className="p-10 text-center text-slate-500">Ачаалж байна...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Санхүүгийн Хянах Самбар</h2>
          <p className="text-slate-500 mt-1">Орлого, зарлага болон засварчдын мөнгө татах хүсэлт</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
          <Download size={16} /> Тайлан татах
        </button>
      </div>

      {/* Статистик картууд */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Нийт орлого (Энэ сар)" 
          value="₮0" 
          icon={<DollarSign className="w-6 h-6" />} 
          trend={{ value: 0, isUp: true }}
          color="emerald"
        />
        <StatCard 
          label="Шилжүүлэх хүсэлт (Нийт)" 
          value={`${totalWithdrawAmount.toLocaleString()} ₮`} 
          icon={<Banknote className="w-6 h-6" />} 
          trend={{ value: requests.length, isUp: true }}
          color="rose"
        />
        <StatCard 
          label="Системийн шимтгэл (Ашиг)" 
          value="₮0" 
          icon={<Activity className="w-6 h-6" />} 
          trend={{ value: 0, isUp: true }}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Зүүн тал: Хүлээгдэж буй гүйлгээнүүд */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            Шилжүүлэг хүлээж буй засварчид ({requests.length})
          </h3>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {requests.length === 0 ? (
              <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-2">
                <CheckCircle className="opacity-10" size={48} />
                <p className="font-medium text-sm">Одоогоор хүлээгдэж буй хүсэлт алга байна.</p>
              </div>
            ) : (
              requests.map(req => (
                <div key={req.id} className="p-6 hover:bg-slate-50/50 transition-colors flex justify-between items-center">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-slate-900">{Number(req.amount).toLocaleString()} ₮</span>
                      <span className="bg-amber-100 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase">
                         <Clock size={10} /> Pending
                      </span>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                       <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">
                          {req.user?.name?.substring(0, 2).toUpperCase()}
                       </div>
                       <div>
                          <p className="font-bold text-slate-700 text-sm">{req.user?.name}</p>
                          <p className="text-xs text-slate-400">{req.bank_name}</p>
                       </div>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl max-w-sm">
                       <p className="text-[10px] text-blue-400 uppercase font-bold mb-1 tracking-widest">Банкны данс:</p>
                       <p className="text-base font-mono font-bold text-blue-700">{req.account_number}</p>
                       <p className="text-xs text-blue-600 font-medium">{req.account_holder}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleApprove(req.id)}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
                  >
                    Шилжүүлсэн
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Баруун тал: Санамж */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Мэдээлэл</h3>
          <Card className="p-6 border-dashed border-2 bg-slate-50/30">
             <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Info size={16} className="text-blue-500" /> Гүйлгээний заавар
             </h4>
             <ul className="text-xs text-slate-500 space-y-4 leading-relaxed font-medium">
                <li className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0">1</div>
                  <span>Засварчны дансны дугаар болон нэрийг банкны апп дээрээ тулгаж шалгана уу.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0">2</div>
                  <span>Гүйлгээ амжилттай хийгдсэний дараа "Шилжүүлсэн" товчийг дарна уу.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0">3</div>
                  <span>Энэ үйлдэл нь засварчны системийг балансыг бодитоор хасдаг тул буцаах боломжгүйг анхаарна уу.</span>
                </li>
             </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};