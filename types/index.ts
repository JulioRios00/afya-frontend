export interface Product {
  _id: string;
  name: string;
  description: string;
  price: string;
  category_ids: string[];
  image_url?: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface Order {
  _id: string;
  date: string;
  product_ids: string[];
  total: string;
}

export interface DashboardMetrics {
  totalOrders: number;
  averageOrderValue: number;
  totalRevenue: number;
}

export interface OrdersByPeriod {
  period: string;
  count: number;
  revenue: number;
}

// afya-frontend/
// ├── app/                      # Next.js App Router
// │   ├── products/
// │   │   └── page.tsx          # Products page
// │   ├── categories/
// │   │   └── page.tsx          # Categories page
// │   ├── orders/
// │   │   └── page.tsx          # Orders page
// │   ├── dashboard/
// │   │   └── page.tsx          # Dashboard page
// │   ├── layout.tsx            # Shared layout
// │   └── page.tsx              # Home page
// ├── components/               # React components
// │   ├── products/
// │   │   ├── ProductsTable.tsx
// │   │   └── ProductForm.tsx
// │   ├── categories/
// │   ├── orders/
// │   └── dashboard/
// ├── lib/                      # Utility functions
// │   ├── api.ts                # API client
// │   └── s3.ts                 # S3 upload functionality
// ├── types/                    # TypeScript type definitions
// │   └── index.ts              # Shared interfaces/types
// ├── public/                   # Static assets
// ├── .storybook/               # Storybook configuration
// ├── stories/                  # Storybook stories
// ├── next.config.js            # Next.js configuration
// ├── tsconfig.json             # TypeScript configuration
// └── package.json   