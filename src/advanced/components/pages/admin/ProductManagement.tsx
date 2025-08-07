import React from 'react';
import { useAtom } from 'jotai';
import { ProductWithUI } from '../../../types';
import { ProductTable } from './product/ProductTable';
import { ProductForm } from './product/ProductForm';
import { AddProductButton } from './product/AddProductButton';
import { productsAtom, editingProductAtom, productFormAtom } from '../../../atoms/productAtoms';
import { cartAtom } from '../../../atoms/cartAtoms';
import { isAdminAtom, showProductFormAtom } from '../../../atoms/uiAtoms';

interface ProductManagementProps {
  onAddProduct: (product: any) => void;
  onUpdateProduct: (productId: string, updates: any) => void;
  onDeleteProduct: (productId: string) => void;
  onStartEditProduct: (product: ProductWithUI) => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onStartEditProduct,
}) => {
  const [products] = useAtom(productsAtom);
  const [cart] = useAtom(cartAtom);
  const [isAdmin] = useAtom(isAdminAtom);
  const [showProductForm, setShowProductForm] = useAtom(showProductFormAtom);
  const [editingProduct, setEditingProduct] = useAtom(editingProductAtom);
  const [productForm, setProductForm] = useAtom(productFormAtom);

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && editingProduct !== 'new') {
      onUpdateProduct(editingProduct, productForm);
    } else {
      onAddProduct(productForm);
    }
    setProductForm({
      name: '',
      price: 0,
      stock: 0,
      description: '',
      discounts: [],
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: 0,
      stock: 0,
      description: '',
      discounts: [],
    });
    setShowProductForm(false);
  };

  const handleAddProduct = () => {
    setEditingProduct('new');
    setProductForm({
      name: '',
      price: 0,
      stock: 0,
      description: '',
      discounts: [],
    });
    setShowProductForm(true);
  };

  return (
    <section className='bg-white rounded-lg border border-gray-200'>
      <div className='p-6 border-b border-gray-200'>
        <div className='flex justify-between items-center'>
          <h2 className='text-lg font-semibold'>상품 목록</h2>
          <AddProductButton onClick={handleAddProduct} />
        </div>
      </div>

      <ProductTable
        products={products}
        cart={cart}
        onStartEditProduct={onStartEditProduct}
        onDeleteProduct={onDeleteProduct}
        isAdmin={isAdmin}
      />

      {showProductForm && (
        <ProductForm
          onSubmit={handleProductSubmit}
          onCancel={handleCancel}
        />
      )}
    </section>
  );
};
