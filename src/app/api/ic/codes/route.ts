import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener todos los códigos IC
export async function GET() {
  try {
    // Por ahora devolvemos datos mock hasta que tengamos la tabla real
    const mockCodes = [
      {
        id: '1',
        ic_code: 'IC001',
        description: 'Código de prueba 1',
        category: 'general',
        status: 'active',
        created_at: new Date('2024-01-01'),
        created_by: 1
      },
      {
        id: '2', 
        ic_code: 'IC002',
        description: 'Código de prueba 2',
        category: 'barcode',
        status: 'active',
        created_at: new Date('2024-01-02'),
        created_by: 1
      },
      {
        id: '3',
        ic_code: 'IC003',
        description: 'Código inactivo',
        category: 'qr',
        status: 'inactive',
        created_at: new Date('2024-01-03'),
        created_by: 1
      }
    ];

    return NextResponse.json({
      success: true,
      codes: mockCodes
    });

  } catch (error) {
    console.error('Error fetching IC codes:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo código IC
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ic_code, description, category = 'general', status = 'active' } = body;

    // Validaciones básicas
    if (!ic_code || !description) {
      return NextResponse.json(
        { success: false, error: 'Código IC y descripción son requeridos' },
        { status: 400 }
      );
    }

    // Por ahora simulamos la creación
    const newCode = {
      id: Date.now().toString(),
      ic_code,
      description,
      category,
      status,
      created_at: new Date(),
      created_by: 1
    };

    // Simular log
    console.log('IC Code created:', newCode);

    return NextResponse.json({
      success: true,
      message: 'Código IC creado exitosamente',
      code: newCode
    });

  } catch (error) {
    console.error('Error creating IC code:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar código IC existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ic_code, description, category, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de código IC requerido' },
        { status: 400 }
      );
    }

    // Por ahora simulamos la actualización
    const updatedCode = {
      id,
      ic_code,
      description,
      category,
      status,
      created_at: new Date('2024-01-01'), // Fecha mock
      created_by: 1,
      lastUpdated: new Date()
    };

    console.log('IC Code updated:', updatedCode);

    return NextResponse.json({
      success: true,
      message: 'Código IC actualizado exitosamente',
      code: updatedCode
    });

  } catch (error) {
    console.error('Error updating IC code:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar código IC
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de código IC requerido' },
        { status: 400 }
      );
    }

    // Por ahora simulamos la eliminación
    console.log('IC Code deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Código IC eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting IC code:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}