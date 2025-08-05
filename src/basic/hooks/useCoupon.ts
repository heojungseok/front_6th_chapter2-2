import { useState, useCallback } from 'react';
import { CartItem, Coupon } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { couponService } from '../services/couponService';

const initialCoupons: Coupon[] = [
  {
    name: '5000원 할인',
    code: 'AMOUNT5000',
    discountType: 'amount',
    discountValue: 5000,
  },
  {
    name: '10% 할인',
    code: 'PERCENT10',
    discountType: 'percentage',
    discountValue: 10,
  },
];

// 쿠폰 목록을 localStorage에서 관리
// 선택된 쿠폰 상태 관리
// 쿠폰 적용, 추가, 삭제, 선택 해제 함수 제공
interface UseCouponsProps {
  cart: CartItem[];
  calculateCartTotal: (
    cart: CartItem[],
    coupon: Coupon | null
  ) => {
    totalBeforeDiscount: number;
    totalAfterDiscount: number;
  };
  addNotification: (message: string, type: 'success' | 'error') => void;
}

export const useCoupon = ({
  cart,
  calculateCartTotal,
  addNotification,
}: UseCouponsProps) => {
  const [coupons, setCoupons] = useLocalStorage<Coupon[]>(
    'coupons',
    initialCoupons
  );
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const applyCoupon = useCallback(
    (coupon: Coupon) => {
      const currentTotal = calculateCartTotal(cart, null).totalBeforeDiscount;
      const validationResult = couponService.validateCouponApplication(
        coupon,
        currentTotal
      );

      if (!validationResult.isValid) {
        addNotification(validationResult.message, 'error');
        return;
      }

      setSelectedCoupon(coupon);
    },
    [cart, calculateCartTotal]
  );

  const addCoupon = useCallback(
    (newCoupon: Coupon) => {
      // 중복 쿠폰 코드 검증
      const validationResult = couponService.checkDuplicateCoupon(
        newCoupon,
        coupons
      );

      if (!validationResult.isValid) {
        addNotification(validationResult.message, 'error');
        return;
      }

      // 쿠폰 추가
      setCoupons(prev => [...prev, newCoupon]);
      addNotification(validationResult.message, 'success');
    },
    [coupons, addNotification]
  );

  const removeCoupon = useCallback(
    (couponCode: string) => {
      setCoupons(prev => prev.filter(c => c.code !== couponCode));

      if (couponService.shouldClearSelectedCoupon(couponCode, selectedCoupon)) {
        setSelectedCoupon(null);
      }

      addNotification('쿠폰이 삭제되었습니다.', 'success');
    },
    [selectedCoupon, addNotification]
  );

  const clearSelectedCoupon = useCallback(() => {
    setSelectedCoupon(null);
  }, []);

  return {
    coupons,
    selectedCoupon,
    applyCoupon,
    addCoupon,
    removeCoupon,
    clearSelectedCoupon,
  };
};
