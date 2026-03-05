---
name: laravel-ecommerce-standards
description: Provides enterprise-grade Laravel 11.x best practices, SOLID principles, and architectural patterns. Trigger this skill whenever scaffolding backend APIs, designing database migrations, or writing business logic for the e-commerce platform.
---
# Laravel Ecommerce Development Best Practices

**Version:** 1.0  
**Laravel Version:** 11.x (Compatible with 10.x)  
**Purpose:** Enterprise-grade ecommerce development with Laravel

---

## Overview

This skill provides comprehensive Laravel best practices for building scalable, maintainable ecommerce applications. The guidance follows SOLID principles, industry-standard design patterns, and proven architectural approaches.

## When to Use This Skill

- Building new Laravel ecommerce projects
- Refactoring existing Laravel codebases
- Implementing specific design patterns
- Optimizing database queries and performance
- Securing payment integrations
- Writing comprehensive tests

## Core Principles

1. **Builder/Chaining Services** - All services use `init() → fetch*() → set*() → validation() → calculate*() → beginTransaction() → create*()/update*() → commitTransaction() → dispatchEvents() → build()` pattern
2. **Naming Conventions** - Classes must have type suffixes: `*Event`, `*Listener`, `*Service`, `*Controller`, `*Request`, `*Resource`
3. **Thin Controllers** - Controllers delegate ALL business logic to services (3–5 lines per method)
4. **Event-Driven Architecture** - Never send mail directly; dispatch events, listeners handle via queues
5. **SOLID Principles** - Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion
6. **Domain-Specific Services** - Split services by responsibility (e.g., `OrderCheckoutService`, `OrderStatusService`, `OrderQueryService`)

## Supporting Documentation

For detailed implementation guidance, refer to these supporting files:

### Architecture & Structure
- `architecture.md` - Complete directory structure and layered architecture
- `solid-principles.md` - SOLID principles with Laravel examples

### Design & Patterns
- `design-patterns.md` - Repository, Factory, Strategy, Observer, State patterns
- `database-design.md` - Schema design, migrations, relationships

### API & Security
- `api-development.md` - RESTful APIs, resources, versioning
- `security.md` - Authentication, authorization, XSS/CSRF prevention

### Performance & Quality
- `performance.md` - Caching, queues, query optimization
- `testing.md` - Feature tests, unit tests, integration tests
- `code-quality.md` - PSR-12, type declarations, static analysis

## Quick Reference

**Service**: `OrderCheckoutService::init($request, $user)->fetchCart()->...->build()`  
**Event**: `event(new OrderPlacedEvent($order))` — never direct `Mail::to()`  
**Controller**: Thin — one chain call + return `RestAPI::response()`  

See `code-quality.md` for detailed service builder pattern and naming conventions.

### Critical Security Checklist

- [ ] Use Form Requests for validation
- [ ] Always use parameter binding (no raw SQL)
- [ ] Escape output in Blade with `{{ }}`
- [ ] Enable CSRF protection
- [ ] Rate limit API endpoints
- [ ] Use Laravel Sanctum for API auth
- [ ] Encrypt sensitive data

### Performance Quick Wins

- [ ] Eager load relationships (`with()`)
- [ ] Cache frequently accessed data
- [ ] Queue long-running tasks
- [ ] Add database indexes
- [ ] Use `chunk()` for large datasets
- [ ] Optimize images (WebP, lazy load)

## Common Mistakes to Avoid

❌ Business logic in controllers ✅ Use builder-pattern services  
❌ Monolithic service methods ✅ Break into chained single-responsibility steps  
❌ Direct `Mail::to()->send()` ✅ Dispatch events with queueable listeners  
❌ Classes without type suffixes ✅ Always use `*Event`, `*Listener`, `*Service` suffixes  
❌ N+1 queries ✅ Eager load relationships  
❌ Raw SQL ✅ Use query builder with parameter binding  
❌ No tests ✅ Write feature & unit tests  

---

**Read supporting files for detailed implementation guidance! 🚀**