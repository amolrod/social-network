#!/bin/bash

# Script para probar la conexión a PostgreSQL y Redis

echo "🧪 Probando conexiones..."
echo ""

# Test PostgreSQL
echo "📊 Probando PostgreSQL (puerto 5433)..."
docker exec social-network-postgres pg_isready -U postgres
if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL está listo"
else
    echo "❌ PostgreSQL no responde"
fi

echo ""

# Test Redis
echo "📊 Probando Redis (puerto 6380)..."
docker exec social-network-redis redis-cli ping
if [ $? -eq 0 ]; then
    echo "✅ Redis está listo"
else
    echo "❌ Redis no responde"
fi

echo ""
echo "🔍 Ver logs si hay problemas:"
echo "   docker compose logs postgres"
echo "   docker compose logs redis"
