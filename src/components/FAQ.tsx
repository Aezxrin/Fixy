import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'Fixy апп-ыг ашиглах үнэ төлбөртэй юу?',
    answer: 'Үгүй, аппликейшн татаж авах болон дуудлага үүсгэх нь бүрэн үнэ төлбөргүй. Та зөвхөн засварчинтайгаа газар дээр нь харилцан тохиролцсон засварын ажлын хөлсийг л төлнө.'
  },
  {
    question: 'Засварчид хэр найдвартай вэ? Баталгаа байгаа юу?',
    // eslint-disable-next-line quotes
    answer: 'Тийм ээ. Манай платформд бүртгэлтэй бүх засварчид иргэний үнэмлэх болон мэргэжлийн үнэмлэхээрээ баталгаажсан байдаг. Мөн та бусад хэрэглэгчдийн өгсөн үнэлгээ, сэтгэгдлийг харж сонголтоо хийх боломжтой.'
  },
  {
    question: 'Төлбөрөө хэрхэн төлөх вэ?',
    answer: 'Та засвар үйлчилгээний хөлсийг бэлнээр эсвэл өөрийн ашигладаг дурын банкны аппликейшнээр (QPay, дансаар) шилжүүлэн төлөх бүрэн боломжтой.'
  },
  {
    question: 'Дуудлага өгснөөс хойш хэр удаж ирэх вэ?',
    answer: 'Таны сонгосон засварчны байршлаас хамааран өөр өөр байна. Манай апп танд хамгийн ойр байгаа мэргэжилтнүүдийг эхлээд санал болгодог тул дунджаар 15-30 минутын дотор очих боломжтой.'
  },
  {
    question: 'Би өөрөө засварчин хийж болох уу?',
    answer: 'Бололгүй яах вэ. Та мэргэжлийн үнэмлэхтэй эсвэл тухайн чиглэлээр туршлагатай бол манай апп-д "Засварчин" хэсгээр бүртгүүлэн баталгаажуулалт хийлгээд, шууд орлого олж эхлэх боломжтой.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Түгээмэл асуултууд
          </h2>
          <p className="text-lg text-slate-600">
            Fixy апп-тай холбоотой таны мэдвэл зохих мэдээллүүд
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="text-lg font-bold text-slate-900 pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"
                >
                  <ChevronDown size={20} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}