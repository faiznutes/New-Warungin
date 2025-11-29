# Check and Fix addedBySuperAdmin Fields

## Step 1: Check if fields exist

```bash
# Check field in tenant_addons table
docker compose exec postgres psql -U postgres -d warungin -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'tenant_addons' AND column_name = 'addedBySuperAdmin';"

# Check field in subscriptions table
docker compose exec postgres psql -U postgres -d warungin -c "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'addedBySuperAdmin';"
```

## Step 2: Add fields if they don't exist

```bash
# Add field to tenant_addons (if not exists)
docker compose exec postgres psql -U postgres -d warungin -c "ALTER TABLE \"tenant_addons\" ADD COLUMN IF NOT EXISTS \"addedBySuperAdmin\" BOOLEAN NOT NULL DEFAULT false;"

# Add field to subscriptions (if not exists)
docker compose exec postgres psql -U postgres -d warungin -c "ALTER TABLE \"subscriptions\" ADD COLUMN IF NOT EXISTS \"addedBySuperAdmin\" BOOLEAN NOT NULL DEFAULT false;"
```

## Step 3: Verify fields exist

```bash
# Verify tenant_addons
docker compose exec postgres psql -U postgres -d warungin -c "\d tenant_addons" | grep addedBySuperAdmin

# Verify subscriptions
docker compose exec postgres psql -U postgres -d warungin -c "\d subscriptions" | grep addedBySuperAdmin
```

## Step 4: Restart backend

```bash
docker compose restart backend
```

## Step 5: Check logs

```bash
docker compose logs -f backend
```

