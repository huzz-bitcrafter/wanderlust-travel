import React, { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Camera,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const title = "Profile & Settings — Wanderlust";
const description = "Update your profile information, avatar photo, and account security.";

export const Route = createFileRoute("/account/profile")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AccountProfilePage,
});

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z.string().trim().optional(),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function AccountProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Query Profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    },
    enabled: !!user,
  });

  // Populate form with existing data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || user?.user_metadata?.full_name || "");
      setPhone(profile.phone || user?.user_metadata?.phone || "");
      setAvatarPreview(profile.avatar_url || user?.user_metadata?.avatar_url || null);
    } else if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setPhone(user.user_metadata?.phone || "");
      setAvatarPreview(user.user_metadata?.avatar_url || null);
    }
  }, [profile, user]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async ({ name, phoneNum }: { name: string; phoneNum: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: name,
          phone: phoneNum || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Update auth metadata
      await supabase.auth.updateUser({
        data: {
          full_name: name,
          phone: phoneNum,
        },
      });

      return { name, phoneNum };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", user?.id] });
      toast.success("Profile details updated successfully!");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(message);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = profileSchema.safeParse({ fullName, phone });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path.join(".")] = issue.message;
      });
      setProfileErrors(errors);
      return;
    }

    setProfileErrors({});
    updateProfileMutation.mutate({ name: fullName, phoneNum: phone });
  };

  // Avatar Upload Handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be under 5MB.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage avatars bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // If storage bucket is missing policy, fallback to blob preview + alert user
        console.warn("Storage upload error:", uploadError.message);
        const localUrl = URL.createObjectURL(file);
        setAvatarPreview(localUrl);
        toast.info("Avatar preview updated (ensure avatars bucket storage policy is configured).");
        return;
      }

      // Get public URL
      const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const publicUrl = publicData?.publicUrl;

      if (publicUrl) {
        setAvatarPreview(publicUrl);
        // Save to profiles table
        await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);

        await supabase.auth.updateUser({
          data: { avatar_url: publicUrl },
        });

        queryClient.invalidateQueries({ queryKey: ["user-profile", user.id] });
        toast.success("Avatar photo updated!");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload avatar";
      toast.error(message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Password Change Handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = passwordSchema.safeParse({ newPassword, confirmPassword });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path.join(".")] = issue.message;
      });
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update password";
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const userInitials = (fullName || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Profile & Settings
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information, profile photo, and password security.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Personal Information & Avatar (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Avatar & Personal Details Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <User className="h-5 w-5 text-secondary" />
              <h3 className="font-display text-lg font-bold text-foreground">
                Personal Information
              </h3>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Avatar Uploader */}
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <Avatar className="h-20 w-20 border-2 border-border/80 shadow-sm">
                      <AvatarImage src={avatarPreview || undefined} alt={fullName} />
                      <AvatarFallback className="bg-secondary/15 text-secondary font-display font-bold text-xl">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>

                    <button
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all focus:outline-none"
                      aria-label="Upload avatar"
                      title="Upload new avatar"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-foreground">Profile Picture</h4>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, or WebP up to 5MB. Click camera to change.
                    </p>
                    {isUploadingAvatar && (
                      <span className="text-xs text-secondary flex items-center gap-1">
                        <Clock className="h-3 w-3 animate-spin" /> Uploading photo...
                      </span>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profileEmail" className="text-xs font-semibold">
                      Email Address (Read-only)
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="profileEmail"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted/50 text-muted-foreground pl-9 cursor-not-allowed"
                      />
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="profileFullName" className="text-xs font-semibold">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="profileFullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="pl-9"
                      />
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    {profileErrors.fullName && (
                      <p className="mt-1 text-xs text-destructive">{profileErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="profilePhone" className="text-xs font-semibold">
                      Phone Number (Optional)
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="profilePhone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="pl-9"
                      />
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    {profileErrors.phone && (
                      <p className="mt-1 text-xs text-destructive">{profileErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Password & Account Security (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border/60 pb-4">
              <Lock className="h-5 w-5 text-secondary" />
              <h3 className="font-display text-lg font-bold text-foreground">
                Security & Password
              </h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="newPassword" className="text-xs font-semibold">
                  New Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="mt-1"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-xs text-destructive">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                  Confirm New Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="mt-1"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-destructive">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
                >
                  {isChangingPassword ? "Updating Password..." : "Update Password"}
                </Button>
              </div>
            </form>

            <div className="rounded-xl bg-muted/40 p-4 border border-border/50 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Account Protection</span>
              </div>
              <p>
                We recommend choosing a strong, unique password with letters, numbers, and symbols.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
