import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Database, X, Loader2 } from 'lucide-react';

export const MasterDataPage = () => {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
  const [isSaving, setIsSaving] = useState(false);

  // 1. API-аас бүх үйлчилгээг татах
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/services', {
        headers: { 
          'Accept': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
        
      });
      const json = await response.json();
      if (json.success) {
        setServices(json.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Хуудас ачааллахад шууд татна
  useEffect(() => {
    fetchServices();
  }, []);

  // Modal нээх
  const openModal = (service: any = null) => {
    if (service) {
      setEditingId(service.id);
      setFormData({ name: service.name, description: service.description, status: service.status });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  // 2. Шинээр нэмэх болон Засах (API руу илгээх)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const url = editingId 
        ? `http://localhost:8000/api/admin/services/${editingId}` 
        : 'http://localhost:8000/api/admin/services';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const json = await response.json();
      
      if (json.success) {
        fetchServices(); // Амжилттай бол жагсаалтаа дахин татаж шинэчилнэ
        setIsModalOpen(false);
      } else {
        alert("Алдаа гарлаа. Мэдээллээ шалгана уу.");
      }
    } catch (error) {
      console.error(error);
      alert("Сервертэй холбогдоход алдаа гарлаа.");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Устгах (API руу илгээх)
  const handleDelete = async (id: number) => {
    if (!window.confirm('Энэ үйлчилгээний төрлийг устгахдаа итгэлтэй байна уу?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { 
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
         }
      });

      if (response.ok) {
        fetchServices(); // Устгасны дараа жагсаалтаа шинэчлэх
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Database className="w-6 h-6 text-emerald-500" />
            Үйлчилгээний төрөл
          </h1>
          <p className="text-slate-500 mt-1">Аппликейшн дээр гарах засварын ангиллуудыг удирдах</p>
        </div>
        
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Шинэ төрөл нэмэх
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
            Уншиж байна...
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Төрлийн нэр</th>
                <th className="px-6 py-4">Тайлбар</th>
                <th className="px-6 py-4">Засварчдын тоо</th>
                <th className="px-6 py-4">Төлөв</th>
                <th className="px-6 py-4 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">#{service.id}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">{service.name}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{service.description}</td>
                  <td className="px-6 py-4">
                    <span className="font-medium bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                      {service.technicians_count || 0} хүн
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      service.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {service.status === 'active' ? 'Идэвхтэй' : 'Идэвхгүй'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openModal(service)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(service.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Үйлчилгээний төрөл хараахан бүртгэгдээгүй байна.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'Төрөл засах' : 'Шинэ төрөл нэмэх'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Нэр (Жишээ: Сантехник)</label>
                  <input 
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Товч тайлбар</label>
                  <textarea 
                    rows={3} value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Төлөв</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="active">Идэвхтэй (Апп дээр харагдана)</option>
                    <option value="inactive">Идэвхгүй (Нуугдсан)</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Цуцлах
                </button>
                <button 
                  type="submit" disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};