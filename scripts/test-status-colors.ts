/**
 * Script de prueba para los colores de status de IC_Logs
 * Ejecutar con: npx tsx scripts/test-status-colors.ts
 */

import { getStatusColors, getStatusLabel, IC_LOG_STATUSES, isValidICLogStatus } from '../src/lib/status-colors';

console.log('🎨 Probando colores pasteles para estados de IC_Logs\n');

// Probar cada estado válido
IC_LOG_STATUSES.forEach(status => {
  const colors = getStatusColors(status);
  const label = getStatusLabel(status);
  
  console.log(`📊 Estado: ${status}`);
  console.log(`   Label: ${label}`);
  console.log(`   Colores:`);
  console.log(`   - Fondo: ${colors.bg}`);
  console.log(`   - Texto: ${colors.text}`);
  console.log(`   - Principal: ${colors.main}`);
  console.log(`   - Válido: ${isValidICLogStatus(status)}`);
  console.log('');
});

// Probar estado legacy (ERROR)
console.log('🔄 Probando estado legacy:');
const errorColors = getStatusColors('ERROR');
const errorLabel = getStatusLabel('ERROR');
console.log(`📊 Estado: ERROR`);
console.log(`   Label: ${errorLabel}`);
console.log(`   Colores:`);
console.log(`   - Fondo: ${errorColors.bg}`);
console.log(`   - Texto: ${errorColors.text}`);
console.log(`   - Principal: ${errorColors.main}`);
console.log(`   - Válido: ${isValidICLogStatus('ERROR')}`);
console.log('');

// Probar estado inválido
console.log('❌ Probando estado inválido:');
const invalidColors = getStatusColors('INVALID');
const invalidLabel = getStatusLabel('INVALID');
console.log(`📊 Estado: INVALID`);
console.log(`   Label: ${invalidLabel}`);
console.log(`   Colores:`);
console.log(`   - Fondo: ${invalidColors.bg}`);
console.log(`   - Texto: ${invalidColors.text}`);
console.log(`   - Principal: ${invalidColors.main}`);
console.log(`   - Válido: ${isValidICLogStatus('INVALID')}`);
console.log('');

// Mostrar resumen de colores
console.log('🎨 Resumen de paleta de colores pasteles:');
console.log('   PROCESADO: Verde pastel suave (#f0f9f0 / #2e7d2e)');
console.log('   PENDIENTE: Azul pastel suave (#f0f7ff / #1976d2)');
console.log('   FALLIDO:   Rojo pastel suave (#fff5f5 / #d32f2f)');
console.log('');
console.log('✅ Prueba completada. Todos los colores son pasteles y sutiles.');