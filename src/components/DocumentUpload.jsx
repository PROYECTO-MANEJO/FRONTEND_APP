import React, { useState, useEffect } from "react";
import { documentService } from "../services/documentService";
import { useAuth } from "../hooks/useAuth";
import "./DocumentUpload.css";

const DocumentUpload = () => {
  const { user } = useAuth();
  const [documentStatus, setDocumentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState({
    cedula_pdf: null,
    matricula_pdf: null,
  });
  const [dragActive, setDragActive] = useState({
    cedula: false,
    matricula: false,
  });

  // Verificar si es estudiante
  const isEstudiante = user?.rol === "ESTUDIANTE";

  useEffect(() => {
    loadDocumentStatus();
  }, []);

  const loadDocumentStatus = async () => {
    try {
      setLoading(true);
      const response = await documentService.getDocumentStatus();
      setDocumentStatus(response.data);
    } catch (error) {
      console.error("Error cargando estado de documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event, tipo) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setFiles((prev) => ({
        ...prev,
        [tipo]: file,
      }));
    } else {
      alert("Solo se permiten archivos PDF");
    }
  };

  const handleDrag = (e, tipo) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive((prev) => ({ ...prev, [tipo]: true }));
    } else if (e.type === "dragleave") {
      setDragActive((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  const handleDrop = (e, tipo) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [tipo]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setFiles((prev) => ({
          ...prev,
          [tipo]: file,
        }));
      } else {
        alert("Solo se permiten archivos PDF");
      }
    }
  };

  const removeFile = (tipo) => {
    setFiles((prev) => ({
      ...prev,
      [tipo]: null,
    }));
    // Limpiar input
    const input = document.getElementById(`${tipo}_input`);
    if (input) input.value = "";
  };

  const uploadDocuments = async () => {
    try {
      setUploading(true);

      // Validaciones
      if (!files.cedula_pdf) {
        alert("El archivo de cédula es obligatorio");
        return;
      }

      if (isEstudiante && !files.matricula_pdf) {
        alert("Para estudiantes es obligatorio el archivo de matrícula");
        return;
      }

      // Crear FormData
      const formData = new FormData();
      formData.append("cedula", files.cedula_pdf);

      if (isEstudiante && files.matricula_pdf) {
        formData.append("matricula", files.matricula_pdf);
      }

      // Subir archivos
      const response = await documentService.uploadDocuments(formData);

      if (response.success) {
        alert("Documentos subidos exitosamente. Pendientes de verificación.");

        // Limpiar formulario
        setFiles({ cedula_pdf: null, matricula_pdf: null });
        document.getElementById("cedula_pdf_input").value = "";
        if (isEstudiante) {
          document.getElementById("matricula_pdf_input").value = "";
        }

        // Recargar estado
        await loadDocumentStatus();
      }
    } catch (error) {
      console.error("Error subiendo documentos:", error);
      alert(error.response?.data?.message || "Error al subir documentos");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="document-upload-container">
        <div className="loading-spinner">Cargando estado de documentos...</div>
      </div>
    );
  }

  return (
    <div className="document-upload-container">
      <div className="document-upload-header">
        <h3>📄 Documentos de Verificación</h3>
        <p className="document-subtitle">
          {isEstudiante
            ? "Como estudiante, debes subir tanto tu cédula como tu matrícula."
            : "Debes subir tu documento de cédula para verificación."}
        </p>
      </div>

      {/* Estado Actual de Documentos */}
      {documentStatus && (
        <div className="document-status">
          <h4>📊 Estado Actual</h4>
          <div className="status-grid">
            <div
              className={`status-item ${
                documentStatus.cedula_subida ? "uploaded" : "pending"
              }`}
            >
              <span className="status-icon">
                {documentStatus.cedula_subida ? "✅" : "⏳"}
              </span>
              <div className="status-info">
                <strong>Cédula</strong>
                <span>
                  {documentStatus.cedula_subida
                    ? `Subida (${
                        documentStatus.archivos_info?.cedula?.tamaño || "N/A"
                      })`
                    : "Pendiente"}
                </span>
              </div>
            </div>

            {documentStatus.matricula_requerida && (
              <div
                className={`status-item ${
                  documentStatus.matricula_subida ? "uploaded" : "pending"
                }`}
              >
                <span className="status-icon">
                  {documentStatus.matricula_subida ? "✅" : "⏳"}
                </span>
                <div className="status-info">
                  <strong>Matrícula</strong>
                  <span>
                    {documentStatus.matricula_subida
                      ? `Subida (${
                          documentStatus.archivos_info?.matricula?.tamaño ||
                          "N/A"
                        })`
                      : "Pendiente"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Estado de Verificación */}
          <div
            className={`verification-status ${
              documentStatus.documentos_verificados ? "verified" : "pending"
            }`}
          >
            <span className="verification-icon">
              {documentStatus.documentos_verificados ? "🎉" : "⏰"}
            </span>
            <div className="verification-info">
              <strong>Estado de Verificación:</strong>
              <span>
                {documentStatus.documentos_verificados
                  ? `Verificados (${new Date(
                      documentStatus.fecha_verificacion
                    ).toLocaleDateString()})`
                  : "Pendiente de verificación administrativa"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Subida */}
      <div className="upload-form">
        <h4>📤 Subir Nuevos Documentos</h4>

        {/* Upload Cédula */}
        <div className="upload-section">
          <label className="upload-label">
            📋 Cédula de Identidad <span className="required">*</span>
          </label>

          <div
            className={`drop-zone ${dragActive.cedula ? "drag-active" : ""} ${
              files.cedula_pdf ? "has-file" : ""
            }`}
            onDragEnter={(e) => handleDrag(e, "cedula")}
            onDragLeave={(e) => handleDrag(e, "cedula")}
            onDragOver={(e) => handleDrag(e, "cedula")}
            onDrop={(e) => handleDrop(e, "cedula_pdf")}
          >
            {files.cedula_pdf ? (
              <div className="file-preview">
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <div className="file-details">
                    <strong>{files.cedula_pdf.name}</strong>
                    <span>{formatFileSize(files.cedula_pdf.size)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={() => removeFile("cedula_pdf")}
                >
                  ❌
                </button>
              </div>
            ) : (
              <div className="drop-zone-content">
                <span className="upload-icon">📤</span>
                <p>
                  Arrastra tu cédula aquí o{" "}
                  <span className="browse-text">haz clic para seleccionar</span>
                </p>
                <small>Solo archivos PDF, máximo 10MB</small>
              </div>
            )}

            <input
              id="cedula_pdf_input"
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileSelect(e, "cedula_pdf")}
              className="file-input"
            />
          </div>
        </div>

        {/* Upload Matrícula (solo estudiantes) */}
        {isEstudiante && (
          <div className="upload-section">
            <label className="upload-label">
              🎓 Matrícula Estudiantil <span className="required">*</span>
            </label>

            <div
              className={`drop-zone ${
                dragActive.matricula ? "drag-active" : ""
              } ${files.matricula_pdf ? "has-file" : ""}`}
              onDragEnter={(e) => handleDrag(e, "matricula")}
              onDragLeave={(e) => handleDrag(e, "matricula")}
              onDragOver={(e) => handleDrag(e, "matricula")}
              onDrop={(e) => handleDrop(e, "matricula_pdf")}
            >
              {files.matricula_pdf ? (
                <div className="file-preview">
                  <div className="file-info">
                    <span className="file-icon">📄</span>
                    <div className="file-details">
                      <strong>{files.matricula_pdf.name}</strong>
                      <span>{formatFileSize(files.matricula_pdf.size)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => removeFile("matricula_pdf")}
                  >
                    ❌
                  </button>
                </div>
              ) : (
                <div className="drop-zone-content">
                  <span className="upload-icon">📤</span>
                  <p>
                    Arrastra tu matrícula aquí o{" "}
                    <span className="browse-text">
                      haz clic para seleccionar
                    </span>
                  </p>
                  <small>Solo archivos PDF, máximo 10MB</small>
                </div>
              )}

              <input
                id="matricula_pdf_input"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e, "matricula_pdf")}
                className="file-input"
              />
            </div>
          </div>
        )}

        {/* Botón de Subida */}
        <div className="upload-actions">
          <button
            type="button"
            className="upload-btn"
            onClick={uploadDocuments}
            disabled={
              uploading ||
              !files.cedula_pdf ||
              (isEstudiante && !files.matricula_pdf)
            }
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                Subiendo documentos...
              </>
            ) : (
              <>📤 Subir Documentos</>
            )}
          </button>

          <small className="upload-note">
            Los documentos serán revisados por el equipo administrativo.
            Recibirás una notificación una vez sean verificados.
          </small>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
