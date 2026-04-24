import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatInputNumber(value: string) {
  const numericValue = value.replace(/\D/g, "");
  if (!numericValue) return "";
  return new Intl.NumberFormat('id-ID').format(Number(numericValue));
}

export function parseInputNumber(value: string) {
  return value.replace(/\D/g, "");
}
