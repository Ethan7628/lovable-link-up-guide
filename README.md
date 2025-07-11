# BodyConnect - Enhanced Body Services Platform

<div align="center">
  <h3>🚀 A modern, reliable platform connecting clients with body service professionals</h3>
  
  [![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-green.svg)](https://cloud.mongodb.com)
  [![React](https://img.shields.io/badge/Frontend-React%2018-blue.svg)](https://reactjs.org)
  [![Node.js](https://img.shields.io/badge/Backend-Node.js-green.svg)](https://nodejs.org)
  [![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://typescriptlang.org)
  [![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com)
</div>

## ✨ Recent Major Improvements

### 🔧 Enhanced MongoDB Atlas Connectivity
- **Cross-device compatibility** with optimized connection settings
- **Automatic retry logic** with exponential backoff
- **Real-time health monitoring** and connection status
- **Production-ready configuration** for Vercel deployments

### 🎨 Improved UI/UX
- **Modern authentication page** with real-time connection status
- **Enhanced navigation** with mobile-first design
- **Smooth animations** and micro-interactions
- **Responsive design** optimized for all devices

### 🚀 Backend Enhancements
- **Advanced health check endpoints** (`/api/health`, `/api/health/database`)
- **Enhanced CORS support** for cross-device deployment
- **Comprehensive error handling** with detailed logging
- **Performance monitoring** with uptime and memory tracking

### 📱 Frontend Improvements
- **Real-time connection monitoring** with status indicators
- **Smart error handling** with user-friendly messages
- **Enhanced form validation** with visual feedback
- **Optimized API client** with timeout management

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (free tier available)

### Automated Setup

1. **Clone and setup in one command:**
   ```bash
   git clone <your-repo-url>
   cd bodyconnect
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Configure MongoDB Atlas:**
   - Follow the guide in `MONGODB_SETUP.md`
   - Update `backend/.env` with your connection string

3. **Start development servers:**
   ```bash
   ./start-dev.sh
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

### Manual Setup

<details>
<summary>Click to expand manual setup instructions</summary>

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas credentials
npm run dev
```

#### Frontend Setup
```bash
npm install
npm run dev
```

</details>

## 🏥 Health Monitoring

The application includes comprehensive health monitoring:

### Health Check Endpoints
- **General Health**: `GET /api/health`
- **Database Health**: `GET /api/health/database`

### Real-time Status
- Connection indicators in the UI
- Automatic reconnection on failure
- Detailed error reporting

### Example Health Response
```json
{
  "status": "OK",
  "service": "BodyConnect API",
  "database": {
    "status": "connected",
    "isConnected": true
  },
  "uptime": 1234.56,
  "environment": "development"
}
```

## 🎯 Core Features

### For Clients
- **Browse Services**: Discover body service professionals
- **Secure Booking**: Schedule appointments with trusted providers
- **Real-time Chat**: Communicate directly with service providers
- **Reviews & Ratings**: Share and read authentic reviews
- **Payment Integration**: Secure payment processing

### For Service Providers
- **Profile Management**: Showcase skills and services
- **Booking Management**: Manage appointments and schedules
- **Earnings Tracking**: Monitor income and performance
- **Customer Communication**: Built-in messaging system
- **Review Management**: Build reputation through reviews

### Platform Features
- **Cross-device Sync**: Seamless experience across all devices
- **Real-time Notifications**: Stay updated on bookings and messages
- **Advanced Search**: Find services by location, category, and ratings
- **Secure Authentication**: JWT-based security with session management
- **Mobile-responsive**: Optimized for desktop, tablet, and mobile

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **Tanstack Query** for data fetching

### Backend
- **Node.js** with Express
- **MongoDB Atlas** for cloud database
- **Mongoose** for ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Socket.io** for real-time features

### DevOps & Deployment
- **Vercel** for frontend deployment
- **Vercel** for backend deployment
- **MongoDB Atlas** for database hosting
- **Environment-based configuration**

## 📊 Connection Reliability

### Enhanced MongoDB Atlas Setup
- **Optimized connection pooling** for better performance
- **IPv4 preference** for cross-device compatibility
- **SSL/TLS optimization** for secure connections
- **Automatic failover** and reconnection logic

### Cross-device Support
- **Environment-aware configuration** for different deployment targets
- **Dynamic API URL resolution** based on environment
- **CORS optimization** for various domains and preview URLs
- **Mobile-first responsive design**

## 🔒 Security Features

- **JWT-based authentication** with secure token management
- **CORS protection** with environment-specific origins
- **Input validation** and sanitization
- **Secure file upload** handling
- **Environment variable protection**
- **HTTPS enforcement** in production

## 📱 Mobile & Cross-Platform

- **Responsive design** that works on all screen sizes
- **Touch-optimized** interface for mobile devices
- **Fast loading** with optimized assets
- **Offline-capable** with service worker support
- **PWA-ready** for app-like experience

## 🔧 Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Backend
```bash
npm run dev          # Start with nodemon
npm start           # Start production server
```

#### Combined
```bash
./start-dev.sh      # Start both frontend and backend
```

### Project Structure
```
bodyconnect/
├── backend/                 # Node.js API server
│   ├── config/             # Database and app configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── uploads/           # File upload directory
├── src/                   # React frontend
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utility libraries
│   └── pages/             # Page components
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🚨 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```bash
# Check your connection string format
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Verify MongoDB Atlas network access
# Add 0.0.0.0/0 to Network Access in MongoDB Atlas
```

#### Frontend Can't Connect to Backend
```bash
# Verify backend is running
curl http://localhost:5000/api/health

# Check CORS configuration in backend/App.js
```

#### Environment Variables Not Loading
```bash
# Ensure .env file exists in backend/
cp backend/.env.example backend/.env

# Update with your actual values
```

### Health Check Debug
Visit `http://localhost:5000/api/health` to see detailed system status including:
- Database connection status
- Environment configuration
- Memory usage and uptime
- Error details if any issues

## 📚 Documentation

- **[Setup Guide](MONGODB_SETUP.md)** - Complete MongoDB Atlas setup
- **[Improvements Summary](IMPROVEMENTS_SUMMARY.md)** - Detailed breakdown of enhancements
- **[API Documentation](docs/API.md)** - Backend API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions

## 🎯 Performance Targets

- **Connection Success Rate**: >99%
- **API Response Time**: <200ms
- **Page Load Time**: <2s
- **Error Rate**: <1%
- **Cross-device Compatibility**: 100%

## 🚀 Future Roadmap

### Planned Features
- [ ] Real-time notifications with WebSocket
- [ ] Advanced search with filters and geolocation
- [ ] Multi-language support
- [ ] Mobile app with React Native
- [ ] Advanced analytics dashboard
- [ ] AI-powered service recommendations

### Technical Improvements
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Error tracking integration
- [ ] Database optimization
- [ ] Caching layer implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: Check the guides in the `docs/` folder
- **Health Check**: Visit `/api/health` for system status
- **Issues**: Create an issue on GitHub
- **Email**: support@bodyconnect.app

---

<div align="center">
  <p><strong>Built with ❤️ for the body service community</strong></p>
  <p>Connecting people with trusted professionals, one service at a time</p>
</div>
