import { useState, useCallback, useEffect } from 'react';
import { CartItem, ProductWithUI } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { generateOrderNumber } from '../utils/generators';
import { cartService } from '../services/cartService';
import { validateCartOperation } from '../utils/validators';


interface UseCartProps {
  products: ProductWithUI[];
  addNotification: (message: string, type: 'error' | 'success' | 'warning') => void;
}

export const useCart = ({ products, addNotification }: UseCartProps) => {
  const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);
  const [totalItemCount, setTotalItemCount] = useState(0);

  useEffect(() => {
    const count = cartService.calculateTotalItemCount(cart);
    setTotalItemCount(count);
  }, [cart]);

  const addToCart = useCallback(
    (product: ProductWithUI) => {
      // 검증
      const stockValidation = validateCartOperation.validateStockAvailability(product, cart);
      if (!stockValidation.isValid) {
        addNotification(stockValidation.message, 'error');
        return;
      }

      const existingItem = cart.find(item => item.product.id === product.id);
      if (existingItem) {
        const quantityValidation = validateCartOperation.validateQuantityIncrease(product, existingItem.quantity);
        if (!quantityValidation.isValid) {
          addNotification(quantityValidation.message, 'error');
          return;
        }
      }

      // 비즈니스 로직
      const newCart = cartService.addItemToCart(product, cart);
      setCart(newCart);
      addNotification('장바구니에 담았습니다', 'success');
    },
    [cart, addNotification]
  );

  const removeFromCart = useCallback((productId: string) => {
    const newCart = cartService.removeItemFromCart(productId, cart);
    setCart(newCart);
  }, [cart]);

  const updateQuantity = useCallback(
    (productId: string, newQuantity: number) => {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const validation = validateCartOperation.validateQuantityChange(product, newQuantity);
      
      if (!validation.isValid) {
        if (validation.action === 'remove') {
          removeFromCart(productId);
          return;
        }
        addNotification(validation.message, 'error');
        return;
      }

      const newCart = cartService.updateItemQuantity(productId, newQuantity, cart);
      setCart(newCart);
    },
    [products, cart, removeFromCart, addNotification]
  );

  const completeOrder = useCallback(() => {
  const orderNumber = generateOrderNumber();
  addNotification(
    `주문이 완료되었습니다. 주문번호: ${orderNumber}`,
    'success'
  );
  setCart([]);
}, [addNotification]);

  return {
    cart,
    totalItemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    completeOrder,
  };
};