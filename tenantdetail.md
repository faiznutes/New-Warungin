page tenant detail 
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Tenant Detail - Warungin</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Config -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#2b7cee",
                        "primary-dark": "#1a5bb8",
                        "background-light": "#f8faff", 
                        "background-dark": "#101822",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1e293b",
                        "border-light": "#e2e8f0",
                        "border-dark": "#334155",
                        "text-main": "#0d131b",
                        "text-secondary": "#4c6c9a",
                        "accent-silver": "#e7ecf3",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                    boxShadow: {
                        'soft': '0 2px 8px -2px rgba(43, 124, 238, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.02)',
                        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                    }
                },
            },
        }
    </script>
<style>
        /* Custom Scrollbar for cleaner look */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white antialiased h-screen overflow-hidden flex">
<!-- Sidebar Navigation -->
<aside class="hidden lg:flex w-[260px] flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-full shrink-0 z-20 transition-all">
<!-- Logo Area -->
<div class="h-16 flex items-center px-6 border-b border-transparent">
<div class="flex items-center gap-3">
<div class="bg-primary/10 rounded-lg p-1.5 flex items-center justify-center">
<span class="material-symbols-outlined text-primary" style="font-size: 24px;">grid_view</span>
</div>
<div class="flex flex-col">
<h1 class="text-text-main dark:text-white text-base font-bold leading-none tracking-tight">Warungin</h1>
<p class="text-text-secondary text-xs font-medium mt-1">Admin Panel</p>
</div>
</div>
</div>
<!-- Navigation Links -->
<nav class="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">dashboard</span>
<span class="text-sm font-medium leading-normal">Dashboard</span>
</a>
<!-- Active State -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors" href="#">
<span class="material-symbols-outlined fill-current" style="font-size: 22px; font-variation-settings: 'FILL' 1;">storefront</span>
<span class="text-sm font-bold leading-normal">Tenants</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">receipt_long</span>
<span class="text-sm font-medium leading-normal">Billing</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">bar_chart</span>
<span class="text-sm font-medium leading-normal">Reports</span>
</a>
<div class="my-2 border-t border-border-light dark:border-border-dark opacity-50"></div>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">group</span>
<span class="text-sm font-medium leading-normal">User Management</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">settings</span>
<span class="text-sm font-medium leading-normal">Settings</span>
</a>
</nav>
<!-- User Profile (Bottom) -->
<div class="p-4 border-t border-border-light dark:border-border-dark">
<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-accent-silver/30 cursor-pointer transition-colors">
<div class="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center overflow-hidden border border-white shadow-sm" data-alt="User avatar placeholder" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKVAattgmkB7nefe7MVfSnpwbB8l7M-6jdk90DAcfeQlDuzXMMIZ_VAXM-H-J3Maa-HL5DjPHD3SZy_flv45LqNZOwstgfHvLFwW6i1uztx7bGy6QyyZMqdU-L5Mgxa16tqkMbyjLcTE-txUemG_rYiyeIKnhHv-o_LNzQ6BpwXgTKTANB2XiY0KnveSR25lDJvZw65JEVntwz9-UF1ltUsPADSFnGWN3aJ_xtnGW6DM_enh-08AeOXsFK8FDS69D51c4aiyKAjwI'); background-size: cover;">
</div>
<div class="flex flex-col overflow-hidden">
<p class="text-sm font-semibold text-text-main dark:text-white truncate">Admin User</p>
<p class="text-xs text-text-secondary truncate">Super Admin</p>
</div>
</div>
</div>
</aside>
<!-- Main Content Area -->
<main class="flex-1 flex flex-col h-full overflow-hidden relative w-full">
<!-- Header / Breadcrumbs -->
<header class="h-16 flex items-center justify-between px-6 lg:px-8 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark shrink-0 z-10 sticky top-0">
<div class="flex items-center gap-2 text-sm">
<a class="text-text-secondary hover:text-primary font-medium transition-colors" href="#">Home</a>
<span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
<a class="text-text-secondary hover:text-primary font-medium transition-colors" href="#">Tenants</a>
<span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
<span class="text-text-main dark:text-white font-semibold">Warung Makmur Jaya</span>
</div>
<div class="flex items-center gap-3 lg:hidden">
<button class="text-text-secondary hover:text-primary">
<span class="material-symbols-outlined">menu</span>
</button>
</div>
</header>
<!-- Scrollable Content -->
<div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-8">
<div class="max-w-[1100px] mx-auto flex flex-col gap-6">
<!-- Tenant Header Card -->
<section class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-soft overflow-hidden">
<!-- Subtle Gradient Background for Header Visual -->
<div class="h-24 bg-gradient-to-r from-slate-100 to-blue-50/50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800"></div>
<div class="px-6 pb-6 lg:px-8">
<div class="relative flex flex-col lg:flex-row gap-6 items-start -mt-10">
<!-- Tenant Logo -->
<div class="shrink-0 relative">
<div class="w-28 h-28 rounded-xl bg-white dark:bg-slate-800 shadow-md border-2 border-white dark:border-slate-700 p-1">
<div class="w-full h-full rounded-lg bg-slate-100 dark:bg-slate-900 bg-center bg-cover" data-alt="Warung Makmur Jaya Logo" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-twq6XoEDLCFd4Jib7F8y9as0pbJpXVkY7kp_5YtHm083I8Xpo97YsWHB--vFGaQ4lnXlTDNBYBB7xKFo1TCAuUj4nVZxg-qYHEooD1IOlngn2aZ3hRF9hqdccP3xoFp51N09k05n09cdK7WBHtyj20zd61iph19sWn3wMn_M6DZ1qReOng9pzuDBXMyM3Ge6qZl7KLQTzXLa04UKZ2YHqlS9aI0noqvqC0qdKe98P81tpBhndyFdWCeXhUHWGlKL7s-qPwS6sFU');">
</div>
</div>
<div class="absolute bottom-1 right-1 translate-x-1/4 translate-y-1/4">
<span class="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-800" title="Active">
<span class="material-symbols-outlined text-white text-[12px] font-bold">check</span>
</span>
</div>
</div>
<!-- Info -->
<div class="flex-1 pt-2 lg:pt-11 min-w-0">
<div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
<div>
<h1 class="text-2xl font-bold text-text-main dark:text-white leading-tight">Warung Makmur Jaya</h1>
<div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-text-secondary">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">tag</span>
                                                ID: #T-98234
                                            </span>
<span class="w-1 h-1 rounded-full bg-slate-300"></span>
<span class="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                                Active
                                            </span>
<span class="w-1 h-1 rounded-full bg-slate-300"></span>
<span>F&amp;B Business</span>
</div>
</div>
<!-- Quick Stats -->
<div class="flex items-center gap-6">
<div class="flex flex-col items-start lg:items-end">
<span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Total Stores</span>
<span class="text-lg font-bold text-text-main dark:text-white">4</span>
</div>
<div class="w-px h-8 bg-border-light dark:border-border-dark hidden lg:block"></div>
<div class="flex flex-col items-start lg:items-end">
<span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Current Plan</span>
<span class="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-center">Pro Annual</span>
</div>
</div>
</div>
</div>
<!-- Actions -->
<div class="w-full lg:w-auto flex items-center gap-3 pt-2 lg:pt-11">
<button class="flex-1 lg:flex-none h-9 px-4 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-main dark:text-white text-sm font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">edit</span>
<span>Edit</span>
</button>
<button class="flex-1 lg:flex-none h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">login</span>
<span>Login as Tenant</span>
</button>
</div>
</div>
</div>
<!-- Horizontal Tabs -->
<div class="mt-2 px-6 lg:px-8 border-t border-border-light dark:border-border-dark">
<div class="flex overflow-x-auto gap-8 no-scrollbar scroll-smooth">
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-bold text-primary tracking-wide">Profile</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-primary"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Subscription</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Active Addons</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Reward Points</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Users</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Stores</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
</div>
</div>
</section>
<!-- Tab Content: Profile (Description List) -->
<section class="flex flex-col gap-6">
<div class="flex items-center justify-between">
<h2 class="text-lg font-bold text-text-main dark:text-white">Tenant Profile</h2>
<span class="text-sm text-text-secondary">Last updated: 2 days ago</span>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-card">
<div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
<!-- Item 1 -->
<div class="flex flex-col gap-1.5 relative group">
<label class="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
<span class="material-symbols-outlined text-[16px]">person</span>
                                    Owner Name
                                </label>
<p class="text-base font-medium text-text-main dark:text-white border-b border-border-light dark:border-slate-700 pb-2 group-hover:border-primary/50 transition-colors">
                                    Budi Santoso
                                </p>
</div>
<!-- Item 2 -->
<div class="flex flex-col gap-1.5 relative group">
<label class="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
<span class="material-symbols-outlined text-[16px]">mail</span>
                                    Email Address
                                </label>
<p class="text-base font-medium text-text-main dark:text-white border-b border-border-light dark:border-slate-700 pb-2 group-hover:border-primary/50 transition-colors">
                                    budi@makmurjaya.com
                                </p>
</div>
<!-- Item 3 -->
<div class="flex flex-col gap-1.5 relative group">
<label class="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
<span class="material-symbols-outlined text-[16px]">call</span>
                                    Phone Number
                                </label>
<p class="text-base font-medium text-text-main dark:text-white border-b border-border-light dark:border-slate-700 pb-2 group-hover:border-primary/50 transition-colors">
                                    +62 812 3456 7890
                                </p>
</div>
<!-- Item 4 -->
<div class="flex flex-col gap-1.5 relative group">
<label class="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
<span class="material-symbols-outlined text-[16px]">store</span>
                                    Business Address
                                </label>
<p class="text-base font-medium text-text-main dark:text-white border-b border-border-light dark:border-slate-700 pb-2 group-hover:border-primary/50 transition-colors">
                                    Jl. Merdeka No. 45, Jakarta Selatan
                                </p>
</div>
<!-- Item 5 -->
<div class="flex flex-col gap-1.5 relative group">
<label class="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
<span class="material-symbols-outlined text-[16px]">calendar_month</span>
                                    Registration Date
                                </label>
<p class="text-base font-medium text-text-main dark:text-white border-b border-border-light dark:border-slate-700 pb-2 group-hover:border-primary/50 transition-colors">
                                    12 Jan 2023
                                </p>
</div>
<!-- Item 6 -->
<div class="flex flex-col gap-1.5 relative group">
<label class="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
<span class="material-symbols-outlined text-[16px]">badge</span>
                                    Tax ID (NPWP)
                                </label>
<p class="text-base font-medium text-text-main dark:text-white border-b border-border-light dark:border-slate-700 pb-2 group-hover:border-primary/50 transition-colors">
                                    12.345.678.9-012.000
                                </p>
</div>
<!-- Item 7 -->
<div class="flex flex-col gap-1.5 relative group">
<label class="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
<span class="material-symbols-outlined text-[16px]">category</span>
                                    Business Category
                                </label>
<p class="text-base font-medium text-text-main dark:text-white border-b border-border-light dark:border-slate-700 pb-2 group-hover:border-primary/50 transition-colors">
                                    Food &amp; Beverages (Restaurant)
                                </p>
</div>
<!-- Item 8 -->
<div class="flex flex-col gap-1.5 relative group">
<label class="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
<span class="material-symbols-outlined text-[16px]">language</span>
                                    Website
                                </label>
<p class="text-base font-medium text-primary border-b border-border-light dark:border-slate-700 pb-2 group-hover:border-primary/50 transition-colors cursor-pointer">
                                    www.makmurjaya.com
                                </p>
</div>
</div>
<!-- Footer of Card -->
<div class="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-border-light dark:border-border-dark flex items-center justify-between rounded-b-xl">
<span class="text-sm text-text-secondary">Need to update sensitive info?</span>
<button class="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">Request Profile Update</button>
</div>
</div>
</section>
<!-- Quick Look at Stores (Mini Preview below profile) -->
<section class="mt-2">
<div class="flex items-center justify-between mb-4">
<h2 class="text-lg font-bold text-text-main dark:text-white">Active Stores</h2>
<a class="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1" href="#">
                            View all stores
                            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<!-- Store Card 1 -->
<div class="p-4 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
<div class="flex items-center gap-3 mb-3">
<div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
<span class="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">store</span>
</div>
<div>
<h3 class="text-sm font-bold text-text-main dark:text-white">Makmur Jaya Pusat</h3>
<p class="text-xs text-text-secondary">Jakarta Selatan</p>
</div>
</div>
<div class="flex items-center gap-2">
<span class="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
<span class="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                                     Open
                                 </span>
<span class="text-xs text-text-secondary">• 12 Staff</span>
</div>
</div>
<!-- Store Card 2 -->
<div class="p-4 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
<div class="flex items-center gap-3 mb-3">
<div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
<span class="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">store</span>
</div>
<div>
<h3 class="text-sm font-bold text-text-main dark:text-white">Makmur Jaya Cabang 1</h3>
<p class="text-xs text-text-secondary">Bekasi</p>
</div>
</div>
<div class="flex items-center gap-2">
<span class="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
<span class="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                                     Open
                                 </span>
<span class="text-xs text-text-secondary">• 8 Staff</span>
</div>
</div>
</div>
</section>
</div>
</div>
</main>
</body></html>

tab subscription
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Tenant Detail - Subscription - Warungin</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#2b7cee",
                        "primary-dark": "#1a5bb8",
                        "background-light": "#f8faff", 
                        "background-dark": "#101822",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1e293b",
                        "border-light": "#e2e8f0",
                        "border-dark": "#334155",
                        "text-main": "#0d131b",
                        "text-secondary": "#4c6c9a",
                        "accent-silver": "#e7ecf3",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                    boxShadow: {
                        'soft': '0 2px 8px -2px rgba(43, 124, 238, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.02)',
                        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                    }
                },
            },
        }
    </script>
<style>::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white antialiased h-screen overflow-hidden flex">
<aside class="hidden lg:flex w-[260px] flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-full shrink-0 z-20 transition-all">
<div class="h-16 flex items-center px-6 border-b border-transparent">
<div class="flex items-center gap-3">
<div class="bg-primary/10 rounded-lg p-1.5 flex items-center justify-center">
<span class="material-symbols-outlined text-primary" style="font-size: 24px;">grid_view</span>
</div>
<div class="flex flex-col">
<h1 class="text-text-main dark:text-white text-base font-bold leading-none tracking-tight">Warungin</h1>
<p class="text-text-secondary text-xs font-medium mt-1">Admin Panel</p>
</div>
</div>
</div>
<nav class="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">dashboard</span>
<span class="text-sm font-medium leading-normal">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors" href="#">
<span class="material-symbols-outlined fill-current" style="font-size: 22px; font-variation-settings: 'FILL' 1;">storefront</span>
<span class="text-sm font-bold leading-normal">Tenants</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">receipt_long</span>
<span class="text-sm font-medium leading-normal">Billing</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">bar_chart</span>
<span class="text-sm font-medium leading-normal">Reports</span>
</a>
<div class="my-2 border-t border-border-light dark:border-border-dark opacity-50"></div>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">group</span>
<span class="text-sm font-medium leading-normal">User Management</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">settings</span>
<span class="text-sm font-medium leading-normal">Settings</span>
</a>
</nav>
<div class="p-4 border-t border-border-light dark:border-border-dark">
<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-accent-silver/30 cursor-pointer transition-colors">
<div class="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center overflow-hidden border border-white shadow-sm" data-alt="User avatar placeholder" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKVAattgmkB7nefe7MVfSnpwbB8l7M-6jdk90DAcfeQlDuzXMMIZ_VAXM-H-J3Maa-HL5DjPHD3SZy_flv45LqNZOwstgfHvLFwW6i1uztx7bGy6QyyZMqdU-L5Mgxa16tqkMbyjLcTE-txUemG_rYiyeIKnhHv-o_LNzQ6BpwXgTKTANB2XiY0KnveSR25lDJvZw65JEVntwz9-UF1ltUsPADSFnGWN3aJ_xtnGW6DM_enh-08AeOXsFK8FDS69D51c4aiyKAjwI'); background-size: cover;">
</div>
<div class="flex flex-col overflow-hidden">
<p class="text-sm font-semibold text-text-main dark:text-white truncate">Admin User</p>
<p class="text-xs text-text-secondary truncate">Super Admin</p>
</div>
</div>
</div>
</aside>
<main class="flex-1 flex flex-col h-full overflow-hidden relative w-full">
<header class="h-16 flex items-center justify-between px-6 lg:px-8 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark shrink-0 z-10 sticky top-0">
<div class="flex items-center gap-2 text-sm">
<a class="text-text-secondary hover:text-primary font-medium transition-colors" href="#">Home</a>
<span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
<a class="text-text-secondary hover:text-primary font-medium transition-colors" href="#">Tenants</a>
<span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
<span class="text-text-main dark:text-white font-semibold">Warung Makmur Jaya</span>
</div>
<div class="flex items-center gap-3 lg:hidden">
<button class="text-text-secondary hover:text-primary">
<span class="material-symbols-outlined">menu</span>
</button>
</div>
</header>
<div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-8">
<div class="max-w-[1100px] mx-auto flex flex-col gap-6">
<section class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-soft overflow-hidden">
<div class="h-24 bg-gradient-to-r from-slate-100 to-blue-50/50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800"></div>
<div class="px-6 pb-6 lg:px-8">
<div class="relative flex flex-col lg:flex-row gap-6 items-start -mt-10">
<div class="shrink-0 relative">
<div class="w-28 h-28 rounded-xl bg-white dark:bg-slate-800 shadow-md border-2 border-white dark:border-slate-700 p-1">
<div class="w-full h-full rounded-lg bg-slate-100 dark:bg-slate-900 bg-center bg-cover" data-alt="Warung Makmur Jaya Logo" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-twq6XoEDLCFd4Jib7F8y9as0pbJpXVkY7kp_5YtHm083I8Xpo97YsWHB--vFGaQ4lnXlTDNBYBB7xKFo1TCAuUj4nVZxg-qYHEooD1IOlngn2aZ3hRF9hqdccP3xoFp51N09k05n09cdK7WBHtyj20zd61iph19sWn3wMn_M6DZ1qReOng9pzuDBXMyM3Ge6qZl7KLQTzXLa04UKZ2YHqlS9aI0noqvqC0qdKe98P81tpBhndyFdWCeXhUHWGlKL7s-qPwS6sFU');">
</div>
</div>
<div class="absolute bottom-1 right-1 translate-x-1/4 translate-y-1/4">
<span class="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-800" title="Active">
<span class="material-symbols-outlined text-white text-[12px] font-bold">check</span>
</span>
</div>
</div>
<div class="flex-1 pt-2 lg:pt-11 min-w-0">
<div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
<div>
<h1 class="text-2xl font-bold text-text-main dark:text-white leading-tight">Warung Makmur Jaya</h1>
<div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-text-secondary">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">tag</span>
                                                ID: #T-98234
                                            </span>
<span class="w-1 h-1 rounded-full bg-slate-300"></span>
<span class="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                                Active
                                            </span>
<span class="w-1 h-1 rounded-full bg-slate-300"></span>
<span>F&amp;B Business</span>
</div>
</div>
<div class="flex items-center gap-6">
<div class="flex flex-col items-start lg:items-end">
<span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Total Stores</span>
<span class="text-lg font-bold text-text-main dark:text-white">4</span>
</div>
<div class="w-px h-8 bg-border-light dark:border-border-dark hidden lg:block"></div>
<div class="flex flex-col items-start lg:items-end">
<span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Current Plan</span>
<span class="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-center">Pro Annual</span>
</div>
</div>
</div>
</div>
<div class="w-full lg:w-auto flex items-center gap-3 pt-2 lg:pt-11">
<button class="flex-1 lg:flex-none h-9 px-4 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-main dark:text-white text-sm font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">edit</span>
<span>Edit</span>
</button>
<button class="flex-1 lg:flex-none h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">login</span>
<span>Login as Tenant</span>
</button>
</div>
</div>
</div>
<div class="mt-2 px-6 lg:px-8 border-t border-border-light dark:border-border-dark">
<div class="flex overflow-x-auto gap-8 no-scrollbar scroll-smooth">
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Profile</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-bold text-primary tracking-wide">Subscription</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-primary"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Active Addons</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Reward Points</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Users</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Stores</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
</div>
</div>
</section>
<section class="flex flex-col gap-6">
<div class="flex items-center justify-between">
<h2 class="text-lg font-bold text-text-main dark:text-white">Subscription Management</h2>
<div class="flex items-center gap-2">
<span class="relative flex h-2.5 w-2.5">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
</span>
<span class="text-sm font-medium text-text-secondary">System Status: Operational</span>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-card overflow-hidden">
<div class="p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
<div class="flex-1 lg:max-w-md">
<div class="flex items-start gap-4 mb-6">
<div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-primary shrink-0 shadow-sm">
<span class="material-symbols-outlined text-[32px]">workspace_premium</span>
</div>
<div>
<div class="flex items-center gap-3 mb-1">
<h3 class="text-xl font-bold text-text-main dark:text-white">Pro Annual Plan</h3>
<span class="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                Active
                                            </span>
</div>
<p class="text-text-secondary text-sm leading-relaxed">Includes unlimited stores, advanced analytics, priority support, and custom API access.</p>
</div>
</div>
<div class="p-4 bg-background-light dark:bg-background-dark/50 rounded-lg border border-border-light dark:border-border-dark/50 flex items-center justify-between">
<div>
<span class="text-xs uppercase font-semibold text-text-secondary block mb-1">Recurring Payment</span>
<div class="flex items-baseline gap-1">
<span class="text-2xl font-bold text-text-main dark:text-white">Rp 2.499.000</span>
<span class="text-sm text-text-secondary font-medium">/ year</span>
</div>
</div>
<span class="h-10 w-px bg-border-light dark:border-border-dark mx-2"></span>
<div class="text-right">
<span class="text-xs uppercase font-semibold text-text-secondary block mb-1">Next Billing</span>
<span class="text-sm font-bold text-text-main dark:text-white">12 Jan 2024</span>
</div>
</div>
</div>
<div class="w-px bg-border-light dark:border-border-dark hidden lg:block"></div>
<div class="flex-1 flex flex-col justify-between gap-6">
<div class="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
<div>
<p class="text-xs font-semibold text-text-secondary uppercase mb-1.5">Start Date</p>
<p class="font-semibold text-text-main dark:text-white flex items-center gap-2">
<span class="material-symbols-outlined text-text-secondary text-[18px]">calendar_today</span>
                                            12 Jan 2023
                                        </p>
</div>
<div>
<p class="text-xs font-semibold text-text-secondary uppercase mb-1.5">Billing Cycle</p>
<p class="font-semibold text-text-main dark:text-white flex items-center gap-2">
<span class="material-symbols-outlined text-text-secondary text-[18px]">update</span>
                                            Yearly (Auto-renew)
                                        </p>
</div>
<div>
<p class="text-xs font-semibold text-text-secondary uppercase mb-1.5">Payment Method</p>
<div class="flex items-center gap-2 font-semibold text-text-main dark:text-white">
<div class="w-8 h-5 bg-slate-100 border border-slate-200 rounded px-1 flex items-center justify-center">
<span class="text-[10px] font-bold text-slate-600">VISA</span>
</div>
                                            •••• 4242
                                        </div>
</div>
<div>
<p class="text-xs font-semibold text-text-secondary uppercase mb-1.5">Days Remaining</p>
<div class="flex items-center gap-2">
<span class="font-semibold text-text-main dark:text-white">142 Days</span>
<div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
<div class="h-full bg-primary w-[65%] rounded-full"></div>
</div>
</div>
</div>
</div>
<div class="flex items-end justify-end mt-auto">
</div>
</div>
</div>
<div class="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
<div class="text-sm text-text-secondary flex items-center gap-2">
<span class="material-symbols-outlined text-[18px] text-primary">info</span>
<span>Plan renews automatically on <span class="font-semibold text-text-main dark:text-white">12 Jan 2024</span></span>
</div>
<div class="flex items-center gap-3 w-full sm:w-auto">
<button class="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-secondary dark:text-slate-300 text-sm font-medium hover:bg-white hover:text-text-main dark:hover:bg-slate-700 dark:hover:text-white hover:shadow-sm transition-all bg-transparent">
                                    Cancel Subscription
                                </button>
<button class="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-main dark:text-white text-sm font-medium hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all bg-transparent">
                                    Downgrade
                                </button>
<button class="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">upgrade</span>
                                    Upgrade Plan
                                </button>
</div>
</div>
</div>
<div class="flex flex-col gap-4">
<div class="flex items-center justify-between">
<h3 class="text-lg font-bold text-text-main dark:text-white">Billing History</h3>
<button class="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
                                View all invoices
                                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-card overflow-hidden">
<div class="overflow-x-auto">
<table class="w-full text-sm text-left">
<thead class="text-xs text-text-secondary uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-border-light dark:border-border-dark">
<tr>
<th class="px-6 py-4 font-semibold whitespace-nowrap">Invoice ID</th>
<th class="px-6 py-4 font-semibold whitespace-nowrap">Billing Date</th>
<th class="px-6 py-4 font-semibold whitespace-nowrap">Plan Name</th>
<th class="px-6 py-4 font-semibold whitespace-nowrap">Amount</th>
<th class="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
<th class="px-6 py-4 font-semibold text-right whitespace-nowrap">Action</th>
</tr>
</thead>
<tbody class="divide-y divide-border-light dark:divide-border-dark">
<tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
<td class="px-6 py-4 font-medium text-text-main dark:text-white">
                                                INV-2023-001
                                            </td>
<td class="px-6 py-4 text-text-secondary">
                                                12 Jan 2023
                                            </td>
<td class="px-6 py-4 text-text-main dark:text-white font-medium">
                                                Pro Annual Plan
                                            </td>
<td class="px-6 py-4 text-text-main dark:text-white">
                                                Rp 2.499.000
                                            </td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30">
<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Paid
                                                </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-text-secondary hover:text-primary transition-colors inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Download PDF">
<span class="material-symbols-outlined text-[20px]">download</span>
</button>
</td>
</tr>
<tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
<td class="px-6 py-4 font-medium text-text-main dark:text-white">
                                                INV-2022-045
                                            </td>
<td class="px-6 py-4 text-text-secondary">
                                                12 Jan 2022
                                            </td>
<td class="px-6 py-4 text-text-main dark:text-white font-medium">
                                                Starter Annual
                                            </td>
<td class="px-6 py-4 text-text-main dark:text-white">
                                                Rp 1.200.000
                                            </td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30">
<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Paid
                                                </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-text-secondary hover:text-primary transition-colors inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Download PDF">
<span class="material-symbols-outlined text-[20px]">download</span>
</button>
</td>
</tr>
<tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
<td class="px-6 py-4 font-medium text-text-main dark:text-white">
                                                INV-2021-012
                                            </td>
<td class="px-6 py-4 text-text-secondary">
                                                12 Jan 2021
                                            </td>
<td class="px-6 py-4 text-text-main dark:text-white font-medium">
                                                Starter Monthly
                                            </td>
<td class="px-6 py-4 text-text-main dark:text-white">
                                                Rp 120.000
                                            </td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
<span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                                    Archived
                                                </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-text-secondary hover:text-primary transition-colors inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Download PDF">
<span class="material-symbols-outlined text-[20px]">download</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<div class="px-6 py-4 border-t border-border-light dark:border-border-dark flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
<span class="text-xs text-text-secondary">Showing 3 of 12 invoices</span>
<div class="flex gap-2">
<button class="w-8 h-8 flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50" disabled="">
<span class="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
<button class="w-8 h-8 flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
<span class="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
</section>
</div>
</div>
</main>

</body></html>

tab addons 

<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Tenant Detail - Active Addons - Warungin</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#2b7cee",
                        "primary-dark": "#1a5bb8",
                        "background-light": "#f8faff", 
                        "background-dark": "#101822",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1e293b",
                        "border-light": "#e2e8f0",
                        "border-dark": "#334155",
                        "text-main": "#0d131b",
                        "text-secondary": "#4c6c9a",
                        "accent-silver": "#e7ecf3",
                        "accent-blue-soft": "#eef4fd",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                    boxShadow: {
                        'soft': '0 2px 8px -2px rgba(43, 124, 238, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.02)',
                        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                        'glow': '0 0 15px rgba(43, 124, 238, 0.15)',
                    }
                },
            },
        }
    </script>
<style>::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white antialiased h-screen overflow-hidden flex">
<aside class="hidden lg:flex w-[260px] flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-full shrink-0 z-20 transition-all">
<div class="h-16 flex items-center px-6 border-b border-transparent">
<div class="flex items-center gap-3">
<div class="bg-primary/10 rounded-lg p-1.5 flex items-center justify-center">
<span class="material-symbols-outlined text-primary" style="font-size: 24px;">grid_view</span>
</div>
<div class="flex flex-col">
<h1 class="text-text-main dark:text-white text-base font-bold leading-none tracking-tight">Warungin</h1>
<p class="text-text-secondary text-xs font-medium mt-1">Admin Panel</p>
</div>
</div>
</div>
<nav class="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">dashboard</span>
<span class="text-sm font-medium leading-normal">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors" href="#">
<span class="material-symbols-outlined fill-current" style="font-size: 22px; font-variation-settings: 'FILL' 1;">storefront</span>
<span class="text-sm font-bold leading-normal">Tenants</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">receipt_long</span>
<span class="text-sm font-medium leading-normal">Billing</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">bar_chart</span>
<span class="text-sm font-medium leading-normal">Reports</span>
</a>
<div class="my-2 border-t border-border-light dark:border-border-dark opacity-50"></div>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">group</span>
<span class="text-sm font-medium leading-normal">User Management</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">settings</span>
<span class="text-sm font-medium leading-normal">Settings</span>
</a>
</nav>
<div class="p-4 border-t border-border-light dark:border-border-dark">
<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-accent-silver/30 cursor-pointer transition-colors">
<div class="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center overflow-hidden border border-white shadow-sm" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKVAattgmkB7nefe7MVfSnpwbB8l7M-6jdk90DAcfeQlDuzXMMIZ_VAXM-H-J3Maa-HL5DjPHD3SZy_flv45LqNZOwstgfHvLFwW6i1uztx7bGy6QyyZMqdU-L5Mgxa16tqkMbyjLcTE-txUemG_rYiyeIKnhHv-o_LNzQ6BpwXgTKTANB2XiY0KnveSR25lDJvZw65JEVntwz9-UF1ltUsPADSFnGWN3aJ_xtnGW6DM_enh-08AeOXsFK8FDS69D51c4aiyKAjwI'); background-size: cover;">
</div>
<div class="flex flex-col overflow-hidden">
<p class="text-sm font-semibold text-text-main dark:text-white truncate">Admin User</p>
<p class="text-xs text-text-secondary truncate">Super Admin</p>
</div>
</div>
</div>
</aside>
<main class="flex-1 flex flex-col h-full overflow-hidden relative w-full">
<header class="h-16 flex items-center justify-between px-6 lg:px-8 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark shrink-0 z-10 sticky top-0">
<div class="flex items-center gap-2 text-sm">
<a class="text-text-secondary hover:text-primary font-medium transition-colors" href="#">Home</a>
<span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
<a class="text-text-secondary hover:text-primary font-medium transition-colors" href="#">Tenants</a>
<span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
<span class="text-text-main dark:text-white font-semibold">Warung Makmur Jaya</span>
</div>
<div class="flex items-center gap-3 lg:hidden">
<button class="text-text-secondary hover:text-primary">
<span class="material-symbols-outlined">menu</span>
</button>
</div>
</header>
<div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-8">
<div class="max-w-[1100px] mx-auto flex flex-col gap-6">
<section class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-soft overflow-hidden">
<div class="h-24 bg-gradient-to-r from-slate-100 to-blue-50/50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800"></div>
<div class="px-6 pb-6 lg:px-8">
<div class="relative flex flex-col lg:flex-row gap-6 items-start -mt-10">
<div class="shrink-0 relative">
<div class="w-28 h-28 rounded-xl bg-white dark:bg-slate-800 shadow-md border-2 border-white dark:border-slate-700 p-1">
<div class="w-full h-full rounded-lg bg-slate-100 dark:bg-slate-900 bg-center bg-cover" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-twq6XoEDLCFd4Jib7F8y9as0pbJpXVkY7kp_5YtHm083I8Xpo97YsWHB--vFGaQ4lnXlTDNBYBB7xKFo1TCAuUj4nVZxg-qYHEooD1IOlngn2aZ3hRF9hqdccP3xoFp51N09k05n09cdK7WBHtyj20zd61iph19sWn3wMn_M6DZ1qReOng9pzuDBXMyM3Ge6qZl7KLQTzXLa04UKZ2YHqlS9aI0noqvqC0qdKe98P81tpBhndyFdWCeXhUHWGlKL7s-qPwS6sFU');">
</div>
</div>
<div class="absolute bottom-1 right-1 translate-x-1/4 translate-y-1/4">
<span class="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-800" title="Active">
<span class="material-symbols-outlined text-white text-[12px] font-bold">check</span>
</span>
</div>
</div>
<div class="flex-1 pt-2 lg:pt-11 min-w-0">
<div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
<div>
<h1 class="text-2xl font-bold text-text-main dark:text-white leading-tight">Warung Makmur Jaya</h1>
<div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-text-secondary">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">tag</span>
                                                ID: #T-98234
                                            </span>
<span class="w-1 h-1 rounded-full bg-slate-300"></span>
<span class="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                                Active
                                            </span>
<span class="w-1 h-1 rounded-full bg-slate-300"></span>
<span>F&amp;B Business</span>
</div>
</div>
<div class="flex items-center gap-6">
<div class="flex flex-col items-start lg:items-end">
<span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Total Stores</span>
<span class="text-lg font-bold text-text-main dark:text-white">4</span>
</div>
<div class="w-px h-8 bg-border-light dark:border-border-dark hidden lg:block"></div>
<div class="flex flex-col items-start lg:items-end">
<span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Current Plan</span>
<span class="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-center">Pro Annual</span>
</div>
</div>
</div>
</div>
<div class="w-full lg:w-auto flex items-center gap-3 pt-2 lg:pt-11">
<button class="flex-1 lg:flex-none h-9 px-4 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-main dark:text-white text-sm font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">edit</span>
<span>Edit</span>
</button>
<button class="flex-1 lg:flex-none h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">login</span>
<span>Login as Tenant</span>
</button>
</div>
</div>
</div>
<div class="mt-2 px-6 lg:px-8 border-t border-border-light dark:border-border-dark">
<div class="flex overflow-x-auto gap-8 no-scrollbar scroll-smooth">
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Profile</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Subscription</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-bold text-primary tracking-wide">Active Addons</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-primary"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Reward Points</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Users</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Stores</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
</div>
</div>
</section>
<section class="flex flex-col gap-6">
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<div>
<h2 class="text-lg font-bold text-text-main dark:text-white">Active Addons</h2>
<p class="text-sm text-text-secondary mt-1">Manage and configure activated premium features for this tenant.</p>
</div>
<button class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-blue-500/20">
<span class="material-symbols-outlined text-[18px]">add_circle</span>
                            Add New Addon
                        </button>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<div class="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-card hover:shadow-soft transition-all relative group overflow-hidden flex flex-col h-full">
<div class="absolute top-0 left-0 w-1 h-full bg-primary/80 group-hover:bg-primary transition-colors"></div>
<div class="flex justify-between items-start mb-4 pl-3">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[24px]">inventory_2</span>
</div>
<div>
<h3 class="font-bold text-text-main dark:text-white leading-tight">Inventory Pro</h3>
<div class="flex items-center gap-1.5 mt-1">
<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
<span class="text-xs text-text-secondary">Active</span>
</div>
</div>
</div>
<div class="relative">
<button class="text-text-secondary hover:text-text-main p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
</div>
<p class="text-sm text-text-secondary pl-3 mb-5 leading-relaxed line-clamp-3 flex-1">
                                Advanced stock tracking with low stock alerts, batch management, and supplier purchasing integration.
                            </p>
<div class="pl-3 mt-auto pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs mb-4">
<div class="text-text-secondary">
<span class="block text-[10px] uppercase tracking-wider font-semibold opacity-70">Activated</span>
<span class="font-medium text-text-main dark:text-white">15 Jan 2023</span>
</div>
<div class="text-text-secondary text-right">
<span class="block text-[10px] uppercase tracking-wider font-semibold opacity-70">Renewals</span>
<span class="font-medium text-text-main dark:text-white">Monthly</span>
</div>
</div>
<div class="pl-3 flex gap-2 mt-auto">
<button class="flex-1 py-2 px-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-text-main dark:text-white transition-colors flex items-center justify-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">settings</span>
                                    Configure
                                </button>
<button class="py-2 px-3 rounded-lg border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium transition-colors" title="Deactivate">
<span class="material-symbols-outlined text-[18px]">power_settings_new</span>
</button>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-card hover:shadow-soft transition-all relative group overflow-hidden flex flex-col h-full">
<div class="absolute top-0 left-0 w-1 h-full bg-primary/80 group-hover:bg-primary transition-colors"></div>
<div class="flex justify-between items-start mb-4 pl-3">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[24px]">soup_kitchen</span>
</div>
<div>
<h3 class="font-bold text-text-main dark:text-white leading-tight">Kitchen Display</h3>
<div class="flex items-center gap-1.5 mt-1">
<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
<span class="text-xs text-text-secondary">Active</span>
</div>
</div>
</div>
<div class="relative">
<button class="text-text-secondary hover:text-text-main p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
</div>
<p class="text-sm text-text-secondary pl-3 mb-5 leading-relaxed line-clamp-3 flex-1">
                                Digital order management system for kitchen staff. Replaces paper tickets with real-time displays.
                            </p>
<div class="pl-3 mt-auto pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs mb-4">
<div class="text-text-secondary">
<span class="block text-[10px] uppercase tracking-wider font-semibold opacity-70">Activated</span>
<span class="font-medium text-text-main dark:text-white">20 Feb 2023</span>
</div>
<div class="text-text-secondary text-right">
<span class="block text-[10px] uppercase tracking-wider font-semibold opacity-70">Device Limit</span>
<span class="font-medium text-text-main dark:text-white">3 Screens</span>
</div>
</div>
<div class="pl-3 flex gap-2 mt-auto">
<button class="flex-1 py-2 px-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-text-main dark:text-white transition-colors flex items-center justify-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">settings</span>
                                    Configure
                                </button>
<button class="py-2 px-3 rounded-lg border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium transition-colors" title="Deactivate">
<span class="material-symbols-outlined text-[18px]">power_settings_new</span>
</button>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-card hover:shadow-soft transition-all relative group overflow-hidden flex flex-col h-full">
<div class="absolute top-0 left-0 w-1 h-full bg-primary/80 group-hover:bg-primary transition-colors"></div>
<div class="flex justify-between items-start mb-4 pl-3">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[24px]">loyalty</span>
</div>
<div>
<h3 class="font-bold text-text-main dark:text-white leading-tight">Loyalty Points</h3>
<div class="flex items-center gap-1.5 mt-1">
<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
<span class="text-xs text-text-secondary">Active</span>
</div>
</div>
</div>
<div class="relative">
<button class="text-text-secondary hover:text-text-main p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
</div>
<p class="text-sm text-text-secondary pl-3 mb-5 leading-relaxed line-clamp-3 flex-1">
                                Create and manage customer reward programs to increase retention. Includes points configuration and redemption rules.
                            </p>
<div class="pl-3 mt-auto pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs mb-4">
<div class="text-text-secondary">
<span class="block text-[10px] uppercase tracking-wider font-semibold opacity-70">Activated</span>
<span class="font-medium text-text-main dark:text-white">10 Mar 2023</span>
</div>
<div class="text-text-secondary text-right">
<span class="block text-[10px] uppercase tracking-wider font-semibold opacity-70">Members</span>
<span class="font-medium text-text-main dark:text-white">1,240</span>
</div>
</div>
<div class="pl-3 flex gap-2 mt-auto">
<button class="flex-1 py-2 px-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-text-main dark:text-white transition-colors flex items-center justify-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">settings</span>
                                    Configure
                                </button>
<button class="py-2 px-3 rounded-lg border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium transition-colors" title="Deactivate">
<span class="material-symbols-outlined text-[18px]">power_settings_new</span>
</button>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-card hover:shadow-soft transition-all relative group overflow-hidden flex flex-col h-full">
<div class="absolute top-0 left-0 w-1 h-full bg-primary/80 group-hover:bg-primary transition-colors"></div>
<div class="flex justify-between items-start mb-4 pl-3">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[24px]">account_balance</span>
</div>
<div>
<h3 class="font-bold text-text-main dark:text-white leading-tight">Accounting Sync</h3>
<div class="flex items-center gap-1.5 mt-1">
<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
<span class="text-xs text-text-secondary">Active</span>
</div>
</div>
</div>
<div class="relative">
<button class="text-text-secondary hover:text-text-main p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
</div>
<p class="text-sm text-text-secondary pl-3 mb-5 leading-relaxed line-clamp-3 flex-1">
                                Seamlessly sync sales and inventory data with major accounting platforms like Jurnal, Xero, and QuickBooks.
                            </p>
<div class="pl-3 mt-auto pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs mb-4">
<div class="text-text-secondary">
<span class="block text-[10px] uppercase tracking-wider font-semibold opacity-70">Activated</span>
<span class="font-medium text-text-main dark:text-white">05 Apr 2023</span>
</div>
<div class="text-text-secondary text-right">
<span class="block text-[10px] uppercase tracking-wider font-semibold opacity-70">Sync Status</span>
<span class="font-medium text-green-600 dark:text-green-400">Healthy</span>
</div>
</div>
<div class="pl-3 flex gap-2 mt-auto">
<button class="flex-1 py-2 px-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-text-main dark:text-white transition-colors flex items-center justify-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">settings</span>
                                    Configure
                                </button>
<button class="py-2 px-3 rounded-lg border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium transition-colors" title="Deactivate">
<span class="material-symbols-outlined text-[18px]">power_settings_new</span>
</button>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-card hover:shadow-soft transition-all relative group overflow-hidden flex flex-col h-full">
<div class="absolute top-0 left-0 w-1 h-full bg-primary/80 group-hover:bg-primary transition-colors"></div>
<div class="flex justify-between items-start mb-4 pl-3">
<div class="flex items-center gap-3">
<div class="w-12 h-12 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[24px]">shopping_bag</span>
</div>
<div>
<h3 class="font-bold text-text-main dark:text-white leading-tight">Online Store</h3>
<div class="flex items-center gap-1.5 mt-1">
<span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
<span class="text-xs text-text-secondary">Active</span>
</div>
</div>
</div>
<div class="relative">
<button class="text-text-secondary hover:text-text-main p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
</div>
<p class="text-sm text-text-secondary pl-3 mb-5 leading-relaxed line-clamp-3 flex-1">
                                A dedicated website for customers to browse menu and order online for pickup or delivery.
                            </p>
<div class="pl-3 mt-auto pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs mb-4">
<div class="text-text-secondary">
<span class="block text-[10px] uppercase tracking-wider font-semibold opacity-70">Activated</span>
<span class="font-medium text-text-main dark:text-white">12 May 2023</span>
</div>
<div class="text-text-secondary text-right">
<span class="block text-[10px] uppercase tracking-wider font-semibold opacity-70">Domain</span>
<span class="font-medium text-primary cursor-pointer hover:underline">makmurjaya.com</span>
</div>
</div>
<div class="pl-3 flex gap-2 mt-auto">
<button class="flex-1 py-2 px-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-text-main dark:text-white transition-colors flex items-center justify-center gap-1.5">
<span class="material-symbols-outlined text-[16px]">settings</span>
                                    Configure
                                </button>
<button class="py-2 px-3 rounded-lg border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium transition-colors" title="Deactivate">
<span class="material-symbols-outlined text-[18px]">power_settings_new</span>
</button>
</div>
</div>
</div>
</section>
</div>
</div>
</main>

</body></html>

tab reward point 
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Tenant Detail - Reward Points - Warungin</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#2b7cee",
                        "primary-dark": "#1a5bb8",
                        "background-light": "#f8faff", 
                        "background-dark": "#101822",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1e293b",
                        "border-light": "#e2e8f0",
                        "border-dark": "#334155",
                        "text-main": "#0d131b",
                        "text-secondary": "#4c6c9a",
                        "accent-silver": "#e7ecf3",
                        "royal-blue": "#4169E1",
                        "gold": "#FFD700",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                    boxShadow: {
                        'soft': '0 2px 8px -2px rgba(43, 124, 238, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.02)',
                        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                    }
                },
            },
        }
    </script>
<style>::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white antialiased h-screen overflow-hidden flex">
<aside class="hidden lg:flex w-[260px] flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-full shrink-0 z-20 transition-all">
<div class="h-16 flex items-center px-6 border-b border-transparent">
<div class="flex items-center gap-3">
<div class="bg-primary/10 rounded-lg p-1.5 flex items-center justify-center">
<span class="material-symbols-outlined text-primary" style="font-size: 24px;">grid_view</span>
</div>
<div class="flex flex-col">
<h1 class="text-text-main dark:text-white text-base font-bold leading-none tracking-tight">Warungin</h1>
<p class="text-text-secondary text-xs font-medium mt-1">Admin Panel</p>
</div>
</div>
</div>
<nav class="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">dashboard</span>
<span class="text-sm font-medium leading-normal">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors" href="#">
<span class="material-symbols-outlined fill-current" style="font-size: 22px; font-variation-settings: 'FILL' 1;">storefront</span>
<span class="text-sm font-bold leading-normal">Tenants</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">receipt_long</span>
<span class="text-sm font-medium leading-normal">Billing</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">bar_chart</span>
<span class="text-sm font-medium leading-normal">Reports</span>
</a>
<div class="my-2 border-t border-border-light dark:border-border-dark opacity-50"></div>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">group</span>
<span class="text-sm font-medium leading-normal">User Management</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">settings</span>
<span class="text-sm font-medium leading-normal">Settings</span>
</a>
</nav>
<div class="p-4 border-t border-border-light dark:border-border-dark">
<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-accent-silver/30 cursor-pointer transition-colors">
<div class="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center overflow-hidden border border-white shadow-sm" data-alt="User avatar placeholder" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKVAattgmkB7nefe7MVfSnpwbB8l7M-6jdk90DAcfeQlDuzXMMIZ_VAXM-H-J3Maa-HL5DjPHD3SZy_flv45LqNZOwstgfHvLFwW6i1uztx7bGy6QyyZMqdU-L5Mgxa16tqkMbyjLcTE-txUemG_rYiyeIKnhHv-o_LNzQ6BpwXgTKTANB2XiY0KnveSR25lDJvZw65JEVntwz9-UF1ltUsPADSFnGWN3aJ_xtnGW6DM_enh-08AeOXsFK8FDS69D51c4aiyKAjwI'); background-size: cover;">
</div>
<div class="flex flex-col overflow-hidden">
<p class="text-sm font-semibold text-text-main dark:text-white truncate">Admin User</p>
<p class="text-xs text-text-secondary truncate">Super Admin</p>
</div>
</div>
</div>
</aside>
<main class="flex-1 flex flex-col h-full overflow-hidden relative w-full">
<header class="h-16 flex items-center justify-between px-6 lg:px-8 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark shrink-0 z-10 sticky top-0">
<div class="flex items-center gap-2 text-sm">
<a class="text-text-secondary hover:text-primary font-medium transition-colors" href="#">Home</a>
<span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
<a class="text-text-secondary hover:text-primary font-medium transition-colors" href="#">Tenants</a>
<span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
<span class="text-text-main dark:text-white font-semibold">Warung Makmur Jaya</span>
</div>
<div class="flex items-center gap-3 lg:hidden">
<button class="text-text-secondary hover:text-primary">
<span class="material-symbols-outlined">menu</span>
</button>
</div>
</header>
<div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-8">
<div class="max-w-[1100px] mx-auto flex flex-col gap-6">
<section class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-soft overflow-hidden">
<div class="h-24 bg-gradient-to-r from-slate-100 to-blue-50/50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800"></div>
<div class="px-6 pb-6 lg:px-8">
<div class="relative flex flex-col lg:flex-row gap-6 items-start -mt-10">
<div class="shrink-0 relative">
<div class="w-28 h-28 rounded-xl bg-white dark:bg-slate-800 shadow-md border-2 border-white dark:border-slate-700 p-1">
<div class="w-full h-full rounded-lg bg-slate-100 dark:bg-slate-900 bg-center bg-cover" data-alt="Warung Makmur Jaya Logo" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-twq6XoEDLCFd4Jib7F8y9as0pbJpXVkY7kp_5YtHm083I8Xpo97YsWHB--vFGaQ4lnXlTDNBYBB7xKFo1TCAuUj4nVZxg-qYHEooD1IOlngn2aZ3hRF9hqdccP3xoFp51N09k05n09cdK7WBHtyj20zd61iph19sWn3wMn_M6DZ1qReOng9pzuDBXMyM3Ge6qZl7KLQTzXLa04UKZ2YHqlS9aI0noqvqC0qdKe98P81tpBhndyFdWCeXhUHWGlKL7s-qPwS6sFU');">
</div>
</div>
<div class="absolute bottom-1 right-1 translate-x-1/4 translate-y-1/4">
<span class="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-800" title="Active">
<span class="material-symbols-outlined text-white text-[12px] font-bold">check</span>
</span>
</div>
</div>
<div class="flex-1 pt-2 lg:pt-11 min-w-0">
<div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
<div>
<h1 class="text-2xl font-bold text-text-main dark:text-white leading-tight">Warung Makmur Jaya</h1>
<div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-text-secondary">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">tag</span>
                                                ID: #T-98234
                                            </span>
<span class="w-1 h-1 rounded-full bg-slate-300"></span>
<span class="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                                Active
                                            </span>
<span class="w-1 h-1 rounded-full bg-slate-300"></span>
<span>F&amp;B Business</span>
</div>
</div>
<div class="flex items-center gap-6">
<div class="flex flex-col items-start lg:items-end">
<span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Total Stores</span>
<span class="text-lg font-bold text-text-main dark:text-white">4</span>
</div>
<div class="w-px h-8 bg-border-light dark:border-border-dark hidden lg:block"></div>
<div class="flex flex-col items-start lg:items-end">
<span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Current Plan</span>
<span class="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-center">Pro Annual</span>
</div>
</div>
</div>
</div>
<div class="w-full lg:w-auto flex items-center gap-3 pt-2 lg:pt-11">
<button class="flex-1 lg:flex-none h-9 px-4 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-main dark:text-white text-sm font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">edit</span>
<span>Edit</span>
</button>
<button class="flex-1 lg:flex-none h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">login</span>
<span>Login as Tenant</span>
</button>
</div>
</div>
</div>
<div class="mt-2 px-6 lg:px-8 border-t border-border-light dark:border-border-dark">
<div class="flex overflow-x-auto gap-8 no-scrollbar scroll-smooth">
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Profile</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Subscription</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Active Addons</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-bold text-primary tracking-wide">Reward Points</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-primary"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Users</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Stores</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
</div>
</div>
</section>
<section class="flex flex-col gap-6">
<div class="flex items-center justify-between">
<h2 class="text-lg font-bold text-text-main dark:text-white">Loyalty &amp; Rewards</h2>
<div class="flex gap-3">
<button class="h-9 px-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-text-secondary hover:text-text-main text-sm font-medium shadow-sm flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">download</span>
                                Export History
                            </button>
<button class="h-9 px-3 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium shadow-sm flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">add_circle</span>
                                Adjust Points
                            </button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-card relative overflow-hidden">
<div class="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-sm font-medium text-text-secondary">Total Reward Points</p>
<h3 class="text-3xl font-bold text-text-main dark:text-white mt-1">2,450</h3>
</div>
<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">stars</span>
</div>
</div>
<div class="flex items-center gap-2 text-xs">
<span class="text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded font-medium">+150</span>
<span class="text-text-secondary">this month</span>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-card relative overflow-hidden">
<div class="absolute -right-6 -top-6 w-24 h-24 bg-yellow-400/5 rounded-full blur-2xl"></div>
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-sm font-medium text-text-secondary">Loyalty Tier</p>
<h3 class="text-3xl font-bold text-text-main dark:text-white mt-1">Gold</h3>
</div>
<div class="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
<span class="material-symbols-outlined">workspace_premium</span>
</div>
</div>
<div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2">
<div class="bg-yellow-400 h-1.5 rounded-full" style="width: 75%"></div>
</div>
<div class="flex justify-between text-xs text-text-secondary">
<span>75% to Platinum</span>
<span>550 pts needed</span>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-card relative overflow-hidden">
<div class="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-sm font-medium text-text-secondary">Lifetime Redeemed</p>
<h3 class="text-3xl font-bold text-text-main dark:text-white mt-1">1,200</h3>
</div>
<div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
<span class="material-symbols-outlined">shopping_bag</span>
</div>
</div>
<div class="flex items-center gap-2 text-xs">
<span class="text-text-secondary">Last redemption: </span>
<span class="font-medium text-text-main dark:text-white">12 Dec 2023</span>
</div>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-card overflow-hidden">
<div class="px-6 py-4 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<h3 class="font-bold text-text-main dark:text-white">Points History</h3>
<div class="flex gap-2">
<div class="relative">
<span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
<input class="pl-9 pr-3 py-1.5 text-sm bg-background-light dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none text-text-main dark:text-white w-full sm:w-48 placeholder:text-slate-400" placeholder="Search history..." type="text"/>
</div>
<select class="px-3 py-1.5 text-sm bg-background-light dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none text-text-main dark:text-white cursor-pointer">
<option>All Types</option>
<option>Earned</option>
<option>Redeemed</option>
<option>Expired</option>
</select>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left text-sm text-text-main dark:text-white">
<thead class="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-text-secondary font-semibold">
<tr>
<th class="px-6 py-3">Date</th>
<th class="px-6 py-3">Description</th>
<th class="px-6 py-3">Type</th>
<th class="px-6 py-3 text-right">Points</th>
<th class="px-6 py-3 text-right">Balance</th>
</tr>
</thead>
<tbody class="divide-y divide-border-light dark:divide-border-dark">
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-text-secondary">Oct 24, 2023</td>
<td class="px-6 py-4 font-medium">Monthly Subscription Renewal (Pro)</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                                            Earned
                                        </span>
</td>
<td class="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">+100</td>
<td class="px-6 py-4 text-right font-medium text-text-secondary">2,450</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-text-secondary">Oct 10, 2023</td>
<td class="px-6 py-4 font-medium">Add-on Purchase: Inventory Module</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                                            Earned
                                        </span>
</td>
<td class="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">+50</td>
<td class="px-6 py-4 text-right font-medium text-text-secondary">2,350</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-text-secondary">Sep 28, 2023</td>
<td class="px-6 py-4 font-medium">Redeemed for Discount Voucher</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-900/20 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                                            Redeemed
                                        </span>
</td>
<td class="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">-200</td>
<td class="px-6 py-4 text-right font-medium text-text-secondary">2,300</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-text-secondary">Sep 24, 2023</td>
<td class="px-6 py-4 font-medium">Monthly Subscription Renewal (Pro)</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                                            Earned
                                        </span>
</td>
<td class="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">+100</td>
<td class="px-6 py-4 text-right font-medium text-text-secondary">2,500</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-text-secondary">Aug 24, 2023</td>
<td class="px-6 py-4 font-medium">Monthly Subscription Renewal (Pro)</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                                            Earned
                                        </span>
</td>
<td class="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">+100</td>
<td class="px-6 py-4 text-right font-medium text-text-secondary">2,400</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-text-secondary">Jul 15, 2023</td>
<td class="px-6 py-4 font-medium">Referral Bonus - New Tenant Signup</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1 rounded-full bg-royal-blue/10 px-2 py-0.5 text-xs font-medium text-royal-blue border border-royal-blue/20">
                                            Bonus
                                        </span>
</td>
<td class="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">+500</td>
<td class="px-6 py-4 text-right font-medium text-text-secondary">2,300</td>
</tr>
</tbody>
</table>
</div>
<div class="px-6 py-4 border-t border-border-light dark:border-border-dark flex items-center justify-between">
<span class="text-sm text-text-secondary">Showing 1-6 of 24 records</span>
<div class="flex gap-2">
<button class="w-8 h-8 flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-text-secondary hover:bg-slate-50 hover:text-text-main transition-colors disabled:opacity-50" disabled="">
<span class="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
<button class="w-8 h-8 flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-text-secondary hover:bg-slate-50 hover:text-text-main transition-colors">
<span class="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
</div>
</div>
</div>
</section>
</div>
</div>
</main>
</body></html>

tab user 
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Tenant Detail - Reward Points - Warungin</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#2b7cee",
                        "primary-dark": "#1a5bb8",
                        "background-light": "#f8faff", 
                        "background-dark": "#101822",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1e293b",
                        "border-light": "#e2e8f0",
                        "border-dark": "#334155",
                        "text-main": "#0d131b",
                        "text-secondary": "#4c6c9a",
                        "accent-silver": "#e7ecf3",
                        "royal-blue": "#4169E1",
                        "gold": "#FFD700",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                    boxShadow: {
                        'soft': '0 2px 8px -2px rgba(43, 124, 238, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.02)',
                        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                    }
                },
            },
        }
    </script>
<style>::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white antialiased h-screen overflow-hidden flex">
<aside class="hidden lg:flex w-[260px] flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-full shrink-0 z-20 transition-all">
<div class="h-16 flex items-center px-6 border-b border-transparent">
<div class="flex items-center gap-3">
<div class="bg-primary/10 rounded-lg p-1.5 flex items-center justify-center">
<span class="material-symbols-outlined text-primary" style="font-size: 24px;">grid_view</span>
</div>
<div class="flex flex-col">
<h1 class="text-text-main dark:text-white text-base font-bold leading-none tracking-tight">Warungin</h1>
<p class="text-text-secondary text-xs font-medium mt-1">Admin Panel</p>
</div>
</div>
</div>
<nav class="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">dashboard</span>
<span class="text-sm font-medium leading-normal">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors" href="#">
<span class="material-symbols-outlined fill-current" style="font-size: 22px; font-variation-settings: 'FILL' 1;">storefront</span>
<span class="text-sm font-bold leading-normal">Tenants</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">receipt_long</span>
<span class="text-sm font-medium leading-normal">Billing</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">bar_chart</span>
<span class="text-sm font-medium leading-normal">Reports</span>
</a>
<div class="my-2 border-t border-border-light dark:border-border-dark opacity-50"></div>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">group</span>
<span class="text-sm font-medium leading-normal">User Management</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">settings</span>
<span class="text-sm font-medium leading-normal">Settings</span>
</a>
</nav>
<div class="p-4 border-t border-border-light dark:border-border-dark">
<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-accent-silver/30 cursor-pointer transition-colors">
<div class="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center overflow-hidden border border-white shadow-sm" data-alt="User avatar placeholder" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKVAattgmkB7nefe7MVfSnpwbB8l7M-6jdk90DAcfeQlDuzXMMIZ_VAXM-H-J3Maa-HL5DjPHD3SZy_flv45LqNZOwstgfHvLFwW6i1uztx7bGy6QyyZMqdU-L5Mgxa16tqkMbyjLcTE-txUemG_rYiyeIKnhHv-o_LNzQ6BpwXgTKTANB2XiY0KnveSR25lDJvZw65JEVntwz9-UF1ltUsPADSFnGWN3aJ_xtnGW6DM_enh-08AeOXsFK8FDS69D51c4aiyKAjwI'); background-size: cover;">
</div>
<div class="flex flex-col overflow-hidden">
<p class="text-sm font-semibold text-text-main dark:text-white truncate">Admin User</p>
<p class="text-xs text-text-secondary truncate">Super Admin</p>
</div>
</div>
</div>
</aside>
<main class="flex-1 flex flex-col h-full overflow-hidden relative w-full">
<header class="h-16 flex items-center justify-between px-6 lg:px-8 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark shrink-0 z-10 sticky top-0">
<div class="flex items-center gap-2 text-sm">
<a class="text-text-secondary hover:text-primary font-medium transition-colors" href="#">Home</a>
<span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
<a class="text-text-secondary hover:text-primary font-medium transition-colors" href="#">Tenants</a>
<span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
<span class="text-text-main dark:text-white font-semibold">Warung Makmur Jaya</span>
</div>
<div class="flex items-center gap-3 lg:hidden">
<button class="text-text-secondary hover:text-primary">
<span class="material-symbols-outlined">menu</span>
</button>
</div>
</header>
<div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-8">
<div class="max-w-[1100px] mx-auto flex flex-col gap-6">
<section class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-soft overflow-hidden">
<div class="h-24 bg-gradient-to-r from-slate-100 to-blue-50/50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800"></div>
<div class="px-6 pb-6 lg:px-8">
<div class="relative flex flex-col lg:flex-row gap-6 items-start -mt-10">
<div class="shrink-0 relative">
<div class="w-28 h-28 rounded-xl bg-white dark:bg-slate-800 shadow-md border-2 border-white dark:border-slate-700 p-1">
<div class="w-full h-full rounded-lg bg-slate-100 dark:bg-slate-900 bg-center bg-cover" data-alt="Warung Makmur Jaya Logo" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-twq6XoEDLCFd4Jib7F8y9as0pbJpXVkY7kp_5YtHm083I8Xpo97YsWHB--vFGaQ4lnXlTDNBYBB7xKFo1TCAuUj4nVZxg-qYHEooD1IOlngn2aZ3hRF9hqdccP3xoFp51N09k05n09cdK7WBHtyj20zd61iph19sWn3wMn_M6DZ1qReOng9pzuDBXMyM3Ge6qZl7KLQTzXLa04UKZ2YHqlS9aI0noqvqC0qdKe98P81tpBhndyFdWCeXhUHWGlKL7s-qPwS6sFU');">
</div>
</div>
<div class="absolute bottom-1 right-1 translate-x-1/4 translate-y-1/4">
<span class="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-800" title="Active">
<span class="material-symbols-outlined text-white text-[12px] font-bold">check</span>
</span>
</div>
</div>
<div class="flex-1 pt-2 lg:pt-11 min-w-0">
<div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
<div>
<h1 class="text-2xl font-bold text-text-main dark:text-white leading-tight">Warung Makmur Jaya</h1>
<div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-text-secondary">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">tag</span>
                                                ID: #T-98234
                                            </span>
<span class="w-1 h-1 rounded-full bg-slate-300"></span>
<span class="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                                Active
                                            </span>
<span class="w-1 h-1 rounded-full bg-slate-300"></span>
<span>F&amp;B Business</span>
</div>
</div>
<div class="flex items-center gap-6">
<div class="flex flex-col items-start lg:items-end">
<span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Total Stores</span>
<span class="text-lg font-bold text-text-main dark:text-white">4</span>
</div>
<div class="w-px h-8 bg-border-light dark:border-border-dark hidden lg:block"></div>
<div class="flex flex-col items-start lg:items-end">
<span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Current Plan</span>
<span class="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-center">Pro Annual</span>
</div>
</div>
</div>
</div>
<div class="w-full lg:w-auto flex items-center gap-3 pt-2 lg:pt-11">
<button class="flex-1 lg:flex-none h-9 px-4 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-main dark:text-white text-sm font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">edit</span>
<span>Edit</span>
</button>
<button class="flex-1 lg:flex-none h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">login</span>
<span>Login as Tenant</span>
</button>
</div>
</div>
</div>
<div class="mt-2 px-6 lg:px-8 border-t border-border-light dark:border-border-dark">
<div class="flex overflow-x-auto gap-8 no-scrollbar scroll-smooth">
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Profile</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Subscription</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Active Addons</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-bold text-primary tracking-wide">Reward Points</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-primary"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Users</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Stores</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
</div>
</div>
</section>
<section class="flex flex-col gap-6">
<div class="flex items-center justify-between">
<h2 class="text-lg font-bold text-text-main dark:text-white">Loyalty &amp; Rewards</h2>
<div class="flex gap-3">
<button class="h-9 px-3 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-text-secondary hover:text-text-main text-sm font-medium shadow-sm flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">download</span>
                                Export History
                            </button>
<button class="h-9 px-3 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium shadow-sm flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">add_circle</span>
                                Adjust Points
                            </button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-card relative overflow-hidden">
<div class="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-sm font-medium text-text-secondary">Total Reward Points</p>
<h3 class="text-3xl font-bold text-text-main dark:text-white mt-1">2,450</h3>
</div>
<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">stars</span>
</div>
</div>
<div class="flex items-center gap-2 text-xs">
<span class="text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded font-medium">+150</span>
<span class="text-text-secondary">this month</span>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-card relative overflow-hidden">
<div class="absolute -right-6 -top-6 w-24 h-24 bg-yellow-400/5 rounded-full blur-2xl"></div>
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-sm font-medium text-text-secondary">Loyalty Tier</p>
<h3 class="text-3xl font-bold text-text-main dark:text-white mt-1">Gold</h3>
</div>
<div class="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
<span class="material-symbols-outlined">workspace_premium</span>
</div>
</div>
<div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2">
<div class="bg-yellow-400 h-1.5 rounded-full" style="width: 75%"></div>
</div>
<div class="flex justify-between text-xs text-text-secondary">
<span>75% to Platinum</span>
<span>550 pts needed</span>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-card relative overflow-hidden">
<div class="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-sm font-medium text-text-secondary">Lifetime Redeemed</p>
<h3 class="text-3xl font-bold text-text-main dark:text-white mt-1">1,200</h3>
</div>
<div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
<span class="material-symbols-outlined">shopping_bag</span>
</div>
</div>
<div class="flex items-center gap-2 text-xs">
<span class="text-text-secondary">Last redemption: </span>
<span class="font-medium text-text-main dark:text-white">12 Dec 2023</span>
</div>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-card overflow-hidden">
<div class="px-6 py-4 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<h3 class="font-bold text-text-main dark:text-white">Points History</h3>
<div class="flex gap-2">
<div class="relative">
<span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
<input class="pl-9 pr-3 py-1.5 text-sm bg-background-light dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none text-text-main dark:text-white w-full sm:w-48 placeholder:text-slate-400" placeholder="Search history..." type="text"/>
</div>
<select class="px-3 py-1.5 text-sm bg-background-light dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none text-text-main dark:text-white cursor-pointer">
<option>All Types</option>
<option>Earned</option>
<option>Redeemed</option>
<option>Expired</option>
</select>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left text-sm text-text-main dark:text-white">
<thead class="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-text-secondary font-semibold">
<tr>
<th class="px-6 py-3">Date</th>
<th class="px-6 py-3">Description</th>
<th class="px-6 py-3">Type</th>
<th class="px-6 py-3 text-right">Points</th>
<th class="px-6 py-3 text-right">Balance</th>
</tr>
</thead>
<tbody class="divide-y divide-border-light dark:divide-border-dark">
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-text-secondary">Oct 24, 2023</td>
<td class="px-6 py-4 font-medium">Monthly Subscription Renewal (Pro)</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                                            Earned
                                        </span>
</td>
<td class="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">+100</td>
<td class="px-6 py-4 text-right font-medium text-text-secondary">2,450</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-text-secondary">Oct 10, 2023</td>
<td class="px-6 py-4 font-medium">Add-on Purchase: Inventory Module</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                                            Earned
                                        </span>
</td>
<td class="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">+50</td>
<td class="px-6 py-4 text-right font-medium text-text-secondary">2,350</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-text-secondary">Sep 28, 2023</td>
<td class="px-6 py-4 font-medium">Redeemed for Discount Voucher</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-900/20 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                                            Redeemed
                                        </span>
</td>
<td class="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">-200</td>
<td class="px-6 py-4 text-right font-medium text-text-secondary">2,300</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-text-secondary">Sep 24, 2023</td>
<td class="px-6 py-4 font-medium">Monthly Subscription Renewal (Pro)</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                                            Earned
                                        </span>
</td>
<td class="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">+100</td>
<td class="px-6 py-4 text-right font-medium text-text-secondary">2,500</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-text-secondary">Aug 24, 2023</td>
<td class="px-6 py-4 font-medium">Monthly Subscription Renewal (Pro)</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                                            Earned
                                        </span>
</td>
<td class="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">+100</td>
<td class="px-6 py-4 text-right font-medium text-text-secondary">2,400</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-text-secondary">Jul 15, 2023</td>
<td class="px-6 py-4 font-medium">Referral Bonus - New Tenant Signup</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1 rounded-full bg-royal-blue/10 px-2 py-0.5 text-xs font-medium text-royal-blue border border-royal-blue/20">
                                            Bonus
                                        </span>
</td>
<td class="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">+500</td>
<td class="px-6 py-4 text-right font-medium text-text-secondary">2,300</td>
</tr>
</tbody>
</table>
</div>
<div class="px-6 py-4 border-t border-border-light dark:border-border-dark flex items-center justify-between">
<span class="text-sm text-text-secondary">Showing 1-6 of 24 records</span>
<div class="flex gap-2">
<button class="w-8 h-8 flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-text-secondary hover:bg-slate-50 hover:text-text-main transition-colors disabled:opacity-50" disabled="">
<span class="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
<button class="w-8 h-8 flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-text-secondary hover:bg-slate-50 hover:text-text-main transition-colors">
<span class="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
</div>
</div>
</div>
</section>
</div>
</div>
</main>
</body></html>


tab store 
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Tenant Detail - Stores - Warungin</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#2b7cee",
                        "primary-dark": "#1a5bb8",
                        "background-light": "#f8faff", 
                        "background-dark": "#101822",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1e293b",
                        "border-light": "#e2e8f0",
                        "border-dark": "#334155",
                        "text-main": "#0d131b",
                        "text-secondary": "#4c6c9a",
                        "accent-silver": "#e7ecf3",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: { "DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
                    boxShadow: {
                        'soft': '0 2px 8px -2px rgba(43, 124, 238, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.02)',
                        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                    }
                },
            },
        }
    </script>
<style>::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white antialiased h-screen overflow-hidden flex">
<aside class="hidden lg:flex w-[260px] flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark h-full shrink-0 z-20 transition-all">
<div class="h-16 flex items-center px-6 border-b border-transparent">
<div class="flex items-center gap-3">
<div class="bg-primary/10 rounded-lg p-1.5 flex items-center justify-center">
<span class="material-symbols-outlined text-primary" style="font-size: 24px;">grid_view</span>
</div>
<div class="flex flex-col">
<h1 class="text-text-main dark:text-white text-base font-bold leading-none tracking-tight">Warungin</h1>
<p class="text-text-secondary text-xs font-medium mt-1">Admin Panel</p>
</div>
</div>
</div>
<nav class="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">dashboard</span>
<span class="text-sm font-medium leading-normal">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-colors" href="#">
<span class="material-symbols-outlined fill-current" style="font-size: 22px; font-variation-settings: 'FILL' 1;">storefront</span>
<span class="text-sm font-bold leading-normal">Tenants</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">receipt_long</span>
<span class="text-sm font-medium leading-normal">Billing</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">bar_chart</span>
<span class="text-sm font-medium leading-normal">Reports</span>
</a>
<div class="my-2 border-t border-border-light dark:border-border-dark opacity-50"></div>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">group</span>
<span class="text-sm font-medium leading-normal">User Management</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-accent-silver/50 hover:text-text-main transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors text-slate-400" style="font-size: 22px;">settings</span>
<span class="text-sm font-medium leading-normal">Settings</span>
</a>
</nav>
<div class="p-4 border-t border-border-light dark:border-border-dark">
<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-accent-silver/30 cursor-pointer transition-colors">
<div class="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center overflow-hidden border border-white shadow-sm" data-alt="User avatar placeholder" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKVAattgmkB7nefe7MVfSnpwbB8l7M-6jdk90DAcfeQlDuzXMMIZ_VAXM-H-J3Maa-HL5DjPHD3SZy_flv45LqNZOwstgfHvLFwW6i1uztx7bGy6QyyZMqdU-L5Mgxa16tqkMbyjLcTE-txUemG_rYiyeIKnhHv-o_LNzQ6BpwXgTKTANB2XiY0KnveSR25lDJvZw65JEVntwz9-UF1ltUsPADSFnGWN3aJ_xtnGW6DM_enh-08AeOXsFK8FDS69D51c4aiyKAjwI'); background-size: cover;">
</div>
<div class="flex flex-col overflow-hidden">
<p class="text-sm font-semibold text-text-main dark:text-white truncate">Admin User</p>
<p class="text-xs text-text-secondary truncate">Super Admin</p>
</div>
</div>
</div>
</aside>
<main class="flex-1 flex flex-col h-full overflow-hidden relative w-full">
<header class="h-16 flex items-center justify-between px-6 lg:px-8 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark shrink-0 z-10 sticky top-0">
<div class="flex items-center gap-2 text-sm">
<a class="text-text-secondary hover:text-primary font-medium transition-colors" href="#">Home</a>
<span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
<a class="text-text-secondary hover:text-primary font-medium transition-colors" href="#">Tenants</a>
<span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
<span class="text-text-main dark:text-white font-semibold">Warung Makmur Jaya</span>
</div>
<div class="flex items-center gap-3 lg:hidden">
<button class="text-text-secondary hover:text-primary">
<span class="material-symbols-outlined">menu</span>
</button>
</div>
</header>
<div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-8">
<div class="max-w-[1100px] mx-auto flex flex-col gap-6">
<section class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-soft overflow-hidden">
<div class="h-24 bg-gradient-to-r from-slate-100 to-blue-50/50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800"></div>
<div class="px-6 pb-6 lg:px-8">
<div class="relative flex flex-col lg:flex-row gap-6 items-start -mt-10">
<div class="shrink-0 relative">
<div class="w-28 h-28 rounded-xl bg-white dark:bg-slate-800 shadow-md border-2 border-white dark:border-slate-700 p-1">
<div class="w-full h-full rounded-lg bg-slate-100 dark:bg-slate-900 bg-center bg-cover" data-alt="Warung Makmur Jaya Logo" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-twq6XoEDLCFd4Jib7F8y9as0pbJpXVkY7kp_5YtHm083I8Xpo97YsWHB--vFGaQ4lnXlTDNBYBB7xKFo1TCAuUj4nVZxg-qYHEooD1IOlngn2aZ3hRF9hqdccP3xoFp51N09k05n09cdK7WBHtyj20zd61iph19sWn3wMn_M6DZ1qReOng9pzuDBXMyM3Ge6qZl7KLQTzXLa04UKZ2YHqlS9aI0noqvqC0qdKe98P81tpBhndyFdWCeXhUHWGlKL7s-qPwS6sFU');">
</div>
</div>
<div class="absolute bottom-1 right-1 translate-x-1/4 translate-y-1/4">
<span class="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-800" title="Active">
<span class="material-symbols-outlined text-white text-[12px] font-bold">check</span>
</span>
</div>
</div>
<div class="flex-1 pt-2 lg:pt-11 min-w-0">
<div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
<div>
<h1 class="text-2xl font-bold text-text-main dark:text-white leading-tight">Warung Makmur Jaya</h1>
<div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-text-secondary">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">tag</span>
                                                ID: #T-98234
                                            </span>
<span class="w-1 h-1 rounded-full bg-slate-300"></span>
<span class="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                                Active
                                            </span>
<span class="w-1 h-1 rounded-full bg-slate-300"></span>
<span>F&amp;B Business</span>
</div>
</div>
<div class="flex items-center gap-6">
<div class="flex flex-col items-start lg:items-end">
<span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Total Stores</span>
<span class="text-lg font-bold text-text-main dark:text-white">4</span>
</div>
<div class="w-px h-8 bg-border-light dark:border-border-dark hidden lg:block"></div>
<div class="flex flex-col items-start lg:items-end">
<span class="text-xs font-semibold uppercase tracking-wider text-text-secondary">Current Plan</span>
<span class="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-center">Pro Annual</span>
</div>
</div>
</div>
</div>
<div class="w-full lg:w-auto flex items-center gap-3 pt-2 lg:pt-11">
<button class="flex-1 lg:flex-none h-9 px-4 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-main dark:text-white text-sm font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">edit</span>
<span>Edit</span>
</button>
<button class="flex-1 lg:flex-none h-9 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-[18px]">login</span>
<span>Login as Tenant</span>
</button>
</div>
</div>
</div>
<div class="mt-2 px-6 lg:px-8 border-t border-border-light dark:border-border-dark">
<div class="flex overflow-x-auto gap-8 no-scrollbar scroll-smooth">
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Profile</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Subscription</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Active Addons</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Reward Points</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-medium text-text-secondary group-hover:text-text-main transition-colors tracking-wide">Users</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-transparent group-hover:bg-slate-200 transition-colors"></span>
</a>
<a class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer" href="#">
<span class="text-sm font-bold text-primary tracking-wide">Stores</span>
<span class="absolute bottom-0 h-[3px] w-full rounded-t-full bg-primary"></span>
</a>
</div>
</div>
</section>
<section class="flex flex-col gap-6">
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
<div>
<h2 class="text-lg font-bold text-text-main dark:text-white">Store Management</h2>
<p class="text-sm text-text-secondary">Manage outlets, view performance, and configure settings.</p>
</div>
<div class="flex items-center gap-3">
<div class="relative hidden md:block">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
<input class="pl-10 pr-4 py-2 h-10 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-64 transition-all" placeholder="Search stores..." type="text"/>
</div>
<button class="h-10 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2">
<span class="material-symbols-outlined text-[20px]">add</span>
<span>Add New Store</span>
</button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-card overflow-hidden group hover:shadow-soft transition-all duration-300 flex flex-col h-full">
<div class="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
<div class="absolute inset-0 bg-black/10"></div>
<div class="absolute top-3 right-3">
<span class="inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-green-700 dark:text-green-400 shadow-sm">
<span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        Open
                    </span>
</div>
<div class="absolute bottom-3 left-4 right-4">
<h3 class="text-white font-bold text-lg truncate">Makmur Jaya Pusat</h3>
<p class="text-white/80 text-xs truncate flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">location_on</span>
                        Jl. Merdeka No. 45, Jakarta Selatan
                    </p>
</div>
</div>
<div class="p-5 flex-1 flex flex-col gap-4">
<div class="grid grid-cols-2 gap-y-4 gap-x-2">
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Store ID</span>
<span class="text-sm font-medium text-text-main dark:text-white">STR-001</span>
</div>
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Staff</span>
<span class="text-sm font-medium text-text-main dark:text-white">12 Employees</span>
</div>
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Devices</span>
<span class="text-sm font-medium text-text-main dark:text-white">3 Active POS</span>
</div>
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Type</span>
<span class="text-sm font-medium text-text-main dark:text-white">Flagship</span>
</div>
</div>
</div>
<div class="px-5 py-4 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/30 flex items-center gap-3">
<button class="flex-1 h-9 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-text-secondary hover:text-primary hover:border-primary/30 text-sm font-medium transition-colors">
                    Edit
                 </button>
<button class="flex-1 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold transition-colors flex items-center justify-center gap-2">
<span>View Details</span>
<span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-card overflow-hidden group hover:shadow-soft transition-all duration-300 flex flex-col h-full">
<div class="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 relative">
<div class="absolute inset-0 bg-black/10"></div>
<div class="absolute top-3 right-3">
<span class="inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-green-700 dark:text-green-400 shadow-sm">
<span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        Open
                    </span>
</div>
<div class="absolute bottom-3 left-4 right-4">
<h3 class="text-white font-bold text-lg truncate">Makmur Jaya Cabang 1</h3>
<p class="text-white/80 text-xs truncate flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">location_on</span>
                        Jl. Ahmad Yani No. 12, Bekasi
                    </p>
</div>
</div>
<div class="p-5 flex-1 flex flex-col gap-4">
<div class="grid grid-cols-2 gap-y-4 gap-x-2">
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Store ID</span>
<span class="text-sm font-medium text-text-main dark:text-white">STR-002</span>
</div>
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Staff</span>
<span class="text-sm font-medium text-text-main dark:text-white">8 Employees</span>
</div>
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Devices</span>
<span class="text-sm font-medium text-text-main dark:text-white">2 Active POS</span>
</div>
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Type</span>
<span class="text-sm font-medium text-text-main dark:text-white">Branch</span>
</div>
</div>
</div>
<div class="px-5 py-4 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/30 flex items-center gap-3">
<button class="flex-1 h-9 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-text-secondary hover:text-primary hover:border-primary/30 text-sm font-medium transition-colors">
                    Edit
                 </button>
<button class="flex-1 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold transition-colors flex items-center justify-center gap-2">
<span>View Details</span>
<span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-card overflow-hidden group hover:shadow-soft transition-all duration-300 flex flex-col h-full">
<div class="h-32 bg-gradient-to-br from-orange-400 to-red-500 relative">
<div class="absolute inset-0 bg-black/10"></div>
<div class="absolute top-3 right-3">
<span class="inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm">
<span class="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                        Closed
                    </span>
</div>
<div class="absolute bottom-3 left-4 right-4">
<h3 class="text-white font-bold text-lg truncate">Makmur Jaya Express</h3>
<p class="text-white/80 text-xs truncate flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">location_on</span>
                        Dago Atas No. 88, Bandung
                    </p>
</div>
</div>
<div class="p-5 flex-1 flex flex-col gap-4">
<div class="grid grid-cols-2 gap-y-4 gap-x-2">
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Store ID</span>
<span class="text-sm font-medium text-text-main dark:text-white">STR-003</span>
</div>
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Staff</span>
<span class="text-sm font-medium text-text-main dark:text-white">4 Employees</span>
</div>
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Devices</span>
<span class="text-sm font-medium text-text-main dark:text-white">1 Active POS</span>
</div>
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Type</span>
<span class="text-sm font-medium text-text-main dark:text-white">Cloud Kitchen</span>
</div>
</div>
</div>
<div class="px-5 py-4 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/30 flex items-center gap-3">
<button class="flex-1 h-9 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-text-secondary hover:text-primary hover:border-primary/30 text-sm font-medium transition-colors">
                    Edit
                 </button>
<button class="flex-1 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold transition-colors flex items-center justify-center gap-2">
<span>View Details</span>
<span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-card overflow-hidden group hover:shadow-soft transition-all duration-300 flex flex-col h-full">
<div class="h-32 bg-gradient-to-br from-violet-500 to-purple-600 relative">
<div class="absolute inset-0 bg-black/10"></div>
<div class="absolute top-3 right-3">
<span class="inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-green-700 dark:text-green-400 shadow-sm">
<span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        Open
                    </span>
</div>
<div class="absolute bottom-3 left-4 right-4">
<h3 class="text-white font-bold text-lg truncate">Makmur Jaya Kiosk</h3>
<p class="text-white/80 text-xs truncate flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">location_on</span>
                        BSD Plaza, Tangerang
                    </p>
</div>
</div>
<div class="p-5 flex-1 flex flex-col gap-4">
<div class="grid grid-cols-2 gap-y-4 gap-x-2">
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Store ID</span>
<span class="text-sm font-medium text-text-main dark:text-white">STR-004</span>
</div>
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Staff</span>
<span class="text-sm font-medium text-text-main dark:text-white">2 Employees</span>
</div>
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Devices</span>
<span class="text-sm font-medium text-text-main dark:text-white">1 Active POS</span>
</div>
<div class="flex flex-col gap-1">
<span class="text-xs text-text-secondary uppercase tracking-wider font-semibold">Type</span>
<span class="text-sm font-medium text-text-main dark:text-white">Kiosk</span>
</div>
</div>
</div>
<div class="px-5 py-4 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/30 flex items-center gap-3">
<button class="flex-1 h-9 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-text-secondary hover:text-primary hover:border-primary/30 text-sm font-medium transition-colors">
                    Edit
                 </button>
<button class="flex-1 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold transition-colors flex items-center justify-center gap-2">
<span>View Details</span>
<span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</section>
</div>
</div>
</main>

</body></html>