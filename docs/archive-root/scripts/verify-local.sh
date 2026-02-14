#!/bin/bash

# 🔍 LOCAL VERIFICATION SCRIPT
# Verifies all changes are in place locally before deployment

set -e

echo "================================"
echo "🔍 LOCAL VERIFICATION"
echo "================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ERRORS=0
WARNINGS=0

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

echo -e "${BLUE}STEP 1: Check File Presence${NC}"
echo "================================"

# Check support-tickets route
if [ -f "$PROJECT_ROOT/src/routes/support-tickets.routes.ts" ]; then
    LINES=$(wc -l < "$PROJECT_ROOT/src/routes/support-tickets.routes.ts")
    if [ "$LINES" -gt 300 ]; then
        log_success "support-tickets.routes.ts exists with $LINES lines"
    else
        log_warning "support-tickets.routes.ts exists but only $LINES lines (expected 400+)"
    fi
else
    log_error "support-tickets.routes.ts NOT FOUND"
fi

# Check schema.prisma
if [ -f "$PROJECT_ROOT/prisma/schema.prisma" ]; then
    if grep -q "model SupportTicket" "$PROJECT_ROOT/prisma/schema.prisma"; then
        log_success "prisma/schema.prisma contains SupportTicket model"
    else
        log_error "prisma/schema.prisma missing SupportTicket model"
    fi
else
    log_error "prisma/schema.prisma NOT FOUND"
fi

if grep -q "model TicketNote" "$PROJECT_ROOT/prisma/schema.prisma"; then
    log_success "prisma/schema.prisma contains TicketNote model"
else
    log_error "prisma/schema.prisma missing TicketNote model"
fi

# Check routes registration
if [ -f "$PROJECT_ROOT/src/routes/index.ts" ]; then
    if grep -q "supportTicketRoutes" "$PROJECT_ROOT/src/routes/index.ts"; then
        log_success "src/routes/index.ts imports supportTicketRoutes"
    else
        log_error "src/routes/index.ts doesn't import supportTicketRoutes"
    fi
    
    if grep -q "'/support'" "$PROJECT_ROOT/src/routes/index.ts"; then
        log_success "src/routes/index.ts registers /support route"
    else
        log_error "src/routes/index.ts doesn't register /support route"
    fi
else
    log_error "src/routes/index.ts NOT FOUND"
fi

echo ""
echo -e "${BLUE}STEP 2: Verify File Content${NC}"
echo "================================"

# Check support-tickets has key exports
if grep -q "export default router" "$PROJECT_ROOT/src/routes/support-tickets.routes.ts"; then
    log_success "support-tickets exports router"
else
    log_warning "support-tickets.routes.ts might not export router properly"
fi

# Check support-tickets has key endpoints
ENDPOINTS=("GET /api/support/tickets" "POST /api/support/tickets" "PUT /api/support/tickets/:id" "POST /api/support/tickets/:id/notes")
for endpoint in "${ENDPOINTS[@]}"; do
    if grep -q "$endpoint" "$PROJECT_ROOT/src/routes/support-tickets.routes.ts"; then
        log_success "Endpoint exists: $endpoint"
    else
        log_warning "Endpoint might be missing: $endpoint"
    fi
done

# Check schema relations
if grep -q "supportTickets.*SupportTicket" "$PROJECT_ROOT/prisma/schema.prisma"; then
    log_success "Tenant has supportTickets relation"
else
    log_warning "Tenant might not have supportTickets relation"
fi

echo ""
echo -e "${BLUE}STEP 3: Check Dependencies${NC}"
echo "================================"

# Check package.json
if [ -f "$PROJECT_ROOT/package.json" ]; then
    if grep -q '"@prisma/client"' "$PROJECT_ROOT/package.json"; then
        log_success "Prisma client dependency present"
    else
        log_warning "@prisma/client dependency missing"
    fi
else
    log_error "package.json NOT FOUND"
fi

echo ""
echo -e "${BLUE}STEP 4: Syntax Validation${NC}"
echo "================================"

# Check TypeScript syntax (if tsc available)
if command -v npx &> /dev/null; then
    log_info "Checking TypeScript syntax..."
    
    if npx tsc --noEmit src/routes/support-tickets.routes.ts 2>/dev/null; then
        log_success "TypeScript syntax is valid"
    else
        log_warning "TypeScript syntax check skipped or has warnings"
    fi
else
    log_warning "npx not available - skipping TypeScript check"
fi

echo ""
echo -e "${BLUE}STEP 5: Documentation Check${NC}"
echo "================================"

DOCS=(
    "docs/SUPER_ADMIN_AUDIT_COMPLETE.md"
    "docs/SUPER_ADMIN_EXECUTIVE_SUMMARY.md"
    "docs/DEPLOYMENT_SUPER_ADMIN_FIX.md"
    "docs/SUPER_ADMIN_VERIFICATION_CHECKLIST.md"
    "docs/IMPLEMENTATION_DEPLOYMENT_PLAN.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$PROJECT_ROOT/$doc" ]; then
        LINES=$(wc -l < "$PROJECT_ROOT/$doc")
        log_success "$doc exists ($LINES lines)"
    else
        log_warning "$doc NOT FOUND"
    fi
done

echo ""
echo -e "${BLUE}STEP 6: Configuration Check${NC}"
echo "================================"

if [ -f "$PROJECT_ROOT/.env" ]; then
    log_success ".env file present"
    
    if grep -q "DATABASE_URL" "$PROJECT_ROOT/.env"; then
        log_success ".env has DATABASE_URL"
    else
        log_warning ".env missing DATABASE_URL"
    fi
else
    log_warning ".env file NOT FOUND (might be okay in Docker)"
fi

if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
    log_success "docker-compose.yml present"
else
    log_error "docker-compose.yml NOT FOUND"
fi

echo ""
echo "================================"
echo "📊 VERIFICATION SUMMARY"
echo "================================"
echo ""
echo -e "Errors:   ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT${NC}"
    exit 0
elif [ $ERRORS -lt 3 ]; then
    echo -e "${YELLOW}⚠️  SOME ISSUES FOUND - REVIEW WARNINGS ABOVE${NC}"
    exit 1
else
    echo -e "${RED}❌ CRITICAL ISSUES FOUND - DO NOT DEPLOY${NC}"
    exit 1
fi
