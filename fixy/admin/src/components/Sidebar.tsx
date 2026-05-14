import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Wrench, PhoneCall, Settings, 
  LogOut, Hammer, FileText, Database, Archive, X,
  AlertTriangle, Archive as ArchiveIcon, FileSearch // Илүү цэвэрхэн байх үүднээс импортыг нэгтгэв
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const getLogoText = () => {
    // Мөн л Number() ашиглана
    if (Number(user?.role_id) === 2) return ' Manager';
    if (Number(user?.role_id) === 3) return ' Finance';
    return ' Admin'; 
  };

  const getNavItems = () => {
    // МЕНЕЖЕР (role_id === 2)
    if (Number(user?.role_id) === 2) {
      return [
        { icon: Users, label: 'Шинэ засварчид', path: '/manager/requests' },
        { icon: AlertTriangle, label: 'Гомдол & Хяналт', path: '/manager/complaints' },
        { icon: ArchiveIcon, label: 'Архив', path: '/manager/archive' },
        { icon: FileSearch, label: 'Профайл & Түүх', path: '/manager/profiles' },
        { icon: Settings, label: 'Тохиргоо', path: '/settings' },
      ];
    }
    
    // САНХҮҮ (role_id === 3)
    if (Number(user?.role_id) === 3) {
      return [
        { icon: LayoutDashboard, label: 'Хянах самбар', path: '/finance/dashboard' },
        { icon: FileText, label: 'Санхүүгийн тайлан', path: '/reports' },
        { icon: Settings, label: 'Тохиргоо', path: '/settings' },
      ];
    }
    
    // АДМИН (role_id === 1)
    return [
      { icon: LayoutDashboard, label: 'Хянах самбар', path: '/' },
      { icon: Users, label: 'Үйлчлүүлэгчид', path: '/users' },
      { icon: Wrench, label: 'Засварчид', path: '/technicians' },
      { icon: PhoneCall, label: 'Дуудлагууд', path: '/calls' },
      { icon: FileText, label: 'Тайлан', path: '/reports' },
      { icon: Database, label: 'Үйлчилгээний төрөл', path: '/master-data' },
      { icon: Archive, label: 'Архив', path: '/archive' },
      { icon: Settings, label: 'Тохиргоо', path: '/settings' },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Hammer className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">{getLogoText()}</h1>
        </div>
        
        {/* Утсан дээр харагдах X товч */}
        <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-500 font-medium" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Гарах</span>
        </button>
      </div>
    </aside>
  );
};