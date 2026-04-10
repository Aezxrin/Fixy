import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  PhoneCall, 
  Settings, 
  LogOut,
  Hammer,
  FileText,    // Тайлан цэсний icon
  Database,    // Мастер дата цэсний icon
  Archive      // Архив цэсний icon
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/cn';

export const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // 1. Хэрэглэгчийн эрхээс хамаарч Логоны нэрийг солих
  const getLogoText = () => {
    if (user?.role === 'manager') return 'Fixy Manager';
    if (user?.role === 'finance') return 'Fixy Finance';
    return 'Fixy Admin';
  };

  // 2. Хэрэглэгчийн эрхээс хамаарч харагдах ЦЭСНҮҮДИЙГ тохируулах
  const getNavItems = () => {
    if (user?.role === 'manager') {
      return [
        { icon: LayoutDashboard, label: 'Хянах самбар', path: '/manager/dashboard' },
        // Менежерт зориулсан өөр цэснүүдийг энд нэмж болно
      ];
    }

    if (user?.role === 'finance') {
      return [
        { icon: LayoutDashboard, label: 'Хянах самбар', path: '/finance/dashboard' },
      ];
    }

    // Бусад үед буюу Admin-д харагдах үндсэн цэснүүд (Шинэчилсэн)
    return [
      { icon: LayoutDashboard, label: 'Хянах самбар', path: '/' },
      { icon: Users, label: 'Хэрэглэгчид', path: '/users' },
      { icon: Wrench, label: 'Засварчид', path: '/technicians' },
      { icon: PhoneCall, label: 'Дуудлагууд', path: '/calls' },
      
      // --- Шинээр нэмэгдсэн хэсэг ---
      { icon: FileText, label: 'Тайлан', path: '/reports' },
      { icon: Database, label: 'Үйлчилгээний төрөл', path: '/master-data' },
      { icon: Archive, label: 'Архив', path: '/archive' },
      
      { icon: Settings, label: 'Тохиргоо', path: '/settings' },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <Hammer className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">{getLogoText()}</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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