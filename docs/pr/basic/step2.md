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
