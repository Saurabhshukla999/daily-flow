# Daily Task Tracker

A modern task tracking application built with React, TypeScript, and Neon PostgreSQL database.

## Features

- ✅ Task creation and management
- ✅ Daily habit tracking
- ✅ Progress visualization
- ✅ Task duration scheduling
- ✅ Email/password authentication
- ✅ Responsive design

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Radix UI components
- **Backend**: Express.js API server
- **Database**: Neon PostgreSQL
- **Authentication**: JWT tokens
- **State Management**: React Query

## Getting Started

### Prerequisites

- Node.js 18+
- Neon database account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   DATABASE_URL="your-neon-connection-string"
   JWT_SECRET="your-secret-key"
   ```

4. Run database schema in Neon dashboard using `neon-schema.sql`

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom hooks
├── lib/           # Utilities and API client
├── pages/         # Page components
└── types/         # TypeScript definitions
server/
└── index.ts       # Express API server
```

## Deployment

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## License

MIT
