import { NextRequest, NextResponse } from 'next/server';


// Forzar renderizado dinámico - no pregenerar durante el build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Importar el cache del archivo principal
let clientesCache: any = null;
let cacheTimestamp: number = 0;

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Limpiando cache de clientes...');
    
    // Limpiar cache
    clientesCache = null;
    cacheTimestamp = 0;
    
    return NextResponse.json({
      success: true,
      message: 'Cache limpiado correctamente',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Error al limpiar cache:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cacheInfo = {
      hasCache: clientesCache !== null,
      cacheAge: clientesCache ? Math.round((Date.now() - cacheTimestamp) / 1000) : 0,
      timestamp: cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null
    };
    
    return NextResponse.json({
      success: true,
      cache: cacheInfo
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
