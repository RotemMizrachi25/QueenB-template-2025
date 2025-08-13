import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import MentorSignUp from './mentorSignUp';
import MentitSignUp from './MentitSignUp';

const RegistrationPage = () => {
  const [tabValue, setTabValue] = useState(0); // 0 = Mentor, 1 = Mentee

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box bgcolor="background.default" minHeight="100vh" display="flex" alignItems="center" py={4}>
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          
          {/* Header */}
          <Box bgcolor="primary.main" color="primary.contrastText" p={4} textAlign="center">
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              👑 QueenB
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Join our mentorship platform
            </Typography>
          </Box>

          {/* Tabs */}
          <Box p={3}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              sx={{ mb: 3 }}
            >
              <Tab label="Register as Mentor" icon={<PersonAdd />} />
              <Tab label="Register as Mentee" icon={<PersonAdd />} />
            </Tabs>

            {/* Tab Content */}
            {tabValue === 0 && <MentorSignUp />}
            {tabValue === 1 && <MentitSignUp />}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegistrationPage;
