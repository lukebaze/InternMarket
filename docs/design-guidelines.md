# InternMarket — Design Guidelines

## Design Source
Design file: `internmarket.pen` (Pencil MCP format, 6 screens, 9 reusable components)

## Color System

All colors defined as CSS custom properties in `globals.css`. Reference via Tailwind utilities.

### Backgrounds
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `--bg-page` | `#000000` | `bg-bg-page` | Page background |
| `--bg-surface` | `#111111` | `bg-bg-surface` | Cards, sidebar, elevated surfaces |
| `--bg-border` | `#1A1A1A` | `border-bg-border` | Borders, dividers, subtle lines |

### Text
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `--text-primary` | `#FFFFFF` | `text-text-primary` | Headings, primary content |
| `--text-secondary` | `#999999` | `text-text-secondary` | Secondary labels, metadata |
| `--text-tertiary` | `#6e6e6e` | `text-text-tertiary` | Descriptions, body text |
| `--text-muted` | `#404040` | `text-text-muted` | Most muted (icons, disabled) |

### Accents
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| `--lime` | `#BFFF00` | `bg-lime`, `text-lime` | Primary CTA, active states, badges |
| `--red-error` | `#FF4444` | `text-red-error` | Error states |
| `--amber-warning` | `#F59E0B` | `text-amber-warning` | Warning states |
| `--blue-info` | `#3B82F6` | `text-blue-info` | Info states |

## Typography

### Font Families
| Token | Font | Usage |
|-------|------|-------|
| `--font-ui` | Inter | Headings, labels, UI elements |
| `--font-mono` | JetBrains Mono | Body text, code, badges, descriptions |

### Font Scale (from design)
- Hero title: Inter, 48px, weight 700
- Section title: Inter, 18px, weight 600
- Card name: Inter, 15px, weight 600
- Body text: JetBrains Mono, 12-14px, weight 400
- Badge text: JetBrains Mono, 9px, weight 700
- Nav link: Inter/JetBrains Mono, 13px, weight 500

## Brand
- Logo: `I N T E R N S` — Inter, 15px, weight 600, letter-spacing 3px, white
- Alternate: `interns.market` — JetBrains Mono, 14px, weight 700, lime

## Component Patterns

### Buttons
- **Primary**: Lime bg (`#BFFF00`), black text, JetBrains Mono 12px weight 600, padding 10px 18px
- **Secondary**: Transparent bg, muted icon + tertiary text, JetBrains Mono 12px, padding 10px 14px

### Cards (AgentCard)
- Surface bg (`#111`), border 1px `#1A1A1A`
- Name: Inter 15px, weight 600, white
- Description: JetBrains Mono 12px, tertiary, line-height 1.6
- Footer: rating stars + price in lime

### Nav Items
- **Active**: Surface bg (`#111`), lime left border 2px, white text
- **Inactive**: Transparent bg, muted icon, tertiary text

### Badges
- **Lime**: Lime bg, black text, JetBrains Mono 9px weight 700, padding 4px 10px
- **Outline**: Transparent bg, border 1px `#1A1A1A`, secondary text

### MetricCard
- Surface bg, vertical layout, padding 24px
- Label: JetBrains Mono 12px, tertiary
- Value: Inter 32px, weight 600, white
- Change: JetBrains Mono 12px, lime with arrow

## Layout Patterns

### Header (56px height)
- Full-width, black bg, border-bottom 1px `#1A1A1A`
- Logo left, nav center, actions right
- Horizontal padding 48px

### Dashboard Sidebar (240px wide)
- Surface bg (`#111`), border-right 1px `#1A1A1A`
- Logo top, nav middle, wallet bottom
- Nav items: lucide icons + JetBrains Mono labels
- Active: lime left-border accent

### Content Areas
- Padding 32px typically
- Gap 24px between sections
- Max content width via parent frame (1440px design width)
