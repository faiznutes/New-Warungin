import { createParamDecorator, ExecutionContext } from "@nestjs/common";

const isDebug = process.env.DEBUG === "true";

export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const headerTenant = request.headers["x-tenant-id"];
    const queryTenant = request.query?.tenantId;
    const normalizedHeader = Array.isArray(headerTenant)
      ? headerTenant[0]
      : headerTenant;
    const normalizedQuery = Array.isArray(queryTenant)
      ? queryTenant[0]
      : queryTenant;
    const tenantId =
      request.tenantId ?? normalizedHeader ?? normalizedQuery ?? null;
    if (isDebug) {
      console.log(
        "TenantId decorator: request.tenantId:",
        request.tenantId,
        "header:",
        request.headers["x-tenant-id"],
        "result:",
        tenantId,
      );
    }
    return tenantId;
  },
);
