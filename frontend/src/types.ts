export type Role = 'USER' | 'ADMIN';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  role: Role;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  order: number;
}

export interface ProductVariant {
  id: string;
  color: string;
  colorHex?: string | null;
  storageGb: number;
  ramGb: number;
  price: number;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  basePrice: number;
  discount: number;
  rating: number;
  reviewsCount: number;
  releaseYear?: number | null;
  screenSize?: number | null;
  screenType?: string | null;
  resolution?: string | null;
  refreshRate?: number | null;
  processor?: string | null;
  batteryMah?: number | null;
  camerasMp?: string | null;
  os?: string | null;
  weight?: number | null;
  waterproof?: string | null;
  isFeatured: boolean;
  isActive?: boolean;
  brand: Brand;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews?: Review[];
  questions?: Question[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string | null;
  body: string;
  verified: boolean;
  createdAt: string;
  user?: { id: string; name: string | null; email?: string };
}

export interface Answer {
  id: string;
  body: string;
  isOfficial: boolean;
  createdAt: string;
  user?: { id: string; name: string | null; role?: Role };
}

export interface Question {
  id: string;
  body: string;
  createdAt: string;
  user?: { id: string; name: string | null };
  answers: Answer[];
}

export interface Facets {
  brands: Brand[];
  storageGb: number[];
  ramGb: number[];
  colors: string[];
  priceMin: number;
  priceMax: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  variant: ProductVariant & {
    product: Product & { images: ProductImage[] };
  };
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  postalCode?: string | null;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productTitle: string;
  color: string;
  storageGb: number;
  ramGb: number;
  priceAtTime: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  note?: string | null;
  shipFullName: string;
  shipPhone: string;
  shipCountry: string;
  shipCity: string;
  shipStreet: string;
  shipPostal?: string | null;
  createdAt: string;
  items: OrderItem[];
  user?: { id: string; email: string; name: string | null };
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}
