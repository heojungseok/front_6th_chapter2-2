// atoms/uiAtoms.ts
import { atom } from 'jotai';

// UI 상태 atoms
export const isAdminAtom = atom(false);
export const activeTabAtom = atom<'products' | 'coupons'>('products');
export const showProductFormAtom = atom(false);
export const showCouponFormAtom = atom(false);
export const searchTermAtom = atom('');
