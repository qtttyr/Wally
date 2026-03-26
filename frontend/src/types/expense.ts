export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category_id: string;
  date: string;
  receipt_date?: string;
  description?: string;
  receipt_url?: string;
  ai_categorized?: boolean;
  created_at: string;
}

export interface ExpenseCreate {
  amount: number;
  category_id: string;
  date: string;
  receipt_date?: string;
  description?: string;
  receipt_url?: string;
}
