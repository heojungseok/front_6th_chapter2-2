import { atom } from 'jotai';
import { calculateCartTotal } from '../utils/calculators';
import { selectedCouponAtom } from './couponAtoms';

export interface CartItem {
  product: any;
  quantity: number;
}

export const cartAtom = atom<CartItem[]>([]);

// 파생 atom: 장바구니 총 아이템 개수
export const totalItemCountAtom = atom(get => {
  const cart = get(cartAtom);
  return cart.reduce((total, item) => total + item.quantity, 0);
});

// 파생 atom: 장바구니 총액 계산 (할인 포함)
export const cartTotalsAtom = atom(get => {
  const cart = get(cartAtom);
  const selectedCoupon = get(selectedCouponAtom);
  return calculateCartTotal(cart, selectedCoupon);
});
