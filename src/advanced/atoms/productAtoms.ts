import { atom } from 'jotai';
import { ProductWithUI } from '../types';
import { searchTermAtom } from './uiAtoms';

export const productsAtom = atom<ProductWithUI[]>([]);
export const editingProductAtom = atom<string | null>(null);
export const productFormAtom = atom({
  name: '',
  price: 0,
  stock: 0,
  description: '',
  discounts: [] as Array<{ quantity: number; rate: number }>,
});

// 파생 atom: 검색어로 필터링된 상품 목록
export const filteredProductsAtom = atom(get => {
  const products = get(productsAtom);
  const searchTerm = get(searchTermAtom);
  
  if (!searchTerm.trim()) return products;
  
  return products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
});
