export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  coverUrl?: string;
  wallpaper?: string;
  scriptUrl?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  date: string;
  note: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  period: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string;
  icon: string;
  color: string;
}

export interface Note {
  id: string;
  userId: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

export interface AppData {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  notes: Note[];
}
