import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography, Alert, Button } from "@mui/material";
import api from "../../services/api";

const VerificarCuenta = () => {
  const navigate = useNavigate();
  const [estado, setEstado] = useState({
    cargando: true,
    mensaje: "",
    exito: null,
  });

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");

    if (!token) {
      setEstado({
        cargando: false,
        mensaje: "Token no proporcionado",
        exito: false,
      });
      return;
    }

    api.get(`/verification/verificar-cuenta?token=${token}`)
      .then((res) => {
        setEstado({
          cargando: false,
          mensaje: res.data.message || "Cuenta verificada exitosamente",
          exito: true,
        });
      })
      .catch((err) => {
        setEstado({
          cargando: false,
          mensaje: err.response?.data?.message || "Error al verificar la cuenta",
          exito: false,
        });
      });
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "#f8f9fa",
        p: 3,
      }}
    >
      {estado.cargando ? (
        <>
          <CircularProgress size={50} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Verificando tu cuenta...
          </Typography>
        </>
      ) : (
        <Box sx={{ maxWidth: 400 }}>
          <Alert
            severity={estado.exito ? "success" : "error"}
            sx={{ mb: 3, borderRadius: 1 }}
          >
            {estado.mensaje}
          </Alert>
          <Button
            variant="contained"
            color={estado.exito ? "success" : "error"}
            fullWidth
            onClick={() => navigate("/login")}
          >
            Ir a Iniciar Sesión
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default VerificarCuenta;
