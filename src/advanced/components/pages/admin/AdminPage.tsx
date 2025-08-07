import React from 'react';
import { useAtom } from 'jotai';
import { isAdminAtom, activeTabAtom } from '../../../atoms/uiAtoms';
import { ProductWithUI } from '../../../types';
import { AdminHeader } from './AdminHeader';
import { ProductManagement } from './ProductManagement';
import { CouponManagement } from './CouponManagement';

interface AdminPageProps {
  products: ProductWithUI[];
  productForm: {
    name: string;
    price: number;
    stock: number;
    description: string;
    discounts: Array<{ quantity: number; rate: number }>;
  };
  editingProduct: string | null;
  showProductForm: boolean;
  cart: any[];
  onSetActiveTab: (tab: 'products' | 'coupons') => void;
  onAddProduct: (product: any) => void;
  onUpdateProduct: (productId: string, updates: any) => void;
  onDeleteProduct: (productId: string) => void;
  onStartEditProduct: (product: ProductWithUI) => void;
  setProductForm: (form: any) => void;
  setEditingProduct: (productId: string | null) => void;
  setShowProductForm: (show: boolean) => void;
  // coupons: any[];
  // couponForm: {
  //   name: string;
  //   code: string;
  //   discountType: 'amount' | 'percentage';
  //   discountValue: number;
  // };
  // showCouponForm: boolean;
  // onRemoveCoupon: (code: string) => void;
  // onAddCoupon: (coupon: any) => void;
  // setCouponForm: (form: any) => void;
  // setShowCouponForm: (show: boolean) => void;
  addNotification: (
    message: string,
    type: 'error' | 'success' | 'warning'
  ) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  products,
  productForm,
  editingProduct,
  showProductForm,
  cart,
  onSetActiveTab,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onStartEditProduct,
  setProductForm,
  setEditingProduct,
  setShowProductForm,
  addNotification,
}) => {
  const [activeTab] = useAtom(activeTabAtom);
  return (
    <div className='max-w-6xl mx-auto'>
      <AdminHeader />

      {activeTab === 'products' ? (
        <ProductManagement
          products={products}
          productForm={productForm}
          editingProduct={editingProduct}
          showProductForm={showProductForm}
          cart={cart}
          isAdmin={isAdmin}
          onAddProduct={onAddProduct}
          onUpdateProduct={onUpdateProduct}
          onDeleteProduct={onDeleteProduct}
          onStartEditProduct={onStartEditProduct}
          setProductForm={setProductForm}
          setEditingProduct={setEditingProduct}
          setShowProductForm={setShowProductForm}
          addNotification={addNotification}
        />
      ) : (
        <CouponManagement
          coupons={coupons}
          couponForm={couponForm}
          showCouponForm={showCouponForm}
          onRemoveCoupon={onRemoveCoupon}
          onAddCoupon={onAddCoupon}
          setCouponForm={setCouponForm}
          setShowCouponForm={setShowCouponForm}
          addNotification={addNotification}
        />
      )}
    </div>
  );
};
