---
name: react-ecommerce-standards
description: Provides React 18.x frontend architecture, state management, and component design patterns. Trigger this skill whenever building UI components, integrating with backend APIs, or optimizing frontend performance.
---
# React Ecommerce Development Best Practices

**Version:** 1.0  
**React Version:** 18.x  
**Purpose:** Enterprise-grade ecommerce development with React

---

## Overview

This skill provides comprehensive React best practices for building scalable, maintainable ecommerce applications. The guidance follows SOLID principles, feature-based architecture, and modern state management patterns.

## When to Use This Skill

- Building new React ecommerce interfaces
- Refactoring existing React components
- Implementing state management (Redux, Zustand)
- Optimizing frontend performance and rendering
- Integrating with backend APIs
- Writing frontend tests

## Core Principles

1. **Component Composition** - Build complex UIs from simple components
2. **Single Responsibility** - Each component does one thing well
3. **DRY** - Reuse components and logic
4. **Separation of Concerns** - Separate UI, logic, and data
5. **Prop Drilling Avoidance** - Use Context or state management
6. **Type Safety** - Use TypeScript for all code

## Supporting Documentation

For detailed implementation guidance, refer to these supporting files:

### Architecture & Structure
- `architecture.md` - Feature-based structure
- `solid-principles.md` - SOLID principles in React

### Design & State
- `design-patterns.md` - Container/Presentational, Hooks, HOC
- `component-design.md` - Component layers (atoms → organisms)
- `state-management.md` - Redux Toolkit, Zustand, Context

### Performance & API
- `performance.md` - Memoization, code splitting, lazy loading
- `api-integration.md` - Axios, React Query patterns

### Testing & Quality
- `testing.md` - Vitest, Testing Library, Playwright
- `code-quality.md` - TypeScript, ESLint, type safety

## Quick Reference

**State**: Use Redux Toolkit for global state, React Query for server state.  
**Components**: Separate logic (Custom Hooks) from UI (Presentational Components).  

See `design-patterns.md` and `state-management.md` for implementation examples.

### Performance Quick Wins

- [ ] Use `React.memo` for heavy components
- [ ] Use `useMemo` and `useCallback` appropriately
- [ ] Lazy load routes and heavy components
- [ ] Optimize images (WebP, lazy load)
- [ ] Virtualize large lists

## Common Mistakes to Avoid

❌ Fat components doing too much ✅ Separate UI and logic  
❌ Direct API calls in components ✅ Use custom hooks / services  
❌ Unnecessary re-renders ✅ Memoize and split state  
❌ Any types ✅ Strict TypeScript interfaces  

---

**Read supporting files for detailed implementation guidance! 🚀**