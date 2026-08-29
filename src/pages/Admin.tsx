import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Product, Category } from '../types';
import { LayoutDashboard, Package, Tag, Settings, LogOut, Plus, Trash2, Edit2, Users } from 'lucide-react';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings' | 'admins'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [adminsList, setAdminsList] = useState<{email: string}[]>([]);
  
  // Forms state
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [newAdminEmail, setNewAdminEmail] = useState('');

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
        
        // Max dimensions
        const MAX_DIM = 800;
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to WebP or JPEG
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
        price: Number(currentProduct.price),
        stock: Number(currentProduct.stock || 0)
      });
      setIsEditing(false);
      setCurrentProduct({});
      fetchData();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("حدث خطأ أثناء الحفظ. تأكد من الصلاحيات.");
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

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    try {
      await setDoc(doc(db, 'admins', newAdminEmail.toLowerCase().trim()), { addedAt: Date.now() });
      setNewAdminEmail('');
      fetchData();
    } catch (error) {
      console.error("Error adding admin:", error);
      alert("حدث خطأ أثناء الإضافة. تأكد من صلاحياتك.");
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
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-neutral-900 p-8 rounded-sm border border-gold-900/50 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gold-400 mb-6">تسجيل الدخول للإدارة</h2>
          <p className="text-gray-400 mb-8">يرجى تسجيل الدخول للوصول إلى لوحة التحكم.</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-white text-black font-bold py-3 px-4 rounded-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            تسجيل الدخول بحساب جوجل
          </button>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">صلاحيات غير كافية</h2>
        <p className="text-gray-400 mb-6">هذا الحساب ({user.email}) ليس لديه صلاحيات الإدارة.</p>
        <button onClick={handleLogout} className="text-gold-500 underline">تسجيل الخروج</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 min-h-[80vh]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-neutral-900 border border-gold-900/30 rounded-sm p-4 flex flex-col gap-2 h-fit sticky top-24">
        <div className="text-center mb-6 pb-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-gold-400">لوحة التحكم</h2>
          <p className="text-xs text-gray-500 mt-2">{user.email}</p>
        </div>
        
        <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 p-3 rounded-sm transition-colors ${activeTab === 'products' ? 'bg-gold-900/40 text-gold-400' : 'text-gray-400 hover:bg-neutral-800'}`}>
          <Package size={20} /> المنتجات
        </button>
        <button onClick={() => setActiveTab('categories')} className={`flex items-center gap-3 p-3 rounded-sm transition-colors ${activeTab === 'categories' ? 'bg-gold-900/40 text-gold-400' : 'text-gray-400 hover:bg-neutral-800'}`}>
          <Tag size={20} /> الأقسام
        </button>
        <button onClick={() => setActiveTab('admins')} className={`flex items-center gap-3 p-3 rounded-sm transition-colors ${activeTab === 'admins' ? 'bg-gold-900/40 text-gold-400' : 'text-gray-400 hover:bg-neutral-800'}`}>
          <Users size={20} /> المدراء
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 p-3 rounded-sm transition-colors ${activeTab === 'settings' ? 'bg-gold-900/40 text-gold-400' : 'text-gray-400 hover:bg-neutral-800'}`}>
          <Settings size={20} /> إعدادات المتجر
        </button>
        
        <button onClick={handleLogout} className="flex items-center gap-3 p-3 mt-auto text-red-400 hover:bg-neutral-800 rounded-sm transition-colors">
          <LogOut size={20} /> تسجيل الخروج
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-neutral-900/50 border border-gold-900/30 rounded-sm p-6">
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-100">إدارة المنتجات</h3>
              <button 
                onClick={() => { setCurrentProduct({}); setIsEditing(true); }}
                className="bg-gold-600 hover:bg-gold-500 text-white px-4 py-2 rounded-sm flex items-center gap-2 transition-colors"
              >
                <Plus size={18} /> إضافة منتج
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={saveProduct} className="bg-neutral-900 p-6 border border-gold-900/30 rounded-sm mb-8 space-y-4">
                <h4 className="text-lg font-bold text-gold-400 mb-4">{currentProduct.id ? 'تعديل منتج' : 'منتج جديد'}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">اسم المنتج *</label>
                    <input required type="text" value={currentProduct.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} className="w-full bg-black border border-neutral-700 rounded-sm px-4 py-2 text-white focus:border-gold-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">السعر (ريال) *</label>
                    <input required type="number" value={currentProduct.price || ''} onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} className="w-full bg-black border border-neutral-700 rounded-sm px-4 py-2 text-white focus:border-gold-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">القسم *</label>
                    <select required value={currentProduct.categoryId || ''} onChange={e => setCurrentProduct({...currentProduct, categoryId: e.target.value})} className="w-full bg-black border border-neutral-700 rounded-sm px-4 py-2 text-white focus:border-gold-500 outline-none">
                      <option value="">اختر القسم...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">الكمية المتوفرة</label>
                    <input type="number" value={currentProduct.stock || ''} onChange={e => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})} className="w-full bg-black border border-neutral-700 rounded-sm px-4 py-2 text-white focus:border-gold-500 outline-none" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">صورة المنتج (رفع من الجهاز)</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full bg-black border border-neutral-700 rounded-sm px-4 py-2 text-white focus:border-gold-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-bold file:bg-gold-600 file:text-white hover:file:bg-gold-500 cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">أو رابط الصورة (URL)</label>
                    <input type="url" value={currentProduct.imageUrl || ''} onChange={e => setCurrentProduct({...currentProduct, imageUrl: e.target.value})} className="w-full bg-black border border-neutral-700 rounded-sm px-4 py-2 text-white focus:border-gold-500 outline-none" placeholder="https://..." />
                  </div>
                </div>
                
                {currentProduct.imageUrl && (
                  <div className="mt-2 w-32 h-32 rounded-sm overflow-hidden border border-neutral-700">
                    <img src={currentProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">الوصف</label>
                  <textarea rows={3} value={currentProduct.description || ''} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} className="w-full bg-black border border-neutral-700 rounded-sm px-4 py-2 text-white focus:border-gold-500 outline-none"></textarea>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="bg-gold-600 hover:bg-gold-500 text-white px-6 py-2 rounded-sm transition-colors">حفظ</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 border border-neutral-600 text-gray-300 hover:bg-neutral-800 rounded-sm transition-colors">إلغاء</button>
                </div>
              </form>
            ) : null}

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-gold-900/30 text-gold-400">
                    <th className="py-4 px-2">المنتج</th>
                    <th className="py-4 px-2">القسم</th>
                    <th className="py-4 px-2">السعر</th>
                    <th className="py-4 px-2">المخزون</th>
                    <th className="py-4 px-2 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20">
                      <td className="py-4 px-2 flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-sm overflow-hidden flex-shrink-0">
                          {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-800"></div>}
                        </div>
                        <span className="font-semibold text-gray-200">{p.name}</span>
                      </td>
                      <td className="py-4 px-2 text-gray-400">{categories.find(c => c.id === p.categoryId)?.name || 'غير محدد'}</td>
                      <td className="py-4 px-2 text-gold-200">{p.price} ريال</td>
                      <td className="py-4 px-2 text-gray-400">{p.stock}</td>
                      <td className="py-4 px-2 text-left space-x-2 space-x-reverse">
                        <button onClick={() => { setCurrentProduct(p); setIsEditing(true); }} className="text-blue-400 hover:text-blue-300 p-2"><Edit2 size={18} /></button>
                        <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-100 mb-8">إدارة الأقسام</h3>
            <p className="text-gray-400">لإضافة أقسام جديدة أو تعديلها، يرجى التواصل مع الدعم الفني أو استخدام واجهة المطورين. الأقسام الحالية:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {categories.map(c => (
                <div key={c.id} className="bg-black border border-neutral-800 p-4 rounded-sm flex items-center gap-4">
                  <div className="w-16 h-16 bg-neutral-900 rounded-sm overflow-hidden">
                    {c.imageUrl && <img src={c.imageUrl} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gold-300">{c.name}</h4>
                    <p className="text-xs text-gray-500">{c.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-100 mb-8">إدارة المدراء</h3>
            <div className="bg-black border border-gold-900/30 p-6 rounded-sm mb-8">
              <h4 className="text-gold-400 font-bold mb-4">إضافة مدير جديد</h4>
              <p className="text-gray-400 mb-4 text-sm">سيتمكن المدير المضاف من تسجيل الدخول وإضافة/حذف المنتجات. يجب أن يقوم بتسجيل الدخول بحساب جوجل المضاف.</p>
              <form onSubmit={addAdmin} className="flex gap-4">
                <input 
                  type="email" 
                  required 
                  value={newAdminEmail} 
                  onChange={e => setNewAdminEmail(e.target.value)} 
                  placeholder="أدخل البريد الإلكتروني..." 
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-sm px-4 py-2 text-white focus:border-gold-500 outline-none" 
                />
                <button type="submit" className="bg-gold-600 hover:bg-gold-500 text-white px-6 py-2 rounded-sm transition-colors flex items-center gap-2">
                  <Plus size={18} /> إضافة
                </button>
              </form>
            </div>
            
            <div className="bg-black border border-neutral-800 rounded-sm p-4">
              <h4 className="text-gray-300 font-bold mb-4">المدراء الحاليين (المضافين)</h4>
              {adminsList.length === 0 ? (
                <p className="text-gray-500 text-sm">لا يوجد مدراء إضافيين. (فقط أصحاب المتجر الرئيسيين)</p>
              ) : (
                <ul className="space-y-3">
                  {adminsList.map(admin => (
                    <li key={admin.email} className="flex justify-between items-center bg-neutral-900 p-3 rounded-sm border border-neutral-800">
                      <span className="text-gray-300">{admin.email}</span>
                      <button onClick={() => removeAdmin(admin.email)} className="text-red-500 hover:text-red-400">
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-100 mb-8">إعدادات المتجر</h3>
            <div className="bg-black border border-gold-900/30 p-8 rounded-sm">
              <h4 className="text-gold-400 font-bold mb-4">التخصيص والألوان</h4>
              <p className="text-gray-400 mb-6 text-sm">
                تم تجهيز المتجر بهوية بصرية فخمة تعتمد على الأسود والذهبي. لتغيير النصوص الرئيسية أو الهوية البصرية بشكل جذري (Drag & Drop) سيتم توفير محرر متقدم في التحديثات القادمة.
              </p>
              
              <h4 className="text-gold-400 font-bold mb-4 mt-8">الطلبات الواردة</h4>
              <p className="text-gray-400 mb-6 text-sm">
                نظراً لمتطلبات السرعة، جميع الطلبات يتم تحويلها مباشرة إلى رقم الواتساب الخاص بالمتجر (+967 774182285) لضمان تفاعل فوري مع العميل.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
