# 1단계: 순수함수 분리 완료 요약 (2024-08-04)

## 🎯 완료된 작업

### 1. 계산 함수 분리

- **파일**: `src/basic/utils/calculators.ts` 생성
- **분리된 함수들**:
  - `calculateItemTotal`: 장바구니 아이템 총액 계산
  - `getMaxApplicableDiscount`: 최대 적용 가능한 할인율 계산
  - `calculateCartTotal`: 장바구니 전체 총액 계산
  - `getRemainingStock`: 상품별 남은 재고 계산

### 2. 포맷팅 함수 분리

- **파일**: `src/basic/utils/formatters.ts` 생성
- **분리된 함수들**:
  - `formatPrice`: 가격 포맷팅 (관리자/일반 사용자 구분, 품절 표시)

### 3. App.tsx 수정

- **Import 구문 추가**: 분리된 함수들 import
- **함수 호출 수정**: 매개변수 전달 방식으로 변경
- **기존 함수 제거**: App.tsx 내부의 중복 함수들 삭제

## �� 순수함수의 개념

### 순수함수란?

- **동일한 입력에 대해 항상 동일한 출력**을 반환하는 함수
- **부수 효과(side effect)가 없음** (외부 상태 변경, API 호출 등)
- **외부 상태에 의존하지 않음**

### 예시

```typescript
// ✅ 순수함수
const add = (a: number, b: number): number => a + b;

// ❌ 순수함수가 아님
const getCurrentTime = (): string => new Date().toISOString(); // 매번 다른 결과
const updateGlobalState = (value: number) => (globalState = value); // 부수 효과
```

## �� 현재 단계가 필요한 이유

### 1. **안전성 (Safety First)**

```typescript
// 분리 전: App.tsx 내부에 혼재
const calculateItemTotal = (item: CartItem): number => {
  // cart, selectedCoupon 등 외부 상태에 의존
  // UI 로직과 비즈니스 로직이 섞여있음
};

// 분리 후: utils/calculators.ts
export const calculateItemTotal = (
  item: CartItem,
  cart: CartItem[]
): number => {
  // 순수 함수: 입력값만으로 결과 결정
  // 테스트하기 쉬움
};
```

**왜 안전한가?**

- 기존 기능을 건드리지 않고 분리 가능
- 입력값과 출력값이 명확함
- 실수로 인한 버그 발생 가능성 낮음

### 2. **테스트 가능성 (Testability)**

```typescript
// 순수함수는 테스트하기 매우 쉬움
describe('calculateItemTotal', () => {
  it('should calculate total with discount', () => {
    const item = { product: { price: 1000, discounts: [] }, quantity: 2 };
    const cart = [];

    const result = calculateItemTotal(item, cart);
    expect(result).toBe(2000);
  });
});
```

**장점:**

- 단위 테스트 작성 용이
- 예상 결과를 쉽게 검증
- 리팩토링 시 안전장치 역할

### 3. **재사용성 (Reusability)**

```typescript
// 다른 컴포넌트에서도 쉽게 사용 가능
import { calculateItemTotal } from './utils/calculators';

// ProductCard에서 사용
const ProductCard = ({ item }) => {
  const total = calculateItemTotal(item, cart);
  return <div>{total}원</div>;
};

// CartSummary에서 사용
const CartSummary = ({ items }) => {
  const total = items.reduce((sum, item) => sum + calculateItemTotal(item, cart), 0);
  return <div>총 {total}원</div>;
};
```

### 4. **의존성 분리 (Dependency Separation)**

```typescript
// 분리 전: App.tsx의 복잡한 의존성
const App = () => {
  const [cart, setCart] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [products, setProducts] = useState([]);
  // ... 20개 이상의 상태들

  const calculateItemTotal = item => {
    // cart, selectedCoupon, products 등에 의존
  };
};

// 분리 후: 명확한 의존성
export const calculateItemTotal = (
  item: CartItem,
  cart: CartItem[]
): number => {
  // 필요한 데이터만 매개변수로 받음
  // 외부 상태에 의존하지 않음
};
```

## 📊 작업 통계

- **생성된 파일**: 2개
  - `utils/calculators.ts` (74줄)
  - `utils/formatters.ts` (15줄)
- **수정된 파일**: 1개 (`App.tsx`)
- **분리된 함수**: 4개
- **해결된 에러**: 5개
- **테스트 통과**: ✅

## �� 해결된 문제들

### 1. 타입 에러

- **문제**: `utils/calculators.ts`에서 `CartItem`, `Coupon` 타입을 찾을 수 없음
- **해결**: `import { CartItem, Coupon } from '../../types';` 추가

### 2. 매개변수 누락

- **문제**: `calculateCartTotal()` 함수 호출 시 매개변수 전달 안됨
- **해결**: `calculateCartTotal(cart, selectedCoupon || null)` 형태로 수정

### 3. 함수 의존성 문제

- **문제**: `getMaxApplicableDiscount`에서 `cart` 변수 참조 불가
- **해결**: `cart`를 매개변수로 전달하도록 수정

### 4. 테스트 에러

- **문제**: `pnpm test:basic` 실행 시 `cart is not defined` 에러
- **해결**: 모든 계산 함수에 필요한 매개변수들을 전달하도록 수정

## �� 다음 단계 준비

### 2단계: Hook 분리 (다음 단계)

- **목적**: 상태 관리 로직 분리
- **위험도**: 중간 (상태 변경 시 영향)
- **기반**: 1단계에서 분리한 순수 함수들 활용

### 3단계: 컴포넌트 분리 (최종 단계)

- **목적**: UI 컴포넌트 분리
- **위험도**: 높음 (렌더링 로직 변경)
- **기반**: 1-2단계에서 분리한 함수들과 Hook들 활용

## �� 학습한 내용

1. **순수 함수의 중요성**: 테스트 가능성과 재사용성 향상
2. **타입 안정성**: TypeScript를 통한 런타임 에러 방지
3. **단일 책임 원칙**: 각 함수가 하나의 책임만 가지도록 설계
4. **점진적 리팩토링**: 작은 단위로 나누어 안전하게 진행

## �� 결론

순수 함수 분리는 **"기초 공사"**와 같습니다:

- **쉽지만 필수적**: 건물을 지을 때 기초가 튼튼해야 함
- **안전한 시작점**: 이후 모든 리팩토링의 기반
- **장기적 이익**: 코드 품질과 유지보수성 향상

1단계가 성공적으로 완료되어 2단계 Hook 분리로 진행할 준비가 되었습니다.

## �� 관련 문서

- [Basic 과제 요구사항](../pr/basic-requirements.md)
- [리팩토링 계획](../work-plan.md)
- [작업 타임라인](./work-timeline-250804.md)
- [순수함수 중요성](./step1-pure-functions-importance.md)
