# Warungin Admin – Design DNA (Canonical)

This design DNA is extracted from the Admin Tenant Dashboard HTML.
All future pages MUST visually match this page.

---

## 1. Overall Feel
- Clean SaaS dashboard
- Calm, professional, non-aggressive
- Premium but simple
- No visual noise

---

## 2. Layout Structure (FIXED)

- App Layout:
  - Left Sidebar (fixed)
  - Top Header (80px)
  - Scrollable Content Area

- Content Width:
  - max-w-7xl
  - centered
  - vertical rhythm with large gaps

---

## 3. Spacing System (Observed)

- Section gap: `gap-8`
- Card grid gap: `gap-6`
- Inner card padding:
  - small card: `p-5`
  - large card: `p-6`

❌ No arbitrary spacing

---

## 4. Cards Pattern

### Base Card
- Background: `bg-white dark:bg-slate-800`
- Border: subtle, light gray
- Radius: `rounded-2xl`
- Shadow: `shadow-card`
- Hover: none (except inner elements)

### Stat Card
- Icon top-left
- Value bold & large
- Secondary text muted
- Optional trend badge

---

## 5. Typography Hierarchy

- Page Title:
  - text-3xl
  - font-bold
  - tracking-tight

- Section Title:
  - text-lg
  - font-bold

- Body Text:
  - text-sm
  - text-slate-500

- Numbers:
  - text-2xl
  - font-bold

---

## 6. Color Usage (STRICT)

- Primary blue ONLY for:
  - Active menu
  - Primary buttons
  - Key data highlight

- Never use blue for:
  - Body text
  - Borders
  - Decoration

- Status Colors:
  - Green: positive
  - Yellow: warning
  - Red: critical only

---

## 7. Buttons

- Primary:
  - bg-primary
  - rounded-lg
  - shadow-lg shadow-primary/30

- Secondary:
  - light background
  - subtle border
  - no shadow

---

## 8. Tables

- Header:
  - bg-slate-50
  - text-xs uppercase

- Rows:
  - hover only
  - no zebra striping

---

## 9. Icons
- Material Symbols Outlined
- Size:
  - default: 20px
  - large decorative: 120px (opacity < 10%)

---

## 10. What NOT To Do
❌ Do not add gradients randomly  
❌ Do not change radius  
❌ Do not invent new card styles  
❌ Do not center everything  
❌ Do not use glass blur everywhere  

END OF DESIGN DNA
