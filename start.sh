#!/bin/bash

# 🚀 Script de Inicio Rápido - Social Network
# Este script inicia todo el stack de desarrollo

echo "🚀 Iniciando Social Network..."
echo "================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Iniciar Docker Compose
echo -e "${BLUE}📦 Iniciando bases de datos (Docker)...${NC}"
docker compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Bases de datos iniciadas${NC}"
    echo ""
    
    # Esperar a que PostgreSQL esté listo
    echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté listo...${NC}"
    sleep 3
    
    # Mostrar servicios
    echo -e "${BLUE}📊 Estado de servicios:${NC}"
    docker compose ps
    echo ""
    
    echo -e "${GREEN}✅ Todo listo!${NC}"
    echo ""
    echo "🌐 URLs disponibles:"
    echo "   - Frontend:  http://localhost:4200"
    echo "   - Backend:   http://localhost:3000/api/v1"
    echo "   - PgAdmin:   http://localhost:5051"
    echo ""
    echo "🔐 Credenciales PgAdmin:"
    echo "   Email:    admin@admin.com"
    echo "   Password: admin"
    echo ""
    echo "🔐 PostgreSQL:"
    echo "   Host:     localhost"
    echo "   Port:     5433"
    echo "   User:     postgres"
    echo "   Password: postgres"
    echo "   Database: social_network"
    echo ""
    echo "💡 Siguiente paso:"
    echo "   1. Abrir una nueva terminal y ejecutar: cd backend && npm run start:dev"
    echo "   2. Abrir otra terminal y ejecutar: cd frontend && npm start"
    echo ""
else
    echo -e "${RED}❌ Error al iniciar Docker Compose${NC}"
    exit 1
fi
