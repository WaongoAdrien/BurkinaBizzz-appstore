// lib/productStock.ts — badge label/color for a product's stock status

import { StockStatus } from '../types';

const LOW_STOCK_THRESHOLD = 5;

export interface StockBadge {
  label: string;
  color: string;
}

export function getStockBadge(product: { stockStatus?: StockStatus; stockQuantity?: number }): StockBadge {
  const status = product.stockStatus || 'in_stock';

  if (status === 'sold') {
    return { label: 'Vendu', color: '#6B7280' };
  }
  if (status === 'out_of_stock') {
    return { label: 'Rupture de stock', color: '#D32F2F' };
  }

  const qty = product.stockQuantity;
  if (typeof qty === 'number' && qty > 0) {
    return qty <= LOW_STOCK_THRESHOLD
      ? { label: `Plus que ${qty} en stock`, color: '#E65100' }
      : { label: `${qty} en stock`, color: '#2E7D32' };
  }
  return { label: 'En stock', color: '#2E7D32' };
}
