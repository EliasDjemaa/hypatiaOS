import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth Service is running',
    timestamp: new Date().toISOString(),
    service: 'auth-service',
    version: '1.0.0'
  });
});

// Demo login route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo users from the documentation
  const demoUsers = [
    { email: 'admin@hypatia-os.com', password: 'demo123', role: 'system_admin' },
    { email: 'sponsor.finance@demo.com', password: 'demo123', role: 'sponsor_finance_manager' },
    { email: 'sponsor.contracts@demo.com', password: 'demo123', role: 'sponsor_contract_manager' },
    { email: 'cro.finance@demo.com', password: 'demo123', role: 'cro_finance_analyst' },
    { email: 'cro.contracts@demo.com', password: 'demo123', role: 'cro_contract_manager' },
    { email: 'cro.legal@demo.com', password: 'demo123', role: 'cro_legal_officer' },
    { email: 'site.finance@demo.com', password: 'demo123', role: 'site_finance_coordinator' },
    { email: 'site.coordinator@demo.com', password: 'demo123', role: 'site_coordinator' },
    { email: 'demo@hypatia-os.com', password: 'demo123', role: 'cro_finance_analyst' }
  ];

  const user = demoUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Generate a simple token (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify({ 
      email: user.email, 
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    })).toString('base64');
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        email: user.email,
        role: user.role
      },
      token
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Get user profile route
app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
  
  try {
    const token = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (decoded.exp < Date.now()) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.json({
      success: true,
      user: {
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Demo data routes
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, email: 'admin@hypatia-os.com', role: 'system_admin', active: true },
      { id: 2, email: 'sponsor.finance@demo.com', role: 'sponsor_finance_manager', active: true },
      { id: 3, email: 'cro.finance@demo.com', role: 'cro_finance_analyst', active: true }
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Auth Service started on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
