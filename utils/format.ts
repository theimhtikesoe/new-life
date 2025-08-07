// MMK currency formatting utility
export function formatMMK(amount: number): string {
  return new Intl.NumberFormat('my-MM', {
    style: 'currency',
    currency: 'MMK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('MMK', 'Ks')
}

export function formatMMKShort(amount: number): string {
  if (amount >= 1000000) {
    return `Ks ${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `Ks ${(amount / 1000).toFixed(0)}K`
  }
  return `Ks ${amount.toLocaleString()}`
}
