# Foodlink – Design System Specification

## 1. Color Palette

The visual identity is crafted to convey warmth, nourishment, hygiene, and sustainability:

- **Warm Cream Backgrounds**:
  - `cream-50`: `#FDFBF7` (Subtle container background)
  - `cream-100`: `#FAF8F5` (Base application canvas)
  - `cream-200`: `#F4EFEA` (Border and separator tint)
  - `cream-300`: `#EDE4DC` (Card borders and subtle rules)

- **Natural Forest Green (Primary)**:
  - `forest-50`: `#F2F8F4`
  - `forest-100`: `#E1EFE7`
  - `forest-600`: `#1E5E3A` (Primary interactive color & buttons)
  - `forest-700`: `#174A2E` (Headings and emphasis)
  - `forest-800`: `#113823`

- **Warm Terracotta & Amber (Accents & Urgency)**:
  - `terracotta-500`: `#EA580C`
  - `terracotta-600`: `#C2410C` (Pickup deadline highlights & active alert actions)
  - Amber (`#D97706`): Approaching expiry and matching alerts

## 2. Typography

- **Family**: `Plus Jakarta Sans`, falling back to `Inter` and modern system sans-serif.
- **Hierarchy**:
  - `Hero Display`: 48px - 60px, ExtraBold (`800`), tight tracking.
  - `H1 / Section Titles`: 30px - 36px, ExtraBold (`800`).
  - `Card Titles`: 18px - 20px, Bold (`700`).
  - `Body Text`: 14px - 16px, Normal (`400`) & Medium (`500`), line-height 1.6.
  - `Metadata / Badges / Subtitles`: 11px - 12px, SemiBold (`600`) or Bold (`700`), uppercase tracking.

## 3. Reusable UI Components

The component library located in `Frontend/src/components/ui/` includes:

1. **`Button`**:
   - Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`, `warm`.
   - Sizes: `sm`, `md`, `lg`.
   - Built-in loading spinner, leading icon support, disabled states, and keyboard focus rings.

2. **`Input`**:
   - Clean floating/stacked labels, leading icon slot, error state, and helper text.

3. **`Select`**:
   - Standardized styled HTML dropdown with custom padding, accessible focus styles, and validation error messages.

4. **`Textarea`**:
   - Multi-line input with resizable control and character guidance.

5. **`Card` & Subcomponents (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`)**:
   - Pure white `#FFFFFF` surface with subtle border `rgba(222, 207, 193, 0.8)` and soft shadow.

6. **`Badge`**:
   - Status indicators: `success`, `warning`, `danger`, `info`, `forest`, `neutral`.
   - Supports optional live blinking or static status dots.

7. **`Modal`**:
   - Accessible dialog with backdrop blur (`backdrop-blur-sm`), Escape key dismissal, and animated entry.

8. **`Table`**:
   - Clean data grid with rounded borders, responsive horizontal scrolling, subtle hover states, and clear column headers.

9. **`Toast`**:
   - Floating notifications positioned in the bottom right corner with slide-in animation and dismiss handlers.

