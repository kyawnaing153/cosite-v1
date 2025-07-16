# Construction Management System

## Overview

This is a full-stack construction management application built with React, TypeScript, Express, and PostgreSQL. The system provides comprehensive tools for managing construction sites, labor, purchases, payroll, invoices, and attendance tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Forms**: React Hook Form with Zod for validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: JWT tokens with bcrypt for password hashing
- **API**: RESTful endpoints with proper error handling

### Component Structure
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Layout**: Sidebar navigation with responsive design
- **Forms**: Reusable form components with validation
- **Dashboard**: Metrics cards and data visualization components

## Key Components

### Authentication System
- JWT-based authentication with secure token storage
- Role-based access control
- Password hashing with bcrypt
- Protected routes and middleware

### Database Schema
- **Users**: Authentication and user management
- **Sites**: Construction site information and status tracking
- **Labour**: Worker management with different types (office staff, hire workers, subcontractors)
- **Labour Groups**: Organizational structure for workers
- **Purchases**: Material and equipment purchase tracking
- **Salaries**: Payroll and wage management
- **Invoices**: Billing and invoice generation
- **Attendance**: Worker attendance tracking with status options

### Core Features
1. **Site Management**: Create, update, and track construction sites
2. **Labour Management**: Manage workers across different sites and groups
3. **Purchase Tracking**: Record and monitor material purchases
4. **Payroll System**: Handle wages, salaries, and payment processing
5. **Invoice Generation**: Create and manage project invoices
6. **Attendance Tracking**: Monitor worker presence and hours
7. **Reporting**: Generate various reports for project analysis

## Data Flow

1. **Authentication Flow**: Login → JWT token → Stored in localStorage → API requests include Bearer token
2. **CRUD Operations**: Client → API endpoint → Database via Drizzle ORM → Response to client
3. **Form Submissions**: React Hook Form → Zod validation → API call → Database update → UI refresh
4. **Data Fetching**: TanStack Query → API endpoints → Cache management → Component updates

## External Dependencies

### Frontend Dependencies
- **@radix-ui/react-***: Accessible UI primitives
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library

### Backend Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL client
- **drizzle-orm**: Type-safe ORM
- **express**: Web framework
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT authentication
- **zod**: Schema validation

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tsx**: TypeScript execution
- **esbuild**: Fast bundling

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Neon serverless PostgreSQL with connection pooling

### Production Build
- **Frontend**: Vite build → Static files in `dist/public`
- **Backend**: esbuild bundle → Single JavaScript file in `dist`
- **Database**: Drizzle migrations via `drizzle-kit`

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **JWT_SECRET**: JWT signing secret (defaults to development key)
- **NODE_ENV**: Environment mode (development/production)

### File Structure
```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route components
│   │   ├── lib/         # Utilities and auth
│   │   └── hooks/       # Custom React hooks
├── server/          # Express backend
│   ├── db.ts        # Database connection
│   ├── routes.ts    # API endpoints
│   └── storage.ts   # Data access layer
├── shared/          # Shared types and schemas
│   └── schema.ts    # Database schema definitions
└── migrations/      # Database migrations
```

The application follows a monorepo structure with clear separation between frontend, backend, and shared code, making it easy to maintain and scale.