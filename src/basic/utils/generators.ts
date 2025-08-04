// utils/generators.ts 생성
export const generateOrderNumber = (): string => {
  return `ORD-${Date.now()}`;
};