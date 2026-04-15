# Bespoke Metal Prints - Consistency Standards

## Brand Colors
- **Primary Orange**: `#ff6b35`
- **Secondary Orange**: `#ff8c42` (hover states)
- **Background Dark**: `#0a0a0a`
- **Card Dark**: `#1a1a1a`
- **Border Dark**: `#2a2a2a`
- **Background Light**: `#ffffff`
- **Card Light**: `#f5f5f5`
- **Border Light**: `#e5e5e5`

## Border Radius Standards
- **Small (inputs, badges)**: `rounded-lg` (8px)
- **Medium (cards)**: `rounded-xl` (12px)
- **Large (modals)**: `rounded-2xl` (16px)
- **Buttons (primary)**: `rounded-full`
- **Icons/Avatars**: `rounded-full`

## Spacing Standards
- **Component Padding**: `p-6` (24px)
- **Section Padding**: `py-16 md:py-24 lg:py-32`
- **Container Padding**: `px-4 sm:px-6 lg:px-8`
- **Gap Small**: `gap-2` (8px)
- **Gap Medium**: `gap-4` (16px)
- **Gap Large**: `gap-6` (24px)

## Typography Standards
- **H1**: `text-4xl md:text-5xl lg:text-6xl font-bold`
- **H2**: `text-3xl md:text-4xl lg:text-5xl font-bold`
- **H3**: `text-2xl md:text-3xl font-bold`
- **H4**: `text-xl md:text-2xl font-semibold`
- **Body**: `text-base text-gray-400 [data-theme='light']_&:text-gray-600`
- **Small**: `text-sm text-gray-500 [data-theme='light']_&:text-gray-500`

## Button Standards
- **Primary**: `px-8 py-4 bg-[#ff6b35] text-white rounded-full hover:bg-[#ff8c42] transition-all hover:scale-105 shadow-lg`
- **Secondary**: `px-8 py-4 bg-white text-[#ff6b35] border-2 border-[#ff6b35] rounded-full hover:bg-[#ff6b35] hover:text-white transition-all hover:scale-105`
- **Small**: `px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff8c42] transition-all`
- **Ghost**: `px-4 py-2 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-all`

## Form Input Standards
- **Text Input**: `w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white focus:ring-2 focus:ring-[#ff6b35]`
- **Light Mode**: `[data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-200 [data-theme='light']_&:text-gray-900`

## Card Standards
- **Base**: `bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6`
- **Hover**: `hover:border-[#ff6b35] hover:shadow-lg transition-all`
- **Light Mode**: `[data-theme='light']_&:bg-white [data-theme='light']_&:border-gray-200`

## Shadow Standards
- **Primary**: `shadow-lg shadow-[#ff6b35]/30`
- **Card**: `shadow-xl`
- **Modal**: `shadow-2xl`

## Transition Standards
- **Default**: `transition-all`
- **Colors**: `transition-colors`
- **Fast**: `transition-all duration-200`
- **Slow**: `transition-all duration-300`

## Loading States
- **Spinner**: Orange (#ff6b35) with `animate-spin`
- **Skeleton**: `bg-[#1a1a1a] animate-pulse rounded-lg` (dark) or `bg-gray-200` (light)

## Status Colors
- **Success**: `#10b981` (green-500)
- **Warning**: `#f59e0b` (yellow-500)
- **Error**: `#ef4444` (red-500)
- **Info**: `#3b82f6` (blue-500)

## Dark/Light Mode Pattern
Always use this pattern for dark/light mode:
```tsx
className="bg-[#1a1a1a] text-white [data-theme='light']_&:bg-white [data-theme='light']_&:text-gray-900"
```
