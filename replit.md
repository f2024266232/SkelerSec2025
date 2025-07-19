# Replit.md

## Overview
This is a fully functional Capture The Flag (CTF) platform built with a modern full-stack architecture. The application allows admin-created teams to participate in cybersecurity challenges across multiple categories, submit flags, and compete on a real-time leaderboard. It features an admin panel for challenge and team management, session-based authentication, and uses a dark cyberpunk-themed UI design.

## Recent Changes (July 18, 2025)
✓ Successfully migrated from PostgreSQL to local SQLite database
✓ Database auto-initializes with admin user and sample challenges
✓ Changed admin credentials to admin/SkelerSec2025!
✓ Rebranded platform from CyberArena to SkelerSecurity
✓ Local SQLite database persists between application restarts
✓ All authentication and database operations working correctly

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application follows a full-stack TypeScript architecture with clear separation between client and server code:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom cyberpunk theme and CSS variables
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Authentication**: Express sessions with bcrypt password hashing
- **Session Storage**: Memory store for development (configurable for production)
- **API Design**: RESTful endpoints with JSON responses

### Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via Neon serverless)
- **Schema**: Three main entities - teams, challenges, and submissions
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Database Schema
- **Teams**: User accounts with admin privileges support
- **Challenges**: CTF problems with categories, points, and flags
- **Submissions**: Team attempts with correctness tracking

### Authentication System
- Session-based authentication using express-session
- Password hashing with bcryptjs
- Role-based access control (admin vs regular teams)
- Protected routes with middleware

### Storage Layer
- Abstracted storage interface for flexibility
- Memory storage implementation for development
- Database operations through Drizzle ORM
- Support for complex queries (teams with scores, challenges with solve counts)

### UI Components
- Comprehensive component library using Shadcn/ui
- Custom CTF-themed components (challenge cards, modals)
- Responsive design with mobile support
- Dark cyberpunk color scheme with category-specific colors

## Data Flow

### User Registration/Login Flow
1. Frontend forms submit credentials to `/api/register` or `/api/login`
2. Server validates and hashes passwords
3. Sessions are created and stored
4. React Query manages authentication state

### Challenge Interaction Flow
1. Teams view challenges on the home page with category filtering
2. Challenge modals allow flag submission
3. Server validates flags and records submissions
4. Real-time updates to leaderboard and solve counts

### Admin Management Flow
1. Admin-only routes for challenge creation and team management
2. CRUD operations for challenges with validation
3. Team statistics and management interface

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **express**: Web server framework
- **bcryptjs**: Password hashing
- **@tanstack/react-query**: Server state management
- **wouter**: Client-side routing

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend
- TSX for running TypeScript server code
- Memory storage for rapid development
- Environment variables for database connection

### Production Build
- Vite builds optimized client bundle to `dist/public`
- esbuild bundles server code to `dist/index.js`
- Static file serving from Express
- Database migrations via Drizzle Kit

### Environment Configuration
- `DATABASE_URL` for PostgreSQL connection
- `SESSION_SECRET` for session security
- `NODE_ENV` for environment detection

The application is designed to be easily deployable to platforms like Replit, with proper static file handling and environment variable support.