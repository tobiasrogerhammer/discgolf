# Code Structure Documentation

This document outlines the improved code structure and organization of the Disc Golf application.

## 📁 Directory Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Auth route group
│   ├── api/               # API routes
│   ├── new/               # New game page
│   ├── stats/             # Statistics page
│   ├── profile/           # Profile page
│   └── ...
├── components/            # Reusable UI components
│   ├── CoursePreview.tsx
│   ├── StartRoundModal.tsx
│   ├── ScoreInput.tsx
│   ├── PlayerSelector.tsx
│   ├── PlayerScoresSummary.tsx
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── useGameState.ts
│   └── useFriends.ts
├── lib/                   # Utility libraries
│   ├── api.ts            # Centralized API layer
│   ├── constants.ts      # Application constants
│   ├── dateUtils.ts      # Date utility functions
│   ├── offlineQueue.ts   # Offline data management
│   └── prisma.ts         # Database client
├── types/                # TypeScript type definitions
│   └── index.ts
└── middleware.ts         # Next.js middleware
```

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**

- **Components**: Pure UI components with minimal logic
- **Hooks**: Business logic and state management
- **API Layer**: Centralized data fetching with error handling
- **Types**: Shared type definitions
- **Constants**: Application-wide constants

### 2. **Custom Hooks Pattern**

```typescript
// useGameState.ts - Manages game state and logic
export function useGameState() {
  // State management
  // Business logic
  // Computed values
  // Actions
}

// useFriends.ts - Manages friend-related functionality
export function useFriends() {
  // Friend state
  // Search functionality
  // API calls
}
```

### 3. **Component Composition**

```typescript
// Large components broken into smaller, focused components
<CoursePreview />
<StartRoundModal />
<ScoreInput />
<PlayerSelector />
<PlayerScoresSummary />
```

### 4. **Centralized API Layer**

```typescript
// lib/api.ts - Centralized API calls with error handling
export const roundApi = {
  async save(roundData) {
    /* ... */
  },
  async getById(id) {
    /* ... */
  },
};

export const friendApi = {
  async getFriends() {
    /* ... */
  },
  async inviteFriend(email) {
    /* ... */
  },
};
```

## 🧩 Component Architecture

### **Large Components → Small Components**

**Before:**

- `NewGamePage` (800+ lines)
- Mixed concerns (UI + logic + API calls)
- Hard to test and maintain

**After:**

- `NewGamePage` (150 lines) - Orchestration only
- `CoursePreview` - Course display logic
- `StartRoundModal` - Round setup logic
- `ScoreInput` - Score input logic
- `PlayerSelector` - Player management
- `PlayerScoresSummary` - Score display

### **Custom Hooks for Logic Extraction**

**Before:**

```typescript
// All logic mixed in component
const [courses, setCourses] = useState([]);
const [players, setPlayers] = useState([]);
// ... 50+ lines of state and logic
```

**After:**

```typescript
// Clean component with extracted logic
const gameState = useGameState();
const friendsState = useFriends();
```

## 🔧 Key Improvements

### 1. **Type Safety**

- Centralized type definitions in `types/index.ts`
- Shared interfaces across components
- Better IntelliSense and error catching

### 2. **Error Handling**

- `ErrorBoundary` component for React errors
- Centralized API error handling
- Consistent error messages via constants

### 3. **Reusability**

- Small, focused components
- Custom hooks for shared logic
- Centralized API layer

### 4. **Maintainability**

- Clear separation of concerns
- Easy to test individual pieces
- Consistent patterns across codebase

### 5. **Performance**

- Optimized re-renders with focused state
- Memoized computed values in hooks
- Efficient component composition

## 📋 Best Practices Implemented

### **Component Design**

- ✅ Single Responsibility Principle
- ✅ Props interface definitions
- ✅ Default props where appropriate
- ✅ Error boundaries for resilience

### **Hook Design**

- ✅ Custom hooks for complex logic
- ✅ Memoized computed values
- ✅ Clean separation of concerns
- ✅ Reusable across components

### **API Design**

- ✅ Centralized API layer
- ✅ Consistent error handling
- ✅ Type-safe API calls
- ✅ Generic response wrapper

### **Type Safety**

- ✅ Comprehensive type definitions
- ✅ Shared interfaces
- ✅ Strict TypeScript configuration
- ✅ Runtime type validation

## 🚀 Benefits

1. **Maintainability**: Easy to modify and extend
2. **Testability**: Small, focused units
3. **Reusability**: Components and hooks can be reused
4. **Type Safety**: Catch errors at compile time
5. **Performance**: Optimized rendering and state management
6. **Developer Experience**: Better IntelliSense and debugging

## 🔄 Migration Strategy

The refactoring was done incrementally:

1. **Extract Types** → `types/index.ts`
2. **Extract Constants** → `lib/constants.ts`
3. **Create API Layer** → `lib/api.ts`
4. **Extract Custom Hooks** → `hooks/`
5. **Break Down Components** → `components/`
6. **Refactor Main Page** → Use new structure

This approach ensured the application remained functional throughout the refactoring process.

## 📚 Next Steps

1. **Testing**: Add unit tests for hooks and components
2. **Documentation**: Add JSDoc comments to functions
3. **Performance**: Add React.memo where beneficial
4. **Accessibility**: Improve a11y in components
5. **Storybook**: Add component documentation

This improved structure provides a solid foundation for future development and maintenance.
