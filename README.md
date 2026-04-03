# Cof fi - Smart Coffee Order & Management System

Cof fi is a complete full-stack web application designed for a modern coffee shop. It features a stunning customer-facing frontend for ordering drinks, integrated AI lead capturing, and an administrative dashboard for managing orders, users, menu items, and real-time stock using Google Sheets as a low-code database.

## System Architecture

- **Frontend:** Next.js (React), Tailwind CSS v4, Lucide React icons, Pro-Max UI/UX minimal design system.
- **Backend/Database:** Google Apps Script (GAS) acting as a serverless backend coupled with Google Sheets as the database.
- **State Management:** React hooks and context.
- **Notifications:** Real-time push alerts via Telegram Bot API on new orders and critical inventory levels.

## Key Features

1. **Customer Ordering Experience:**
   - Browse categories and view products in a stunning, responsive grid.
   - Dynamic cart management and real-time checkout updates.
   - Interactive 2-step checkout flow (Lead capture + Final confirmation).

2. **Admin Dashboard (RBAC - Role Based Access Control):**
   - **Dashboard:** Revenue summaries, live order counts, top 5 best sellers, and low stock warnings.
   - **Order Management:** View all orders, update statuses (Pending, Processing, Ready, Completed, Cancelled).
   - **Stock & Restock:** Automatically tracks theoretical inventory from recipes and supply inflows.
   - **Menu & Suppliers:** UI for extending product catalogs and vendor limits.
   - **User Management:** Create, delete, and restrict roles (Admin / Staff).

3. **Backend Logic Control (Google Sheets):**
   - **Security:** Access protected heavily by API Keys embedded via `.env.local` interacting with GAS `doPost`.
   - **Telegram Routing:** Automatically connects to a Telegram chat using `@BotFather` configuration.

## Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env.local` file at the project root based on this template:
   ```env
   NEXT_PUBLIC_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   NEXT_PUBLIC_GOOGLE_SHEETS_SECRET=coffi-2026-xyz
   ```

3. **Deploy Backend (Google Sheets):**
   - Open your target Google Sheet.
   - Navigate to `Extensions > Apps Script`.
   - Paste the contents of `gas/Code.gs`.
   - Update the `CONFIG` object inside with your `TELEGRAM_BOT_TOKEN` & `TELEGRAM_CHAT_ID`.
   - Save and `Deploy > New Deployment` (Type: Web App, Access: Anyone).

4. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the app!

## Project File Structure

- `/src/app/` - Next.js App Router (pages: `/`, `/admin`).
- `/src/app/api/admin/` - Secure Next.js API Routes proxying GAS endpoints.
- `/src/services/` - Reusable frontend API wrappers.
- `/gas/` - Contains the serverless Google Apps Script code (`Code.gs`).
- `/public/` - Static images and core assets.

## Contributing

Make sure to run linting before pushing your code. Only `Admin` roles can execute specific administrative functionalities like user creation and menu mutation.
