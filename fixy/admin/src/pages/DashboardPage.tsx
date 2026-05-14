import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Wrench, 
  PhoneCall, 
  CheckCircle2, 
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  Activity,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard, Card } from '../components/Card';
import { Table } from '../components/Table';
import { cn } from '../utils/cn';
import api from '../api/client';

// Интерфэйс тодорхойлох
interface RepairRequest {
  id: number;
  customer_name: string;
  service_type: string;
  status: string;
  created_at: string;
}

interface DashboardStats {
  totalUsers: number;
  technicians: number;
  activeCalls: number;
  completedCalls: number;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    technicians: 0,
    activeCalls: 0,
    completedCalls: 0
  });
  const [recentRequests, setRecentRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportMenu, setShowReportMenu] = useState(false);

  // Өгөгдөл татах функц
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/summary');
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentRequests(response.data.recentCalls);
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Тайлан руу шилжих функц
  const handleAction = (path: string) => {
    navigate(path);
    setShowReportMenu(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Мэдээлэл шинэчилж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Хяналтын самбар</h2>
          <p className="text-slate-500 mt-1">Fixy системийн өнөөдрийн ерөнхий төлөв байдал</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
            Live Status
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Нийт үйлчлүүлэгчид" 
          value={stats.totalUsers.toLocaleString()} 
          icon={<Users className="w-6 h-6" />} 
          color="blue"
        />
        <StatCard 
          label="Идэвхтэй засварчид" 
          value={stats.technicians.toString()} 
          icon={<Wrench className="w-6 h-6" />} 
          color="emerald"
        />
        <StatCard 
          label="Идэвхтэй дуудлага" 
          value={stats.activeCalls.toString()} 
          icon={<PhoneCall className="w-6 h-6" />} 
          color="amber"
        />
        <StatCard 
          label="Дууссан засвар" 
          value={stats.completedCalls.toString()} 
          icon={<CheckCircle2 className="w-6 h-6" />} 
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Requests Table */}
        <Card 
          title="Сүүлийн үеийн дуудлагууд" 
          className="lg:col-span-2 shadow-sm border-slate-100"
          subtitle="Хэрэглэгчдээс ирсэн сүүлийн 5 дуудлага"
        >
          <Table 
            data={recentRequests}
            columns={[
              { 
                header: 'Үйлчлүүлэгч', 
                accessor: (item: RepairRequest) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">
                      {item.customer_name?.charAt(0) || 'U'}
                    </div>
                    <span className="font-semibold text-slate-700">{item.customer_name || 'Зочин'}</span>
                  </div>
                ) 
              },
              { header: 'Үйлчилгээ', accessor: 'service_type' },
              { 
                header: 'Төлөв', 
                accessor: (item: RepairRequest) => (
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                    item.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                    item.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    "bg-blue-50 text-blue-600 border-blue-100"
                  )}>
                    {item.status}
                  </span>
                )
              },
              { 
                header: 'Цаг', 
                accessor: (item: RepairRequest) => (
                  <span className="text-slate-400 text-xs font-medium">
                    {new Date(item.created_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )
              },
              { 
                header: '', 
                accessor: (item: RepairRequest) => (
                  <button 
                    onClick={() => navigate('/calls')}
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                ),
                className: 'text-right'
              }
            ]}
          />
        </Card>

        {/* Right Sidebar: Actions & Status */}
        <div className="space-y-6">
          <Card title="Шуурхай үйлдэл">
            <div className="relative space-y-3">
              <button 
                onClick={() => handleAction('/reports')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all text-sm font-semibold text-slate-700 group"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Тайлангийн хуудас</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
              </button>

              <button 
                onClick={() => handleAction('/technicians')}
                className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-blue-50 hover:border-blue-100 transition-all text-sm font-semibold text-slate-700 group"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-blue-500" />
                  <span>Засварчид удирдах</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </Card>

          <Card title="Системийн төлөв">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">API Server</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-emerald-600 uppercase">Online</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Database</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Connected</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};