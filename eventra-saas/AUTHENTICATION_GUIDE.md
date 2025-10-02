# 🔐 Authentication System Guide

## ✅ IMPLEMENTED FEATURES

### 1. Email/Password Authentication
- **Registration**: Users can sign up with email, name, and password
- **Login**: Secure login with bcrypt password hashing
- **Session Management**: JWT-based sessions via NextAuth
- **Auto-login**: After registration, users are automatically signed in

### 2. Google OAuth (Optional)
- **Ready to enable**: Just add Google OAuth credentials
- **Automatic user creation**: New users created on first Google sign-in
- **Seamless integration**: Works alongside email/password auth

## 📁 FILES CREATED/UPDATED

### API Routes:
1. `src/app/api/auth/register/route.ts` - User registration endpoint
2. `src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler (existing)

### Pages:
1. `src/app/register/page.tsx` - Registration page (redesigned)
2. `src/app/login/LoginForm.tsx` - Login form (existing)
3. `src/app/login/page.tsx` - Login page (existing)

### Configuration:
1. `src/lib/auth.ts` - NextAuth configuration
2. `.env` - Environment variables

## 🚀 HOW TO USE

### Testing Email/Password Authentication:

#### 1. **Register a New User**:
```
Visit: http://localhost:3000/register

Fill in:
- Full Name: Test User
- Email: test@example.com  
- Password: password123
- Confirm Password: password123

Click "Create Account"
```

#### 2. **Login**:
```
Visit: http://localhost:3000/login

Use credentials:
- Email: test@example.com
- Password: password123

Click "Sign In"
```

#### 3. **Check Authentication**:
After login, you'll be redirected to homepage.
The navigation will show "Dashboard" instead of "Login/Sign Up"

## 🔧 ENABLE GOOGLE OAUTH (Optional)

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Application type: "Web application"
6. Authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
7. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
8. Copy the Client ID and Client Secret

### Step 2: Update .env File

Edit `.env` and uncomment these lines:
```env
GOOGLE_CLIENT_ID="paste-your-actual-client-id-here"
GOOGLE_CLIENT_SECRET="paste-your-actual-client-secret-here"
NEXT_PUBLIC_ENABLE_GOOGLE="true"
```

### Step 3: Restart Server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 4: Test Google OAuth
Visit `/login` or `/register` and you'll see the "Continue with Google" button.

## 🎯 FEATURES

### ✅ Registration:
- ✅ Email validation
- ✅ Password strength check (min 6 characters)
- ✅ Password confirmation
- ✅ Duplicate email check
- ✅ Password hashing with bcrypt
- ✅ Auto-login after registration
- ✅ Success/error messages
- ✅ Loading states

### ✅ Login:
- ✅ Email/password authentication
- ✅ Google OAuth (when enabled)
- ✅ Session persistence
- ✅ Remember user across page refreshes
- ✅ Redirect to dashboard after login
- ✅ Error handling

### ✅ Security:
- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT sessions with secret
- ✅ HTTP-only cookies
- ✅ CSRF protection
- ✅ Secure in production (HTTPS)

## 📊 DATABASE

Users are stored in the SQLite database (`prisma/dev.db`):

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🧪 TESTING COMMANDS

### View all users in database:
```bash
npx prisma studio
```
Then navigate to the `User` model to see all registered users.

### Check database directly:
```bash
sqlite3 prisma/dev.db "SELECT * FROM User;"
```

## 🔄 AUTHENTICATION FLOW

### Registration Flow:
```
1. User fills registration form
2. Frontend validates (password match, length)
3. POST /api/auth/register
4. Backend checks if email exists
5. Password hashed with bcrypt
6. User created in database
7. Auto sign-in with NextAuth
8. Redirect to dashboard
```

### Login Flow:
```
1. User enters credentials
2. POST to NextAuth
3. Credentials checked against database
4. Password verified with bcrypt
5. JWT session created
6. Cookie set
7. User redirected to homepage/dashboard
```

### Google OAuth Flow:
```
1. Click "Continue with Google"
2. Redirect to Google OAuth
3. User authorizes
4. Callback to /api/auth/callback/google
5. Check if user exists in database
6. Create user if new
7. Session created
8. Redirect to dashboard
```

## 🛡️ SESSION MANAGEMENT

### Check if user is authenticated:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
if (session?.user) {
  // User is authenticated
  console.log(session.user.email);
}
```

### Client-side session:
```typescript
import { useSession } from 'next-auth/react';

const { data: session, status } = useSession();
if (status === 'authenticated') {
  // User is logged in
  console.log(session?.user?.email);
}
```

## 🔑 ENVIRONMENT VARIABLES

### Required:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="minimum-32-characters-required-for-security"
NEXTAUTH_URL="http://localhost:3000"
```

### Optional (for Google OAuth):
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_ENABLE_GOOGLE="true"
```

## 🐛 TROUBLESHOOTING

### Issue: "Invalid credentials" on login
**Solution**: Make sure the user is registered first. Check database with `npx prisma studio`.

### Issue: Google OAuth button doesn't show
**Solution**: Ensure all three Google env variables are set and `NEXT_PUBLIC_ENABLE_GOOGLE="true"`.

### Issue: Session not persisting
**Solution**: Check that `NEXTAUTH_SECRET` is at least 32 characters long.

### Issue: "User already exists"
**Solution**: This email is already registered. Use login instead or try different email.

### Issue: Can't find user in database
**Solution**: Run migrations: `npx prisma migrate dev`

## 📝 NEXT STEPS

1. ✅ Email/Password auth - COMPLETE
2. ✅ Registration system - COMPLETE
3. ✅ Google OAuth ready - Just needs credentials
4. ⏳ Password reset (future)
5. ⏳ Email verification (future)
6. ⏳ Social auth (Facebook, Twitter) (future)

## 🎨 UI/UX

Both login and registration pages feature:
- Modern, clean design
- Gradient backgrounds
- Proper form validation
- Loading states
- Error/success messages
- Responsive mobile layout
- Smooth transitions

## 💡 USAGE EXAMPLES

### Create test user via API:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "clx123...",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

## ✨ DONE!

The authentication system is now fully functional! Users can:
- ✅ Register with email/password
- ✅ Login with credentials
- ✅ Have persistent sessions
- ✅ Optionally use Google OAuth (when configured)

All ready to use! 🚀
