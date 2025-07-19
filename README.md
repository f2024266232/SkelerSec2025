# SkelerSecurity CTF Platform

A modern, cyberpunk-themed Capture The Flag (CTF) platform built with React, TypeScript, and Express. Features a Jeopardy-style interface with admin-controlled team creation, challenge management, and real-time leaderboards.

## 🎯 Features

- **Jeopardy-Style CTF Interface**: Card-based challenge gallery with category filtering
- **Admin Panel**: Create/manage challenges and teams
- **Real-time Leaderboard**: Live scoring and rankings
- **Secure Authentication**: Session-based login system
- **Responsive Design**: Works on desktop and mobile
- **Cyberpunk Theme**: Dark, futuristic UI design
- **Local Database**: SQLite for easy development

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd skelersecurity-ctf
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the platform**:
   - Open http://localhost:5000
   - Login with: `admin` / `SkelerSec2025!`

### Default Admin Credentials

- **Username**: `admin`
- **Password**: `SkelerSec2025!`

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for state management
- **Tailwind CSS** for styling
- **Shadcn/ui** components

### Backend
- **Node.js** with Express
- **TypeScript** with ESM modules
- **SQLite** with Drizzle ORM
- **bcrypt** for password hashing
- **Session-based authentication**

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and auth
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express server
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── db.ts            # Database initialization
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema
└── vercel.json          # Vercel deployment config
```

## 🎮 Using the Platform

### For Participants
1. Register/login with team credentials
2. Browse challenges by category
3. Submit flags to earn points
4. View leaderboard to track progress

### For Admins
1. Login with admin credentials
2. Access Admin panel from navigation
3. Create new challenges with categories
4. Manage teams and view statistics

## 🗃️ Database Schema

- **Teams**: User accounts with admin privileges
- **Challenges**: CTF problems with flags and points
- **Submissions**: Team attempts with correctness tracking

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions to Vercel.

### Key Points:
- SQLite works for local development
- Production requires PostgreSQL (Neon recommended)
- Vercel configuration already included
- Environment variables needed for production

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking

### Adding New Challenges

1. Use the Admin panel interface, or
2. Directly insert into database:
   ```sql
   INSERT INTO challenges (title, description, category, points, flag) 
   VALUES ('Challenge Name', 'Description', 'Web', 100, 'CTF{flag}');
   ```

### Changing Admin Password

Update the password in `server/db.ts` initialization:
```typescript
const hashedPassword = bcrypt.hashSync('your-new-password', 10);
```

## 🛡️ Security Features

- Password hashing with bcrypt
- Session-based authentication
- CSRF protection
- Input validation with Zod
- SQL injection prevention with Drizzle ORM

## 🎨 Customization

### Theming
- Colors defined in `client/src/index.css`
- Cyberpunk theme with CSS variables
- Easy to modify color scheme

### Branding
- Update site name in navigation components
- Modify meta tags in `client/index.html`
- Change logo and icons

## 📝 License

MIT License - feel free to use for your CTF events!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ for the cybersecurity community