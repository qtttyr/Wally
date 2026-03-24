import { create } from 'zustand';
import type { Expense, ExpenseCreate } from '../types/expense';
import { expenseService } from '../services/expenseService';

interface ExpensesState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: ExpenseCreate) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useExpensesStore = create<ExpensesState>((set) => ({
  expenses: [],
  isLoading: false,
  error: null,
  
  fetchExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await expenseService.getAllExpenses();
      set({ expenses, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch expenses';
      console.error('fetchExpenses error:', error);
      set({ error: message, isLoading: false, expenses: [] });
    }
  },
  
  addExpense: async (expenseData: ExpenseCreate) => {
    set({ isLoading: true, error: null });
    try {
      const newExpense = await expenseService.createExpense(expenseData);
      set((state) => ({ 
        expenses: [newExpense, ...state.expenses],
        isLoading: false 
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add expense';
      console.error('addExpense error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  
  updateExpense: async (id: string, updates: Partial<Expense>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await expenseService.updateExpense(id, updates);
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? updated : e)),
        isLoading: false
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update expense';
      console.error('updateExpense error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  
  deleteExpense: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await expenseService.deleteExpense(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        isLoading: false
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete expense';
      console.error('deleteExpense error:', error);
      set({ error: message, isLoading: false });
      throw error;
    }
  },
  
  clearError: () => set({ error: null }),
}));
