# Basic 과제 리팩토링 작업 타임라인 (2024-08-04)

## �� 작업 개요

단일책임원칙을 위반한 거대한 컴포넌트(`src/basic/App.tsx`)를 단계별로 리팩토링하는 작업을 진행했습니다.

## 🕐 작업 타임라인

### 1단계: 계산 함수 분리 (순수 함수 리팩토링)

#### �� 작업 내용

- **파일 생성**: `src/basic/utils/calculators.ts`
- **분리된 순수 함수들**:
  - `calculateItemTotal`: 장바구니 아이템 총액 계산
  - `getMaxApplicableDiscount`: 최대 적용 가능한 할인율 계산
  - `calculateCartTotal`: 장바구니 전체 총액 계산

#### �� 수정 사항

**1. utils/calculators.ts 파일 생성**

```typescript
import { CartItem, Coupon } from '../../types';

export const calculateItemTotal = (
  item: CartItem,
  cart: CartItem[]
): number => {
  const { price } = item.product;
  const { quantity } = item;
  const discount = getMaxApplicableDiscount(item, cart);
  return Math.round(price * quantity * (1 - discount));
};

export const getMaxApplicableDiscount = (
  item: CartItem,
  cart: CartItem[]
): number => {
  const { discounts } = item.product;
  const { quantity } = item;

  const baseDiscount = discounts.reduce(
    (maxDiscount: number, discount: any) => {
      return quantity >= discount.quantity && discount.rate > maxDiscount
        ? discount.rate
        : maxDiscount;
    },
    0
  );

  const hasBulkPurchase = cart.some(cartItem => cartItem.quantity >= 10);
  if (hasBulkPurchase) {
    return Math.min(baseDiscount + 0.05, 0.5);
  }

  return baseDiscount;
};

export const calculateCartTotal = (
  cart: CartItem[],
  selectedCoupon: Coupon | null
): {
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
} => {
  let totalBeforeDiscount = 0;
  let totalAfterDiscount = 0;

  cart.forEach(item => {
    const itemPrice = item.product.price * item.quantity;
    totalBeforeDiscount += itemPrice;
    totalAfterDiscount += calculateItemTotal(item, cart);
  });

  if (selectedCoupon) {
    if (selectedCoupon.discountType === 'amount') {
      totalAfterDiscount = Math.max(
        0,
        totalAfterDiscount - selectedCoupon.discountValue
      );
    } else {
      totalAfterDiscount = Math.round(
        totalAfterDiscount * (1 - selectedCoupon.discountValue / 100)
      );
    }
  }

  return {
    totalBeforeDiscount: Math.round(totalBeforeDiscount),
    totalAfterDiscount: Math.round(totalAfterDiscount),
  };
};
```

**2. App.tsx 수정 사항**

**Import 구문 추가** (3-7번째 줄):

```typescript
import {
  calculateCartTotal,
  calculateItemTotal,
  getMaxApplicableDiscount,
} from './utils/calculators';
```

**함수 호출 부분 수정**:

- 402번째 줄: `const totals = calculateCartTotal(cart, selectedCoupon || null);`
- 1274번째 줄: `const itemTotal = calculateItemTotal(item, cart);`

**기존 함수들 제거**:

- App.tsx 내부의 `calculateItemTotal`, `getMaxApplicableDiscount`, `calculateCartTotal` 함수들 삭제

#### �� 발생한 문제들과 해결 과정

**1. 타입 에러**

- **문제**: `utils/calculators.ts`에서 `CartItem`, `Coupon` 타입을 찾을 수 없음
- **해결**: `import { CartItem, Coupon } from '../../types';` 추가

**2. 매개변수 누락**

- **문제**: `calculateCartTotal()` 함수 호출 시 매개변수 전달 안됨
- **해결**: `calculateCartTotal(cart, selectedCoupon || null)` 형태로 수정

**3. 함수 의존성 문제**

- **문제**: `getMaxApplicableDiscount`에서 `cart` 변수 참조 불가
- **해결**: `cart`를 매개변수로 전달하도록 수정

**4. 테스트 에러**

- **문제**: `pnpm test:basic` 실행 시 `cart is not defined` 에러
- **해결**: 모든 계산 함수에 필요한 매개변수들을 전달하도록 수정

#### ✅ 최종 결과

- **순수 함수 분리 완료**: 3개의 계산 함수를 별도 파일로 분리
- **타입 안정성 확보**: TypeScript 타입 에러 해결
- **테스트 통과**: `pnpm test:basic` 실행 시 에러 없음
- **단일 책임 원칙 적용**: 계산 로직과 UI 로직 분리

## �� 다음 단계 계획

### 2단계: 유틸리티 함수 분리 (예정)

- `formatPrice` 함수 → `utils/formatters.ts`
- `getRemainingStock` 함수 → `utils/calculators.ts`
- 검색 필터링 로직 → `utils/calculators.ts`

### 3단계: useLocalStorage Hook 분리 (예정)

- 로컬 스토리지 관리 로직을 재사용 가능한 Hook으로 분리

### 4단계: 엔티티별 Hook 분리 (예정)

- `useCart`, `useProducts`, `useCoupons` Hook 분리

## 📊 작업 통계

- **생성된 파일**: 1개 (`utils/calculators.ts`)
- **수정된 파일**: 1개 (`App.tsx`)
- **분리된 함수**: 3개
- **해결된 에러**: 4개
- **소요 시간**: 약 2시간

## �� 학습한 내용

1. **순수 함수의 중요성**: 테스트 가능성과 재사용성 향상
2. **타입 안정성**: TypeScript를 통한 런타임 에러 방지
3. **단일 책임 원칙**: 각 함수가 하나의 책임만 가지도록 설계
4. **점진적 리팩토링**: 작은 단위로 나누어 안전하게 진행

## �� 관련 문서

- [Basic 과제 요구사항](../pr/basic-requirements.md)
- [리팩토링 계획](../work-plan.md)
