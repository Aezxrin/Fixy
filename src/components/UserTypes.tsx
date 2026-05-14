import { Search, MapPin, CheckCircle2, ShieldCheck, Smartphone, Send, Zap, Wallet } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function UserTypes() {
  return (
    <section id="user-types" className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-32">
        
        {/* ХЭСЭГ 1: ИРГЭН / ЗАХИАЛАГЧ */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-6">
              <Smartphone size={16} />
              <span>ИРГЭНД ЗОРИУЛСАН</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              Засвар үйлчилгээг <br /> 
              <span className="text-blue-600">хамгийн хялбараар</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Fixy апп нь таны гэр ахуйн аливаа асуудлыг хэдхэн хормын дотор шийдвэрлэхэд тусална. Та зүгээр л дуудлага үүсгэж, өөрт ойр байгаа баталгаат мэргэжилтнийг сонгоход хангалттай.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck size={14} />
                </div>
                <p className="text-slate-700 font-medium">Мэргэжлийн түвшний үйлчилгээг баталгаатай авна.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck size={14} />
                </div>
                <p className="text-slate-700 font-medium">Дуудлагын явцыг газрын зураг дээр шууд хянах боломжтой.</p>
              </div>
            </div>
          </motion.div>

          {/* ДИАГРАМ: ИРГЭНИЙ ДАРААЛАЛ */}
          <div className="relative p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full border-l-2 border-dashed border-blue-200 hidden sm:block"></div>
            <div className="relative space-y-12">
              {[
                { icon: Search, title: "Дуудлага үүсгэх", desc: "Гэмтлийн зураг болон тайлбарыг оруулна" },
                { icon: MapPin, title: "Засварчин сонгох", desc: "Өөрт ойр байрлах мэргэжилтнийг сонгоно" },
                { icon: CheckCircle2, title: "Засвар дуусах", desc: "Ажил дууссаны дараа баталгаажуулна" }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative z-10"
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                    <step.icon size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{step.title}</h4>
                    <p className="text-sm text-slate-500">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* ХЭСЭГ 2: ЗАСВАРЧИН / ГҮЙЦЭТГЭГЧ */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* ДИАГРАМ: ЗАСВАРЧНЫ ДАРААЛАЛ */}
          <div className="order-2 lg:order-1 relative p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full border-l-2 border-dashed border-emerald-200 hidden sm:block"></div>
            <div className="relative space-y-12">
              {[
                { icon: Zap, title: "Дуудлага авах", desc: "Ойр байгаа захиалгуудыг хүлээн авна" },
                { icon: Send, title: "Хаягаар очих", desc: "Байршлын дагуу Захиалагч дээр очно" },
                { icon: Wallet, title: "Орлогоо авах", desc: "Ажил дуусахад төлбөр таны хэтэвчинд" }
              ].map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative z-10"
                >
                  <div className="w-14 h-14 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                    <step.icon size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{step.title}</h4>
                    <p className="text-sm text-slate-500">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-sm mb-6">
              <Zap size={16} />
              <span>ЗАСВАРЧИНД ЗОРИУЛСАН</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
              Өөрийн ур чадвараараа <br /> 
              <span className="text-emerald-600">орлогоо нэмэгдүүл</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Fixy платформ нь мэргэжлийн засварчдад шинэ хэрэглэгч олж өгөх, цаг заваа ухаалгаар удирдан нэмэлт орлого олох боломжийг олгодог. Та ердөө онлайн болоход л ажил таныг олох болно.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <ShieldCheck size={14} />
                </div>
                <p className="text-slate-700 font-medium">Ажлын цагаа өөрөө уян хатан зохицуулна.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <ShieldCheck size={14} />
                </div>
                <p className="text-slate-700 font-medium">Мэдээлэл болон төлбөр тооцоо ил тод, найдвартай.</p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}