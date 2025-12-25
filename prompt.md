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

Design dapur 
<!DOCTYPE html>
<html class="light" lang="id"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Warungin | Dapur KDS (Mode Terang)</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#ec6d13", // Burnt Orange
                        "primary-soft": "#fff3e0", // Very light orange for backgrounds
                        "primary-hover": "#d56211",
                        "background-light": "#f1f5f9", // Slate 100 - Silverish Blue background
                        "surface-light": "#ffffff", // White surface
                        "border-light": "#cbd5e1", // Slate 300 - Silver border
                        "text-primary": "#0f172a", // Slate 900 - Dark text
                        "text-secondary": "#64748b", // Slate 500 - Secondary text
                        "accent-blue": "#e0f2fe", // Light blue accent
                    },
                    fontFamily: {
                        "display": ["Lexend", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>.scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .material-symbols-outlined {
            vertical-align: middle;
        }
    </style>
</head>
<body class="bg-background-light text-text-primary font-display antialiased min-h-screen flex flex-col overflow-hidden">
<header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light px-6 py-3 bg-white z-20 shrink-0 shadow-sm relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-1 bg-primary/80"></div>
<div class="flex items-center gap-4 text-text-primary">
<div class="size-10 flex items-center justify-center bg-primary-soft rounded-lg text-primary border border-orange-100">
<span class="material-symbols-outlined">skillet</span>
</div>
<div>
<h2 class="text-text-primary text-xl font-bold leading-tight tracking-tight">Warungin | Dapur</h2>
<p class="text-text-secondary text-xs font-normal">KDS - Shift Pagi</p>
</div>
</div>
<div class="flex flex-1 justify-end gap-6 items-center">
<div class="hidden md:flex flex-col items-end mr-4">
<span class="text-2xl font-bold leading-none text-slate-700">11:42</span>
<span class="text-xs text-text-secondary font-medium">Selasa, 24 Okt</span>
</div>
<div class="flex gap-3">
<button class="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-green-600 text-white text-sm font-bold shadow-md hover:bg-green-700 transition-colors">
<span class="material-symbols-outlined text-[20px]">wifi</span>
<span class="hidden sm:inline">Online</span>
</button>
<button class="flex items-center justify-center rounded-lg h-10 w-10 bg-white border border-border-light text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors shadow-sm">
<span class="material-symbols-outlined">settings</span>
</button>
<button class="flex items-center justify-center rounded-lg h-10 w-10 bg-white border border-border-light text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors relative shadow-sm">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
</button>
</div>
<div class="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-slate-200 shadow-sm" data-alt="Chef profile picture" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAkfs8FS0OjK93DDDKC8dNKcjBaWWBpdyW4hC0olDXonNv1ngEi_XcyuEUAfFLtONRdRBi57Nt8YuX_ZJP1AOZnDkT1S0mAvAYM1D9gcMP1aKXWXAHiVMtk4gbfmZVacIxR4tiXm7bs5DpAR8ayYAmD7PxUiRZe-UPLzoGPo7Sk2AK-cc5V7TuGOzgqacCWPBk5DXamvjvabIDgeCK0rWvcaxoLI0XTernzmIlAT-wOwFBoHbwYIufOv6H4lRm7zbVBx8mGXDVGDOY");'></div>
</div>
</header>
<div class="flex-1 flex flex-col overflow-hidden relative bg-slate-100/50">
<div class="px-6 py-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shrink-0 bg-white/80 backdrop-blur border-b border-border-light z-10 sticky top-0">
<div class="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0 w-full md:w-auto">
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary text-white px-4 shadow-md shadow-orange-500/10 border border-primary">
<span class="text-sm font-bold">Semua (8)</span>
</button>
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white border border-slate-300 px-4 hover:border-primary/50 hover:bg-orange-50 hover:text-primary transition-colors shadow-sm text-slate-600">
<span class="material-symbols-outlined text-[18px]">restaurant</span>
<span class="text-sm font-medium">Dine In</span>
</button>
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white border border-slate-300 px-4 hover:border-primary/50 hover:bg-orange-50 hover:text-primary transition-colors shadow-sm text-slate-600">
<span class="material-symbols-outlined text-[18px]">takeout_dining</span>
<span class="text-sm font-medium">Takeaway</span>
</button>
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white border border-slate-300 px-4 hover:border-primary/50 hover:bg-orange-50 hover:text-primary transition-colors shadow-sm text-slate-600">
<span class="material-symbols-outlined text-[18px]">two_wheeler</span>
<span class="text-sm font-medium">Delivery</span>
</button>
</div>
<div class="flex items-center gap-3 ml-auto">
<span class="text-text-secondary text-sm font-medium hidden sm:inline">Urutkan:</span>
<button class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white border border-slate-300 px-3 hover:bg-slate-50 text-slate-700 shadow-sm">
<span class="material-symbols-outlined text-[20px] text-slate-500">schedule</span>
<span class="text-sm font-medium">Waktu (Lama &gt; Baru)</span>
<span class="material-symbols-outlined text-[20px] text-slate-400">arrow_drop_down</span>
</button>
</div>
</div>
<div class="flex-1 overflow-y-auto px-6 pb-6 pt-6">
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
<div class="flex flex-col rounded-xl border-t-4 border-t-red-500 border-l border-r border-b border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow h-full">
<div class="flex items-start justify-between p-4 border-b border-slate-100 bg-red-50/30">
<div class="flex flex-col">
<h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                            Meja 05
                            <span class="px-2.5 py-1 rounded text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wider">Dine In</span>
</h3>
<p class="text-slate-500 text-sm font-mono mt-1 font-medium">#ORD-202 • Budi</p>
</div>
<div class="flex flex-col items-end gap-1">
<div class="px-3 py-1.5 rounded-lg bg-red-100 border border-red-200 text-red-700 font-bold text-lg font-mono animate-pulse shadow-sm">
                            22:15
                        </div>
</div>
</div>
<div class="p-4 flex-1 flex flex-col gap-4">
<label class="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded hover:bg-slate-50 transition-colors">
<input class="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" type="checkbox"/>
<div class="flex flex-col">
<span class="text-lg font-bold text-slate-800 leading-tight">2x Nasi Goreng Spesial</span>
<span class="text-sm text-red-600 font-semibold italic mt-1 bg-red-50 px-2 py-0.5 rounded w-fit">Note: Pedas Level 5!</span>
</div>
</label>
<label class="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded hover:bg-slate-50 transition-colors">
<input class="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" type="checkbox"/>
<div class="flex flex-col">
<span class="text-lg font-bold text-slate-800 leading-tight">1x Ayam Bakar Madu</span>
</div>
</label>
<label class="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded hover:bg-slate-50 transition-colors">
<input checked="" class="mt-1 w-5 h-5 rounded border-slate-300 text-slate-400 focus:ring-primary/20 transition-all cursor-pointer" type="checkbox"/>
<div class="flex flex-col opacity-50 line-through decoration-slate-400 decoration-2">
<span class="text-lg font-medium text-slate-600 leading-tight">1x Es Teh Manis</span>
</div>
</label>
</div>
<div class="p-4 pt-0 mt-auto">
<button class="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-base tracking-wide transition-all shadow-md active:scale-[0.98]">
<span class="material-symbols-outlined">check_circle</span>
                        Sajikan Semua
                    </button>
</div>
</div>
<div class="flex flex-col rounded-xl border-t-4 border-t-orange-500 border-l border-r border-b border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow h-full">
<div class="flex items-start justify-between p-4 border-b border-slate-100 bg-orange-50/30">
<div class="flex flex-col">
<h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                            Meja 12
                            <span class="px-2.5 py-1 rounded text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wider">Dine In</span>
</h3>
<p class="text-slate-500 text-sm font-mono mt-1 font-medium">#ORD-205 • Siti</p>
</div>
<div class="flex flex-col items-end gap-1">
<div class="px-3 py-1.5 rounded-lg bg-orange-100 border border-orange-200 text-orange-700 font-bold text-lg font-mono shadow-sm">
                            12:45
                        </div>
</div>
</div>
<div class="p-4 flex-1 flex flex-col gap-4">
<label class="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded hover:bg-slate-50 transition-colors">
<input class="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" type="checkbox"/>
<div class="flex flex-col">
<span class="text-lg font-bold text-slate-800 leading-tight">10x Sate Ayam</span>
<span class="text-sm text-slate-500 italic mt-0.5">Bumbu Kacang Pisah</span>
</div>
</label>
<label class="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded hover:bg-slate-50 transition-colors">
<input class="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" type="checkbox"/>
<div class="flex flex-col">
<span class="text-lg font-bold text-slate-800 leading-tight">2x Lontong</span>
</div>
</label>
</div>
<div class="p-4 pt-0 mt-auto">
<button class="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold text-base tracking-wide transition-all shadow-sm active:scale-[0.98]">
<span class="material-symbols-outlined">check_circle</span>
                        Sajikan Semua
                    </button>
</div>
</div>
<div class="flex flex-col rounded-xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow h-full">
<div class="flex items-start justify-between p-4 border-b border-slate-100 bg-slate-50">
<div class="flex flex-col">
<h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                            Gojek
                            <span class="px-2.5 py-1 rounded text-[11px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-wider">Delivery</span>
</h3>
<p class="text-slate-500 text-sm font-mono mt-1 font-medium">#ORD-208 • Driver: Asep</p>
</div>
<div class="flex flex-col items-end gap-1">
<div class="px-3 py-1.5 rounded-lg bg-slate-200 border border-slate-300 text-slate-700 font-bold text-lg font-mono">
                            04:10
                        </div>
</div>
</div>
<div class="p-4 flex-1 flex flex-col gap-4">
<label class="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded hover:bg-slate-50 transition-colors">
<input class="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" type="checkbox"/>
<div class="flex flex-col">
<span class="text-lg font-bold text-slate-800 leading-tight">1x Paket Keluarga A</span>
<span class="text-sm text-slate-500 italic mt-0.5">Ayam Goreng, Sayur Asem, Tahu Tempe</span>
</div>
</label>
<label class="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded hover:bg-slate-50 transition-colors">
<input class="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" type="checkbox"/>
<div class="flex flex-col">
<span class="text-lg font-bold text-slate-800 leading-tight">3x Es Jeruk</span>
<span class="text-sm text-slate-500 italic mt-0.5">Sedikit es</span>
</div>
</label>
</div>
<div class="p-4 pt-0 mt-auto">
<button class="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-white border border-slate-300 text-slate-700 hover:border-primary hover:text-primary font-bold text-base tracking-wide transition-all shadow-sm active:scale-[0.98]">
<span class="material-symbols-outlined">check_circle</span>
                        Sajikan Semua
                    </button>
</div>
</div>
<div class="flex flex-col rounded-xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow h-full">
<div class="flex items-start justify-between p-4 border-b border-slate-100 bg-slate-50">
<div class="flex flex-col">
<h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                            Meja 03
                            <span class="px-2.5 py-1 rounded text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wider">Dine In</span>
</h3>
<p class="text-slate-500 text-sm font-mono mt-1 font-medium">#ORD-210 • Susi</p>
</div>
<div class="flex flex-col items-end gap-1">
<div class="px-3 py-1.5 rounded-lg bg-slate-200 border border-slate-300 text-slate-700 font-bold text-lg font-mono">
                            01:25
                        </div>
</div>
</div>
<div class="p-4 flex-1 flex flex-col gap-4">
<label class="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded hover:bg-slate-50 transition-colors">
<input class="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" type="checkbox"/>
<div class="flex flex-col">
<span class="text-lg font-bold text-slate-800 leading-tight">1x Kopi Tubruk</span>
</div>
</label>
<label class="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded hover:bg-slate-50 transition-colors">
<input class="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" type="checkbox"/>
<div class="flex flex-col">
<span class="text-lg font-bold text-slate-800 leading-tight">1x Roti Bakar Coklat</span>
</div>
</label>
</div>
<div class="p-4 pt-0 mt-auto">
<button class="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-white border border-slate-300 text-slate-700 hover:border-primary hover:text-primary font-bold text-base tracking-wide transition-all shadow-sm active:scale-[0.98]">
<span class="material-symbols-outlined">check_circle</span>
                        Sajikan Semua
                    </button>
</div>
</div>
<div class="flex flex-col rounded-xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow h-full">
<div class="flex items-start justify-between p-4 border-b border-slate-100 bg-slate-50">
<div class="flex flex-col">
<h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                            Takeaway
                            <span class="px-2.5 py-1 rounded text-[11px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 uppercase tracking-wider">Pickup</span>
</h3>
<p class="text-slate-500 text-sm font-mono mt-1 font-medium">#ORD-211 • Cust: Rina</p>
</div>
<div class="flex flex-col items-end gap-1">
<div class="px-3 py-1.5 rounded-lg bg-slate-200 border border-slate-300 text-slate-700 font-bold text-lg font-mono">
                            00:45
                        </div>
</div>
</div>
<div class="p-4 flex-1 flex flex-col gap-4">
<label class="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded hover:bg-slate-50 transition-colors">
<input class="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" type="checkbox"/>
<div class="flex flex-col">
<span class="text-lg font-bold text-slate-800 leading-tight">2x Mie Goreng Jawa</span>
</div>
</label>
<label class="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded hover:bg-slate-50 transition-colors">
<input class="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" type="checkbox"/>
<div class="flex flex-col">
<span class="text-lg font-bold text-slate-800 leading-tight">1x Kwetiau Siram</span>
</div>
</label>
<label class="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded hover:bg-slate-50 transition-colors">
<input class="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 transition-all cursor-pointer" type="checkbox"/>
<div class="flex flex-col">
<span class="text-lg font-bold text-slate-800 leading-tight">3x Jus Alpukat</span>
</div>
</label>
</div>
<div class="p-4 pt-0 mt-auto">
<button class="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-white border border-slate-300 text-slate-700 hover:border-primary hover:text-primary font-bold text-base tracking-wide transition-all shadow-sm active:scale-[0.98]">
<span class="material-symbols-outlined">check_circle</span>
                        Sajikan Semua
                    </button>
</div>
</div>
</div>
</div>
</div>

</body></html>

design reward point 
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Warungin - Reward Pelanggan</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        "primary": "#3c72e7",
                        "primary-light": "#eff6ff",
                        "slate-750": "#2d3748",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem", 
                        "lg": "0.5rem", 
                        "xl": "0.75rem", 
                        "2xl": "1rem",
                        "full": "9999px"
                    },
                    backgroundImage: {
                        'glass-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%)',
                    }
                },
            },
        }
    </script>
<style>
        .glass-panel {
            background-color: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .sidebar-accent {
            background: linear-gradient(180deg, rgba(60, 114, 231, 0.03) 0%, rgba(255, 255, 255, 0) 100%);
        }
    </style>
</head>
<body class="font-display bg-slate-50 text-slate-900 antialiased overflow-x-hidden transition-colors duration-300">
<div class="flex h-screen w-full overflow-hidden">
<aside class="w-64 flex-shrink-0 flex flex-col bg-white border-r border-slate-200 hidden lg:flex relative sidebar-accent">
<div class="p-6 flex items-center gap-3 relative z-10">
<div class="size-10 rounded-full bg-cover bg-center shadow-sm border border-slate-100" data-alt="Warungin logo abstract" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDT8dqh-YVvwdjOwCZ61p_Aqp8cAxKnCcKGBC2UdWogczQJqZD5Q27MbgqDQip2EguBkn2jNQAedf6rp3Xk_gp3sFdN-lw1_wP3dyFB2Jaljq0lUia4R85rNNYCCpdiaG1MyBKcZmPNKwg-4bngfPie_f099AHdApSd3ehLVS_l75QFfnuHXnJaIH4rTm4eqYJ8IjHpjoaKq1aHTgPdf28MVmNc9fNtYE_BR1cSFLouyv8FKLWIrNu3hbIgo8FENgVNu8L6cSFRZlo");'></div>
<div class="flex flex-col">
<h1 class="text-slate-900 text-base font-bold leading-normal">Warungin</h1>
<p class="text-slate-500 text-xs font-normal">Admin Tenant</p>
</div>
</div>
<nav class="flex-1 flex flex-col gap-1 px-3 py-2 overflow-y-auto relative z-10">
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors">dashboard</span>
<span class="text-sm font-medium">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors">shopping_bag</span>
<span class="text-sm font-medium">Pesanan</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors">inventory_2</span>
<span class="text-sm font-medium">Produk</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors">group</span>
<span class="text-sm font-medium">Pelanggan</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-primary border-l-4 border-primary shadow-sm" href="#">
<span class="material-symbols-outlined text-primary fill-1">redeem</span>
<span class="text-sm font-bold">Reward</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors group" href="#">
<span class="material-symbols-outlined group-hover:text-primary transition-colors">settings</span>
<span class="text-sm font-medium">Pengaturan</span>
</a>
</nav>
<div class="p-4 border-t border-slate-100 relative z-10">
<div class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors group">
<span class="material-symbols-outlined group-hover:text-red-600">logout</span>
<span class="text-sm font-medium">Keluar</span>
</div>
</div>
</aside>
<div class="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F8FAFC]">
<header class="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-slate-200 shrink-0 sticky top-0 z-20">
<div class="flex items-center gap-4">
<button class="lg:hidden text-slate-600 hover:text-primary">
<span class="material-symbols-outlined">menu</span>
</button>
<h2 class="text-lg font-bold leading-tight tracking-[-0.015em] text-slate-800">Reward Pelanggan</h2>
</div>
<div class="flex items-center gap-4">
<button class="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 text-slate-500 hover:text-primary transition-colors relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border border-white"></span>
</button>
<button class="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 text-slate-500 hover:text-primary transition-colors">
<span class="material-symbols-outlined">chat</span>
</button>
<div class="size-9 rounded-full bg-cover bg-center border border-slate-200 cursor-pointer ring-2 ring-transparent hover:ring-primary/50 transition-all shadow-sm" data-alt="User profile photo" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCmPcl5spJcVkidUcLWDOC_vZ5rG6jb67o9qGe0nE8j_9--He08BxcDLe2Amvi-trrbnaiWkJ9cPoci3YjTX6qhp93itFa6PBEeAd6GyVAitanhGa8PNKJxiX9UnAsWqDDlMfksc6h5UvoR37-5_jZD96wt2uDVvRNlmVaaXjpCpefVmWMMeqN7jjCacmcwc3ZR26rJmTmyg6YhU9nw-jrKTPVpdz2W7dWGsxOURlGHIvjKNHEMxKhbVP2ssiQPfFTdi-tIOUZr4so");'></div>
</div>
</header>
<main class="flex-1 overflow-y-auto p-6 lg:px-10 py-8">
<div class="max-w-[1200px] mx-auto flex flex-col gap-8">
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div class="flex flex-col gap-1">
<h1 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Manajemen Reward</h1>
<p class="text-slate-500 text-base">Kelola katalog hadiah dan pantau penukaran poin pelanggan.</p>
</div>
<div class="flex gap-3">
<button class="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
<span class="material-symbols-outlined text-[20px]">description</span>
<span>Panduan</span>
</button>
<button class="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
<span class="material-symbols-outlined text-[20px]">add</span>
<span>Tambah Reward</span>
</button>
</div>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<div class="p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
<div class="flex justify-between items-start">
<p class="text-slate-500 text-sm font-medium">Reward Aktif</p>
<div class="p-1.5 bg-blue-50 rounded-md">
<span class="material-symbols-outlined text-primary text-[20px]">verified</span>
</div>
</div>
<p class="text-slate-900 text-2xl font-bold">12 Item</p>
<div class="flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
<span class="material-symbols-outlined text-[16px]">trending_up</span>
<span>+2 item baru</span>
</div>
</div>
<div class="p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
<div class="flex justify-between items-start">
<p class="text-slate-500 text-sm font-medium">Poin Ditukarkan</p>
<div class="p-1.5 bg-orange-50 rounded-md">
<span class="material-symbols-outlined text-orange-500 text-[20px]">toll</span>
</div>
</div>
<p class="text-slate-900 text-2xl font-bold">45.2k</p>
<div class="flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
<span class="material-symbols-outlined text-[16px]">trending_up</span>
<span>+12% bulan ini</span>
</div>
</div>
<div class="p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
<div class="flex justify-between items-start">
<p class="text-slate-500 text-sm font-medium">Klaim Pelanggan</p>
<div class="p-1.5 bg-purple-50 rounded-md">
<span class="material-symbols-outlined text-purple-500 text-[20px]">group</span>
</div>
</div>
<p class="text-slate-900 text-2xl font-bold">128</p>
<div class="flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
<span class="material-symbols-outlined text-[16px]">trending_up</span>
<span>+5% vs kemaren</span>
</div>
</div>
<div class="p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
<div class="flex justify-between items-start">
<p class="text-slate-500 text-sm font-medium">Sisa Stok</p>
<div class="p-1.5 bg-red-50 rounded-md">
<span class="material-symbols-outlined text-red-500 text-[20px]">inventory</span>
</div>
</div>
<p class="text-slate-900 text-2xl font-bold">340</p>
<div class="flex items-center gap-1 text-red-600 text-xs font-medium bg-red-50 w-fit px-2 py-0.5 rounded-full">
<span class="material-symbols-outlined text-[16px]">trending_down</span>
<span>-8% perlu restock</span>
</div>
</div>
</div>
<div class="flex flex-col gap-4">
<div class="flex flex-wrap items-center justify-between gap-3">
<div class="relative group">
<span class="absolute left-3 top-2.5 text-slate-400 material-symbols-outlined text-[20px] group-focus-within:text-primary transition-colors">search</span>
<input class="h-10 pl-10 pr-4 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-full sm:w-64 transition-all shadow-sm" placeholder="Cari reward..." type="text"/>
</div>
<div class="flex gap-2">
<button class="h-10 px-4 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:text-primary hover:border-primary/50 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
<span class="material-symbols-outlined text-[18px]">filter_list</span>
                                    Filter
                                </button>
<button class="h-10 px-4 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:text-primary hover:border-primary/50 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
<span class="material-symbols-outlined text-[18px]">sort</span>
                                    Urutkan
                                </button>
</div>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
<div class="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
<div class="aspect-[4/3] w-full bg-cover bg-center" data-alt="Cup of coffee latte" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCUQruQTiYpd7KaQJjpU_1RIuTueUZjesfmsRkXFOJwVf97uM5xQ5GnxajpShdu-jHZjzbPVpjAa7doWXh3OzYmF5iaucRaPWTV2hH02u87HqvfWBvHgRH4hUp8nZYo_tffhTSJnZPQdShkjtgNc2x8sDrcMEnf3SEuGop3UZlNEKNe4ZPKpb8DlbbeayO5Wh-It3G-lJwmyaGuqdp-S8_LSMG-mIRJjIt65-d2d-QKM5p8njG1hKHn3uyv74Tev2oLCIRQJ-ykSlI");'>
<div class="absolute top-3 right-3 px-2 py-1 rounded bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold border border-white/50 shadow-sm">
                                        Minuman
                                    </div>
</div>
<div class="p-4 flex flex-col gap-2 flex-1">
<h3 class="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">Kopi Susu Gula Aren</h3>
<p class="text-xs text-slate-500 line-clamp-2">Nikmati kesegaran kopi susu dengan gula aren asli pilihan.</p>
<div class="mt-auto pt-3 flex items-center justify-between border-t border-slate-100">
<span class="text-primary font-bold text-lg">50 Poin</span>
<span class="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Stok: 85</span>
</div>
</div>
<div class="absolute inset-0 bg-white/60 items-center justify-center gap-2 hidden group-hover:flex backdrop-blur-[2px] transition-all">
<button class="size-9 rounded-full bg-white text-slate-700 border border-slate-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-md transform hover:scale-110">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
<button class="size-9 rounded-full bg-white text-red-500 border border-slate-200 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-md transform hover:scale-110">
<span class="material-symbols-outlined text-[20px]">delete</span>
</button>
</div>
</div>
<div class="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
<div class="aspect-[4/3] w-full bg-cover bg-center" data-alt="Restaurant voucher card" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuB3f6BDlazm9JUVyE8XpvpZivOu8YmXudAs5fUzQIEWK_o7EZJJcfthtFT7MeRDVkSW3iSEQHTl-ZUgsnWsmNfIIdftr3HekZUU5QJBI11mhrRJYEtEmbgy17uFYZlTSp9pa-yf0iozH_S_1Lj-B5mC4emPBTxctF2q2wKJpKB-ZwU7RogpcHVJvHYU-jL6v-8lTlI8fJkWRQZrWdUBBN3LLne3YVzkM-03o3pM45AbvVVuv3-cGs52Ou4ZWeWymAZnSsk32MiyHA4");'>
<div class="absolute top-3 right-3 px-2 py-1 rounded bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold border border-white/50 shadow-sm">
                                        Voucher
                                    </div>
</div>
<div class="p-4 flex flex-col gap-2 flex-1">
<h3 class="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">Voucher Diskon 20%</h3>
<p class="text-xs text-slate-500 line-clamp-2">Potongan harga untuk semua menu makanan utama.</p>
<div class="mt-auto pt-3 flex items-center justify-between border-t border-slate-100">
<span class="text-primary font-bold text-lg">150 Poin</span>
<span class="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Stok: 200</span>
</div>
</div>
<div class="absolute inset-0 bg-white/60 items-center justify-center gap-2 hidden group-hover:flex backdrop-blur-[2px] transition-all">
<button class="size-9 rounded-full bg-white text-slate-700 border border-slate-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-md transform hover:scale-110">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
<button class="size-9 rounded-full bg-white text-red-500 border border-slate-200 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-md transform hover:scale-110">
<span class="material-symbols-outlined text-[20px]">delete</span>
</button>
</div>
</div>
<div class="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
<div class="aspect-[4/3] w-full bg-cover bg-center" data-alt="Nasi Goreng Special" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAZ_meaLLOr-AUMKwbwofs2Tv8maDser-KCcT9kA80M3mL4wiJWO9QWeTkQmSgNPOpLY_Qe7txs1MXrTbknoiu1oBAHrLbKyqhcrkn16lLzNBOEidyfyitijGqOlZFrg4FtpjhCZbNZjXSTHmojAZ7Zl9EBLV1DyeNlUImgru7HsNrX_UguuvT7NHaizhm4ozbJM7kyn5ephhf6A29199CFOd_jc6Os2CuHhFQudGfb_CGEgSN60jOCAJmlffIbRV09ho43Wsax_qM");'>
<div class="absolute top-3 right-3 px-2 py-1 rounded bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold border border-white/50 shadow-sm">
                                        Makanan
                                    </div>
</div>
<div class="p-4 flex flex-col gap-2 flex-1">
<h3 class="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">Nasi Goreng Spesial</h3>
<p class="text-xs text-slate-500 line-clamp-2">Menu andalan dengan topping telur dan sate ayam.</p>
<div class="mt-auto pt-3 flex items-center justify-between border-t border-slate-100">
<span class="text-primary font-bold text-lg">200 Poin</span>
<span class="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Stok: 45</span>
</div>
</div>
<div class="absolute inset-0 bg-white/60 items-center justify-center gap-2 hidden group-hover:flex backdrop-blur-[2px] transition-all">
<button class="size-9 rounded-full bg-white text-slate-700 border border-slate-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-md transform hover:scale-110">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
<button class="size-9 rounded-full bg-white text-red-500 border border-slate-200 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-md transform hover:scale-110">
<span class="material-symbols-outlined text-[20px]">delete</span>
</button>
</div>
</div>
<div class="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all opacity-80 hover:opacity-100">
<div class="aspect-[4/3] w-full bg-cover bg-center grayscale" data-alt="Tote bag merchandise" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuD2GNNGK_5ekxiudCPyFAFhzWtJ4CoJIO0VvApdzOa9quatGv7u-OcbjxKQ8eyhxH9NHTMS9YjtTPkIC1w5SDpHaKtcOvEKJgTo1mJHnA6zfN-GIRq9LVGLpH1xEUz2XglIwuD-WHtiajttXwrIBwX4uXNZtUR6JfvZXwY-pnFwKYNNqxpyF4Fe3dfXq1e5V1AEz-QG6gVhgGGlzvsDKdlhxavWPeP8oNuQVj3wFU5i9lASgOxyD5x28_peSYhd_W9QFe5jQWBT1z4");'>
<div class="absolute top-3 right-3 px-2 py-1 rounded bg-slate-800/80 backdrop-blur-sm text-white text-xs font-bold">
                                        Habis
                                    </div>
</div>
<div class="p-4 flex flex-col gap-2 flex-1 bg-slate-50/50">
<h3 class="text-base font-bold text-slate-700">Tote Bag Exclusive</h3>
<p class="text-xs text-slate-500 line-clamp-2">Tas belanja ramah lingkungan dengan logo Warungin.</p>
<div class="mt-auto pt-3 flex items-center justify-between border-t border-slate-200">
<span class="text-slate-500 font-bold text-lg">120 Poin</span>
<span class="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded-full">Stok: 0</span>
</div>
</div>
<div class="absolute inset-0 bg-white/60 items-center justify-center gap-2 hidden group-hover:flex backdrop-blur-[2px] transition-all">
<button class="size-9 rounded-full bg-white text-slate-700 border border-slate-200 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all shadow-md transform hover:scale-110">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
<button class="size-9 rounded-full bg-white text-red-500 border border-slate-200 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-md transform hover:scale-110">
<span class="material-symbols-outlined text-[20px]">delete</span>
</button>
</div>
</div>
</div>
</div>
<div class="flex flex-col gap-4">
<div class="flex items-center justify-between">
<h3 class="text-xl font-bold text-slate-900">Riwayat Penukaran Terbaru</h3>
<a class="text-sm text-primary font-bold hover:underline" href="#">Lihat Semua</a>
</div>
<div class="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
<table class="w-full text-left text-sm text-slate-600">
<thead class="bg-slate-50 text-xs uppercase font-semibold text-slate-700 border-b border-slate-200">
<tr>
<th class="px-6 py-4" scope="col">Pelanggan</th>
<th class="px-6 py-4" scope="col">Reward</th>
<th class="px-6 py-4" scope="col">Tanggal</th>
<th class="px-6 py-4" scope="col">Status</th>
<th class="px-6 py-4 text-right" scope="col">Poin</th>
</tr>
</thead>
<tbody class="divide-y divide-slate-100">
<tr class="hover:bg-blue-50/50 transition-colors">
<td class="px-6 py-4 flex items-center gap-3">
<div class="size-8 rounded-full bg-slate-200 bg-cover bg-center border border-slate-100" data-alt="Customer face" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDDQ_WJPuzkDzSGU3WbLQ0p1LHueP4a3Z7NKSjFheOUK_7m_mUrneUV5PNh_hnts_o2wW4binm2ihFVYpCSfYGnjIUdUbWtVgoOWKkmKiFK94eePAptGggGRd_weQXyrkuxA8pT6S65IJ0lsRmXjw0Hnd8Uf3RWZjcQLgJwGGKnAvYTSb1oxN7Y-KyTHV-4bTqgbT3TBBLL_AM-a32gNrcapwrT0L3VDYPC2Ufy2Ka7BgQHLq0kAfcPcQfAByXZeJoHbeOxInmUZhY");'></div>
<span class="font-bold text-slate-900">Budi Santoso</span>
</td>
<td class="px-6 py-4 text-slate-800">Kopi Susu Gula Aren</td>
<td class="px-6 py-4 text-slate-500">24 Okt 2023, 14:30</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
<span class="size-1.5 rounded-full bg-emerald-500"></span>
                                                Berhasil
                                            </span>
</td>
<td class="px-6 py-4 text-right font-bold text-red-500">-50</td>
</tr>
<tr class="hover:bg-blue-50/50 transition-colors">
<td class="px-6 py-4 flex items-center gap-3">
<div class="size-8 rounded-full bg-slate-200 bg-cover bg-center border border-slate-100" data-alt="Customer face female" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDvNJiKYeQzmJox_CUIaHXp48m0vVMR888DB7JbCBKmC73Nkv7xNFxCXTNmqIcAdirM6O3LuKbVFYVJBBlVVsquQWMwKWLXlXpAs7h2_j3yMNsMxnGIdhGnlsrdEztZsip9vMNeiZWaiiYDq8810PhVxgprTBWdQcUGRq0hkOv7xr60cvunYFXuyp92p9jehzdvzF_7mssEjy2YUCbTvQRyLd9X6_U9wYjOLQPPzFhyyU9rYrXR5TWogxoj1LOhLh8t5R45TQVuk08");'></div>
<span class="font-bold text-slate-900">Siti Aminah</span>
</td>
<td class="px-6 py-4 text-slate-800">Voucher Diskon 20%</td>
<td class="px-6 py-4 text-slate-500">24 Okt 2023, 13:15</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
<span class="size-1.5 rounded-full bg-emerald-500"></span>
                                                Berhasil
                                            </span>
</td>
<td class="px-6 py-4 text-right font-bold text-red-500">-150</td>
</tr>
<tr class="hover:bg-blue-50/50 transition-colors">
<td class="px-6 py-4 flex items-center gap-3">
<div class="size-8 rounded-full bg-slate-200 bg-cover bg-center border border-slate-100" data-alt="Customer face male" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuD_geGWa_L-aMVcyUY3Te02qzS3WnkB77dDYHTPQkgZ5cvCeOSLkCEQCXnciJ1I3oYVnVI8_v59eFDK-98gNVAmoS2rdSMkpGZkU9elnWc9SILVXOT3MFnbpyQa4VBeSXyO_2pN3_-LjVy4JkMy_RnUtkoNcSsk6mNJv9e8S_Y-Vy6OZk-b5fz9-NTecxCS-C-e9YkIOklGjsw781w8hiBxCQGwMbPwaJFo4CH2zmppxa-J20PJqce_KDmcHADXhuCm4LkzBOt9EZo");'></div>
<span class="font-bold text-slate-900">Andi Pratama</span>
</td>
<td class="px-6 py-4 text-slate-800">Tote Bag Exclusive</td>
<td class="px-6 py-4 text-slate-500">23 Okt 2023, 09:45</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
<span class="size-1.5 rounded-full bg-amber-500"></span>
                                                Menunggu
                                            </span>
</td>
<td class="px-6 py-4 text-right font-bold text-slate-400">-120</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</main>
</div>
</div>

</body></html>

design pos

<!DOCTYPE html>
<html lang="id"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Warungin POS - Cashier Interface</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        "primary": "#10b981", // Emerald 500
                        "primary-dark": "#059669", // Emerald 600
                        "primary-light": "#34d399", // Emerald 400
                        "primary-soft": "#d1fae5", // Emerald 100
                        "surface-white": "#ffffff",
                        "surface-subtle": "#f8fafc", // Slate 50
                        "border-light": "#e2e8f0", // Slate 200
                        "text-main": "#0f172a", // Slate 900
                        "text-muted": "#64748b", // Slate 500
                        "text-light": "#94a3b8", // Slate 400
                        "accent-blue": "#3b82f6", 
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.5rem",
                        "lg": "0.75rem",
                        "xl": "1rem",
                        "2xl": "1.5rem",
                    },
                    gridTemplateColumns: {
                        'layout': '90px 1fr 420px', // Sidebar | Main | Cart
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
            background: #f1f5f9; 
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1; 
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8; 
        }
        .glass-effect {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        .category-active {
            background: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            border-left: 3px solid #10b981;
            color: #059669;
        }
        .product-card-hover:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
            border-color: #34d399;
        }.bg-silver-theme {
            background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
        }.nav-emerald-tint {
            background: linear-gradient(to bottom, rgba(236, 253, 245, 0.6), rgba(255, 255, 255, 0.4));
        }
    </style>
</head>
<body class="bg-silver-theme text-text-main font-display overflow-hidden h-screen w-screen flex flex-col relative">
<header class="h-16 border-b border-border-light bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-30 shrink-0 shadow-sm">
<div class="flex items-center gap-4">
<div class="flex items-center gap-2 text-primary">
<span class="material-symbols-outlined text-[28px]">point_of_sale</span>
<h1 class="text-xl font-bold tracking-tight text-text-main">Warungin POS <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full ml-2">CASHIER</span></h1>
</div>
<div class="h-6 w-px bg-slate-200 mx-2"></div>
<div class="flex items-center gap-2 text-sm text-text-muted">
<span class="material-symbols-outlined text-[18px] text-slate-400">storefront</span>
<span>Outlet Jakarta Selatan</span>
</div>
</div>
<div class="flex items-center gap-6">
<div class="hidden md:flex items-center gap-4 text-sm font-medium">
<div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 shadow-sm">
<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Online
            </div>
<div class="text-text-main font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200" id="clock">10:45 AM</div>
</div>
<div class="flex items-center gap-3">
<button class="flex items-center gap-2 text-text-main hover:text-primary transition-colors p-1 pr-2 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200">
<div class="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 border border-slate-200 ring-2 ring-white shadow-sm" data-alt="User Avatar" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAc8mWCRobAYRdOLXCC4MP6oMVJUHzrc23Pk6UZRaB-9JKfK9aob9ged_o-AyQ3BIH8ot2U8914QGChCO2CuWoGdv0aGXyw8FrzAQBAOsd6aoQbmciTpk1_khjoY6nH2oQisYUeq5u-B_uAq4YwTPnVifq-YlqiA9E9pNyXibf1sgkhDLYys_4CS6aNCp4sl354HmY4ufnY5YshTEa8G28ThnTlFj_PIrynLjR-obyei3bEC2UTvFxRzDT5Qe47p76OmkfhlA-0Iu0");'></div>
<div class="text-sm text-left hidden lg:block">
<p class="font-bold leading-none text-slate-800">Budi Santoso</p>
<p class="text-[10px] text-text-muted mt-0.5 font-medium">Shift #289</p>
</div>
<span class="material-symbols-outlined text-slate-400">expand_more</span>
</button>
</div>
</div>
</header>
<main class="flex-1 grid grid-cols-[90px_1fr_380px] lg:grid-cols-[90px_1fr_420px] overflow-hidden">
<aside class="nav-emerald-tint border-r border-emerald-100/60 flex flex-col items-center py-6 gap-4 overflow-y-auto z-20">
<button class="group flex flex-col items-center gap-1 w-[70px] py-3 rounded-xl hover:bg-white hover:shadow-sm hover:text-primary transition-all category-active relative">
<span class="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">grid_view</span>
<span class="text-[10px] font-bold">All</span>
</button>
<button class="group flex flex-col items-center gap-1 w-[70px] py-3 rounded-xl hover:bg-white hover:shadow-sm hover:text-primary transition-all text-text-muted relative">
<span class="material-symbols-outlined group-hover:text-primary group-hover:scale-110 transition-transform">restaurant</span>
<span class="text-[10px] font-medium group-hover:text-primary group-hover:font-bold">Foods</span>
</button>
<button class="group flex flex-col items-center gap-1 w-[70px] py-3 rounded-xl hover:bg-white hover:shadow-sm hover:text-primary transition-all text-text-muted relative">
<span class="material-symbols-outlined group-hover:text-primary group-hover:scale-110 transition-transform">local_cafe</span>
<span class="text-[10px] font-medium group-hover:text-primary group-hover:font-bold">Drinks</span>
</button>
<button class="group flex flex-col items-center gap-1 w-[70px] py-3 rounded-xl hover:bg-white hover:shadow-sm hover:text-primary transition-all text-text-muted relative">
<span class="material-symbols-outlined group-hover:text-primary group-hover:scale-110 transition-transform">cookie</span>
<span class="text-[10px] font-medium group-hover:text-primary group-hover:font-bold">Snacks</span>
</button>
<button class="group flex flex-col items-center gap-1 w-[70px] py-3 rounded-xl hover:bg-white hover:shadow-sm hover:text-primary transition-all text-text-muted relative">
<span class="material-symbols-outlined group-hover:text-primary group-hover:scale-110 transition-transform">icecream</span>
<span class="text-[10px] font-medium group-hover:text-primary group-hover:font-bold">Desserts</span>
</button>
<div class="mt-auto flex flex-col items-center gap-4 w-full px-2">
<div class="h-px w-10 bg-emerald-200/50"></div>
<button class="group flex flex-col items-center gap-1 w-full py-2 hover:bg-red-50 rounded-xl transition-all">
<span class="material-symbols-outlined text-red-400 group-hover:text-red-500">logout</span>
<span class="text-[10px] font-medium text-red-400 group-hover:text-red-500">Logout</span>
</button>
</div>
</aside>
<section class="flex flex-col bg-slate-50/50 relative overflow-hidden">
<div class="px-6 py-4 flex gap-4 items-center shrink-0 z-10 sticky top-0 bg-white/60 backdrop-blur-md border-b border-slate-100">
<div class="relative flex-1 group">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
<input class="w-full bg-white border border-slate-200 focus:border-primary text-text-main pl-12 pr-12 py-3 rounded-xl focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 outline-none transition-all shadow-sm group-hover:border-slate-300" placeholder="Search product name, SKU or scan barcode (F2)" type="text"/>
<div class="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
<kbd class="hidden md:inline-flex h-6 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 text-[10px] font-bold text-slate-500 font-sans shadow-sm">F2</kbd>
</div>
</div>
<button class="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary hover:bg-emerald-50 transition-all shadow-sm" title="Scan Barcode">
<span class="material-symbols-outlined">qr_code_scanner</span>
</button>
</div>
<div class="flex-1 overflow-y-auto px-6 pt-4 pb-6 scroll-smooth">
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
<div class="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer product-card-hover group transition-all duration-200 shadow-sm">
<div class="relative aspect-square w-full overflow-hidden bg-slate-100">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" data-alt="Plate of special fried rice with egg and crackers" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAnSJ8pwxCcGsAqWxpKZGXTqopsSQkDXlfZG7nFVUUE29JtN0uKARvP7ncoETkUB0b59mjNXB7r_UpeU2aE_EpQ8WIopgwBTaAtdXeaO8QpszDWhexzeNjRhVJcrEd03j8k3-BDl4h-Tqgupgxf0eekzdl9azJddJgjpbuJgMbcgzjpSMVp9Wvq3uMf0sKg-syNpIpc2f2MzgIbwtPksxxn0Ejt-uWt8fJ0eYq5qE1cV2NeU18h36BrjnqZXg9wCe8sTtThy2H1yek");'></div>
<div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 shadow-sm">Food</div>
</div>
<div class="p-3">
<h3 class="text-slate-800 font-bold text-base truncate">Nasi Goreng Spesial</h3>
<div class="flex justify-between items-end mt-2">
<p class="text-slate-400 text-xs font-medium">SKU: FOOD-001</p>
<p class="text-primary-dark font-bold text-lg">Rp 25.000</p>
</div>
</div>
</div>
<div class="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer product-card-hover group transition-all duration-200 shadow-sm">
<div class="relative aspect-square w-full overflow-hidden bg-slate-100">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" data-alt="Bowl of chicken noodle soup with meatballs" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCwKKeazRICXak9vnhHWWjas2C6ypx1a1DZQD3bRN6O1T2092aRGQ1bLyeNQis_57qYmk7rCNSp_VaAJr1zjzjkCFyzmZWgf9aOur7pejwqxI2KjbjQRatUYwAMOlFBnEfHMIkbRi9rI0XSlCCVFUt6tEejOpehpXOX28XKm4FjQWdCBGCWKR_dTP6polHrUp1mRKXwtZeiL0jwdVhbBCoM24XAbiz-5uTD6zWyY8xl3QtklDG8PDcAU-2RPlzenodVv4RKLfEV82s");'></div>
<div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 shadow-sm">Food</div>
</div>
<div class="p-3">
<h3 class="text-slate-800 font-bold text-base truncate">Mie Ayam Bakso</h3>
<div class="flex justify-between items-end mt-2">
<p class="text-slate-400 text-xs font-medium">SKU: FOOD-002</p>
<p class="text-primary-dark font-bold text-lg">Rp 20.000</p>
</div>
</div>
</div>
<div class="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer product-card-hover group transition-all duration-200 shadow-sm">
<div class="relative aspect-square w-full overflow-hidden bg-slate-100">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" data-alt="Glass of iced sweet tea with lemon" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuC1pYrx3QtlEkfrj_WDdOzHT2qF_pDMkQ7uOjNNtJ_RQEjfc7IF49bhT4YwNaufHd87u4QP--o6pmyUCK8CKZAjuY2DdSIsKo8MuW2jxcY3zk13c85i8hKMJQac9vYCn4lWYacBbRLhNgaJmXYHXmaXd81l_D4hcyWQ58C5QjcfMNZvZY0x-ezqH_wXEoTh_o8b5OVuh_fMyoRurypyEyqXpSwjbAiHAEy2UgdqLnep45ZyggvOiGV5dbWzHVUW8qOLnGafUFcUydw");'></div>
<div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 shadow-sm">Drink</div>
</div>
<div class="p-3">
<h3 class="text-slate-800 font-bold text-base truncate">Es Teh Manis</h3>
<div class="flex justify-between items-end mt-2">
<p class="text-slate-400 text-xs font-medium">SKU: DRK-001</p>
<p class="text-primary-dark font-bold text-lg">Rp 5.000</p>
</div>
</div>
</div>
<div class="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer product-card-hover group transition-all duration-200 shadow-sm">
<div class="relative aspect-square w-full overflow-hidden bg-slate-100">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" data-alt="Crispy smashed chicken with spicy sambal" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuC7BKZOVH5ZClbmt8AK1xmyGBrsMlsRcc6Evx119xIzU85gT7ed6htFhqnO9OMd_fqL15lE82gbuUE9F8FOHYkkh2TdD9UdBkQtL4j1gBUtN7SGGhQZKrTRelaHvkRWzPIPQ9YGhKoIBx_vE7BO9qTLccu10dqoY93W3olrBHbaOoAtlq6qIPpmqWjCgdLF2RY5tn_31NwgWyCvACjD6b4_wk-pZm7TZFUjBhHrWAX7y0-XGHUpX4bdecdXLm5kMlVSAQuSVyabgXA");'></div>
<div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 shadow-sm">Food</div>
</div>
<div class="p-3">
<h3 class="text-slate-800 font-bold text-base truncate">Ayam Geprek</h3>
<div class="flex justify-between items-end mt-2">
<p class="text-slate-400 text-xs font-medium">SKU: FOOD-003</p>
<p class="text-primary-dark font-bold text-lg">Rp 18.000</p>
</div>
</div>
</div>
<div class="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer product-card-hover group transition-all duration-200 shadow-sm">
<div class="relative aspect-square w-full overflow-hidden bg-slate-100">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" data-alt="Iced coffee with milk and palm sugar" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuD_0Da4DrOf4cuWcnP8qXKLRcBeW56Oq0X_QxINTo5ML-QkL9QxGN2V8_oIbBi6ZzFba7qWJO4CL8H6_DuVNcbMw3XvjuxT-vSP4k3fcM1XgCXM1_V6_JG_xlt-YXPqDYRkaUDzGAHNvWSWCFCz-hac9BrVoVcDkdKfGaea3VdtgEBHYoxma_-pdD0Foi8exkrmuTcYDqYkFFaJTSpsQesDdq3-8InWaS_n1Q_ZizSAifdiY7FYQN0inkZ5Frrv8MopUymsq4SQ3NY");'></div>
<div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 shadow-sm">Drink</div>
</div>
<div class="p-3">
<h3 class="text-slate-800 font-bold text-base truncate">Kopi Susu Gula Aren</h3>
<div class="flex justify-between items-end mt-2">
<p class="text-slate-400 text-xs font-medium">SKU: DRK-002</p>
<p class="text-primary-dark font-bold text-lg">Rp 18.000</p>
</div>
</div>
</div>
<div class="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer product-card-hover group transition-all duration-200 shadow-sm">
<div class="relative aspect-square w-full overflow-hidden bg-slate-100">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" data-alt="Chicken satay skewers with peanut sauce" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBf2moN3KobLsqEoQJdQ94T62_KlbisUVFievCT6iA_yHog_FLU7ZZdb8k6ej_Hnp0ti7x72Stk3JSr2jRczYkgOrmIcgcH7m_aOtzpGZ0LM5fvJdFSbylc8U1MkOAV6alYt45sf_s1p41wVIcRl0bseSSqf6P3G07HVbSMpjjrOZlHDp-nri0t3Q3M5JE-dfy2-bu5mYMiAsjmH5VHLcPuhUQB2SUY58-JKT2n3-VTEHG359EDgo4ZXbO9Ef7eIS-cl3hYjVD0wEc");'></div>
<div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 shadow-sm">Food</div>
</div>
<div class="p-3">
<h3 class="text-slate-800 font-bold text-base truncate">Sate Ayam Madura</h3>
<div class="flex justify-between items-end mt-2">
<p class="text-slate-400 text-xs font-medium">SKU: FOOD-004</p>
<p class="text-primary-dark font-bold text-lg">Rp 30.000</p>
</div>
</div>
</div>
<div class="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer product-card-hover group transition-all duration-200 shadow-sm">
<div class="relative aspect-square w-full overflow-hidden bg-slate-100">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" data-alt="Traditional Betawi beef soup with coconut milk" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuDo1PQdgAPYlS5kYzgbjr1IFFqIW0blQ_X_7alJVKCyCUb921Zoo19PEbXONtYzIpUpEifQzNV4dnPynT_-Ns4mvjuVlG695pGoyZBRUeVO9ofAb28qM-a8l8-mOnCmsOKgDdw_UT6iqAUKsWgkDqZ_se82BF73CUHv0ndGGZ5XIodDXNMTaxLfdPVNiipAIt1n1aJpCt5XM8dxsfihXbcoypFaxkGjHmdLZiYnwMqlf1CpiJVVRxxUBdo7mKWkcbCWCyGXX2Cg2_M");'></div>
<div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 shadow-sm">Food</div>
</div>
<div class="p-3">
<h3 class="text-slate-800 font-bold text-base truncate">Soto Betawi</h3>
<div class="flex justify-between items-end mt-2">
<p class="text-slate-400 text-xs font-medium">SKU: FOOD-005</p>
<p class="text-primary-dark font-bold text-lg">Rp 35.000</p>
</div>
</div>
</div>
<div class="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer product-card-hover group transition-all duration-200 shadow-sm">
<div class="relative aspect-square w-full overflow-hidden bg-slate-100">
<div class="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" data-alt="Fried banana fritters with cheese and chocolate sprinkles" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCV6S6WNxvHMOJWqxMWExiU_Ep767CW6bUUZeVbx0zYKY3tYWvUOhMS9OUhjRQVy8S_8C08UZz4CXz7tjl8I5Dnk0I3WRDGSzTk6bRQvzKAi_DNjRfoLhmLcShMgEccBFJlVZInvDiw15HbDpeon0JNNc7vZOgvyM4ayOZuPyBWwjWbHIahmk4T6nJxbHq0HSVL11xxbVKRJQmBCpuDkV6-Ecb68TaSZ8P0LEk_tdE6er1NFYO-YlBzH2Jh_Vzv3TXQCW6RLj7wnsk");'></div>
<div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 shadow-sm">Snack</div>
</div>
<div class="p-3">
<h3 class="text-slate-800 font-bold text-base truncate">Pisang Goreng Keju</h3>
<div class="flex justify-between items-end mt-2">
<p class="text-slate-400 text-xs font-medium">SKU: SNCK-001</p>
<p class="text-primary-dark font-bold text-lg">Rp 15.000</p>
</div>
</div>
</div>
</div>
<div class="h-10"></div>
</div>
</section>
<aside class="glass-effect border-l border-slate-200 flex flex-col h-full shadow-2xl shadow-slate-200/50 relative z-30">
<div class="p-5 border-b border-slate-100 bg-white/60 space-y-3">
<div class="flex justify-between items-center mb-2">
<h2 class="text-slate-900 font-bold text-lg">Current Order</h2>
<span class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded">#ORD-2023-889</span>
</div>
<div class="flex gap-2">
<button class="flex-1 flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-emerald-400 hover:shadow-sm transition-all text-left group">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-slate-400 group-hover:text-primary text-[20px]">person</span>
<span class="font-medium">Walk-in Customer</span>
</div>
<span class="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
</button>
<button class="w-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-primary hover:bg-emerald-50 hover:border-emerald-200 transition-colors shadow-sm">
<span class="material-symbols-outlined text-[20px]">person_add</span>
</button>
</div>
</div>
<div class="flex-1 overflow-y-auto p-5 space-y-5">
<div class="flex gap-3 group relative">
<div class="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border border-slate-100 shadow-sm" data-alt="Nasi Goreng Spesial" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAb9K5INewh5R9AaL5taibZtS80cPThcvjEOpRD191_DD8fPqB3-Y1LtiyGUPQlw-YAlEQUGdK-efdewhW6UJJhOkbZnaDyUEka5yanQjwyRfX1gwosdKBOXlJ81zkJ5Aizd1wVPdMddmzsjFgvPQ6McNUIxXu4jmjvA29OvdT_Y1Q6T1zuDlRiJP9htt1YjCd7LKGCTKD7SyBrP33ItKm5dllB5WcjSpIRNPintEVFk0gJg-omFTQmsep9vRLmX8NEIejWtW2Dkdg");'></div>
<div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
<div class="flex justify-between items-start">
<h4 class="text-slate-800 text-sm font-bold truncate pr-2">Nasi Goreng Spesial</h4>
<p class="text-slate-900 font-bold text-sm">Rp 25.000</p>
</div>
<div class="flex justify-between items-end mt-1">
<p class="text-slate-500 text-xs truncate bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">Note: Pedas level 3</p>
<div class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 h-8 shadow-sm">
<button class="text-slate-400 hover:text-red-500 flex items-center justify-center w-6 h-full"><span class="material-symbols-outlined text-[16px]">remove</span></button>
<span class="text-slate-800 text-sm font-bold w-4 text-center">1</span>
<button class="text-primary hover:text-emerald-700 flex items-center justify-center w-6 h-full"><span class="material-symbols-outlined text-[16px]">add</span></button>
</div>
</div>
</div>
</div>
<div class="flex gap-3 group">
<div class="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border border-slate-100 shadow-sm" data-alt="Es Teh Manis" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCWXmR460kSC0HDC515i3haMeBZMzfauD6Knv4Kp680CRDHBjcZLnrfoYPtIiWmUMNBEHV8YqnlxvSDYZKkW8JaWXFYuS5yu474ukaIkMV7OLod5pkZkDK99t-71x07JlOosm42rt_D1iPHgKBViZ-U4LsVhZBT6F981hI2tpjUhZjLYlKeaw2oQELP69Ux3yWTYlCed21KGTQVjC-lL52PQOVQK1vr9g1XwSoWVWRH2BX6z-WKzpxmgBnoA7COkbeYKzOnJ0SndeI");'></div>
<div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
<div class="flex justify-between items-start">
<h4 class="text-slate-800 text-sm font-bold truncate pr-2">Es Teh Manis</h4>
<p class="text-slate-900 font-bold text-sm">Rp 10.000</p>
</div>
<div class="flex justify-between items-end mt-1">
<p class="text-slate-400 text-xs truncate italic">Add note...</p>
<div class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 h-8 shadow-sm">
<button class="text-slate-400 hover:text-red-500 flex items-center justify-center w-6 h-full"><span class="material-symbols-outlined text-[16px]">remove</span></button>
<span class="text-slate-800 text-sm font-bold w-4 text-center">2</span>
<button class="text-primary hover:text-emerald-700 flex items-center justify-center w-6 h-full"><span class="material-symbols-outlined text-[16px]">add</span></button>
</div>
</div>
</div>
</div>
<div class="flex gap-3 group">
<div class="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border border-slate-100 shadow-sm" data-alt="Kopi Susu Gula Aren" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAuGeVKDD5lbXkZ07a0Id812MSpLa5B4NL6En_ovDk-zs9QahYmlCz6lpjASTjBdUzjssChnyDtQQpeuOGeJYGJU_zXawsbqKh1xQK4IImntoums4yvOUN5TDDLEpO7skM9mPagiP3Gz_WEmOhcF5xucbLuI5W7KSIidjwPw4veo0LBpambiVNT01k-dQWkgkg6Qm2QdvGtnyE7hNywZIyoQEP6wvGfwtx1FUfVnKXmOgelZu7XLl5uCTIVs_FYykYQsGP1Av4b-BU");'></div>
<div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
<div class="flex justify-between items-start">
<h4 class="text-slate-800 text-sm font-bold truncate pr-2">Kopi Susu Gula Aren</h4>
<p class="text-slate-900 font-bold text-sm">Rp 18.000</p>
</div>
<div class="flex justify-between items-end mt-1">
<p class="text-slate-500 text-xs truncate bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">Less ice</p>
<div class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 h-8 shadow-sm">
<button class="text-slate-400 hover:text-red-500 flex items-center justify-center w-6 h-full"><span class="material-symbols-outlined text-[16px]">remove</span></button>
<span class="text-slate-800 text-sm font-bold w-4 text-center">1</span>
<button class="text-primary hover:text-emerald-700 flex items-center justify-center w-6 h-full"><span class="material-symbols-outlined text-[16px]">add</span></button>
</div>
</div>
</div>
</div>
</div>
<div class="px-5 py-3 grid grid-cols-4 gap-2 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm">
<button class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary hover:bg-emerald-50 hover:text-primary text-slate-500 transition-all shadow-sm">
<span class="material-symbols-outlined text-[20px]">pause_circle</span>
<span class="text-[10px] font-bold">Hold</span>
</button>
<button class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary hover:bg-emerald-50 hover:text-primary text-slate-500 transition-all shadow-sm">
<span class="material-symbols-outlined text-[20px]">percent</span>
<span class="text-[10px] font-bold">Discount</span>
</button>
<button class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary hover:bg-emerald-50 hover:text-primary text-slate-500 transition-all shadow-sm">
<span class="material-symbols-outlined text-[20px]">call_split</span>
<span class="text-[10px] font-bold">Split</span>
</button>
<button class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-500 transition-all shadow-sm">
<span class="material-symbols-outlined text-[20px]">delete</span>
<span class="text-[10px] font-bold">Clear</span>
</button>
</div>
<div class="bg-white border-t border-slate-200 p-5 pb-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] relative z-10">
<div class="space-y-3 mb-5">
<div class="flex justify-between text-slate-500 text-sm font-medium">
<span>Subtotal</span>
<span class="text-slate-800">Rp 53.000</span>
</div>
<div class="flex justify-between text-slate-500 text-sm font-medium">
<span>Tax (10%)</span>
<span class="text-slate-800">Rp 5.300</span>
</div>
<div class="h-px w-full bg-slate-100 my-2"></div>
<div class="flex justify-between items-center">
<span class="text-slate-900 font-bold text-lg">Total</span>
<span class="text-3xl font-extrabold text-primary-dark">Rp 58.300</span>
</div>
</div>
<button class="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transform active:scale-[0.98] transition-all flex justify-between items-center px-6 ring-4 ring-emerald-50">
<span>BAYAR</span>
<span class="bg-black/10 px-3 py-1 rounded-lg text-base font-bold">Rp 58.300</span>
</button>
</div>
</aside>
</main>
<div class="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm hidden">
<div class="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
<div class="absolute -top-20 -right-20 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-60"></div>
<div class="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
<div class="flex flex-col items-center text-center space-y-4 relative z-10">
<div class="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-2 shadow-sm border border-emerald-100">
<span class="material-symbols-outlined text-primary text-[48px]">check_circle</span>
</div>
<div>
<h2 class="text-2xl font-bold text-slate-900">Payment Successful!</h2>
<p class="text-text-muted mt-1 font-medium">Order #ORD-2023-889 completed.</p>
</div>
<div class="py-6 w-full">
<div class="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex justify-between items-center mb-1">
<span class="text-slate-500 font-medium">Change Due</span>
<span class="text-2xl font-bold text-emerald-600">Rp 41.700</span>
</div>
<div class="text-xs text-text-muted mt-3 flex justify-between px-3 font-medium">
<span>Paid Amount: <span class="text-slate-800">Rp 100.000</span></span>
<span>Method: <span class="text-slate-800">Cash</span></span>
</div>
</div>
<div class="flex gap-3 w-full mt-2">
<button class="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 text-primary hover:bg-emerald-50 hover:border-primary font-bold flex items-center justify-center gap-2 transition-all">
<span class="material-symbols-outlined">print</span>
                    Print Receipt
                </button>
<button class="flex-1 py-3.5 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-md shadow-emerald-100">
                    New Order
                </button>
</div>
</div>
</div>
</div>
<script>
    // Simple real-time clock script
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;
    }
    setInterval(updateClock, 1000);
    updateClock();
</script>

</body></html>
