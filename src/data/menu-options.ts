export interface ToppingOption {
  id: string;
  name: string;
  emoji: string;
  price: number;
}

export const TOPPINGS: ToppingOption[] = [
  { id: 'boba', name: 'Boba', emoji: '🫧', price: 10000 },
  { id: 'jelly', name: 'Jelly', emoji: '🍮', price: 8000 },
  { id: 'cream', name: 'Cream', emoji: '🍦', price: 12000 },
  { id: 'shot', name: 'Extra Shot', emoji: '☕', price: 15000 },
  { id: 'pudding', name: 'Pudding', emoji: '🍑', price: 10000 },
];

export const SIZE_MAP = [
  { key: 'S', label: 'Small' },
  { key: 'M', label: 'Medium' },
  { key: 'L', label: 'Large' },
] as const;

export const SUGAR_LEVELS = [50, 70, 100] as const;
