import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import DeveloperSidebar from './DeveloperSidebar';

const DeveloperLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <DeveloperSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
          overflow: 'auto'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DeveloperLayout; 