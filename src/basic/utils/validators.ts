/**
 * 검증 결과 인터페이스
 */
export interface ValidationResult {
  isValid: boolean;
  message: string;
  correctedValue?: number;
}

/**
 * 가격 검증 (productService)
 */
export const validatePrice = (value: string): ValidationResult => {
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
};

/**
 * 재고 검증 (productService)
 */
export const validateStock = (value: string): ValidationResult => {
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
};