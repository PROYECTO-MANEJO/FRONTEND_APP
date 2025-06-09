import React from 'react';
import { Box } from '@mui/material';
import UserSidebar from './UserSidebar';
import MisCertificados from './MisCertificados';
import { useUserSidebarLayout } from '../../hooks/useUserSidebarLayout';

const MisCertificadosWrapper = () => {
  const { getMainContentStyle } = useUserSidebarLayout();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />
      <Box sx={{ 
        flexGrow: 1,
        ...getMainContentStyle()
      }}>
        <MisCertificados />
      </Box>
    </Box>
  );
};

export default MisCertificadosWrapper; 