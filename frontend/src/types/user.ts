export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  plan: "free" | "pro";
  created_at: string;
}
