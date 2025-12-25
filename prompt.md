code support ticket <!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Tenant Support Management - Warungin</title>
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
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
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
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-filled {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-white font-display overflow-hidden h-screen flex">
<aside class="w-64 bg-slate-50 dark:bg-[#1e293b] border-r border-[#e7edf3] dark:border-slate-700 flex flex-col h-full shrink-0 transition-all duration-300">
<div class="p-6 pb-2">
<div class="flex flex-col gap-1">
<h1 class="text-primary text-xl font-bold leading-normal flex items-center gap-2">
<span class="material-symbols-outlined icon-filled">storefront</span>
                    Warungin
                </h1>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium leading-normal pl-8">Super Admin Panel</p>
</div>
</div>
<nav class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">dashboard</span>
<p class="text-sm font-medium leading-normal">Dashboard</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">store</span>
<p class="text-sm font-medium leading-normal">Tenants</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">receipt_long</span>
<p class="text-sm font-medium leading-normal">Subscriptions</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/10 text-primary group transition-colors" href="#">
<span class="material-symbols-outlined icon-filled">support_agent</span>
<p class="text-sm font-semibold leading-normal">Support Tickets</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">extension</span>
<p class="text-sm font-medium leading-normal">Addons</p>
</a>
<div class="my-2 border-t border-slate-200 dark:border-slate-700"></div>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">settings</span>
<p class="text-sm font-medium leading-normal">Settings</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">logout</span>
<p class="text-sm font-medium leading-normal">Logout</p>
</a>
</nav>
<div class="p-4 border-t border-[#e7edf3] dark:border-slate-700">
<div class="flex items-center gap-3">
<div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-600 shadow-sm" data-alt="Profile picture of the admin user" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDGkFo6ZFO88EaXwjU9eZU8X2uCQJ2XQ0uqM4yci2zVhiQoXg1m0YTTsLLEk-9oVBNval68P0jld1l1dShg8A-EqCpcUH5BaD8MXmjn-WuJgjT9QxDu-NVFUOorkBhzZ1H-UlUGWO43hiajFIPjMU-CXL3s7q7q-Yv3b0kUP2Fx1AT2ZE-oJ2871_IAQ0HQ60VhOl8MVnoWMqYT97pDeXYn5oq7C6X5DriCYXOk_TX2TTSDZSio5QzauojfoNM7-WMUYqw3dw7kw64");'></div>
<div class="flex flex-col">
<p class="text-sm font-bold text-[#0d141b] dark:text-white">Admin User</p>
<p class="text-xs text-[#4c739a] dark:text-slate-400">admin@warungin.com</p>
</div>
</div>
</div>
</aside>
<main class="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden">
<header class="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-[#1e293b] border-b border-[#e7edf3] dark:border-slate-700 shrink-0 z-10">
<div class="flex items-center gap-4">
<button class="lg:hidden text-[#4c739a]">
<span class="material-symbols-outlined">menu</span>
</button>
<div>
<nav class="flex items-center gap-2 text-sm text-[#4c739a] dark:text-slate-400 mb-1">
<a class="hover:text-primary transition-colors" href="#">Home</a>
<span class="text-xs">/</span>
<a class="hover:text-primary transition-colors" href="#">Dashboard</a>
<span class="text-xs">/</span>
<span class="text-[#0d141b] dark:text-white font-medium">Support Tickets</span>
</nav>
<h2 class="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Tenant Support Management</h2>
</div>
</div>
<div class="flex items-center gap-4">
<button class="relative p-2 text-[#4c739a] dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-[#1e293b]"></span>
</button>
</div>
</header>
<div class="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
<div class="max-w-[1400px] mx-auto flex flex-col gap-6">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<h1 class="text-[#0d141b] dark:text-white text-3xl font-bold leading-tight tracking-tight">Support Tickets</h1>
<p class="text-[#4c739a] dark:text-slate-400 mt-2">View and manage tenant support requests, track issues, and assign agents.</p>
</div>
<div class="flex gap-3">
<div class="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
<span class="flex h-2 w-2 relative">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
</span>
<div class="flex flex-col">
<span class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">High Priority</span>
<span class="text-sm font-bold text-[#0d141b] dark:text-white">5 Active</span>
</div>
</div>
<div class="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
<span class="flex h-2 w-2 rounded-full bg-blue-500"></span>
<div class="flex flex-col">
<span class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Open Tickets</span>
<span class="text-sm font-bold text-[#0d141b] dark:text-white">24 Total</span>
</div>
</div>
</div>
</div>
<div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center z-20">
<div class="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-1">
<div class="relative w-full md:w-80">
<span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
<input class="pl-10 pr-4 py-2.5 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white dark:placeholder:text-slate-500" placeholder="Search by Ticket ID, Tenant, Subject..." type="text"/>
</div>
<div class="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
<select class="form-select text-sm rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-primary min-w-[140px] py-2.5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
<option value="">All Status</option>
<option value="open">Open</option>
<option value="in-progress">In Progress</option>
<option value="resolved">Resolved</option>
</select>
<select class="form-select text-sm rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-primary min-w-[140px] py-2.5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
<option value="">All Priorities</option>
<option value="high">High</option>
<option value="medium">Medium</option>
<option value="low">Low</option>
</select>
<select class="form-select text-sm rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-primary min-w-[160px] py-2.5 cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
<option value="">Filter by Tenant</option>
<option value="kopi-kenangan">Kopi Kenangan</option>
<option value="warung-tegal">Warung Tegal</option>
<option value="bakso-boedjangan">Bakso Boedjangan</option>
</select>
</div>
</div>
<button class="w-full xl:w-auto px-5 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
<span class="material-symbols-outlined text-[20px]">add_circle</span>
                        Create New Ticket
                    </button>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
<div class="overflow-x-auto min-h-[400px]">
<table class="w-full text-left border-collapse">
<thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4c739a] dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
<tr>
<th class="px-6 py-4 w-[140px]">Ticket ID</th>
<th class="px-6 py-4 w-[200px]">Tenant</th>
<th class="px-6 py-4">Subject</th>
<th class="px-6 py-4 w-[120px]">Priority</th>
<th class="px-6 py-4 w-[140px]">Status</th>
<th class="px-6 py-4 w-[160px]">Assigned To</th>
<th class="px-6 py-4 w-[180px] text-right">Actions</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
<td class="px-6 py-4">
<span class="text-sm font-mono font-medium text-[#0d141b] dark:text-white">#TKT-2490</span>
<div class="text-[10px] text-slate-400 mt-0.5">2 hours ago</div>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-gray-100 dark:bg-slate-700 bg-cover bg-center shrink-0" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBW34Qr2K16nTwloJ60rHOhPvOb2wH4AJbb2bMwWjJa8VrGwoWCmSnWA5twu7Pvna8kPnB8vr6jK5NOVq-OqCKp0rdb4LAo-TEHTavUT1-sGBYQ8pDRgH5dBEVluSUcQGHBAxVoVAUbcR_SaCjNtEItpsAzcdLDMNv1rvMGQ2gGS83ZHslnXPPxZPdD1v9-jth3JMhkcBa7HxIh5aizg_TuuFBlTRhRYHmeHQKGqLJjQDkdqw5vOjY3lX5hKLvaT-r4lmqTqTFel9E");'></div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white truncate max-w-[120px]">Kopi Kenangan</p>
</div>
</td>
<td class="px-6 py-4">
<p class="text-sm font-medium text-[#0d141b] dark:text-white">Critical POS Sync Failure</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500 mt-0.5 truncate max-w-[250px]">Unable to sync inventory data with server...</p>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800">
<span class="size-1.5 rounded-full bg-red-500"></span>
                                            High
                                        </span>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                            Open
                                        </span>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2 text-slate-400 text-sm italic">
<span class="material-symbols-outlined text-[18px]">person_off</span>
                                            Unassigned
                                        </div>
</td>
<td class="px-6 py-4 text-right">
<div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Details">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Assign Agent">
<span class="material-symbols-outlined text-[20px]">person_add</span>
</button>
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Add Note">
<span class="material-symbols-outlined text-[20px]">note_add</span>
</button>
</div>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
<td class="px-6 py-4">
<span class="text-sm font-mono font-medium text-[#0d141b] dark:text-white">#TKT-2489</span>
<div class="text-[10px] text-slate-400 mt-0.5">5 hours ago</div>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-gray-100 dark:bg-slate-700 bg-cover bg-center shrink-0" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuApANFzBjP8sTuNydpVbB9hgb7QqggzIZMl57kvKf00hMkTYyymPV_H9F-V5m3RJsLc9ldhvbuY30BYIN_i1HDLpQyQ0IdLY8jHcQuMX-_zOY2rZFtWMxO3iIWvcSuD7eNGMBO9zVNxVWLe0xH4pge50yiH43M3RduOvexjDojoa1iA-kCfim9oSlDUn3Xx785QH_Rq8r5ukr3J5ZCo5BydXnpJLzSe5iEZ12DpXcln6HNbGgWSDhIG-pMuLeRtl5-sBfYV53HYVVY");'></div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white truncate max-w-[120px]">Warung Tegal</p>
</div>
</td>
<td class="px-6 py-4">
<p class="text-sm font-medium text-[#0d141b] dark:text-white">Billing Dashboard Access</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500 mt-0.5 truncate max-w-[250px]">Client cannot view invoice history for Oct...</p>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
<span class="size-1.5 rounded-full bg-amber-500"></span>
                                            Medium
                                        </span>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                                            In Progress
                                        </span>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="size-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">SJ</div>
<span class="text-sm text-[#0d141b] dark:text-white">Sarah Jenkins</span>
</div>
</td>
<td class="px-6 py-4 text-right">
<div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Details">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Reassign Agent">
<span class="material-symbols-outlined text-[20px]">person_add</span>
</button>
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Update Status">
<span class="material-symbols-outlined text-[20px]">update</span>
</button>
</div>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group bg-slate-50/50 dark:bg-slate-800/50">
<td class="px-6 py-4">
<span class="text-sm font-mono font-medium text-[#4c739a] dark:text-slate-400 line-through">#TKT-2488</span>
<div class="text-[10px] text-slate-400 mt-0.5">1 day ago</div>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-3 opacity-75">
<div class="size-8 rounded bg-gray-100 dark:bg-slate-700 bg-cover bg-center shrink-0" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDpRm9iKnU9CC-MnWKPq9ZEaf86wjpCVWduh0HYUYf-vPiShY_MZZtTDDW0hJlii3JZ50Ku8FGZN98yP_MrksGq8_1xaC5friuyQjww-Vj86HK249VPx1AbWG_t2_B4dvHcnBw6q28HRd5ARgv3QhKtxZODXvkeCi94_v7_xZ95bbyPhhkQ8Gz-aHLVyY3OZ2IkDlYpJupchrnUW3osXYGJ8-d2A-TaqcPvigkHzcTUEWy0A6-Sc6vCQc27VoHaydKe4a6LdPUbP3Q");'></div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white truncate max-w-[120px]">Bakso Boedjangan</p>
</div>
</td>
<td class="px-6 py-4 opacity-75">
<p class="text-sm font-medium text-[#0d141b] dark:text-white">Feature Request: Dark Mode</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500 mt-0.5 truncate max-w-[250px]">Requested dark mode for kitchen display system.</p>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
<span class="size-1.5 rounded-full bg-slate-400"></span>
                                            Low
                                        </span>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800">
                                            Resolved
                                        </span>
</td>
<td class="px-6 py-4 opacity-75">
<div class="flex items-center gap-2">
<div class="size-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold">MT</div>
<span class="text-sm text-[#0d141b] dark:text-white">Mike T.</span>
</div>
</td>
<td class="px-6 py-4 text-right">
<div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Details">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Reopen Ticket">
<span class="material-symbols-outlined text-[20px]">restart_alt</span>
</button>
</div>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
<td class="px-6 py-4">
<span class="text-sm font-mono font-medium text-[#0d141b] dark:text-white">#TKT-2485</span>
<div class="text-[10px] text-slate-400 mt-0.5">2 days ago</div>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-blue-100 dark:bg-slate-700 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">SS</div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white truncate max-w-[120px]">Sate Senayan</p>
</div>
</td>
<td class="px-6 py-4">
<p class="text-sm font-medium text-[#0d141b] dark:text-white">Payment Gateway Error 500</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500 mt-0.5 truncate max-w-[250px]">Customers reporting failure during checkout...</p>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800">
<span class="size-1.5 rounded-full bg-red-500"></span>
                                            High
                                        </span>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                                            In Progress
                                        </span>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="size-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-[10px] font-bold">TS</div>
<span class="text-sm text-[#0d141b] dark:text-white">Tech Support</span>
</div>
</td>
<td class="px-6 py-4 text-right">
<div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Details">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Reassign Agent">
<span class="material-symbols-outlined text-[20px]">person_add</span>
</button>
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Update Status">
<span class="material-symbols-outlined text-[20px]">update</span>
</button>
</div>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
<td class="px-6 py-4">
<span class="text-sm font-mono font-medium text-[#0d141b] dark:text-white">#TKT-2484</span>
<div class="text-[10px] text-slate-400 mt-0.5">3 days ago</div>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-pink-100 dark:bg-slate-700 flex items-center justify-center text-pink-600 font-bold text-xs shrink-0">JJ</div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white truncate max-w-[120px]">Janji Jiwa</p>
</div>
</td>
<td class="px-6 py-4">
<p class="text-sm font-medium text-[#0d141b] dark:text-white">Loyalty Points Not Accruing</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500 mt-0.5 truncate max-w-[250px]">Points system seems stuck for last 5 orders.</p>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
<span class="size-1.5 rounded-full bg-amber-500"></span>
                                            Medium
                                        </span>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                            Open
                                        </span>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2 text-slate-400 text-sm italic">
<span class="material-symbols-outlined text-[18px]">person_off</span>
                                            Unassigned
                                        </div>
</td>
<td class="px-6 py-4 text-right">
<div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Details">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Assign Agent">
<span class="material-symbols-outlined text-[20px]">person_add</span>
</button>
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Add Note">
<span class="material-symbols-outlined text-[20px]">note_add</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
<p class="text-sm text-[#4c739a] dark:text-slate-400">Showing <span class="font-semibold text-[#0d141b] dark:text-white">1-5</span> of <span class="font-semibold text-[#0d141b] dark:text-white">128</span> tickets</p>
<div class="flex items-center gap-2">
<button class="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50" disabled="">Previous</button>
<div class="flex gap-1">
<button class="size-8 rounded border border-primary bg-primary text-white text-sm font-medium">1</button>
<button class="size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">2</button>
<button class="size-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">3</button>
</div>
<button class="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Next</button>
</div>
</div>
</div>
</div>
<div class="h-8"></div>
</div>
</main>

</body></html>

code transaction 
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Payment Transaction Log - Warungin</title>
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
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
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
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-filled {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-white font-display overflow-hidden h-screen flex">
<aside class="w-64 bg-slate-50 dark:bg-[#1e293b] border-r border-[#e7edf3] dark:border-slate-700 flex flex-col h-full shrink-0 transition-all duration-300 hidden lg:flex">
<div class="p-6 pb-2">
<div class="flex flex-col gap-1">
<h1 class="text-primary text-xl font-bold leading-normal flex items-center gap-2">
<span class="material-symbols-outlined icon-filled">storefront</span>
                Warungin
            </h1>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium leading-normal pl-8">Super Admin Panel</p>
</div>
</div>
<nav class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">dashboard</span>
<p class="text-sm font-medium leading-normal">Dashboard</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/10 text-primary group transition-colors" href="#">
<span class="material-symbols-outlined icon-filled">payments</span>
<p class="text-sm font-semibold leading-normal">Transactions</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">store</span>
<p class="text-sm font-medium leading-normal">Tenants</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">receipt_long</span>
<p class="text-sm font-medium leading-normal">Subscriptions</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">extension</span>
<p class="text-sm font-medium leading-normal">Addons</p>
</a>
<div class="my-2 border-t border-slate-200 dark:border-slate-700"></div>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">settings</span>
<p class="text-sm font-medium leading-normal">Settings</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">logout</span>
<p class="text-sm font-medium leading-normal">Logout</p>
</a>
</nav>
<div class="p-4 border-t border-[#e7edf3] dark:border-slate-700">
<div class="flex items-center gap-3">
<div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-600 shadow-sm" data-alt="Profile picture of the admin user" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDGkFo6ZFO88EaXwjU9eZU8X2uCQJ2XQ0uqM4yci2zVhiQoXg1m0YTTsLLEk-9oVBNval68P0jld1l1dShg8A-EqCpcUH5BaD8MXmjn-WuJgjT9QxDu-NVFUOorkBhzZ1H-UlUGWO43hiajFIPjMU-CXL3s7q7q-Yv3b0kUP2Fx1AT2ZE-oJ2871_IAQ0HQ60VhOl8MVnoWMqYT97pDeXYn5oq7C6X5DriCYXOk_TX2TTSDZSio5QzauojfoNM7-WMUYqw3dw7kw64");'></div>
<div class="flex flex-col">
<p class="text-sm font-bold text-[#0d141b] dark:text-white">Admin User</p>
<p class="text-xs text-[#4c739a] dark:text-slate-400">admin@warungin.com</p>
</div>
</div>
</div>
</aside>
<main class="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden">
<header class="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-[#1e293b] border-b border-[#e7edf3] dark:border-slate-700 shrink-0 z-10">
<div class="flex items-center gap-4">
<button class="lg:hidden text-[#4c739a]">
<span class="material-symbols-outlined">menu</span>
</button>
<div>
<nav class="flex items-center gap-2 text-sm text-[#4c739a] dark:text-slate-400 mb-1">
<a class="hover:text-primary transition-colors" href="#">Home</a>
<span class="text-xs">/</span>
<span class="text-[#0d141b] dark:text-white font-medium">Transactions</span>
</nav>
<h2 class="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Payment Transaction Log</h2>
</div>
</div>
<div class="flex items-center gap-4">
<div class="hidden md:flex items-center bg-[#e7edf3] dark:bg-slate-700 rounded-lg px-3 py-2 w-64 focus-within:ring-2 ring-primary/50 transition-all">
<span class="material-symbols-outlined text-[#4c739a] dark:text-slate-400 text-[20px]">search</span>
<input class="bg-transparent border-none text-sm w-full focus:ring-0 text-[#0d141b] dark:text-white placeholder:text-[#4c739a] dark:placeholder:text-slate-400" placeholder="Global search..." type="text"/>
</div>
<button class="relative p-2 text-[#4c739a] dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-[#1e293b]"></span>
</button>
</div>
</header>
<div class="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
<div class="max-w-[1400px] mx-auto flex flex-col gap-6">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
<div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
<div class="flex justify-between items-start">
<div>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Total Transactions</p>
<h3 class="text-[#0d141b] dark:text-white text-2xl font-bold mt-1">14,205</h3>
</div>
<div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
<span class="material-symbols-outlined icon-filled">receipt_long</span>
</div>
</div>
<div class="flex items-center gap-2 mt-2">
<span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded text-xs font-semibold">
<span class="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> +8.2%
                        </span>
<span class="text-xs text-[#4c739a] dark:text-slate-500">vs last month</span>
</div>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
<div class="flex justify-between items-start">
<div>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Total Volume</p>
<h3 class="text-[#0d141b] dark:text-white text-2xl font-bold mt-1">Rp 4.5B</h3>
</div>
<div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
<span class="material-symbols-outlined icon-filled">payments</span>
</div>
</div>
<div class="flex items-center gap-2 mt-2">
<span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded text-xs font-semibold">
<span class="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> +12%
                        </span>
<span class="text-xs text-[#4c739a] dark:text-slate-500">vs last month</span>
</div>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
<div class="flex justify-between items-start">
<div>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Success Rate</p>
<h3 class="text-[#0d141b] dark:text-white text-2xl font-bold mt-1">98.5%</h3>
</div>
<div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
<span class="material-symbols-outlined icon-filled">check_circle</span>
</div>
</div>
<div class="flex items-center gap-2 mt-2">
<span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded text-xs font-semibold">
<span class="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> +0.5%
                        </span>
<span class="text-xs text-[#4c739a] dark:text-slate-500">vs last month</span>
</div>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
<div class="flex justify-between items-start">
<div>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Refunded</p>
<h3 class="text-[#0d141b] dark:text-white text-2xl font-bold mt-1">Rp 12.5M</h3>
</div>
<div class="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
<span class="material-symbols-outlined icon-filled">published_with_changes</span>
</div>
</div>
<div class="flex items-center gap-2 mt-2">
<span class="flex items-center text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded text-xs font-semibold">
<span class="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> +1.2%
                        </span>
<span class="text-xs text-[#4c739a] dark:text-slate-500">vs last month</span>
</div>
</div>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
<div class="relative w-full md:w-80">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">search</span>
<input class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white" placeholder="Search tenant, ID, or amount..." type="text"/>
</div>
<div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
<div class="relative">
<select class="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white cursor-pointer appearance-none">
<option>Last 30 Days</option>
<option>Last 7 Days</option>
<option>This Month</option>
<option>Last Month</option>
<option>Custom Range</option>
</select>
<span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#4c739a] pointer-events-none text-[18px]">calendar_today</span>
</div>
<select class="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white cursor-pointer">
<option value="">All Methods</option>
<option value="cc">Credit Card</option>
<option value="bank">Bank Transfer</option>
<option value="ewallet">E-Wallet</option>
<option value="qris">QRIS</option>
</select>
<select class="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white cursor-pointer">
<option value="">All Statuses</option>
<option value="success">Successful</option>
<option value="failed">Failed</option>
<option value="refunded">Refunded</option>
<option value="pending">Pending</option>
</select>
<div class="h-8 w-px bg-slate-200 dark:bg-slate-600 mx-1 hidden md:block"></div>
<button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0d141b] dark:text-white flex items-center gap-2 transition-colors">
<span class="material-symbols-outlined text-[18px]">download</span>
                        Export Data
                    </button>
</div>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4c739a] dark:text-slate-400 text-xs uppercase font-semibold">
<tr>
<th class="px-6 py-4">Transaction ID</th>
<th class="px-6 py-4">Tenant</th>
<th class="px-6 py-4">Date &amp; Time</th>
<th class="px-6 py-4">Payment Method</th>
<th class="px-6 py-4">Amount</th>
<th class="px-6 py-4">Status</th>
<th class="px-6 py-4 text-right">Action</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
<td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">
                                    #TRX-9924
                                </td>
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-gray-100 dark:bg-slate-700 bg-cover bg-center" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBW34Qr2K16nTwloJ60rHOhPvOb2wH4AJbb2bMwWjJa8VrGwoWCmSnWA5twu7Pvna8kPnB8vr6jK5NOVq-OqCKp0rdb4LAo-TEHTavUT1-sGBYQ8pDRgH5dBEVluSUcQGHBAxVoVAUbcR_SaCjNtEItpsAzcdLDMNv1rvMGQ2gGS83ZHslnXPPxZPdD1v9-jth3JMhkcBa7HxIh5aizg_TuuFBlTRhRYHmeHQKGqLJjQDkdqw5vOjY3lX5hKLvaT-r4lmqTqTFel9E");'></div>
<div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white">Kopi Kenangan</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500">Jakarta Selatan</p>
</div>
</div>
</td>
<td class="px-6 py-4">
<p class="text-sm text-[#0d141b] dark:text-white">Oct 24, 2023</p>
<p class="text-xs text-[#4c739a]">14:30 PM</p>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="p-1 bg-blue-50 dark:bg-blue-900/30 rounded text-primary">
<span class="material-symbols-outlined text-[16px]">credit_card</span>
</div>
<span class="text-sm text-[#0d141b] dark:text-white">Credit Card</span>
</div>
</td>
<td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">Rp 2.500.000</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
<span class="size-1.5 rounded-full bg-green-500"></span>
                                        Successful
                                    </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-[#4c739a] hover:text-primary transition-colors">
<span class="material-symbols-outlined">visibility</span>
</button>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
<td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">
                                    #TRX-9923
                                </td>
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-gray-100 dark:bg-slate-700 bg-cover bg-center" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuApANFzBjP8sTuNydpVbB9hgb7QqggzIZMl57kvKf00hMkTYyymPV_H9F-V5m3RJsLc9ldhvbuY30BYIN_i1HDLpQyQ0IdLY8jHcQuMX-_zOY2rZFtWMxO3iIWvcSuD7eNGMBO9zVNxVWLe0xH4pge50yiH43M3RduOvexjDojoa1iA-kCfim9oSlDUn3Xx785QH_Rq8r5ukr3J5ZCo5BydXnpJLzSe5iEZ12DpXcln6HNbGgWSDhIG-pMuLeRtl5-sBfYV53HYVVY");'></div>
<div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white">Warung Tegal</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500">Bandung</p>
</div>
</div>
</td>
<td class="px-6 py-4">
<p class="text-sm text-[#0d141b] dark:text-white">Oct 24, 2023</p>
<p class="text-xs text-[#4c739a]">11:15 AM</p>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="p-1 bg-purple-50 dark:bg-purple-900/30 rounded text-purple-600">
<span class="material-symbols-outlined text-[16px]">account_balance</span>
</div>
<span class="text-sm text-[#0d141b] dark:text-white">Bank Transfer</span>
</div>
</td>
<td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">Rp 150.000</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
<span class="size-1.5 rounded-full bg-red-500"></span>
                                        Failed
                                    </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-[#4c739a] hover:text-primary transition-colors">
<span class="material-symbols-outlined">visibility</span>
</button>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
<td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">
                                    #TRX-9922
                                </td>
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-gray-100 dark:bg-slate-700 bg-cover bg-center" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDpRm9iKnU9CC-MnWKPq9ZEaf86wjpCVWduh0HYUYf-vPiShY_MZZtTDDW0hJlii3JZ50Ku8FGZN98yP_MrksGq8_1xaC5friuyQjww-Vj86HK249VPx1AbWG_t2_B4dvHcnBw6q28HRd5ARgv3QhKtxZODXvkeCi94_v7_xZ95bbyPhhkQ8Gz-aHLVyY3OZ2IkDlYpJupchrnUW3osXYGJ8-d2A-TaqcPvigkHzcTUEWy0A6-Sc6vCQc27VoHaydKe4a6LdPUbP3Q");'></div>
<div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white">Bakso Boedjangan</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500">Surabaya</p>
</div>
</div>
</td>
<td class="px-6 py-4">
<p class="text-sm text-[#0d141b] dark:text-white">Oct 23, 2023</p>
<p class="text-xs text-[#4c739a]">09:45 AM</p>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="p-1 bg-cyan-50 dark:bg-cyan-900/30 rounded text-cyan-600">
<span class="material-symbols-outlined text-[16px]">qr_code_2</span>
</div>
<span class="text-sm text-[#0d141b] dark:text-white">QRIS</span>
</div>
</td>
<td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">Rp 75.000</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
<span class="size-1.5 rounded-full bg-amber-500"></span>
                                        Refunded
                                    </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-[#4c739a] hover:text-primary transition-colors">
<span class="material-symbols-outlined">visibility</span>
</button>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
<td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">
                                    #TRX-9921
                                </td>
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-blue-100 dark:bg-slate-700 flex items-center justify-center text-primary font-bold">
                                            S
                                        </div>
<div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white">Sate Khas Senayan</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500">Jakarta Pusat</p>
</div>
</div>
</td>
<td class="px-6 py-4">
<p class="text-sm text-[#0d141b] dark:text-white">Oct 23, 2023</p>
<p class="text-xs text-[#4c739a]">16:20 PM</p>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="p-1 bg-blue-50 dark:bg-blue-900/30 rounded text-primary">
<span class="material-symbols-outlined text-[16px]">credit_card</span>
</div>
<span class="text-sm text-[#0d141b] dark:text-white">Credit Card</span>
</div>
</td>
<td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">Rp 1.200.000</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
<span class="size-1.5 rounded-full bg-green-500"></span>
                                        Successful
                                    </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-[#4c739a] hover:text-primary transition-colors">
<span class="material-symbols-outlined">visibility</span>
</button>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
<td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">
                                    #TRX-9920
                                </td>
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-orange-100 dark:bg-slate-700 flex items-center justify-center text-orange-600 font-bold">
                                            B
                                        </div>
<div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white">Burger King</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500">Bekasi</p>
</div>
</div>
</td>
<td class="px-6 py-4">
<p class="text-sm text-[#0d141b] dark:text-white">Oct 23, 2023</p>
<p class="text-xs text-[#4c739a]">13:10 PM</p>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="p-1 bg-green-50 dark:bg-green-900/30 rounded text-green-600">
<span class="material-symbols-outlined text-[16px]">account_balance_wallet</span>
</div>
<span class="text-sm text-[#0d141b] dark:text-white">E-Wallet</span>
</div>
</td>
<td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">Rp 85.000</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
<span class="size-1.5 rounded-full bg-green-500"></span>
                                        Successful
                                    </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-[#4c739a] hover:text-primary transition-colors">
<span class="material-symbols-outlined">visibility</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<div class="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
<p class="text-sm text-[#4c739a] dark:text-slate-400">Showing <span class="font-medium text-[#0d141b] dark:text-white">1</span> to <span class="font-medium text-[#0d141b] dark:text-white">5</span> of <span class="font-medium text-[#0d141b] dark:text-white">128</span> results</p>
<div class="flex items-center gap-2">
<button class="px-3 py-1 text-sm font-medium text-[#4c739a] dark:text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled="">
                            Previous
                        </button>
<button class="px-3 py-1 text-sm font-medium text-[#4c739a] dark:text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600">
                            Next
                        </button>
</div>
</div>
</div>
</div>
<div class="h-8"></div>
</div>
</main>

</body></html>

code finance 
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Financial Accounts - Warungin</title>
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
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
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
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-filled {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-white font-display overflow-hidden h-screen flex">
<aside class="w-64 bg-slate-50 dark:bg-[#1e293b] border-r border-[#e7edf3] dark:border-slate-700 flex flex-col h-full shrink-0 transition-all duration-300">
<div class="p-6 pb-2">
<div class="flex flex-col gap-1">
<h1 class="text-primary text-xl font-bold leading-normal flex items-center gap-2">
<span class="material-symbols-outlined icon-filled">storefront</span>
                Warungin
            </h1>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium leading-normal pl-8">Super Admin Panel</p>
</div>
</div>
<nav class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">dashboard</span>
<p class="text-sm font-medium leading-normal">Dashboard</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/10 text-primary group transition-colors" href="#">
<span class="material-symbols-outlined icon-filled">account_balance</span>
<p class="text-sm font-semibold leading-normal">Finance</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">store</span>
<p class="text-sm font-medium leading-normal">Tenants</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">receipt_long</span>
<p class="text-sm font-medium leading-normal">Subscriptions</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">extension</span>
<p class="text-sm font-medium leading-normal">Addons</p>
</a>
<div class="my-2 border-t border-slate-200 dark:border-slate-700"></div>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">settings</span>
<p class="text-sm font-medium leading-normal">Settings</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">logout</span>
<p class="text-sm font-medium leading-normal">Logout</p>
</a>
</nav>
<div class="p-4 border-t border-[#e7edf3] dark:border-slate-700">
<div class="flex items-center gap-3">
<div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-600 shadow-sm" data-alt="Profile picture of the admin user" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDGkFo6ZFO88EaXwjU9eZU8X2uCQJ2XQ0uqM4yci2zVhiQoXg1m0YTTsLLEk-9oVBNval68P0jld1l1dShg8A-EqCpcUH5BaD8MXmjn-WuJgjT9QxDu-NVFUOorkBhzZ1H-UlUGWO43hiajFIPjMU-CXL3s7q7q-Yv3b0kUP2Fx1AT2ZE-oJ2871_IAQ0HQ60VhOl8MVnoWMqYT97pDeXYn5oq7C6X5DriCYXOk_TX2TTSDZSio5QzauojfoNM7-WMUYqw3dw7kw64");'></div>
<div class="flex flex-col">
<p class="text-sm font-bold text-[#0d141b] dark:text-white">Admin User</p>
<p class="text-xs text-[#4c739a] dark:text-slate-400">admin@warungin.com</p>
</div>
</div>
</div>
</aside>
<main class="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden">
<header class="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-[#1e293b] border-b border-[#e7edf3] dark:border-slate-700 shrink-0 z-10">
<div class="flex items-center gap-4">
<button class="lg:hidden text-[#4c739a]">
<span class="material-symbols-outlined">menu</span>
</button>
<div>
<nav class="flex items-center gap-2 text-sm text-[#4c739a] dark:text-slate-400 mb-1">
<a class="hover:text-primary transition-colors" href="#">Home</a>
<span class="text-xs">/</span>
<a class="hover:text-primary transition-colors" href="#">Dashboard</a>
<span class="text-xs">/</span>
<span class="text-[#0d141b] dark:text-white font-medium">Financial Accounts</span>
</nav>
<h2 class="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Financial Accounts Overview</h2>
</div>
</div>
<div class="flex items-center gap-4">
<div class="hidden md:flex items-center bg-[#e7edf3] dark:bg-slate-700 rounded-lg px-3 py-2 w-64 focus-within:ring-2 ring-primary/50 transition-all">
<span class="material-symbols-outlined text-[#4c739a] dark:text-slate-400 text-[20px]">search</span>
<input class="bg-transparent border-none text-sm w-full focus:ring-0 text-[#0d141b] dark:text-white placeholder:text-[#4c739a] dark:placeholder:text-slate-400" placeholder="Search transactions..." type="text"/>
</div>
<button class="relative p-2 text-[#4c739a] dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-[#1e293b]"></span>
</button>
</div>
</header>
<div class="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
<div class="max-w-[1400px] mx-auto flex flex-col gap-8">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<h1 class="text-[#0d141b] dark:text-white text-3xl font-bold leading-tight tracking-tight">Accounts &amp; Balances</h1>
<p class="text-[#4c739a] dark:text-slate-400 mt-2">Manage your platform's financial health, reconcile transactions, and view reports.</p>
</div>
<div class="flex gap-3">
<button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0d141b] dark:text-white flex items-center gap-2 transition-colors">
<span class="material-symbols-outlined text-[18px]">sync_alt</span>
                        Reconcile
                    </button>
<button class="px-4 py-2 bg-primary hover:bg-blue-600 rounded-lg text-sm font-medium text-white shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-colors">
<span class="material-symbols-outlined text-[18px]">add</span>
                        New Account
                    </button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<div class="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl p-6 text-white shadow-md relative overflow-hidden group">
<div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
<span class="material-symbols-outlined text-8xl">account_balance_wallet</span>
</div>
<div class="flex flex-col h-full justify-between relative z-10 gap-6">
<div class="flex justify-between items-start">
<div>
<p class="text-slate-300 text-xs font-medium uppercase tracking-wide">Revenue Account</p>
<p class="text-sm text-slate-400 mt-1">Bank Central Asia</p>
</div>
<span class="material-symbols-outlined text-slate-300">more_vert</span>
</div>
<div>
<h3 class="text-2xl font-bold tracking-tight">Rp 450.250.000</h3>
<div class="flex items-center gap-2 mt-2">
<span class="text-xs bg-white/10 px-2 py-1 rounded text-slate-200">**** 4421</span>
<span class="flex items-center text-green-400 text-xs font-semibold">
<span class="material-symbols-outlined text-[14px] mr-0.5">arrow_upward</span> 12.5%
                                </span>
</div>
</div>
<button class="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors border border-white/10">View History</button>
</div>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-all">
<div class="flex justify-between items-start">
<div class="flex items-center gap-3">
<div class="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
<span class="material-symbols-outlined">payments</span>
</div>
<div>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Expense Account</p>
<p class="text-[#0d141b] dark:text-white text-sm font-medium">Mandiri Operational</p>
</div>
</div>
<span class="material-symbols-outlined text-[#4c739a] cursor-pointer hover:text-primary">more_vert</span>
</div>
<div>
<h3 class="text-[#0d141b] dark:text-white text-2xl font-bold tracking-tight">Rp 85.000.000</h3>
<div class="flex items-center gap-2 mt-2">
<span class="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-[#4c739a] dark:text-slate-300">**** 8829</span>
<span class="flex items-center text-red-500 text-xs font-semibold">
<span class="material-symbols-outlined text-[14px] mr-0.5">arrow_downward</span> 2.1%
                            </span>
</div>
</div>
<button class="w-full py-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-xs font-medium transition-colors text-[#4c739a] dark:text-slate-300">View History</button>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-all">
<div class="flex justify-between items-start">
<div class="flex items-center gap-3">
<div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
<span class="material-symbols-outlined">lock</span>
</div>
<div>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Holding Account</p>
<p class="text-[#0d141b] dark:text-white text-sm font-medium">BNI Escrow</p>
</div>
</div>
<span class="material-symbols-outlined text-[#4c739a] cursor-pointer hover:text-primary">more_vert</span>
</div>
<div>
<h3 class="text-[#0d141b] dark:text-white text-2xl font-bold tracking-tight">Rp 120.500.000</h3>
<div class="flex items-center gap-2 mt-2">
<span class="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-[#4c739a] dark:text-slate-300">**** 1120</span>
<span class="flex items-center text-green-600 text-xs font-semibold">
<span class="material-symbols-outlined text-[14px] mr-0.5">arrow_upward</span> 5.4%
                            </span>
</div>
</div>
<button class="w-full py-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-xs font-medium transition-colors text-[#4c739a] dark:text-slate-300">View History</button>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-6 hover:shadow-md transition-all">
<div class="flex justify-between items-start">
<div class="flex items-center gap-3">
<div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
<span class="material-symbols-outlined">assured_workload</span>
</div>
<div>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Tax Reserve</p>
<p class="text-[#0d141b] dark:text-white text-sm font-medium">BRI Corporate</p>
</div>
</div>
<span class="material-symbols-outlined text-[#4c739a] cursor-pointer hover:text-primary">more_vert</span>
</div>
<div>
<h3 class="text-[#0d141b] dark:text-white text-2xl font-bold tracking-tight">Rp 45.000.000</h3>
<div class="flex items-center gap-2 mt-2">
<span class="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-[#4c739a] dark:text-slate-300">**** 9090</span>
<span class="flex items-center text-slate-500 text-xs font-semibold">
<span class="material-symbols-outlined text-[14px] mr-0.5">remove</span> 0.0%
                            </span>
</div>
</div>
<button class="w-full py-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-xs font-medium transition-colors text-[#4c739a] dark:text-slate-300">View History</button>
</div>
</div>
<div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
<div class="xl:col-span-2 flex flex-col gap-8">
<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden h-full">
<div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
<h3 class="text-[#0d141b] dark:text-white text-lg font-bold">Recent Transactions</h3>
<div class="flex gap-2">
<select class="bg-slate-50 dark:bg-slate-700 border-none text-xs rounded-lg py-1.5 px-3 text-[#4c739a] dark:text-slate-300 focus:ring-1 focus:ring-primary">
<option>All Accounts</option>
<option>Revenue</option>
<option>Expense</option>
<option>Holding</option>
</select>
<a class="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg text-xs font-medium text-[#4c739a] dark:text-slate-300 hover:text-primary transition-colors flex items-center" href="#">View All</a>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4c739a] dark:text-slate-400 text-xs uppercase font-semibold">
<tr>
<th class="px-6 py-4">Transaction Details</th>
<th class="px-6 py-4">Account</th>
<th class="px-6 py-4">Date</th>
<th class="px-6 py-4">Amount</th>
<th class="px-6 py-4">Status</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-100 dark:divide-slate-700">
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
<span class="material-symbols-outlined text-[18px]">add_card</span>
</div>
<div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white">Subscription Payout</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500">Ref: #PAY-2023-882</p>
</div>
</div>
</td>
<td class="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">Revenue (BCA)</td>
<td class="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">Oct 24, 2023</td>
<td class="px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">+ Rp 12.500.000</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
<span class="size-1.5 rounded-full bg-green-500"></span>
                                                Cleared
                                            </span>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
<span class="material-symbols-outlined text-[18px]">dns</span>
</div>
<div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white">AWS Infrastructure</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500">Ref: #AWS-OCT-23</p>
</div>
</div>
</td>
<td class="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">Expense (Mandiri)</td>
<td class="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">Oct 23, 2023</td>
<td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">- Rp 4.250.000</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
<span class="size-1.5 rounded-full bg-slate-400"></span>
                                                Pending
                                            </span>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
<span class="material-symbols-outlined text-[18px]">store</span>
</div>
<div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white">Tenant Withdrawal (Kopi K.)</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500">Ref: #WD-9921-01</p>
</div>
</div>
</td>
<td class="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">Holding (BNI)</td>
<td class="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">Oct 22, 2023</td>
<td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">- Rp 1.500.000</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
<span class="size-1.5 rounded-full bg-green-500"></span>
                                                Cleared
                                            </span>
</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="size-8 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
<span class="material-symbols-outlined text-[18px]">add_card</span>
</div>
<div>
<p class="text-sm font-medium text-[#0d141b] dark:text-white">Addon Purchase (Bakso B.)</p>
<p class="text-xs text-[#4c739a] dark:text-slate-500">Ref: #ADD-9919</p>
</div>
</div>
</td>
<td class="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">Revenue (BCA)</td>
<td class="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">Oct 22, 2023</td>
<td class="px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">+ Rp 500.000</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
<span class="size-1.5 rounded-full bg-green-500"></span>
                                                Cleared
                                            </span>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
<div class="flex flex-col gap-8">
<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
<div class="flex items-center justify-between">
<h3 class="text-[#0d141b] dark:text-white text-lg font-bold">Financial Statements</h3>
<button class="text-primary text-xs font-medium hover:underline">View All</button>
</div>
<div class="flex flex-col gap-4">
<div class="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
<div class="flex items-center gap-3">
<div class="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-primary">
<span class="material-symbols-outlined text-[20px]">description</span>
</div>
<div>
<p class="text-sm font-semibold text-[#0d141b] dark:text-white">Balance Sheet</p>
<p class="text-xs text-[#4c739a] dark:text-slate-400">Oct 2023 • PDF</p>
</div>
</div>
<span class="material-symbols-outlined text-[#4c739a] group-hover:text-primary transition-colors text-[20px]">download</span>
</div>
<div class="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
<div class="flex items-center gap-3">
<div class="bg-green-100 dark:bg-green-900/30 p-2 rounded text-green-600">
<span class="material-symbols-outlined text-[20px]">monitoring</span>
</div>
<div>
<p class="text-sm font-semibold text-[#0d141b] dark:text-white">Cash Flow</p>
<p class="text-xs text-[#4c739a] dark:text-slate-400">YTD 2023 • CSV</p>
</div>
</div>
<span class="material-symbols-outlined text-[#4c739a] group-hover:text-primary transition-colors text-[20px]">download</span>
</div>
<div class="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
<div class="flex items-center gap-3">
<div class="bg-purple-100 dark:bg-purple-900/30 p-2 rounded text-purple-600">
<span class="material-symbols-outlined text-[20px]">receipt_long</span>
</div>
<div>
<p class="text-sm font-semibold text-[#0d141b] dark:text-white">Income Statement</p>
<p class="text-xs text-[#4c739a] dark:text-slate-400">Q3 2023 • PDF</p>
</div>
</div>
<span class="material-symbols-outlined text-[#4c739a] group-hover:text-primary transition-colors text-[20px]">download</span>
</div>
</div>
</div>
<div class="flex flex-col gap-4">
<h3 class="text-[#0d141b] dark:text-white text-lg font-bold">Quick Actions</h3>
<div class="grid grid-cols-2 gap-4">
<button class="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group h-28">
<div class="bg-blue-50 dark:bg-slate-700 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors text-primary">
<span class="material-symbols-outlined">swap_horiz</span>
</div>
<span class="text-xs font-semibold text-[#0d141b] dark:text-white text-center">Internal Transfer</span>
</button>
<button class="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group h-28">
<div class="bg-blue-50 dark:bg-slate-700 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors text-primary">
<span class="material-symbols-outlined">publish</span>
</div>
<span class="text-xs font-semibold text-[#0d141b] dark:text-white text-center">Upload Invoice</span>
</button>
<button class="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group h-28">
<div class="bg-blue-50 dark:bg-slate-700 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors text-primary">
<span class="material-symbols-outlined">gavel</span>
</div>
<span class="text-xs font-semibold text-[#0d141b] dark:text-white text-center">Tax Adjustment</span>
</button>
<button class="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group h-28">
<div class="bg-blue-50 dark:bg-slate-700 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors text-primary">
<span class="material-symbols-outlined">settings_suggest</span>
</div>
<span class="text-xs font-semibold text-[#0d141b] dark:text-white text-center">Account Settings</span>
</button>
</div>
</div>
</div>
</div>
</div>
<div class="h-8"></div>
</div>
</main>

</body></html>

code system operational 
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>System Health Monitor - Warungin</title>
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
                        "primary": "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
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
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-filled {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }@keyframes pulse-dot {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .live-dot {
            animation: pulse-dot 2s infinite;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-white font-display overflow-hidden h-screen flex">
<aside class="w-64 bg-slate-50 dark:bg-[#1e293b] border-r border-[#e7edf3] dark:border-slate-700 flex flex-col h-full shrink-0 transition-all duration-300">
<div class="p-6 pb-2">
<div class="flex flex-col gap-1">
<h1 class="text-primary text-xl font-bold leading-normal flex items-center gap-2">
<span class="material-symbols-outlined icon-filled">storefront</span>
                Warungin
            </h1>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium leading-normal pl-8">Super Admin Panel</p>
</div>
</div>
<nav class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
<a class="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/10 text-primary group transition-colors" href="#">
<span class="material-symbols-outlined icon-filled">monitor_heart</span>
<p class="text-sm font-semibold leading-normal">System Health</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">dashboard</span>
<p class="text-sm font-medium leading-normal">Business Dashboard</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">dns</span>
<p class="text-sm font-medium leading-normal">Nodes &amp; Services</p>
</a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">bug_report</span>
<p class="text-sm font-medium leading-normal">Error Logs</p>
</a>
<div class="my-2 border-t border-slate-200 dark:border-slate-700"></div>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" href="#">
<span class="material-symbols-outlined">settings</span>
<p class="text-sm font-medium leading-normal">Settings</p>
</a>
</nav>
<div class="p-4 border-t border-[#e7edf3] dark:border-slate-700">
<div class="flex items-center gap-3">
<div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-600 shadow-sm" data-alt="Profile picture of the admin user" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDGkFo6ZFO88EaXwjU9eZU8X2uCQJ2XQ0uqM4yci2zVhiQoXg1m0YTTsLLEk-9oVBNval68P0jld1l1dShg8A-EqCpcUH5BaD8MXmjn-WuJgjT9QxDu-NVFUOorkBhzZ1H-UlUGWO43hiajFIPjMU-CXL3s7q7q-Yv3b0kUP2Fx1AT2ZE-oJ2871_IAQ0HQ60VhOl8MVnoWMqYT97pDeXYn5oq7C6X5DriCYXOk_TX2TTSDZSio5QzauojfoNM7-WMUYqw3dw7kw64");'></div>
<div class="flex flex-col">
<p class="text-sm font-bold text-[#0d141b] dark:text-white">Admin User</p>
<p class="text-xs text-[#4c739a] dark:text-slate-400">admin@warungin.com</p>
</div>
</div>
</div>
</aside>
<main class="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden">
<header class="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-[#1e293b] border-b border-[#e7edf3] dark:border-slate-700 shrink-0 z-10">
<div class="flex items-center gap-4">
<button class="lg:hidden text-[#4c739a]">
<span class="material-symbols-outlined">menu</span>
</button>
<div>
<nav class="flex items-center gap-2 text-sm text-[#4c739a] dark:text-slate-400 mb-1">
<a class="hover:text-primary transition-colors" href="#">Home</a>
<span class="text-xs">/</span>
<span class="text-[#0d141b] dark:text-white font-medium">System Monitor</span>
</nav>
<h2 class="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">System Health Monitor</h2>
</div>
</div>
<div class="flex items-center gap-4">
<div class="hidden md:flex items-center bg-[#e7edf3] dark:bg-slate-700 rounded-lg px-3 py-2 w-64 focus-within:ring-2 ring-primary/50 transition-all">
<span class="material-symbols-outlined text-[#4c739a] dark:text-slate-400 text-[20px]">search</span>
<input class="bg-transparent border-none text-sm w-full focus:ring-0 text-[#0d141b] dark:text-white placeholder:text-[#4c739a] dark:placeholder:text-slate-400" placeholder="Search logs, errors..." type="text"/>
</div>
<button class="relative p-2 text-[#4c739a] dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
<span class="material-symbols-outlined">notifications_active</span>
<span class="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-[#1e293b] animate-pulse"></span>
</button>
</div>
</header>
<div class="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
<div class="max-w-[1400px] mx-auto flex flex-col gap-8">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<div class="flex items-center gap-3">
<div class="live-dot size-3 bg-green-500 rounded-full"></div>
<h1 class="text-[#0d141b] dark:text-white text-3xl font-bold leading-tight tracking-tight">System Operational</h1>
</div>
<p class="text-[#4c739a] dark:text-slate-400 mt-2">All core services are running within expected parameters. Last updated: Just now.</p>
</div>
<div class="flex gap-3">
<button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0d141b] dark:text-white flex items-center gap-2 transition-colors">
<span class="material-symbols-outlined text-[18px]">history</span>
                        View History
                    </button>
<button class="px-4 py-2 bg-slate-800 dark:bg-slate-600 hover:bg-slate-900 dark:hover:bg-slate-500 rounded-lg text-sm font-medium text-white shadow-lg flex items-center gap-2 transition-colors">
<span class="material-symbols-outlined text-[18px]">refresh</span>
                        Run Diagnostics
                    </button>
</div>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
<div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
<div class="flex justify-between items-start">
<div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
<span class="material-symbols-outlined text-green-600">check_circle</span>
</div>
<span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
                            Stable
                        </span>
</div>
<div>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Server Uptime</p>
<p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">99.98%</p>
</div>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
<div class="flex justify-between items-start">
<div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
<span class="material-symbols-outlined text-primary">speed</span>
</div>
<span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
<span class="material-symbols-outlined text-[14px] mr-0.5">arrow_downward</span> 5ms
                        </span>
</div>
<div>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">API Latency (Avg)</p>
<p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">45ms</p>
</div>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
<div class="flex justify-between items-start">
<div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
<span class="material-symbols-outlined text-purple-600">database</span>
</div>
<span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
                             Normal
                        </span>
</div>
<div>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">DB Connections</p>
<p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">482 / 1000</p>
</div>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
<div class="flex justify-between items-start">
<div class="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
<span class="material-symbols-outlined text-orange-600">bug_report</span>
</div>
<span class="flex items-center text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded text-xs font-semibold">
                             0.02%
                        </span>
</div>
<div>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Error Rate</p>
<p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">24 Errors</p>
</div>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
<div class="flex justify-between items-start">
<div class="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
<span class="material-symbols-outlined text-cyan-600">memory</span>
</div>
<span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-semibold">
                            Low Load
                        </span>
</div>
<div>
<p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">CPU Usage</p>
<p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">12%</p>
</div>
</div>
</div>
<div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
<div class="xl:col-span-2 flex flex-col gap-8">
<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
<div class="flex items-center justify-between">
<h3 class="text-[#0d141b] dark:text-white text-lg font-bold">API Traffic &amp; Latency (Last 24h)</h3>
<div class="flex items-center gap-2">
<span class="flex items-center gap-1 text-xs text-[#4c739a]"><div class="w-3 h-3 bg-primary rounded-sm"></div> Requests</span>
<span class="flex items-center gap-1 text-xs text-[#4c739a]"><div class="w-3 h-3 bg-red-400 rounded-sm"></div> Latency &gt; 200ms</span>
</div>
</div>
<div class="h-64 w-full flex items-end justify-between gap-1 overflow-hidden pt-4">
<div class="w-full bg-primary/20 hover:bg-primary/40 rounded-t transition-all relative group" style="height: 45%">
<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">1200 req</div>
</div>
<div class="w-full bg-primary/30 hover:bg-primary/40 rounded-t transition-all" style="height: 35%"></div>
<div class="w-full bg-primary/40 hover:bg-primary/50 rounded-t transition-all" style="height: 60%"></div>
<div class="w-full bg-primary hover:bg-blue-600 rounded-t transition-all" style="height: 75%"></div>
<div class="w-full bg-primary hover:bg-blue-600 rounded-t transition-all" style="height: 50%"></div>
<div class="w-full bg-primary/80 hover:bg-primary rounded-t transition-all" style="height: 65%"></div>
<div class="w-full bg-primary/60 hover:bg-primary/80 rounded-t transition-all" style="height: 40%"></div>
<div class="w-full bg-primary/40 hover:bg-primary/60 rounded-t transition-all" style="height: 30%"></div>
<div class="w-full bg-red-400 hover:bg-red-500 rounded-t transition-all animate-pulse" style="height: 90%" title="High Latency Spike"></div>
<div class="w-full bg-primary hover:bg-blue-600 rounded-t transition-all" style="height: 55%"></div>
<div class="w-full bg-primary hover:bg-blue-600 rounded-t transition-all" style="height: 45%"></div>
<div class="w-full bg-primary/70 hover:bg-primary rounded-t transition-all" style="height: 60%"></div>
<div class="w-full bg-primary/50 hover:bg-primary/70 rounded-t transition-all" style="height: 35%"></div>
<div class="w-full bg-primary/30 hover:bg-primary/50 rounded-t transition-all" style="height: 25%"></div>
<div class="w-full bg-primary hover:bg-blue-600 rounded-t transition-all" style="height: 50%"></div>
<div class="w-full bg-primary hover:bg-blue-600 rounded-t transition-all" style="height: 65%"></div>
<div class="w-full bg-primary hover:bg-blue-600 rounded-t transition-all" style="height: 70%"></div>
<div class="w-full bg-primary/80 hover:bg-primary rounded-t transition-all" style="height: 55%"></div>
<div class="w-full bg-primary/60 hover:bg-primary/80 rounded-t transition-all" style="height: 40%"></div>
<div class="w-full bg-primary/40 hover:bg-primary/60 rounded-t transition-all" style="height: 30%"></div>
<div class="w-full bg-primary hover:bg-blue-600 rounded-t transition-all" style="height: 45%"></div>
<div class="w-full bg-primary hover:bg-blue-600 rounded-t transition-all" style="height: 55%"></div>
<div class="w-full bg-primary hover:bg-blue-600 rounded-t transition-all" style="height: 50%"></div>
<div class="w-full bg-primary hover:bg-blue-600 rounded-t transition-all" style="height: 40%"></div>
</div>
<div class="flex justify-between text-xs text-[#4c739a] border-t border-slate-100 dark:border-slate-700 pt-2">
<span>00:00</span>
<span>06:00</span>
<span>12:00</span>
<span>18:00</span>
<span>24:00</span>
</div>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
<div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
<div class="flex items-center gap-2">
<h3 class="text-[#0d141b] dark:text-white text-lg font-bold">Recent System Logs</h3>
<span class="bg-slate-100 dark:bg-slate-700 text-[#4c739a] dark:text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium">Live</span>
</div>
<a class="text-sm text-primary font-medium hover:underline flex items-center gap-1" href="#">
                                Open Log Explorer <span class="material-symbols-outlined text-[16px]">open_in_new</span>
</a>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4c739a] dark:text-slate-400 text-xs uppercase font-semibold">
<tr>
<th class="px-6 py-4">Timestamp</th>
<th class="px-6 py-4">Severity</th>
<th class="px-6 py-4">Service</th>
<th class="px-6 py-4">Message</th>
<th class="px-6 py-4">Node</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-100 dark:divide-slate-700 font-mono text-xs">
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
<td class="px-6 py-4 text-[#4c739a] dark:text-slate-400">Oct 24 14:23:01</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            INFO
                                        </span>
</td>
<td class="px-6 py-4 text-[#0d141b] dark:text-white font-medium">auth-service</td>
<td class="px-6 py-4 text-[#4c739a] dark:text-slate-400">Token rotation successful for user_pool_1</td>
<td class="px-6 py-4 text-[#4c739a] dark:text-slate-400">worker-01</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
<td class="px-6 py-4 text-[#4c739a] dark:text-slate-400">Oct 24 14:22:45</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                            WARN
                                        </span>
</td>
<td class="px-6 py-4 text-[#0d141b] dark:text-white font-medium">database-proxy</td>
<td class="px-6 py-4 text-[#4c739a] dark:text-slate-400">Slow query detected (205ms) in table 'trans_logs'</td>
<td class="px-6 py-4 text-[#4c739a] dark:text-slate-400">db-read-02</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors bg-red-50/50 dark:bg-red-900/10">
<td class="px-6 py-4 text-[#4c739a] dark:text-slate-400">Oct 24 14:21:12</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                            ERROR
                                        </span>
</td>
<td class="px-6 py-4 text-[#0d141b] dark:text-white font-medium">payment-gateway</td>
<td class="px-6 py-4 text-[#0d141b] dark:text-white">Connection timeout to external provider API</td>
<td class="px-6 py-4 text-[#4c739a] dark:text-slate-400">worker-03</td>
</tr>
<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
<td class="px-6 py-4 text-[#4c739a] dark:text-slate-400">Oct 24 14:20:55</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            INFO
                                        </span>
</td>
<td class="px-6 py-4 text-[#0d141b] dark:text-white font-medium">cron-job</td>
<td class="px-6 py-4 text-[#4c739a] dark:text-slate-400">Daily reconciliation job completed successfully</td>
<td class="px-6 py-4 text-[#4c739a] dark:text-slate-400">master-01</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
<div class="flex flex-col gap-8">
<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
<div class="flex items-center justify-between">
<h3 class="text-[#0d141b] dark:text-white text-lg font-bold">Active Alerts</h3>
<span class="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">2 Critical</span>
</div>
<div class="flex flex-col gap-4">
<div class="flex gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg">
<span class="material-symbols-outlined text-red-600 mt-0.5">warning</span>
<div>
<p class="text-sm font-bold text-red-700 dark:text-red-400">High Memory Usage</p>
<p class="text-xs text-red-600/80 dark:text-red-300/70 mt-1">Node <span class="font-mono">worker-03</span> is running at 92% RAM capacity. Check for memory leaks.</p>
<div class="mt-2 flex gap-2">
<button class="text-xs font-semibold underline text-red-700 hover:text-red-900 dark:text-red-400">Restart Node</button>
<button class="text-xs font-semibold text-red-700/70 hover:text-red-900 dark:text-red-400/70">Dismiss</button>
</div>
</div>
</div>
<div class="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
<span class="material-symbols-outlined text-amber-600 mt-0.5">schedule</span>
<div>
<p class="text-sm font-bold text-amber-700 dark:text-amber-400">Backup Delayed</p>
<p class="text-xs text-amber-600/80 dark:text-amber-300/70 mt-1">Daily DB backup is running 15 minutes longer than average.</p>
</div>
</div>
</div>
</div>
<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
<h3 class="text-[#0d141b] dark:text-white text-lg font-bold">Cluster Resources</h3>
<div class="flex flex-col gap-5">
<div class="flex flex-col gap-2">
<div class="flex justify-between items-end">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-xs text-[#4c739a]">memory</span>
<span class="text-sm font-medium text-[#0d141b] dark:text-white">CPU Aggregate</span>
</div>
<span class="text-xs font-semibold text-[#0d141b] dark:text-white">45%</span>
</div>
<div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
<div class="bg-primary h-2 rounded-full transition-all duration-500" style="width: 45%"></div>
</div>
</div>
<div class="flex flex-col gap-2">
<div class="flex justify-between items-end">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-xs text-[#4c739a]">sd_card</span>
<span class="text-sm font-medium text-[#0d141b] dark:text-white">RAM Usage</span>
</div>
<span class="text-xs font-semibold text-[#0d141b] dark:text-white">68%</span>
</div>
<div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
<div class="bg-blue-400 h-2 rounded-full transition-all duration-500" style="width: 68%"></div>
</div>
</div>
<div class="flex flex-col gap-2">
<div class="flex justify-between items-end">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-xs text-[#4c739a]">hard_drive</span>
<span class="text-sm font-medium text-[#0d141b] dark:text-white">Storage</span>
</div>
<span class="text-xs font-semibold text-[#0d141b] dark:text-white">22%</span>
</div>
<div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
<div class="bg-green-500 h-2 rounded-full transition-all duration-500" style="width: 22%"></div>
</div>
</div>
<div class="flex flex-col gap-2">
<div class="flex justify-between items-end">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-xs text-[#4c739a]">cloud_queue</span>
<span class="text-sm font-medium text-[#0d141b] dark:text-white">S3 Bandwidth</span>
</div>
<span class="text-xs font-semibold text-[#0d141b] dark:text-white">85%</span>
</div>
<div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
<div class="bg-amber-400 h-2 rounded-full transition-all duration-500" style="width: 85%"></div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
<div class="h-8"></div>
</div>
</main>

</body></html>

