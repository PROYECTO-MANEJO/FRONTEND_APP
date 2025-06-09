import React from 'react';
import { Box } from '@mui/material';
import UserSidebar from './UserSidebar';
import MisCertificados from './MisCertificados';

const MisCertificadosWrapper = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      <UserSidebar />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <MisCertificados />
      </Box>
    </Box>
  );
};

export default MisCertificadosWrapper; 