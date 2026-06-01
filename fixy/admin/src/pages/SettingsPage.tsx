import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Bell, Shield, Globe, User, Lock, Save, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export const SettingsPage = () => {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Нууц үг харах/нуух төлөвүүд
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const handleProfileUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const response = await api.patch('http://192.168.1.4:8000/api/profile/update', profileData);
    
    if (response.data.success) {
      alert('Мэдээлэл амжилттай шинэчлэгдлээ!');
    }
  } catch (error: any) {
    alert('Шинэчлэхэд алдаа гарлаа: ' + (error.response?.data?.message || 'Сервертэй холбогдож чадсангүй'));
  } finally {
    setLoading(false);
  }
};
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      return alert('Шинэ нууц үгс зөрүүтэй байна!');
    }

    setLoading(true);
    try {
      // UserController-ийн updatePassword функц рүү хандана
      // URL: /api/admin/profile/password (api client өөрөө /admin prefix-тэй бол)
      const response = await api.patch('/profile/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      }); 

      if (response.data.success) {
        alert('Нууц үг амжилттай солигдлоо!');
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        alert(error.response.data.message || 'Одоогийн нууц үг буруу байна.');
      } else if (error.response?.status === 404) {
        alert("Backend Route олдсонгүй (404). api.php дээрх хаягаа шалгана уу.");
      } else {
        alert('Нууц үг солиход алдаа гарлаа.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Тохиргоо</h2>
        <p className="text-slate-500 mt-1">Хувийн мэдээлэл болон аюулгүй байдлын тохиргоо.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 space-y-1">
          {[
            { id: 'profile', label: 'Хувийн мэдээлэл', icon: User },
            { id: 'password', label: 'Аюулгүй байдал', icon: Shield },
            { id: 'general', label: 'Ерөнхий тохиргоо', icon: Globe },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                activeTab === tab.id ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card title="Миний мэдээлэл" icon={<User className="w-4 h-4" />}>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Бүтэн нэр</label>
                    <input 
                      type="text" 
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm focus:border-emerald-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">И-мэйл хаяг</label>
                    <input 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm focus:border-emerald-500" 
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button 
                    disabled={loading}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-md"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Хадгалах
                  </button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card title="Нууц үг шинэчлэх" icon={<Lock className="w-4 h-4" />}>
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                
                {/* Одоогийн нууц үг */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Одоогийн нууц үг</label>
                  <div className="relative">
                    <input 
                      type={showCurrent ? "text" : "password"} 
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm focus:border-emerald-500 pr-12" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Шинэ нууц үг */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Шинэ нууц үг</label>
                    <div className="relative">
                      <input 
                        type={showNew ? "text" : "password"} 
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm focus:border-emerald-500 pr-12" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Дахин оруулах */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Шинэ нууц үг давтах</label>
                    <div className="relative">
                      <input 
                        type={showConfirm ? "text" : "password"} 
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm focus:border-emerald-500 pr-12" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    Нууц үг шинэчлэх
                  </button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'general' && (
            <Card title="Ерөнхий тохиргоо" icon={<Globe className="w-4 h-4" />}>
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Globe className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm italic">Системийн ерөнхий тохиргооны хэсэг удахгүй нэмэгдэнэ.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};