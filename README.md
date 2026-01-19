# 🌍 Travel App

A full-stack web application for discovering destinations, booking accommodations, and sharing travel experiences. Built with React and Node.js/Express.

## Features

✨ **Core Features**
- 🏠 Browse destinations and accommodations
- 🔍 Advanced search functionality
- 📝 User authentication & profiles
- ⭐ Save favorite destinations
- 💬 Write and read reviews
- 📅 Make reservations
- 🎊 Events discovery
- 🍽️ Dining recommendations
- 📧 Contact & subscription management
- 👨‍💼 Admin dashboard

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & development server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP requests

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

## Prerequisites

Before getting started, ensure you have:
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/travel-app.git
cd travel-app
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/travel-app
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

Start the backend server:

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

In a new terminal, navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Project Structure

```
travel-app/
├── backend/                    # Express.js API server
│   ├── controllers/           # Request handlers
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API endpoints
│   ├── middleware/            # Custom middleware
│   ├── services/              # Business logic
│   ├── config/                # Configuration files
│   ├── data/                  # Sample data
│   ├── uploads/               # Uploaded files
│   └── server.js              # Entry point
│
└── frontend/                  # React application
    ├── src/
    │   ├── components/        # Reusable React components
    │   ├── pages/             # Page components
    │   ├── hooks/             # Custom React hooks
    │   ├── assets/            # Images & static files
    │   ├── App.jsx            # Root component
    │   └── main.jsx           # Entry point
    └── vite.config.js         # Vite configuration
```

## Available API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Destinations
- `GET /api/destinations` - Get all destinations
- `GET /api/destinations/:id` - Get destination details
- `POST /api/destinations` - Create destination (admin)

### Reservations
- `GET /api/reservations` - Get user reservations
- `POST /api/reservations` - Create reservation
- `DELETE /api/reservations/:id` - Cancel reservation

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create review
- `DELETE /api/reviews/:id` - Delete review

### Search
- `GET /api/search` - Search destinations

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

### Admin
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/users` - Manage users

## Usage

### For Users

1. **Register/Login** - Create an account or sign in
2. **Browse** - Explore destinations and accommodations
3. **Search** - Use filters to find your perfect trip
4. **Save** - Add destinations to favorites
5. **Book** - Make reservations for rooms
6. **Review** - Share your travel experiences

### For Admins

1. Access the admin dashboard (requires admin privileges)
2. Manage destinations, users, and content
3. View analytics and statistics

## Environment Variables

### Backend `.env`

```env
# Database
MONGODB_URI=mongodb://localhost:27017/travel-app

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_secure_secret_key

# Email (if using email services)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

## Development

### Running Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
npm run build
npm run preview
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Ensure MongoDB is running locally or update `MONGODB_URI` |
| CORS errors | Check backend CORS configuration |
| Port already in use | Change PORT in `.env` or kill existing process |
| Module not found | Run `npm install` in respective directory |
| Frontend not connecting to backend | Verify backend URL in frontend API calls |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Contact the development team

## Roadmap

- [ ] Mobile app version
- [ ] Payment gateway integration
- [ ] Real-time notifications
- [ ] AI-powered recommendations
- [ ] Social features
- [ ] Multi-language support

---

**Happy Traveling! 🚀**
