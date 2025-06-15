export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price?: number;
  currency?: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SV9qNDuK20ryQa',
    priceId: 'price_1Ra9WcEw81hKXKjJZDouxghu',
    name: 'Premium Tier',
    description: 'paid tier for yo_ios_app',
    mode: 'subscription',
    price: 100, // $1.00 in cents
    currency: 'usd'
  }
];

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}