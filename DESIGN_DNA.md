# Warungin Admin – Design DNA (Canonical V3)

This design DNA is extracted from the latest Admin Dashboard HTML examples / prompt.md.
All pages MUST visually match this V3 design system.

---

## 1. Overall Feel
- **Ultra-clean V3 SaaS dashboard**
- **Primary Color:** `#137fec` (Royal Blue)
- **Backgrounds:** `#f6f7f8` (Light) / `#101922` (Dark)
- **Typography:** Inter (Google Fonts)
- **Design Tokens:** `rounded-lg` or `rounded-xl`, `shadow-sm`, `border-slate-200`
- **Sidebar:** Light/Dark specific (`bg-slate-50` / `bg-[#1e293b]`)

---

## 2. Layout Structure (V3 FIXED)

### App Layout
- **Container:** `flex h-screen bg-background-light dark:bg-background-dark font-display overflow-hidden`
- **Sidebar:** `w-64 bg-slate-50 dark:bg-[#1e293b] border-r border-[#e7edf3] dark:border-slate-700`
- **Header:** `h-auto py-4 px-6 bg-slate-50 dark:bg-[#1e293b] border-b border-[#e7edf3] dark:border-slate-700`
- **Content:** `flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth`

### Navigation Links
- Regular: `text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700`
- Active: `bg-primary/10 text-primary`
- Icon filled state: `.icon-filled` for active item

---

## 3. Color System (STRICT V3)

### Primary Colors
```css
primary: "#137fec"       /* V3 Royal Blue */
primary-hover: "#0f6bd0"
background-light: "#f6f7f8"
background-dark: "#101922"
surface-light: "#ffffff"
surface-dark: "#1e293b"  /* Updated sidebar/header dark */
text-primary: "#0d141b"
text-secondary: "#4c739a"
border-light: "#e7edf3"
border-dark: "#334155"
```

### Status Colors
- **Success:** `text-green-700 bg-green-50 border-green-100` (Dark: `text-green-400 bg-green-900/20`)
- **Warning:** `text-amber-700 bg-amber-50 border-amber-100` (Dark: `text-amber-400 bg-amber-900/20`)
- **Error:** `text-red-700 bg-red-50 border-red-100` (Dark: `text-red-400 bg-red-900/20`)
- **Info:** `text-blue-700 bg-blue-50 border-blue-100` (Dark: `text-blue-400 bg-blue-900/20`)
- **Neutral:** `text-slate-600 bg-slate-100 border-slate-200` (Dark: `text-slate-300 bg-slate-700`)

---

## 4. Spacing System (V3)

| Context | Class |
|---------|-------|
| Page Container | `max-w-[1400px] mx-auto` |
| Section Gap | `gap-6` |
| Inner Card Padding | `p-5` |
| Table Cell Padding | `px-6 py-4` |
| Sidebar Padding | `px-4 py-4` |

---

## 5. Cards Pattern (V3)

### Base Card
```html
<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
```

### Stat Card (V3)
```html
<div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
  <div class="flex justify-between items-start">
    <div>
      <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Label</p>
      <h3 class="text-[#0d141b] dark:text-white text-2xl font-bold mt-1">Value</h3>
    </div>
    <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
       <span class="material-symbols-outlined icon-filled">icon</span>
    </div>
  </div>
  <div class="flex items-center gap-2 mt-2">
     <span class="flex items-center text-[#078838] bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded text-xs font-semibold">
       <span class="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> +12%
     </span>
     <span class="text-xs text-[#4c739a] dark:text-slate-500">vs last month</span>
  </div>
</div>
```

---

## 6. Typography & Header (V3)

### Header w/ Breadcrumbs
```html
<header class="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-[#1e293b] border-b border-[#e7edf3] dark:border-slate-700 shrink-0 z-10">
  <div class="flex items-center gap-4">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-sm text-[#4c739a] dark:text-slate-400 mb-1">
      <a class="hover:text-primary transition-colors" href="#">Home</a>
      <span class="text-xs">/</span>
      <span class="text-[#0d141b] dark:text-white font-medium">Current Page</span>
    </nav>
    <h2 class="text-[#0d141b] dark:text-white text-lg font-bold leading-tight">Page Title</h2>
  </div>
  <!-- Actions -->
  <div class="flex items-center gap-4">
     <button class="relative p-2 text-[#4c739a] hover:bg-slate-200 rounded-lg">
       <span class="material-symbols-outlined">notifications</span>
     </button>
  </div>
</header>
```

---

## 7. Buttons (V3)

### Primary
```html
<button class="px-4 py-2 bg-primary hover:bg-blue-600 rounded-lg text-sm font-medium text-white shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-colors">
```

### Secondary / Icon
```html
<button class="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
  <span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
```

---

## 8. Tables (V3)

### Table Structure
```html
<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
  <div class="overflow-x-auto min-h-[400px]">
    <table class="w-full text-left border-collapse">
       <thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4c739a] dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
         <tr><th class="px-6 py-4">Header</th></tr>
       </thead>
       <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
         <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
           <td class="px-6 py-4">Data</td>
         </tr>
       </tbody>
    </table>
  </div>
</div>
```

---

## 10. Filter Bar (V3)
```html
<div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center z-20">
  <div class="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-1">
     <div class="relative w-full md:w-80">
        <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
        <input class="pl-10 pr-4 py-2.5 w-full rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-primary/20" placeholder="Search..." />
     </div>
     <!-- Filters -->
     <select class="form-select ...">...</select>
  </div>
  <button class="w-full xl:w-auto px-5 py-2.5 bg-primary ...">Action</button>
</div>
```
---
END OF DESIGN DNA V3
