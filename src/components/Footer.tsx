import React, { useState } from 'react';
import { Wrench, Phone, Mail, Facebook, Instagram, Github, Download, X, Smartphone, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '/src/favicon.png'; 

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault(); 
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const openModal = (e: React.MouseEvent<HTMLAnchorElement>, modalType: string) => {
    e.preventDefault();
    setActiveModal(modalType);
  };

  const TermsContent = () => (
    <>
      <h4 className="font-bold text-slate-900 text-xl mt-6 mb-3">1. ЕРӨНХИЙ ЗҮЙЛ</h4>
      <div className="space-y-3 text-slate-600">
        <p>1.1. “Fixy” нь гэр ахуй, албан тасалгаанд шаардлагатай засвар үйлчилгээг авах хүсэлтэй иргэдийг, тухайн чиглэлээр мэргэшсэн засварчидтай газрын зураг болон байршилд тулгуурлан шууд холбох, зуучлах үйлчилгээ үзүүлдэг Мобайл аппликейшн /цаашид “Платформ” гэх/ юм.</p>
        <p>1.2. Энэхүү үйлчилгээний нөхцөлийн зорилго нь "Fixy" ХХК /цаашид “Компани” гэх/ болон Платформоор дамжуулан үйлчилгээ авах хүсэлт гаргасан иргэн /цаашид “Захиалагч” гэх/, ажил үйлчилгээ гүйцэтгэх “Засварчин” /цаашид “Гүйцэтгэгч” гэх/ нарын хооронд үүсэх харилцааг зохицуулахад оршино.</p>
        <p>1.3. Энэхүү Үйлчилгээний нөхцөлд хэрэглэсэн нэр томьёог дор дурдсан утгаар ойлгоно. Үүнд:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>“Хэрэглэгч”</strong> гэж Платформыг ашиглаж буй иргэн, хуулийн этгээдийг;</li>
          <li><strong>“Захиалагч”</strong> гэж Платформд бүртгэл үүсгэн, засвар үйлчилгээний дуудлага илгээж буй хувь хүн, хуулийн этгээдийг;</li>
          <li><strong>“Засварчин” (Гүйцэтгэгч)</strong> гэж Платформд бүртгүүлж, баталгаажсаны үндсэн дээр Захиалагчийн дуудлагыг хүлээн авч, биечлэн очиж засвар үйлчилгээ үзүүлэх хувь хүнийг;</li>
        </ul>
        <p>1.4. Хэрэглэгч нь энэхүү “Үйлчилгээний нөхцөл”-тэй бүрэн танилцаж, бүртгүүлэх үедээ “Хүлээн зөвшөөрч байна” гэсэн сонголтыг хийснээр энэхүү нөхцөл хүчин төгөлдөр мөрдөгдөнө.</p>
        <p>1.5. Платформ дахь Засварчин нь Компанийн үндсэн ажилтан биш бөгөөд Компани нь гагцхүү Хэрэглэгчдийг хооронд нь холбох мэдээллийн технологийн дундын үйлчилгээ үзүүлэгч болно.</p>
      </div>

      <h4 className="font-bold text-slate-900 text-xl mt-8 mb-3">2. ПЛАТФОРМ АШИГЛАХ НӨХЦӨЛ, ЖУРАМ</h4>
      <div className="space-y-4 text-slate-600">
        <div>
          <h5 className="font-bold text-slate-800 mb-2">2.1. Захиалагчийн хувьд:</h5>
          <p>2.1.1. Захиалагч нь Платформд нэвтэрч, газрын зураг дээрээс өөрт ойр байрлах эсвэл онлайн байгаа Засварчдыг харах, тэдний профайл (үнэлгээ, хийсэн ажлын түүх)-тай танилцах боломжтой.</p>
          <p>2.1.2. Захиалагч дуудлага үүсгэхдээ эвдрэл, гэмтлийн талаарх мэдээллийг (зураг, тайлбар, хаяг байршил) үнэн зөв, тодорхой оруулах үүрэгтэй.</p>
          <p>2.1.3. Захиалагчийн үүсгэсэн дуудлагыг Засварчин хүлээн авч баталгаажуулснаар засвар үйлчилгээг гүйцэтгэх харилцаа үүснэ.</p>
        </div>
        
        <div>
          <h5 className="font-bold text-slate-800 mb-2">2.2. Засварчны хувьд:</h5>
          <p>2.2.1. Засварчин нь Платформд бүртгүүлэхдээ өөрийн мэргэжил, ур чадварыг үнэн зөв тодорхойлж, шаардлагатай бичиг баримтыг системд оруулж баталгаажуулна.</p>
          <p>2.2.2. Засварчин нь ажил гүйцэтгэхэд бэлэн үедээ Платформ дээр "Онлайн" төлөвт шилжих бөгөөд энэ үед Захиалагчдад түүний байршил газрын зураг дээр харагдана.</p>
          <p>2.2.3. Засварчин нь Захиалагчаас ирсэн дуудлагыг хүлээн авах эсвэл татгалзах эрхтэй. Дуудлагыг хүлээн авсан тохиолдолд Захиалагчийн хаягаар цаг алдалгүй очиж, үйлчилгээ үзүүлэх үүрэгтэй.</p>
          <p>2.2.4. Засварчин нь ажлыг бүрэн дуусгасны дараа Платформд гүйцэтгэсэн ажлын баталгаа болгож зураг оруулж "Дуусгах" үйлдлийг хийнэ.</p>
        </div>

        <div>
          <h5 className="font-bold text-slate-800 mb-2">2.3. Төлбөр тооцоо:</h5>
          <p>2.3.1. Засвар үйлчилгээний хөлс болон сэлбэг хэрэгслийн үнийг Захиалагч болон Засварчин нар газар дээр нь харилцан тохиролцож шийдвэрлэнэ.</p>
          <p>2.3.2. Компани нь Платформоор дамжуулан зуучилсны шимтгэлийг Засварчнаас суутгах эсвэл захиалгын хураамж авах эрхтэй бөгөөд үүнийг Платформын дотоод журмаар зохицуулна.</p>
        </div>
      </div>

      <h4 className="font-bold text-slate-900 text-xl mt-8 mb-3">3. ХЭРЭГЛЭГЧИЙН ЭРХ, ҮҮРЭГ</h4>
      <div className="space-y-4 text-slate-600">
        <div>
          <h5 className="font-bold text-slate-800 mb-2">3.1. Захиалагчийн үүрэг:</h5>
          <ul className="list-disc pl-6 space-y-1">
            <li>Засварчинг дуудсан хаягтаа саадгүй нэвтрүүлэх, аюулгүй ажиллах нөхцөлөөр хангах.</li>
            <li>Хийгдсэн засвар үйлчилгээний хөлсийг Засварчинд цаг тухайд нь бүрэн төлөх.</li>
            <li>Платформд бусдыг төөрөгдүүлсэн, хуурамч дуудлага үүсгэхгүй байх.</li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-slate-800 mb-2">3.2. Засварчны үүрэг:</h5>
          <ul className="list-disc pl-6 space-y-1">
            <li>Захиалагчийн дуудсан хаягт цагтаа очих, соёлтой, мэргэжлийн ёс зүйтэй харилцах.</li>
            <li>Засвар үйлчилгээг чанартай, стандартын дагуу, аюулгүй байдлыг ханган гүйцэтгэх.</li>
            <li>Ажил гүйцэтгэх үедээ Захиалагчийн эд хөрөнгөд санаатай болон болгоомжгүйгээр хохирол учруулахгүй байх.</li>
            <li>Өөрийн бүртгэлээр дамжуулан өөр гуравдагч этгээдийг Захиалагч руу явуулахгүй байх.</li>
          </ul>
        </div>
      </div>

      <h4 className="font-bold text-slate-900 text-xl mt-8 mb-3">4. КОМПАНИЙН ЭРХ, ҮҮРЭГ</h4>
      <div className="space-y-3 text-slate-600">
        <p>4.1. Компани нь Платформын хэвийн, тасралтгүй, аюулгүй ажиллагааг хангах үүрэгтэй.</p>
        <p>4.2. Платформын дүрэм журам зөрчсөн, бусдыг залилсан, ёс бус үйлдэл гаргасан Захиалагч болон Засварчны бүртгэлийг сануулахгүйгээр устгах, Платформ ашиглах эрхийг бүрмөсөн хаах эрхтэй.</p>
        <p>4.3. Компани нь үйлчилгээний чанарыг сайжруулах зорилгоор Засварчны үнэлгээ, сэтгэгдлийг хянах, шаардлага хангаагүй засварчинтай хамтран ажиллахаас татгалзах эрхтэй.</p>
      </div>

      <h4 className="font-bold text-slate-900 text-xl mt-8 mb-3">5. ХАРИУЦЛАГА</h4>
      <div className="space-y-3 text-slate-600">
        <p>5.1. Компани нь гагцхүү Хэрэглэгчдийг холбох зуучлалын мэдээллээр хангах үүрэгтэй бөгөөд Засварчны гүйцэтгэсэн ажлын чанар, баталгаа, үр дагаварт шууд хариуцлага хүлээхгүй болно.</p>
        <p>5.2. Засварчин нь үйлчилгээ үзүүлэх явцдаа Захиалагчийн эд хөрөнгө, эрүүл мэндэд хохирол учруулсан тохиолдолд үүсэх хуулийн болон эд материалын хариуцлагыг Засварчин өөрөө бүрэн хариуцна.</p>
        <p>5.3. Захиалагч нь төлбөрөө төлөхөөс зайлсхийсэн, эсвэл Засварчинд хохирол учруулсан тохиолдолд Компани хариуцлага хүлээхгүй бөгөөд талууд хуулийн байгууллагаар маргаанаа шийдвэрлүүлнэ.</p>
        <p>5.4. Гэнэтийн болон давагдашгүй хүчин зүйл, интернетийн тасалдал зэргээс шалтгаалан Платформ түр хугацаанд ажиллахгүй болсон тохиолдолд Компани хариуцлагаас чөлөөлөгдөнө.</p>
      </div>

      <h4 className="font-bold text-slate-900 text-xl mt-8 mb-3">6. БУСАД</h4>
      <div className="space-y-3 text-slate-600">
        <p>6.1. Хэрэглэгчийн хувийн болон байршлын мэдээллийн нууцлалыг “Нууцлалын бодлого”-оор зохицуулна.</p>
        <p>6.2. Үйлчилгээний нөхцөлд нэмэлт, өөрчлөлт орох тохиолдолд Платформоор дамжуулан Хэрэглэгчдэд урьдчилан мэдэгдэнэ.</p>
        <p>6.3. Талуудын хооронд үүссэн маргааныг эхний ээлжинд харилцан зөвшилцөх замаар шийдвэрлэх бөгөөд тохиролцоонд хүрээгүй тохиолдолд Монгол Улсын хууль тогтоомжийн дагуу шийдвэрлүүлнэ.</p>
        
        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
          <p className="font-bold text-slate-800">Хувилбар: 1.0</p>
          <p className="font-bold text-slate-800">Батлагдсан огноо: 2026.05.05</p>
          <p className="font-bold text-slate-800">"Fixy" ХХК</p>
          <p className="mt-4 text-sm text-slate-500 italic">Энэхүү нөхцөлийг бүрэн уншиж танилцсанаар та аппликейшн ашиглах эрхтэй болно.</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Дээд хэсэг: Лого, Товч болон Линкүүд */}
          <div className="flex flex-col lg:flex-row justify-between gap-12 mb-12">
            
            <div className="flex flex-col items-start gap-8">
              <div className="flex items-center gap-3">
                <img 
                src={logo} 
                alt="Fixy Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain" 
              />
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  FIXY
                </h2>
              </div>
              
              {/* АПП ТАТАХ ТОВЧ (onClick НЭМСЭН) */}
              <button 
                onClick={() => setActiveModal('download')}
                className="flex items-center gap-2 px-8 py-3 border-2 border-teal-400 text-teal-400 rounded-full font-bold hover:bg-teal-400/10 transition-colors"
              >
                <Download size={20} />
                АПП ТАТАХ
              </button>
            </div>

            {/* Баруун тал: Цэсний жагсаалтууд (3 багана) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-16 lg:w-2/3">
              
              <div className="flex flex-col gap-4">
                <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} className="text-gray-400 hover:text-teal-400 font-medium transition-colors">Нүүр</a>
                <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-gray-400 hover:text-teal-400 font-medium transition-colors">Яагаад Fixy?</a>
                <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="text-gray-400 hover:text-teal-400 font-medium transition-colors">Үйлчилгээ</a>
                <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="text-gray-400 hover:text-teal-400 font-medium transition-colors">Хэрхэн ажиллах</a>
              </div>

              <div className="flex flex-col gap-4">
                <a href="#user-types" onClick={(e) => scrollToSection(e, 'user-types')} className="text-gray-400 hover:text-teal-400 font-medium transition-colors">Иргэн (Захиалагч)</a>
                <a href="#user-types" onClick={(e) => scrollToSection(e, 'user-types')} className="text-gray-400 hover:text-teal-400 font-medium transition-colors">Засварчин</a>
                <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="text-gray-400 hover:text-teal-400 font-medium transition-colors">Тусламж (FAQ)</a>
              </div>

              <div className="flex flex-col gap-4">
                <a href="#" onClick={(e) => openModal(e, 'privacy')} className="text-gray-400 hover:text-teal-400 font-medium transition-colors">Нууцлалын бодлого</a>
                <a href="#" onClick={(e) => openModal(e, 'terms-worker')} className="text-gray-400 hover:text-teal-400 font-medium transition-colors">Үйлчилгээний нөхцөл /Засварчин/</a>
                <a href="#" onClick={(e) => openModal(e, 'terms-user')} className="text-gray-400 hover:text-teal-400 font-medium transition-colors">Үйлчилгээний нөхцөл /Иргэн/</a>
              </div>
            </div>

          </div>

          {/* Доод хэсэг: Хаяг, Холбоо барих, Сошиал */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pt-8 border-t border-gray-700">
            <div className="flex flex-col gap-5 w-full lg:w-auto">
              <p className="text-gray-300 font-medium">Шинжлэх Ухаан Технологийн Их Сургуулийн Дархан-Уул Аймгийн Технологийн Сургууль.</p>
              <div className="flex flex-wrap gap-4">
                <a href="tel:94312147" className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-5 py-2.5 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-colors">
                  <Phone size={18} className="text-teal-400" />
                  9431-2147
                </a>
                <a href="mailto:terdenebat019@gmail.com" className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-5 py-2.5 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-colors">
                  <Mail size={18} className="text-teal-400" />
                  terdenebat019@gmail.com
                </a>
              </div>
              <p className="text-gray-500 text-sm mt-2">&copy; {currentYear} Fixy LLC. Бүх эрх хуулиар хамгаалагдсан.</p>
            </div>
            
            <div className="flex gap-4">
              <a href="https://www.facebook.com/vanilla.1atte" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-teal-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/erdnbt.t/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-teal-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://github.com/Aezxrin" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-teal-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- БАРИМТ БИЧГИЙН MODAL (НУУЦЛАЛ & ҮЙЛЧИЛГЭЭНИЙ НӨХЦӨЛ) --- */}
      <AnimatePresence>
        {activeModal && activeModal !== 'download' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white rounded-[2rem] p-6 sm:p-10 max-w-4xl w-full shadow-2xl z-10 flex flex-col"
              style={{ maxHeight: '90vh' }}
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="mb-6 pr-12 border-b border-slate-100 pb-4 shrink-0">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {activeModal === 'privacy' && 'Нууцлалын бодлого'}
                  {activeModal === 'terms-worker' && 'Үйлчилгээний нөхцөл (Засварчин)'}
                  {activeModal === 'terms-user' && 'Үйлчилгээний нөхцөл (Иргэн)'}
                </h3>
              </div>

              <div className="overflow-y-auto pr-4 custom-scrollbar text-base">
                
                {activeModal === 'privacy' && (
                  <div className="space-y-6">
                    <p className="text-slate-600 font-medium">Энэхүү нууцлалын бодлого нь "Fixy" ХХК-ийн (цаашид "Бид" гэх) хөгжүүлсэн "Fixy" мобайл аппликейшн болон платформыг ашиглах үед таны (цаашид "Хэрэглэгч" гэх) мэдээллийг хэрхэн цуглуулж, ашиглаж, хамгаалж байгааг зохицуулна.</p>
                    
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-2">1. Бид ямар мэдээлэл цуглуулдаг вэ?</h4>
                      <p className="text-slate-600 mb-2">Бид хэрэглэгчдэд чанартай, хурдан үйлчилгээ үзүүлэхийн тулд дараах мэдээллүүдийг цуглуулдаг:</p>
                      <ul className="list-disc pl-6 space-y-1 text-slate-600">
                        <li><strong>Бүртгэлийн мэдээлэл:</strong> Утасны дугаар, овог нэр, и-мэйл хаяг.</li>
                        <li><strong>Байршлын мэдээлэл:</strong> Захиалагч болон Засварчинг хооронд нь хамгийн ойр зайд холбохын тулд GPS байршлын мэдээллийг дуудлага хийгдэх үед ашиглана.</li>
                        <li><strong>Мэргэжлийн мэдээлэл (Зөвхөн засварчинд):</strong> Иргэний үнэмлэх, мэргэжлийн үнэмлэх, цээж зураг, хийсэн ажлын түүх зэрэг нь найдвартай байдлыг баталгаажуулах зорилготой.</li>
                        <li><strong>Төхөөрөмжийн мэдээлэл:</strong> Аппликейшны тасралтгүй, хэвийн ажиллагааг хангахын тулд IP хаяг, үйлдлийн системийн хувилбар зэрэг техникийн мэдээлэл.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-2">2. Мэдээллийг хэрхэн ашиглах вэ?</h4>
                      <ul className="list-disc pl-6 space-y-1 text-slate-600">
                        <li>Хэрэглэгчийн бүртгэл үүсгэх, баталгаажуулах;</li>
                        <li>Захиалагч болон Засварчинг хооронд нь холбох, үйлчилгээг зохион байгуулах;</li>
                        <li>Хэрэглэгчийн аюулгүй байдлыг хангах, залилангаас урьдчилан сэргийлэх;</li>
                        <li>Хэрэглэгчээс ирсэн гомдол, саналыг шийдвэрлэх, үйлчилгээг сайжруулах;</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-2">3. Мэдээлэл хуваалцах ба дамжуулах</h4>
                      <p className="text-slate-600 mb-2">Бид хэрэглэгчийн хувийн мэдээллийг гуравдагч этгээдэд худалдахгүй, задруулахгүй бөгөөд зөвхөн дараах тохиолдолд хуваалцаж болно:</p>
                      <ul className="list-disc pl-6 space-y-1 text-slate-600">
                        <li>Үйлчилгээг амжилттай үзүүлэхийн тулд Захиалагчийн хаяг, утасны дугаарыг үйлчилгээ үзүүлэхээр зөвшөөрсөн Засварчинд харуулах;</li>
                        <li>Хууль хяналтын байгууллагаас хуулийн дагуу албан ёсны шаардлага ирсэн тохиолдолд;</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-2">4. Мэдээллийн аюулгүй байдал</h4>
                      <p className="text-slate-600">Бид таны мэдээллийг гадны халдлага, хууль бус нэвтрэлтээс хамгаалахын тулд орчин үеийн нууцлалын протокол (SSL encryption), найдвартай үүлэн сервер (Cloud server) ашиглан чандлан хамгаална.</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-2">5. Хэрэглэгчийн эрх</h4>
                      <p className="text-slate-600">Та аппликейшн доторх "Тохиргоо" хэсгээс өөрийн мэдээллээ шинэчлэх, засах болон бүртгэлээ бүрмөсөн устгах эрхтэй. Бүртгэлээ устгасан тохиолдолд таны бүх мэдээлэл манай системээс бүрэн устах болно.</p>
                    </div>
                  </div>
                )}

                {(activeModal === 'terms-worker' || activeModal === 'terms-user') && (
                  <div className="pb-8">
                    {activeModal === 'terms-worker' && (
                      <div className="mb-6 p-4 bg-teal-50 border border-teal-100 rounded-xl text-teal-800 font-medium">
                        Санамж: Та засварчнаар бүртгүүлэхээсээ өмнө доорх нөхцөлийн "2.2" болон "3.2" заалтуудтай сайтар танилцана уу.
                      </div>
                    )}
                    {activeModal === 'terms-user' && (
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 font-medium">
                        Санамж: Та үйлчилгээ захиалахаас өмнө доорх нөхцөлийн "2.1" болон "3.1" заалтуудтай сайтар танилцана уу.
                      </div>
                    )}
                    
                    <TermsContent />
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                >
                  Хаах
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- АПП ТАТАХ ЦОНХ (ПОСТЕР MODAL) --- */}
      <AnimatePresence>
        {activeModal === 'download' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white rounded-[2rem] p-8 max-w-4xl w-full shadow-2xl z-10 flex flex-col md:flex-row gap-8 items-center"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 to-teal-400 rounded-2xl p-8 flex flex-col items-center justify-center text-white text-center shadow-inner aspect-square md:aspect-[4/5] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                
                <Smartphone size={100} className="mb-6 drop-shadow-xl text-white" strokeWidth={1.5} />
                <h4 className="text-3xl font-extrabold mb-2 tracking-wide">FIXY APP</h4>
                <p className="text-blue-50 font-medium text-lg opacity-90">Засвар үйлчилгээг халааснаасаа</p>
              </div>

              <div className="w-full md:w-1/2 flex flex-col justify-center px-4">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                  Аппликейшн <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">Татаж авах</span>
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                  Та доорх QR кодыг гар утсаараа уншуулах эсвэл өөрийн үйлдлийн системийг сонгон апп-аа үнэгүй суулгаарай.
                </p>
                
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-28 h-28 bg-white border-2 border-slate-100 shadow-sm rounded-2xl flex items-center justify-center shrink-0">
                    <QrCode size={64} className="text-slate-800" strokeWidth={1.5} />
                  </div>
                  
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
    </>
  );
}