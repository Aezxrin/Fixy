import React, { useState } from 'react';
import { Download, Filter, FileSpreadsheet, Calendar, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const REPORT_TYPES = [
  { id: 'finance', name: 'Санхүүгийн тайлан' },
  { id: 'calls', name: 'Дуудлагын тайлан' },
  { id: 'technicians', name: 'Засварчдын тайлан' },
  { id: 'users', name: 'Үйлчлүүлэгчдийн тайлан' }
];

export const ReportsPage = () => {
  const [selectedType, setSelectedType] = useState('calls'); // Санхүүгээс бусад нь байгаа тул calls-ээс эхэлье
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Жинхэнэ дата хадгалах State
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Өгөгдлийн сангаас шүүж татах функц
  const handleFetchData = async () => {
    setIsLoading(true);
    try {
      // API руу явуулах шүүлтүүрүүд (Query Parameters)
      const queryParams = new URLSearchParams({
        type: selectedType,
        ...(dateFrom && { from: dateFrom }),
        ...(dateTo && { to: dateTo })
      }).toString();

      const response = await fetch(`http://localhost:8000/api/admin/reports?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          // Хэрэв Sanctum токен хэрэгтэй бол доорхыг ашиглана:
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });

      if (!response.ok) throw new Error('Өгөгдөл татахад алдаа гарлаа');
      
      const json = await response.json();
      // Backend-ээс { success: true, data: [...] } гэж ирнэ гэж тооцоолов
      setReportData(json.data || []); 
      
    } catch (error) {
      console.error(error);
      alert('Мэдээлэл татахад алдаа гарлаа. Backend API ажиллаж байгаа эсэхийг шалгана уу.');
    } finally {
      setIsLoading(false);
    }
  };

  // Excel файл руу экспортлох (Ямар ч өөрчлөлт орохгүй, жинхэнэ дата дээр ажиллана)
  const handleExportExcel = () => {
    if (reportData.length === 0) return alert("Татах өгөгдөл алга байна. Эхлээд Шүүх товчийг дарна уу.");

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Тайлан");
    
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Fixy_${selectedType}_${today}.xlsx`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Системийн тайлан</h1>
          <p className="text-slate-500 mt-1">Жинхэнэ датаг өгөгдлийн сангаас шүүж экспортлох</p>
        </div>
        
        <button 
          onClick={handleExportExcel}
          disabled={reportData.length === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
            reportData.length > 0 
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Download className="w-4 h-4" />
          Excel татах
        </button>
      </div>

      {/* Шүүлтүүрийн хэсэг */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Тайлангийн төрөл</label>
          <div className="relative">
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
            >
              {REPORT_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <FileSpreadsheet className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Эхлэх огноо</label>
          <div className="relative">
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Дуусах огноо</label>
          <div className="relative">
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Шүүх товч API дуудна */}
        <button 
          onClick={handleFetchData}
          disabled={isLoading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
          {isLoading ? 'Уншиж байна...' : 'Шүүж татах'}
        </button>
      </div>

      {/* Тайлангийн Preview хүснэгт */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {reportData.length > 0 ? (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
                <tr>
                  {Object.keys(reportData[0] || {}).map((key, index) => (
                    <th key={index} className="px-6 py-4 whitespace-nowrap">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
                    {Object.values(row).map((val: any, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                        {/* Хэрэв URL линк байвал дарагдах боломжтой болгох */}
                        {typeof val === 'string' && val.startsWith('http') ? (
                          <a href={val} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline cursor-pointer">
                            Үзэх
                          </a>
                        ) : (
                          val
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-slate-900 font-medium mb-1">Мэдээлэл байхгүй байна</h3>
              <p className="text-slate-500 text-sm">Тайлангийн төрөл болон огноог сонгоод "Шүүж татах" товчийг дарна уу.</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};