import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { productService } from '../services/productService';
import { ProductWithUI, ProductForm } from '../types';
import { filterProducts } from '../utils/filters';

interface useProductProps {
  searchTerm: string;
  addNotification: (message: string, type: 'success' | 'error') => void;
  initialProducts: ProductWithUI[];
}

export const useProducts = ({
  searchTerm,
  addNotification,
  initialProducts,
}: useProductProps) => {
  const [products, setProducts] = useLocalStorage<ProductWithUI[]>(
    'products',
    initialProducts
  );
  const [filteredProducts, setFilteredProducts] = useState<ProductWithUI[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    price: 0,
    stock: 0,
    description: '',
    discounts: [],
  });
  const [showProductForm, setShowProductForm] = useState(false);

  useEffect(() => {
    const filtered = filterProducts(products, searchTerm);
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const startEditProduct = (product: ProductWithUI) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || '',
      discounts: product.discounts || [],
    });
    setShowProductForm(true);
  };

  const resetProductForm = useCallback(() => {
    setProductForm({
      name: '',
      price: 0,
      stock: 0,
      description: '',
      discounts: [],
    });
    setEditingProduct(null);
    setShowProductForm(false);
  }, []);

  const addProduct = useCallback(
    (product: ProductForm) => {
      const newProduct = productService.createProduct(product);
      setProducts(prev => [...prev, newProduct]);
      addNotification('상품이 추가되었습니다.', 'success');
    },
    [addNotification]
  );

  const updateProduct = useCallback(
    (productId: string, updates: Partial<ProductWithUI>) => {
      setProducts(prev => {
        return productService.updateProductList(prev, productId, updates);
      });
      addNotification('상품이 수정되었습니다.', 'success');
    },
    [addNotification]
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      const updatedProduct = productService.removeProduct(products, productId);
      setProducts(updatedProduct);
      addNotification('상품이 삭제되었습니다.', 'success');
    },
    [addNotification]
  );

  return {
    products,
    editingProduct,
    productForm,
    showProductForm,
    filteredProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    startEditProduct,
    resetProductForm,
    setProductForm,
    setEditingProduct,
    setShowProductForm,
  };
};
