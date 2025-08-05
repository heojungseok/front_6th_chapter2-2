# Step 2: Hook 분리 작업 (2024-08-04)

## 🎯 목표

App.tsx의 상태 관리 로직을 재사용 가능한 Custom Hook으로 분리하여 단일 책임 원칙 적용

## 📋 Hook 분리 순서 (난이도별)

### 1단계: useLocalStorage Hook ⭐

**목적**: localStorage 관리 로직의 중복 제거  
**파일**: `src/basic/hooks/useLocalStorage.ts`

#### 기존 문제점

```typescript
// ❌ 3번 반복되는 패턴 (products, cart, coupons)
const [products, setProducts] = useState(() => {
  const saved = localStorage.getItem('products');
  // ... 10줄의 중복 코드
});

useEffect(() => {
  localStorage.setItem('products', JSON.stringify(products));
}, [products]);
```

#### 해결 방법

```typescript
// ✅ 재사용 가능한 Hook
const [products, setProducts] = useLocalStorage<ProductWithUI[]>(
  'products',
  initialProducts
);
```

#### 핵심 개념: React 함수형 상태 업데이트

```typescript
// ❌ 순환 참조 위험
const setValue = value => {
  const result = value(storedValue); // 오래된 값 참조 가능
  setStoredValue(result);
};

// ✅ React가 최신 값 제공
// prevValue는 setStoredValue의 함수형 업데이트에서 React가 자동으로 전달해주는 "이전 상태값"입니다.
// 즉, setStoredValue(prevValue => { ... }) 형태로 사용하면, prevValue는 항상 최신 상태를 보장합니다.
const setValue = useCallback(
  value => {
    setStoredValue(prevValue => {
      // prevValue는 setStoredValue 콜백의 첫 번째 인자로, React가 현재 상태의 최신값을 전달합니다.
      const result = value instanceof Function ? value(prevValue) : value;
      localStorage.setItem(key, JSON.stringify(result));
      return result;
    });
  },
  [key]
);
```

### 2단계: useNotifications Hook ⭐⭐

**목적**: 알림 상태 관리 로직 분리  
**파일**: `src/basic/hooks/useNotifications.ts`

#### 분리된 기능

- 알림 추가 (`addNotification`)
- 알림 제거 (`removeNotification`)
- 3초 자동 제거 로직

#### 적용 결과

```typescript
// App.tsx에서 간단하게 사용
const { notifications, addNotification, removeNotification } = useNotifications();

// 알림 닫기 버튼
<button onClick={() => removeNotification(notif.id)}>×</button>
```

### 3단계: useDebounce Hook ⭐⭐⭐

**목적**: 검색 입력 지연 처리로 성능 최적화  
**파일**: `src/basic/hooks/useDebounce.ts`

#### 디바운스가 필요한 이유

- **성능 최적화**: 매 글자마다 검색하지 않고 입력 완료 후 검색
- **불필요한 연산 제거**: `"상품1"` 입력 시 5번 → 1번으로 감소
- **API 호출 최적화**: 서버 요청 횟수 대폭 감소

#### 적용 결과

```typescript
// ✅ 간단한 사용법
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 500);

// 기존 useEffect 제거됨 (5줄 → 1줄)
```

## 🏗️ 코드 구조 개선

### Before: 중복과 복잡성

```typescript
// App.tsx에 모든 로직이 집중됨
- localStorage 관리 로직 × 3
- 알림 상태 관리
- 검색 디바운스 로직
- 총 30+ 줄의 상태 관리 코드
```

### After: 깔끔한 분리

```typescript
// 재사용 가능한 Hook들
const [products, setProducts] = useLocalStorage('products', initialProducts);
const [cart, setCart] = useLocalStorage('cart', []);
const [coupons, setCoupons] = useLocalStorage('coupons', initialCoupons);
const { notifications, addNotification, removeNotification } =
  useNotifications();
const debouncedSearchTerm = useDebounce(searchTerm, 500);
```

## 📊 성과

### 코드 품질

- **중복 제거**: localStorage 관리 코드 70% 감소
- **재사용성**: 다른 컴포넌트에서도 Hook 활용 가능
- **테스트 용이성**: Hook별 독립적인 단위 테스트 가능

### 성능 향상

- **검색 성능**: 디바운스로 80% 연산 감소
- **메모리 효율성**: 함수형 상태 업데이트로 안정성 향상

### 유지보수성

- **단일 책임**: 각 Hook이 하나의 관심사만 처리
- **타입 안전성**: TypeScript 제네릭으로 타입 보장
- **캡슐화**: 관련 로직이 Hook 내부에 응집

## 🔄 다음 단계 계획

### 4단계: useCoupons Hook (예정)

- 쿠폰 상태 관리 및 검증 로직 분리

### 5단계: useProducts Hook (예정)

- 상품 CRUD 작업 및 재고 관리 로직 분리

### 6단계: useCart Hook (예정)

- 장바구니 상태 관리 및 복잡한 비즈니스 로직 분리

## 💡 학습 포인트

1. **Custom Hook의 힘**: 로직 재사용과 코드 구조화
2. **React 함수형 업데이트**: `prevValue`를 통한 안전한 상태 관리
3. **디바운스 패턴**: 성능 최적화의 핵심 기법
4. **점진적 리팩토링**: 작은 단위로 안전하게 개선

# Step 2: Custom Hook 분리 (완료)

## 🎯 목표

App.tsx의 상태 관리 로직을 재사용 가능한 Hook으로 분리하여 단일 책임 원칙 적용

## 📋 완료된 Hook들

### 1. useLocalStorage Hook ⭐

**역할**: localStorage 관리 로직 통합 및 중복 제거

**Before (문제점)**:

```typescript
// 3번 반복되는 패턴 (products, cart, coupons)
const [products, setProducts] = useState(() => {
  const saved = localStorage.getItem('products');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return initialProducts;
    }
  }
  return initialProducts;
});

// 별도 useEffect로 저장
useEffect(() => {
  localStorage.setItem('products', JSON.stringify(products));
}, [products]);
```

**After (해결)**:

```typescript
// 간단하고 재사용 가능
const [products, setProducts] = useLocalStorage('products', initialProducts);
```

**핵심 기능**:

- React 함수형 상태 업데이트 적용 (`prevValue` 사용)
- 에러 처리 및 타입 안정성 확보
- 자동 JSON 직렬화/역직렬화

### 2. useNotifications Hook ⭐⭐

**역할**: 알림 시스템 캡슐화 및 독립적 관리

**주요 기능**:

```typescript
const { notifications, addNotification, removeNotification } =
  useNotifications();

// 자동 3초 후 제거
addNotification('쿠폰이 적용되었습니다', 'success');
// 수동 제거
removeNotification(notificationId);
```

**개선점**:

- 알림 로직이 독립적으로 분리됨
- 타입별 알림 처리 (`error`, `success`, `warning`)
- 자동 제거 타이머 관리

### 3. useDebounce Hook ⭐⭐⭐

**역할**: 검색 성능 최적화 (입력 지연 처리)

**성능 개선**:

```typescript
// Before: 매 입력마다 검색 실행
onChange={e => setSearchTerm(e.target.value)}  // 5회 검색

// After: 500ms 지연 후 1회만 실행
const debouncedSearchTerm = useDebounce(searchTerm, 500);  // 1회 검색
```

**실제 효과**:

- **연산량 80% 감소**: "상품1" 입력 시 5회 → 1회로 감소
- **UX 개선**: 불필요한 깜빡임 제거
- **서버 부하 감소**: API 호출 횟수 최소화

### 4. useCoupon Hook ⭐⭐⭐⭐ (도메인 서비스 패턴)

**역할**: 쿠폰 상태 관리 + 비즈니스 로직 조합

**아키텍처**:

```typescript
// Hook: React 상태 + 비즈니스 로직 조합
const { coupons, selectedCoupon, applyCoupon, addCoupon, deleteCoupon } =
  useCoupon({ cart, calculateCartTotal, addNotification });

// Service: 순수 비즈니스 로직
couponService.validateCouponApplication(coupon, cartTotal);
couponService.checkDuplicateCoupon(newCoupon, existingCoupons);
```

**주요 기능**:

- **쿠폰 적용 검증**: 10,000원 이상, percentage 타입 제한
- **중복 코드 검증**: 동일한 쿠폰 코드 방지
- **상태 동기화**: 쿠폰 삭제 시 선택된 쿠폰 자동 해제
- **의존성 주입**: 외부 함수들을 매개변수로 받아 결합도 감소

## 🏗️ 전체 아키텍처 구조

```
┌─────────────────────────────────────────┐
│             App.tsx (UI Layer)          │
│  ┌─────────────────────────────────────┐ │
│  │        React Component              │ │
│  │     (렌더링 + 이벤트 처리)            │ │
│  └─────────────────────────────────────┘ │
└─────────────────┬───────────────────────┘
                  │ 의존성 주입
┌─────────────────▼───────────────────────┐
│          Hook Layer (상태 관리)          │
│  ┌─────────────────────────────────────┐ │
│  │   useCoupon, useNotifications,      │ │
│  │   useLocalStorage, useDebounce      │ │
│  │   (React 상태 + 비즈니스 로직 조합)  │ │
│  └─────────────────────────────────────┘ │
└─────────────────┬───────────────────────┘
                  │ 비즈니스 로직 호출
┌─────────────────▼───────────────────────┐
│        Service Layer (비즈니스 로직)     │
│  ┌─────────────────────────────────────┐ │
│  │      couponService                  │ │
│  │   (순수한 도메인 로직 + 검증)        │ │
│  └─────────────────────────────────────┘ │
└─────────────────┬───────────────────────┘
                  │ 유틸리티 호출
┌─────────────────▼───────────────────────┐
│         Utils Layer (순수 함수)         │
│  ┌─────────────────────────────────────┐ │
│  │   calculators, formatters, etc      │ │
│  │   (계산, 포맷팅, 필터링 등)           │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🔄 데이터 흐름

UI 이벤트 (쿠폰 선택)
↓
App.tsx: applyCoupon(coupon) 호출
↓
useCoupon Hook:

1. calculateCartTotal로 현재 총액 계산
2. couponService.validateCouponApplication 호출
3. 검증 결과에 따라 상태 업데이트
   ↓
   couponService: 순수한 비즈니스 로직 실행

- 10,000원 이상 검증
- percentage 타입 제한 확인
  ↓
  Hook: 검증 결과 기반 상태 업데이트
- setSelectedCoupon(coupon)
- addNotification(message)
  ↓
  App.tsx: 새로운 상태로 UI 리렌더링

---

## 🔧 핵심 설계 원칙

### 1. **의존성 역전 (Dependency Inversion)**

```typescript
// Hook이 외부 의존성을 주입받아 결합도 감소
useCoupon({ cart, calculateCartTotal, addNotification });
```

### 2. **관심사 분리 (Separation of Concerns)**

- **App.tsx**: UI 렌더링 + 이벤트 처리만 담당
- **Hook**: 상태 관리 + 외부 서비스 조합
- **Service**: 순수한 도메인 비즈니스 로직
- **Utils**: 계산, 포맷팅 등 순수 함수

### 3. **단일 책임 원칙 (Single Responsibility)**

- 각 Hook이 하나의 도메인 영역만 담당
- 쿠폰 관련 모든 로직이 `useCoupon` + `couponService`에 집중
- localStorage 관리는 `useLocalStorage`만 담당

### 4. **테스트 용이성**

```typescript
// Service: 완전히 독립적 테스트 가능
expect(couponService.validateCouponApplication(coupon, 5000)).toEqual({
  isValid: false,
  message: '...',
});

// Hook: 모킹된 의존성으로 테스트
const mockProps = { cart: [], calculateCartTotal: jest.fn() };
```

## 🕐 5단계: useProducts Hook 분리 (도메인 서비스 패턴)

### 목적

상품 CRUD 로직과 상태 관리 분리

### 도메인 서비스 패턴 적용

**productService (순수 비즈니스 로직)**

```typescript
export const productService = {
  validatePrice: (value: string): ValidationResult => {
    if (value === '') return { isValid: true, message: '', correctedValue: 0 };
    const price = parseInt(value);
    if (isNaN(price)) {
      return {
        isValid: false,
        message: '숫자만 입력해주세요.',
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
  validateStock: (value: string): ValidationResult => {
    /* ... */
  },
  generateProductId: (): string => `p${Date.now()}`,
  createProduct: (product: ProductForm): ProductWithUI => {
    return { ...product, id: productService.generateProductId() };
  },
  updateProductList: (products, productId, updates) => {
    return products.map(product =>
      product.id === productId ? { ...product, ...updates } : product
    );
  },
  removeProduct: (products, productId) => {
    return products.filter(product => product.id !== productId);
  },
};
```

**useProducts Hook (상태 관리 + 서비스 조합)**

```typescript
export const useProducts = ({ addNotification, initialProducts }) => {
  const [products, setProducts] = useLocalStorage('products', initialProducts);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    /* ... */
  });
  const [showProductForm, setShowProductForm] = useState(false);

  const addProduct = useCallback(
    (product: ProductForm) => {
      const newProduct = productService.createProduct(product);
      setProducts(prev => [...prev, newProduct]);
      addNotification('상품이 추가되었습니다.', 'success');
    },
    [addNotification]
  );

  const updateProduct = useCallback(
    (productId: string, updates) => {
      setProducts(prev => {
        return productService.updateProductList(prev, productId, updates);
      });
      addNotification('상품이 수정되었습니다.', 'success');
    },
    [addNotification]
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      setProducts(prev => productService.removeProduct(prev, productId));
      addNotification('상품이 삭제되었습니다.', 'success');
    },
    [addNotification]
  );

  return {
    products,
    editingProduct,
    productForm,
    showProductForm,
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
```

### 🚨 주요 트러블슈팅

**문제**: "상품의 가격 입력 시 숫자만 허용된다" 테스트 실패

**증상**: `TestingLibraryElementError: Unable to find an element with the placeholder text of: 숫자만 입력`

**트러블슈팅 과정**:

1. **데이터 문제 의심** → useProducts Hook에서 initialProducts 전달 확인
2. **localStorage 문제 의심** → useLocalStorage Hook 초기화 로직 확인
3. **렌더링 문제 발견** → 조건부 렌더링 구조 분석

**근본 원인**: **"수정" 버튼의 onClick 핸들러가 잘못 설정됨**

```typescript
// ❌ 문제가 있던 코드
<button onClick={() => updateProduct(product.id, product)}>
  수정
</button>

// ✅ 수정된 코드
<button onClick={() => startEditProduct(product)}>
  수정
</button>
```

**해결**: `updateProduct` → `startEditProduct`로 변경하여 상품 수정 폼이 열리도록 수정

### 핵심 성과

- **도메인 로직 분리**: 순수한 비즈니스 로직을 productService로 분리
- **상태 관리 캡슐화**: 상품 관련 모든 상태를 useProducts Hook에서 관리
- **테스트 용이성**: 도메인 로직과 React 상태 분리로 독립적 테스트 가능
- **재사용성**: 다른 컴포넌트에서도 동일한 상품 관리 로직 활용 가능

### 아키텍처 개선

App.tsx (UI)
↓ 의존성 주입
useProducts Hook (상태 관리)
↓ 비즈니스 로직 호출
productService (도메인 로직)
