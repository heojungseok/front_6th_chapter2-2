import React from 'react';
import { useAtom } from 'jotai';
import {
  couponsAtom,
  couponFormAtom,
  selectedCouponAtom,
} from '../../../atoms/couponAtoms';
import { useNotifications } from '../../../hooks/useNotifications';
import { CouponCard, AddCouponButton, CouponForm } from './coupon';
import { showCouponFormAtom } from '../../../atoms/uiAtoms';
import { useCoupon } from '../../../hooks/useCoupon';
import { useCouponForm } from '../../../hooks/useCouponForm';

// interface CouponManagementProps {
//   coupons: Coupon[];
//   couponForm: {
//     name: string;
//     code: string;
//     discountType: 'amount' | 'percentage';
//     discountValue: number;
//   };
//   showCouponForm: boolean;
//   onRemoveCoupon: (code: string) => void;
//   onAddCoupon: (coupon: Omit<Coupon, 'id'>) => void;
//   setCouponForm: (form: any) => void;
//   setShowCouponForm: (show: boolean) => void;
//   addNotification: (
//     message: string,
//     type: 'error' | 'success' | 'warning'
//   ) => void; // 타입 수정
// }

export const CouponManagement: React.FC = () => {
  const [coupons] = useAtom(couponsAtom);
  const [showCouponForm] = useAtom(showCouponFormAtom);
  const [selectedCoupon] = useAtom(selectedCouponAtom);
  const { onRemoveCoupon, onAddCoupon, onClearSelectedCoupon } = useCoupon();
  const { setCouponForm, resetCouponForm, couponForm } = useCouponForm();
  const { addNotification } = useNotifications();

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCoupon(couponForm);
    setCouponForm({
      name: '',
      code: '',
      discountType: 'amount',
      discountValue: 0,
    });
    setShowCouponForm(false);
  };

  const handleCancel = () => {
    setShowCouponForm(false);
  };

  return (
    <section className='bg-white rounded-lg border border-gray-200'>
      <div className='p-6 border-b border-gray-200'>
        <h2 className='text-lg font-semibold'>쿠폰 관리</h2>
      </div>
      <div className='p-6'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {coupons.map(coupon => (
            <CouponCard
              key={coupon.code}
              coupon={coupon}
              onRemove={onRemoveCoupon}
            />
          ))}
          <AddCouponButton onClick={() => setShowCouponForm(!showCouponForm)} />
        </div>

        {showCouponForm && (
          <CouponForm
            couponForm={couponForm}
            onSubmit={handleCouponSubmit}
            onCancel={handleCancel}
            setCouponForm={setCouponForm}
            addNotification={addNotification}
          />
        )}
      </div>
    </section>
  );
};
