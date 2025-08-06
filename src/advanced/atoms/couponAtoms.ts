import { atom } from 'jotai';

export interface Coupon {
  id: string;
  name: string;
  code: string;
  discountType: 'amount' | 'percentage';
  discountValue: number;
}

export const couponsAtom = atom<Coupon[]>([]);
export const selectedCouponAtom = atom<Coupon | null>(null);
export const couponFormAtom = atom({
  name: '',
  code: '',
  discountType: 'amount' as 'amount' | 'percentage',
  discountValue: 0,
});
