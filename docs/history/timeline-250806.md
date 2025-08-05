---

### �� 8단계: UI 컴포넌트 분리 작업 계획 수립

#### 작업 배경
Hook 분리 작업이 완료된 후, App.tsx의 거대한 JSX를 재사용 가능한 컴포넌트로 분리하여 완전한 관심사 분리 달성 필요

#### 현재 상황 분석
- **App.tsx**: 1,161줄의 거대한 컴포넌트
- **Hook 분리**: 완료 (9개 Hook)
- **다음 단계**: UI 컴포넌트 분리로 관심사 분리 완성

#### 단계별 작업 계획 (난이도별)

**1단계: 기본 UI 컴포넌트 분리** (2-3시간) ⭐⭐⭐

**목표**: 재사용 가능한 기본 UI 요소들을 분리하여 중복 제거

**분리할 컴포넌트들**:
1. **Notification 컴포넌트** (`components/ui/Notification.tsx`)
   - 알림 메시지 표시
   - 타입별 색상 처리 (error, success, warning)
   - 닫기 버튼 기능

2. **Button 컴포넌트** (`components/ui/Button.tsx`)
   - 재사용 가능한 버튼 컴포넌트
   - variant 지원 (primary, secondary, danger)
   - disabled 상태 처리

3. **Header 컴포넌트** (`components/ui/Header.tsx`)
   - 검색창, 관리자 버튼, 장바구니 아이콘
   - 관리자/고객 모드 전환

**예상 파일 구조**:
src/basic/components/ui/
├── Notification.tsx
├── Button.tsx
└── Header.tsx

**2단계: 도메인 컴포넌트 분리** (4-6시간) ⭐⭐⭐⭐

**목표**: 비즈니스 로직을 가진 도메인별 컴포넌트 분리

**분리할 컴포넌트들**:
1. **ProductCard 컴포넌트** (`components/ProductCard.tsx`)
   - 상품 정보 표시
   - 할인 계산 및 표시
   - 재고 상태 관리
   - 장바구니 추가 기능

2. **CartItem 컴포넌트** (`components/CartItem.tsx`)
   - 장바구니 아이템 표시
   - 수량 변경 기능
   - 할인율 표시
   - 아이템 제거 기능

3. **ProductForm 컴포넌트** (`components/ProductForm.tsx`)
   - 상품 추가/수정 폼
   - 폼 검증 로직
   - 편집 모드 관리

4. **CouponForm 컴포넌트** (`components/CouponForm.tsx`)
   - 쿠폰 추가 폼
   - 폼 초기화 기능

**예상 파일 구조**:
src/basic/components/
├── ProductCard.tsx
├── CartItem.tsx
├── ProductForm.tsx
└── CouponForm.tsx


**3단계: 페이지 컴포넌트 분리** (3-4시간) ⭐⭐⭐⭐⭐

**목표**: 큰 단위의 페이지 컴포넌트 분리

**분리할 컴포넌트들**:
1. **AdminPage 컴포넌트** (`components/pages/AdminPage.tsx`)
   - 관리자 대시보드 전체
   - 상품/쿠폰 관리 탭
   - 관리자 전용 기능들

2. **ShoppingPage 컴포넌트** (`components/pages/ShoppingPage.tsx`)
   - 쇼핑몰 메인 페이지
   - 상품 목록 표시
   - 검색 기능

3. **CartSidebar 컴포넌트** (`components/CartSidebar.tsx`)
   - 장바구니 사이드바
   - 쿠폰 선택 기능
   - 총액 계산 및 표시
   - 주문 완료 기능

**예상 파일 구조**:
src/basic/components/
├── pages/
│ ├── AdminPage.tsx
│ └── ShoppingPage.tsx
└── CartSidebar.tsx


**4단계: 통합 및 최적화** (2-3시간) ⭐⭐⭐⭐

**목표**: 컴포넌트 연결 및 성능 최적화

**작업 내용**:
1. **App.tsx 리팩토링**
   - 모든 컴포넌트 통합
   - Props 인터페이스 최적화
   - 이벤트 핸들러 연결

2. **성능 최적화**
   - React.memo 적용
   - 불필요한 리렌더링 방지
   - Props 최적화

3. **테스트 및 검증**
   - 각 컴포넌트별 테스트
   - 통합 테스트
   - 기존 기능 동작 확인

#### 예상 소요 시간 및 난이도

| 단계 | 난이도 | 예상 시간 | 주요 작업 |
|------|--------|-----------|-----------|
| 1단계 | ⭐⭐⭐ | 2-3시간 | 기본 UI 컴포넌트 분리 |
| 2단계 | ⭐⭐⭐⭐ | 4-6시간 | 도메인 컴포넌트 분리 |
| 3단계 | ⭐⭐⭐⭐⭐ | 3-4시간 | 페이지 컴포넌트 분리 |
| 4단계 | ⭐⭐⭐⭐ | 2-3시간 | 통합 및 최적화 |

**총 예상 시간**: **11-16시간** (1.5-2일)

#### 최종 목표

**Before (현재)**:
```typescript
// App.tsx: 1,161줄의 거대한 컴포넌트
const App = () => {
  // 모든 Hook들...
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1,000줄 이상의 JSX */}
    </div>
  );
};
```

**After (목표)**:
```typescript
// App.tsx: 50줄 이하의 깔끔한 컨테이너
const App = () => {
  // Hook들 사용
  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationList notifications={notifications} />
      <Header {...headerProps} />
      <main>
        {isAdmin ? <AdminPage {...adminProps} /> : <ShoppingPage {...shoppingProps} />}
      </main>
    </div>
  );
};
```

#### 최종 파일 구조
src/basic/
├── components/
│ ├── ui/
│ │ ├── Button.tsx
│ │ ├── Notification.tsx
│ │ └── Header.tsx
│ ├── ProductCard.tsx
│ ├── CartItem.tsx
│ ├── ProductForm.tsx
│ ├── CouponForm.tsx
│ ├── CartSidebar.tsx
│ └── pages/
│ ├── AdminPage.tsx
│ └── ShoppingPage.tsx
├── hooks/ (완료: 9개 Hook)
├── services/ (완료)
├── utils/ (완료)
└── App.tsx (리팩토링됨)

#### 핵심 성과 예상

1. **완전한 관심사 분리**: App.tsx가 순수한 컨테이너 컴포넌트로 변환
2. **재사용성**: 모든 컴포넌트가 독립적으로 재사용 가능
3. **테스트 용이성**: 각 컴포넌트별 독립적 테스트 가능
4. **유지보수성**: 코드 구조가 명확하고 확장 가능
5. **성능 최적화**: 불필요한 리렌더링 방지
6. **개발 생산성**: 컴포넌트별 독립적 개발 가능

#### 예상 도전 과제

1. **Props 인터페이스 설계**: 각 컴포넌트에 필요한 props 정의
2. **이벤트 핸들러 연결**: App.tsx에서 각 컴포넌트로 함수 전달
3. **스타일링 유지**: Tailwind 클래스들을 그대로 옮기기
4. **테스트 수정**: 컴포넌트 분리로 인한 테스트 셀렉터 변경
5. **성능 최적화**: 불필요한 리렌더링 방지