## InternConnect Deployment Guide

### Prerequisites for Deployment

- Docker and Docker Compose installed
- Domain name (optional)
- SSL certificate (for HTTPS)
- Cloud hosting account (AWS, Heroku, DigitalOcean, etc.)

### Option 1: Docker Compose (Local/VPS)

#### Step 1: Prepare Files

```bash
git clone https://github.com/yourusername/internconnect.git
cd internconnect
```

#### Step 2: Configure Environment

Create `.env` files:

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/internconnect?authSource=admin
JWT_SECRET=your_very_secure_secret_key_here_change_this
NODE_ENV=production
```

**flask-service/.env**
```
FLASK_ENV=production
FLASK_DEBUG=0
```

**frontend/.env**
```
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_FLASK_API_URL=https://yourdomain.com/flask
```

#### Step 3: Update Docker Compose

Edit `docker-compose.yml`:
- Replace localhost with your domain
- Set MongoDB credentials
- Configure volumes for persistence
- Add restart policies

#### Step 4: Deploy

```bash
docker-compose up -d
```

Verify services:
```bash
docker-compose ps
```

View logs:
```bash
docker-compose logs -f
```

### Option 2: Heroku Deployment

#### Backend Deployment

```bash
cd backend
heroku create your-backend-app
heroku config:set MONGODB_URI=<your_mongo_atlas_uri>
heroku config:set JWT_SECRET=<secure_secret>
git push heroku main
```

#### Flask Service Deployment

```bash
cd flask-service
heroku create your-flask-app
git push heroku main
```

#### Frontend Deployment

```bash
cd frontend
npm run build
heroku create your-frontend-app
git push heroku main
```

### Option 3: AWS EC2

#### 1. Launch EC2 Instance
- Ubuntu 20.04 or later
- t3.medium or larger
- 30GB+ storage
- Security group allowing 80, 443, 3000, 5000, 5001

#### 2. Install Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose nodejs npm python3-pip
sudo usermod -aG docker $USER
```

#### 3. Clone and Deploy
```bash
git clone https://github.com/yourusername/internconnect.git
cd internconnect
docker-compose up -d
```

#### 4. Setup Reverse Proxy (Nginx)
```bash
sudo apt install -y nginx
```

Create `/etc/nginx/sites-available/internconnect`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }

    location /api {
        proxy_pass http://localhost:5000;
    }

    location /flask {
        proxy_pass http://localhost:5001;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/internconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

### Option 4: DigitalOcean App Platform

1. Connect your GitHub repository
2. Create new app from repository
3. Configure services:
   - Frontend (Port 3000)
   - Backend (Port 5000)
   - Flask Service (Port 5001)
   - MongoDB

4. Set environment variables
5. Deploy

### Monitoring & Maintenance

#### Monitoring Tools
- **Uptime**: Uptime Robot
- **Logs**: ELK Stack or CloudWatch
- **Performance**: New Relic
- **Error Tracking**: Sentry

#### Regular Maintenance

```bash
# Update containers
docker-compose pull
docker-compose up -d

# Database backup
docker-compose exec mongodb mongodump --out /backup

# Check disk space
df -h

# View resource usage
docker stats
```

#### Database Backup Strategy

1. **Automated backups** (daily):
```bash
# Cron job for automated backups
0 2 * * * docker-compose exec mongodb mongodump --archive=/backups/mongo_$(date +\%Y\%m\%d).archive
```

2. **Cloud backup services**:
   - MongoDB Atlas automatic backups
   - AWS Backup
   - Google Cloud Backup

### SSL/HTTPS Setup

#### Using Let's Encrypt

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

#### Using CloudFlare
1. Point DNS to CloudFlare nameservers
2. Enable Flexible SSL
3. Add firewall rules
4. Cache static assets

### Scaling Considerations

#### Horizontal Scaling
- Load balance with Nginx or HAProxy
- Use Docker Swarm or Kubernetes
- Separate MongoDB into managed service

#### Vertical Scaling
- Increase instance size
- Optimize database queries
- Implement caching (Redis)
- Use CDN for static assets

#### Database Optimization
- Create indexes on frequently queried fields
- Use MongoDB Atlas sharding
- Archive old data
- Regular vacuum/maintenance

### Performance Optimization

1. **Frontend**:
   - Enable gzip compression
   - Minify CSS/JS
   - Lazy load images
   - Use CDN (CloudFront, CloudFlare)

2. **Backend**:
   - Implement caching
   - Use connection pooling
   - Optimize database queries
   - Add rate limiting

3. **Flask**:
   - Cache resume analysis results
   - Use async processing
   - Implement request queuing

### Security Hardening

1. **Network**:
   - Use VPN
   - Firewall rules
   - WAF protection
   - DDoS protection

2. **Application**:
   - Regular security updates
   - OWASP compliance
   - SQL injection prevention
   - XSS protection

3. **Data**:
   - Encrypt sensitive data
   - Secure file uploads
   - GDPR compliance
   - Regular backups

### Troubleshooting

#### Service Not Starting
```bash
docker-compose logs service_name
docker-compose restart service_name
```

#### Database Connection Issues
```bash
# Test connection
docker-compose exec mongodb mongosh
```

#### Memory Issues
```bash
# Increase memory limit
docker-compose down
# Edit docker-compose.yml
docker-compose up -d
```

#### Port Conflicts
```bash
# Check open ports
sudo lsof -i -P -n | grep LISTEN
# Change ports in docker-compose.yml
```

### Rollback Procedure

```bash
# Save current state
docker-compose down
git checkout previous_version
docker-compose up -d

# Or use Docker versions
docker images
docker tag image_id previous_tag
```

### Support & Resources

- Documentation: https://internconnect.com/docs
- GitHub Issues: https://github.com/internconnect/issues
- Email: support@internconnect.com
- Status Page: https://status.internconnect.com
