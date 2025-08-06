# Advanced 과제 작업 진행 내역

## 🎯 목표 및 배경

### **Props Drilling 문제 해결**

현재 `src/advanced/App.tsx`에서 **23개의 props**가 깊은 컴포넌트 계층으로 전달되고 있어 심각한 Props Drilling 문제가 발생하고 있습니다.

```typescript
// ❌ 현재 문제 상황
<AdminPage
  activeTab={activeTab}           // 1
  products={products}             // 2
  productForm={productForm}       // 3
  editingProduct={editingProduct} // 4
  showProductForm={showProductForm} // 5
  cart={cart}                     // 6
  isAdmin={isAdmin}               // 7
  coupons={coupons}               // 8
  couponForm={couponForm}         // 9
  showCouponForm={showCouponForm} // 10
  onSetActiveTab={onSetActiveTab} // 11
  onAddProduct={onAddProduct}     // 12
  onUpdateProduct={onUpdateProduct} // 13
  onDeleteProduct={onDeleteProduct} // 14
  onStartEditProduct={onStartEditProduct} // 15
  setProductForm={setProductForm} // 16
  setEditingProduct={setEditingProduct} // 17
  setShowProductForm={setShowProductForm} // 18
  onRemoveCoupon={onRemoveCoupon} // 19
  onAddCoupon={onAddCoupon}       // 20
  setCouponForm={setCouponForm}   // 21
  setShowCouponForm={setShowCouponForm} // 22
  addNotification={addNotification} // 23
/>
```

### **해결 방안: Jotai 전역 상태 관리**

Props Drilling을 완전히 제거하고 컴포넌트가 필요한 상태를 직접 구독하도록 하여 코드의 가독성과 유지보수성을 크게 향상시킬 예정입니다.

## ✅ 완료된 작업

### **1단계: Jotai 설치 및 기본 설정** ✅

**완료일**: 2024-08-04

**왜 필요한가?**

- **라이브러리 기반**: 전역 상태 관리를 위한 Jotai 라이브러리 설치
- **구조 설계**: atoms를 체계적으로 관리하기 위한 디렉토리 구조 설계
- **기반 마련**: 이후 단계들의 토대가 되는 기본 설정

**작업 내용**:

- [x] Jotai 설치: `pnpm add jotai`
- [x] `src/advanced/atoms/` 디렉토리 생성
- [x] 기본 atoms 구조 설계

**설치 결과**:

```bash
$ pnpm list jotai
└── jotai@2.6.4
```

**생성된 디렉토리 구조**:

```
src/advanced/atoms/
├── index.ts
├── productAtoms.ts
├── cartAtoms.ts
├── couponAtoms.ts
├── uiAtoms.ts
└── notificationAtoms.ts
```

### **2단계: 기본 상태 Atoms 생성** ✅

**완료일**: 2024-08-04

**왜 필요한가?**

- **상태 분산화**: 현재 App.tsx에 집중된 모든 상태를 개별 atoms로 분리
- **도메인별 분리**: 상품, 장바구니, 쿠폰, UI 상태를 명확히 구분
- **타입 안전성**: TypeScript를 활용한 타입 안전한 상태 관리
- **재사용성**: 각 상태를 독립적으로 관리하여 재사용 가능

**작업 내용**:

#### **UI 상태 atoms** (`atoms/uiAtoms.ts`)

```typescript
export const isAdminAtom = atom(false);
export const activeTabAtom = atom<'products' | 'coupons'>('products');
export const showProductFormAtom = atom(false);
export const showCouponFormAtom = atom(false);
export const searchTermAtom = atom('');
export const debouncedSearchTermAtom = atom('');
```

**왜 UI 상태를 분리했는가?**

- **관심사 분리**: 비즈니스 로직과 UI 상태를 명확히 구분
- **독립적 관리**: UI 상태 변경이 비즈니스 로직에 영향을 주지 않음
- **재사용성**: 다른 페이지에서도 동일한 UI 상태 패턴 사용 가능

#### **알림 atoms** (`atoms/notificationAtoms.ts`)

```typescript
export interface Notification {
  id: number;
  message: string;
  type: 'error' | 'success' | 'warning';
}

export const notificationsAtom = atom<Notification[]>([]);
```

**왜 알림을 분리했는가?**

- **전역 접근**: 모든 컴포넌트에서 알림 기능 사용 가능
- **타입 안전성**: 알림 타입을 명확히 정의하여 오류 방지
- **독립적 동작**: 다른 상태와 무관하게 알림 시스템 동작

#### **상품 atoms** (`atoms/productAtoms.ts`)

```typescript
export const productsAtom = atom<ProductWithUI[]>([]);
export const editingProductAtom = atom<string | null>(null);
export const productFormAtom = atom({
  name: '',
  price: 0,
  stock: 0,
  description: '',
  discounts: [] as Array<{ quantity: number; rate: number }>,
});
```

**왜 상품 상태를 분리했는가?**

- **CRUD 작업**: 상품 추가, 수정, 삭제 작업의 독립적 관리
- **폼 상태**: 상품 편집 폼의 상태를 별도로 관리
- **편집 모드**: 현재 편집 중인 상품을 추적

#### **장바구니 atoms** (`atoms/cartAtoms.ts`)

```typescript
export interface CartItem {
  product: any;
  quantity: number;
}

export const cartAtom = atom<CartItem[]>([]);
export const totalItemCountAtom = atom(0);
```

**왜 장바구니 상태를 분리했는가?**

- **쇼핑 핵심**: 장바구니는 쇼핑몰의 핵심 기능
- **수량 관리**: 상품별 수량 변경 로직 독립 관리
- **총액 계산**: 장바구니 총 개수와 금액 계산

#### **쿠폰 atoms** (`atoms/couponAtoms.ts`)

```typescript
export interface Coupon {
  id: string;
  name: string;
  code: string;
  discountType: 'amount' | 'percentage';
  discountValue: number;
}

export const couponsAtom = atom<Coupon[]>([]);
export const selectedCouponAtom = atom<Coupon | null>(null);
export const couponFormAtom = atom({
  name: '',
  code: '',
  discountType: 'amount' as 'amount' | 'percentage',
  discountValue: 0,
});
```

**왜 쿠폰 상태를 분리했는가?**

- **할인 로직**: 쿠폰 적용 및 할인 계산 로직 독립 관리
- **선택 상태**: 현재 선택된 쿠폰 추적
- **폼 관리**: 쿠폰 생성 폼 상태 관리

#### **Export 설정** (`atoms/index.ts`)

```typescript
export * from './productAtoms';
export * from './cartAtoms';
export * from './couponAtoms';
export * from './uiAtoms';
export * from './notificationAtoms';
```

**왜 index.ts가 필요한가?**

- **편의성**: 한 곳에서 모든 atoms를 import 가능
- **구조화**: atoms의 전체 구조를 한눈에 파악 가능
- **유지보수**: 새로운 atoms 추가 시 index.ts만 수정

## 📊 현재 상태

### **생성된 Atoms 목록**

- ✅ **UI 상태**: 6개 atoms (isAdmin, activeTab, showProductForm, showCouponForm, searchTerm, debouncedSearchTerm)
- ✅ **알림**: 1개 atoms (notifications)
- ✅ **상품**: 3개 atoms (products, editingProduct, productForm)
- ✅ **장바구니**: 2개 atoms (cart, totalItemCount)
- ✅ **쿠폰**: 3개 atoms (coupons, selectedCoupon, couponForm)

**총 15개의 기본 상태 atoms** 생성 완료

### **Props Drilling 해결 준비도**

- **Before**: 23개 props 전달
- **After**: 0개 props 전달 (예정)
- **개선 효과**: 컴포넌트 간 결합도 대폭 감소

## �� 다음 단계 계획

### **3단계: 파생 상태 Atoms 생성** (다음 진행 예정)

**왜 필요한가?**

- **계산 로직 분리**: 복잡한 계산 로직을 atoms로 캡슐화
- **성능 최적화**: 필요한 경우에만 계산이 실행되도록 최적화
- **재사용성**: 계산된 값을 여러 컴포넌트에서 공유

**예정 작업**:

- [ ] **필터링 atoms**: `filteredProductsAtom` (검색어 기반)
- [ ] **계산 atoms**: `cartTotalsAtom` (장바구니 총액 계산)
- [ ] **재고 atoms**: `remainingStockAtom` (상품별 남은 재고)

**예상 코드**:

```typescript
// 파생 atoms
export const filteredProductsAtom = atom(get => {
  const products = get(productsAtom);
  const searchTerm = get(debouncedSearchTermAtom);
  return products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
});

export const cartTotalsAtom = atom(get => {
  const cart = get(cartAtom);
  const selectedCoupon = get(selectedCouponAtom);
  return calculateCartTotal(cart, selectedCoupon);
});
```

## 💡 학습 포인트

### **Jotai 기본 개념 습득**

- **atom**: 상태의 기본 단위, React의 useState와 유사하지만 전역에서 접근 가능
- **기본 atom**: `atom(initialValue)` - 단순한 상태 저장
- **타입 안전성**: TypeScript와 완벽 호환으로 런타임 오류 방지
- **모듈화**: 도메인별로 atoms 분리하여 관심사 분리

### **Props Drilling 해결 전략**

- **문제**: 깊은 컴포넌트 계층에서 props 전달의 복잡성
- **해결**: atoms를 통한 전역 상태 관리로 컴포넌트가 필요한 상태 직접 구독
- **효과**: 컴포넌트 간 결합도 감소, 코드 가독성 향상

---

**전체 진행률**: 22% (2/9 단계 완료)
**다음 단계로 진행할 준비가 완료되었습니다!**

Ran tool
Read file: docs/pr/advanced/a-step1.md

# Jotai 핵심 정리

## 🎯 Atom이란?

**Jotai에서 상태를 저장하는 가장 작은 단위**

- React의 `useState`와 비슷하지만 **전역에서 접근 가능**
- `atom(initialValue)` 형태로 생성

## �� Atoms의 3가지 역할

### **1. 상태 저장 (기본 atom)**

```typescript
const isAdminAtom = atom(false);
const productsAtom = atom([]);
```

**역할**: 데이터를 저장하는 "상자"

### **2. 계산된 값 제공 (파생 atom)**

```typescript
const filteredProductsAtom = atom(get => {
  const products = get(productsAtom);
  const searchTerm = get(searchTermAtom);
  return products.filter(p => p.name.includes(searchTerm));
});
```

**역할**: "계산기" - 다른 데이터를 조합해서 새로운 값 제공

### **3. 상태 변경 로직 캡슐화 (액션 atom)**

```typescript
const addToCartAtom = atom(
  null, // 읽기 값
  (get, set, product) => {
    // 쓰기 함수
    const cart = get(cartAtom);
    const newCart = [...cart, product];
    set(cartAtom, newCart);
  }
);
```

**역할**: "액션 실행기" - 상태를 변경하는 로직 담당

## ��️ Jotai 내장 함수들

### **`get` 함수**

- **역할**: 다른 atom의 값을 읽어오는 함수
- **특징**: 자동 의존성 추적, 타입 안전성

### **`set` 함수**

- **역할**: 다른 atom의 값을 변경하는 함수
- **특징**: 원자적 업데이트, 자동 리렌더링

### **React Hooks**

```typescript
const [value, setValue] = useAtom(atom); // 읽기/쓰기
const value = useAtomValue(atom); // 읽기만
const setValue = useSetAtom(atom); // 쓰기만
```

## ⚡ 핵심 장점

### **자동 동기화**

```typescript
// searchTerm이 변경되면 자동으로 filteredProducts도 업데이트
const filteredProductsAtom = atom(get => {
  const products = get(productsAtom);
  const searchTerm = get(searchTermAtom); // 의존성
  return products.filter(p => p.name.includes(searchTerm));
});
```

### **Props Drilling 해결**

```typescript
// Before: props로 전달
<ProductList products={filteredProducts} />

// After: 직접 구독
const ProductList = () => {
  const filteredProducts = useAtomValue(filteredProductsAtom);
  return <div>{/* 렌더링 */}</div>;
};
```

## 💡 핵심 포인트

- **`get`**: "이 atom의 값을 읽어줘, 변경되면 나도 다시 계산할게"
- **`set`**: "이 atom의 값을 변경해줘, 구독하는 모든 컴포넌트를 업데이트해줘"
- **자동 의존성 관리**: React의 useEffect와 달리 수동으로 의존성 배열 관리 불필요
