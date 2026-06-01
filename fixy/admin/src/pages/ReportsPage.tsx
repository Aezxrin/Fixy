import React, { useState } from 'react';
import { Download, Filter, FileText, Calendar, Loader2 } from 'lucide-react';
import api from '../api/client';

const REPORT_TYPES = [
  { id: 'finance', name: 'Санхүүгийн тайлан' },
  { id: 'calls', name: 'Дуудлагын тайлан' },
  { id: 'technicians', name: 'Засварчдын тайлан' },
  { id: 'users', name: 'Үйлчлүүлэгчдийн тайлан' }
];

export const ReportsPage = () => {
  const [selectedType, setSelectedType] = useState('calls');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [filterService, setFilterService] = useState('');
  const [filterTech, setFilterTech] = useState('');
  
  const handleFilterPreview = async () => {
      setIsLoadingPreview(true);
      try {
        // ШИЙДЭЛ: Хаягийг яг PDF татдаг шигээ бүтнээр нь (admin-тай) бичиж өгөх
        const response = await api.get('http://localhost:8000/api/admin/reports', {
          params: {
            type: selectedType, 
            from: dateFrom, 
            to: dateTo,
            service_type: filterService,
            tech_name: filterTech,
            action: 'preview' 
          }
        });
        
        console.log("Бэкендээс ирсэн дата:", response.data); // Алдаа гарвал шалгахад зориулав

        const resData = response.data;
        if (Array.isArray(resData)) {
            setPreviewData(resData); 
        } else if (resData && Array.isArray(resData.data)) {
            setPreviewData(resData.data); 
        } else {
            setPreviewData([]); 
        }

      } catch (error) {
        console.error("Шүүхэд алдаа гарлаа", error);
        alert("Өгөгдөл татахад алдаа гарлаа.");
      } finally {
        setIsLoadingPreview(false);
      }
    };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const queryParams = new URLSearchParams({
        type: selectedType,
        ...(dateFrom && { from: dateFrom }),
        ...(dateTo && { to: dateTo }),
        ...(filterService && { service_type: filterService }),
        ...(filterTech && { tech_name: filterTech })
      }).toString();

      const response = await fetch(`http://localhost:8000/api/admin/reports?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });

      if (!response.ok) {
        throw new Error('PDF файл татахад алдаа гарлаа');
      }

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `Fixy_${selectedType}_Report_${today}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error(error);
      alert('Тайлан татахад алдаа гарлаа. Backend API хэвийн ажиллаж байгаа эсэхийг шалгана уу.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderPreviewTable = () => {
    if (!previewData || !Array.isArray(previewData) || previewData.length === 0) {
      return (
        <div className="text-center p-8 text-gray-500">
          Сонгосон хугацаанд өгөгдөл олдсонгүй.
        </div>
      );
    }

    if (selectedType === 'calls') {
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm text-slate-700 whitespace-nowrap">
            <thead className="bg-[#1e3a8a] text-white">
              <tr>
                <th className="p-3 font-semibold">ID</th>
                <th className="p-3 font-semibold">Төрөл</th>
                <th className="p-3 font-semibold">Өмнөх зураг</th>
                <th className="p-3 font-semibold">Дараах зураг</th>
                <th className="p-3 font-semibold">Засварчин</th>
                <th className="p-3 font-semibold">Үйлчлүүлэгч</th>
                <th className="p-3 font-semibold">Хаяг, байршил</th>
                <th className="p-3 font-semibold">Асуудлын тайлбар</th>
                <th className="p-3 font-semibold">Үнэлгээ</th>
                <th className="p-3 font-semibold">Төлбөр</th>
                <th className="p-3 font-semibold">Төлөв</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {previewData.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium">#{row.id}</td>
                  <td className="p-3">{row.service_type || '-'}</td>
                  
                  {/* Өмнөх зураг */}
                  <td className="p-3">
                    {row.image_path ? (
                      <a href={`http://localhost:8000/storage/${row.image_path}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 underline text-xs">Зураг үзэх</a>
                    ) : <span className="text-slate-400 text-xs">Зураггүй</span>}
                  </td>
                  
                  {/* Дараах зураг */}
                  <td className="p-3">
                    {row.completed_image_path ? (
                      <a href={`http://localhost:8000/storage/${row.completed_image_path}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 underline text-xs">Зураг үзэх</a>
                    ) : <span className="text-slate-400 text-xs">Зураггүй</span>}
                  </td>
                  <td className="p-3">{row.tech_name || 'Оноогдоогүй'}</td>
                  <td className="p-3">{row.customer_name || 'Тодорхойгүй'}</td>      
                  <td className="p-3 max-w-[150px] truncate" title={row.address}>{row.address || '-'}</td>
                  <td className="p-3 max-w-[180px] truncate" title={row.description}>{row.description || '-'}</td>                
                  <td className="p-3 font-bold text-yellow-500">{row.rating ? `★ ${row.rating}` : '-'}</td>
                  <td className="p-3 font-medium">{row.price ? `${row.price.toLocaleString()} ₮` : '0 ₮'}</td>              
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      row.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                      row.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {row.status === 'completed' ? 'Дууссан' : row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (selectedType === 'finance') {
        return (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#1e3a8a] text-white">
              <tr>
                <th className="p-3">Засварчин</th>
                <th className="p-3 text-center">Нийт дуудлага</th>
                <th className="p-3 text-right">Нийт орлого (100%)</th>
                <th className="p-3 text-right text-yellow-300">Платформын шимтгэл (10%)</th>
                <th className="p-3 text-right text-emerald-300">Засварчинд очих (90%)</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-slate-800">{row.tech_name}</td>
                  <td className="p-3 text-center">{row.total_jobs}</td>
                  <td className="p-3 text-right font-semibold text-slate-700">
                    {row.total_revenue ? `${Number(row.total_revenue).toLocaleString()} ₮` : '0 ₮'}
                  </td>
                  <td className="p-3 text-right font-bold text-amber-600 bg-amber-50/30">
                    {row.commission ? `${Number(row.commission).toLocaleString()} ₮` : '0 ₮'}
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600 bg-emerald-50/30">
                    {row.net_income ? `${Number(row.net_income).toLocaleString()} ₮` : '0 ₮'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }

    if (selectedType === 'technicians' || selectedType === 'users') {
        return (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3">Нэр</th>
                <th className="p-3">И-мэйл</th>
                {selectedType === 'technicians' && <th className="p-3">Үйлчилгээ</th>}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">{row.name}</td>
                  <td className="p-3">{row.email}</td>
                  {selectedType === 'technicians' && <td className="p-3">{row.service_type || '-'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        );
    }

    return null;
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
    setPreviewData(null); 
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Системийн тайлан (PDF)</h1>
          <p className="text-slate-500 mt-1">Албан ёсны тайлангуудыг PDF форматаар татан авах болон шүүж харах</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-5 items-end">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Тайлангийн төрөл</label>
          <div className="relative">
            <select 
              value={selectedType}
              onChange={handleTypeChange}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium text-slate-700"
            >
              {REPORT_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <FileText className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Эхлэх огноо (Сонгохгүй байж болно)</label>
          <div className="relative">
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-700"
            />
            <Calendar className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Дуусах огноо</label>
          <div className="relative">
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-700"
            />
            <Calendar className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        {(selectedType === 'calls' || selectedType === 'finance') && (
        <div className="w-full flex gap-5 mt-4 pt-4 border-t border-slate-100">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Үйлчилгээний төрлөөр шүүх</label>
            <select 
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
            >
              <option value="">Бүх үйлчилгээ</option>
              <option value="Сантехник">Сантехник</option>
              <option value="Цахилгаан">Цахилгаан</option>
              <option value="Цонх дулаалах">Цонх дулаалах</option>
            </select>
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Засварчны нэрээр шүүх</label>
            <input 
              type="text" 
              placeholder="Жишээ нь: Батбаяр..."
              value={filterTech}
              onChange={(e) => setFilterTech(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
            />
          </div>
        </div>
      )}
        
        <button 
            onClick={handleFilterPreview} 
            disabled={isLoadingPreview}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition shadow-sm h-[42px]"
        >
            {isLoadingPreview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
            Шүүх
        </button>        
        
        <button 
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm h-[42px]"
        >
          {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {isDownloading ? 'Тайлан үүсгэж байна...' : 'PDF татах'}
        </button>
      </div>

      {/* Шүүсэн өгөгдөл байвал хүснэгт харуулна, үгүй бол хоосон төлөв харуулна */}
      {previewData ? (
        <div className="mt-8 bg-white p-4 border rounded shadow-sm overflow-x-auto">
            {renderPreviewTable()}
        </div>
      ) : (
        <div className="mt-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-slate-800 font-bold text-lg mb-2">Урьдчилж харах</h3>
            <p className="text-slate-500 text-sm max-w-md leading-relaxed">
            Та дээрх цэснээс тайлангийн төрөл болон хугацааг сонгоод "Шүүх" товчийг дарж өгөгдлийг урьдчилж харах боломжтой.
            </p>
        </div>
      )}
      
    </div>
    
  );
};