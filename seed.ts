import { db } from './src/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

const categories = [
  { id: 'oils', name: 'العطور الزيتية', description: 'زيوت خام مستنسخة من الماركات العالمية', imageUrl: 'https://images.unsplash.com/photo-1608528577891-eb055944f2e8?w=800' },
  { id: 'vip', name: 'عطور VIP والماركات', description: 'عطور جاهزة ومعبأة بمواصفات عالية', imageUrl: 'https://images.unsplash.com/photo-1523293115678-d29062015949?w=800' },
  { id: 'oud', name: 'العود والبخور', description: 'عود ماروكي، ظفر، وإضافات البخور', imageUrl: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=800' },
  { id: 'packaging', name: 'مستلزمات التعبئة', description: 'علب زجاجية وبخاخات سعات 50مل و 100مل', imageUrl: 'https://images.unsplash.com/photo-1595642527925-4d41cb781653?w=800' }
];

const products = [
  { id: 'p1', name: 'زيت عطر كريد أفينتوس', description: 'زيت عطري خام عالي التركيز مستنسخ من عطر كريد أفينتوس الشهير.', price: 15000, categoryId: 'oils', stock: 50, imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600' },
  { id: 'p2', name: 'زيت عطر قصة', description: 'زيت عطري فاخر بتركيبة فريدة مستوحاة من عطور قصة.', price: 12000, categoryId: 'oils', stock: 30, imageUrl: 'https://images.unsplash.com/photo-1615160461711-a8bb74b0fb59?w=600' },
  { id: 'p3', name: 'عطر رويال عود VIP', description: 'عطر معبأ جاهز بتركيز عالي وثبات يدوم طويلاً، برائحة العود الملكي.', price: 25000, categoryId: 'vip', stock: 15, imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600' },
  { id: 'p4', name: 'عطر بلاك أوركيد', description: 'عطر شرقي فخم مناسب للمناسبات الرسمية.', price: 22000, categoryId: 'vip', stock: 20, imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600' },
  { id: 'p5', name: 'عود ماروكي فاخر', description: 'بخور عود ماروكي طبيعي محسن، رائحة فواحة وثبات عالي للمجالس.', price: 45000, categoryId: 'oud', stock: 10, imageUrl: 'https://images.unsplash.com/photo-1605335191079-052060373df9?w=600' },
  { id: 'p6', name: 'بخور ظفر عرائسي', description: 'خلطة بخور ظفر خاصة بالمناسبات والأفراح.', price: 35000, categoryId: 'oud', stock: 12, imageUrl: 'https://images.unsplash.com/photo-1505063462947-fccbc6a074c7?w=600' },
  { id: 'p7', name: 'علب زجاجية 50مل', description: 'كرتون علب زجاجية فارغة مع بخاخ فضي سعة 50 مل.', price: 5000, categoryId: 'packaging', stock: 100, imageUrl: 'https://images.unsplash.com/photo-1628148888046-24e0307e54f9?w=600' },
  { id: 'p8', name: 'علب فخمة 100مل', description: 'علب زجاجية سوداء مع بخاخ ذهبي سعة 100 مل، مناسبة لعطور VIP.', price: 8000, categoryId: 'packaging', stock: 80, imageUrl: 'https://images.unsplash.com/photo-1542451313056-b7c8e626645f?w=600' }
];

async function seed() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await setDoc(doc(db, 'categories', cat.id), cat);
  }
  
  console.log('Seeding products...');
  for (const prod of products) {
    await setDoc(doc(db, 'products', prod.id), prod);
  }
  
  console.log('Done!');
}

seed().catch(console.error);
