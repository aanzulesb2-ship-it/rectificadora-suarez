import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Puedes enviar el error a un servicio externo aquí
    console.error('ErrorBoundary atrapó un error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-700 bg-red-100 rounded-lg mt-8">
          <h2 className="text-2xl font-bold mb-2">¡Ocurrió un error inesperado!</h2>
          <p className="mb-4">Por favor recarga la página o contacta al soporte si el problema persiste.</p>
          <pre className="text-xs text-red-900 bg-red-50 p-2 rounded">{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
