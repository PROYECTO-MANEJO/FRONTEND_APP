import React from 'react';
import { Box } from '@mui/material';
import UserSidebar from './UserSidebar';
import { useUserSidebarLayout } from '../../hooks/useUserSidebarLayout';

const UserLayout = ({ children }) => {
  const { getMainContentStyle } = useUserSidebarLayout();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          ...getMainContentStyle(),
          p: { xs: 2, sm: 3 },
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default UserLayout; 