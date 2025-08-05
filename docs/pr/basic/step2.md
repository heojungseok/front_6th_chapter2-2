# Step 2: useLocalStorage Hook 분리

## 🎯 목표

localStorage 관리 로직을 재사용 가능한 Hook으로 분리하고 React 함수형 상태 업데이트 이해하기

## 📝 작업 내용

### Before: 중복된 localStorage 패턴

```typescript
// ❌ 3번 반복되는 코드
const [products, setProducts] = useState(() => {
  const saved = localStorage.getItem('products');
  // ... 10줄의 중복 코드
});

useEffect(() => {
  localStorage.setItem('products', JSON.stringify(products));
}, [products]);
```

### After: useLocalStorage Hook

```typescript
// ✅ 간단하고 재사용 가능
const [products, setProducts] = useLocalStorage<ProductWithUI[]>(
  'products',
  initialProducts
);
```

## 🚨 핵심 문제: React 함수형 상태 업데이트

### 잘못된 방식 (순환 참조)

```typescript
// ❌ 문제: 오래된 값 참조 가능
const setValue = value => {
  const result = value(storedValue); // storedValue는 오래된 값일 수 있음
  setStoredValue(result);
};
```

### 올바른 방식

```typescript
// ✅ 해결: React가 최신값을 prevValue로 제공
const setValue = value => {
  setStoredValue(prevValue => {
    // React: "최신값을 prevValue로 줄게!"
    const result = value(prevValue); // 항상 최신값 사용
    return result;
  });
};
```

## 💡 핵심 개념: prevValue

### prevValue는 어디서 오는가?

```typescript
setStoredValue(prevValue => {
  // React가 자동으로 현재 상태의 최신값을 prevValue에 담아서 제공
  console.log(prevValue); // React가 준 최신값
  return newValue;
});
```

### 은행 비유

- **직접 방식**: "잔액을 100만원으로 설정해줘"
- **함수 방식**: "현재 잔액에서 10만원 더해줘" → 은행이 현재 잔액을 확인 후 계산

## 🎯 핵심 교훈

**"내가 아는 값" 대신 "React가 알려주는 최신값(prevValue)"을 사용!**
