# Meal Planner — UI Design Guideline

> A "Softly" themed design system for a meal planning app.
> The UI should feel like a **digital living room** — minimalistic, tactile, and intentionally slow.
> Built on **React 18 + Tailwind CSS v4 + Framer Motion + Lucide icons**.

---

## 1. Design Philosophy

| Principle | Description |
|---|---|
| **Digital living room** | Warm, desaturated pastels with paper-like grain textures. The app feels like a well-loved cookbook on a kitchen counter — not a data dashboard. |
| **Intentionally slow** | Low-velocity, fluid animations. No snappy micro-interactions — everything eases in gently. The pace encourages mindful planning. |
| **Content-first** | Food imagery and recipe data take centre stage. Chrome recedes into soft, blurred backgrounds. |
| **Progressive disclosure** | Dropdowns, expandable panels, and contextual actions keep the interface clean. Show only what the user needs at each step. |
| **Accessible by default** | WCAG 2.1 AA minimum. Skip links, focus rings, ARIA labels, and `prefers-reduced-motion` support are non-negotiable. |

---

## 2. Colour System

### 2.1 Core Palette

| Name | Token | Hex | Usage |
|---|---|---|---|
| **Background** | `canvas` | `#FDFCF8` | Page canvas — warm parchment white |
| **Sage** | `sage` | `#E8EFE8` | Card tints, secondary backgrounds, tags |
| **Lavender** | `lavender` | `#EFEDF4` | Alternate card tints, accent backgrounds |
| **Pine needle** | `pine` | `#138426` | **Primary accent** — buttons, active states, brand mark |
| **Dark text** | `dark` | `#292524` | Headlines, nav CTA pill, high-emphasis text |
| **Muted text** | `muted` | `#78716C` | Body copy, secondary labels, captions |

### 2.2 Extended Pine Scale (generated from primary)

| Token | Hex | Usage |
|---|---|---|
| `pine-50` | `#f0faf1` | Tinted backgrounds, hover fills |
| `pine-100` | `#d1f0d5` | Light badges, tag backgrounds |
| `pine-200` | `#a3e0ab` | Borders on active cards |
| `pine-300` | `#5cc06a` | Secondary icon tints |
| `pine-400` | `#2da33e` | Subtle accents, health-dot online |
| `pine-500` | `#138426` | **Primary buttons, links, active nav** |
| `pine-600` | `#0f6b1e` | Hover state for primary buttons |
| `pine-700` | `#0b5417` | Pressed / focus state |

### 2.3 Neutral — Stone (Tailwind built-in)

| Token | Usage |
|---|---|
| `stone-50` | Input backgrounds, form fields |
| `stone-100` | Divider lines, card borders, accordion borders |
| `stone-200` | Input borders (rest), nav border |
| `stone-300` | Disabled text, placeholder |
| `stone-400` | Timestamps, captions, muted text |
| `stone-500` | Secondary body text (≈ `#78716C`) |
| `stone-700` | Primary body text |
| `stone-800` | Card titles, emphasis text |
| `stone-900` | Headlines, nav items — map to `#292524` |

### 2.4 Semantic

| Name | Token / Hex | Usage |
|---|---|---|
| Error | `red-400` | Validation errors, health-dot offline |
| Warning | `amber-400` | Allergen badges, expiry notices |
| Success | `pine-400` | Confirmations, health-dot online |
| Blob pink | `#FFE4E1` | Decorative hero blob (60% opacity) |
| Blob violet | `#E6E6FA` | Decorative hero blob (60% opacity) |

---

## 3. Typography

### 3.1 Font Stack

| Role | Family | Import |
|---|---|---|
| **Primary** | Outfit (400, 500, 600, 700) | Google Fonts |
| **Accent / expressive** | Reenie Beanie (cursive) | Google Fonts |
| **Fallback** | `system-ui, sans-serif` | — |

### 3.2 Scale

| Role | Style | Example classes |
|---|---|---|
| **Hero headline** | Outfit 700, 48–72 px, tracking-tight | `text-5xl sm:text-7xl font-bold tracking-tight` |
| **Hero cursive accent** | Reenie Beanie, 64–96 px, inline within headline | `font-[Reenie_Beanie] text-7xl sm:text-8xl text-pine-500` |
| **Section heading** | Outfit 600, 28–36 px, tracking-tight | `text-3xl font-semibold tracking-tight` |
| **Card title** | Outfit 500, 18–20 px | `text-lg font-medium text-stone-800` |
| **Nav link** | Outfit 500, 14 px | `text-sm font-medium` |
| **Nav CTA** | Outfit 500, 14 px, in pill | `text-sm font-medium text-white` |
| **Body** | Outfit 400, 14–16 px, relaxed leading | `text-sm leading-relaxed` or `text-base leading-relaxed` |
| **Caption / meta** | Outfit 400, 14 px | `text-sm text-stone-400` |
| **Label** | Outfit 500, 12 px | `text-xs font-medium text-stone-500` |
| **Button text** | Outfit 500, 14–16 px | `text-sm font-medium` or `text-base font-medium` |

### 3.3 Copywriting Tone

- Friendly, warm, second-person ("Plan meals you'll *actually* look forward to").
- **Sentence-case only** — no uppercase labels or buttons. The Softly aesthetic avoids shouting.
- Sprinkle cursive Reenie Beanie for one expressive word per section (e.g., "Plan your *delicious* week").
- Avoid jargon — say "cooking time" not "prep + cook duration".

---

## 4. Visual Effects

### 4.1 Grain / Noise Overlay

A global texture layer that makes the flat design feel analog and paper-like.

```
Position:           fixed, inset-0, z-[999], pointer-events-none
Background:         SVG feTurbulence filter (baseFrequency: 0.65)
Mix-blend-mode:     overlay
Opacity:            0.35
```

Implementation: A `<GrainOverlay />` component rendered once at the root level, outside all content.

### 4.2 Border Radius

All containers use **high-radius rounded corners** for the soft, approachable feel:

| Element | Radius |
|---|---|
| Cards, panels | `rounded-3xl` (24 px) or `rounded-[2rem]` |
| Nav bar pill | `rounded-full` |
| Buttons | `rounded-full` (pill shape) |
| Inputs | `rounded-full` |
| Modals / sheets | `rounded-[2rem]` top corners |
| Small badges / tags | `rounded-full` |

### 4.3 Shadows

Soft, barely-there shadows to avoid harsh edges:

```
Default card:       shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]
Hover / elevated:   shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]
Nav bar:            shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]
CTA button:         shadow-[0_4px_20px_-2px_rgba(19,132,38,0.25)]   (pine-tinted)
```

### 4.4 Background Blobs (Hero)

Two large blurred decorative shapes behind hero content:

| Blob | Colour | Position | Size | Blur |
|---|---|---|---|---|
| Pink | `#FFE4E1` | Top-left quadrant | `w-[500px] h-[500px]` | `blur-[120px]` |
| Violet | `#E6E6FA` | Bottom-right quadrant | `w-[400px] h-[400px]` | `blur-[100px]` |

Both at 60% opacity. Apply a slow floating animation (see Section 11).

---

## 5. Layout & Grid

| Property | Value |
|---|---|
| Max content width | `max-w-5xl` (1024 px) |
| Horizontal padding | `px-4` mobile, `px-6` desktop (16 / 24 px) |
| Responsive breakpoints | `sm:` (640 px) primary, `lg:` (1024 px) for 3-col grids |
| Card grid | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` |
| Vertical rhythm | Sections separated by `py-16 sm:py-24`; generous breathing room |
| Dividers | **None** — the Softly style avoids hard lines. Use spacing and colour shifts to separate sections. |

### Spacing

Prefer multiples of 4. Key values: `gap-4`, `gap-6`, `gap-8`, `p-6`, `p-8`, `py-16`, `py-24`.

---

## 6. Navigation — Floating Pill Nav with Dropdowns

The navigation is a **floating pill-shaped bar** inspired by the Softly aesthetic, containing the mealplanner's three-group structure.

### 6.1 Structure

```
         ┌──────────────────────────────────────────────────┐
         │  (●) Logo    Home    Meals ▾    Account ▾   [CTA]│
         └──────────────────────────────────────────────────┘
                          │       │            │
                          │       ▼            ▼
                          │  ┌──────────┐  ┌──────────────┐
                       (link)│Plan meals │  │ 👤 Profile   │
                          │Browse     │  │ ❤️ Favourites │
                          │ recipes   │  │ ⚙️ Settings   │
                          │Cookbook    │  │──────────────│
                          └──────────┘  │ ↪ Logout     │
                                        └──────────────┘
```

### 6.2 Nav Bar Visual Style

| Property | Value |
|---|---|
| Position | `fixed top-4 left-1/2 -translate-x-1/2 z-50` (floating, centred) |
| Width | `max-w-[calc(100%-32px)]` on mobile, auto on desktop |
| Background | `bg-white/70 backdrop-blur-[20px]` |
| Border | None (shadow only) |
| Shadow | `shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]` |
| Shape | `rounded-full` |
| Height | `h-14` (56 px) |
| Padding | `px-4 sm:px-6` |

### 6.3 Nav Elements

| Element | Style |
|---|---|
| **Logo mark** | `w-8 h-8 rounded-full bg-pine-500` with centred white dot (`w-2 h-2 rounded-full bg-white`) |
| **Logo text** | `text-sm font-semibold text-stone-900 tracking-tight` — "Meal Planner" |
| **Nav links (rest)** | `text-sm font-medium text-stone-500` |
| **Nav links (hover)** | `text-stone-800 transition-colors duration-300` |
| **Nav links (active)** | `text-pine-500 font-medium` |
| **CTA pill** (optional) | `bg-stone-900 text-white text-sm font-medium rounded-full px-5 py-2 hover:bg-stone-800` |
| **Health dot** | `w-1.5 h-1.5 rounded-full` — pine-400 / red-400 / stone-300 |

### 6.4 Navigation Items

| Group | Label | Type | Route / Action |
|---|---|---|---|
| **1** | Home | Direct link | `/` |
| **2** | Meals | Dropdown trigger | — |
| 2.1 | Plan meals | Dropdown item | `/meal-plan` |
| 2.2 | Browse recipes | Dropdown item | `/recipes` |
| 2.3 | Cookbook | Dropdown item | `/cookbook` |
| **3** | Account | Dropdown trigger | — |
| 3.1 | Profile | Dropdown item | `/profile` |
| 3.2 | Favourites | Dropdown item | `/favourites` |
| 3.3 | Settings | Dropdown item | `/settings` |
| 3.4 | Logout | Dropdown item (destructive) | POST `/api/logout` |

### 6.5 Dropdown Behaviour

| Aspect | Specification |
|---|---|
| **Trigger** | Click to toggle (not hover-only — for accessibility) |
| **Open animation** | Framer Motion: `opacity 0→1`, `y: -8→0`, `scale: 0.95→1`, duration 200 ms, ease-out |
| **Close** | Click outside, press `Escape`, or navigate to a link |
| **Positioning** | Anchored below trigger, centred on trigger |
| **Z-index** | `z-50` |
| **Keyboard** | `Enter`/`Space` to open, `Arrow ↓/↑` to navigate, `Escape` to close |
| **ARIA** | Trigger: `aria-haspopup="true"`, `aria-expanded`. Menu: `role="menu"`. Items: `role="menuitem"`. |

### 6.6 Dropdown Visual Style

```
Container:      bg-white rounded-2xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]
                border border-stone-100/50
                py-2 min-w-[200px]
                mt-2

Item:           px-4 py-3 text-sm text-stone-600 rounded-xl mx-1
                hover:bg-sage transition-colors duration-200

Active item:    bg-sage text-pine-600 font-medium

Icon:           Lucide icon, 16px, text-stone-400, mr-3
                (UtensilsCrossed, Search, BookOpen, User, Heart, Settings, LogOut)

Separator:      h-px bg-stone-100 my-1 mx-3   (before Logout)

Logout:         text-red-500 hover:bg-red-50 hover:text-red-600
```

### 6.7 Mobile Navigation

On screens below `sm` (< 640 px):
- Nav bar shrinks to logo + hamburger icon only.
- Hamburger opens a **full-screen overlay** with `bg-white/95 backdrop-blur-[20px]`.
- Menu items stacked vertically, grouped with subtle section labels in Reenie Beanie.
- Group headers ("Meals", "Account") are static labels; items are direct links.
- Close via `X` icon or swipe down.
- Framer Motion: slide down from top, 300 ms ease-out.

---

## 7. Hero Section

The hero uses the Softly aesthetic: blurred background blobs, large typography with a cursive accent, and pill-shaped CTAs.

### 7.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│         ○ pink blob (blurred)        ○ violet blob          │
│                                                             │
│                   Plan meals you'll                         │   Outfit 700, 48-72px
│                   actually love                             │   text-stone-900
│                                                             │
│            Discover recipes, plan your week, and            │   Outfit 400, 16px
│            cook with confidence.                            │   text-stone-500, max-w-md
│                                                             │
│         [ Browse recipes ]   [ Plan my week ]               │   Pill buttons
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Specifications

| Property | Value |
|---|---|
| Height | `min-h-[80vh]` — generous, breathing room |
| Background | `bg-canvas` (`#FDFCF8`) — no photo, blobs provide visual interest |
| Layout | `flex flex-col items-center justify-center text-center px-6` |
| Headline | `text-5xl sm:text-7xl font-bold tracking-tight text-stone-900` |
| Cursive word | `font-[Reenie_Beanie] text-pine-500` — inline, e.g. "actually *love*" |
| Sub-headline | `text-base sm:text-lg text-stone-500 leading-relaxed max-w-md mt-6` |
| CTA primary | `bg-pine-500 text-white rounded-full px-8 py-3.5 font-medium shadow-[0_4px_20px_-2px_rgba(19,132,38,0.25)] hover:bg-pine-600` |
| CTA secondary | `bg-white text-stone-700 rounded-full px-8 py-3.5 font-medium border border-stone-200 hover:border-stone-300` |
| CTA gap | `flex flex-col sm:flex-row gap-4 mt-10` |
| Top padding | `pt-24` to clear the floating nav |

---

## 8. Meal Grid / Empty State Section

Directly below the hero. Shows **planned meals** or an **empty-state CTA**.

### 8.1 Section Container

```
<section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
  <h2 className="text-3xl font-semibold tracking-tight text-stone-900 mb-2">
    Your upcoming meals
  </h2>
  <p className="text-base text-stone-500 mb-10">
    What's cooking this week.
  </p>
  {/* Grid or Empty State */}
</section>
```

### 8.2 Populated State — Meal Card Grid

Layout: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`

Each **Meal Card**:

```
┌──────────────────────────────┐
│                              │
│       (recipe image)         │   h-44, rounded-t-3xl, object-cover
│                              │
├──────────────────────────────┤
│                              │   rounded-b-3xl, p-5
│  Monday · Breakfast          │   text-xs font-medium text-pine-500
│  Overnight oats with berries │   text-lg font-medium text-stone-800
│  🕐 15 min  ·  🔥 380 cal   │   text-sm text-stone-400
│  [vegetarian] [high-fiber]   │   bg-sage text-stone-700 rounded-full px-3 py-1 text-xs
│                              │
└──────────────────────────────┘

Container:  bg-white rounded-3xl
            shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]
            hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]
            transition-shadow duration-300
            overflow-hidden
```

- Cards link to `/recipes/:id`.
- Framer Motion: `whileHover={{ y: -4, transition: { duration: 0.3 } }}`.
- Respects `prefers-reduced-motion`.

### 8.3 Empty State — "Plan your meals now"

Centred in the section when no meals are planned:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│              ┌─────────────────────┐                │
│              │                     │                │
│              │    🍽  (icon)       │                │   w-44 h-44, rounded-full
│              │                     │                │   bg-pine-500, text-white
│              │   Plan your         │                │   hover:bg-pine-600
│              │   meals now         │                │   shadow with pine tint
│              │                     │                │
│              └─────────────────────┘                │
│                                                     │
│         No meals planned yet — let's fix that.      │   text-base text-stone-500
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Specifications:**

| Property | Value |
|---|---|
| Container | `flex flex-col items-center justify-center py-16` |
| Shape | `w-44 h-44 rounded-full` (176 px) |
| Background | `bg-pine-500 hover:bg-pine-600 transition-colors duration-300` |
| Text colour | `text-white` |
| Icon | Lucide `UtensilsCrossed` or `ChefHat`, 36 px, centred above label |
| Label | "Plan your meals now" — `text-sm font-medium` |
| Shadow | `shadow-[0_4px_20px_-2px_rgba(19,132,38,0.25)]` (pine-tinted) |
| Hover shadow | `shadow-[0_8px_30px_-4px_rgba(19,132,38,0.35)]` |
| Animation | `whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}`, `whileTap={{ scale: 0.97 }}` |
| Link target | `/meal-plan` |
| Focus | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-4` |
| Sub-text | `text-base text-stone-500 mt-8 text-center max-w-sm` — "No meals planned yet — let's fix that." |

---

## 9. Buttons

### 9.1 Variants

| Variant | Classes |
|---|---|
| **Primary (pine pill)** | `bg-pine-500 text-white rounded-full font-medium hover:bg-pine-600 shadow-[0_4px_20px_-2px_rgba(19,132,38,0.25)]` |
| **Secondary (white pill)** | `bg-white text-stone-700 rounded-full font-medium border border-stone-200 hover:border-stone-300` |
| **Dark pill** | `bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800` (nav CTA) |
| **Ghost** | `text-stone-500 hover:text-stone-800 transition-colors` |
| **Destructive** | `text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl` |
| **CTA circle** | `rounded-full bg-pine-500 text-white` (see Section 8.3) |

### 9.2 Common Properties

```
All pill buttons:
  text-sm font-medium
  px-6 py-3  (default)
  px-8 py-3.5  (hero CTAs — larger)
  rounded-full
  transition-all duration-300
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-pine-500
  focus-visible:ring-offset-2
  cursor-pointer
```

---

## 10. Cards

### 10.1 Base Card

```
bg-white rounded-3xl
shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]
overflow-hidden
hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]
transition-shadow duration-300
```

### 10.2 Recipe Card

- Image: `h-44 w-full object-cover`, lazy loaded, top corners rounded with container.
- Body padding: `p-5`.
- Title: `text-lg font-medium text-stone-800 mb-1`.
- Description: `text-sm text-stone-500 line-clamp-2 mb-3`.
- Meta row: Lucide icons (`Clock`, `Flame`, `Dumbbell`) + `text-sm text-stone-400`.
- Tags: `bg-sage text-stone-700 rounded-full px-3 py-1 text-xs font-medium`.
- Hover lift: Framer Motion `whileHover={{ y: -4 }}`, 300 ms.

### 10.3 Scenario / Quick-Action Card (Horizontal Scroll)

Adapted from the Softly horizontal scroll pattern — shows meal scenario shortcuts:

```
┌─────────────────────────────────┐
│  7:30 am                        │   text-sm text-stone-400
│                                 │
│                                 │   w-[288px] h-[160px]
│  Quick weeknight                │   bg-white rounded-3xl p-6
│  dinners                        │   text-xl font-medium text-stone-800
│                                 │   hover:text-pine-500 transition
└─────────────────────────────────┘
```

Container: `flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4`
Cards: `snap-start flex-shrink-0`

### 10.4 Meal Plan Day Card

```
┌────────────────────────────────────┐
│                                    │   bg-white rounded-3xl p-6
│  Monday, Feb 24                    │   text-xs font-medium text-stone-400
│                                    │
│  Breakfast · Overnight Oats        │   text-sm, meal type in font-medium
│  Lunch · Grilled Chicken Bowl      │   text-stone-800
│  Dinner · Salmon & Asparagus       │
│                                    │
│  1,840 cal · 142g protein          │   text-sm text-stone-400
│                                    │
└────────────────────────────────────┘
```

### 10.5 Cookbook Note Card (Testimonial-style)

Adapted from the Softly diary entries — shows recipe history/notes:

```
┌────────────────────────────────────┐
│                                    │   bg-white rounded-3xl p-6
│  "Made this for date night and     │   text-base text-stone-700 italic
│   it was absolutely perfect."      │
│                                    │
│  ────────                          │   w-8 h-px bg-stone-300
│  jacob                             │   font-[Reenie_Beanie] text-2xl text-stone-500
│                                    │
│  Salmon & Asparagus · Feb 14       │   text-sm text-stone-400
│                                    │
└────────────────────────────────────┘

Rotation: rotate-[1deg] or rotate-[-1deg] alternating
          to mimic physical recipe notes.
```

---

## 11. Animation & Motion

**Library:** Framer Motion — all animations are **slow and fluid** to match the Softly aesthetic.

| Pattern | Config |
|---|---|
| **Reveal on scroll** | `opacity: 0→1`, `y: 30→0`, duration 800 ms, ease-out. Triggered via `whileInView` with `viewport={{ once: true, amount: 0.3 }}` |
| **Stagger children** | `staggerChildren: 0.15` |
| **Card hover lift** | `whileHover={{ y: -4 }}`, duration 300 ms |
| **Image hover zoom** | CSS `transition-transform duration-700 group-hover:scale-105` |
| **Dropdown open** | `opacity: 0→1`, `y: -8→0`, `scale: 0.95→1`, 200 ms ease-out |
| **CTA button** | `whileHover={{ scale: 1.05 }}`, `whileTap={{ scale: 0.97 }}`, 300 ms |
| **Background blob float** | `y: [0, -10, 0, 10, 0]`, 6 s loop, ease-in-out, `repeat: Infinity` |
| **Mobile menu** | Slide from top: `y: "-100%"→0`, 300 ms ease-out |
| **FAQ accordion** | Height `0→auto`, 500 ms ease-in-out, plus icon rotates 45 deg |
| **Reduced motion** | All animations gated by `useReducedMotion()`. When true, animations are disabled entirely (`initial={false}`). |

---

## 12. Form Controls

Inputs use the soft, rounded Softly style:

| Element | Style |
|---|---|
| **Text input** | `w-full bg-stone-50 rounded-full px-5 py-3 text-sm text-stone-700 placeholder:text-stone-400 border-none outline-none focus:ring-2 focus:ring-pine-400 transition-all duration-200` |
| **Search input** | Same as text input + Lucide `Search` icon (16 px, `text-stone-400`) inside left padding |
| **Select** | Same base + `appearance-none` with custom `ChevronDown` |
| **Checkbox** | Custom: `w-5 h-5 rounded-lg border-2 border-stone-200 checked:bg-pine-500 checked:border-pine-500 transition-colors` |
| **Label** | `text-xs font-medium text-stone-500 mb-2 block` |
| **Error message** | `text-xs text-red-500 mt-1.5` |
| **Field group spacing** | `space-y-5` between fields |
| **Submit button** | Dark pill: `bg-stone-900 text-white rounded-full px-8 py-3 font-medium hover:scale-105 transition-transform` |

---

## 13. Special Components

### 13.1 Grain Overlay

```tsx
// <GrainOverlay /> — render once at root level
<div
  className="fixed inset-0 z-[999] pointer-events-none mix-blend-overlay opacity-35"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
  }}
/>
```

### 13.2 FAQ Accordion

```
Container:    bg-white rounded-2xl border border-stone-100

Header:       p-6, font-medium text-stone-800, flex justify-between
              Plus icon (Lucide `Plus`, 20px) rotates 45° on open

Content:      Transition height 0→auto, 500ms ease-in-out
              pb-6 px-6, text-sm text-stone-500 leading-relaxed

Items:        Separated by h-px bg-stone-100
```

### 13.3 Loading Spinner

```
Animated ring: border-2 border-stone-200 border-t-pine-500
               w-8 h-8 rounded-full animate-spin
Accessibility: role="status", sr-only "Loading…" text
```

---

## 14. Iconography

**Library:** Lucide React (`lucide-react`)

| Context | Icons |
|---|---|
| Navigation | `Menu`, `X`, `ChevronDown` |
| Meals dropdown | `UtensilsCrossed` (plan), `Search` (browse), `BookOpen` (cookbook) |
| Account dropdown | `User` (profile), `Heart` (favourites), `Settings`, `LogOut` |
| Recipe meta | `Clock` (time), `Flame` (calories), `Dumbbell` (protein) |
| Empty state CTA | `UtensilsCrossed` or `ChefHat` |
| Forms | `Search`, `ChevronDown`, `Plus`, `X` |
| Status | Health dot (CSS circle, not an icon) |

**Size convention:** 16 px for inline/meta, 20 px for nav/accordion, 36 px for empty-state CTA.

---

## 15. Imagery

| Aspect | Guideline |
|---|---|
| Source | Unsplash, deterministic by recipe ID hash (existing `RecipeCard.tsx` pattern) |
| Format | `fm=jpg`, `cs=tinysrgb`, `crop=entropy` |
| Hero | **No photo** — blurred colour blobs on the canvas background |
| Card thumbnails | `w=800&h=600&q=75`, `loading="lazy"` |
| Aspect ratios | Cards: 4 : 3. Detail hero: 16 : 9. |
| Fallback | Solid `bg-sage` with centred Lucide `ImageOff` icon in `text-stone-400` |
| Treatment | Slight desaturation (`filter: saturate(0.9)`) for a muted, warm feel |

---

## 16. Accessibility Checklist

- [ ] Skip-to-content link as first focusable element
- [ ] All interactive elements have visible `focus-visible` ring (2 px, pine-500 with offset)
- [ ] Dropdown menus use `role="menu"` / `role="menuitem"`, `aria-haspopup`, `aria-expanded`
- [ ] Loading states have `role="status"` and `sr-only` descriptive text
- [ ] Images have descriptive `alt` text (not just "food photo")
- [ ] Colour contrast: minimum 4.5 : 1 for text, 3 : 1 for large text and UI components
- [ ] Grain overlay has `pointer-events: none` and no effect on screen readers
- [ ] Forms: every input has an associated `<label>`, errors linked via `aria-describedby`
- [ ] `prefers-reduced-motion` disables all Framer Motion animations and blob floating
- [ ] Touch targets: minimum 44 × 44 px on mobile
- [ ] Logout action: confirm before executing (modal or inline prompt)

---

## 17. Page Map

```
/                   Home — Hero (blobs + headline) + Meal Grid / Empty State
/recipes            Browse Recipes — Search + filter + card grid
/recipes/:id        Recipe Detail — Full recipe view
/meal-plan          Plan Meals — Generate weekly plan form + results
/cookbook            Cookbook — History of cooked & saved recipes (note cards)
/profile            Profile — User info, dietary preferences
/favourites         Favourites — Saved / bookmarked recipes
/settings           Settings — App preferences, notifications
```

---

## 18. Responsive Behaviour Summary

| Breakpoint | Layout |
|---|---|
| **< 640 px** (mobile) | Single column. Floating nav collapses to logo + hamburger → full-screen overlay menu. Full-width cards. Hero at `min-h-[80vh]`. CTA buttons stack vertically. Horizontal scenario cards scroll natively. |
| **≥ 640 px** (desktop) | Multi-column grids (2–3 col). Full floating pill nav with dropdown menus. Side-by-side CTAs. |

---

## 19. Tailwind Theme Configuration

Add these tokens to `index.css` alongside the existing `@theme` block:

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Reenie+Beanie&display=swap');
@import 'tailwindcss';

@theme {
  --font-sans: 'Outfit', system-ui, sans-serif;
  --font-cursive: 'Reenie Beanie', cursive;

  /* Pine needle — primary accent */
  --color-pine-50:  #f0faf1;
  --color-pine-100: #d1f0d5;
  --color-pine-200: #a3e0ab;
  --color-pine-300: #5cc06a;
  --color-pine-400: #2da33e;
  --color-pine-500: #138426;
  --color-pine-600: #0f6b1e;
  --color-pine-700: #0b5417;

  /* Softly palette */
  --color-canvas:   #FDFCF8;
  --color-sage:     #E8EFE8;
  --color-lavender: #EFEDF4;
  --color-dark:     #292524;
  --color-muted:    #78716C;
}

body {
  margin: 0;
  font-family: 'Outfit', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #FDFCF8;
  color: #292524;
}
```

---

## 20. Dark Mode (Future)

Not currently implemented. When added:
- Canvas `#FDFCF8` → `#1C1917` (stone-900).
- Surface `white` → `#292524` (stone-800).
- Text: `stone-900` → `stone-100`, `stone-500` → `stone-400`.
- Pine palette remains unchanged (vibrant enough for both modes).
- Grain overlay: reduce opacity to `0.20` on dark mode.
- Blob colours: shift to deeper, muted variants.
- Gate via `prefers-color-scheme` and a manual toggle in Settings.

---

*Last updated: 2026-02-21*
