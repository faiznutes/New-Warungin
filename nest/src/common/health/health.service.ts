import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const dbOk = await this.prisma.healthCheck();
    const status = dbOk ? 'ok' : 'degraded';
    const appName = process.env.APP_NAME || 'warungin-backend';
    const appVersion = process.env.APP_VERSION || 'unknown';
    const appCommitSha = process.env.APP_COMMIT_SHA || 'unknown';
    const appEnvironment = process.env.NODE_ENV || 'development';

    return {
      success: true,
      data: {
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: appEnvironment,
        identity: {
          appName,
          appVersion,
          appCommitSha,
          apiPrefix: '/api',
          healthEndpoint: '/health',
        },
        services: {
          database: dbOk ? 'connected' : 'disconnected',
        },
      },
    };
  }
}
