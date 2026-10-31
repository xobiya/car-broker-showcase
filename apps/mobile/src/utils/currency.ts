export function formatPrice(price: number) {
  return `ETB ${Number(price || 0).toLocaleString('en-US')}`;
}
