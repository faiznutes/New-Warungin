# Warungin Admin UI – Design Consistency Contract

This document is a STRICT design contract.
Any generated UI MUST follow these rules without exception.

---

## 1. Design Identity
- Product: Warungin SaaS POS
- Audience: Tenant Admin (SME, Food & Beverage)
- Tone: Professional, Modern, Premium, Calm
- Avoid: playful, neon, flashy, over-decorative UI

---

## 2. Tech Stack (FIXED)
- Framework: Vue 3 (Composition API)
- Styling: Tailwind CSS
- Icons: Material Symbols Outlined
- Font: Inter (300–700)
- Dark Mode: class-based (`dark:`)

---

## 3. Color System (DO NOT DEVIATE)

### Primary
- primary: `#3f68e4`
- primary-hover: `#3558c7`
- primary-light: `#eef2ff`

### Background
- background-light: `#f1f5f9`
- background-dark: `#111521`

### Surface
- surface-light: `#ffffff`
- surface-dark: `#1e2330`

### Text
- text-primary: `#0e111b`
- text-secondary: `#506295`

❌ Do NOT introduce new brand colors  
❌ Do NOT change saturation or hue

---

## 4. Layout Rules

### Global Layout
- Sidebar: fixed, width 280px
- Header: height 80px
- Main content: centered, max-width 1280px
- Spacing scale: 4 / 6 / 8 / 12 / 16 only

### Cards
- Border radius: `rounded-2xl`
- Shadow: soft / card only
- Always use surface colors
- No hard borders unless table/list

---

## 5. Components Rules

### Buttons
- Primary: solid primary color
- Secondary: outline / soft background
- Rounded: `rounded-lg`
- Icon + label preferred

### Tables
- Header: light gray background
- Rows: hover state only
- No vertical borders

### Badges
- Rounded-full
- Soft background
- Small font (text-xs)

---

## 6. Typography
- Headings: font-bold
- Section title: text-lg
- Page title: text-2xl or text-3xl
- Body text: text-sm
- Avoid text-xs except labels

---

## 7. Animations & Effects
- Hover only (no continuous animation)
- Transition: `transition-colors` or `transition-all`
- No bounce, no pulse, no spin

---

## 8. Forbidden Patterns
❌ Glassmorphism overload  
❌ Random gradients  
❌ Different border radius per component  
❌ Mixing icon styles  
❌ Inconsistent spacing  

---

## 9. Consistency Enforcement
If unsure, COPY existing dashboard patterns.
Never invent new visual language.

END OF CONTRACT.
