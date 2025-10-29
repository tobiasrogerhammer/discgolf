# Enhanced Color Scheme Documentation

## 🎨 **Color System Overview**

This document outlines the improved color scheme for the Disc Golf Tracker app, focusing on accessibility, contrast, and semantic naming.

## 🌈 **Color Palette**

### **Primary Colors**

- **Primary**: Blue (#3B82F6) - Main brand color
- **Primary Hover**: Darker blue for interactive states
- **Primary Light**: Very light blue for backgrounds
- **Primary Dark**: Darker blue for emphasis

### **Semantic Colors**

- **Success**: Green (#10B981) - Success states, achievements
- **Warning**: Orange (#F59E0B) - Warnings, cautions
- **Destructive**: Red (#EF4444) - Errors, deletions
- **Info**: Blue (#3B82F6) - Information, tips

### **Neutral Colors**

- **Background**: White (light) / Dark gray (dark)
- **Foreground**: Dark gray (light) / White (dark)
- **Muted**: Light gray for secondary text
- **Card**: White (light) / Dark gray (dark)

## 🎯 **Accessibility Features**

### **High Contrast Support**

- Automatic color adjustments for high contrast mode
- Enhanced contrast ratios for better readability
- Focus indicators with proper contrast

### **Reduced Motion Support**

- Respects `prefers-reduced-motion` setting
- Disables animations for users who prefer reduced motion

### **Focus Indicators**

- Clear focus outlines for keyboard navigation
- Consistent focus styling across all interactive elements

## 🛠️ **Usage Examples**

### **Text Colors**

```css
.text-primary    /* Primary brand color */
/* Primary brand color */
.text-success    /* Success messages */
.text-warning    /* Warning messages */
.text-destructive /* Error messages */
.text-info; /* Information messages */
```

### **Background Colors**

```css
.bg-primary-light    /* Light primary background */
/* Light primary background */
.bg-success-light   /* Light success background */
.bg-warning-light    /* Light warning background */
.bg-destructive-light /* Light error background */
.bg-info-light; /* Light info background */
```

### **Border Colors**

```css
.border-primary     /* Primary border */
/* Primary border */
.border-success      /* Success border */
.border-warning      /* Warning border */
.border-destructive  /* Error border */
.border-info; /* Info border */
```

### **Component Variants**

```css
/* Button variants */
bg-primary hover:bg-primary-hover
bg-success hover:bg-success-hover
bg-warning hover:bg-warning-hover
bg-destructive hover:bg-destructive-hover
bg-info hover:bg-info-hover

/* Card variants */
bg-card border-card-border
bg-card-hover /* On hover */
```

## 🌙 **Dark Mode**

The dark theme automatically adjusts all colors for optimal contrast and readability:

- **Background**: Dark gray (#0F172A)
- **Foreground**: Light gray (#F8FAFC)
- **Cards**: Slightly lighter dark gray
- **Primary**: Brighter blue for better contrast
- **Semantic colors**: Adjusted for dark backgrounds

## 📱 **Mobile Optimizations**

- Touch-friendly color contrasts
- Enhanced visibility on small screens
- Proper contrast ratios for outdoor use
- Optimized for both light and dark environments

## 🔧 **Customization**

All colors are defined as CSS custom properties, making them easy to customize:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-hover: 221.2 83.2% 45%;
  --primary-light: 221.2 83.2% 95%;
  --primary-dark: 221.2 83.2% 35%;
}
```

## ✅ **Benefits**

1. **Better Accessibility**: WCAG AA compliant contrast ratios
2. **Consistent Design**: Semantic color naming
3. **Enhanced UX**: Clear visual hierarchy
4. **Mobile Optimized**: Touch-friendly contrasts
5. **Future Proof**: Easy to customize and extend
