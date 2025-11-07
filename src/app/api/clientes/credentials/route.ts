import { NextRequest, NextResponse } from 'next/server';


// Forzar renderizado dinámico - no pregenerar durante el build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Endpoint proxy que devuelve credenciales para que el frontend llame directamente
export async function GET(request: NextRequest) {
  const apiUser = process.env.EXTERNAL_API_USER || 'UsrRetailReebok';
  const apiPassword = process.env.EXTERNAL_API_PASSWORD || 'AccesoRetailReebok2025@UnionGroup.Com';
  const basicAuth = Buffer.from(`${apiUser}:${apiPassword}`).toString('base64');

  return NextResponse.json({
    success: true,
    url: 'https://www.vectordelta.com.mx:81/UnionGroup/API/Query/MasterData/ClientesParaCodigosIC',
    authHeader: `Basic ${basicAuth}`
  });
}
