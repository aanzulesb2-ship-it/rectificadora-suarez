import ProtectedRoute from '@/components/ProtectedRoute';
import GestionClientes from './page';

export default function GestionClientesProtected() {
  return (
    <ProtectedRoute requiredRole="admin">
      <GestionClientes />
    </ProtectedRoute>
  );
}

