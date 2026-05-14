import { MapPin, ShieldCheck, Zap, ListChecks } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const features = [
  {
    icon: MapPin,
    title: 'Ойрын мэргэжилтнүүд',
    description: 'Танай орчмын шалгагдсан засварчдыг хурдан олох',
    gradient: 'from-blue-500 to-teal-500',
  },
  {
    icon: ShieldCheck,
    title: 'Баталгаат үйлчилгээ',
    description: 'Бүх засварчид нарийн шалгагдсан, баталгаажсан',
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Хурдан хариу',
    description: 'Хэдхэн минутын дотор мэргэжилтэнтэй холбогдоно',
    gradient: 'from-orange-500 to-coral-500',
  },
  {
    icon: ListChecks,
    title: 'Энгийн процесс',
    description: 'Хялбар, ойлгомжтой дараалал - хэдхэн дарцаар',
    gradient: 'from-blue-600 to-blue-400',
  },
];

// Анимейшн тохиргоонууд
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Яагаад <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Fixy</span> вэ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Найдвартай, хурдан, ухаалаг шийдэл
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {features.map((feature: any, index: number) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}