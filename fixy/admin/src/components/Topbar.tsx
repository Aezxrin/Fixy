import React, { useState, useEffect } from 'react';
import { Bell, User as UserIcon, PhoneCall, UserPlus, Wrench, Clock, Menu } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { fetchNotifications, Notification } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';

interface TopbarProps {
  onOpenSidebar?: () => void;
}

export const Topbar = ({ onOpenSidebar }: TopbarProps) => {
  const user = useAuthStore((state) => state.user);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ШИНЭЭР БУЦААЖ НЭМСЭН ХЭСЭГ: Мэдэгдэл татах функц
  const getNotifs = async () => {
    try {
      setIsLoading(true);
      const data = await fetchNotifications();
      // Хэрэв data ирэхгүй эсвэл алдаа заавал хоосон массив онооно
      setNotifications(data || []);
    } catch (error) {
      console.error("Мэдэгдэл татахад алдаа гарлаа:", error);
      setNotifications([]); // Алдаа гарсан үед хоосон харуулна
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
     getNotifs(); // Одоо алдаа заахгүй ажиллана
  }, []);

  const formatTimeAgo = (dateString: string) => {
    // Хуучин код хэвээрээ...
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      if (isNaN(date.getTime())) return 'Мэдэгдэхгүй';
      if (diffMins < 1) return 'Дөнгөж сая';
      if (diffMins < 60) return `${diffMins} мин өмнө`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs} цагийн өмнө`;
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'call': return <PhoneCall className="w-5 h-5 text-blue-500" />;
      case 'technician': return <Wrench className="w-5 h-5 text-orange-500" />;
      case 'customer': return <UserPlus className="w-5 h-5 text-emerald-500" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    // ШИНЭ: justify-between болгосон
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 shadow-sm">
      
      {/* ШИНЭ: Утсан дээр харагдах Hamburger цэс товч */}
      <button 
        onClick={onOpenSidebar} 
        className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg focus:outline-none"
      >
        <Menu size={24} />
      </button>

      {/* Баруун талын профайл хэсэг (ml-auto нэмсэн) */}
      <div className="flex items-center gap-4 sm:gap-6 ml-auto">
        
        {/* Мэдэгдлийн хэсэг (Хуучин код хэвээрээ) */}
        <div className="relative">
          <button 
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[32rem]">
                <div className="px-4 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                  <span className="font-bold text-slate-800">Мэдэгдлүүд</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {unreadCount} ШИНЭ
                    </span>
                  )}
                </div>
                
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {isLoading && notifications.length === 0 ? (
                    <div className="p-10 flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium tracking-wide">Уншиж байна...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                         <Bell className="w-6 h-6 text-slate-200" />
                      </div>
                      <p className="text-sm font-medium">Одоогоор мэдэгдэл алга</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`px-4 py-4 border-b border-slate-50 flex gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.is_read ? 'bg-blue-50/20' : ''}`}
                      >
                        <div className="mt-1 shrink-0 p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${!notif.is_read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {notif.desc}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-bold">
                              {formatTimeAgo(notif.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-3 text-center text-xs text-emerald-600 hover:bg-emerald-50 cursor-pointer font-bold border-t border-slate-100 shrink-0 transition-colors">
                  БҮХ МЭДЭГДЛИЙГ ХАРАХ
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Хэрэглэгчийн мэдээлэл */}
        <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-900">{user?.name || 'Систем Админ'}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white overflow-hidden border-2 border-white shadow-sm ring-1 ring-emerald-100">
            {(user as any)?.avatar ? (
              <img src={(user as any).avatar} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>
        </div>

      </div>
    </header>
  );
};