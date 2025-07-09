#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Docker Cleanup for Trading Bot${NC}"

# Function to prompt user for confirmation
confirm() {
    read -p "$(echo -e $1) [y/N]: " response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Stop running containers
if confirm "${YELLOW}Stop all running Trading Bot containers?${NC}"; then
    echo -e "${BLUE}🛑 Stopping containers...${NC}"
    docker-compose down
    docker-compose -f docker-compose.dev.yml down 2>/dev/null
    echo -e "${GREEN}✅ Containers stopped${NC}"
fi

# Remove containers
if confirm "${YELLOW}Remove Trading Bot containers?${NC}"; then
    echo -e "${BLUE}🗑️  Removing containers...${NC}"
    docker-compose down --remove-orphans
    docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null
    echo -e "${GREEN}✅ Containers removed${NC}"
fi

# Remove images
if confirm "${YELLOW}Remove Trading Bot images?${NC}"; then
    echo -e "${BLUE}🗑️  Removing images...${NC}"
    docker rmi $(docker images "trading-bot*" -q) 2>/dev/null || echo -e "${YELLOW}No Trading Bot images found${NC}"
    docker rmi $(docker images "*trading-bot*" -q) 2>/dev/null || echo -e "${YELLOW}No additional Trading Bot images found${NC}"
    echo -e "${GREEN}✅ Images removed${NC}"
fi

# Remove volumes
if confirm "${YELLOW}Remove Trading Bot volumes? (This will delete logs and outputs)${NC}"; then
    echo -e "${BLUE}🗑️  Removing volumes...${NC}"
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v 2>/dev/null
    echo -e "${GREEN}✅ Volumes removed${NC}"
fi

# Clean up system
if confirm "${YELLOW}Clean up unused Docker resources system-wide?${NC}"; then
    echo -e "${BLUE}🧹 System cleanup...${NC}"
    docker system prune -f
    echo -e "${GREEN}✅ System cleaned${NC}"
fi

# Optional: Remove everything
if confirm "${RED}⚠️  DANGER: Remove ALL Docker resources including unrelated containers/images?${NC}"; then
    echo -e "${RED}💀 Nuclear cleanup...${NC}"
    docker system prune -a -f --volumes
    echo -e "${GREEN}✅ Everything cleaned${NC}"
fi

echo -e "${GREEN}🎉 Cleanup completed!${NC}"