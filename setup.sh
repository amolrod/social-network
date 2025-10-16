#!/bin/bash

# 🚀 Script de Setup para Social Network
# Este script ayuda a configurar el proyecto por primera vez

echo "🚀 Social Network - Setup Script"
echo "================================"
echo ""

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instálalo desde https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node -v) detectado"
echo ""

# Verificar Docker
echo "🐳 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker no está instalado."
    echo "   Para desarrollo local, necesitarás PostgreSQL y Redis."
    echo "   Opciones:"
    echo "   1. Instalar Docker: https://www.docker.com/"
    echo "   2. Instalar PostgreSQL y Redis manualmente"
    echo ""
    read -p "¿Quieres continuar sin Docker? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Docker detectado"
    echo ""
    
    # Iniciar contenedores
    echo "🚀 Iniciando PostgreSQL y Redis..."
    docker compose up -d
    
    if [ $? -eq 0 ]; then
        echo "✅ Base de datos iniciadas correctamente"
        echo "   - PostgreSQL: localhost:5432"
        echo "   - Redis: localhost:6379"
        echo "   - PgAdmin: http://localhost:5050"
    else
        echo "❌ Error al iniciar los contenedores"
        exit 1
    fi
fi

echo ""
echo "📦 Instalando dependencias del backend..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Dependencias del backend instaladas"
else
    echo "❌ Error instalando dependencias del backend"
    exit 1
fi

echo ""
echo "📦 Instalando dependencias del frontend..."
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Dependencias del frontend instaladas"
else
    echo "❌ Error instalando dependencias del frontend"
    exit 1
fi

cd ..

echo ""
echo "✅ Setup completado exitosamente!"
echo ""
echo "📚 Próximos pasos:"
echo ""
echo "1. Iniciar el backend:"
echo "   cd backend && npm run start:dev"
echo ""
echo "2. En otra terminal, iniciar el frontend:"
echo "   cd frontend && npm start"
echo ""
echo "3. Abrir el navegador en:"
echo "   http://localhost:4200"
echo ""
echo "💡 Tip: Lee el README.md para más información"
echo ""
