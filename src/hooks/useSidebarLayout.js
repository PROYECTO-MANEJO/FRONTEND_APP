import { useSidebar } from '../context/SidebarContext';

export const useSidebarLayout = () => {
  const { isCollapsed } = useSidebar();
  
  // Retorna el margen izquierdo apropiado según el estado del sidebar
  const getMainContentStyle = () => ({
    ml: isCollapsed ? '70px' : '280px',
    transition: 'margin-left 0.3s ease'
  });

  const getSidebarWidth = () => isCollapsed ? 70 : 280;

  return {
    isCollapsed,
    getMainContentStyle,
    getSidebarWidth
  };
};

export default useSidebarLayout; 