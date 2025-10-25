# Disc Golf Tracker

A modern disc golf round tracking application built with Next.js, Convex, Clerk, and shadcn/ui.

## Features

- 🥏 **Round Tracking**: Track your disc golf rounds with detailed scoring
- 📊 **Statistics**: View your performance with comprehensive stats and analytics
- 👥 **Social Features**: Connect with friends and compete on leaderboards
- 🎯 **Course Management**: Browse and select from various disc golf courses
- 📱 **Mobile-First**: Responsive design optimized for mobile devices
- 🔐 **Secure Authentication**: Powered by Clerk for secure user management

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Convex (real-time database and functions)
- **Authentication**: Clerk
- **UI Components**: shadcn/ui with Tailwind CSS
- **Charts**: Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Convex account
- Clerk account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd discgolf
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url_here
```

4. Set up Convex:
```bash
npx convex dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── new/               # New round page
│   ├── stats/             # Statistics page
│   ├── friends/           # Friends management
│   ├── profile/           # User profile
│   └── ...
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── convex/               # Convex backend functions
│   ├── schema.ts         # Database schema
│   ├── users.ts          # User functions
│   ├── courses.ts        # Course functions
│   ├── rounds.ts         # Round functions
│   ├── friends.ts        # Friend functions
│   └── stats.ts          # Statistics functions
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
└── types/                # TypeScript type definitions
```

## Key Features

### Round Tracking
- Select courses and track scores hole by hole
- Support for different round types (Casual, Practice, Tournament, Competitive)
- Real-time score calculation and statistics

### Statistics & Analytics
- Comprehensive performance metrics
- Course-specific statistics
- Progress tracking over time
- Best/worst hole analysis

### Social Features
- Friend system with invitations
- Leaderboards and rankings
- Social round sharing

### Course Management
- Browse available courses
- Course details and hole information
- Search and filter functionality

## Development

### Available Scripts

- `npm run dev` - Start development server with Convex
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run convex` - Run Convex CLI commands

### Database Schema

The application uses Convex with the following main entities:
- **Users**: User profiles and authentication
- **Courses**: Disc golf course information
- **Rounds**: Individual round records
- **Scores**: Hole-by-hole scoring
- **Friendships**: Social connections
- **Statistics**: Aggregated performance data

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.