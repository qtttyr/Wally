import { supabase } from '../lib/supabase';
import type { Expense, ExpenseCreate } from '../types/expense';
import type { User } from '@supabase/supabase-js';

class ExpenseService {
  private async getUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
  }

  async getRecentExpenses(): Promise<Expense[]> {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent expenses:', error);
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }

    return (data ?? []) as Expense[];
  }

  async getAllExpenses(): Promise<Expense[]> {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching all expenses:', error);
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }

    return (data ?? []) as Expense[];
  }

  async createExpense(expense: ExpenseCreate): Promise<Expense> {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expense,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      throw new Error(`Failed to create expense: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create expense: no data returned');
    }

    return data as Expense;
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw new Error(`Failed to update expense: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to update expense: no data returned');
    }

    return data as Expense;
  }

  async deleteExpense(id: string): Promise<void> {
    const user = await this.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  }
}

export const expenseService = new ExpenseService();
