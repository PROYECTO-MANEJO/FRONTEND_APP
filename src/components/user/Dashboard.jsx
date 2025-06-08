import { useAuth } from '../../context/AuthContext';
import UserDashboard from './UserDashboard';
import AdminDashboard from '../admin/AdminDashboard';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  // Si es admin, mostrar el AdminDashboard completo con sidebar
  if (isAdmin()) {
    return <AdminDashboard user={user} />;
  }

  // Si es usuario normal, mostrar el UserDashboard
  return <UserDashboard user={user} />;
};

export default Dashboard;