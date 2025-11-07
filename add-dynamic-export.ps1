# Script para agregar export const dynamic = 'force-dynamic' a todos los route.ts

$files = Get-ChildItem -Path "src/app/api" -Filter "route.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Verificar si ya tiene la configuración
    if ($content -notmatch "export const dynamic") {
        Write-Host "Procesando: $($file.FullName)"
        
        # Buscar la primera línea de import
        $lines = Get-Content $file.FullName
        $insertIndex = 0
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match "^import") {
                # Encontrar el final de todos los imports
                for ($j = $i; $j -lt $lines.Count; $j++) {
                    if ($lines[$j] -notmatch "^import" -and $lines[$j].Trim() -ne "") {
                        $insertIndex = $j
                        break
                    }
                }
                break
            }
        }
        
        # Insertar las líneas de configuración
        $newLines = @()
        $newLines += $lines[0..($insertIndex - 1)]
        $newLines += ""
        $newLines += "// Forzar renderizado dinámico - no pregenerar durante el build"
        $newLines += "export const dynamic = 'force-dynamic';"
        $newLines += "export const revalidate = 0;"
        $newLines += ""
        $newLines += $lines[$insertIndex..($lines.Count - 1)]
        
        # Guardar el archivo
        $newLines | Set-Content $file.FullName -Encoding UTF8
        Write-Host "✓ Actualizado: $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "○ Ya configurado: $($file.Name)" -ForegroundColor Yellow
    }
}

Write-Host "`n✓ Proceso completado" -ForegroundColor Green
