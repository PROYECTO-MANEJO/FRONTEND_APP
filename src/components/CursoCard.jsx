import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const CursoCard = ({ curso }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Typography variant="h6">{curso.nom_cur}</Typography>
      <Typography variant="body2" color="text.secondary">
        {curso.des_cur}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Fecha inicio: {new Date(curso.fec_ini_cur).toLocaleDateString()}
      </Typography>
      <br />
      <Typography variant="caption" color="text.secondary">
        Duración: {curso.dur_cur} horas
      </Typography>
    </CardContent>
  </Card>
);

export default CursoCard;