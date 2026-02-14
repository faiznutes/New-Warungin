import prisma from '../config/database';
import { SUBSCRIPTION_PLANS } from '../constants/enums';

type LimitType = 'users' | 'products' | 'outlets';

interface PlanLimit {
    users: number;
    products: number;
    outlets: number;
}

// Default limits if not defined elsewhere
// Basic: Small shop (1 outlet, few staff, limited products)
// Pro: Growing business (3 outlets, more staff, more products)
// Enterprise: Unlimited
const PLAN_LIMITS: Record<string, PlanLimit> = {
    [SUBSCRIPTION_PLANS.BASIC]: { users: 2, products: 100, outlets: 1 },
    [SUBSCRIPTION_PLANS.PRO]: { users: 10, products: 1000, outlets: 3 },
    [SUBSCRIPTION_PLANS.ENTERPRISE]: { users: -1, products: -1, outlets: -1 }, // -1 means unlimited
};

class PlanFeaturesService {
    /**
     * Check if a tenant has reached their plan limit for a specific feature
     */
    async checkPlanLimit(tenantId: string, limitType: LimitType) {
        // 1. Get Tenant Plan
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { subscriptionPlan: true }
        });

        if (!tenant) throw new Error('Tenant not found');

        const plan = (tenant.subscriptionPlan as string) || SUBSCRIPTION_PLANS.BASIC;
        const planLimitConfig = PLAN_LIMITS[plan] ?? PLAN_LIMITS[SUBSCRIPTION_PLANS.BASIC];
        const baseLimit = planLimitConfig[limitType];

        // 2. Get Active Addons that increase limits
        const now = new Date();
        const activeAddons = await prisma.tenantAddon.findMany({
            where: {
                tenantId,
                // Status check (handle casing if inconsistent in DB, though enum suggests uppercase)
                OR: [
                    { status: 'ACTIVE' },
                    { status: 'active' }
                ],
                // Expiry check
                AND: [
                    {
                        OR: [
                            { expiresAt: null },
                            { expiresAt: { gt: now } }
                        ]
                    }
                ]
            }
        });

        // 3. Calculate Addon Boost
        let addonLimit = 0;
        for (const addon of activeAddons) {
            if (limitType === 'users' && addon.addonType === 'ADD_USERS') {
                addonLimit += (addon.limit || 0);
            }
            if (limitType === 'products' && addon.addonType === 'ADD_PRODUCTS') {
                addonLimit += (addon.limit || 0);
            }
            if (limitType === 'outlets' && addon.addonType === 'ADD_OUTLETS') {
                addonLimit += (addon.limit || 0);
            }
        }

        // 4. Calculate Total Limit
        // If base limit is -1 (unlimited), total is -1
        const totalLimit = baseLimit === -1 ? -1 : (baseLimit + addonLimit);

        // 5. Get Current Usage
        let currentUsage = 0;
        if (limitType === 'users') {
            currentUsage = await prisma.user.count({
                where: {
                    tenantId,
                    isActive: true
                }
            });
        } else if (limitType === 'products') {
            currentUsage = await prisma.product.count({
                where: {
                    tenantId,
                    isActive: true
                }
            });
        } else if (limitType === 'outlets') {
            currentUsage = await prisma.outlet.count({
                where: {
                    tenantId,
                    isActive: true
                }
            });
        }

        // 6. Return Result
        const allowed = totalLimit === -1 || currentUsage < totalLimit;

        return {
            allowed,
            limit: totalLimit,
            currentUsage,
            message: allowed
                ? 'Allowed'
                : `Limit reached (${currentUsage}/${totalLimit}). Upgrade plan or buy addon.`
        };
    }
}

export default new PlanFeaturesService();
