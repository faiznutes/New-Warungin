# Warungin Admin – Design DNA (Canonical V2)

This design DNA is extracted from the Admin Dashboard HTML examples.
All pages MUST visually match this design system.

---

## 1. Overall Feel
- Clean SaaS dashboard
- Modern, professional, premium
- Light mode default with dark mode support
- Subtle shadows and hover effects
- No visual noise

---

## 2. Layout Structure (FIXED)

### App Layout
- Left Sidebar: `w-64 bg-slate-50 dark:bg-[#1e293b]`
- Top Header: sticky with breadcrumb navigation
- Scrollable Content Area: `flex-1 overflow-y-auto p-6 md:p-8`

### Content Width
- Max width: `max-w-[1400px] mx-auto`
- Vertical rhythm with `gap-6` or `gap-8`

---

## 3. Color System (STRICT)

### Primary Colors
```css
primary: "#137fec"  /* Royal Blue */
background-light: "#f6f7f8"
background-dark: "#101922"
text-primary: "#0d141b"
text-secondary: "#4c739a"
```

### Status Colors
- **Success/Positive:** `text-green-600 bg-green-50`
- **Warning:** `text-amber-600 bg-amber-50`
- **Error/Critical:** `text-red-600 bg-red-50`
- **Info/Neutral:** `text-blue-600 bg-blue-50`
- **Resolved/Low:** `text-slate-600 bg-slate-100`

---

## 4. Spacing System

| Context | Class |
|---------|-------|
| Page sections | `gap-8` |
| Card grid | `gap-6` or `gap-4` |
| Inner card padding | `p-5` or `p-6` |
| Table cell padding | `px-6 py-4` |

---

## 5. Cards Pattern

### Base Card
```html
<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
```

### Stat Card with Icon Badge
```html
<div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
  <div class="flex justify-between items-start">
    <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <span class="material-symbols-outlined text-primary">icon_name</span>
    </div>
    <!-- Optional trend badge -->
    <span class="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-semibold">
      <span class="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> +12%
    </span>
  </div>
  <div>
    <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Label</p>
    <p class="text-[#0d141b] dark:text-white text-xl font-bold mt-1">Value</p>
  </div>
</div>
```

### Featured Card (Dark)
```html
<div class="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-xl p-6 text-white shadow-md">
```

---

## 6. Typography Hierarchy

| Element | Classes |
|---------|---------|
| Page Title | `text-3xl font-bold leading-tight tracking-tight text-[#0d141b]` |
| Page Subtitle | `text-[#4c739a] dark:text-slate-400 mt-2` |
| Section Title | `text-lg font-bold text-[#0d141b]` |
| Card Label | `text-xs font-medium uppercase tracking-wide text-[#4c739a]` |
| Body Text | `text-sm text-[#4c739a]` |
| Bold Value | `text-xl font-bold text-[#0d141b]` or `text-2xl font-bold` |

---

## 7. Buttons

### Primary Button
```html
<button class="px-4 py-2 bg-primary hover:bg-blue-600 rounded-lg text-sm font-medium text-white shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-colors">
  <span class="material-symbols-outlined text-[18px]">add</span>
  Button Text
</button>
```

### Secondary Button
```html
<button class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0d141b] dark:text-white flex items-center gap-2 transition-colors">
  <span class="material-symbols-outlined text-[18px]">download</span>
  Button Text
</button>
```

---

## 8. Tables

### Table Structure
```html
<div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
  <table class="w-full text-left border-collapse">
    <thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4c739a] dark:text-slate-400 text-xs uppercase font-semibold">
      <tr>
        <th class="px-6 py-4">Column</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <td class="px-6 py-4">Content</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 9. Status Badges

### Priority/Status Badges
```html
<!-- High Priority / Error -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800">
  <span class="size-1.5 rounded-full bg-red-500"></span>
  High
</span>

<!-- Medium Priority / Warning -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
  <span class="size-1.5 rounded-full bg-amber-500"></span>
  Medium
</span>

<!-- Success / Completed -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800">
  <span class="size-1.5 rounded-full bg-green-500"></span>
  Resolved
</span>

<!-- Info / Open -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
  Open
</span>

<!-- In Progress -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
  In Progress
</span>
```

---

## 10. Filter/Search Bar

```html
<div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center">
  <!-- Search Input -->
  <div class="relative w-full md:w-80">
    <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
    <input class="pl-10 pr-4 py-2.5 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Search..." type="text"/>
  </div>
  
  <!-- Filter Dropdowns -->
  <select class="form-select text-sm rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-primary min-w-[140px] py-2.5 cursor-pointer">
    <option>All Status</option>
  </select>
</div>
```

---

## 11. Quick Actions Grid

```html
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  <button class="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-primary/50 hover:shadow-md transition-all group">
    <div class="bg-blue-50 dark:bg-slate-700 p-3 rounded-full group-hover:bg-primary group-hover:text-white transition-colors text-primary">
      <span class="material-symbols-outlined">add_business</span>
    </div>
    <span class="text-sm font-semibold text-[#0d141b] dark:text-white">Action Label</span>
  </button>
</div>
```

---

## 12. Icons
- Font: Material Symbols Outlined
- Default size: 20px or 24px
- Icon in badge: `p-2 bg-{color}-50 rounded-lg`
- Filled style for active: `.icon-filled { font-variation-settings: 'FILL' 1 }`

---

## 13. Pagination

```html
<div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
  <p class="text-sm text-[#4c739a]">Showing <span class="font-semibold text-[#0d141b]">1-5</span> of <span class="font-semibold">128</span></p>
  <div class="flex items-center gap-2">
    <button class="px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-500 text-sm" disabled>Previous</button>
    <button class="size-8 rounded border border-primary bg-primary text-white text-sm font-medium">1</button>
    <button class="size-8 rounded border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50">2</button>
    <button class="px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-600 text-sm">Next</button>
  </div>
</div>
```

---

## 14. What NOT To Do
❌ Do not add gradients randomly  
❌ Do not use different border radius (stick to `rounded-xl` or `rounded-lg`)  
❌ Do not invent new card styles  
❌ Do not center everything  
❌ Do not use `rounded-2xl` (use `rounded-xl`)  
❌ Do not use `shadow-card` (use `shadow-sm`)  

---

END OF DESIGN DNA V2
