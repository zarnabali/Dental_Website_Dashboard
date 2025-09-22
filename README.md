# 🦷 Dr. Sami Ullah Clinic Dashboard

A comprehensive dental clinic management dashboard built with Next.js, TypeScript, and GSAP animations.

## 🚀 Features

- **Authentication System**: Login, register, and forgot password with JWT tokens
- **Dashboard Overview**: Statistics, recent activities, and quick actions
- **Content Management**: Full CRUD operations for all clinic content
- **File Upload**: Image and video uploads with Cloudinary integration
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **GSAP Animations**: Smooth animations throughout the application
- **Real-time Updates**: Live data updates and notifications

## 📋 Content Management

### Single Item Models
- **Clinic Info**: Clinic information and contact details
- **Hero Video**: Main hero video (limited to 1)

### Multiple Item Models
- **Hero Images**: Hero section images (web + mobile)
- **Services**: Dental services and treatments
- **Blogs**: Blog posts and articles
- **Team**: Team members and staff
- **Partners**: Business partners and sponsors
- **FAQs**: Frequently asked questions
- **Feedback**: Customer testimonials and reviews

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Animations**: GSAP (GreenSock Animation Platform)
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Backend**: Node.js, Express.js, MongoDB, Cloudinary

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:5000

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dentist-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   ├── dashboard/        # Dashboard components
│   └── ui/              # UI components
├── contexts/            # React contexts
├── hooks/               # Custom hooks
├── lib/                 # Utilities and configurations
│   ├── api.ts          # API client
│   ├── auth.ts         # Authentication utilities
│   └── animations.ts   # GSAP animations
└── types/              # TypeScript type definitions
```

## 🎨 Design System

### Color Palette
- **Primary**: #963f36 (Dr. Sami Ullah Clinic Red)
- **Secondary**: Gray scale variations
- **Accent**: White and black for text

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Primary, secondary, and danger variants
- **Forms**: Consistent styling with validation states
- **Modals**: Centered with backdrop blur

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Responsive Design

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🎭 GSAP Animations

The dashboard includes smooth GSAP animations:

- **Page Transitions**: Fade in/out effects
- **Card Animations**: Hover effects and stagger animations
- **Form Interactions**: Focus and blur animations
- **Loading States**: Spinner and skeleton animations
- **Modal Animations**: Scale and fade effects

## 🔐 Authentication

- **JWT Tokens**: Secure authentication
- **Protected Routes**: Automatic redirection
- **Token Storage**: LocalStorage with automatic cleanup
- **Password Reset**: OTP-based system

## 📊 Dashboard Features

### Overview
- Statistics cards with key metrics
- Recent activities feed
- Quick action buttons
- Real-time updates

### Content Management
- Create, read, update, delete operations
- File upload with preview
- Form validation with error handling
- Bulk operations support

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Other Platforms
1. Build the project: `npm run build`
2. Deploy the `.next` folder
3. Set environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for Dr. Sami Ullah Dental Clinic**