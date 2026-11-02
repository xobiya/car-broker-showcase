export function formatPrice(price: number, locale?: string): string {
  const formatted = Number(price || 0).toLocaleString('en-US');
  if (locale === 'am') {
    return `${formatted} ብር`;
  }
  return `ETB ${formatted}`;
}
