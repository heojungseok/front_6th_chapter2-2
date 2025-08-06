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
import { CouponManagement } from './components/pages/admin';

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
              <section className='bg-white rounded-lg border border-gray-200'>
                <div className='p-6 border-b border-gray-200'>
                  <div className='flex justify-between items-center'>
                    <h2 className='text-lg font-semibold'>상품 목록</h2>
                    <Button
                      onClick={() => {
                        setEditingProduct('new');
                        setProductForm({
                          name: '',
                          price: 0,
                          stock: 0,
                          description: '',
                          discounts: [],
                        });
                        setShowProductForm(true);
                      }}
                      variant='gray'
                    >
                      새 상품 추가
                    </Button>
                  </div>
                </div>

                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead className='bg-gray-50 border-b border-gray-200'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          상품명
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          가격
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          재고
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          설명
                        </th>
                        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {(activeTab === 'products' ? products : products).map(
                        product => (
                          <tr key={product.id} className='hover:bg-gray-50'>
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                              {product.name}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {formatPrice(
                                product.price,
                                isAdmin,
                                getRemainingStock(product, cart) <= 0
                              )}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  product.stock > 10
                                    ? 'bg-green-100 text-green-800'
                                    : product.stock > 0
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {product.stock}개
                              </span>
                            </td>
                            <td className='px-6 py-4 text-sm text-gray-500 max-w-xs truncate'>
                              {product.description || '-'}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                              <button
                                onClick={() => onStartEditProduct(product)}
                                className='text-indigo-600 hover:text-indigo-900 mr-3'
                              >
                                수정
                              </button>
                              <button
                                onClick={() => onDeleteProduct(product.id)}
                                className='text-red-600 hover:text-red-900'
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                {showProductForm && (
                  <div className='p-6 border-t border-gray-200 bg-gray-50'>
                    <form onSubmit={handleProductSubmit} className='space-y-4'>
                      <h3 className='text-lg font-medium text-gray-900'>
                        {editingProduct === 'new'
                          ? '새 상품 추가'
                          : '상품 수정'}
                      </h3>
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div>
                          <Input
                            label='상품명'
                            value={productForm.name}
                            onChange={value =>
                              setProductForm({
                                ...productForm,
                                name: value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <Input
                            label='설명'
                            value={productForm.description}
                            onChange={value =>
                              setProductForm({
                                ...productForm,
                                description: value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            가격
                          </label>
                          <input
                            type='text'
                            value={
                              productForm.price === 0 ? '' : productForm.price
                            }
                            onChange={e => {
                              const value = e.target.value;
                              if (value === '' || /^\d+$/.test(value)) {
                                setProductForm({
                                  ...productForm,
                                  price: value === '' ? 0 : parseInt(value),
                                });
                              }
                            }}
                            onBlur={e => {
                              const value = e.target.value;
                              if (value === '') {
                                setProductForm({ ...productForm, price: 0 });
                              } else if (parseInt(value) < 0) {
                                const validationResult =
                                  productService.validatePrice(value);
                                if (!validationResult.isValid) {
                                  addNotification(
                                    validationResult.message,
                                    'error'
                                  );
                                  setProductForm({
                                    ...productForm,
                                    price: validationResult.correctedValue || 0,
                                  });
                                }
                              }
                            }}
                            className='w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border'
                            placeholder='숫자만 입력'
                            required
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            재고
                          </label>
                          <input
                            type='text'
                            value={
                              productForm.stock === 0 ? '' : productForm.stock
                            }
                            onChange={e => {
                              const value = e.target.value;
                              if (value === '' || /^\d+$/.test(value)) {
                                setProductForm({
                                  ...productForm,
                                  stock: value === '' ? 0 : parseInt(value),
                                });
                              }
                            }}
                            onBlur={e => {
                              const value = e.target.value;
                              if (value === '') {
                                setProductForm({ ...productForm, price: 0 });
                              } else if (parseInt(value) < 0) {
                                const validationResult =
                                  productService.validateStock(value);
                                if (!validationResult.isValid) {
                                  addNotification(
                                    validationResult.message,
                                    'error'
                                  );
                                  setProductForm({
                                    ...productForm,
                                    price: validationResult.correctedValue || 0,
                                  });
                                }
                              }
                            }}
                            className='w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border'
                            placeholder='숫자만 입력'
                            required
                          />
                        </div>
                      </div>
                      <div className='mt-4'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          할인 정책
                        </label>
                        <div className='space-y-2'>
                          {productForm.discounts.map((discount, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-2 bg-gray-50 p-2 rounded'
                            >
                              <input
                                type='number'
                                value={discount.quantity}
                                onChange={e => {
                                  const newDiscounts = [
                                    ...productForm.discounts,
                                  ];
                                  newDiscounts[index].quantity =
                                    parseInt(e.target.value) || 0;
                                  setProductForm({
                                    ...productForm,
                                    discounts: newDiscounts,
                                  });
                                }}
                                className='w-20 px-2 py-1 border rounded'
                                min='1'
                                placeholder='수량'
                              />
                              <span className='text-sm'>개 이상 구매 시</span>
                              <input
                                type='number'
                                value={discount.rate * 100}
                                onChange={e => {
                                  const newDiscounts = [
                                    ...productForm.discounts,
                                  ];
                                  newDiscounts[index].rate =
                                    (parseInt(e.target.value) || 0) / 100;
                                  setProductForm({
                                    ...productForm,
                                    discounts: newDiscounts,
                                  });
                                }}
                                className='w-16 px-2 py-1 border rounded'
                                min='0'
                                max='100'
                                placeholder='%'
                              />
                              <span className='text-sm'>% 할인</span>
                              <button
                                type='button'
                                onClick={() => {
                                  const newDiscounts =
                                    productForm.discounts.filter(
                                      (_, i) => i !== index
                                    );
                                  setProductForm({
                                    ...productForm,
                                    discounts: newDiscounts,
                                  });
                                }}
                                className='text-red-600 hover:text-red-800'
                              >
                                <svg
                                  className='w-4 h-4'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M6 18L18 6M6 6l12 12'
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            type='button'
                            onClick={() => {
                              setProductForm({
                                ...productForm,
                                discounts: [
                                  ...productForm.discounts,
                                  { quantity: 10, rate: 0.1 },
                                ],
                              });
                            }}
                            className='text-sm text-indigo-600 hover:text-indigo-800'
                          >
                            + 할인 추가
                          </button>
                        </div>
                      </div>

                      <div className='flex justify-end gap-3'>
                        <Button
                          type='button'
                          onClick={() => {
                            setEditingProduct(null);
                            setProductForm({
                              name: '',
                              price: 0,
                              stock: 0,
                              description: '',
                              discounts: [],
                            });
                            setShowProductForm(false);
                          }}
                          variant='secondary'
                        >
                          취소
                        </Button>
                        <Button type='submit' variant='primary'>
                          {editingProduct === 'new' ? '추가' : '수정'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </section>
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
