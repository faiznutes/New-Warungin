import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

export const TENANT_REQUIRED_KEY = "tenantRequired";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private normalizeTenantId(value: unknown): string | null {
    if (Array.isArray(value)) {
      return typeof value[0] === "string" ? value[0] : null;
    }
    return typeof value === "string" && value.trim().length > 0
      ? value
      : null;
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const tenantRequired = this.reflector.getAllAndOverride<boolean>(
      TENANT_REQUIRED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (tenantRequired === false) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | { role?: string; tenantId?: string }
      | undefined;

    if (!user) return true;

    if (user.role === "SUPER_ADMIN") {
      const tenantFromHeader = this.normalizeTenantId(
        request.headers["x-tenant-id"],
      );
      const tenantFromQuery = this.normalizeTenantId(request.query?.tenantId);
      const tenantFromUser = this.normalizeTenantId(user.tenantId);
      const tenantId = tenantFromHeader || tenantFromQuery || tenantFromUser;
      (request as any).tenantId = tenantId || user.tenantId || null;
      return true;
    }

    const tenantId = user.tenantId;
    if (!tenantId) {
      throw new ForbiddenException("Tenant ID not found");
    }
    (request as any).tenantId = tenantId;
    return true;
  }
}
