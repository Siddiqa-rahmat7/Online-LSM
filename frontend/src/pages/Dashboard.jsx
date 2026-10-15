import { useAuth } from '../AuthContext.jsx';
import StudentDashboard from './StudentDashboard.jsx';
import InstructorDashboard from './InstructorDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'instructor') return <InstructorDashboard />;
  return <StudentDashboard />;
}