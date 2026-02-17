#!/bin/bash

###############################################################################
# VPS Setup Script - Hostinger KVM 2
# Sistema: Next.js + PostgreSQL + Agentes de IA
# Ejecutar como root: sudo bash vps-setup.sh
###############################################################################

set -e  # Exit on error

echo "🚀 Iniciando setup de VPS para LegacyMark..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Actualizar sistema
echo -e "${GREEN}📦 Actualizando sistema...${NC}"
apt update && apt upgrade -y

# 2. Instalar dependencias básicas
echo -e "${GREEN}🔧 Instalando dependencias...${NC}"
apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx ufw

# 3. Instalar Node.js 20
echo -e "${GREEN}📦 Instalando Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verificar instalación
node --version
npm --version

# 4. Instalar PostgreSQL 15
echo -e "${GREEN}🗄️  Instalando PostgreSQL 15...${NC}"
apt install -y postgresql postgresql-contrib

# Iniciar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# 5. Instalar PM2
echo -e "${GREEN}⚡ Instalando PM2...${NC}"
npm install -g pm2

# 6. Configurar Firewall
echo -e "${GREEN}🔒 Configurando firewall...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 7. Crear usuario para aplicación
echo -e "${GREEN}👤 Creando usuario 'appuser'...${NC}"
if ! id -u appuser > /dev/null 2>&1; then
    useradd -m -s /bin/bash appuser
    usermod -aG sudo appuser
fi

# 8. Configurar PostgreSQL
echo -e "${GREEN}🗄️  Configurando PostgreSQL...${NC}"
sudo -u postgres psql << EOF
CREATE DATABASE legacymark;
CREATE USER legacyuser WITH ENCRYPTED PASSWORD 'ChangeThisPassword123!';
GRANT ALL PRIVILEGES ON DATABASE legacymark TO legacyuser;
\q
EOF

# 9. Crear directorios
echo -e "${GREEN}📁 Creando estructura de directorios...${NC}"
mkdir -p /var/www/legacymark
chown -R appuser:appuser /var/www/legacymark

# 10. Instalar herramientas adicionales
echo -e "${GREEN}🛠️  Instalando herramientas adicionales...${NC}"
npm install -g pnpm  # Opcional: gestor de paquetes más rápido

# 11. Instalar Redis (para AI worker queue)
echo -e "${GREEN}🔴 Instalando Redis...${NC}"
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server

# Configurar Redis para producción
sed -i 's/^supervised no/supervised systemd/' /etc/redis/redis.conf
sed -i 's/^# maxmemory <bytes>/maxmemory 2gb/' /etc/redis/redis.conf
sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
systemctl restart redis-server

# 12. Optimizar kernel parameters
echo -e "${GREEN}⚙️  Optimizando kernel parameters...${NC}"
cat >> /etc/sysctl.conf << EOF

# Network optimizations for KVM 4
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_slow_start_after_idle = 0
net.ipv4.tcp_tw_reuse = 1

#File descriptor limits
fs.file-max = 2097152

# Optimize for SSD
vm.dirty_ratio = 10
vm.dirty_background_ratio = 5
EOF

sysctl -p

# 13. Crear directorios de logs
mkdir -p /var/log/pm2
chown -R appuser:appuser /var/log/pm2

# 14. Instalar Node.js packages globales adicionales
npm install -g @nestjs/cli prisma bull bull-board

echo -e "${GREEN}✅ Setup completado para KVM 4!${NC}"
echo ""
echo -e "${YELLOW}📊 Especificaciones del servidor:${NC}"
echo "vCPU: 4 cores"
echo "RAM: 16 GB"
echo "Disco: 200 GB NVMe SSD"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"
echo "1. Configurar swap: bash /var/www/legacymark/scripts/setup-swap.sh"
echo "2. Optimizar PostgreSQL: bash /var/www/legacymark/scripts/optimize-postgresql.sh"
echo "3. Configurar monitoreo: bash /var/www/legacymark/scripts/setup-monitoring.sh"
echo "4. Clonar repositorio: git clone [tu-repo] /var/www/legacymark"
echo "5. Configurar .env.production"
echo "6. Deploy: bash /var/www/legacymark/scripts/deploy.sh"
echo ""
echo -e "${YELLOW}🔐 Credenciales PostgreSQL:${NC}"
echo "Database: legacymark"
echo "User: legacyuser"
echo "Password: ChangeThisPassword123! (¡CAMBIAR ESTO!)"
echo ""
echo -e "${YELLOW}📈 Capacidades estimadas:${NC}"
echo "• 150-300 usuarios concurrentes"
echo "• 15-30 agentes de IA simultáneos"
echo "• 4 instancias PM2 Next.js"
echo "• 2 workers dedicados para IA"
echo ""
