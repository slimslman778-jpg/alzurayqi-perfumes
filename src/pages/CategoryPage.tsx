import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Product, Category } from '../types';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!categoryId) return;
        
        // Fetch category details
        const catRef = doc(db, 'categories', categoryId);
        const catSnap = await getDoc(catRef);
        if (catSnap.exists()) {
          setCategory({ id: catSnap.id, ...catSnap.data() } as Category);
        }

        // Fetch products
        const q = query(collection(db, 'products'), where('categoryId', '==', categoryId));
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {category && (
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gold-400 mb-4">{category.name}</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{category.description}</p>
          <div className="w-16 h-1 bg-gold-700 mx-auto mt-6 rounded-full"></div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          لا توجد منتجات في هذا القسم حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-neutral-900 border border-gold-900/30 rounded-sm overflow-hidden group hover:border-gold-700 transition-colors"
            >
              <div className="aspect-square relative overflow-hidden bg-neutral-800">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">بدون صورة</div>
                )}
                {product.stock && product.stock > 0 && product.stock < 10 && (
                  <span className="absolute top-2 right-2 bg-red-600/90 text-white text-xs px-2 py-1 rounded-sm">
                    كمية محدودة
                  </span>
                )}
              </div>
              <div className="p-5 flex flex-col h-full">
                <h3 className="text-xl font-bold text-gray-100 mb-2 font-cairo">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gold-900/30">
                  <span className="text-gold-400 font-bold text-lg">{product.price.toLocaleString()} ريال</span>
                  <button 
                    onClick={() => setSelectedProduct(product)}
                    className="bg-gold-700 hover:bg-gold-600 text-white p-2 rounded-sm transition-colors flex items-center gap-2"
                  >
                    <ShoppingBag size={18} />
                    <span className="text-sm">طلب</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Simple Order Modal (Using WhatsApp redirect for real order functionality) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-neutral-900 border border-gold-800 p-6 rounded-sm max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-gold-400 mb-4">تأكيد الطلب</h3>
            <p className="text-gray-300 mb-6">
              سيتم تحويلك إلى واتساب لإتمام طلبك للمنتج <span className="font-bold text-gold-300">{selectedProduct.name}</span>.
            </p>
            <div className="flex justify-between items-center bg-black p-4 rounded-sm mb-6 border border-neutral-800">
              <span className="text-gray-400">السعر:</span>
              <span className="text-xl font-bold text-gold-500">{selectedProduct.price.toLocaleString()} ريال</span>
            </div>
            <div className="flex gap-4">
              <a 
                href={`https://wa.me/967775363086?text=مرحباً، أود طلب المنتج: ${selectedProduct.name} (السعر: ${selectedProduct.price} ريال)`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedProduct(null)}
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-center py-3 rounded-sm font-bold transition-colors"
              >
                تأكيد عبر واتساب
              </a>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
