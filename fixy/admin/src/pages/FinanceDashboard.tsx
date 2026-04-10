import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { StatCard } from '../components/Card';

export const FinanceDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Санхүүгийн Хянах Самбар</h2>
        <p className="text-slate-500 mt-1">Орлого, зарлага болон гүйлгээний мэдээлэл</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Нийт орлого (Энэ сар)" 
          value="₮0" 
          icon={<DollarSign className="w-6 h-6" />} 
          trend={{ value: 0, isUp: true }}
          color="emerald"
        />
        <StatCard 
          label="Засварчдын цалин" 
          value="₮0" 
          icon={<ArrowUpRight className="w-6 h-6" />} 
          trend={{ value: 0, isUp: false }}
          color="rose"
        />
        <StatCard 
          label="Системийн шимтгэл (Ашиг)" 
          value="₮0" 
          icon={<Activity className="w-6 h-6" />} 
          trend={{ value: 0, isUp: true }}
          color="blue"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-8 text-center text-slate-500">
        <h3 className="text-lg font-medium text-slate-800 mb-2">Сүүлийн гүйлгээнүүд</h3>
        <p>Одоогоор системд ямар нэгэн төлбөр тооцоо, гүйлгээ хийгдээгүй байна.</p>
        <p className="text-sm mt-2">Засварын дуудлагын хэсэг ажиллаж эхлэх үед энэ хүснэгт датагаар дүүрэх болно.</p>
      </div>
    </div>
  );
};