import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/sqlserver';
import bcrypt from 'bcryptjs';

// GET - Obtener todos los usuarios
export async function GET() {
  try {
    const res = await query(`
      SELECT id, username, role, created_at 
      FROM dbo.IC_Users 
      ORDER BY id DESC
    `);
    
    const users = res.recordset || [];

    return NextResponse.json({
      success: true,
      users: users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role = 'user' } = body;

    // Validaciones básicas
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    if (!['admin', 'user', 'viewer'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Rol inválido' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingRes = await query(`SELECT id FROM dbo.IC_Users WHERE username = @username`, { username });
    if (existingRes.recordset && existingRes.recordset.length > 0) {
      return NextResponse.json(
        { success: false, error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear el usuario
    await query(`
      INSERT INTO dbo.IC_Users (username, password_hash, role) 
      VALUES (@username, @password_hash, @role)
    `, { 
      username, 
      password_hash: hashedPassword, 
      role 
    });

    // Obtener el usuario creado
    const newUserRes = await query(`SELECT id, username, role, created_at FROM dbo.IC_Users WHERE username = @username`, { username });
    const newUser = newUserRes.recordset[0];

    // Log de la acción (opcional, si existe la tabla de logs)
    try {
      await query(`
        INSERT INTO dbo.IC_Logs (user_id, action, details, timestamp) 
        VALUES (@user_id, @action, @details, @timestamp)
      `, {
        user_id: newUser.id,
        action: 'USER_CREATED',
        details: `Usuario ${username} creado con rol ${role}`,
        timestamp: new Date()
      });
    } catch (logError) {
      console.log('Log error (non-critical):', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: newUser
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar usuario existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, username, password, role } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const existingRes = await query(`SELECT id, username FROM dbo.IC_Users WHERE id = @id`, { id });
    const existingUser = existingRes.recordset && existingRes.recordset[0];

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el nuevo username ya existe (si se está cambiando)
    if (username && username !== existingUser.username) {
      const duplicateRes = await query(`SELECT id FROM dbo.IC_Users WHERE username = @username AND id != @id`, { username, id });
      
      if (duplicateRes.recordset && duplicateRes.recordset.length > 0) {
        return NextResponse.json(
          { success: false, error: 'El nombre de usuario ya existe' },
          { status: 400 }
        );
      }
    }

    // Construir la query de actualización dinámicamente
    let updateQuery = 'UPDATE dbo.IC_Users SET ';
    const updateParams: any = { id };
    const updateFields: string[] = [];

    if (username) {
      updateFields.push('username = @username');
      updateParams.username = username;
    }

    if (password && password.length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateFields.push('password_hash = @password_hash');
      updateParams.password_hash = hashedPassword;
    }

    if (role && ['admin', 'user', 'viewer'].includes(role)) {
      updateFields.push('role = @role');
      updateParams.role = role;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay campos para actualizar' },
        { status: 400 }
      );
    }

    updateQuery += updateFields.join(', ') + ' WHERE id = @id';

    await query(updateQuery, updateParams);

    // Obtener el usuario actualizado
    const updatedRes = await query(`SELECT id, username, role, created_at FROM dbo.IC_Users WHERE id = @id`, { id });
    const updatedUser = updatedRes.recordset[0];

    // Log de la acción
    try {
      await query(`
        INSERT INTO dbo.IC_Logs (user_id, action, details, timestamp) 
        VALUES (@user_id, @action, @details, @timestamp)
      `, {
        user_id: id,
        action: 'USER_UPDATED',
        details: `Usuario ${updatedUser.username} actualizado`,
        timestamp: new Date()
      });
    } catch (logError) {
      console.log('Log error (non-critical):', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const existingRes = await query(`SELECT id, username, role FROM dbo.IC_Users WHERE id = @id`, { id });
    const existingUser = existingRes.recordset && existingRes.recordset[0];

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar al último admin
    if (existingUser.role === 'admin') {
      const adminCountRes = await query(`SELECT COUNT(*) as count FROM dbo.IC_Users WHERE role = 'admin'`);
      const adminCount = adminCountRes.recordset[0].count;
      
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: 'No se puede eliminar el último administrador' },
          { status: 400 }
        );
      }
    }

    // Log antes de eliminar
    try {
      await query(`
        INSERT INTO dbo.IC_Logs (user_id, action, details, timestamp) 
        VALUES (@user_id, @action, @details, @timestamp)
      `, {
        user_id: id,
        action: 'USER_DELETED',
        details: `Usuario ${existingUser.username} eliminado`,
        timestamp: new Date()
      });
    } catch (logError) {
      console.log('Log error (non-critical):', logError);
    }

    // Eliminar usuario
    await query(`DELETE FROM dbo.IC_Users WHERE id = @id`, { id });

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}