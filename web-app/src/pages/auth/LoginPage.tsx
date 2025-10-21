import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Container,
  Paper,
  Checkbox,
  FormControlLabel,
  Divider,
  IconButton,
} from '@mui/material';
import { 
  Google as GoogleIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo@hypatia-os.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google OAuth integration
    alert('Google login integration coming soon!');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex',
      bgcolor: '#f5f5f5'
    }}>
      {/* Left Section - Login Form */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'white',
        position: 'relative'
      }}>
        {/* Top Left Circle */}
        <Box sx={{
          position: 'absolute',
          top: 24,
          left: 24,
          width: 16,
          height: 16,
          borderRadius: '50%',
          bgcolor: '#6366f1'
        }} />

        {/* Top Right Register Link */}
        <Box sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?
          </Typography>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
              Register
            </Typography>
          </Link>
        </Box>

        {/* Centered Login Form */}
        <Container maxWidth="sm" sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          px: 4
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {/* User Icon */}
            <Box sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              border: '2px solid #e5e7eb'
            }}>
              <PersonIcon sx={{ fontSize: 32, color: '#6b7280' }} />
            </Box>

            {/* Login Title */}
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 600, 
              mb: 1,
              color: '#111827'
            }}>
              Login to your account
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Enter your details to login.
            </Typography>

            {/* Google Login Button */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{ 
                mb: 3,
                py: 1.5,
                borderColor: '#e5e7eb',
                color: '#374151',
                '&:hover': {
                  borderColor: '#d1d5db',
                  bgcolor: '#f9fafb'
                }
              }}
            >
              Continue with Google
            </Button>

            {/* Divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="body2" sx={{ px: 2, color: '#6b7280' }}>
                OR
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Email Field */}
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
              Email Address *
            </Typography>
            <TextField
              fullWidth
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              sx={{ mb: 3 }}
              variant="outlined"
            />

            {/* Password Field */}
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#374151' }}>
              Password *
            </Typography>
            <TextField
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              sx={{ mb: 3 }}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />

            {/* Keep me logged in & Forgot password */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 4
            }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Keep me logged in
                  </Typography>
                }
              />
              <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                  Forgot password?
                </Typography>
              </Link>
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                py: 1.5,
                bgcolor: '#6366f1',
                '&:hover': {
                  bgcolor: '#5856eb'
                }
              }}
            >
              {loading ? 'Signing In...' : 'Login'}
            </Button>
          </Box>
        </Container>

        {/* Footer */}
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 HypatiaOS
          </Typography>
        </Box>
      </Box>

      {/* Right Section - Branding */}
      <Box sx={{ 
        flex: 1, 
        p: 3,
        display: 'flex'
      }}>
        <Paper sx={{
          flex: 1,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Logo Area */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3
            }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                H
              </Typography>
            </Box>
            
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold', 
              mb: 2 
            }}>
              HypatiaOS
            </Typography>
            
            <Typography variant="h6" sx={{ 
              opacity: 0.9,
              fontWeight: 400
            }}>
              Clinical Research has never been easier.
            </Typography>
          </Box>

          {/* Decorative Elements */}
          <Box sx={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(40px)'
          }} />
          
          <Box sx={{
            position: 'absolute',
            bottom: '30%',
            left: '20%',
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            filter: 'blur(30px)'
          }} />

          {/* Bottom Section */}
          <Box sx={{ 
            mt: 'auto',
            display: 'flex',
            gap: 4
          }}>
            {/* Get Access */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 1 
              }}>
                Get Access
              </Typography>
              <Typography variant="body2" sx={{ 
                opacity: 0.9,
                lineHeight: 1.5
              }}>
                Sign up at HypatiaOS.com to start using the app.
              </Typography>
            </Box>

            {/* Questions */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 1 
              }}>
                Questions?
              </Typography>
              <Typography variant="body2" sx={{ 
                opacity: 0.9,
                lineHeight: 1.5
              }}>
                Reach us at support@hypatiaos.com or call +44203654321
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};
