# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Webinar SaaS platform with real-time streaming, automated sales agents, and payment integration. Built with Next.js 15, React 19, Clerk authentication, Prisma ORM with PostgreSQL, Stream.io for video/chat, Vapi AI for voice agents, and Stripe for payments.

## Development Commands

### Installation & Setup
```bash
npm i --legacy-peer-deps  # Required for this codebase
npx prisma generate       # Generate Prisma client
```

### Development
```bash
npm run dev     # Start development server with Turbopack
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

### Database
```bash
npx prisma generate    # Generate Prisma client after schema changes
npx prisma db push     # Push schema changes to database
npx prisma studio      # Open Prisma Studio
```

## Architecture Overview

### Core Technologies
- **Framework**: Next.js 15 with App Router and React 19
- **Authentication**: Clerk with middleware protection
- **Database**: PostgreSQL with Prisma ORM
- **Video/Chat**: Stream.io for live webinar streaming and real-time chat
- **AI Voice**: Vapi AI for automated sales agent calls
- **Payments**: Stripe with Connect for multi-tenant payments
- **Styling**: Tailwind CSS with Radix UI components

### Key Directories

#### `/src/app/`
- `(auth)/` - Authentication routes (sign-in, sign-up, callback)
- `(protectedRoutes)/` - Protected dashboard routes requiring authentication
- `(publicRoutes)/` - Public routes including live webinar viewing
- `api/` - API routes for Stripe webhooks and Connect

#### `/src/action/`
Server actions for database operations and external service integrations:
- `webinar.ts` - Webinar CRUD operations
- `auth.ts` - User authentication and validation
- `stremIo.ts` - Stream.io token generation and call management
- `stripe.ts` - Payment processing and Stripe Connect
- `vapi.ts` - AI agent creation and management
- `resend.ts` - Email notifications

#### `/src/components/`
- `ui/` - Shadcn/ui components
- `ReusableComponent/` - Custom reusable components including multi-step webinar creation form

#### `/src/lib/`
- `prismaClient.ts` - Prisma client instance
- `stream/` - Stream.io client configurations
- `stripe/` - Stripe client and utilities
- `vapi/` - Vapi AI client configurations
- `type.ts` - TypeScript type definitions and validation functions

#### `/src/store/`
Zustand stores for state management:
- `useWebinarStore.ts` - Webinar creation form state
- `useAiAgentStore.ts` - AI agent configuration state
- `useAttendeeStore.ts` - Attendee management state

### Database Schema

Key models in Prisma schema:
- **User**: Clerk-authenticated users with Stripe Connect integration
- **Webinar**: Live webinar sessions with status tracking
- **Attendee**: Webinar participants with call status
- **Attendance**: Join/leave tracking with attendance types
- **AiAgents**: Vapi AI agent configurations

### Authentication & Middleware

Clerk middleware protects all routes except:
- `/` (landing page)
- `/sign-in` and `/sign-up`
- `/api/*` (API routes)
- `/live-webinar/*` (public webinar viewing)

### Environment Variables

Required environment variables (see `.env.example`):
- Database: `DATABASE_URL` (PostgreSQL)
- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Vapi: `VAPI_PRIVATE_KEY`, `NEXT_PUBLIC_VAPI_API_KEY`
- Stream.io: `NEXT_PUBLIC_STREAM_API_KEY`, `STREAM_SECRET`
- Resend: `RESEND_API_KEY`

## Development Patterns

### Server Actions
All database operations use server actions with proper error handling and user authentication. Always call `onAuthenticateUser()` in server actions to validate user sessions.

### State Management
Use Zustand stores for complex form state (webinar creation, AI agent configuration). Local React state for simple component state.

### Validation
Type validation functions are in `/src/lib/type.ts`. Use these for form validation before server action calls.

### Error Handling
Server actions return status codes and messages. Always handle authentication (401), subscription (402), and validation (400/404) errors.

### Styling
Follow existing Tailwind patterns. Use Radix UI components from `/src/components/ui/` for consistent design system.

## External Service Integration

### Stream.io
- Generate tokens using server actions in `/src/action/stremIo.ts`
- Video calls and chat channels are created per webinar
- Use custom components in `/src/app/(publicRoutes)/live-webinar/` for webinar viewing

### Vapi AI
- AI agents created through `/src/action/vapi.ts`
- Default sales prompt template in `/src/lib/data.ts`
- Agents can be associated with webinars for automated sales calls

### Stripe
- Connect accounts for presenters to receive payments
- Webhooks handle payment processing in `/src/app/api/stripe-webhook/`
- Product creation tied to webinar CTA configuration

### Resend
- Email notifications for webinar start times
- Templates in `/src/lib/webinarStartEmailTemplate.tsx`