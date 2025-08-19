import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import Header from './Header/Header';
import Footer from './Footer';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error, resend
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided. Please check your email for the correct verification link.');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        
        // Redirect based on user type after 3 seconds
        setTimeout(() => {
          if (data.user.userType === 'mentor') {
            navigate('/profile/edit');
          } else if (data.user.userType === 'mentee') {
            navigate('/mentors');
          } else {
            navigate('/');
          }
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Network error occurred. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail) {
      alert('Please enter your email address');
      return;
    }

    setResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.');
        setStatus('resend');
      } else {
        alert(data.message || data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      alert('Network error occurred. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box textAlign="center" py={6}>
            <CircularProgress size={60} sx={{ color: 'primary.main', mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Verifying your email...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we verify your email address.
            </Typography>
          </Box>
        );

      case 'success':
        return (
          <Box textAlign="center" py={6}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              Email Verified! 🎉
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              {message}
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              You will be redirected to your dashboard in a few seconds...
            </Alert>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              Continue to Dashboard
            </Button>
          </Box>
        );

      case 'error':
        return (
          <Box textAlign="center" py={6}>
            <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom color="error.main">
              Verification Failed
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              {message}
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 4 }}>
              Need a new verification email? Enter your email below:
            </Alert>

            <Box sx={{ maxWidth: 400, mx: 'auto' }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Enter your email"
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleResendVerification}
                disabled={resending}
                startIcon={resending ? <CircularProgress size={20} /> : <EmailIcon />}
                sx={{ mb: 2 }}
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        );

      case 'resend':
        return (
          <Box textAlign="center" py={6}>
            <EmailIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom color="primary.main">
              Email Sent! 📧
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              {message}
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please check your email inbox (and spam folder) for the verification link.
            </Alert>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              Back to Home
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <Box bgcolor="background.default" minHeight="100vh" py={4}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            {/* Header */}
            <Box
              bgcolor="primary.main"
              color="primary.contrastText"
              p={3}
              textAlign="center"
            >
              <Typography variant="h4" gutterBottom>
                👑 Email Verification
              </Typography>
              <Typography variant="body1" opacity={0.9}>
                Secure your QueenB account
              </Typography>
            </Box>

            {/* Content */}
            <Box p={3}>
              {renderContent()}
            </Box>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default EmailVerification;