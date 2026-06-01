import React, { useState, useEffect } from 'react';
import { FileSignature, Download, AlertCircle } from 'lucide-react';
import api from '../api/client';

interface ContractUser {
  id: number;
  name: string;
  phone: string;
  email: string;
  contract_status: string;
  contract_signed_at: string | null;
}

export const ManagerContracts = () => {
  const [contracts, setContracts] = useState<ContractUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      // ШИЙДЭЛ: Бүтэн хаягаар дуудах
      const response = await api.get('http://192.168.1.4:8000/api/manager/contracts');
      if (response.data.success) {
        setContracts(response.data.data);
      }
    } catch (error) {
      console.error('Гэрээ татахад алдаа гарлаа:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (id: number, name: string) => {
    try {
      // ШИЙДЭЛ: Мөн бүтэн хаягаар дуудах
      const response = await api.get(`http://192.168.1.4:8000/api/manager/contracts/${id}/pdf`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Geree_${name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      alert("Гэрээ хараахан зурагдаагүй эсвэл татахад алдаа гарлаа.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Гарын үсэг хүлээгдэж буй</span>;
      case 'signed':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Гарын үсэг зурсан</span>;
      case 'approved':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Баталгаажсан</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
          <FileSignature className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Цахим гэрээ</h1>
          <p className="text-slate-500">Засварчидтай байгуулсан гэрээний жагсаалт, хэвлэх хэсэг</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Засварчин</th>
                <th className="px-6 py-4">Холбогдох дугаар</th>
                <th className="px-6 py-4">Төлөв</th>
                <th className="px-6 py-4">Огноо</th>
                <th className="px-6 py-4 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Уншиж байна...
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    Одоогоор гэрээ байгуулсан засварчин алга байна.
                  </td>
                </tr>
              ) : (
                contracts.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {user.name}
                    </td>
                    <td className="px-6 py-4">{user.phone}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.contract_status)}
                    </td>
                    <td className="px-6 py-4">
                      {user.contract_signed_at ? new Date(user.contract_signed_at).toLocaleDateString('mn-MN') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.contract_status !== 'sent' && (
                        <button
                          onClick={() => handleDownloadPdf(user.id, user.name)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm"
                        >
                          <Download className="w-4 h-4" />
                          PDF Татах
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};