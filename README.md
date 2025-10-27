# 🥏 Disc Golf Tracker

A modern, feature-rich disc golf round tracking application built with Next.js, Convex, Clerk, and shadcn/ui. Track your rounds, analyze your performance, connect with friends, and improve your game with comprehensive statistics and social features.

## 🎯 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Design System](#-design-system)
- [Color Scheme](#-color-scheme)
- [UI Components](#-ui-components)
- [Pages & Navigation](#-pages--navigation)
- [Database Schema](#-database-schema)
- [API Functions](#-api-functions)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### 🎮 Core Gameplay
- **Round Tracking**: Track solo or group rounds with detailed hole-by-hole scoring
- **Course Management**: Browse courses with detailed information, hole layouts, and distances
- **Multi-Player Support**: Play with friends or add guests to rounds
- **Round Types**: Casual, Practice, Tournament, and Competitive rounds
- **Real-time Scoring**: Live score calculation with par tracking
- **Score Input**: Intuitive plus/minus buttons for easy stroke adjustment

### 📊 Analytics & Statistics
- **Performance Charts**: Visualize your improvement over time with line charts
- **Course Comparison**: Compare your performance across different courses
- **Detailed Insights**: Best/worst rounds, average scores, and trends
- **Monthly Goals**: Set and track monthly round targets
- **Progress Tracking**: Monitor your improvement with comprehensive metrics

### 👥 Social Features
- **Friends System**: Add friends by username or email
- **Leaderboards**: Compare performance with friends or all users
- **Course Filtering**: Filter leaderboards by specific courses
- **Group Rounds**: Play and track rounds with multiple players
- **Achievement System**: Unlock achievements for various milestones

### 🏆 Gamification
- **Achievements**: 15+ achievements across different categories
- **Progress Tracking**: Monitor rounds played, friends added, courses completed
- **Goal Setting**: Set and track monthly round goals
- **Rankings**: See how you stack up against other players

### 📱 User Experience
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Intuitive Navigation**: Clean, modern interface with bottom navigation
- **Real-time Updates**: Live data synchronization across all devices
- **Toast Notifications**: User feedback for all actions
- **Smooth Animations**: Polished interactions and transitions

## 🛠 Tech Stack

### Frontend
- **Next.js 15.5.4** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Recharts** - Data visualization and charts
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Convex** - Real-time database and backend functions
- **Clerk** - Authentication and user management
- **Webhooks** - Automatic user deletion sync

### Development Tools
- **Turbopack** - Fast bundler for development
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🎨 Design System

### Design Philosophy
- **Mobile-First**: Designed primarily for mobile devices
- **Clean & Modern**: Minimalist design with focus on usability
- **Accessible**: WCAG compliant with proper contrast ratios
- **Consistent**: Unified design language across all components
- **Responsive**: Adapts seamlessly to all screen sizes

### Layout Principles
- **Card-Based Design**: Information organized in clean cards
- **Centered Headings**: All page titles are centered for visual balance
- **Consistent Spacing**: 4px grid system with Tailwind spacing
- **Touch-Friendly**: Large touch targets for mobile interaction
- **Visual Hierarchy**: Clear information architecture

## 🎨 Color Scheme

### Orange Theme (Current)
The application uses a vibrant orange color scheme with OKLCH color values for better color consistency:

#### Primary Colors
- **Primary**: `oklch(0.6 0.2 40)` - Vibrant orange for main actions
- **Secondary**: `oklch(0.85 0.1 40)` - Light orange for secondary elements
- **Accent**: `oklch(0.75 0.15 40)` - Medium orange for highlights

#### Chart Colors
- **Chart 1**: `oklch(0.6 0.2 40)` - Main orange
- **Chart 2**: `oklch(0.65 0.15 30)` - Red-orange
- **Chart 3**: `oklch(0.55 0.2 50)` - Yellow-orange
- **Chart 4**: `oklch(0.7 0.15 35)` - Light orange
- **Chart 5**: `oklch(0.75 0.1 45)` - Soft orange

#### Semantic Colors
- **Success**: Green tones for under-par scores
- **Warning**: Blue tones for par scores
- **Error**: Red tones for over-par scores
- **Destructive**: `oklch(0.6 0.25 15)` - Red for destructive actions

#### Background Colors
- **Background**: `oklch(0.99 0.005 120)` - Near white
- **Card**: `oklch(1 0 0)` - Pure white
- **Muted**: `oklch(0.95 0.01 120)` - Light gray
- **Border**: `oklch(0.85 0.05 120)` - Light border

### Dark Mode Support
The application includes comprehensive dark mode support with:
- **Dark Background**: `oklch(0.08 0.01 240)` - Very dark blue-gray
- **Dark Cards**: `oklch(0.12 0.02 240)` - Dark card background
- **Dark Primary**: `oklch(0.75 0.25 140)` - Bright blue for dark mode
- **Automatic Detection**: Respects system preference

## 🧩 UI Components

### Core Components

#### Button
```typescript
// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon, icon-sm, icon-lg
<Button variant="default" size="lg">Start Round</Button>
```

#### Card
```typescript
// Clean card layout with header, content, and footer
<Card>
  <CardHeader>
    <CardTitle>Round Details</CardTitle>
    <CardDescription>Your latest round</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

#### Input
```typescript
// Styled input with focus states and validation
<Input 
  type="number" 
  placeholder="Enter strokes"
  className="text-center text-2xl font-bold"
/>
```

#### Badge
```typescript
// Status indicators and labels
<Badge variant="secondary">Casual</Badge>
<Badge variant="destructive">Over Par</Badge>
```

### Specialized Components

#### MultiPlayerScoreInput
- **Plus/Minus Buttons**: Easy stroke adjustment
- **Color-Coded Scoring**: Green (under par), Blue (par), Red (over par)
- **Hole Information**: Distance and par display
- **Real-time Calculation**: Live score updates

#### CourseDetails
- **Expandable Design**: Inline expansion under course cards
- **Course Information**: Type, play time, elevation gain
- **Hole Breakdown**: Detailed hole-by-hole information
- **Map Integration**: Direct links to Google Maps

#### FriendSelector
- **Username Search**: Add friends by username
- **Guest Support**: Add non-registered players
- **Conditional Display**: Shows based on friend count

#### PerformanceChart
- **Line Chart**: Score progression over time
- **Par Reference**: Shows scores relative to par
- **Responsive**: Adapts to screen size

#### CoursePerformanceChart
- **Bar Chart**: Average scores by course
- **Course Comparison**: Visual performance comparison
- **Data Labels**: Clear value display

## 📱 Pages & Navigation

### Main Navigation (Bottom Nav)
- **Home** (`/`) - Dashboard with quick actions
- **Stats** (`/stats`) - Analytics and performance data
- **New Round** (`/new`) - Start a new game

### Core Pages

#### Home Page (`/`)
- **Welcome Message**: Personalized greeting
- **Quick Actions**: Cards for main features
- **Recent Activity**: Quick access to recent rounds
- **Navigation Cards**: 
  - 🥏 New Round
  - 📋 Previous Rounds
  - 📊 My Stats
  - 👥 Friends

#### New Round Page (`/new`)
- **Course Selection**: Search and browse courses
- **Course Cards**: Clean card layout with course info
- **Course Details**: Expandable inline details
- **Round Type Selection**: After course selection
- **Friend Selection**: Add friends or guests
- **Mobile Optimized**: Touch-friendly interface

#### Score Input Page (`/score`)
- **Dedicated Scoring**: Full-screen score input
- **Hole Information**: Distance and par display
- **Multi-Player Support**: Score for all participants
- **Progress Tracking**: Current hole indicator
- **Save Functionality**: Complete round saving

#### Stats Page (`/stats`)
- **Combined Analytics**: Stats and analytics in one page
- **Tabbed Interface**: Overview, Analytics, Insights
- **Monthly Goals**: Goal setting and tracking
- **Performance Charts**: Visual data representation
- **Filter Options**: Course and time period filters

#### Profile Page (`/profile`)
- **User Information**: Profile details and stats
- **Achievements**: Unlocked achievements display
- **Leaderboard**: Friends vs all users comparison
- **Course Filtering**: Filter leaderboard by course
- **Stats Summary**: Combined stats in single card

#### Friends Page (`/friends`)
- **Friend List**: Current friends display
- **Add Friends**: Username-based friend requests
- **Friend Requests**: Accept/decline invitations
- **Social Features**: Friend management

#### Rounds Page (`/rounds`)
- **Round History**: All previous rounds
- **Expandable Details**: Click to view round details
- **Smooth Scrolling**: Auto-scroll to details
- **Round Statistics**: Score analysis and trends

### Authentication Pages
- **Login** (`/login`) - Sign in with Clerk
- **Register** (`/register`) - Sign up with Clerk

### Admin Pages
- **Seed Data** (`/admin/seed`) - Database seeding interface
- **User Cleanup** (`/admin/cleanup`) - Orphaned user cleanup

## 🗄 Database Schema

### Core Tables

#### Users
```typescript
{
  email: string
  username?: string
  name?: string
  image?: string
  clerkId: string
  createdAt: number
  updatedAt: number
}
```

#### Courses
```typescript
{
  name: string
  location?: string
  description?: string
  addressUrl?: string
  holes: number
  estimatedLengthMeters?: number
  latitude?: number
  longitude?: number
  difficulty?: string
  createdAt: number
}
```

#### Course Holes
```typescript
{
  courseId: Id<"courses">
  hole: number
  par: number
  distanceMeters?: number
}
```

#### Rounds
```typescript
{
  userId: Id<"users">
  courseId: Id<"courses">
  startedAt: number
  completed: boolean
  totalStrokes?: number
  rating?: number
  roundType: "CASUAL" | "PRACTICE" | "TOURNAMENT" | "COMPETITIVE"
  notes?: string
  shared: boolean
  groupRoundId?: Id<"groupRounds">
}
```

#### Scores
```typescript
{
  roundId: Id<"rounds">
  hole: number
  strokes: number
}
```

### Social Tables

#### Friendships
```typescript
{
  requesterId: Id<"users">
  addresseeId: Id<"users">
  status: "PENDING" | "ACCEPTED" | "DECLINED"
  createdAt: number
}
```

#### Group Rounds
```typescript
{
  createdBy: Id<"users">
  courseId: Id<"courses">
  roundType: string
  startedAt: number
  completed: boolean
  participants: Participant[]
}
```

### Gamification Tables

#### Achievements
```typescript
{
  name: string
  description: string
  icon?: string
  category: string
  criteria: string
  points: number
}
```

#### User Achievements
```typescript
{
  userId: Id<"users">
  achievementId: Id<"achievements">
  earnedAt: number
}
```

#### Goals
```typescript
{
  userId: Id<"users">
  title: string
  description?: string
  type: "SCORE_IMPROVEMENT" | "ROUNDS_PLAYED" | "COURSES_PLAYED" | "DISTANCE_THROWN" | "PUTTING_ACCURACY" | "CUSTOM"
  target: number
  current: number
  deadline?: number
  completed: boolean
  createdAt: number
}
```

## 🔌 API Functions

### User Management (`convex/users.ts`)

#### Queries
- `getCurrentUser(clerkId: string)` - Get user by Clerk ID
- `getByUsername(username: string)` - Get user by username
- `checkUsernameAvailable(username: string)` - Check username availability

#### Mutations
- `createUser(userData)` - Create new user
- `updateUser(userId, updates)` - Update user information
- `generateUsernameForUser(userId)` - Auto-generate username
- `deleteUser(clerkId)` - Complete user deletion with cascade
- `cleanupOrphanedUsers()` - Clean up inactive users

### Course Management (`convex/courses.ts`)

#### Queries
- `getAll()` - Get all courses
- `getById(id)` - Get course by ID
- `getHoles(courseId)` - Get course holes
- `search(query)` - Search courses by name

#### Mutations
- `create(courseData)` - Create new course
- `updateCourse(courseId, updates)` - Update course
- `updateEkebergCourse()` - Update Ekeberg course data
- `updateKrokholCourse()` - Update Krokhol course data

### Round Management (`convex/rounds.ts`)

#### Queries
- `getByUser(userId)` - Get user's rounds
- `getById(roundId)` - Get round by ID
- `getByCourse(courseId)` - Get rounds by course

#### Mutations
- `create(roundData)` - Create new round
- `updateRound(roundId, updates)` - Update round
- `completeRound(roundId, scores)` - Complete round with scores
- `deleteRound(roundId)` - Delete round

### Friend Management (`convex/friends.ts`)

#### Queries
- `getFriends(userId)` - Get user's friends
- `getFriendRequests(userId)` - Get pending requests
- `getSentRequests(userId)` - Get sent requests

#### Mutations
- `sendFriendRequest(requesterId, addresseeUsername)` - Send friend request
- `acceptFriendRequest(requestId)` - Accept friend request
- `declineFriendRequest(requestId)` - Decline friend request
- `removeFriend(friendshipId)` - Remove friend

### Statistics (`convex/stats.ts`)

#### Queries
- `getAnalytics(userId)` - Get user analytics
- `getLeaderboard(filters)` - Get leaderboard data
- `getCourseStats(userId, courseId)` - Get course-specific stats

### Achievements (`convex/achievements.ts`)

#### Queries
- `getAll()` - Get all achievements
- `getUserAchievements(userId)` - Get user's achievements
- `getUserAchievementProgress(userId)` - Get achievement progress

#### Mutations
- `seedAchievements()` - Seed achievement data
- `checkAchievements(userId)` - Check and award achievements
- `checkAllUsersAchievements()` - Check all users' achievements

### Goals (`convex/goals.ts`)

#### Queries
- `getByUser(userId)` - Get user's goals
- `getMonthlyRoundsGoal(userId)` - Get monthly rounds goal

#### Mutations
- `setMonthlyRoundsGoal(userId, target)` - Set monthly goal
- `updateProgress(userId, goalType, value?)` - Update goal progress
- `createCustomGoal(goalData)` - Create custom goal
- `deleteGoal(goalId)` - Delete goal

### Group Rounds (`convex/groupRounds.ts`)

#### Queries
- `getByUser(userId)` - Get user's group rounds
- `getById(groupRoundId)` - Get group round by ID

#### Mutations
- `createGroupRound(roundData)` - Create group round
- `addParticipant(groupRoundId, participant)` - Add participant
- `completeGroupRound(groupRoundId, scores)` - Complete group round

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- Convex account
- Clerk account

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd discgolf
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env.local` file:
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

# Webhook (Optional)
CLERK_WEBHOOK_SECRET=your_webhook_secret_here
```

4. **Set up Convex:**
```bash
npx convex dev
```

5. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Database Seeding

Visit `/admin/seed` to seed the database with:
- Sample courses (Ekeberg, Krokhol)
- Achievement definitions
- Test data

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   └── login/
│   │       └── page.tsx
│   ├── admin/                    # Admin pages
│   │   ├── seed/
│   │   │   └── page.tsx
│   │   └── cleanup/
│   │       └── page.tsx
│   ├── api/                      # API routes
│   │   └── webhooks/
│   │       └── clerk/
│   │           └── route.ts
│   ├── friends/                  # Friends page
│   │   └── page.tsx
│   ├── new/                      # New round page
│   │   └── page.tsx
│   ├── profile/                  # Profile page
│   │   └── page.tsx
│   ├── rounds/                   # Rounds history
│   │   └── page.tsx
│   ├── score/                    # Score input page
│   │   └── page.tsx
│   ├── stats/                    # Statistics page
│   │   └── page.tsx
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── BottomNav.tsx             # Bottom navigation
│   ├── CourseDetails.tsx         # Course details component
│   ├── FriendSelector.tsx        # Friend selection
│   ├── MultiPlayerScoreInput.tsx # Score input interface
│   ├── PerformanceChart.tsx      # Performance visualization
│   ├── CoursePerformanceChart.tsx # Course comparison
│   └── ...
├── convex/                       # Convex backend
│   ├── _generated/               # Generated files
│   ├── achievements.ts           # Achievement functions
│   ├── courses.ts                # Course functions
│   ├── friends.ts                # Friend functions
│   ├── goals.ts                  # Goal functions
│   ├── groupRounds.ts            # Group round functions
│   ├── rounds.ts                 # Round functions
│   ├── schema.ts                 # Database schema
│   ├── seed.ts                   # Seeding functions
│   ├── stats.ts                  # Statistics functions
│   └── users.ts                  # User functions
├── hooks/                        # Custom React hooks
│   ├── useCurrentUser.ts         # User management hook
│   └── use-toast.ts              # Toast notifications
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Authentication utilities
│   ├── prisma.ts                 # Database client
│   ├── toast-manager.ts          # Toast management
│   └── utils.ts                  # General utilities
└── types/                        # TypeScript definitions
    └── index.ts
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel:**
- Connect your GitHub repository to Vercel
- Set environment variables in Vercel dashboard
- Deploy automatically on push

3. **Configure Clerk:**
- Update Clerk URLs to production domain
- Set up webhook endpoint (optional)

4. **Configure Convex:**
- Deploy Convex functions: `npx convex deploy`
- Update environment variables

### Environment Variables for Production

```env
# Clerk (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Convex (Production)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Webhook (Production)
CLERK_WEBHOOK_SECRET=whsec_...
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with Convex
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run convex` - Run Convex CLI commands
- `npx convex dev` - Start Convex development mode
- `npx convex deploy` - Deploy Convex functions

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standardized commit messages

### Testing

- **Type Safety**: TypeScript compilation
- **Linting**: ESLint for code quality
- **Build Testing**: Production build verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use shadcn/ui components when possible
- Maintain mobile-first design principles
- Add proper error handling
- Include loading states
- Test on mobile devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful component library
- **Convex** - Real-time database platform
- **Clerk** - Authentication service
- **Next.js** - React framework
- **Tailwind CSS** - Utility-first CSS
- **Recharts** - Chart library
- **Lucide** - Icon library

---

**Built with ❤️ for the disc golf community**# Force Vercel rebuild
