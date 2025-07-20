# VocallQ

<div align="center">
  <h3>AI-Powered Webinar SaaS Platform</h3>
  <p>Real-time streaming, automated sales agents, and payment integration</p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.5.0-2D3748)](https://www.prisma.io/)
</div>

---

## 🚀 Overview

VocallQ is a comprehensive AI webinar SaaS platform that combines live streaming, automated sales agents, and seamless payment processing. Built with cutting-edge technologies to deliver exceptional webinar experiences with intelligent lead qualification and conversion optimization.

### ✨ Key Features

- **🎥 Live Webinar Streaming** - Real-time video streaming with interactive chat
- **🤖 AI Sales Agents** - Automated lead qualification using Vapi AI
- **💳 Payment Integration** - Stripe Connect for multi-tenant payments
- **📊 Lead Management** - Comprehensive pipeline tracking and analytics
- **🔐 Secure Authentication** - Clerk-powered user management
- **📧 Email Automation** - Automated notifications via Resend
- **📱 Responsive Design** - Mobile-first UI with Tailwind CSS

---

## 🛠 Tech Stack

### Core Framework
- **Next.js 15** with App Router and Turbopack
- **React 19** with server components
- **TypeScript** for type safety

### Database & ORM
- **PostgreSQL** database
- **Prisma ORM** for data modeling

### Authentication & Payments
- **Clerk** for user authentication
- **Stripe Connect** for payment processing

### AI & Communication
- **Vapi AI** for voice agents
- **Stream.io** for video/chat
- **Resend** for email delivery

### UI & Styling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations
- **Zustand** for state management

---

## 📋 Prerequisites

- Node.js 18+ 
- npm (required - do not use bun or yarn)
- PostgreSQL database
- Required API keys (see Environment Variables)

---

## ⚡ Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Klyne-Labs-LLC/vocallq.git
cd vocallq

# Install dependencies (MUST use npm with legacy flag)
npm i --legacy-peer-deps

# Generate Prisma client
npx prisma generate
```

### 2. Environment Setup

Create a `.env.local` file with the following variables (see `.env.example` for reference):

```env
# Environment
ENVIRONMENT=development

# Neon db
DATABASE_URL="postgresql://username:password@localhost:5432/vocallq"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/callback
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/callback

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe API
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_CLIENT_ID="ca_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Vapi AI
VAPI_PRIVATE_KEY="..."
VAPI_ORG_ID="..."
NEXT_PUBLIC_VAPI_API_KEY="..."

# GetStream io
NEXT_PUBLIC_STREAM_API_KEY="..."
STREAM_SECRET="..."

# Resend Email
RESEND_API_KEY="re_..."
```

### 3. Database Setup

```bash
# Push schema to database
npx prisma db push

# Open Prisma Studio (optional)
npx prisma studio
```

### 4. Development

```bash
# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your application.

---

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (protectedRoutes)/ # Dashboard & protected pages
│   ├── (publicRoutes)/    # Public webinar viewing
│   └── api/               # API routes
├── action/                # Server actions
│   ├── webinar.ts         # Webinar operations
│   ├── auth.ts            # Authentication
│   ├── stripe.ts          # Payment processing
│   ├── vapi.ts            # AI agent management
│   └── ...
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── ReusableComponent/ # Custom components
├── lib/                   # Utilities & configurations
│   ├── prismaClient.ts   # Database client
│   ├── stripe/           # Stripe utilities
│   ├── vapi/             # Vapi AI client
│   └── stream/           # Stream.io client
└── store/                # Zustand state stores
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production (includes Prisma generate)
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open Prisma Studio
```

---

## 🔐 Authentication Flow

VocallQ uses Clerk for authentication with middleware protection:

**Protected Routes:**
- `/home` - Dashboard
- `/webinars` - Webinar management
- `/ai-agents` - AI agent configuration
- `/lead` - Lead management
- `/settings` - User settings

**Public Routes:**
- `/` - Landing page
- `/live-webinar/*` - Public webinar viewing
- `/sign-in`, `/sign-up` - Authentication

---

## 💰 Payment Integration

### Stripe Connect Setup
1. Create Stripe Connect accounts for presenters
2. Configure webhooks for payment processing
3. Handle multi-tenant payment flows

### Supported Payment Flows
- **Direct Purchases** - Buy now CTAs during webinars
- **Call Bookings** - Schedule sales calls with AI agents
- **Subscription Management** - Recurring billing for platform access

---

## 🤖 AI Agent Configuration

VocallQ integrates with Vapi AI for automated sales conversations:

### Features
- **Lead Qualification** - Intelligent prospect screening
- **Custom Prompts** - Tailored conversation flows
- **Call Analytics** - Performance tracking and insights
- **CRM Integration** - Seamless lead handoff

### Configuration
AI agents are configured in `/src/action/vapi.ts` with default templates in `/src/lib/data.ts`.

---

## 📊 Database Schema

### Core Models

**User**
- Clerk integration with Stripe Connect
- Subscription and billing management

**Webinar**
- Status tracking (SCHEDULED, LIVE, ENDED, etc.)
- CTA configuration and analytics

**Attendee**
- Participant management and tracking
- Call status and engagement metrics

**AiAgents**
- Vapi AI configuration and prompts
- Performance analytics

---

## 🚀 Deployment

### Environment Variables
Ensure all production environment variables are set before deployment.

### Build Process
```bash
npm run build
```

The build process automatically:
1. Generates Prisma client
2. Builds Next.js application
3. Optimizes for production

### Recommended Platforms
- **Vercel** - Optimal for Next.js applications
- **Railway** - Full-stack deployment with database
- **Hostinger + Coolify** - Self-hosted option

---

## 🔧 Development Guidelines

### Package Management
- **CRITICAL**: Always use `npm i --legacy-peer-deps`
- Never use bun, yarn, or other package managers

### Code Patterns
- Server actions for all database operations
- Zustand for complex state management
- Type validation with `/src/lib/type.ts`
- Error handling with proper status codes

### Styling
- Follow existing Tailwind patterns
- Use Radix UI components from `/src/components/ui/`
- Maintain responsive design principles

---

## 📈 Monitoring & Analytics

### Built-in Analytics
- Webinar attendance tracking
- Lead conversion metrics
- AI agent performance
- Payment analytics

### Integration Points
- Stream.io analytics for video metrics
- Stripe dashboard for payment insights
- Custom dashboards for business metrics

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

### Development Setup
```bash
npm i --legacy-peer-deps
npx prisma generate
npm run dev
```

---

## 📞 Support

For technical support or questions:
- Review the [CLAUDE.md](./CLAUDE.md) file for development guidance
- Check the issues section for known problems
- Contact the development team

---

## 📄 License

This project includes a commercial license. Contact anian@klynelabs.com for licensing details.

---

<div align="center">
  <p>Built with ❤️ by the Klyne Labs, LLC</p>
</div>