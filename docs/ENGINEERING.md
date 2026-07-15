# KHUSHI OS ENGINEERING

---

# Stack

Next.js 16

TypeScript

Tailwind CSS v4

Shadcn UI

Framer Motion

Firebase

Firestore

Lucide

---

# Folder Structure

app/

wallet/

letters/

gallery/

memories/

bucket-list/

admin/

components/

ui/

wallet/

common/

lib/

types/

public/

docs/

---

# Rules

Always build reusable components.

Never duplicate UI.

Business logic belongs in services.

Pages should stay clean.

Strict TypeScript.

Readable code over clever code.

---

# Naming

PascalCase

Components

camelCase

Functions

kebab-case

Routes

---

# Data Layer

Service Layer

↓

Firestore

↓

UI

UI should never directly talk to Firestore.

---

# Design Layer

Page

↓

Layout

↓

Section

↓

Component

↓

Primitive

---

# Code Style

Small components.

Reusable.

No files over 300 lines unless justified.

Prefer composition.

Avoid deeply nested JSX.

---

# Performance

Lazy load large modules.

Optimize images.

Avoid unnecessary re-renders.

Keep animations GPU accelerated.

---

# Accessibility

Keyboard navigation.

Visible focus states.

Semantic HTML.

Proper aria labels.

---

# Git Workflow

Each milestone

↓

Commit

Example

feat: wallet UI

feat: glass panel

feat: coupon redemption

Never mix multiple features in one commit.