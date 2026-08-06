# saleDashboard-

# Nexis Enterprise ERP - Sale, Inventory, Serial Tracking & SuperAdmin System

An enterprise-grade Sale, Inventory, Purchasing, Profit/Revenue, Serial Number, and SuperAdmin Check & Balance management web application built with **Vue 3**, **Vite**, **Pinia**, **Vue Router**, **Lucide Icons**, and **MongoDB Atlas**.

---

## 🚀 Live Vercel Deployment
This application is deployed on Vercel with automatic serverless REST API functions connecting to MongoDB Atlas (`sale` database).

- **Frontend**: Vue 3 + Vite SPA
- **Backend API**: Express.js on Vercel Serverless Functions (`/api/*`)
- **Database**: MongoDB Atlas (`sale` collection)

---

## Key Features

1. **👑 SuperAdmin Check & Balance Control Center**
   - System Audit Trail & Event Ledger
   - Real-time Financial Reconciliation Health Score (98.4% status)
   - User Access Governance & Account Provisioning

2. **📦 Product Storage & Multi-Bin Inventory**
   - Multi-bin storage locations (`WH-A1-B04`)
   - Cost price, selling price, stock quantities, and low stock alerts

3. **🏷️ Serial Number Registry & Lineage**
   - Unit-level serial tracking per SKU across statuses (*Available*, *Sold*, *Reserved*, *Defective*)
   - Serial lineage timeline history (PO Inbound -> Bin -> Invoice -> Customer)

4. **💳 POS Outbound Sales & Receipts**
   - POS checkout terminal with serial unit picking
   - VAT tax, discount calculations, net profit analysis, and printable receipts

5. **🚚 Purchasing & Inbound Stock**
   - Supplier purchase orders with auto-serial registration

6. **📈 Financial Analytics**
   - Revenue, COGS, Net Profit metrics, category breakdown, and CSV report export

7. **🍃 MongoDB Atlas Cluster Integration**
   - Node.js + Express REST API server (`server/index.js`) connected to MongoDB Atlas (`sale` database)

---

## Setup & Running Locally

```bash
# 1. Install Dependencies
npm install

# 2. Run Vite Frontend Development Server
npm run dev

# 3. Run Express Backend Server (Connected to MongoDB Atlas)
npm run server
```
