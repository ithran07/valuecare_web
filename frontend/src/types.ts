export interface Category {
  id: number;
  name: string;
}

export interface Unit {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  brand: string;
  manufacturer: string;
  category: Category | null;
  unit: Unit | null;
  selling_price: string;
  wholesale_price: string;
  is_prescription: boolean;
  in_stock: boolean;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface OrderItemResult {
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: string;
  unit_price: string;
  line_total: string;
}

export interface OrderResult {
  order_number: string;
  status: string;
  contact_name: string;
  business_name: string;
  customer_type: string;
  email: string;
  phone: string;
  delivery_address: string;
  notes: string;
  subtotal: string;
  total: string;
  created_at: string;
  items: OrderItemResult[];
}
