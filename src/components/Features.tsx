import { MapPin, ShieldCheck, Zap, ListChecks } from 'lucide-react';

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

export default function Features() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Яагаад <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Fixy</span> вэ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Найдвартай, хурдан, ухаалаг шийдэл
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
