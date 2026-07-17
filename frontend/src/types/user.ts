export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  plan: "free" | "premium";
  currency?: string;
  monthly_budget?: number;
  created_at: string;
}
