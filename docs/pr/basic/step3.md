# �� Basic 과제 컴포넌트 분리 전략: 하이브리드 접근법

## �� 전략 개요

**의존성 + 재사용성 + 도메인 경계**를 종합적으로 고려한 단계별 컴포넌트 분리 전략

## �� 핵심 원칙

1. **의존성 최소화**: 다른 컴포넌트에 의존하지 않는 것부터 분리
2. **재사용성 극대화**: 여러 곳에서 사용되는 컴포넌트 우선 분리
3. **도메인 경계 명확화**: 비즈니스 도메인별로 그룹화
4. **점진적 안전성**: 각 단계마다 테스트 통과 보장

## �� 현재 App.tsx 분석

### 사용 빈도 분석

```typescript
Button: 15회 사용 (가장 높은 재사용성)
Input: 8회 사용
ProductCard: 3회 사용 (반복문 내부)
CartItem: 3회 사용 (반복문 내부)
Notification: 2회 사용
```

### 복잡도 분석

```typescript
ProductCard: 높음 (할인 계산, 재고 체크, 추천 표시)
CartItem: 높음 (수량 조절, 할인 표시, 총액 계산)
CouponSection: 중간 (쿠폰 적용 로직, 검증)
Button/Input: 낮음 (순수 UI)
```

## 🚀 Phase별 분리 계획

### Phase 1: 기반 UI 컴포넌트 (의존성 없음) ⭐⭐

**목표**: 재사용성 높은 기본 UI 컴포넌트 분리

#### 1.1 Button 컴포넌트

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

#### 1.2 Input 컴포넌트

```typescript
// components/ui/Input.tsx
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  disabled?: boolean;
  className?: string;
}
```

#### 1.3 Notification 컴포넌트

```typescript
// components/ui/Notification.tsx
interface NotificationProps {
  message: string;
  type: 'error' | 'success' | 'warning';
  onClose: () => void;
}
```

**완료 기준**:

- ✅ 의존성 없는 순수 UI 컴포넌트
- ✅ 재사용 가능한 인터페이스
- ✅ 테스트 통과

---

### Phase 2: 도메인별 엔티티 컴포넌트 ⭐⭐⭐

**목표**: 복잡한 비즈니스 로직을 가진 엔티티 컴포넌트 분리

#### 2.1 Product 도메인

```typescript
// components/product/ProductCard.tsx
interface ProductCardProps {
  product: ProductWithUI;
  onAddToCart: (product: ProductWithUI) => void;
  getRemainingStock: (product: ProductWithUI) => number;
  formatPrice: (price: number, productId?: string) => string;
}
```

#### 2.2 Cart 도메인

```typescript
// components/cart/CartItem.tsx
interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  calculateItemTotal: (item: CartItem) => number;
}
```

#### 2.3 Coupon 도메인

```typescript
// components/coupon/CouponItem.tsx
interface CouponItemProps {
  coupon: Coupon;
  isSelected: boolean;
  onSelect: (coupon: Coupon) => void;
  onDelete: (couponCode: string) => void;
}
```

**완료 기준**:

- ✅ 도메인 경계 명확화
- ✅ 복잡한 비즈니스 로직 캡슐화
- ✅ Phase 1 UI 컴포넌트 활용

---

### Phase 3: 도메인별 섹션 컴포넌트 ⭐⭐⭐⭐

**목표**: 엔티티 컴포넌트들을 조합한 섹션 컴포넌트 분리

#### 3.1 Product 도메인

```typescript
// components/product/ProductList.tsx
interface ProductListProps {
  products: ProductWithUI[];
  onAddToCart: (product: ProductWithUI) => void;
  getRemainingStock: (product: ProductWithUI) => number;
  formatPrice: (price: number, productId?: string) => string;
}
```

#### 3.2 Cart 도메인

```typescript
// components/cart/CartSidebar.tsx
interface CartSidebarProps {
  cart: CartItem[];
  selectedCoupon: Coupon | null;
  coupons: Coupon[];
  totals: CartTotals;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onApplyCoupon: (coupon: Coupon) => void;
  onCompleteOrder: () => void;
}
```

#### 3.3 Coupon 도메인

```typescript
// components/coupon/CouponSection.tsx
interface CouponSectionProps {
  coupons: Coupon[];
  selectedCoupon: Coupon | null;
  onSelectCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (couponCode: string) => void;
  onAddCoupon: (coupon: Coupon) => void;
}
```

**완료 기준**:

- ✅ Phase 2 엔티티 컴포넌트 조합
- ✅ 도메인별 책임 분리
- ✅ 재사용 가능한 섹션 컴포넌트

---

### Phase 4: 페이지 컴포넌트 ⭐⭐⭐⭐⭐

**목표**: 최종 페이지 단위 컴포넌트 분리

#### 4.1 ShoppingPage

```typescript
// components/pages/ShoppingPage.tsx
export const ShoppingPage = () => {
  // 모든 쇼핑 관련 Hook과 로직
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <ProductList {...productListProps} />
      </div>
      <div className="lg:col-span-1">
        <CartSidebar {...cartSidebarProps} />
      </div>
    </div>
  );
};
```

#### 4.2 AdminPage

```typescript
// components/pages/AdminPage.tsx
export const AdminPage = () => {
  // 모든 관리자 관련 Hook과 로직
  return (
    <div className="space-y-6">
      <ProductManagement {...productManagementProps} />
      <CouponManagement {...couponManagementProps} />
    </div>
  );
};
```

**완료 기준**:

- ✅ Phase 3 섹션 컴포넌트 조합
- ✅ 페이지별 책임 분리
- ✅ App.tsx의 완전한 분리

---

## 📁 최종 파일 구조

src/basic/
├── components/
│ ├── ui/
│ │ ├── Button.tsx # Phase 1
│ │ ├── Input.tsx # Phase 1
│ │ └── Notification.tsx # Phase 1
│ ├── product/
│ │ ├── ProductCard.tsx # Phase 2
│ │ └── ProductList.tsx # Phase 3
│ ├── cart/
│ │ ├── CartItem.tsx # Phase 2
│ │ └── CartSidebar.tsx # Phase 3
│ ├── coupon/
│ │ ├── CouponItem.tsx # Phase 2
│ │ └── CouponSection.tsx # Phase 3
│ └── pages/
│ ├── ShoppingPage.tsx # Phase 4
│ └── AdminPage.tsx # Phase 4
├── hooks/ # ✅ 완료
├── utils/ # ✅ 완료
├── services/ # ✅ 완료
└── App.tsx # 최종 정리

## 🔄 개발 워크플로우

### 각 Phase별 체크리스트

#### Phase 1 체크리스트

- [ ] Button 컴포넌트 생성 및 테스트
- [ ] Input 컴포넌트 생성 및 테스트
- [ ] Notification 컴포넌트 생성 및 테스트
- [ ] App.tsx에서 기존 버튼/입력/알림을 새 컴포넌트로 교체
- [ ] 전체 테스트 통과 확인

#### Phase 2 체크리스트

- [ ] ProductCard 컴포넌트 생성 및 테스트
- [ ] CartItem 컴포넌트 생성 및 테스트
- [ ] CouponItem 컴포넌트 생성 및 테스트
- [ ] App.tsx에서 기존 엔티티 렌더링을 새 컴포넌트로 교체
- [ ] 전체 테스트 통과 확인

#### Phase 3 체크리스트

- [ ] ProductList 컴포넌트 생성 및 테스트
- [ ] CartSidebar 컴포넌트 생성 및 테스트
- [ ] CouponSection 컴포넌트 생성 및 테스트
- [ ] App.tsx에서 기존 섹션을 새 컴포넌트로 교체
- [ ] 전체 테스트 통과 확인

#### Phase 4 체크리스트

- [ ] ShoppingPage 컴포넌트 생성 및 테스트
- [ ] AdminPage 컴포넌트 생성 및 테스트
- [ ] App.tsx를 페이지 컴포넌트 조합으로 단순화
- [ ] 전체 테스트 통과 확인

## �� 성공 지표

### 코드 품질

- **단일 책임 원칙**: 각 컴포넌트가 하나의 책임만
- **재사용성**: UI 컴포넌트의 80% 이상 재사용 가능
- **테스트 커버리지**: 모든 컴포넌트 단위 테스트 통과

### 유지보수성

- **의존성 최소화**: 컴포넌트 간 결합도 낮음
- **도메인 경계**: 비즈니스 로직이 도메인별로 분리
- **확장성**: 새로운 기능 추가 시 기존 코드 영향 최소화

### 개발 효율성

- **개발 속도**: 컴포넌트 재사용으로 개발 시간 단축
- **버그 격리**: 컴포넌트별 독립적 테스트로 버그 조기 발견
- **협업 효율**: 도메인별로 개발자 역할 분담 가능

## 🚀 시작하기

**Phase 1부터 시작하시겠습니까?**

1. **Button 컴포넌트** 생성
2. **Input 컴포넌트** 생성
3. **Notification 컴포넌트** 생성
4. App.tsx에서 기존 UI 요소들을 새 컴포넌트로 교체
