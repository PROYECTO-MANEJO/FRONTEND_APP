import React from "react";
import "./DocumentViewer.css";

const DocumentViewer = ({ open, onClose, pdfUrl, onApprove, onReject }) => {
  if (!open || !pdfUrl) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <iframe
          src={pdfUrl}
          title="Vista previa PDF"
          width="100%"
          height="500px"
        ></iframe>
        <div className="modal-actions">
          <button className="approve-btn" onClick={onApprove}>
            Aprobar
          </button>
          <button className="reject-btn" onClick={onReject}>
            Rechazar
          </button>
          <button className="close-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
