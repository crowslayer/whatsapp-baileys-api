#!/bin/bash

# Script de Diagnóstico para WhatsApp Baileys API
# Ejecutar: chmod +x diagnose.sh && ./diagnose.sh

echo " [+] WhatsApp Baileys API - Diagnóstico"
echo "======================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para check
check_ok() {
    echo -e "${GREEN} $1${NC}"
}

check_warning() {
    echo -e "${YELLOW}  $1${NC}"
}

check_error() {
    echo -e "${RED}  $1${NC}"
}

# 1. Verificar Node.js
echo " [1]  Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_ok "Node.js instalado: $NODE_VERSION"
    
    # Verificar versión >= 20
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | tr -d 'v')
    if [ "$NODE_MAJOR" -ge 20 ]; then
        check_ok "Versión de Node.js >= 20 ✓"
    else
        check_warning "Se recomienda Node.js >= 20 (actual: $NODE_VERSION)"
    fi
else
    check_error "Node.js NO está instalado"
fi
echo ""

# 2. Verificar npm
echo " [2]  Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_ok "npm instalado: $NPM_VERSION"
else
    check_error "npm NO está instalado"
fi
echo ""

# 3. Verificar package.json
echo "[3]  Verificando package.json..."
if [ -f "package.json" ]; then
    check_ok "package.json encontrado"
    
    # Verificar Baileys
    if grep -q "@whiskeysockets/baileys" package.json; then
        BAILEYS_VERSION=$(grep "@whiskeysockets/baileys" package.json | cut -d'"' -f4)
        check_ok "Baileys instalado: $BAILEYS_VERSION"
    else
        check_error "Baileys NO encontrado en package.json"
    fi
    
    # Verificar EJS
    if grep -q "ejs" package.json; then
        check_ok "EJS instalado"
    else
        check_warning "EJS no encontrado (necesario para vistas)"
    fi
else
    check_error "package.json NO encontrado"
fi
echo ""

# 4. Verificar node_modules
echo " [4]  Verificando node_modules..."
if [ -d "node_modules" ]; then
    check_ok "node_modules existe"
    
    # Verificar Baileys instalado
    if [ -d "node_modules/@whiskeysockets/baileys" ]; then
        check_ok "Baileys instalado en node_modules"
    else
        check_error "Baileys NO está en node_modules"
        echo "   Ejecuta: npm install"
    fi
else
    check_error "node_modules NO existe"
    echo "   Ejecuta: npm install"
fi
echo ""

# 5. Verificar directorio dist
echo " [5]  Verificando compilación..."
if [ -d "dist" ]; then
    check_ok "Directorio dist existe"
else
    check_warning "Directorio dist NO existe"
    echo "   Ejecuta: npm run build"
fi
echo ""

# 6. Verificar carpeta sessions
echo " [6]  Verificando carpeta sessions..."
if [ -d "sessions" ]; then
    check_ok "Carpeta sessions existe"
    
    # Contar sesiones
    SESSION_COUNT=$(ls -1 sessions 2>/dev/null | wc -l)
    echo " - Sesiones encontradas: $SESSION_COUNT"
    
    # Verificar permisos
    if [ -r "sessions" ] && [ -w "sessions" ]; then
        check_ok "Permisos de sessions correctos"
    else
        check_warning "Problemas con permisos de sessions"
        echo " - Ejecuta: chmod -R 755 sessions"
    fi
else
    check_warning "Carpeta sessions NO existe (se creará automáticamente)"
fi
echo ""

# 7. Verificar estructura de carpetas
echo " [7]  Verificando estructura del proyecto..."
MISSING_DIRS=()

if [ ! -d "src" ]; then MISSING_DIRS+=("src"); fi
if [ ! -d "src/domain" ]; then MISSING_DIRS+=("src/domain"); fi
if [ ! -d "src/application" ]; then MISSING_DIRS+=("src/application"); fi
if [ ! -d "src/infrastructure" ]; then MISSING_DIRS+=("src/infrastructure"); fi

if [ ${#MISSING_DIRS[@]} -eq 0 ]; then
    check_ok "Estructura de carpetas correcta"
else
    check_error "Faltan carpetas: ${MISSING_DIRS[*]}"
fi
echo ""

# 8. Verificar archivos clave
echo " [8]  Verificando archivos clave..."
MISSING_FILES=()

if [ ! -f "src/index.ts" ]; then MISSING_FILES+=("src/index.ts"); fi
if [ ! -f "src/infrastructure/baileys/BaileysAdapter.ts" ]; then 
    MISSING_FILES+=("src/infrastructure/baileys/BaileysAdapter.ts")
fi
if [ ! -f "src/infrastructure/http/app.ts" ]; then 
    MISSING_FILES+=("src/infrastructure/http/app.ts")
fi

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    check_ok "Archivos clave encontrados"
else
    check_error "Faltan archivos: ${MISSING_FILES[*]}"
fi
echo ""

# 9. Verificar vistas
echo " [9]  Verificando vistas EJS..."
if [ -d "src/infrastructure/http/views" ]; then
    check_ok "Directorio views existe"
    
    if [ -f "src/infrastructure/http/views/qr-code.ejs" ]; then
        check_ok "qr-code.ejs encontrado"
    else
        check_warning "qr-code.ejs NO encontrado"
    fi
    
    if [ -f "src/infrastructure/http/views/error.ejs" ]; then
        check_ok "error.ejs encontrado"
    else
        check_warning "error.ejs NO encontrado"
    fi
else
    check_warning "Directorio views NO existe"
    echo "  Crea: mkdir -p src/infrastructure/http/views"
fi
echo ""

# 10. Verificar MongoDB
echo " [10] Verificando MongoDB..."
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    check_ok "Cliente de MongoDB instalado"
else
    check_warning "Cliente de MongoDB no detectado"
fi

# Verificar si MongoDB está corriendo
if nc -z localhost 27017 2>/dev/null; then
    check_ok "MongoDB corriendo en puerto 27017"
else
    check_error "MongoDB NO está corriendo en puerto 27017"
    echo "   Inicia MongoDB o verifica MONGODB_URI en .env"
fi
echo ""

# 11. Verificar puerto 3000
echo " [11]  Verificando puerto 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PID=$(lsof -Pi :3000 -sTCP:LISTEN -t)
    check_warning "Puerto 3000 está en uso (PID: $PID)"
    echo "  Detener: kill -9 $PID"
else
    check_ok "Puerto 3000 disponible"
fi
echo ""

# 12. Verificar .env
echo " [12]  Verificando configuración..."
if [ -f ".env" ]; then
    check_ok ".env encontrado"
    
    if grep -q "MONGODB_URI" .env; then
        check_ok "MONGODB_URI configurado"
    else
        check_warning "MONGODB_URI no encontrado en .env"
    fi
    
    if grep -q "PORT" .env; then
        PORT=$(grep "PORT" .env | cut -d'=' -f2)
        echo "   🔌 Puerto configurado: $PORT"
    fi
else
    check_warning ".env NO encontrado"
    echo "   Copia .env.example a .env"
fi
echo ""

# Resumen
echo "======================================"
echo " RESUMEN"
echo "======================================"

# Contar problemas
ERRORS=$(check_error "" 2>&1 | wc -l)
WARNINGS=$(check_warning "" 2>&1 | wc -l)

echo ""
echo " Recomendaciones:"
echo ""

# Verificar problemas críticos
CRITICAL=false

if [ ! -d "node_modules" ]; then
    echo " [!] CRÍTICO: Instalar dependencias"
    echo "   npm install"
    CRITICAL=true
fi

if [ ! -d "dist" ]; then
    echo " [!] IMPORTANTE: Compilar proyecto"
    echo "   npm run build"
fi

if ! nc -z localhost 27017 2>/dev/null; then
    echo " [!] CRÍTICO: Iniciar MongoDB"
    echo "   mongod (o servicio MongoDB)"
    CRITICAL=true
fi

if [ -d "sessions" ] && [ $(ls -1 sessions 2>/dev/null | wc -l) -gt 0 ]; then
    echo " [!] RECOMENDADO: Limpiar sesiones antiguas"
    echo "   rm -rf sessions/*"
fi

if [ "$CRITICAL" = false ]; then
    echo ""
    check_ok "Todo listo para ejecutar!"
    echo ""
    echo "  Inicia el servidor con:"
    echo "   npm run dev"
    echo ""
    echo " Luego crea una instancia:"
    echo "   curl -X POST http://localhost:3000/api/v1/instances \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"name\": \"Mi WhatsApp\"}'"
fi

echo ""
echo "======================================"