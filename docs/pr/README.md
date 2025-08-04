# Chapter 2-2. 디자인패턴과 함수형프로그래밍

## 개요

이 폴더는 Chapter 2-2 과제의 요구사항과 가이드라인을 정리한 문서들입니다.

## 과제 구조

### 📁 Basic 과제

- **목적**: 거대 단일 컴포넌트 리팩토링
- **핵심**: 단일 책임 원칙(SRP) 적용
- **상태관리**: useState, useEffect만 사용 (라이브러리 사용 금지)
- **문서**: [basic-requirements.md](./basic-requirements.md)

### 📁 Advanced 과제

- **목적**: Props drilling 제거
- **핵심**: 전역 상태 관리 (Context 또는 Jotai)
- **기반**: Basic 과제의 컴포넌트 분리 결과물
- **문서**: [advanced-requirements.md](./advanced-requirements.md)

## 핵심 학습 목표

### 1. 계층 분리 이해

- **엔티티 계층**: cart, product 등 비즈니스 데이터
- **UI 계층**: Button, Modal 등 재사용 가능한 컴포넌트
- **상태 계층**: 엔티티 상태 vs UI 상태 구분
- **함수 계층**: 엔티티 함수 vs 유틸리티 함수 구분

### 2. 책임 분리 원칙

- **단일 책임 원칙(SRP)**: 각 컴포넌트/함수는 하나의 책임만
- **관심사 분리**: UI, 비즈니스 로직, 데이터 관리 분리
- **재사용성**: 독립적인 컴포넌트 설계

### 3. 상태 관리 패턴

- **Basic**: 로컬 상태 관리 (useState, useEffect)
- **Advanced**: 전역 상태 관리 (Context, Jotai)

## 개발 가이드

### 시작하기

1. **Basic 과제**부터 시작하여 컴포넌트 분리 연습
2. **Advanced 과제**에서 전역 상태 관리 적용
3. 각 단계별로 테스트 코드 통과 확인

### 코드 품질 기준

- ✅ 단일 책임 원칙 준수
- ✅ 컴포넌트 재사용성 고려
- ✅ 코드 가독성 및 유지보수성
- ✅ 테스트 코드 통과
- ✅ Props drilling 최소화 (Advanced)

### 파일 구조

```
docs/pr/
├── README.md                    # 이 파일
├── basic-requirements.md        # Basic 과제 요구사항
└── advanced-requirements.md     # Advanced 과제 요구사항
```

## 참고 자료

- React 공식 문서: [Context API](https://react.dev/reference/react/createContext)
- Jotai 공식 문서: [Jotai](https://jotai.org/)
- 단일 책임 원칙: [SOLID Principles](https://en.wikipedia.org/wiki/Single-responsibility_principle)
