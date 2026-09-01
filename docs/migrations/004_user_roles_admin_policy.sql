-- Migration 004: User Roles Admin Management Policies
-- Allows administrators (public.is_admin() = true) to grant or revoke roles in public.user_roles

GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- Allow admins to insert new roles for users
DROP POLICY IF EXISTS "user_roles admin insert" ON public.user_roles;
CREATE POLICY "user_roles admin insert"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Allow admins to update roles
DROP POLICY IF EXISTS "user_roles admin update" ON public.user_roles;
CREATE POLICY "user_roles admin update"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Allow admins to revoke/delete roles
DROP POLICY IF EXISTS "user_roles admin delete" ON public.user_roles;
CREATE POLICY "user_roles admin delete"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_admin());
