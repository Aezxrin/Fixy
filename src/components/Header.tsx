import React, { useState } from 'react';
import { LogIn, Wrench, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '/src/favicon.png'; 

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Цэсний жагсаалт болон очих хэсгүүдийн ID
  const navLinks = [
    { name: 'Нүүр', target: 'hero' },
    { name: 'Яагаад Fixy?', target: 'features' },
    { name: 'Үйлчилгээ', target: 'services' },
    { name: 'Хэрхэн ажиллах', target: 'how-it-works' },
  ];

  // Тухайн хэсэг рүү зөөлөн гүйх функц
  const scrollToSection = (targetId: string) => {
    setIsMobileMenuOpen(false); // Утсаар орж байвал цэсийг хаах
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80; // Толгойн хэсгийн өндөр (доор нь орохгүй байхын тулд)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Лого хэсэг */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            <img 
            src={logo} 
            alt="Fixy Logo" 
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain" 
          />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-500 bg-clip-text text-transparent">
              Засварын дуудлагын 
              <tr>программ</tr>
            </h1>
          </div>

          {/* Компьютер дээр харагдах цэс */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(link.target)}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Баруун талын товчнууд */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = 'http://localhost:3000/login'}
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full font-semibold transition-all duration-200"
            >
              Нэвтрэх
              <LogIn className="w-4 h-4" />
            </button>

            {/* Гар утасны цэс дэлгэх товч */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col px-4 py-6 gap-4">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(link.target)}
                  className="text-left text-lg font-medium text-gray-700 hover:text-blue-600 py-2 transition-colors"
                >
                  {link.name}
                </button>
              ))}
              <button
                onClick={() => window.location.href = 'http://localhost:3000/login'}
                className="flex items-center justify-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-semibold"
              >
                Нэвтрэх
                <LogIn className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}