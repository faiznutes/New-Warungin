import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  private isLikelyCommitSha(value?: string): boolean {
    return Boolean(value && /^[a-f0-9]{7,40}$/i.test(value.trim()));
  }

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
    const commitCandidates: Array<[string, string | undefined]> = [
      ["SOURCE_COMMIT", process.env.SOURCE_COMMIT],
      ["COOLIFY_GIT_COMMIT_SHA", process.env.COOLIFY_GIT_COMMIT_SHA],
      ["GITHUB_SHA", process.env.GITHUB_SHA],
      ["COMMIT_SHA", process.env.COMMIT_SHA],
      ["VERCEL_GIT_COMMIT_SHA", process.env.VERCEL_GIT_COMMIT_SHA],
    ];

    const selectedCommit = commitCandidates.find(([, value]) =>
      this.isLikelyCommitSha(value),
    );
    const appCommitSha = selectedCommit?.[1]?.trim() || "unknown";
    const commitSource = selectedCommit?.[0] || "none";
    const configuredAppCommitSha =
      process.env.APP_COMMIT_SHA?.trim() || undefined;
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
          commitSource,
          configuredAppCommitSha,
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
