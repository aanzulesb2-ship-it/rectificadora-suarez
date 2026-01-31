import ProtectedRoute from '@/components/ProtectedRoute';
import NuevaOrden from './page';

export default function NuevaOrdenProtected() {
  return (
    <ProtectedRoute>
      <NuevaOrden />
    </ProtectedRoute>
  );
}

