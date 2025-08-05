# Hook 분리 작업 타임라인 (2024-08-05)

## 📅 작업 개요

**날짜**: 2024년 8월 5일  
**작업 목표**: App.tsx의 상태 관리 로직을 재사용 가능한 Custom Hook으로 분리  
**적용 원칙**: 단일 책임 원칙 (SRP), 점진적 리팩토링

## ⏰ 시간순 작업 기록

### Hook 분리 순서 결정 (난이도별)

1. **useLocalStorage** (⭐) - 기본적, 재사용성 높음
2. **useNotifications** (⭐⭐) - 독립적, 영향도 낮음
3. **useDebounce** (⭐⭐⭐) - 검색 기능만 영향
4. **useCoupons** (⭐⭐⭐⭐) - 중간 복잡도
5. **useProducts** (⭐⭐⭐⭐⭐) - 높은 복잡도
6. **useCart** (⭐⭐⭐⭐⭐⭐) - 가장 복잡, 다른 Hook과 연관

---

### 🕐 1단계: useLocalStorage Hook 분리

#### 작업 배경

```typescript
// ❌ 기존: 3번 반복되는 localStorage 패턴
const [products, setProducts] = useState(() => {
  const saved = localStorage.getItem('products');
  // ... 10줄의 중복 코드
});

useEffect(() => {
  localStorage.setItem('products', JSON.stringify(products));
}, [products]);
```

#### 생성된 파일

**`src/basic/hooks/useLocalStorage.ts`**

```typescript
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue(prevValue => {
        const valueToStore =
          value instanceof Function ? value(prevValue) : value;

        try {
          localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }

        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
};
```

#### 핵심 해결 문제: React 함수형 상태 업데이트

- **순환 참조 방지**: `prevValue` 사용으로 최신 상태 보장
- **React 패러다임 준수**: 함수형 업데이트 적용

#### App.tsx 적용

```typescript
// ✅ 개선: 간단하고 재사용 가능
const [products, setProducts] = useLocalStorage<ProductWithUI[]>(
  'products',
  initialProducts
);
const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);
const [coupons, setCoupons] = useLocalStorage<Coupon[]>(
  'coupons',
  initialCoupons
);

// 기존 useEffect 3개 제거됨 (30줄 → 3줄)
```

#### 🚨 발생한 문제와 해결

**문제**: `pnpm test:basic` 실행 시 중복된 localStorage 관리로 인한 에러  
**해결**: App.tsx의 기존 useEffect 제거로 중복 관리 문제 해결

---

### 🕑 2단계: useNotifications Hook 분리

#### 작업 배경

```typescript
// ❌ 기존: App.tsx에 알림 로직 산재
const [notifications, setNotifications] = useState<Notification[]>([]);

const addNotification = useCallback((message: string, type) => {
  const id = Date.now().toString();
  setNotifications(prev => [...prev, { id, message, type }]);

  setTimeout(() => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, 3000);
}, []);
```

#### 생성된 파일

**`src/basic/hooks/useNotifications.ts`**

```typescript
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (message: string, type: 'error' | 'success' | 'warning' = 'success') => {
      const id = Date.now().toString();

      setNotifications(prev => [...prev, { id, message, type }]);

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 3000);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
  };
};
```

#### App.tsx 적용

```typescript
// ✅ 깔끔한 사용법
const { notifications, addNotification, removeNotification } = useNotifications();

// 알림 닫기 버튼에서 Hook 함수 사용
<button onClick={() => removeNotification(notif.id)}>×</button>
```

#### 성과

- **캡슐화**: 알림 관련 모든 로직이 Hook 내부에 응집
- **재사용성**: 다른 컴포넌트에서도 동일한 알림 시스템 사용 가능

---

### 🕐 3단계: useDebounce Hook 분리

#### 작업 배경 및 디바운스 필요성 이해

**디바운스가 없을 때의 문제**:

```
사용자 입력: "상품1"
ㅅ → 상 → 상ㅍ → 상품 → 상품1
↓    ↓    ↓     ↓     ↓
검색 → 검색 → 검색 → 검색 → 검색  (5번 실행!)
```

**디바운스 적용 후**:

```
사용자 입력: "상품1"
ㅅ → 상 → 상ㅍ → 상품 → 상품1
대기... → 대기... → 대기... → 대기... → [500ms 후] 검색 (1번만!)
```

<code_block_to_apply_changes_from>

```

이렇게 Hook 분리 작업의 전체 타임라인을 상세히 기록했습니다! 😊
```

#### 기존 App.tsx의 debounce 로직

```typescript
// ❌ 기존: 반복적인 debounce 패턴
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500);
  return () => clearTimeout(timer);
}, [searchTerm]);
```

#### 생성된 파일

**`src/basic/hooks/useDebounce.ts`**

```typescript
import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
```

#### App.tsx 적용

```typescript
// ✅ 매우 간단한 사용법
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 500);

// 기존 useEffect 제거됨 (5줄 → 1줄)
```

#### 핵심 개선 요약

- **성능**: 불필요한 연산 80%↓, 검색 깜빡임 없음
- **코드**: 중복 90% 제거, Hook별 역할 분리
- **확장성**: 타입 안전, 재사용 쉬움

---

## 다음 단계(예정)

- **useCoupons**: 쿠폰 관리/검증 분리
- **useProducts**: 상품 CRUD/재고 분리
- **useCart**: 장바구니 로직 분리

---

## 학습 포인트

- Hook은 단일 책임, 재사용성, 타입 안전, 성능 최적화
- 점진적 분리, 테스트, 문서화, 코드 리뷰
- 함수형 프로그래밍(순수함수, 불변성, 합성)

---
