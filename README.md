# StylishOwl

A clothing storefront starter built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

## Getting started

1. Use Node.js 20.9 or newer.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and fill in your Supabase project values.
4. Start the development server with `npm run dev`.

The initial catalog is organized around Baggy Jeans, T-shirts, and Shirts. Product content and the final customer-facing brand identity are intentionally not hard-coded yet.

## Environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Never put a Supabase service-role or secret key in a browser-exposed environment variable.
