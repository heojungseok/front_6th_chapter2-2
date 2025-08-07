import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { calculateCartTotal } from '../utils/calculators';
import { selectedCouponAtom } from './couponAtoms';
import { cartService } from '../services/cartService';
import { ProductWithUI } from '../types';

export interface CartItem {
  product: ProductWithUI;
  quantity: number;
}

// localStorage와 연동되는 atom
export const cartAtom = atomWithStorage<CartItem[]>('cart', []);

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

// 액션 atom: 장바구니에 상품 추가
export const addToCartAtom = atom(null, (get, set, product: ProductWithUI) => {
  const cart = get(cartAtom);
  const newCart = cartService.addItemToCart(product, cart);
  set(cartAtom, newCart);
});
