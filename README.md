# TravelwithDENCHE - Travel Booking Platform

A modern, production-ready travel booking platform built with Next.js 14, featuring demo authentication, mock payments, and comprehensive trip management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and yarn
- MongoDB running locally

### Installation & Setup

1. **Clone and install dependencies:**
```bash
git clone <repo-url>
cd travelwithdenche
yarn install
```

2. **Set up environment variables:**
```bash
cp .env.local .env.local
# Edit .env.local with your configuration
```

3. **Start MongoDB** (if not already running):
```bash
# Using Docker:
docker run -d -p 27017:27017 --name mongodb mongo

# Or install MongoDB locally
```

4. **Seed the database:**
```bash
node scripts/seed.js
```

5. **Start the development server:**
```bash
yarn dev
```

6. **Visit the application:**
- Frontend: http://localhost:3000
- API: http://localhost:3000/api

## 📱 Demo Accounts

### Admin Access
- **Email:** aimen.denche18@gmail.com
- **Access:** Full admin panel, trip management, bookings

### Demo User
- **Email:** demo@user.dev  
- **Access:** Trip browsing, booking, user dashboard

**Login:** Visit `/auth` and select your role

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, MongoDB
- **Authentication:** Demo mode (production-ready for Supabase/Google OAuth)
- **Payments:** Mock provider (production-ready for Stripe)
- **State Management:** React Context + Hooks

### Key Features

#### 🔐 Authentication System
- Demo mode for development/testing
- Role-based access (admin/user)
- Session management with HTTP-only cookies
- Ready for Supabase + Google OAuth integration

#### 🏔️ Trip Management
- Rich trip details with markdown content
- Multiple departures per trip
- Image galleries and itineraries
- Difficulty levels and group sizes
- Featured trips and search/filtering

#### 💳 Booking & Payments
- Free RSVP option per departure
- Deposit + balance payment flow
- Mock payment processing (Stripe-ready)
- Booking status tracking
- Waitlist functionality

#### 👨‍💼 Admin Panel
- Dashboard with KPIs and stats
- Complete trip CRUD operations
- Departure management
- Booking oversight
- User management

#### 📱 Responsive Design
- Mobile-first responsive design
- Dark/light theme support
- Accessible components (WCAG AA)
- Progressive Web App ready

## 🗃️ Database Schema

```javascript
// Core Collections
users: {
  id, auth_uid, email, role, name, avatar_url, phone, 
  nationality, created_at
}

trips: {
  id, slug, title, subtitle, hero_image_url, description_md,
  itinerary_md, highlights[], difficulty, included[], 
  not_included[], group_size_min, group_size_max, 
  languages[], accommodation, meeting_point, faq[],
  featured, active, created_at
}

departures: {
  id, trip_id, start_date, end_date, capacity, spots_left,
  base_price_cents, currency, deposit_cents, allow_free_rsvp,
  booking_deadline, balance_due_days_before_start
}

bookings: {
  id, user_id, trip_id, departure_id, seats, status,
  stripe_checkout_session_id, total_price_cents, 
  deposit_paid_cents, balance_due_cents, created_at
}

payments: {
  id, booking_id, type, amount_cents, currency,
  stripe_payment_intent_id, status, created_at
}
```

## 📍 API Endpoints

### Authentication
- `POST /api/auth/login` - Demo login (admin/user)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Trips
- `GET /api/trips` - List all active trips
- `GET /api/trips/[slug]` - Get trip details
- `POST /api/admin/trips` - Create trip (admin)

### Bookings
- `GET /api/bookings` - User bookings
- `POST /api/bookings` - Create booking
- `GET /api/admin/bookings` - All bookings (admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/trips` - Admin trip management

### Payments
- `POST /api/payments/webhook` - Payment webhooks

## 🔧 Configuration

### Environment Variables

```bash
# Core Settings
NEXT_PUBLIC_BRAND_NAME=TravelwithDENCHE
ADMIN_EMAIL=aimen.denche18@gmail.com
SITE_URL=http://localhost:3000

# Feature Flags
USE_DEMO_MODE=true
PAYMENT_PROVIDER=mock

# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=travelwithdenche

# Supabase (when ready)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (when ready)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (optional)
SMTP_ENABLED=false
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## 🚀 Production Deployment

### Switching from Demo to Production

1. **Set up Supabase:**
   - Create Supabase project
   - Configure Google OAuth
   - Update environment variables
   - Set `USE_DEMO_MODE=false`

2. **Configure Stripe:**
   - Get Stripe API keys
   - Set up webhooks
   - Set `PAYMENT_PROVIDER=stripe`

3. **Deploy:**
   - Vercel (recommended)
   - Railway
   - Digital Ocean
   - Any Node.js hosting

### Example Production Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add MONGO_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... add all required env vars

# Deploy with production settings
vercel --prod
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Demo login (admin/user)
- [ ] Trip browsing and filtering
- [ ] Trip detail pages
- [ ] Free RSVP booking
- [ ] Mock deposit booking
- [ ] Admin dashboard
- [ ] Admin trip creation
- [ ] User dashboard
- [ ] Responsive design

### API Testing
```bash
# Run backend API tests
cd /app && python3 backend_test.py
```

## 🔐 Security Features

- HTTP-only session cookies
- Input validation with Zod
- XSS protection
- SQL injection prevention (MongoDB)
- Rate limiting ready
- CORS configuration

## 🎨 Customization

### Brand Colors
Update `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        // ... your brand colors
      }
    }
  }
}
```

### Content Management
All content is stored in the database and manageable through the admin panel:
- Trip descriptions (Markdown)
- Site settings
- Testimonials
- FAQ sections

## 📚 Key Dependencies

- **Next.js 14** - React framework
- **MongoDB** - Database
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Hook Form** - Form handling
- **Zod** - Input validation
- **Sonner** - Toast notifications
- **Lucide React** - Icons

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
- Check the documentation
- Create an issue on GitHub
- Contact: aimen.denche18@gmail.com

---

Built with ❤️ by Aimen Denche using modern web technologies.