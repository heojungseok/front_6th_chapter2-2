import { atom } from 'jotai';

export interface CartItem {
  product: any;
  quantity: number;
}

export const cartAtom = atom<CartItem[]>([]);
export const totalItemCountAtom = atom(0);
