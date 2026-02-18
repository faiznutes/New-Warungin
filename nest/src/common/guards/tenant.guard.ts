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
      const tenantId = request.headers["x-tenant-id"] || user.tenantId;
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
