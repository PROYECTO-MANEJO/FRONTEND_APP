import React, { createContext, useContext, useState } from 'react';

const UserSidebarContext = createContext();

export const UserSidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <UserSidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </UserSidebarContext.Provider>
  );
};

export const useUserSidebar = () => {
  const context = useContext(UserSidebarContext);
  if (!context) {
    throw new Error('useUserSidebar must be used within a UserSidebarProvider');
  }
  return context;
}; 