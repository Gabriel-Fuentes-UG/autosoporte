'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // El middleware redirigirá a /login
    router.push('/login');
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: '#f5f7fa',
        gap: 2,
      }}
    >
      <CircularProgress size={48} sx={{ color: '#2c3e50' }} />
      <Typography variant="body1" color="text.secondary">
        Redirigiendo...
      </Typography>
    </Box>
  );
}