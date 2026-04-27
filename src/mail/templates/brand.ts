export const BRAND = {
  name: 'Scandic School',
  primary: '#f4a724',
  primaryDark: '#e8890a',
  secondary: '#0f172a',
  secondaryMid: '#1e3a5f',
  textMuted: '#64748b',
  bg: '#f8fafc',
  cardBg: '#ffffff',
  border: '#e2e8f0',
  // Note: загрузить логотип в bucket "merch-images" по пути "email-assets/logo.png"
  // и заменить эту константу на полученный publicUrl (см. Open items в конце плана).
  logoUrl: 'https://scandic-school-api.onrender.com/assets/logo.png',
};

export const HUMAN_STATUS: Record<string, string> = {
  NEW: 'Новая',
  PAID: 'Оплачена',
  CONFIRMED: 'Подтверждена',
  REJECTED: 'Отклонена',
  CANCELLED: 'Отменена',
};
