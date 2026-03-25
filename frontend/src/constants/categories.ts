import i18n from 'i18next';

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

const CATEGORIES_BASE: Omit<Category, 'label'>[] = [
  { id: "food", icon: "🍔", color: "#22c55e" },
  { id: "transport", icon: "🚗", color: "#3b82f6" },
  { id: "entertainment", icon: "🎮", color: "#a855f7" },
  { id: "shopping", icon: "🛍️", color: "#f97316" },
  { id: "health", icon: "💊", color: "#ef4444" },
  { id: "education", icon: "📚", color: "#06b6d4" },
  { id: "housing", icon: "🏠", color: "#eab308" },
  { id: "subscriptions", icon: "📱", color: "#8b5cf6" },
  { id: "other", icon: "📦", color: "#6b7280" },
];

export const getCategories = (): Category[] => {
  return CATEGORIES_BASE.map(cat => ({
    ...cat,
    label: i18n.t(`categories.${cat.id}`)
  }));
};

export const CATEGORIES: Category[] = CATEGORIES_BASE.map(cat => ({
  ...cat,
  label: cat.id
}));

export const getCategoryById = (id: string): Category | undefined => {
  const cat = CATEGORIES_BASE.find(c => c.id === id);
  if (!cat) return undefined;
  return {
    ...cat,
    label: i18n.t(`categories.${cat.id}`)
  };
};
