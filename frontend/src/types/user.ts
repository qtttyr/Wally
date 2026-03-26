export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  plan: "free" | "premium";
  currency?: string;
  created_at: string;
}
