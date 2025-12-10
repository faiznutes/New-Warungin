import { Router, Request, Response } from 'express';
import { authGuard } from '../middlewares/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../utils/logger';

const execAsync = promisify(exec);
const router = Router();

// Middleware: Only SUPER_ADMIN can access
const requireSuperAdmin = (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!user || user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Super Admin access required' });
  }
  next();
};

/**
 * GET /api/admin/docker/containers
 * Get list of Docker containers with status and resource usage
 */
router.get('/docker/containers', authGuard, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    logger.info('Fetching Docker containers list...');
    // Get container list using docker ps
    const { stdout: containersOutput } = await execAsync('docker ps -a --format "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}"');
    
    const containers = containersOutput.trim().split('\n').filter(Boolean).map((line) => {
      const [id, name, image, status, ports] = line.split('|');
      return {
        id: id.substring(0, 12),
        name,
        image,
        status: status.includes('Up') ? 'running' : status.includes('Restarting') ? 'restarting' : 'stopped',
        ports: ports || '-',
        health: 'unknown', // Will be updated below
        cpu: 'N/A',
        memory: 'N/A',
      };
    });

    // Get health status and stats for each container
    for (const container of containers) {
      try {
        // Get health status
        const { stdout: inspectOutput } = await execAsync(`docker inspect ${container.name} --format "{{.State.Health.Status}}"`);
        container.health = inspectOutput.trim() || 'no-healthcheck';

        // Get CPU and memory stats (if running)
        if (container.status === 'running') {
          try {
            // Escape container name for shell safety
            const escapedName = container.name.replace(/[^a-zA-Z0-9_-]/g, '');
            const { stdout: statsOutput } = await execAsync(
              `docker stats ${escapedName} --no-stream --format "{{.CPUPerc}}|{{.MemUsage}}" 2>/dev/null || echo "N/A|N/A"`
            );
            const [cpu, memory] = statsOutput.trim().split('|');
            container.cpu = cpu && cpu !== 'N/A' ? cpu.trim() : 'N/A';
            container.memory = memory && memory !== 'N/A' ? memory.trim() : 'N/A';
          } catch {
            // Stats might fail for some containers, ignore
            container.cpu = 'N/A';
            container.memory = 'N/A';
          }
        }
      } catch {
        // Container might not exist or be accessible, skip
      }
    }

    logger.info(`Successfully fetched ${containers.length} containers`);
    res.json({ containers });
  } catch (error: any) {
    logger.error('Error fetching containers:', error);
    res.status(500).json({ message: 'Failed to fetch containers', error: error.message });
  }
});

/**
 * POST /api/admin/docker/restart/:name
 * Restart a Docker container
 */
router.post('/docker/restart/:name', authGuard, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    // Escape container name for shell safety
    const escapedName = name.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!escapedName || escapedName !== name) {
      return res.status(400).json({ message: 'Invalid container name' });
    }
    await execAsync(`docker restart ${escapedName}`);
    res.json({ message: `Container ${escapedName} restarted successfully` });
  } catch (error: any) {
    console.error('Error restarting container:', error);
    res.status(500).json({ message: 'Failed to restart container', error: error.message });
  }
});

/**
 * POST /api/admin/docker/stop/:name
 * Stop a Docker container
 */
router.post('/docker/stop/:name', authGuard, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    // Escape container name for shell safety
    const escapedName = name.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!escapedName || escapedName !== name) {
      return res.status(400).json({ message: 'Invalid container name' });
    }
    await execAsync(`docker stop ${escapedName}`);
    res.json({ message: `Container ${escapedName} stopped successfully` });
  } catch (error: any) {
    console.error('Error stopping container:', error);
    res.status(500).json({ message: 'Failed to stop container', error: error.message });
  }
});

/**
 * GET /api/admin/docker/logs/:name
 * Get logs from a Docker container
 */
router.get('/docker/logs/:name', authGuard, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    // Escape container name for shell safety
    const escapedName = name.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!escapedName || escapedName !== name) {
      return res.status(400).json({ message: 'Invalid container name' });
    }
    const tail = req.query.tail ? parseInt(req.query.tail as string) : 200;
    // Validate tail parameter
    if (isNaN(tail) || tail < 1 || tail > 10000) {
      return res.status(400).json({ message: 'Invalid tail parameter (must be 1-10000)' });
    }
    const { stdout } = await execAsync(`docker logs ${escapedName} --tail ${tail} 2>&1`);
    res.json({ logs: stdout });
  } catch (error: any) {
    console.error('Error fetching container logs:', error);
    res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
  }
});

/**
 * GET /api/admin/server/resources
 * Get server resource usage (CPU, Memory, Disk)
 */
router.get('/server/resources', authGuard, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    // Get CPU usage - with fallback methods
    let cpu = 0;
    try {
      const { stdout: cpuOutput } = await execAsync("top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'");
      cpu = parseFloat(cpuOutput.trim()) || 0;
    } catch {
      // Fallback: use /proc/stat
      try {
        const { stdout: cpuStat } = await execAsync("grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$3+$4+$5)} END {print usage}'");
        cpu = parseFloat(cpuStat.trim()) || 0;
      } catch {
        cpu = 0;
      }
    }

    // Get Memory usage - with error handling
    let memory = 0;
    let memoryUsed = '0';
    let memoryTotal = '0';
    try {
      const { stdout: memOutput } = await execAsync("free | grep Mem | awk '{printf \"%.1f\", $3/$2 * 100.0}'");
      memory = parseFloat(memOutput.trim()) || 0;
      
      const { stdout: memUsedOutput } = await execAsync("free -h | grep Mem | awk '{print $3}'");
      const { stdout: memTotalOutput } = await execAsync("free -h | grep Mem | awk '{print $2}'");
      memoryUsed = memUsedOutput.trim() || '0';
      memoryTotal = memTotalOutput.trim() || '0';
    } catch (memError: any) {
      logger.warn('Error fetching memory usage:', memError.message);
      // Fallback values
      memory = 0;
      memoryUsed = '0';
      memoryTotal = '0';
    }

    // Get Disk usage - improved to handle all filesystems
    let disks: any[] = [];
    try {
      // Try to get all mounted filesystems (including Docker volumes)
      const { stdout: diskOutput } = await execAsync("df -h | tail -n +2 | awk '{print $6\"|\"$5\"|\"$3\"|\"$2\"|\"$1}'");
      const diskLines = diskOutput.trim().split('\n').filter(Boolean);
      disks = diskLines.map((line) => {
        const parts = line.split('|');
        if (parts.length >= 4) {
          const [mount, usage, used, total, device] = parts;
          // Only include real filesystems (exclude tmpfs, devtmpfs, etc.)
          if (mount && mount !== '-' && !mount.startsWith('/sys') && !mount.startsWith('/proc') && !mount.startsWith('/dev')) {
            return {
              mount: mount || 'Unknown',
              usage: usage ? usage.replace('%', '') : '0',
              used: used || '0',
              total: total || '0',
              device: device || 'Unknown',
            };
          }
        }
        return null;
      }).filter(Boolean);
      
      // If no disks found, try alternative method
      if (disks.length === 0) {
        const { stdout: altDiskOutput } = await execAsync("df -h / | tail -n +2 | awk '{print $6\"|\"$5\"|\"$3\"|\"$2\"|\"$1}'");
        const altParts = altDiskOutput.trim().split('|');
        if (altParts.length >= 4) {
          disks = [{
            mount: altParts[0] || '/',
            usage: altParts[1] ? altParts[1].replace('%', '') : '0',
            used: altParts[2] || '0',
            total: altParts[3] || '0',
            device: altParts[4] || 'Unknown',
          }];
        }
      }
    } catch (diskError: any) {
      logger.warn('Error fetching disk usage, using fallback:', diskError.message);
      // Fallback: return root filesystem info
      try {
        const { stdout: rootDisk } = await execAsync("df -h / | awk 'NR==2 {print $6\"|\"$5\"|\"$3\"|\"$2\"|\"$1}'");
        const parts = rootDisk.trim().split('|');
        if (parts.length >= 4) {
          disks = [{
            mount: parts[0] || '/',
            usage: parts[1] ? parts[1].replace('%', '') : '0',
            used: parts[2] || '0',
            total: parts[3] || '0',
            device: parts[4] || 'Unknown',
          }];
        }
      } catch {
        // Last resort: return empty array with message
        disks = [];
      }
    }

    // Get Uptime - with fallback
    let uptime = 'N/A';
    try {
      const { stdout: uptimeOutput } = await execAsync("uptime -p");
      uptime = uptimeOutput.trim() || 'N/A';
    } catch {
      try {
        // Fallback: use /proc/uptime
        const { stdout: uptimeSec } = await execAsync("cat /proc/uptime | awk '{print int($1)}'");
        const seconds = parseInt(uptimeSec.trim()) || 0;
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        uptime = `${days} days, ${hours} hours, ${minutes} minutes`;
      } catch {
        uptime = 'N/A';
      }
    }

    // Get Load Average - with fallback
    let loadAverage = 'N/A';
    try {
      const { stdout: loadOutput } = await execAsync("uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//'");
      loadAverage = loadOutput.trim() || 'N/A';
    } catch {
      try {
        // Fallback: use /proc/loadavg
        const { stdout: loadAvg } = await execAsync("cat /proc/loadavg | awk '{print $1}'");
        loadAverage = loadAvg.trim() || 'N/A';
      } catch {
        loadAverage = 'N/A';
      }
    }

    res.json({
      cpu: cpu.toFixed(1),
      memory: memory.toFixed(1),
      memoryUsed,
      memoryTotal,
      disks,
      uptime,
      loadAverage,
    });
  } catch (error: any) {
    console.error('Error fetching server resources:', error);
    res.status(500).json({ message: 'Failed to fetch server resources', error: error.message });
  }
});

/**
 * GET /api/admin/health
 * Get health status of all services
 */
router.get('/health', authGuard, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const services = [];

    // Check Backend
    try {
      const http = require('http');
      const response = await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3000/health', (res: any) => {
          resolve({ ok: res.statusCode === 200 });
        });
        req.on('error', reject);
        req.setTimeout(2000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      services.push({
        name: 'Backend API',
        status: (response as any).ok ? 'healthy' : 'unhealthy',
        message: (response as any).ok ? 'API is responding' : 'API is not responding',
      });
    } catch {
      services.push({
        name: 'Backend API',
        status: 'unhealthy',
        message: 'API is not accessible',
      });
    }

    // Check PostgreSQL
    try {
      await execAsync('docker exec warungin-postgres pg_isready -U postgres');
      services.push({
        name: 'PostgreSQL',
        status: 'healthy',
        message: 'Database is ready',
      });
    } catch {
      services.push({
        name: 'PostgreSQL',
        status: 'unhealthy',
        message: 'Database is not ready',
      });
    }

    // Check Redis
    try {
      await execAsync('docker exec warungin-redis redis-cli ping');
      services.push({
        name: 'Redis',
        status: 'healthy',
        message: 'Cache is ready',
      });
    } catch {
      services.push({
        name: 'Redis',
        status: 'unhealthy',
        message: 'Cache is not ready',
      });
    }

    // Check Nginx
    try {
      await execAsync('docker exec warungin-nginx nginx -t');
      services.push({
        name: 'Nginx',
        status: 'healthy',
        message: 'Web server is ready',
      });
    } catch {
      services.push({
        name: 'Nginx',
        status: 'unhealthy',
        message: 'Web server is not ready',
      });
    }

    // Check Cloudflared (if exists)
    try {
      await execAsync('docker exec warungin-cloudflared cloudflared --version');
      services.push({
        name: 'Cloudflared',
        status: 'healthy',
        message: 'Tunnel service is ready',
      });
    } catch {
      services.push({
        name: 'Cloudflared',
        status: 'unknown',
        message: 'Tunnel service is not accessible',
      });
    }

    // Check Prometheus (if exists)
    try {
      const http = require('http');
      const response = await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:9090/-/healthy', (res: any) => {
          resolve({ ok: res.statusCode === 200 });
        });
        req.on('error', reject);
        req.setTimeout(2000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      services.push({
        name: 'Prometheus',
        status: (response as any).ok ? 'healthy' : 'unhealthy',
        message: (response as any).ok ? 'Metrics server is ready' : 'Metrics server is not ready',
      });
    } catch {
      services.push({
        name: 'Prometheus',
        status: 'unknown',
        message: 'Metrics server is not accessible',
      });
    }

    // Check Loki (if exists)
    try {
      const http = require('http');
      const response = await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3100/ready', (res: any) => {
          resolve({ ok: res.statusCode === 200 });
        });
        req.on('error', reject);
        req.setTimeout(2000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      services.push({
        name: 'Loki',
        status: (response as any).ok ? 'healthy' : 'unhealthy',
        message: (response as any).ok ? 'Log aggregator is ready' : 'Log aggregator is not ready',
      });
    } catch {
      services.push({
        name: 'Loki',
        status: 'unknown',
        message: 'Log aggregator is not accessible',
      });
    }

    res.json({ services });
  } catch (error: any) {
    console.error('Error checking health:', error);
    res.status(500).json({ message: 'Failed to check health', error: error.message });
  }
});

/**
 * GET /api/admin/logs/:type
 * Get logs from various services
 */
router.get('/logs/:type', authGuard, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const tail = req.query.tail ? parseInt(req.query.tail as string) : 200;

    let logCommand = '';

    switch (type) {
      case 'backend':
        logCommand = `docker logs warungin-backend --tail ${tail} 2>&1`;
        break;
      case 'frontend':
        logCommand = `docker logs warungin-frontend --tail ${tail} 2>&1`;
        break;
      case 'nginx':
        logCommand = `docker logs warungin-nginx --tail ${tail} 2>&1`;
        break;
      case 'postgres':
        logCommand = `docker logs warungin-postgres --tail ${tail} 2>&1`;
        break;
      case 'redis':
        logCommand = `docker logs warungin-redis --tail ${tail} 2>&1`;
        break;
      default:
        return res.status(400).json({ message: 'Invalid log type' });
    }

    const { stdout } = await execAsync(logCommand);
    res.json({ logs: stdout });
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Failed to fetch logs', error: error.message });
  }
});

export default router;

