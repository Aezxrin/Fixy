import React, { useState } from 'react';
import { ArrowRight, X, Smartphone, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero() {
  // Модал цонхнуудын төлөв хадгалах
  const [showDetails, setShowDetails] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  return (
    <section id="hero" className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-teal-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Зүүн тал: Текст анимейшн */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Таны цагийг хэмнэж,
              <span className="block bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mt-2">
                үр дүн авчирна
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              Засвар үйлчилгээний нэгдсэн ухаалаг платформ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              
              {/* АПП ТАТАХ товч */}
              <button 
                onClick={() => setShowDownload(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Апп татах
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              {/* ДЭЛГЭРЭНГҮЙ товч */}
              <button 
                onClick={() => setShowDetails(true)}
                className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
              >
                Дэлгэрэнгүй
              </button>
            </div>
          </motion.div>

          {/* Баруун тал: Хөвдөг картууд */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <motion.div 
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-3xl blur-3xl"
              />
              
              <div className="relative bg-gradient-to-br from-blue-100 to-teal-100 rounded-3xl p-8 sm:p-12 flex items-center justify-center shadow-2xl">
                <div className="grid grid-cols-2 gap-4 w-full">
                  {[
                    { color: "from-blue-500 to-teal-500", delay: 0, mt: "mt-0" },
                    { color: "from-coral-500 to-orange-500", delay: 1, mt: "mt-8" },
                    { color: "from-teal-500 to-blue-500", delay: 0.5, mt: "-mt-4" },
                    { color: "from-orange-500 to-coral-500", delay: 1.5, mt: "mt-4" }
                  ].map((card, i) => (
                    <motion.div 
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 3, delay: card.delay }}
                      className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow ${card.mt}`}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl mb-4`}></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* --- ДЭЛГЭРЭНГҮЙ ЦОНХ (MODAL) --- */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white rounded-[2rem] p-8 sm:p-12 max-w-2xl w-full shadow-2xl border border-slate-100 z-10 overflow-hidden"
            >
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-50 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-50 rounded-full blur-3xl -z-10"></div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 relative z-10">
                Бидний түүх: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">Яагаад Fixy гэж?</span>
              </h3>

              <div className="space-y-5 text-slate-600 leading-relaxed sm:text-lg relative z-10">
                <p>
                  Амьдрал үргэлж гэнэтийн зүйлсээр дүүрэн байдаг. Гэрт ус алдах, цахилгаан саатах, эсвэл шинэ тавилгаа угсрах шаардлага гарах үед хамгийн эхний асуудал бол <strong>"Хэнд хандах вэ?"</strong> гэдэг асуулт юм.
                </p>
                <p>
                  Танил талаасаа асуух, сошиал группээс хайх нь ихэвчлэн цаг үрсэн, баталгаагүй байдаг. Тэгвэл <strong>Fixy</strong> нь яг энэ асуудлыг шийдвэрлэхээр бүтээгдсэн.
                </p>
                <p>
                  Бид зүгээр нэг дуудлагын төв биш, харин таны <strong>цаг хугацааг хэмнэх, сэтгэлийн амар тайван байдлыг өгөх</strong> технологийн гүүр юм. Таны оруулсан хүсэлт хэдхэн хормын дотор хамгийн ойр байгаа, ур чадвар нь баталгаажсан мэргэжилтнүүдэд хүрч, асуудлыг тань үндсээр нь шийдэх болно.
                </p>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
                >
                  Ойлголоо
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- АПП ТАТАХ ЦОНХ (ПОСТЕР MODAL) --- */}
      <AnimatePresence>
        {showDownload && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDownload(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white rounded-[2rem] p-8 max-w-4xl w-full shadow-2xl z-10 flex flex-col md:flex-row gap-8 items-center"
            >
              {/* Хаах товч */}
              <button
                onClick={() => setShowDownload(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors z-20"
              >
                <X size={20} />
              </button>

              {/* Зүүн тал: Постер зураг / Mockup */}
              <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 to-teal-400 rounded-2xl p-8 flex flex-col items-center justify-center text-white text-center shadow-inner aspect-square md:aspect-[4/5] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                
                <Smartphone size={100} className="mb-6 drop-shadow-xl text-white" strokeWidth={1.5} />
                <h4 className="text-3xl font-extrabold mb-2 tracking-wide">FIXY APP</h4>
                <p className="text-blue-50 font-medium text-lg opacity-90">Засвар үйлчилгээг халааснаасаа</p>
              </div>

              {/* Баруун тал: Татах заавар болон линкүүд */}
              <div className="w-full md:w-1/2 flex flex-col justify-center px-4">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                  Аппликейшн <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">Татаж авах</span>
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                  Та доорх QR кодыг гар утсаараа уншуулах эсвэл өөрийн үйлдлийн системийг сонгон апп-аа үнэгүй суулгаарай.
                </p>
                
                <div className="flex items-center gap-6 mb-4">
                  {/* QR Кодны хэсэг */}
                  <div className="w-28 h-28 bg-white border-2 border-slate-100 shadow-sm rounded-2xl flex items-center justify-center shrink-0">
                    <QrCode size={64} className="text-slate-800" strokeWidth={1.5} />
                  </div>
                  
                  {/* Дэлгүүрийн товчнууд */}
                  <div className="flex flex-col gap-3 w-full max-w-[200px]">
                    <button className="flex items-center justify-center w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg">
                      App Store
                    </button>
                    <button className="flex items-center justify-center w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg">
                      Google Play
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}