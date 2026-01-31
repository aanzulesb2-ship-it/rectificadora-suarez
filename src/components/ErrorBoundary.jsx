import { ErrorBoundary as REB } from 'react-error-boundary';

function FallbackComponent({ error }) {
  return (
    <div className="p-8 text-center text-red-700 bg-red-100 rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-2">¡Ocurrió un error inesperado!</h2>
      <p className="mb-4">Por favor recarga la página o contacta al soporte si el problema persiste.</p>
      <pre className="text-xs text-red-900 bg-red-50 p-2 rounded">{error?.message}</pre>
    </div>
  );
}

export function ErrorBoundary({ children }) {
  return (
    <REB FallbackComponent={FallbackComponent}>
      {children}
    </REB>
  );
}
