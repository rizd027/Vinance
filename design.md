# Clean Fintech Neo-Minimalism
### Style & Interface Design Specification | **Cuan (Vinance Ecosystem)**

This document defines the design guidelines, structural patterns, and aesthetic principles for the **Cuan** application. Inspired by the market leaders of modern fintech—**Apple Card**, **Wise**, and **Revolut**—this system outlines how to deliver a world-class, premium, and highly tactile user experience that feels alive, mathematically balanced, and beautiful.

---

## 1. Core Philosophy: Neo-Minimalism in Wealth Tech

Neo-Minimalism is not about empty space; it is about **absolute clarity, spatial ergonomics, and premium tactile feedback**. In financial applications, users demand speed, trustworthiness, and effortless readability. We achieve this through four pillars:

*   **Typographic Dominance**: Numbers and financial values are treated as hero components. We use high-precision tracking, mathematical weights, and specific layout rules to make balances readable at a glance.
*   **Layered Spatial Elevation**: Instead of generic flat cards, we use high-contrast borders combined with glassmorphism and layered shadows, simulating physical panels with real elevation.
*   **Curated Tactile Responses**: Every interactable element (buttons, tabs, selectors) must feel springy and responsive to the user's touch or cursor hover.
*   **Curated Financial Hues**: Avoiding generic primaries. We use HSL-tailored harmonious gradients, slate backdrops, and functional feedback colors that indicate status without introducing visual noise.

---

## 2. The Color System: Luxury Fintech Palette

Our palette balances the clean usability of **Wise**, the premium metal and glass of **Revolut**, and the organic, luxurious gradients of **Apple Card**.

### A. Base Foundation (Slate & Dark Mode Ecosystem)
```css
:root {
  /* Light Mode (Sophisticated Paper) */
  --bg-main: #f8fafc;         /* Crisp, high-end background */
  --card-bg: #ffffff;         /* Pure white elevation */
  --border-ui: #e2e8f0;       /* Razor-thin subtle divider */
  --text-primary: #0f172a;    /* Deep charcoal */
  --text-secondary: #475569;  /* Balanced slate gray */
  --accent: #6366f1;          /* Royal Indigo (Primary Action) */
  --secondary: #d946ef;       /* Hyper Magenta */

  /* Dark Mode (High-Density Onyx) */
  --bg-main-dark: #090d16;    /* Deep luxury space */
  --card-bg-dark: #121826;    /* Obsidian glass card */
  --border-ui-dark: #1e293b;  /* Deep navy borders */
  --text-primary-dark: #f8fafc; /* Crisp snow text */
  --text-secondary-dark: #94a3b8; /* Cool silver slate */
}
```

### B. Functional Colors (Fintech Hues)
We avoid bright neon primaries. Instead, we use highly saturated, tailored functional feedback colors:
*   **Income / Surplus (Wise Emerald)**: `#10b981` (HSL: `160, 84%, 39%`) -> Represents growth and security.
*   **Expense / Debt (Apple Crimson)**: `#f43f5e` (HSL: `350, 89%, 60%`) -> Represents warnings and active out-flows.
*   **Alert / Warning (Metal Gold)**: `#f59e0b` (HSL: `38, 92%, 50%`) -> Represents pending status or critical allocation.

### C. Glassmorphism & Micro-Gradients (Revolut/Apple Inspired)
To emulate a physical card or glass surface:
*   **Apple Card Hues**: `linear-gradient(135deg, #8b5cf6, #d946ef)` (Indigo to Magenta) or `linear-gradient(135deg, #0ea5e9, #10b981)` (Sky to Emerald).
*   **Tactile Frosted Glass**: `rgba(255, 255, 255, 0.7)` with `backdrop-filter: blur(20px)` and an inner `1px` border of `rgba(255, 255, 255, 0.4)`.

---

## 3. Typography: Typographic Mathematical Scale

Financial metrics must look sharp and perfectly aligned. The font system uses **Inter** (for dense data tables) and **Outfit** or **SF Pro Display** (for hero values and titles).

| Level | Size (px) | Weight | Tracking (Letter Spacing) | Purpose / Context |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Balance** | `36px` / `2.25rem` | **900 (Black)** | `-0.05em` (Tighter) | Global net worth, total budget values |
| **Tab Header** | `24px` / `1.5rem` | **900 (Black)** | `-0.03em` | Main section titles (Desktop & Mobile) |
| **Section Title** | `14px` / `0.875rem` | **700 (Bold)** | `+0.05em` | Card labels, widget headers |
| **Metric Label** | `10px` / `0.625rem` | **900 (Black)** | `+0.2em` (Spaced) | Uppercase sub-headers, indicators |
| **Body Primary** | `13px` / `0.8125rem` | **500 (Medium)** | `-0.01em` | Standard list items, transaction notes |
| **Micro Timestamp** | `10px` / `0.625rem` | **500 (Medium)** | `0` | Date and time markings, secondary logs |

### Monospace for Numbers (Crucial Rule)
All financial figures (e.g., `Rp 120.000.000`) should use a tabular or monospaced digit style (`font-variant-numeric: tabular-nums;` or custom font family) to prevent visual layout shifts during real-time syncs or filter transitions.

---

## 4. Spacing, Grids & Elevation Layering

Fintech Neo-Minimalism relies heavily on **uncluttered asymmetry** and **purposeful spacing**.

### A. The 5-Column Dashboard Grid
We replace standard 50/50 splits with an asymmetrical, high-density dashboard structure to align stats and visual representations correctly:
*   **Widget & Stats Columns (60% Width)**: Large space for values, transaction list details, progress bar indicators, and notes.
*   **Visual Chart Column (40% Width)**: Perfectly bound space for compact radial dials or pie chart legendary scales.

### B. Elevation Levels (Borders & Shadows)
Instead of relying on deep blurred shadows that look muddy, we utilize crisp, micro-borders combined with flat tactile offsets:

```css
/* Card Elevation Layer 1 (Wise Style) */
.card-level-1 {
  background-color: var(--card-bg);
  border: 1px solid var(--border-ui);
  border-radius: 12px; /* Decreased corner radius for high-end look */
  box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03), 
              0 1px 2px -1px rgba(15, 23, 42, 0.03);
}

/* Premium Hover State (Revolut Style) */
.card-level-1:hover {
  border-color: rgba(99, 102, 241, 0.3); /* Subtle indigo highlight */
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.05), 
              0 4px 6px -4px rgba(15, 23, 42, 0.05);
  transform: translateY(-2px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 5. Micro-Animations & Tactile Physics

Fintech interactions must feel satisfying. Elements should feel like physical buttons that compress slightly under pressure.

### A. The "Springy" Active Effect
Every primary button or navigation icon must compress on click:
```css
.btn-tactile {
  transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.btn-tactile:active {
  transform: scale(0.95);
}
.btn-tactile:hover {
  transform: scale(1.03);
}
```

### B. Smooth Tab Transitions
When moving buttons to the portal (global header) or changing tabs:
*   Use `ease-out` transitions for position shifts (duration: `200ms` max).
*   Avoid flashy entrance animations; rely instead on subtle opacity sweeps (`opacity 0.15s ease-out`).

---

## 6. Concrete Styling Recipes

### A. The Wise-Style Premium Transaction Card
A clean, high-density layout featuring category icons, transaction details, and HSL currency coloring.

```html
<div class="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/20 transition-all group">
  <!-- Left Side: Icon & Details -->
  <div class="flex items-center gap-3.5">
    <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner group-hover:bg-emerald-100 transition-colors">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <!-- Lucide Wallet/Icon -->
      </svg>
    </div>
    <div class="flex flex-col">
      <span class="text-xs font-bold text-slate-900 tracking-tight">Investasi Saham</span>
      <span class="text-[10px] font-medium text-slate-400 mt-0.5">17 May 2026, 10:30</span>
    </div>
  </div>

  <!-- Right Side: Amount & Action -->
  <div class="flex items-center gap-4">
    <span class="text-xs font-black text-emerald-600 tracking-tight currency-font">+Rp 5.000.000</span>
    <button class="p-1.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
      <!-- Edit/Action Icon -->
    </button>
  </div>
</div>
```

### B. The Apple-Style Glassmorphic Header Action
A clean, premium button designed to reside in the global top header via dynamic Portal rendering.

```html
<button class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all mr-2">
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
  </svg>
  <span>Tambah Anggaran</span>
</button>
```

---

## 7. Implementation Checklist (Design System Quality Audit)

*   [ ] **Strict Corner Radii**: No card exceeds `rounded-xl` (12px) to ensure a premium look. Popups/modals limit to `rounded-2xl` (16px).
*   [ ] **No Floating Action Buttons**: Critical desktop action buttons render in the global sticky top header via `createPortal`, removing clutter.
*   [ ] **Asymmetric Visual Balances**: Layout structures utilize the 3:2 (60% to 40%) desktop ratio to keep charts and statistics proportioned.
*   [ ] **Letter Spacing Controls**: Tighter letter spacing (`tracking-tight` / `-0.03em`) on large financial balances, and loose spacing (`tracking-[0.2em]`) on micro uppercase tags.
*   [ ] **Hover/Active Responsiveness**: Interactable elements implement tactile scaling physics (`hover:scale-[1.02]`, `active:scale-[0.98]`).
