#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Trading Bot v3.1 - Docker Setup Information${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check Docker installation
echo -e "${CYAN}📋 System Requirements:${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    echo -e "${GREEN}✅ Docker: ${DOCKER_VERSION}${NC}"
else
    echo -e "${RED}❌ Docker: Not installed${NC}"
fi

if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1)
    echo -e "${GREEN}✅ Docker Compose: ${COMPOSE_VERSION}${NC}"
else
    echo -e "${RED}❌ Docker Compose: Not installed${NC}"
fi

# Check if Docker is running
if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker daemon: Running${NC}"
else
    echo -e "${RED}❌ Docker daemon: Not running${NC}"
fi

echo ""

# Show file structure
echo -e "${CYAN}📁 Docker Files:${NC}"
files=(
    "Dockerfile.backend:Backend production image"
    "Dockerfile.frontend:Frontend production image"  
    "Dockerfile.frontend.dev:Frontend development image"
    "docker-compose.yml:Production orchestration"
    "docker-compose.dev.yml:Development orchestration"
    "nginx.conf:Nginx configuration"
    ".dockerignore:Build exclusions"
    ".env.example:Environment template"
    ".env.dev:Development environment"
)

for file_info in "${files[@]}"; do
    file=$(echo $file_info | cut -d':' -f1)
    desc=$(echo $file_info | cut -d':' -f2)
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC} - $desc"
    else
        echo -e "${RED}❌ $file${NC} - $desc"
    fi
done

echo ""

# Show available scripts
echo -e "${CYAN}🔧 Available Scripts:${NC}"
scripts=(
    "scripts/docker-start.sh:Start production environment"
    "scripts/docker-start-dev.sh:Start development environment"
    "scripts/docker-clean.sh:Clean up Docker resources"
    "scripts/docker-info.sh:Show this information"
)

for script_info in "${scripts[@]}"; do
    script=$(echo $script_info | cut -d':' -f1)
    desc=$(echo $script_info | cut -d':' -f2)
    if [ -f "$script" ] && [ -x "$script" ]; then
        echo -e "${GREEN}✅ ./$script${NC} - $desc"
    elif [ -f "$script" ]; then
        echo -e "${YELLOW}⚠️  ./$script${NC} - $desc (not executable)"
    else
        echo -e "${RED}❌ ./$script${NC} - $desc"
    fi
done

echo ""

# Show current Docker status
echo -e "${CYAN}🚀 Current Status:${NC}"
if docker-compose ps 2>/dev/null | grep -q "Up"; then
    echo -e "${GREEN}📊 Production containers: Running${NC}"
    docker-compose ps
else
    echo -e "${YELLOW}📊 Production containers: Stopped${NC}"
fi

if docker-compose -f docker-compose.dev.yml ps 2>/dev/null | grep -q "Up"; then
    echo -e "${GREEN}🛠️  Development containers: Running${NC}"
    docker-compose -f docker-compose.dev.yml ps
else
    echo -e "${YELLOW}🛠️  Development containers: Stopped${NC}"
fi

echo ""

# Quick start guide
echo -e "${CYAN}🚀 Quick Start:${NC}"
echo -e "${PURPLE}Production:${NC}   ./scripts/docker-start.sh"
echo -e "${PURPLE}Development:${NC} ./scripts/docker-start-dev.sh"
echo -e "${PURPLE}Cleanup:${NC}     ./scripts/docker-clean.sh"
echo ""
echo -e "${BLUE}📚 Full documentation: DOCKER_README.md${NC}"
echo -e "${BLUE}🌐 After starting: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 API docs: http://localhost:8000/docs${NC}"