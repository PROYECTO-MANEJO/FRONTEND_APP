import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const EventoCard = ({ evento }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Typography variant="h6">{evento.nom_eve}</Typography>
      <Typography variant="body2" color="text.secondary">
        {evento.des_eve}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Fecha: {new Date(evento.fec_ini_eve).toLocaleDateString()}
      </Typography>
      <br />
      <Typography variant="caption" color="text.secondary">
        Área: {evento.are_eve} | Audiencia: {evento.tipo_audiencia_eve}
      </Typography>
    </CardContent>
  </Card>
);

export default EventoCard;