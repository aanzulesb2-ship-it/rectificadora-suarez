import ProtectedRoute from '../components/ProtectedRoute';
import EditarOrden from './page';

export default function EditarOrdenProtected() {
  return (
    <ProtectedRoute>
      <EditarOrden />
    </ProtectedRoute>
  );
}
