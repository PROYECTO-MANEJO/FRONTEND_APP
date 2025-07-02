import React, { useState, useEffect } from "react";
import "./DocumentViewer.css";

const DocumentViewer = ({ open, onClose, pdfUrl, onApprove, onReject, title = "Documento" }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efecto para manejar cambios en la URL
  useEffect(() => {
    // Reiniciar estados cuando cambia la URL
    if (pdfUrl) {
      setLoading(true);
      setError(null);
      
      // Validar que la URL sea válida
      try {
        new URL(pdfUrl);
      } catch (err) {
        console.error("❌ URL inválida:", err, pdfUrl);
        setError("La URL del documento no es válida. Posible problema con la configuración de la API.");
        setLoading(false);
      }
    }
  }, [pdfUrl]);

  // Efecto para manejar mensajes del iframe
  useEffect(() => {
    // Función para manejar errores de iframe
    const handleIframeMessage = (event) => {
      if (event.data && event.data.type === 'pdf-error') {
        console.error("❌ Error reportado por iframe:", event.data);
        setError(event.data.message || "Error al cargar el PDF");
        setLoading(false);
      }
    };
    
    window.addEventListener('message', handleIframeMessage);
    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, []);

  if (!open) return null;

  const handleIframeLoad = () => {
    console.log("✅ PDF cargado correctamente");
    setLoading(false);
  };

  const handleIframeError = (e) => {
    console.error("❌ Error al cargar el PDF:", e);
    setError("No se pudo cargar el documento. El archivo podría no estar disponible o hay problemas de conexión.");
    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-large">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-icon" onClick={onClose}>×</button>
        </div>
        
        <div className="document-container">
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando documento...</p>
            </div>
          )}
          
          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <p className="error-details">
                Si el problema persiste, contacte al administrador del sistema.
                <br />
                Error común: Problema con la configuración de la URL base de la API.
              </p>
            </div>
          )}
          
          {pdfUrl && !error && (
            <iframe
              src={pdfUrl}
              title="Vista previa PDF"
              width="100%"
              height="100%"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{ 
                display: loading ? 'none' : 'block',
                border: 'none'
              }}
            ></iframe>
          )}
        </div>
        
        <div className="modal-actions">
          {onApprove && !error && (
            <button 
              className="approve-btn" 
              onClick={onApprove}
              disabled={loading || error}
            >
              Aprobar
            </button>
          )}
          
          {onReject && !error && (
            <button 
              className="reject-btn" 
              onClick={onReject}
              disabled={loading || error}
            >
              Rechazar
            </button>
          )}
          
          <button className="close-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
