import {
  calculateCartTotal,
  calculateItemTotal,
  getRemainingStock,
} from './utils/calculators';
import { formatPrice } from './utils/formatters';
import { ProductWithUI } from './types';
import { useNotifications } from './hooks/useNotifications';
import { useCoupon } from './hooks/useCoupon';
import { useProducts } from './hooks/useProducts';
import { productService } from './services/productService';
import { useCart } from './hooks/useCart';
import { useSearch } from './hooks/useSearch';
import { useUIState } from './hooks/useUIStates';
import { useCouponForm } from './hooks/useCouponForm';
import { Button, Input, Notification } from './components/ui';
import { ProductCard } from './components/product';
import { CartItem } from './components/cart';
import { CartSidebar } from './components/cart';
import { Header } from './components/layout';
import { ProductList } from './components/product';
import { CouponManagement, ProductManagement } from './components/pages/admin';

// 초기 데이터
const initialProducts: ProductWithUI[] = [
  {
    id: 'p1',
    name: '상품1',
    price: 10000,
    stock: 20,
    discounts: [
      { quantity: 10, rate: 0.1 },
      { quantity: 20, rate: 0.2 },
    ],
    description: '최고급 품질의 프리미엄 상품입니다.',
  },
  {
    id: 'p2',
    name: '상품2',
    price: 20000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.15 }],
    description: '다양한 기능을 갖춘 실용적인 상품입니다.',
    isRecommended: true,
  },
  {
    id: 'p3',
    name: '상품3',
    price: 30000,
    stock: 20,
    discounts: [
      { quantity: 10, rate: 0.2 },
      { quantity: 30, rate: 0.25 },
    ],
    description: '대용량과 고성능을 자랑하는 상품입니다.',
  },
];

const App = () => {
  const { notifications, addNotification, removeNotification } =
    useNotifications();

  const { searchTerm, setSearchTerm, debouncedSearchTerm } = useSearch();

  const {
    coupons,
    selectedCoupon,
    onAddCoupon,
    onRemoveCoupon,
    onClearSelectedCoupon,
    onApplyCoupon,
  } = useCoupon({ cart: [], calculateCartTotal, addNotification });

  const {
    products,
    editingProduct,
    productForm,
    showProductForm,
    filteredProducts,
    onAddProduct,
    onUpdateProduct,
    onDeleteProduct,
    onStartEditProduct,
    resetProductForm,
    setProductForm,
    setEditingProduct,
    setShowProductForm,
  } = useProducts({
    addNotification,
    initialProducts,
    searchTerm: debouncedSearchTerm,
  });

  const {
    cart,
    onAddToCart,
    onUpdateQuantity,
    onCompleteOrder,
    onRemoveFromCart,
    totalItemCount,
    totals,
  } = useCart({
    products,
    selectedCoupon,
    addNotification,
  });

  const {
    isAdmin,
    activeTab,
    showCouponForm,
    setIsAdmin,
    onSetActiveTab,
    setShowCouponForm,
    onToggleAdmin,
  } = useUIState();

  const { couponForm, setCouponForm } = useCouponForm();

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && editingProduct !== 'new') {
      onUpdateProduct(editingProduct, productForm);
    } else {
      onAddProduct(productForm);
    }

    resetProductForm();
  };

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

  return (
    <div className='min-h-screen bg-gray-50'>
      {notifications.length > 0 && (
        <div className='fixed top-20 right-4 z-50 space-y-2 max-w-sm'>
          {notifications.map(notif => (
            <Notification
              key={notif.id}
              message={notif.message}
              type={notif.type}
              onClose={() => removeNotification(notif.id)}
            />
          ))}
        </div>
      )}
      <Header
        isAdmin={isAdmin}
        searchTerm={searchTerm}
        cartLength={cart.length}
        totalItemCount={totalItemCount}
        onSearchChange={setSearchTerm}
        onToggleAdmin={onToggleAdmin}
      />

      <main className='max-w-7xl mx-auto px-4 py-8'>
        {isAdmin ? (
          <div className='max-w-6xl mx-auto'>
            <div className='mb-8'>
              <h1 className='text-2xl font-bold text-gray-900'>
                관리자 대시보드
              </h1>
              <p className='text-gray-600 mt-1'>
                상품과 쿠폰을 관리할 수 있습니다
              </p>
            </div>
            <div className='border-b border-gray-200 mb-6'>
              <nav className='-mb-px flex space-x-8'>
                <button
                  onClick={() => onSetActiveTab('products')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'products'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  상품 관리
                </button>
                <button
                  onClick={() => onSetActiveTab('coupons')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'coupons'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  쿠폰 관리
                </button>
              </nav>
            </div>

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
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
            <div className='lg:col-span-3'>
              <ProductList
                products={products}
                filteredProducts={filteredProducts}
                cart={cart}
                searchTerm={debouncedSearchTerm}
                isAdmin={isAdmin}
                onAddToCart={onAddToCart}
              />
            </div>

            <div className='lg:col-span-1'>
              <CartSidebar
                cart={cart}
                coupons={coupons}
                selectedCoupon={selectedCoupon}
                totals={totals}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveFromCart={onRemoveFromCart}
                onApplyCoupon={onApplyCoupon}
                onClearSelectedCoupon={onClearSelectedCoupon}
                onCompleteOrder={onCompleteOrder}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
