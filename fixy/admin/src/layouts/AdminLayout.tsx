import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

export const AdminLayout = () => {
  // Утсан дээр хажуугийн цэс дэлгэгдсэн эсэхийг хадгалах
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      
      {/* 1. Мобайл цэс нээгдсэн үед арын хэсгийг бүдгэрүүлэх (Backdrop) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. Зүүн талын цэс (Sidebar) */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* 3. Баруун талын үндсэн контент хэсэг */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar руу Sidebar нээх командыг дамжуулах */}
        <Topbar onOpenSidebar={() => setIsMobileMenuOpen(true)} />
        
        {/* Энд бусад хуудсуудын контент орж ирнэ */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>

    </div>
  );
};