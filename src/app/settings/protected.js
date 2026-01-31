import ProtectedRoute from '@/components/ProtectedRoute';
import SettingsPage from './page';

export default function SettingsProtected() {
  return (
    <ProtectedRoute requiredRole="admin">
      <SettingsPage />
    </ProtectedRoute>
  );
}

