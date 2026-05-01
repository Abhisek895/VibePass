# VibePass Setup Guide

This guide will help you set up and run the VibePass application locally.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** 18 or higher
- **MySQL** 8.0 or higher (or PostgreSQL if you prefer to modify the schema)
- **Redis** (for sessions and real-time features)
- **Git** (for cloning the repository)

### Installing Prerequisites

#### Node.js
Download and install from [nodejs.org](https://nodejs.org/).

#### MySQL
- **Windows**: Download from [mysql.com](https://dev.mysql.com/downloads/mysql/).
- **macOS**: Use Homebrew: `brew install mysql`
- **Linux**: Use your package manager, e.g., `sudo apt install mysql-server`

#### Redis
- **Windows**: Download from [redis.io](https://redis.io/download).
- **macOS**: Use Homebrew: `brew install redis`
- **Linux**: Use your package manager, e.g., `sudo apt install redis-server`

## Project Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd VibePass
   ```

2. **Install dependencies:**

   **Backend:**
   ```bash
   cd backend
   npm install
   ```

   **Frontend:**
   ```bash
   cd ../frontend
   npm install
   cd ..
   ```

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# === APP CONFIGURATION ===
NODE_ENV=development
PORT=3003
API_VERSION=v1

# === FRONTEND ===
FRONTEND_URL=http://localhost:3002

# === DATABASE ===
DATABASE_URL="mysql://username:password@localhost:3306/vibepass_dev"

# === REDIS ===
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# === JWT SECRETS ===
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRATION="7d"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRATION="30d"

# === EMAIL / OTP ===
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="VibePass <noreply@vibepass.com>"
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6

# === RATE LIMITING ===
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# === WEBSOCKET ===
WS_URL="ws://localhost:3003"
SOCKET_IO_CORS_ORIGIN="http://localhost:3002"

# === MODERATION ===
CONTENT_FILTER_ENABLED=true
PROFANITY_FILTER_LEVEL="medium"

# === FEATURE FLAGS ===
ENABLE_VOICE_MVP=true
ENABLE_ROOMS=true
ENABLE_THEMED_ROOMS=true
ENABLE_ANALYTICS=true
ENABLE_ADMIN_DASHBOARD=true
MAX_CONCURRENT_VOICE_CALLS=100
MAX_MESSAGE_LENGTH=5000
```

**Note:** Replace `username`, `password`, and email credentials with your actual values.

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# === API CONFIGURATION ===
NEXT_PUBLIC_API_URL="http://localhost:3003/api/v1"
NEXT_PUBLIC_WS_URL="ws://localhost:3003"

# === ENVIRONMENT ===
NEXT_PUBLIC_ENV="development"
NEXT_PUBLIC_APP_NAME="VibePass"
NEXT_PUBLIC_APP_VERSION="0.1.0"

# === FEATURE FLAGS ===
NEXT_PUBLIC_ENABLE_VOICE=true
```

## Database Setup

1. **Start MySQL service:**
   - **Windows**: Start MySQL from Services or MySQL Workbench
   - **macOS/Linux**: `sudo systemctl start mysql` or `brew services start mysql`

2. **Create the database:**
   ```sql
   CREATE DATABASE vibepass_dev;
   ```

3. **Run database migrations:**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

4. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

## Redis Setup

1. **Start Redis service:**
   - **Windows**: Run `redis-server.exe`
   - **macOS/Linux**: `redis-server` or `brew services start redis`

## Running the Application

### Development Mode

1. **Start the backend:**
   ```bash
   cd backend
   npm run start:dev
   ```
   The backend will run on `http://localhost:3003`

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3002`

### Production Mode

1. **Build the backend:**
   ```bash
   cd backend
   npm run build
   npm run start:prod
   ```

2. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   npm run start
   ```

## Testing the Setup

1. Open your browser and navigate to `http://localhost:3002`
2. You should see the VibePass application running
3. Try registering a new user or logging in

## Account & Profile Features

### Profile Page

The profile page allows users to view and manage their public profile information.

**Accessing Profile:**
- Click on your avatar or username in the navigation bar
- Or navigate directly to `http://localhost:3002/profile/[username]`

**Profile Features:**
- **Profile Header**: Displays cover photo, profile picture, name, and action buttons
- **Intro Section**: Shows bio, location, education, work information, and join date
- **Friends Section**: Shows your friend list (up to 9 friends with "See all" link)
- **Photos Section**: Displays your photo gallery with thumbnail previews
- **Posts Tab**: View all your posts, reactions, and comments
- **About Tab**: Display personal and professional information
- **Photos Tab**: Browse all uploaded photos
- **Friends Tab**: Complete list of friends with mutual friend counts

### Account Settings

Access account settings to manage your profile and account information.

**Accessing Settings:**
- Click the profile icon/avatar and select "Settings"
- Or navigate to `http://localhost:3002/profile/settings`

**Account Settings Available:**
- **Basic Information**:
  - First name and last name
  - Username
  - Bio and intro text
  
- **Contact Information**:
  - Email address
  - Phone number (optional)
  - Website/portfolio link (optional)
  
- **Professional Information**:
  - Work title
  - Company name
  - Education institution
  
- **Location**:
  - Current city
  - Hometown
  
- **Personal**:
  - Relationship status
  - Pronouns
  - Birthday (optional)
  
- **Privacy Settings**:
  - Account privacy (Public, Friends, Private)
  - Who can see posts
  - Notification preferences

### Editing Your Profile

**To Edit Profile:**
1. Navigate to your profile page
2. Click the "Edit Profile" button
3. Update the desired information
4. Click "Save Changes"

**Profile Picture Upload:**
- Click on the profile picture placeholder
- Select an image from your device
- Crop if needed
- Click "Upload"

**Cover Photo Upload:**
- Click on the cover photo area
- Select an image from your device
- Click "Upload"

### Profile Visibility

**Privacy Levels:**
- **Public**: Anyone can view your complete profile
- **Friends**: Only your friends can view your profile
- **Private**: Only you can view your profile details

## Troubleshooting

### Common Issues

1. **Database connection error:**
   - Ensure MySQL is running
   - Check your `DATABASE_URL` in `.env`
   - Verify database credentials

2. **Redis connection error:**
   - Ensure Redis is running on port 6379
   - Check `REDIS_URL` in `.env`

3. **Port already in use:**
   - Change the port in `.env` files if 3002 or 3003 are occupied

4. **Email not sending:**
   - Use an app password for Gmail
   - Check SMTP settings

### Useful Commands

- **View database:** `npx prisma studio`
- **Reset database:** `npx prisma migrate reset`
- **Seed data:** `npx prisma db seed` (if seed script is configured)
- **Check backend logs:** Check the terminal where `npm run start:dev` is running

## Next Steps

- Read the [API Specification](API_SPECIFICATION.md)
- Check the [Architecture Overview](ARCHITECTURE.md)
- Review the [Database Schema](DATABASE_SCHEMA.md)

For more detailed information, refer to the documentation in the `docs/` folder.</content>
<parameter name="filePath">c:\VibePass\docs\SETUP.md