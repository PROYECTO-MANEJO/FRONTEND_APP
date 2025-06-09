import React from 'react';
import { Box } from '@mui/material';
import AdminSidebar from './AdminSidebar';
import { useSidebarLayout } from '../../hooks/useSidebarLayout';

const AdminLayout = ({ children, sx = {}, containerProps = {} }) => {
  const { getMainContentStyle } = useSidebarLayout();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5', ...sx }}>
      <AdminSidebar />
      
      <Box 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          ...getMainContentStyle(),
          ...containerProps.sx 
        }}
        {...containerProps}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout; 