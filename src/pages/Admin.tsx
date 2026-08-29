import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Product, Category } from '../types';
import { Package, Tag, Settings, LogOut, Plus, Trash2, Edit2, Users, BarChart } from 'lucide-react';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings' | 'admins' | 'visitors'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [adminsList, setAdminsList] = useState<{email: string}[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [newAdminEmail, setNewAdminEmail] = useState('');
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        if (currentUser.email === 'alialzorike@gmail.com' || currentUser.email === 'slimslman778@gmail.com') {
          setIsAdminUser(true);
          fetchData();
        } else {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.email));
            if (adminDoc.exists()) {
              setIsAdminUser(true);
              fetchData();
            } else {
              setIsAdminUser(false);
              setAuthLoading(false);
            }
          } catch (e) {
            setIsAdminUser(false);
            setAuthLoading(false);
          }
        }
      } else {
        setIsAdminUser(false);
        setAuthLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const fetchData = async () => {
    try {
      const prodSnap = await getDocs(collection(db, 'products'));
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      
      const catSnap = await getDocs(collection(db, 'categories'));
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));

      const adminsSnap = await getDocs(collection(db, 'admins'));
      setAdminsList(adminsSnap.docs.map(d => ({ email: d.id })));
      
      setAuthLoading(false);
    } catch (e) {
      console.error("Fetch error:", e);
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 800;
        if (width > height) {
          if (width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; }
        } else {
          if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setCurrentProduct(prev => ({...prev, imageUrl: dataUrl}));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct.name || !currentProduct.price || !currentProduct.categoryId) return;
    try {
      const id = currentProduct.id || `prod_${Date.now()}`;
      await setDoc(doc(db, 'products', id), {
        ...currentProduct,
        price: currentProduct.price,
        stock: Number(currentProduct.stock || 0)
      });
      setIsEditing(false);
      setCurrentProduct({});
      fetchData();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      fetchData();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      const catId = `cat_${Date.now()}`;
      await setDoc(doc(db, 'categories', catId), {
        name: newCategoryName,
        description: newCategoryDesc || ''
      });
      setNewCategoryName('');
      setNewCategoryDesc('');
      fetchData();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      fetchData();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };
    const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    try {
      await setDoc(doc(db, 'admins', newAdminEmail.toLowerCase().trim()), { addedAt: Date.now() });
      setNewAdminEmail('');
      fetchData();
    } catch (error) {
      console.error("Error adding admin:", error);
    }
  };

  const removeAdmin = async (email: string) => {
    if (!confirm(`هل أنت متأكد من إزالة الصلاحية عن ${email}؟`)) return;
    try {
      await deleteDoc(doc(db, 'admins', email));
      fetchData();
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  if (authLoading && user) {
    return <div className="min-h-[80vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div></div>;
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-neutral-900 p-8 rounded-sm border border-gold-900/50 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gold-400 mb-6">تسجيل الدخول للإدارة</h2>
          <button onClick={handleLogin} className="w-full bg-white text-black font-bold py-3 px-4 rounded-sm hover:bg-gray-200 transition-colors">تسجيل الدخول بحساب جوجل</button>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">صلاحيات غير كافية</h2>
        <button onClick={handleLogout} className="text-gold-500 underline">تسجيل الخروج</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 min-h-[80vh]">
      <aside className="w-full md:w-64 bg-neutral-900 border border-gold-900/30 rounded-sm p-4 flex flex-col gap-2 h-fit sticky top-24">
        <div className="text-center mb-6 pb-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-gold-400">لوحة التحكم</h2>
          <p className="text-xs text-gray-500 mt-2">{user.email}</p>
        </div>
        <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 p-3 rounded-sm ${activeTab === 'products' ? 'bg-gold-900/40 text-gold-400' : 'text-gray-400'}`}><Package size={20} /> المنتجات</button>
        <button onClick={() => setActiveTab('categories')} className={`flex items-center gap-3 p-3 rounded-sm ${activeTab === 'categories' ? 'bg-gold-900/40 text-gold-400' : 'text-gray-400'}`}><Tag size={20} /> الأقسام</button>
        <button onClick={() => setActiveTab('admins')} className={`flex items-center gap-3 p-3 rounded-sm ${activeTab === 'admins' ? 'bg-gold-900/40 text-gold-400' : 'text-gray-400'}`}><Users size={20} /> المدراء</button>
        <button onClick={() => setActiveTab('visitors')} className={`flex items-center gap-3 p-3 rounded-sm ${activeTab === 'visitors' ? 'bg-gold-900/40 text-gold-400' : 'text-gray-400'}`}><BarChart size={20} /> الإحصائيات</button>
        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 p-3 rounded-sm ${activeTab === 'settings' ? 'bg-gold-900/40 text-gold-400' : 'text-gray-400'}`}><Settings size={20} /> الإعدادات</button>
        <button onClick={handleLogout} className="flex items-center gap-3 p-3 mt-auto text-red-400"><LogOut size={20} /> خروج</button>
      </aside>

      <main className="flex-1 bg-neutral-900/50 border border-gold-900/30 rounded-sm p-6">
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-100">إدارة المنتجات</h3>
              <button onClick={() => { setCurrentProduct({}); setIsEditing(true); }} className="bg-gold-600 text-white px-4 py-2 rounded-sm flex items-center gap-2"><Plus size={18} /> إضافة منتج</button>
            </div>

            {isEditing && (
              <form onSubmit={saveProduct} className="bg-neutral-900 p-6 border border-gold-900/30 rounded-sm mb-8 space-y-4">
                <input required type="text" placeholder="اسم المنتج" value={currentProduct.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} className="w-full bg-black border border-neutral-700 p-2 text-white" />
                <input required type="text" placeholder="السعر (أرقام أو كتابة)" value={currentProduct.price || ''} onChange={e => setCurrentProduct({...currentProduct, price: e.target.value as any})} className="w-full bg-black border border-neutral-700 p-2 text-white" />
                <select required value={currentProduct.categoryId || ''} onChange={e => setCurrentProduct({...currentProduct, categoryId: e.target.value})} className="w-full bg-black border border-neutral-700 p-2 text-white">
                  <option value="">اختر القسم...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-white" />
                <textarea placeholder="الوصف" value={currentProduct.description || ''} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} className="w-full bg-black border border-neutral-700 p-2 text-white"></textarea>
                <div className="flex gap-4">
                  <button type="submit" className="bg-gold-600 text-white px-6 py-2">حفظ</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="border border-neutral-600 text-gray-300 px-6 py-2">إلغاء</button>
                </div>
              </form>
            )}

            <table className="w-full text-right border-collapse text-white">
              <thead>
                <tr className="border-b border-gold-900/30 text-gold-400">
                  <th className="py-2">المنتج</th>
                  <th className="py-2">السعر</th>
                  <th className="py-2 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-neutral-800">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2 text-gold-300">{p.price} ريال</td>
                    <td className="py-2 text-left">
                      <button onClick={() => { setCurrentProduct(p); setIsEditing(true); }} className="text-blue-400 p-1"><Edit2 size={16} /></button>
                      <button onClick={() => deleteProduct(p.id)} className="text-red-500 p-1"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-100 mb-6">إدارة الأقسام</h3>
            <form onSubmit={addCategory} className="bg-black border border-gold-900/30 p-4 rounded-sm mb-6 space-y-3">
              <input type="text" required placeholder="اسم القسم الجديد" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 p-2 text-white" />
              <button type="submit" className="bg-gold-600 text-white px-4 py-2">إضافة القسم</button>
            </form>
            <div className="space-y-2">
              {categories.map(c => (
                <div key={c.id} className="bg-black border border-neutral-800 p-3 rounded-sm flex justify-between items-center text-white">
                  <span>{c.name}</span>
                  <button onClick={() => deleteCategory(c.id)} className="text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-4">إدارة المدراء</h3>
            <form onSubmit={addAdmin} className="flex gap-2 mb-4">
              <input type="email" required placeholder="البريد الإلكتروني" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} className="flex-1 bg-black border border-neutral-700 p-2" />
              <button type="submit" className="bg-gold-600 px-4 py-2">إضافة</button>
            </form>
            {adminsList.map(a => (
              <div key={a.email} className="flex justify-between bg-black p-2 mb-2 border border-neutral-800">
                <span>{a.email}</span>
                <button onClick={() => removeAdmin(a.email)} className="text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'visitors' && (
          <div className="text-white h-full flex flex-col">
            <h3 className="text-2xl font-bold mb-4">إحصائيات الزوار (سرية ومباشرة)</h3>
            <div className="bg-black border border-gold-900/30 p-8 rounded-sm mb-6 text-center shadow-lg mt-4">
              <BarChart size={56} className="mx-auto text-gold-500 mb-4" />
              <h4 className="text-xl text-gray-100 mb-2">بوابة التحليلات المتقدمة</h4>
              <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                لحماية بيانات متجرك وتجاوز حظر شبكة الإنترنت، تم ربط الإحصائيات خارجياً. 
                اضغط على الأزرار أدناه لفتح لوحة التحكم ورؤية (من دخل، موقعه، ونوع جهازه) بشكل آمن ومباشر.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-sm transition-colors flex items-center justify-center gap-2">
                    📊 فتح إحصاءات جوجل
                  </a>
                  <a href="https://statcounter.com/login" target="_blank" rel="noopener noreferrer" className="bg-gold-600 hover:bg-gold-700 text-white font-bold py-3 px-6 rounded-sm transition-colors flex items-center justify-center gap-2">
                    📈 فتح نظام Statcounter
                  </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="text-white">
            <h3 className="text-2xl font-bold mb-4">الإعدادات</h3>
            <p className="text-gray-400">الطلبات تُحول مباشرة إلى واتساب: 967774182285+</p>
          </div>
        )}
      </main>
    </div>
  );
                      }
                                                                                                                         
