# 🔐 RBAC System Setup Guide

## Prerequisites
- Supabase project created
- Environment variables configured in `.env.local`

## Step 1: Run Database Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/001_rbac_system.sql`
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click **RUN**

This will create:
- ✅ 12 database tables
- ✅ Row Level Security policies
- ✅ 5 default roles (CEO, Manager, Senior Officer, Junior Officer, Intern)
- ✅ Indexes for performance
- ✅ Triggers for automatic updates

## Step 2: Add Service Role Key

You need the Supabase Service Role key to create the CEO user.

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy the **service_role** key (keep it secret!)
3. Add to `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 3: Create CEO User

Run the setup script:

```bash
node scripts/setup-ceo.js
```

This will create the CEO user with:
- **Username:** sakib3046
- **Password:** 12344321

**Note:** Login uses username (not email)

## Step 4: Test Login

1. Start the dev server:
```bash
npm run dev
```

2. Navigate to: http://localhost:3000/login

3. Login with:
   - Username: `sakib3046`
   - Password: `12344321`

4. You should be redirected to `/dashboard`

## Step 5: Change Default Password

⚠️ **IMPORTANT**: Change the default password immediately after first login!

## Database Schema Overview

### Tables Created:

1. **roles** - 5 role levels (CEO=1, Manager=2, etc.)
2. **users** - User profiles with roles
3. **teams** - Work teams (Design, Development, etc.)
4. **team_members** - Team membership with captain
5. **projects** - Projects assigned to teams
6. **tasks** - Individual tasks
7. **task_assignments** - Who's assigned to tasks
8. **task_comments** - Discussions on tasks
9. **task_attachments** - File attachments
10. **time_entries** - Time tracking
11. **permissions** - Custom view permissions
12. **activity_logs** - Audit trail

### Security Features:

✅ **Row Level Security (RLS)** - Every table protected
✅ **Role-based access** - Different permissions per role  
✅ **Cascade deletes** - Clean data integrity
✅ **Activity logging** - Track all changes
✅ **Password encryption** - Supabase Auth handles this

## Permission System

### Default Access:

**CEO (Level 1):**
- ✅ Full access to everything
- ✅ Create/delete users
- ✅ Manage all permissions
- ✅ View all tasks/projects
- ✅ Create/manage teams

**Manager (Level 2):**
- ✅ Create users (not delete)
- ✅ Manage permissions
- ✅ View all tasks/projects
- ✅ Create/manage teams
- ✅ Deactivate users
- ✅ Reset passwords

**Senior Officer (Level 3):**
- ✅ View assigned tasks
- ✅ View tasks with granted permission
- ⚠️ Cannot create users
- ⚠️ Cannot manage permissions

**Junior Officer (Level 4):**
- ✅ View assigned tasks
- ✅ View tasks with granted permission
- ⚠️ Cannot create users
- ⚠️ Cannot manage permissions

**Intern (Level 5):**
- ✅ View assigned tasks only
- ⚠️ Very limited access
- ⚠️ Cannot create users
- ⚠️ Cannot manage permissions

### Custom Permissions:

CEO and Manager can grant additional permissions:

1. **view_team_tasks** - See all tasks in a specific team
2. **view_user_tasks** - See specific user's tasks
3. **view_all_tasks** - See everything

## Next Steps

Now that the RBAC system is set up, you can:

1. ✅ Login as CEO
2. ✅ Access dashboard at `/dashboard`
3. 🔄 Create more users (Manager, Officers, Interns)
4. 🔄 Create teams
5. 🔄 Assign team captains
6. 🔄 Create projects
7. 🔄 Create and assign tasks
8. 🔄 Grant custom permissions

## Troubleshooting

### Migration Failed
- Check Supabase connection
- Verify SQL syntax
- Check for existing tables (drop if needed)

### CEO User Creation Failed
- Verify Service Role Key
- Check if email already exists
- Check Supabase logs

### Login Not Working
- Verify email/password
- Check if user is active
- Check browser console for errors

### Dashboard Not Loading
- Check middleware.ts is working
- Verify session exists
- Check RLS policies

## Security Notes

🔐 **Never commit:**
- Service Role Key
- User passwords
- Session tokens

🔐 **Always:**
- Use environment variables
- Change default passwords
- Enable 2FA (when available)
- Monitor activity logs

## Support

If you encounter issues:
1. Check Supabase logs
2. Check browser console
3. Verify environment variables
4. Review migration output

---

**System Status:** ✅ Ready for Production
**Last Updated:** January 18, 2026
