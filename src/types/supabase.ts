export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus = "pending" | "paid" | "failed" | "shipped" | "delivered" | "cancelled";
export type DiscountType = "percentage" | "fixed";

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          category_id: string;
          base_price: number;
          compare_at_price: number | null;
          status: ProductStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          category_id: string;
          base_price: number;
          compare_at_price?: number | null;
          status?: ProductStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          category_id?: string;
          base_price?: number;
          compare_at_price?: number | null;
          status?: ProductStatus;
          created_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt_text?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          alt_text?: string | null;
          sort_order?: number;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          color: string;
          sku: string;
          stock_quantity: number;
          price_override: number | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          size: string;
          color: string;
          sku: string;
          stock_quantity?: number;
          price_override?: number | null;
        };
        Update: {
          id?: string;
          product_id?: string;
          size?: string;
          color?: string;
          sku?: string;
          stock_quantity?: number;
          price_override?: number | null;
        };
      };
      cart_sessions: {
        Row: {
          id: string;
          cookie_token: string;
          created_at: string;
          last_active_at: string;
        };
        Insert: {
          id?: string;
          cookie_token: string;
          created_at?: string;
          last_active_at?: string;
        };
        Update: {
          id?: string;
          cookie_token?: string;
          created_at?: string;
          last_active_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          cart_session_id: string;
          product_variant_id: string;
          quantity: number;
          added_at: string;
        };
        Insert: {
          id?: string;
          cart_session_id: string;
          product_variant_id: string;
          quantity?: number;
          added_at?: string;
        };
        Update: {
          id?: string;
          cart_session_id?: string;
          product_variant_id?: string;
          quantity?: number;
          added_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      product_status: ProductStatus;
      order_status: OrderStatus;
      discount_type: DiscountType;
    };
    CompositeTypes: Record<string, never>;
  };
}
