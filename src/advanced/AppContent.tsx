import { useNotifications } from './hooks/useNotifications';
import { useCoupon } from './hooks/useCoupon';
import { useProducts } from './hooks/useProducts';
import { useCart } from './hooks/useCart';
import { useSearch } from './hooks/useSearch';
import { useUIState } from './hooks/useUIStates';
import { Notification } from './components/ui';
import { Header } from './components/layout';
import { AdminPage, ShoppingPage } from './components/pages';
import { initialProducts } from './data/initialData';

export const AppContent = () => {
  const { notifications, addNotification, removeNotification } =
    useNotifications();

  const { debouncedSearchTerm } = useSearch();

  const {
    coupons,
    selectedCoupon,
    onClearSelectedCoupon,
    onApplyCoupon,
  } = useCoupon();

  const {
    products,
    filteredProducts,
    onAddProduct,
    onUpdateProduct,
    onDeleteProduct,
    onStartEditProduct,
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
    totals,
  } = useCart({
    products,
    addNotification,
  });

  const {
    isAdmin,
    onSetActiveTab,
  } = useUIState();

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
      <Header />

      <main className='max-w-7xl mx-auto px-4 py-8'>
        {isAdmin ? (
          <AdminPage
            onSetActiveTab={onSetActiveTab}
            onAddProduct={onAddProduct}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
            onStartEditProduct={onStartEditProduct}
          />
        ) : (
          <ShoppingPage
            products={products}
            filteredProducts={filteredProducts}
            cart={cart}
            coupons={coupons}
            selectedCoupon={selectedCoupon}
            totals={totals}
            searchTerm={debouncedSearchTerm}
            isAdmin={isAdmin}
            onAddToCart={onAddToCart}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveFromCart={onRemoveFromCart}
            onApplyCoupon={onApplyCoupon}
            onClearSelectedCoupon={onClearSelectedCoupon}
            onCompleteOrder={onCompleteOrder}
          />
        )}
      </main>
    </div>
  );
};
