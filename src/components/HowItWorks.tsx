import { Search, Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Үйлчилгээ сонгох',
    description: 'Хэрэгтэй засвар үйлчилгээгээ сонгоно',
    gradient: 'from-blue-500 to-teal-500',
  },
  {
    icon: Users,
    number: '02',
    title: 'Мэргэжилтэн олох',
    description: 'Ойрын баталгаат засварчдыг харах',
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    icon: CheckCircle,
    number: '03',
    title: 'Ажил дууссан',
    description: 'Чанартай, хурдан засвар үйлчилгээ',
    gradient: 'from-emerald-500 to-blue-500',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Хэрхэн ажилладаг вэ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Гурван энгийн алхам
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            style={{ originX: 0 }}
            className="hidden md:block absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-teal-200 to-emerald-200 -z-10"
          />

          {steps.map((step: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative text-center group"
            >
              <div className="mb-8">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br ${step.gradient} rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <step.icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={2} />
                </div>
                <div className="absolute -top-4 -right-4 sm:top-0 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-12">
                  <span className="text-5xl sm:text-6xl font-bold text-gray-100 group-hover:text-gray-200 transition-colors">
                    {step.number}
                  </span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 max-w-xs mx-auto">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
        </motion.div>
      </div>
    </section>
  );
}