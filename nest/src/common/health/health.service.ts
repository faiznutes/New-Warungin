import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  private getFirstDefinedEnv(keys: string[], fallback = "unknown"): string {
    for (const key of keys) {
      const value = process.env[key];
      if (value && value.trim()) {
        return value;
      }
    }

    return fallback;
  }

  async check() {
    const dbOk = await this.prisma.healthCheck();
    const status = dbOk ? "ok" : "degraded";
    const appName = process.env.APP_NAME || "warungin-backend";
    const appVersion = process.env.APP_VERSION || "unknown";
    const appCommitSha = this.getFirstDefinedEnv([
      "APP_COMMIT_SHA",
      "SOURCE_COMMIT",
      "COOLIFY_GIT_COMMIT_SHA",
      "GITHUB_SHA",
      "COMMIT_SHA",
      "VERCEL_GIT_COMMIT_SHA",
    ]);
    const appEnvironment = process.env.NODE_ENV || "development";
    const deploymentId = this.getFirstDefinedEnv(
      ["COOLIFY_DEPLOYMENT_ID", "DEPLOYMENT_ID"],
      "",
    );
    const containerId = this.getFirstDefinedEnv(["HOSTNAME"], "unknown");

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
          deploymentId: deploymentId || undefined,
          containerId,
          apiPrefix: "/api",
          healthEndpoint: "/health",
        },
        services: {
          database: dbOk ? "connected" : "disconnected",
        },
      },
    };
  }
}
