import { Wrench, Lightbulb, Armchair, Home, Droplet, PaintBucket } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const services = [
  {
    icon: Droplet,
    title: 'Сантехник',
    description: 'Усан хангамж, халаалтын засвар',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Lightbulb,
    title: 'Цахилгаан',
    description: 'Цахилгааны суурилуулалт, засвар',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Armchair,
    title: 'Тавилга угсрах',
    description: 'Тавилга угсралт, засвар',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    icon: PaintBucket,
    title: 'Дотор засалч',
    description: 'Ханын будаг, засан шинэчлэлт',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Wrench,
    title: 'Засвар үйлчилгээ',
    description: 'Ерөнхий засвар, арчилгаа',
    color: 'from-gray-600 to-gray-800',
  },
  {
    icon: Home,
    title: 'Бусад үйлчилгээ',
    description: 'Гэрийн бусад төрлийн засвар',
    color: 'from-blue-600 to-teal-600',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function Services() {
  return (
    <section id="services" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Үйлчилгээний төрлүүд
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Гэрийн засвар үйлчилгээний бүх төрөл
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service: any, index: number) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-transparent cursor-pointer hover:-translate-y-2"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                <service.icon className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}