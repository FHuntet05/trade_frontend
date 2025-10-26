// RUTA: frontend/src/components/ErrorBoundary.jsx
// --- COMPONENTE NUEVO PARA LA CAPTURA GLOBAL DE ERRORES ---

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la UI de fallback.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("Error de renderizado no capturado:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier UI de fallback personalizada
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center text-center p-4 bg-system-background text-text-primary">
          <h1 className="text-2xl font-bold text-red-500">Algo salió mal.</h1>
          <p className="text-text-secondary mt-2">
            La aplicación ha encontrado un error inesperado. Por favor, intenta recargar la página.
          </p>
          {/* Opcional: Botón para recargar */}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-ios-green text-white font-semibold rounded-lg"
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;