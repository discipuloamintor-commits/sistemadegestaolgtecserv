

## Plan: Make lgtecserv@gmail.com an Admin

The user `lgtecserv@gmail.com` (ID: `8928a2d4-da57-45c7-b9dc-3019d5fedc18`) exists but has no profile or role records.

### Steps

1. **Insert profile record** for this user with `status_aprovacao = 'aprovado'`
2. **Insert user_roles record** with `role = 'admin'`

Both are data insertions (not schema changes), so we'll use the insert tool.

### Technical Details

```sql
-- 1. Create profile
INSERT INTO profiles (id, nome_completo, status_aprovacao)
VALUES ('8928a2d4-da57-45c7-b9dc-3019d5fedc18', 'LG TecServ', 'aprovado');

-- 2. Assign admin role
INSERT INTO user_roles (user_id, role)
VALUES ('8928a2d4-da57-45c7-b9dc-3019d5fedc18', 'admin');
```

This will give the user full admin access to the system, including the admin dashboard and user management pages.

