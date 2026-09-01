import React, { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User & Role Management — Wanderlust Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminUsersPage,
});

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type UserRoleRow = Database["public"]["Tables"]["user_roles"]["Row"];

interface UserWithRole extends ProfileRow {
  isAdmin: boolean;
}

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentAdminUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Role Edit Dialog State
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<"admin" | "user">("user");

  // 1. Fetch all profiles
  const profilesQuery = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ProfileRow[];
    },
  });

  // 2. Fetch all user roles
  const rolesQuery = useQuery({
    queryKey: ["admin", "user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return (data || []) as UserRoleRow[];
    },
  });

  const isLoading = profilesQuery.isLoading || rolesQuery.isLoading;
  const isError = profilesQuery.isError || rolesQuery.isError;
  const error = profilesQuery.error || rolesQuery.error;

  // Combine profiles with their roles
  const usersWithRoles = useMemo<UserWithRole[]>(() => {
    const profiles = profilesQuery.data || [];
    const roles = rolesQuery.data || [];

    const adminUserIds = new Set(roles.filter((r) => r.role === "admin").map((r) => r.user_id));

    return profiles.map((p) => ({
      ...p,
      isAdmin: adminUserIds.has(p.id),
    }));
  }, [profilesQuery.data, rolesQuery.data]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return usersWithRoles.filter((u) => {
      const name = u.full_name || "";
      const email = u.email || "";
      const phone = u.phone || "";

      const matchesSearch =
        searchTerm === "" ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && u.isAdmin) ||
        (roleFilter === "user" && !u.isAdmin);

      return matchesSearch && matchesRole;
    });
  }, [usersWithRoles, searchTerm, roleFilter]);

  // Mutation to toggle role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: "admin" | "user" }) => {
      if (newRole === "admin") {
        const { error } = await supabase.from("user_roles").insert({
          user_id: userId,
          role: "admin",
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user_roles"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "profiles"] });
      toast.success(
        variables.newRole === "admin"
          ? "User promoted to Administrator successfully."
          : "Administrator privileges revoked successfully.",
      );
      setIsRoleModalOpen(false);
      setSelectedUser(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update user role. Check database policies.");
    },
  });

  const openRoleEditor = (user: UserWithRole) => {
    setSelectedUser(user);
    setTargetRole(user.isAdmin ? "user" : "admin");
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Safety check: prevent self demotion
    if (selectedUser.id === currentAdminUser?.id && targetRole === "user") {
      toast.error("You cannot revoke your own administrator privileges.");
      return;
    }

    updateRoleMutation.mutate({
      userId: selectedUser.id,
      newRole: targetRole,
    });
  };

  const isSelf = selectedUser?.id === currentAdminUser?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Users & Role Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage registered traveler accounts and assign administrative permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1 font-medium bg-card">
            {usersWithRoles.length} Total Users
          </Badge>
          <Badge variant="secondary" className="text-xs px-3 py-1 font-medium">
            {usersWithRoles.filter((u) => u.isAdmin).length} Administrators
          </Badge>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by full name, email, or phone..."
            className="pl-10 h-10 text-sm"
          />
        </div>

        {/* Role filter buttons */}
        <div className="flex items-center gap-1.5">
          {[
            { id: "all", label: "All Users" },
            { id: "admin", label: "Admins Only" },
            { id: "user", label: "Travelers Only" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                roleFilter === r.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading platform users...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-foreground">Failed to load users</h3>
            <p className="text-xs text-muted-foreground mt-1">{(error as Error)?.message}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No users found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchTerm || roleFilter !== "all"
                ? "Try clearing your search query or filter."
                : "Registered travelers will appear here once they create an account."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Email Address</th>
                  <th className="px-6 py-3.5">Phone Number</th>
                  <th className="px-6 py-3.5">Registered</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => {
                  const isCurrentAdmin = u.id === currentAdminUser?.id;

                  return (
                    <tr key={u.id} className="hover:bg-muted/25 transition-colors">
                      {/* User Avatar & Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage
                              src={u.avatar_url || undefined}
                              alt={u.full_name || "User"}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold font-display">
                              {u.full_name?.charAt(0) || u.email?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{u.full_name || "Traveler"}</span>
                              {isCurrentAdmin && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-primary/10 text-primary font-medium">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-muted-foreground truncate block max-w-[150px]">
                              {u.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                        {u.email || "N/A"}
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-xs text-muted-foreground">{u.phone || "—"}</td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{format(parseISO(u.created_at), "MMM d, yyyy")}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            Traveler (User)
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRoleEditor(u)}
                          className="h-8 px-3 text-xs font-medium"
                        >
                          <Shield className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          Change Role
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Manage User Permissions
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify administrative access for{" "}
              <strong className="text-foreground">
                {selectedUser?.full_name || selectedUser?.email}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <form onSubmit={handleSaveRole} className="space-y-4 py-2">
              {/* User Snapshot Card */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold font-display">
                    {selectedUser.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {selectedUser.full_name || "Traveler"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{selectedUser.email}</p>
                </div>
                <Badge
                  variant={selectedUser.isAdmin ? "default" : "outline"}
                  className="text-[10px]"
                >
                  {selectedUser.isAdmin ? "Admin" : "User"}
                </Badge>
              </div>

              {/* Warning if self-demotion */}
              {isSelf && targetRole === "user" ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    You cannot demote yourself. Another administrator must change your role to
                    prevent accidental lockout.
                  </span>
                </div>
              ) : null}

              {/* Role Selection Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Select Permission Level:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setTargetRole("user")}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      targetRole === "user"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">Standard User</span>
                      {targetRole === "user" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Can book trips, write reviews, and build custom itineraries.
                    </p>
                  </div>

                  <div
                    onClick={() => setTargetRole("admin")}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      targetRole === "admin"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">Administrator</span>
                      {targetRole === "admin" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Full access to booking management, catalog editing, and role assignment.
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRoleModalOpen(false)}
                  disabled={updateRoleMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateRoleMutation.isPending || (isSelf && targetRole === "user")}
                >
                  {updateRoleMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {targetRole === "admin" ? "Grant Admin Privileges" : "Revoke Admin Privileges"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
