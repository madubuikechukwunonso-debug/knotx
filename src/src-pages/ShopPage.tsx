'use client';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';
import { ShoppingBag, Check } from 'lucide-react';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Hair Care', value: 'hair-care' },
  { label: 'Styling', value: 'styling' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Tools', value: 'tools' },
];

type Product = { id:number; name:string; price:number; image?:string|null };

export default function ShopPage(){
  const [category,setCategory]=useState('');
  const [products,setProducts]=useState<Product[]>([]);
  const [addedId,setAddedId]=useState<number|null>(null);
  const { addItem } = useCart();
  useEffect(()=>{ fetch(`/api/products${category?`?category=${category}`:''}`).then(r=>r.json()).then(d=>setProducts(d.products||[])).catch(()=>setProducts([])); },[category]);
  const formatPrice=(c:number)=>`$${(c/100).toFixed(2)}`;
  const handleAdd=(product:Product)=>{ addItem({productId:product.id,name:product.name,price:product.price,quantity:1,image:product.image||''}); setAddedId(product.id); setTimeout(()=>setAddedId(null),1500); };
  return <div className="min-h-screen bg-white"><Navigation/><div className="px-6 pb-20 pt-24 lg:pt-32"><div className="mx-auto max-w-7xl"><div className="mb-12"><h1 className="mb-4 font-serif text-4xl font-light sm:text-5xl lg:text-6xl">Shop</h1><p className="max-w-lg text-sm text-black/50">Premium hair care products curated by our master stylists. Each product is selected for quality, effectiveness, and luxury.</p></div><div className="mb-12 flex flex-wrap gap-4">{CATEGORIES.map(cat=><button key={cat.value} onClick={()=>setCategory(cat.value)} className={`border px-4 py-2 text-xs uppercase tracking-widest transition-all ${category===cat.value?'border-black bg-black text-white':'border-black/10 text-black/50 hover:border-black/30'}`}>{cat.label}</button>)}</div><div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">{products.map(product=><div key={product.id} className="group"><div className="relative mb-4 aspect-[3/4] overflow-hidden bg-[#f6f6f6]"><img src={product.image || '/images/products/hair-oil.jpg'} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"/><button onClick={()=>handleAdd(product)} className={`absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${addedId===product.id?'bg-green-500 text-white':'bg-white text-black opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white'}`}>{addedId===product.id?<Check className="h-4 w-4"/>:<ShoppingBag className="h-4 w-4"/>}</button></div><h3 className="text-sm font-medium">{product.name}</h3><p className="mt-1 text-sm text-black/50">{formatPrice(product.price)}</p></div>)}</div>{products.length===0 && <div className="py-20 text-center"><p className="text-black/40">No products found</p></div>}</div></div><Footer/></div>
}
