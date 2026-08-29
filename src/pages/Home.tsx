import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categories = [
  { id: 'oils', name: 'العطور الزيتية', desc: 'زيوت خام مستنسخة من الماركات العالمية', image: 'https://images.unsplash.com/photo-1608528577891-eb055944f2e8?auto=format&fit=crop&q=80&w=800' },
  { id: 'vip', name: 'عطور VIP والماركات', desc: 'عطور جاهزة ومعبأة بمواصفات عالية', image: 'https://images.unsplash.com/photo-1523293115678-d29062015949?auto=format&fit=crop&q=80&w=800' },
  { id: 'oud', name: 'العود والبخور', desc: 'عود ماروكي، ظفر، وإضافات البخور', image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800' },
  { id: 'packaging', name: 'مستلزمات التعبئة', desc: 'علب زجاجية وبخاخات سعات 50مل و 100مل', image: 'https://images.unsplash.com/photo-1595642527925-4d41cb781653?auto=format&fit=crop&q=80&w=800' },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury Perfume Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-gold-400 font-cairo"
          >
            الزريقي
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-3xl font-light mb-8 text-gray-200"
          >
            للعطور والبخور الفاخر
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            نقدم لكم أرقى الخيارات من العطور الزيتية والماركات العالمية، بالإضافة إلى أجود أنواع العود والبخور التي تعكس ذوقكم الرفيع.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/category/vip" className="bg-gold-600 hover:bg-gold-500 text-white px-8 py-4 rounded-sm text-lg font-semibold transition-all duration-300 inline-block">
              تسوق الآن
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gold-400 mb-4">أقسام المتجر</h2>
            <div className="w-24 h-1 bg-gold-700 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, index) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <Link to={`/category/${cat.id}`} className="block relative overflow-hidden rounded-sm aspect-[3/4]">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500 z-10"></div>
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 to-transparent">
                    <h3 className="text-2xl font-bold text-gold-300 mb-2">{cat.name}</h3>
                    <p className="text-sm text-gray-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      {cat.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-24 bg-black relative overflow-hidden border-t border-gold-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gold-400 mb-6">قصتنا</h2>
              <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                في الزريقي للعطور والبخور، نسعى دائماً لتقديم الأفضل لعملائنا في اليمن وخارجها. نتميز بخبرتنا الطويلة في استخلاص الزيوت العطرية واختيار أجود أنواع العود الماروكي والظفر.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                نلبي احتياجات المصنعين من العلب الزجاجية والبخاخات الفارغة بمختلف السعات، كما نوفر تشكيلة واسعة من عطور VIP والماركات العالمية الجاهزة.
              </p>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-16 h-[1px] bg-gold-600"></div>
                <span className="text-gold-500 font-semibold text-lg">الفخامة والجودة شعارنا</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 border border-gold-800/50 transform translate-x-4 -translate-y-4 rounded-sm"></div>
              <img 
                src="https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&q=80&w=800" 
                alt="Oud and Perfume" 
                className="w-full h-auto object-cover rounded-sm relative z-10 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
