import React, { useState, useEffect } from 'react';
import { Bell, User as UserIcon, PhoneCall, UserPlus, Wrench, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { fetchNotifications, Notification } from '../api/client'; // Дээр үүсгэсэн API функцээ оруулж ирнэ

export const Topbar = () => {
  const user = useAuthStore((state) => state.user);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Component ачааллахад Backend-ээс мэдэгдэл татах
  useEffect(() => {
    const getNotifs = async () => {
      setIsLoading(true);
      const data = await fetchNotifications();
      setNotifications(data);
      setIsLoading(false);
    };

    getNotifs();

    // Хэрвээ та байнга шинэчлэгддэг (Polling) байлгахыг хүсвэл доорхыг ашиглана (1 минут тутамд)
    // const interval = setInterval(getNotifs, 60000);
    // return () => clearInterval(interval);
  }, []);

  // Цагийг хэлбэржүүлэх (Жишээ: "10 мин өмнө")
  const formatTimeAgo = (dateString: string) => {
    // Жижиг туслах функц: Жинхэнэ төсөл дээр 'date-fns' эсвэл 'moment' ашиглах нь дээр
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Дөнгөж сая';
    if (diffMins < 60) return `${diffMins} мин өмнө`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} цагийн өмнө`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'call': return <PhoneCall className="w-5 h-5 text-blue-500" />;
      case 'technician': return <Wrench className="w-5 h-5 text-orange-500" />;
      case 'customer': return <UserPlus className="w-5 h-5 text-emerald-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-6">
        
        {/* Мэдэгдлийн хэсэг */}
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

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[32rem]">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <span className="font-semibold text-slate-700">Мэдэгдлүүд</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                    {unreadCount} шинэ
                  </span>
                )}
              </div>
              
              <div className="overflow-y-auto flex-1">
                {isLoading ? (
                  <div className="p-8 flex justify-center items-center text-slate-400">
                     Уншиж байна...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                    <Bell className="w-8 h-8 text-slate-300" />
                    <p>Мэдэгдэл алга байна</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 border-b border-slate-50 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="mt-1 shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${!notif.is_read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.desc}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-[11px] font-medium">
                            {formatTimeAgo(notif.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-3 text-center text-sm text-emerald-600 hover:bg-slate-50 cursor-pointer font-medium border-t border-slate-100 shrink-0">
                Бүгдийг харах
              </div>
            </div>
          )}
        </div>
        
        {/* Хэрэглэгчийн мэдээлэл */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{user?.name || 'Админ'}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || 'Administrator'}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 overflow-hidden border border-emerald-200">
            {/* ТАЙЛБАР: Энд TypeScript алдааг (user as any) гэж хуурч болох ч, таны types/index.ts зөв бол алдаа гарах ёсгүй. Хэрэв гарвал зураггүй мэтээр ажиллуулна. */}
            {(user && 'avatar' in user && user.avatar) ? (
              <img src={(user as any).avatar} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};