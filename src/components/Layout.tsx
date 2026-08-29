/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Outlet, Link } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Category } from '../types';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
        setCategories(list);
      } catch (error) {
        console.error("Error fetching categories for layout:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100 font-cairo">
      {/* Navbar */}
      <nav className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-gold-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-2 space-x-reverse">
              <span className="text-2xl font-bold bg-gradient-to-r from-gold-300 to-gold-600 bg-clip-text text-transparent">الزريقي</span>
              <span className="text-sm text-gold-200 hidden sm:block">للعطور والبخور</span>
            </Link>

            {/* Desktop Nav - Dynamic from Firebase */}
            <div className="hidden md:flex items-center space-x-6 space-x-reverse">
              <Link to="/" className="text-gray-300 hover:text-gold-400 transition-colors">الرئيسية</Link>
              {categories.map(cat => (
                <Link key={cat.id} to={`/category/${cat.id}`} className="text-gray-300 hover:text-gold-400 transition-colors">
                  {cat.name}
                </Link>
              ))}
              <Link to="/admin" className="text-gold-600 hover:text-gold-400 text-sm border border-gold-800 px-3 py-1 rounded-full transition-colors">الإدارة</Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-gold-400">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav - Dynamic from Firebase */}
        {isMenuOpen && (
          <div className="md:hidden bg-neutral-900 border-b border-gold-800/50">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-gray-300 hover:text-gold-400">الرئيسية</Link>
              {categories.map(cat => (
                <Link key={cat.id} to={`/category/${cat.id}`} onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-gray-300 hover:text-gold-400">
                  {cat.name}
                </Link>
              ))}
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="px-3 py-2 text-gold-600 hover:text-gold-400">لوحة الإدارة</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-gold-900/30 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gold-400 mb-4">الزريقي للعطور والبخور</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                نوفر لكم أرقى أنواع العطور الزيتية والماركات العالمية، والعود الأصيل والبخور، ومستلزمات التعبئة والتغليف بأفضل الأسعار.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gold-400 mb-4">تواصل معنا</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>العنوان: اليمن، صنعاء، شارع جمال</li>
                <li>البريد: alialzorike@gmail.com</li>
                <li>الهاتف: +967 775363086</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gold-400 mb-4">تابعنا</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-gold-400 transition-colors">فيسبوك: الزريقي للعطور و البخور</a></li>
                <li><a href="#" className="hover:text-gold-400 transition-colors">إنستغرام: @alzorikeperfume</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col items-center justify-center space-y-3">
            <p className="text-gray-500 text-xs">
              &copy; {new Date().getFullYear()} الزريقي للعطور والبخور. جميع الحقوق محفوظة.
            </p>
            <a 
              href="https://wa.me/967778391662" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 text-xs hover:text-gold-400 transition-colors flex flex-col items-center text-center"
            >
              <span>تطوير وصيانة </span>
              <span className="font-sans mt-1" dir="ltr">+967 778 391 662</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/967775363086"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20bd5a] hover:scale-110 transition-all z-50 flex items-center justify-center"
        aria-label="تواصل معنا عبر واتساب"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
