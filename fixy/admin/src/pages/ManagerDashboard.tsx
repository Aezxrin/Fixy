import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Card } from '../components/Card';
import { 
  Users, AlertTriangle, Archive as ArchiveIcon, FileSearch, 
  CheckCircle, XCircle, FileText, Search, ShieldAlert,
  Clock, UserCheck, FolderOpen, Filter, Download,
  History, Calendar, Info, ArrowRight, Gavel, UserPlus, Eye,
  ArrowLeft, Phone, Mail, Wrench, Camera, MapPin, Star, Ban
} from 'lucide-react';
import { API_BASE_URL } from '../constants'; 
import { cn } from '../utils/cn';

interface Technician {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  status: string;
  id_card_image: string | null;     
  certificate_image: string | null;
  contract_status: string;
  signature_path: string | null;
}

export const ManagerDashboard: React.FC = () => {
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'requests';
  
  // Үндсэн State-ууд
  const [pendingTechnicians, setPendingTechnicians] = useState<Technician[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Модалууд
  const [viewingDocs, setViewingDocs] = useState<Technician | null>(null);
  const [viewingContract, setViewingContract] = useState<Technician | null>(null);

  // ПРОФАЙЛ БОЛОН ДУУДЛАГЫН STATE-УУД
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [selectedCall, setSelectedCall] = useState<any>(null); 

  // 1. Шинэ засварчдыг татах
  const fetchPendingTechnicians = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); 
      const response = await axios.get(`${API_BASE_URL}/manager/dashboard/pending-technicians`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setPendingTechnicians(response.data.data);
    } catch (err: any) {
      setError('Өгөгдөл татахад алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Гомдол татах функц
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); 
      const response = await axios.get(`${API_BASE_URL}/manager/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setComplaints(response.data.data);
    } catch (err) { 
      console.error('Гомдол татахад алдаа:', err); 
    } finally { 
      setLoading(false); 
    }
  };

  // 3. ХАЙЛТ ХИЙХ ФУНКЦ
  const handleSearchUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/manager/users/search?q=${searchQuery}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (response.data.success) {
        setSearchResults(response.data.data);
        setSelectedProfile(null); 
      }
    } catch (err) { 
      alert('Хайлт хийхэд алдаа гарлаа.'); 
    } finally { 
      setIsSearching(false); 
    }
  };

  // 4. ПРОФАЙЛ ТАТАХ ФУНКЦ
  const handleViewProfile = async (id: number) => {
    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/manager/users/${id}/profile`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (response.data.success) {
        setSelectedProfile(response.data.data);
      }
    } catch (err) { 
      alert('Профайл татахад алдаа гарлаа.'); 
    } finally { 
      setIsSearching(false); 
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') fetchPendingTechnicians();
    else if (activeTab === 'complaints') fetchComplaints();
    else setLoading(false);
  }, [activeTab]); 

  // ==========================================
  // ГЭРЭЭНИЙ ФУНКЦҮҮД
  // ==========================================

  const handleSendContract = async (id: number) => {
    if (!window.confirm('Энэ засварчин руу цахим гэрээ зурах эрх илгээх үү?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/manager/technicians/${id}/send-contract`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Гэрээ амжилттай илгээгдлээ!');
      setViewingDocs(null); 
      fetchPendingTechnicians();
    } catch (err) { alert('Гэрээ илгээхэд алдаа гарлаа.'); }
  };

  const handleApproveContract = async (id: number) => {
    if (!window.confirm('Гэрээг баталж, дуудлага авах эрхийг бүрэн нээх үү?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/manager/technicians/${id}/approve-contract`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Гэрээ батлагдлаа! Засварчин одоо дуудлага авах боломжтой.');
      setViewingContract(null); 
      fetchPendingTechnicians();
    } catch (err) { alert('Батлахад алдаа гарлаа.'); }
  };

  // ==========================================
  // ГОМДОЛ БОЛОН ШИЙТГЭЛИЙН ФУНКЦҮҮД (ШИНЭЧЛЭГДСЭН)
  // ==========================================

  const handleResolveComplaint = async (id: number) => {
    if (!window.confirm('Энэ гомдлыг шийдвэрлэсэн гэж үзэх үү?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/manager/complaints/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(complaints.filter(c => c.id !== id));
      alert('Гомдол шийдвэрлэгдлээ.');
    } catch (err) { alert('Алдаа гарлаа.'); }
  };

  // 1. САНУУЛГА ИЛГЭЭХ
  const handleSendWarning = async (techId: number) => {
    // Менежерээс шалтгааныг нь асуух
    const reason = window.prompt('Засварчинд илгээх сануулгын шалтгааныг бичнэ үү:', 'Үйлчлүүлэгчээс гомдол ирлээ. Анхаарна уу!');
    if (!reason) return; // Хэрэв цуцлах дарвал зогсоно

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/manager/technicians/${techId}/send-warning`, { message: reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Сануулга амжилттай илгээгдлээ. Засварчны апп дээр мэдэгдэл очно.');
    } catch (err) {
      alert('Сануулга илгээхэд алдаа гарлаа.');
    }
  };

  // 2. ЭРХ ТҮДГЭЛЗҮҮЛЭХ
  const handleSuspendTech = async (techId: number) => {
    if (!window.confirm('АНХААРУУЛГА: Энэ засварчны эрхийг үнэхээр түдгэлзүүлэх үү? Ингэснээр шинэ дуудлага авах боломжгүй болно.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/manager/technicians/${techId}/suspend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Засварчны эрхийг амжилттай түдгэлзүүллээ.');
    } catch (err) {
      alert('Эрх түдгэлзүүлэх үед алдаа гарлаа.');
    }
  };

  // 3. ДУУДЛАГЫН ДЭЛГЭРЭНГҮЙ ХАРАХ
  const handleViewComplaintCall = (comp: any) => {
    // Гомдол дотор repair_request (эсвэл call) гэсэн обект байгаа гэж үзээд модал нээнэ
    const callData = comp.repair_request || comp.call || comp;
    if (callData) {
      setSelectedCall(callData);
    } else {
      alert('Энэ гомдолд хавсаргасан дуудлагын мэдээлэл олдсонгүй.');
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    return `${API_BASE_URL.replace('/api', '')}/storage/${path}`;
  };

  if (loading) return <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>Уншиж байна...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="text-emerald-500" /> Шинэ засварчдын хүсэлт
              </h2>
              <p className="text-slate-500 text-sm mt-1">Системд бүртгүүлсэн бичиг баримтыг шалгаж, гэрээ байгуулах хэсэг.</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100">
              Нийт хүсэлт: {pendingTechnicians.length}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingTechnicians.length === 0 ? (
              <Card className="p-16 text-center border-dashed border-2">
                <CheckCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Одоогоор баталгаажуулах хүсэлт алга байна.</p>
              </Card>
            ) : (
              pendingTechnicians.map(tech => (
                <Card key={tech.id} className="p-0 overflow-hidden hover:ring-2 hover:ring-emerald-500/20 transition-all">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1 flex gap-5">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-xl uppercase tracking-widest shrink-0">
                        {tech.name.substring(0, 2)}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-lg">{tech.name}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(tech.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {tech.email}</span>
                          <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> {tech.phone || 'Утасгүй'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between md:justify-end gap-3 border-t md:border-t-0 md:border-l border-slate-100 min-w-[280px]">
                      <button onClick={() => setViewingDocs(tech)} className="flex items-center gap-2 text-slate-600 font-bold text-sm px-4 py-2 hover:bg-slate-200 rounded-xl transition-colors">
                        <Eye className="w-4 h-4" /> Баримт
                      </button>

                      {(!tech.contract_status || tech.contract_status === 'none') && (
                        <button onClick={() => handleSendContract(tech.id)} className="flex items-center gap-2 bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                          <FileText className="w-4 h-4" /> Гэрээ илгээх
                        </button>
                      )}

                      {tech.contract_status === 'sent' && (
                        <span className="text-rose-500 font-bold text-sm px-4 py-2 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-2">
                          <Clock className="w-4 h-4"/> Зураагүй байна
                        </span>
                      )}

                      {tech.contract_status === 'signed' && (
                        <div className="flex flex-col gap-2 items-end">
                          <button 
                            onClick={() => setViewingContract(tech)}
                            className="text-emerald-600 text-sm font-bold underline hover:text-emerald-700 cursor-pointer"
                          >
                            Гэрээтэй танилцах
                          </button>
                          <button onClick={() => handleApproveContract(tech.id)} className="flex items-center gap-2 bg-emerald-500 text-white font-bold text-sm px-5 py-2 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                            <CheckCircle className="w-4 h-4" /> Батлах
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Gavel className="text-rose-500" /> Гомдол, маргаан шийдвэрлэх
              </h2>
              <p className="text-slate-500 text-sm mt-1">Хэрэглэгчийн гомдолд үндэслэн засварчны төлвийг өөрчлөх, сануулга өгөх.</p>
            </div>
            <button className="bg-white border border-slate-200 p-2.5 rounded-xl hover:bg-slate-50">
               <Filter className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Шинэ гомдлууд ({complaints.length})</h3>
                <Card className="p-0 divide-y divide-slate-100 overflow-hidden">
                  {complaints.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                      <CheckCircle className="w-10 h-10 text-emerald-400 opacity-50 mb-2" />
                      <p className="text-sm font-medium">Одоогоор шийдвэрлэх гомдол алга байна.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                    {complaints.map(comp => {
                      const isBadReview = comp.rating <= 2;
                      const isGoodReview = comp.rating >= 4;
                      
                      let cardStyle = "p-6 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ";
                      if (isBadReview) cardStyle += "bg-rose-50/50 hover:bg-rose-50 border-l-4 border-rose-500";
                      else if (isGoodReview) cardStyle += "bg-emerald-50/30 hover:bg-emerald-50 border-l-4 border-emerald-500";
                      else cardStyle += "hover:bg-slate-50 border-l-4 border-transparent";

                      return (
                        <div key={comp.id} className={cardStyle}>
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              {isBadReview ? (
                                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Яаралтай хянах</span>
                              ) : (
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Шинэ гомдол</span>
                              )}
                              <span className="text-xs text-slate-400 font-medium">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {new Date(comp.updated_at).toLocaleDateString()}
                              </span>
                              {comp.rating && (
                                <span className="text-amber-500 text-xs font-bold flex items-center gap-1 ml-2">
                                  <Star size={14} fill="#f59e0b" /> {comp.rating}/5
                                </span>
                              )}
                            </div>

                            <p className="text-slate-800 font-medium text-sm leading-relaxed italic">
                              "{comp.review || comp.issue}"
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium pt-1">
                              <span className="bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
                                Иргэн: <strong className="text-slate-700">{comp.customer?.name || comp.customer_name}</strong>
                              </span>
                              <span className="bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
                                Засварчин: <strong className="text-slate-700">{comp.technician?.name || comp.technician_name}</strong>
                              </span>
                              {/* ДУУДЛАГА ХАРАХ ТОВЧ (ШИНЭЧЛЭГДСЭН) */}
                              <button 
                                onClick={() => handleViewComplaintCall(comp)}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-bold ml-2 flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" /> Дуудлага харах
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-3 sm:mt-0 justify-end">
                            {/* ЭРХ ТҮДГЭЛЗҮҮЛЭХ УЛААН ТОВЧ */}
                            <button 
                              onClick={() => handleSuspendTech(comp.technician_id)}
                              className="p-2.5 text-rose-600 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors shadow-sm"
                              title="Эрх түдгэлзүүлэх"
                            >
                              <Ban size={18} />
                            </button>

                            {/* САНУУЛГА ИЛГЭЭХ ШАР ТОВЧ */}
                            <button 
                              onClick={() => handleSendWarning(comp.technician_id)}
                              className="p-2.5 text-amber-600 bg-white border border-amber-200 rounded-xl hover:bg-amber-50 transition-colors shadow-sm"
                              title="Сануулга илгээх"
                            >
                              <AlertTriangle size={18} />
                            </button>
                            
                            <button 
                              onClick={() => handleResolveComplaint(comp.id)}
                              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 text-white hover:bg-emerald-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                            >
                              <CheckCircle size={16} /> Шийдвэрлэх
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  )}
                </Card>
             </div>
             
             {/* ШУУРХАЙ ҮЙЛДЭЛ ЦЭС */}
             <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Шуурхай үйлдэл</h3>
                <Card className="p-4 space-y-3">
                  <button onClick={() => {
                    const id = window.prompt('Сануулга өгөх засварчны ID оруулна уу:');
                    if (id && !isNaN(Number(id))) handleSendWarning(Number(id));
                  }} className="w-full flex items-center justify-between p-3 bg-amber-50 text-amber-700 rounded-xl font-bold text-sm hover:bg-amber-100 transition-colors">
                    <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Сануулга илгээх</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <button onClick={() => {
                    const id = window.prompt('Эрх түдгэлзүүлэх засварчны ID оруулна уу:');
                    if (id && !isNaN(Number(id))) handleSuspendTech(Number(id));
                  }} className="w-full flex items-center justify-between p-3 bg-rose-50 text-rose-700 rounded-xl font-bold text-sm hover:bg-rose-100 transition-colors">
                    <span className="flex items-center gap-2"><Ban className="w-4 h-4" /> Эрх түдгэлзүүлэх</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Card>
             </div>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
         TAB 3: АРХИВ
      -------------------------------------------------------------------------- */}
      {activeTab === 'archive' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ArchiveIcon className="text-blue-500" /> Гэрээ болон дуудлагын архив
            </h2>
            <p className="text-slate-500 text-sm mt-1">Түүхэн мэдээллийг хугацаагаар шүүж харах, татаж авах хэсэг.</p>
          </div>

          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="Гэрээний дугаар, утсаар хайх..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  <Calendar className="w-4 h-4" /> Хугацаа
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                  <Download className="w-4 h-4" /> Татах
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 text-blue-500 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors"><FileText /></div>
                  <p className="text-sm font-bold text-slate-800">2026 Гэрээнүүд</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">124 Файл</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 text-emerald-500 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Clock /></div>
                  <p className="text-sm font-bold text-slate-800">Дуудлагын түүх</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">Архивлагдсан</p>
               </div>
            </div>
          </Card>
        </div>
      )}

      {/* -----------------------------------------------------------------------
         TAB 4: ПРОФАЙЛ БОЛОН ТҮҮХ ХЯНАХ 
      -------------------------------------------------------------------------- */}
      {activeTab === 'profiles' && (
        <div className="space-y-6">
          
          {!selectedProfile ? (
            <>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <FileSearch className="text-purple-500" /> Профайл болон түүх хянах
                </h2>
                <p className="text-slate-500 text-sm mt-1">Хэрэглэгч болон засварчны ID, утасны дугаараар түүхэн мэдээллийг хянах.</p>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 md:p-12 text-white text-center shadow-xl">
                 <div className="max-w-2xl mx-auto space-y-4">
                    <h3 className="text-xl md:text-2xl font-bold">Хайх хэрэглэгчийн мэдээллийг оруулна уу</h3>
                    
                    <form onSubmit={handleSearchUser} className="relative pt-4">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Утасны дугаар, Нэр эсвэл Имэйл..." 
                        className="w-full bg-white/10 border border-white/20 rounded-2xl pl-6 pr-16 py-4 outline-none focus:bg-white/20 transition-all text-white placeholder-white/50" 
                      />
                      <button 
                        type="submit"
                        disabled={isSearching}
                        className="absolute right-2 top-[calc(1rem+8px)] bg-emerald-500 p-2.5 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                      >
                        {isSearching ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Search className="w-5 h-5 text-white" />}
                      </button>
                    </form>
                 </div>
              </div>

              {/* ХАЙЛТЫН ҮР ДҮН */}
              {searchResults.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Илэрсэн үр дүн ({searchResults.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map(user => (
                      <div 
                        key={user.id} 
                        onClick={() => handleViewProfile(user.id)}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 cursor-pointer transition-all flex items-center gap-4 group"
                      >
                        {user.avatar ? (
                          <img src={getImageUrl(user.avatar)!} alt="User" className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 group-hover:border-emerald-200 transition-colors" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold text-lg group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors uppercase">
                            {user.name.substring(0, 2)}
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800">{user.name}</h4>
                          <p className="text-sm text-slate-500">{user.phone || 'Утасгүй'} • {Number(user.role_id) === 5 ? 'Засварчин' : 'Хэрэглэгч'}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            
            // --- СОНГОГДСОН ХЭРЭГЛЭГЧИЙН ПРОФАЙЛ ---
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <button 
                onClick={() => setSelectedProfile(null)}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 bg-white px-4 py-2 rounded-xl border border-slate-200 w-fit shadow-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Буцах
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* ЗҮҮН ТАЛ: ХЭРЭГЛЭГЧИЙН ЕРӨНХИЙ МЭДЭЭЛЭЛ */}
                <Card className="p-8 flex flex-col items-center text-center border-t-4 border-t-emerald-500 h-fit">
                  
                  <div className="relative">
                    {selectedProfile.user.avatar ? (
                      <img src={getImageUrl(selectedProfile.user.avatar)!} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mb-4" />
                    ) : (
                      <div className="w-28 h-28 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-4xl mb-4 shadow-lg border-4 border-white uppercase">
                        {selectedProfile.user.name.substring(0, 2)}
                      </div>
                    )}
                    <div className={`absolute bottom-5 right-1 w-5 h-5 rounded-full border-2 border-white ${selectedProfile.user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900">{selectedProfile.user.name}</h2>
                  <span className="mt-2 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {Number(selectedProfile.user.role_id) === 5 ? 'Засварчин' : 'Үйлчлүүлэгч'}
                  </span>

                  {Number(selectedProfile.user.role_id) === 5 && (
                    <div className="mt-5 w-full bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                      <Info className="w-4 h-4 text-slate-300 absolute top-3 right-3" />
                      <p className="text-sm text-slate-600 italic">
                        "{selectedProfile.user.bio || 'Одоогоор өөрийн танилцуулга (bio) мэдээллийг оруулаагүй байна.'}"
                      </p>
                    </div>
                  )}

                  <div className="w-full mt-8 space-y-4 text-left">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-slate-50 flex items-center justify-center rounded-lg text-slate-400"><Phone className="w-4 h-4"/></div>
                      <div><p className="text-xs text-slate-400 font-medium">Утас</p><p className="font-bold text-slate-700">{selectedProfile.user.phone || '-'}</p></div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-slate-50 flex items-center justify-center rounded-lg text-slate-400"><Mail className="w-4 h-4"/></div>
                      <div><p className="text-xs text-slate-400 font-medium">Имэйл</p><p className="font-bold text-slate-700">{selectedProfile.user.email || '-'}</p></div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-slate-50 flex items-center justify-center rounded-lg text-slate-400"><Calendar className="w-4 h-4"/></div>
                      <div><p className="text-xs text-slate-400 font-medium">Бүртгүүлсэн</p><p className="font-bold text-slate-700">{new Date(selectedProfile.user.created_at).toLocaleDateString()}</p></div>
                    </div>
                  </div>
                </Card>

                {/* БАРУУН ТАЛ: ДУУДЛАГЫН ТҮҮХ */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    <History className="w-4 h-4" /> Хийсэн дуудлагын түүх ({selectedProfile.calls?.length || 0})
                  </h3>
                  
                  <Card className="p-0 overflow-hidden divide-y divide-slate-100">
                    {!selectedProfile.calls || selectedProfile.calls.length === 0 ? (
                      <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-2">
                        <ArchiveIcon className="w-10 h-10 opacity-20 mb-2" />
                        <p className="text-sm font-medium">Одоогоор бүртгэгдсэн дуудлагын түүх алга байна.</p>
                      </div>
                    ) : (
                      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        {selectedProfile.calls.map((call: any) => (
                          <div 
                            key={call.id} 
                            onClick={() => setSelectedCall(call)} 
                            className="p-5 hover:bg-emerald-50/50 transition-colors flex flex-col sm:flex-row justify-between gap-4 cursor-pointer group border-l-4 border-transparent hover:border-emerald-500"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  call.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
                                  call.status === 'cancelled' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                  {call.status === 'completed' ? 'Дууссан' : call.status === 'cancelled' ? 'Цуцалсан' : 'Хүлээгдэж буй'}
                                </span>
                                <span className="text-xs text-slate-400"><Clock className="w-3 h-3 inline mr-1"/>{new Date(call.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="font-bold text-slate-800 text-sm mt-1 line-clamp-1">{call.issue_description || 'Тайлбар байхгүй'}</p>
                              <div className="text-xs text-slate-500 mt-2 flex items-center gap-3">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500"/> Дэлгэрэнгүй харах</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 flex flex-col items-end justify-between">
                              <div>
                                <p className="text-xs text-slate-400 font-medium">Төлбөр</p>
                                <p className="font-bold text-emerald-600">{call.repair_fee ? `${Number(call.repair_fee).toLocaleString()} ₮` : 'Тодорхойгүй'}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- БИЧИГ БАРИМТ ХАРАХ МОДАЛ --- */}
      {viewingDocs && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-[800px] max-w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-emerald-500" /> Баримт бичиг шалгах
              </h3>
              <button onClick={() => setViewingDocs(null)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <XCircle className="w-7 h-7" />
              </button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Иргэний үнэмлэх</h4>
                  {viewingDocs.id_card_image ? (
                    <a href={getImageUrl(viewingDocs.id_card_image)!} target="_blank" rel="noreferrer" className="block cursor-zoom-in group relative rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                      <img src={getImageUrl(viewingDocs.id_card_image)!} alt="ID" className="w-full h-auto object-contain bg-white group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Search className="text-white w-10 h-10 drop-shadow-lg" /></div>
                    </a>
                  ) : <div className="h-48 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300">Оруулаагүй</div>}
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Сертификат / Диплом</h4>
                  {viewingDocs.certificate_image ? (
                    <a href={getImageUrl(viewingDocs.certificate_image)!} target="_blank" rel="noreferrer" className="block cursor-zoom-in group relative rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                      <img src={getImageUrl(viewingDocs.certificate_image)!} alt="Cert" className="w-full h-auto object-contain bg-white group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Search className="text-white w-10 h-10 drop-shadow-lg" /></div>
                    </a>
                  ) : <div className="h-48 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300">Оруулаагүй</div>}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setViewingDocs(null)} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors">Хаах</button>
              
              {(!viewingDocs.contract_status || viewingDocs.contract_status === 'none') && (
                <button onClick={() => handleSendContract(viewingDocs.id)} className="px-8 py-3 bg-blue-500 text-white rounded-2xl text-sm font-bold hover:bg-blue-600 flex items-center gap-2 shadow-xl shadow-blue-500/30 active:scale-95 transition-all">
                  <FileText className="w-5 h-5" /> Гэрээ илгээх
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- ГЭРЭЭ ХАРАХ БОЛОН БАТЛАХ АЛБАН ЁСНЫ МОДАЛ --- */}
      {viewingContract && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[1.5rem] w-[800px] max-w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" /> Цахим гэрээ
              </h3>
              <button onClick={() => setViewingContract(null)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <XCircle className="w-7 h-7" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-slate-50 flex-1 flex justify-center custom-scrollbar">
              <div className="bg-white p-10 md:p-14 rounded-xl shadow-md border border-slate-200 max-w-2xl w-full">
                
                <h2 className="text-xl md:text-2xl font-bold text-center mb-2 text-slate-900">ЗАСВАРЧИНТАЙ ХАМТРАН АЖИЛЛАХ ГЭРЭЭ</h2>
                <p className="text-right text-sm text-slate-500 mb-8 font-serif italic">Огноо: {new Date(viewingContract.created_at).toLocaleDateString('mn-MN')}</p>
                
                <div className="text-[15px] text-slate-700 leading-relaxed space-y-5 text-justify font-serif">
                  <p>Энэхүү гэрээг нэг талаас <strong>"Fixy" платформ</strong> (цаашид "Компани" гэх), нөгөө талаас засварчин <strong>{viewingContract.name}</strong> (цаашид "Засварчин" гэх) нар дараах нөхцөлөөр харилцан тохиролцож байгуулав.</p>
                  
                  <div>
                    <p className="font-bold text-slate-900 mb-1">НЭГ. НИЙТЛЭГ ҮНДЭС</p>
                    <p>1.1 Засварчин нь платформоор дамжуулан үйлчлүүлэгчээс ирсэн дуудлагыг хүлээн авч, мэргэжлийн өндөр түвшинд, цаг тухайд нь засварын үйлчилгээ үзүүлэх үүрэгтэй.</p>
                    <p>1.2 Компани нь засварчинг дуудлагаар хангаж, системийн хэвийн үйл ажиллагааг хариуцна.</p>
                  </div>
                  
                  <div>
                    <p className="font-bold text-slate-900 mb-1">ХОЁР. ТӨЛБӨР ТООЦОО</p>
                    <p>2.1 Засварчин нь үйлчилгээний хөлснөөс платформын шимтгэл болох тодорхой хувийг Компанид төлөх үүрэгтэй.</p>
                    <p>2.2 Үйлчлүүлэгчээс авах үйлчилгээний хөлс нь ил тод байх бөгөөд засварчин нь хэт өндөр үнэ нэхэх, хууран мэхлэх үйлдэл гаргахыг хатуу хориглоно.</p>
                  </div>
                  
                  <div>
                    <p className="font-bold text-slate-900 mb-1">ГУРАВ. ТАЛУУДЫН ЭРХ, ҮҮРЭГ</p>
                    <p>3.1 <strong>Засварчны үүрэг:</strong> Дуудлагын цагийг баримтлах, үйлчлүүлэгчтэй соёлтой харилцах, хийсэн ажилдаа баталгаа гаргаж өгөх. Хувийн мэдээлэл болон баримт бичгийг үнэн зөвөөр мэдүүлэх.</p>
                    <p>3.2 <strong>Компанийн эрх:</strong> Засварчин нь дүрэм зөрчсөн, үйлчлүүлэгчээс ноцтой гомдол ирсэн тохиолдолд гэрээг дангаар цуцалж, платформоос хасах эрхтэй.</p>
                  </div>
                  
                  <div>
                    <p className="font-bold text-slate-900 mb-1">ДӨРӨВ. ХАРИУЦЛАГА БА БУСАД</p>
                    <p>4.1 Засварчин нь засвар үйлчилгээ хийх явцдаа үйлчлүүлэгчийн эд хөрөнгөд санаатай болон санамсаргүй байдлаар хохирол учруулсан тохиолдолд өөрийн зардлаар бүрэн барагдуулна.</p>
                    <p>4.2 Энэхүү гэрээ нь цахимаар гарын үсэг зурсан өдрөөс эхлэн хүчин төгөлдөр болно.</p>
                  </div>
                  
                  <p className="mt-6 pt-6 border-t border-slate-200">
                    Би, <strong>{viewingContract.name}</strong> нь энэхүү гэрээний нөхцөлийг бүрэн уншиж танилцаад, хүлээн зөвшөөрч доорх гарын үсгийг зурлаа.
                  </p>
                </div>

                <div className="mt-12 flex justify-between items-end">
                  <div className="w-[45%]">
                    <p className="text-sm font-bold text-slate-800 mb-1">Компанийг төлөөлж:</p>
                    <p className="text-sm text-slate-500">Үйлчилгээний менежер</p>
                    <div className="mt-4 text-blue-600 font-bold italic text-lg px-2 border-b-2 border-slate-300 inline-block">/Батлахад бэлэн/</div>
                  </div>
                  <div className="text-right w-[45%]">
                    <p className="text-sm font-bold text-slate-800 mb-1">Засварчин:</p>
                    <p className="text-sm text-slate-500">{viewingContract.name}</p>
                    <div className="mt-2 border-b-2 border-slate-800 pb-2">
                      <img 
                        src={getImageUrl(viewingContract.signature_path)!} 
                        alt="Signature" 
                        className="h-20 w-full object-contain mix-blend-multiply" 
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button onClick={() => setViewingContract(null)} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors">
                Хаах
              </button>
              <button onClick={() => {
                handleApproveContract(viewingContract.id);
              }} className="px-8 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 flex items-center gap-2 shadow-xl shadow-emerald-500/30 active:scale-95 transition-all">
                <CheckCircle className="w-5 h-5" /> Гэрээг батлах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ДУУДЛАГЫН ДЭЛГЭРЭНГҮЙ ХАРАХ МОДАЛ --- */}
      {selectedCall && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-[800px] max-w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Wrench className="w-6 h-6 text-emerald-500" /> 
                Дуудлагын дэлгэрэнгүй (ID: #{selectedCall.id})
              </h3>
              <button onClick={() => setSelectedCall(null)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <XCircle className="w-7 h-7" />
              </button>
            </div>
            
            <div className="p-8 max-h-[75vh] overflow-y-auto bg-slate-50/50 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-400 font-bold uppercase">Төлөв</p>
                  <p className="font-bold text-slate-800 mt-1">{selectedCall.status === 'completed' ? 'Ажил дууссан' : selectedCall.status}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs text-slate-400 font-bold uppercase">Огноо</p>
                  <p className="font-bold text-slate-800 mt-1">{new Date(selectedCall.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm col-span-2">
                  <p className="text-xs text-slate-400 font-bold uppercase">Төлбөр (Үнэлгээ)</p>
                  <p className="font-bold text-emerald-600 mt-1 text-lg">
                    {selectedCall.repair_fee ? `${Number(selectedCall.repair_fee).toLocaleString()} ₮` : 'Үнэлгээ хийгдээгүй'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Асуудлын тайлбар</p>
                <p className="text-slate-700 font-medium">{selectedCall.description || selectedCall.issue_description || 'Тайлбар оруулаагүй байна.'}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Хавсаргасан зургууд
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCall.image_path || selectedCall.image ? (
                    <a href={getImageUrl(selectedCall.image_path || selectedCall.image)!} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                      <div className="absolute top-2 left-2 bg-slate-900/60 text-white text-[10px] px-2 py-1 rounded-lg font-bold backdrop-blur-sm z-10">Өмнөх байдал</div>
                      <img src={getImageUrl(selectedCall.image_path || selectedCall.image)!} alt="Before" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                    </a>
                  ) : null}

                  {selectedCall.after_image || selectedCall.completed_image_path ? (
                    <a href={getImageUrl(selectedCall.after_image || selectedCall.completed_image_path)!} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                      <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-lg font-bold shadow-md z-10">Зассаны дараа</div>
                      <img src={getImageUrl(selectedCall.after_image || selectedCall.completed_image_path)!} alt="After" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                    </a>
                  ) : null}

                  {(!selectedCall.before_image && !selectedCall.after_image && !selectedCall.image && !selectedCall.completed_image_path) && (
                    <div className="col-span-2 p-10 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                      <Camera className="w-10 h-10 mb-2 opacity-20" />
                      <span className="text-sm font-medium">Энэ дуудлагад хавсаргасан зураг алга байна.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};