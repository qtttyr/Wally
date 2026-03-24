export type CategoryId =
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "health"
  | "education"
  | "housing"
  | "subscriptions"
  | "other";

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: "food", label: "Еда", icon: "🍔", color: "#22c55e" },
  { id: "transport", label: "Транспорт", icon: "🚗", color: "#3b82f6" },
  { id: "entertainment", label: "Развлечения", icon: "🎮", color: "#a855f7" },
  { id: "shopping", label: "Покупки", icon: "🛍️", color: "#f97316" },
  { id: "health", label: "Здоровье", icon: "💊", color: "#ef4444" },
  { id: "education", label: "Образование", icon: "📚", color: "#06b6d4" },
  { id: "housing", label: "Жильё", icon: "🏠", color: "#eab308" },
  { id: "subscriptions", label: "Подписки", icon: "📱", color: "#8b5cf6" },
  { id: "other", label: "Другое", icon: "📦", color: "#6b7280" },
];

export const getCategoryById = (id: string): Category | undefined => 
  CATEGORIES.find(c => c.id === id);
