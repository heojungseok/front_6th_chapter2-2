import { ProductForm, ProductWithUI } from '../types';

export interface validationResult {
  isValid: boolean;
  message: string;
  correctedValue?: number;
}

export const productService = {
  // 가격 검증
  validatePrice: (value: string): validationResult => {
    if (value === '') {
      return { isValid: true, message: '', correctedValue: 0 };
    }

    const price = parseInt(value);
    if (isNaN(price)) {
      return {
        isValid: false,
        message: '숫자만 입력',
        correctedValue: 0,
      };
    }

    if (price <= 0) {
      return {
        isValid: false,
        message: '가격은 0보다 커야 합니다.',
        correctedValue: 0,
      };
    }
    return { isValid: true, message: '', correctedValue: price };
  },
  // 재고 검증
  validateStock: (value: string): validationResult => {
    if (value === '') {
      return { isValid: true, message: '', correctedValue: 0 };
    }

    const stock = parseInt(value);
    if (isNaN(stock)) {
      return {
        isValid: false,
        message: '숫자만 입력',
        correctedValue: 0,
      };
    }

    if (stock <= 0) {
      return {
        isValid: false,
        message: '재고는 0보다 커야 합니다',
        correctedValue: 0,
      };
    }
    if (stock > 9999) {
      return {
        isValid: false,
        message: '재고는 9999개를 초과할 수 없습니다',
        correctedValue: 9999,
      };
    }
    return { isValid: true, message: '', correctedValue: stock };
  },
  // 상품 ID 생성
  generateProductId: (): string => `p${Date.now()}`,

  // 상품 생성
  createProduct: (product: ProductForm): ProductWithUI => {
    return {
      ...product,
      id: productService.generateProductId(),
    };
  },

  //상품 수정
  updateProductList: (
    products: ProductWithUI[],
    productId: string,
    updates: Partial<ProductWithUI>
  ): ProductWithUI[] => {
    return products.map(product =>
      product.id === productId ? { ...product, ...updates } : product
    );
  },

  // 상품 삭제
  removeProduct: (
    products: ProductWithUI[],
    productId: string
  ): ProductWithUI[] => {
    return products.filter(product => product.id !== productId);
  },
};
