'use client';

import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';

// Estilos CSS en línea para el loader
const styles = `
  @keyframes l7 {
    0%   {background-position:50%,0 0}
    50%  {background-position:50%,25px 0}
    100% {background-position:50%,25px 25px}
  }

  .custom-loader {
    width: 40px;
    aspect-ratio: 1;
    background:
      radial-gradient(farthest-side,#2c3e50 90%,#0000) 50%/8px 8px no-repeat,
      conic-gradient(from -90deg at 15px 15px,#0000 90deg,#fff 0) 0 0/25px 25px;
    animation: l7 1s infinite;
  }
`;

export default function DinoLoader() {
  useEffect(() => {
    // Inyectar estilos
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: '#2c3e50',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        gap: 3,
      }}
    >
      {/* Loader animado */}
      <Box className="custom-loader" />

      {/* Texto de carga */}
      <Typography
        sx={{
          color: 'white',
          fontSize: '1rem',
          fontWeight: 500,
          letterSpacing: '0.5px',
        }}
      >
        Cargando...
      </Typography>
    </Box>
  );
}
