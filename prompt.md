# Warungin Vue App – RESKIN EXECUTION GUIDE (STRICT)

This document defines the ONLY allowed way to apply the new Admin Dashboard design
to an existing Vue application WITHOUT breaking routes, features, or logic.

This is a RESKIN, not a rewrite.

---

## 0. Core Principle (NON-NEGOTIABLE)

- Routing = IMMUTABLE
- Business Logic = IMMUTABLE
- API Calls = IMMUTABLE
- Permissions = IMMUTABLE

ONLY UI LAYER IS ALLOWED TO CHANGE.

If a change breaks a route or feature, it is WRONG.

---

## 1. Canonical Design Source

The following page is the SINGLE source of visual truth:

- Admin Tenant Dashboard (HTML provided by user)

All other pages MUST visually conform to this page.

No reinterpretation is allowed.

---

## 2. Scope of Reskin (ALLOWED vs FORBIDDEN)

### ✅ ALLOWED
- Layout wrapping (Sidebar, Header, Content shell)
- Spacing normalization
- Typography alignment
- Card / Table / Button replacement
- Class replacement using Tailwind
- Introducing Base UI Components

### ❌ FORBIDDEN
- Changing route paths
- Changing router structure
- Refactoring business logic
- Changing API endpoints
- Renaming stores / composables
- Introducing new UI concepts
- Redesigning UX flows

---

## 3. Mandatory Reskin Architecture

### 3.1 Layout Shell (REQUIRED)

All existing pages MUST be rendered inside a single layout shell.

- Layout file: `layouts/AdminLayout.vue`
- Existing pages are injected via `<router-view />`

Pages MUST NOT implement their own sidebar or header.

---

## 4. Base UI Components (MANDATORY)

All visual consistency is enforced via Base Components.

### Required Base Components
- BaseCard
- BaseButton
- BaseBadge
- BaseTable (optional wrapper)

Pages MUST NOT define custom card/button styles directly.

---

## 5. Design Rules (EXTRACTED FROM DASHBOARD)

### 5.1 Layout
- Sidebar: fixed
- Header: fixed height (80px)
- Content:
  - max-w-7xl
  - centered
  - vertical spacing using `gap-6` or `gap-8`

### 5.2 Cards
- `bg-white dark:bg-slate-800`
- `rounded-2xl`
- `shadow-card`
- subtle border only
- padding: `p-5` or `p-6`

### 5.3 Typography
- Page Title:
  - `text-3xl`
  - `font-bold`
  - `tracking-tight`
- Section Title:
  - `text-lg`
  - `font-bold`
- Body:
  - `text-sm`
  - muted slate colors

### 5.4 Buttons
- Primary:
  - `bg-primary`
  - `rounded-lg`
  - shadow with primary tint
- Secondary:
  - soft background
  - no shadow

### 5.5 Tables
- Header:
  - light gray background
  - uppercase labels
- Rows:
  - hover highlight only
  - no zebra striping

---

## 6. Navbar & Routing Preservation

### Rule:
NAVBAR MAY CHANGE VISUALLY, BUT MUST KEEP ALL ORIGINAL ROUTES.

- `<router-link to="...">` paths MUST remain unchanged
- Menu order MAY remain the same
- Icons MAY be replaced with Material Symbols ONLY

If a menu item existed before, it MUST still exist after reskin.

---

## 7. Page-Level Reskin Procedure (STEP-BY-STEP)

For EACH existing page:

1. DO NOT touch `<script>` logic
2. Keep all data, methods, computed, watchers
3. Only modify `<template>`

### Template Changes Allowed:
- Wrap content with layout spacing container
- Replace raw divs with BaseCard
- Replace buttons with BaseButton
- Normalize headings and spacing

### Template Changes Forbidden:
- Changing event handlers
- Changing component props
- Changing v-model bindings

---

## 8. Safe Reskin Example (MENTAL MODEL)

Before:
- Page renders standalone
- Inline styles
- Custom spacing

After:
- Page rendered inside AdminLayout
- Uses BaseCard for sections
- Uses BaseButton for actions
- Logic untouched

If logic changes, the reskin FAILED.

---

## 9. AI Usage Rules (STRICT)

When using AI for reskin tasks, the following MUST be stated:

- This is a VISUAL REFACTOR ONLY
- Do NOT change routes
- Do NOT change logic
- Do NOT improve UX
- Do NOT optimize code

AI output is considered INVALID if:
- Route paths differ
- Features disappear
- New UI patterns appear

---

## 10. Migration Order (MANDATORY)

1. Create AdminLayout
2. Create Base Components
3. Apply layout to all routes
4. Reskin most-used pages first
5. Reskin rarely-used pages last

DO NOT jump steps.

---

## 11. Success Criteria

The reskin is SUCCESSFUL if:
- All routes still work
- All features still work
- Visual style matches dashboard
- No page feels “different” in design language

If users must relearn navigation, the reskin FAILED.

---

END OF RESKIN EXECUTION GUIDE



ini code admin tenant dashboard
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Warungin Admin Tenant Dashboard</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#3f68e4", // Royal Blue
                        "primary-hover": "#3558c7",
                        "primary-light": "#eef2ff",
                        "background-light": "#f1f5f9", // Cool silver-blue gray
                        "background-dark": "#111521",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1e2330",
                        "text-primary": "#0e111b",
                        "text-secondary": "#506295",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.375rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "2xl": "1rem",
                        "full": "9999px"
                    },
                    boxShadow: {
                        "soft": "0 2px 10px rgba(0, 0, 0, 0.03)",
                        "card": "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                    }
                },
            },
        }
    </script>
<style>::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
        .glass-effect {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
        }.chart-grid line {
            stroke: #e2e8f0;
            stroke-dasharray: 4;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark font-display text-text-primary h-screen flex overflow-hidden">
<aside class="w-72 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 z-20 shadow-soft">
<div class="p-6 flex items-center gap-3">
<div class="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
<span class="material-symbols-outlined text-2xl">storefront</span>
</div>
<div class="flex flex-col">
<h1 class="text-lg font-bold text-slate-900 dark:text-white leading-tight">Warungin</h1>
<p class="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">Admin Tenant</p>
</div>
</div>
<nav class="flex-1 px-4 py-4 gap-2 flex flex-col overflow-y-auto">
<a class="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium transition-colors" href="#">
<span class="material-symbols-outlined filled">dashboard</span>
<span>Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors" href="#">
<span class="material-symbols-outlined">receipt_long</span>
<span>Sales</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors" href="#">
<span class="material-symbols-outlined">inventory_2</span>
<span>Products</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors" href="#">
<span class="material-symbols-outlined">package_2</span>
<span>Inventory</span>
<span class="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">5</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors" href="#">
<span class="material-symbols-outlined">group</span>
<span>Customers</span>
</a>
<div class="my-2 border-t border-slate-100 dark:border-slate-800"></div>
<a class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors" href="#">
<span class="material-symbols-outlined">settings</span>
<span>Settings</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors" href="#">
<span class="material-symbols-outlined">support_agent</span>
<span>Help &amp; Support</span>
</a>
</nav>
<div class="p-4 border-t border-slate-200 dark:border-slate-800">
<div class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
<div class="h-10 w-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-700 shadow-sm" data-alt="Portrait of Warung Budi owner" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBBCrL4c5UBpZJG9wtABY5eLYTTu2ASlkLmb5y-oIGxuz4NUlTPdq5MKTcUDp2yPy7KqofU4-mmXxrHrGjYN9KJYczA774-BasiE-2uC1KBRdEBJZ4lqcVf95hOsk7J9BumCMc6zZ9CntspQbfdRA5GvrgCXLAPhuW5kZmK9hHXSy4lH9Lk-yYLNE3Fs2hrWqIz27SE59Qn_GgRSZSQ-D_bIRRx6RiVVQCy8C8e-8cHTuwLCG0xaSlsda8MAUbV2zQgVmjEXnLATn4');"></div>
<div class="flex flex-col overflow-hidden">
<p class="text-sm font-semibold text-slate-900 dark:text-white truncate">Warung Budi</p>
<p class="text-xs text-slate-500 dark:text-slate-400 truncate">Pro Plan • Active</p>
</div>
<span class="material-symbols-outlined ml-auto text-slate-400">expand_more</span>
</div>
</div>
</aside>
<main class="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
<header class="h-20 shrink-0 px-8 flex items-center justify-between z-10">
<div class="flex items-center gap-2 text-sm">
<a class="text-slate-500 hover:text-primary transition-colors" href="#">Home</a>
<span class="text-slate-400">/</span>
<span class="text-slate-900 dark:text-white font-medium">Dashboard</span>
</div>
<div class="flex items-center gap-4">
<div class="relative hidden md:block">
<span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
<input class="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-none rounded-full shadow-soft text-sm focus:ring-2 focus:ring-primary/20 w-64 placeholder:text-slate-400" placeholder="Search orders, items..." type="text"/>
</div>
<button class="relative p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-soft text-slate-600 hover:text-primary transition-colors">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
</button>
</div>
</header>
<div class="flex-1 overflow-y-auto px-8 pb-8">
<div class="max-w-7xl mx-auto flex flex-col gap-8">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div class="flex flex-col">
<h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back, Warung Budi</h2>
<p class="text-slate-500 dark:text-slate-400 mt-1">Here is your daily store performance overview.</p>
</div>
<div class="flex flex-wrap items-center gap-3">
<div class="relative group">
<select class="appearance-none pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer hover:border-primary/50 transition-colors">
<option>Last 30 Days</option>
<option>This Week</option>
<option>This Month</option>
<option>Custom Range</option>
</select>
<span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
<span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] pointer-events-none">expand_more</span>
</div>
<button class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-95 font-medium text-sm">
<span class="material-symbols-outlined text-[20px]">add</span>
<span>Add Product</span>
</button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-40 relative overflow-hidden group">
<div class="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
<span class="material-symbols-outlined text-[120px] text-primary">payments</span>
</div>
<div class="flex items-center gap-3">
<div class="p-2 bg-green-50 text-green-600 rounded-lg">
<span class="material-symbols-outlined">payments</span>
</div>
<span class="text-slate-500 text-sm font-medium">Net Revenue</span>
</div>
<div>
<h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-2">Rp 150.2jt</h3>
<div class="flex items-center gap-1 mt-1">
<span class="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded font-medium flex items-center">
<span class="material-symbols-outlined text-[12px] mr-0.5">trending_up</span> 12.5%
                                </span>
<span class="text-slate-400 text-xs">vs last period</span>
</div>
</div>
</div>
<div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-40 relative overflow-hidden group">
<div class="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
<span class="material-symbols-outlined text-[120px] text-blue-500">shopping_cart</span>
</div>
<div class="flex items-center gap-3">
<div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
<span class="material-symbols-outlined">shopping_cart</span>
</div>
<span class="text-slate-500 text-sm font-medium">Total Orders</span>
</div>
<div>
<h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-2">1,248</h3>
<div class="flex items-center gap-1 mt-1">
<span class="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded font-medium flex items-center">
<span class="material-symbols-outlined text-[12px] mr-0.5">trending_up</span> 8.2%
                                </span>
<span class="text-slate-400 text-xs">vs last period</span>
</div>
</div>
</div>
<div class="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 p-5 rounded-2xl shadow-card border border-blue-100 dark:border-slate-700 flex flex-col justify-between h-40 relative">
<div class="flex justify-between items-start">
<div class="flex flex-col">
<span class="text-slate-500 text-sm font-medium">Subscription</span>
<h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                                Pro Plan
                                <span class="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
</h3>
</div>
<div class="h-8 w-8 rounded-full bg-white/50 flex items-center justify-center">
<span class="material-symbols-outlined text-primary">diamond</span>
</div>
</div>
<div class="mt-2">
<p class="text-xs text-slate-500 mb-3">Renews on Oct 24, 2024</p>
<button class="w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:border-primary transition-colors">Manage Plan</button>
</div>
</div>
<div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-40 border-l-4 border-l-red-500">
<div class="flex justify-between items-start">
<div class="flex items-center gap-3">
<div class="p-2 bg-red-50 text-red-600 rounded-lg">
<span class="material-symbols-outlined">warning</span>
</div>
<span class="text-slate-500 text-sm font-medium">Low Stock</span>
</div>
</div>
<div>
<div class="flex items-baseline gap-2 mt-2">
<h3 class="text-2xl font-bold text-slate-900 dark:text-white">5</h3>
<span class="text-sm text-slate-500">items need attention</span>
</div>
<a class="inline-flex items-center gap-1 text-xs font-semibold text-red-500 mt-2 hover:underline" href="#">
                            View Inventory <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
</a>
</div>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6 flex flex-col h-full">
<div class="flex items-center justify-between mb-6 flex-shrink-0">
<div>
<h3 class="text-lg font-bold text-slate-900 dark:text-white">Revenue Growth</h3>
<p class="text-sm text-slate-500">Gross Revenue vs Net Profit</p>
</div>
<div class="flex items-center gap-2">
<span class="flex items-center gap-1 text-xs text-slate-500">
<span class="w-2.5 h-2.5 rounded-full bg-primary"></span> Revenue
                            </span>
<span class="flex items-center gap-1 text-xs text-slate-500">
<span class="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Profit
                            </span>
</div>
</div>
<div class="flex flex-col flex-1 min-h-[250px] overflow-hidden">
<div class="flex flex-1">
<div class="flex flex-col justify-between text-xs text-slate-400 font-medium pr-3 border-r border-slate-100 dark:border-slate-700 pb-6 w-12 text-right">
<span>200M</span>
<span>150M</span>
<span>100M</span>
<span>50M</span>
<span>0</span>
</div>
<div class="relative flex-1 ml-4 pb-6">
<div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
<div class="w-full h-px bg-slate-100 dark:bg-slate-700 border-dashed"></div>
<div class="w-full h-px bg-slate-100 dark:bg-slate-700 border-dashed"></div>
<div class="w-full h-px bg-slate-100 dark:bg-slate-700 border-dashed"></div>
<div class="w-full h-px bg-slate-100 dark:bg-slate-700 border-dashed"></div>
<div class="w-full h-px bg-slate-100 dark:bg-slate-700 border-dashed"></div>
</div>
<svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 200">
<defs>
<linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#3f68e4" stop-opacity="0.2"></stop>
<stop offset="100%" stop-color="#3f68e4" stop-opacity="0"></stop>
</linearGradient>
</defs>
<path d="M0,80 C50,70 100,20 150,40 C200,60 250,10 300,30 C350,50 400,20 450,10 C500,0 550,20 600,15 L600,200 L0,200 Z" fill="url(#revenueGradient)"></path>
<path d="M0,80 C50,70 100,20 150,40 C200,60 250,10 300,30 C350,50 400,20 450,10 C500,0 550,20 600,15" fill="none" stroke="#3f68e4" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></path>
<path d="M0,120 C50,110 100,80 150,90 C200,100 250,70 300,80 C350,90 400,70 450,60 C500,50 550,60 600,55" fill="none" stroke="#cbd5e1" stroke-dasharray="5,5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
<div class="absolute left-[60%] top-[10%] bg-slate-800 text-white text-xs rounded-lg p-2 shadow-lg transform -translate-x-1/2 z-10 pointer-events-none">
<p class="font-bold">Rp 12.450.000</p>
<p class="text-slate-400">12 Oct</p>
<div class="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
</div>
<div class="absolute left-[60%] top-[23%] w-3 h-3 bg-primary border-2 border-white rounded-full transform -translate-x-1/2 shadow-sm pointer-events-none z-10"></div>
</div>
</div>
<div class="flex justify-between pl-16 text-xs text-slate-400 font-medium pt-1">
<span>01 Oct</span>
<span>05 Oct</span>
<span>10 Oct</span>
<span>15 Oct</span>
<span>20 Oct</span>
<span>25 Oct</span>
<span>30 Oct</span>
</div>
</div>
</div>
<div class="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6 flex flex-col">
<div class="flex items-center justify-between mb-4">
<h3 class="text-lg font-bold text-slate-900 dark:text-white">Top Products</h3>
<button class="text-sm text-primary hover:text-primary-hover font-medium">See All</button>
</div>
<div class="flex-1 overflow-y-auto pr-2 space-y-4">
<div class="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors group">
<div class="h-12 w-12 rounded-lg bg-cover bg-center shrink-0 border border-slate-100 dark:border-slate-700" data-alt="Iced Coffee Latte with brown sugar" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_8WlG0t76fRSDSNxDVRgEAoMLWoT4QHWziObJwLmZDtJxEiFSZdAU-MHt8OitnkbrfHg4yFDGH8cVWdyqRZmM8XMh8ZhlRFegah6VMLLFOAvgFr2DXQoiGDUTjVlR1uoDVS962ouZmLjdVCP9mrxyFm__pBnobYT2fIiv28gDUVmQAcR37d2zjjA_DC3yns0D483c91-s-b5v9v1TY7vl20la4B-aD2FtfRduLtIO5xC01Rq9A2GxlvPFHvcAykGXqW8gHQSg4yI');"></div>
<div class="flex-1 min-w-0">
<h4 class="text-sm font-semibold text-slate-900 dark:text-white truncate">Kopi Susu Gula Aren</h4>
<p class="text-xs text-slate-500">540 sold</p>
</div>
<div class="text-right">
<p class="text-sm font-bold text-slate-900 dark:text-white">Rp 12jt</p>
<span class="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 rounded">+12%</span>
</div>
</div>
<div class="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors group">
<div class="h-12 w-12 rounded-lg bg-cover bg-center shrink-0 border border-slate-100 dark:border-slate-700" data-alt="Slice of pepperoni pizza" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuA5UE4RFrYWp5BvLvFKlj5HVL9sj37wzhyE3M1kndkBzs2XqjO5HBUom6GKqGQyWhZ2Hm0twAEYWkVXdppExK8HeXZgZg7bHtu9XHkwTQC2OmWTKeFFXbUDKOUO1hzD4OJtVE_e9Q1QEeClB1Lba1t5iLGgyZ8ZOXdoLmTy0DLMm8mIC7DPMrPNafnxopxYjXu_5uy_Eu1uRtSDRXDEW3Nk7ohT7UGE9Wos133ge-HPhnrxBCmeTGA-tXQ5VB6yLmBFdcptMZ4NDeg');"></div>
<div class="flex-1 min-w-0">
<h4 class="text-sm font-semibold text-slate-900 dark:text-white truncate">Pizza Slice Premium</h4>
<p class="text-xs text-slate-500">320 sold</p>
</div>
<div class="text-right">
<p class="text-sm font-bold text-slate-900 dark:text-white">Rp 8.5jt</p>
<span class="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 rounded">+5%</span>
</div>
</div>
<div class="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors group">
<div class="h-12 w-12 rounded-lg bg-cover bg-center shrink-0 border border-slate-100 dark:border-slate-700" data-alt="Glass of iced matcha latte" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCAffpeCJGFkg3jc5Ds_4ltIsIz3E8YGNYUz8HR5ytNghQkPLirs6w4Uq_v96GY07uhQFOOrYdD9O-QPnTXXmQSJU4yq-XhBMJWohchfnnZ_Q0onz2wwwRhAQR3zycDhxyN5ljDgdC9eirf8un1J7Q5nZ7kK8s_bSvJrccQWo2rV2FCfZQrQAtdC2-7I6Y0PL-fmtkASDsooGpIuk__T1z-zkMZJNEGHV9-btaL6S8DNH_-Ds6EjiOdUR-x60EcLfvqlwZmA7Q9Jjk');"></div>
<div class="flex-1 min-w-0">
<h4 class="text-sm font-semibold text-slate-900 dark:text-white truncate">Matcha Latte</h4>
<p class="text-xs text-slate-500">210 sold</p>
</div>
<div class="text-right">
<p class="text-sm font-bold text-slate-900 dark:text-white">Rp 6.2jt</p>
<span class="text-[10px] text-slate-400 font-medium bg-slate-50 px-1.5 rounded">0%</span>
</div>
</div>
<div class="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors group">
<div class="h-12 w-12 rounded-lg bg-cover bg-center shrink-0 border border-slate-100 dark:border-slate-700" data-alt="Crispy fried chicken wings" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAIsb8A0O3Ay0UPyIX9886wZVaMowrDuOPySt8aqtXjvHJzNJgQG5F3H-hV04Zg73A2X2G2Q062n_MaDeYbtDkeQzVygiQxB6Xqkg2EhzaIkWfH0HwCo0aytbpdzrwKpvO2Pu5VwlUGB_SVzTV7LhQRB-QREnZ0TcpzIk2hFZl5LqqDoArQJZj7Mv6niGz1_Qgqyoe69tUbrb-U17Scp5NqfZdoBJbnDcDwoZNeepK4kQkvqxrtlOK87dj0O_E89D_Lf7ujUkAgCZE');"></div>
<div class="flex-1 min-w-0">
<h4 class="text-sm font-semibold text-slate-900 dark:text-white truncate">Spicy Wings (6pcs)</h4>
<p class="text-xs text-slate-500">180 sold</p>
</div>
<div class="text-right">
<p class="text-sm font-bold text-slate-900 dark:text-white">Rp 4.8jt</p>
<span class="text-[10px] text-red-500 font-medium bg-red-50 px-1.5 rounded">-2%</span>
</div>
</div>
</div>
</div>
</div>
<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 overflow-hidden mb-8">
<div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
<h3 class="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
<div class="flex gap-2">
<button class="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Export</button>
<button class="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">View All</button>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-sm text-left">
<thead class="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700/30">
<tr>
<th class="px-6 py-4 font-medium">Order ID</th>
<th class="px-6 py-4 font-medium">Date</th>
<th class="px-6 py-4 font-medium">Customer</th>
<th class="px-6 py-4 font-medium">Outlet</th>
<th class="px-6 py-4 font-medium">Amount</th>
<th class="px-6 py-4 font-medium">Status</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
<td class="px-6 py-4 font-medium text-primary">#ORD-2024-001</td>
<td class="px-6 py-4 text-slate-600">Oct 24, 10:30 AM</td>
<td class="px-6 py-4 text-slate-900 dark:text-white font-medium">Budi Santoso</td>
<td class="px-6 py-4 text-slate-600">Jakarta Selatan</td>
<td class="px-6 py-4 font-semibold text-slate-900 dark:text-white">Rp 150.000</td>
<td class="px-6 py-4"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Completed</span></td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
<td class="px-6 py-4 font-medium text-primary">#ORD-2024-002</td>
<td class="px-6 py-4 text-slate-600">Oct 24, 10:15 AM</td>
<td class="px-6 py-4 text-slate-900 dark:text-white font-medium">Siti Aminah</td>
<td class="px-6 py-4 text-slate-600">Jakarta Selatan</td>
<td class="px-6 py-4 font-semibold text-slate-900 dark:text-white">Rp 75.500</td>
<td class="px-6 py-4"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Completed</span></td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
<td class="px-6 py-4 font-medium text-primary">#ORD-2024-003</td>
<td class="px-6 py-4 text-slate-600">Oct 24, 09:45 AM</td>
<td class="px-6 py-4 text-slate-900 dark:text-white font-medium">Joko Anwar</td>
<td class="px-6 py-4 text-slate-600">Bandung Utara</td>
<td class="px-6 py-4 font-semibold text-slate-900 dark:text-white">Rp 210.000</td>
<td class="px-6 py-4"><span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>Processing</span></td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</main>

</body></html>