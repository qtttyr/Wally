export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'KGS', symbol: 'сом', name: 'Kyrgyz Som' },
  { code: 'UZS', symbol: "so'm", name: 'Uzbek Som' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol || code;
}

export function getCurrencyName(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.name || code;
}
