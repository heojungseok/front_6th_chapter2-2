import { atom } from 'jotai';
import { ProductWithUI } from '../types';

export const productsAtom = atom<ProductWithUI[]>([]);
export const editingProductAtom = atom<string | null>(null);
export const productFormAtom = atom({
  name: '',
  price: 0,
  stock: 0,
  description: '',
  discounts: [] as Array<{ quantity: number; rate: number }>,
});
