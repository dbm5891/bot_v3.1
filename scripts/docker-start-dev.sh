#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Starting Trading Bot in Development Mode${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if .env.dev file exists
if [ ! -f .env.dev ]; then
    echo -e "${YELLOW}⚠️  .env.dev file not found. Using default development settings...${NC}"
fi

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p backtesting/outputs
mkdir -p logs

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

# Build and start containers in development mode
echo -e "${BLUE}🔨 Building and starting development containers...${NC}"
docker-compose -f docker-compose.dev.yml up --build

echo -e "${GREEN}🔧 Development mode started!${NC}"
echo ""
echo -e "${GREEN}🌐 Frontend (with hot reload): http://localhost:3000${NC}"
echo -e "${GREEN}🔧 Backend API (with auto-reload): http://localhost:8000${NC}"
echo -e "${GREEN}📚 API Docs: http://localhost:8000/docs${NC}"
echo ""
echo -e "${BLUE}💡 Changes to your code will be automatically reflected${NC}"
echo -e "${BLUE}📋 Press Ctrl+C to stop all services${NC}"