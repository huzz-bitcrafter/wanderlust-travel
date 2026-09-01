import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  Trash2,
  Loader2,
  User,
  Phone,
  Calendar,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export const Route = createFileRoute("/admin/inbox")({
  head: () => ({
    meta: [
      { title: "Customer Inbox — Wanderlust Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminInboxPage,
});

type MessageRow = Database["public"]["Tables"]["contact_messages"]["Row"];

function AdminInboxPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedMessage, setSelectedMessage] = useState<MessageRow | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<MessageRow | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch all contact messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin", "contact_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as MessageRow[];
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contact_messages"] });
      toast.success(`Inquiry marked as ${variables.status}.`);
      if (selectedMessage) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: variables.status } : null));
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update status.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contact_messages"] });
      toast.success("Inquiry deleted.");
      setIsDeleteOpen(false);
      setDeletingMessage(null);
      setIsViewOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete message.");
    },
  });

  // Filtered messages
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const name = m.name || "";
      const email = m.email || "";
      const subject = m.subject || "";
      const body = m.message || "";

      const matchesSearch =
        searchTerm === "" ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        body.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || m.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [messages, searchTerm, statusFilter]);

  const newCount = useMemo(() => messages.filter((m) => m.status === "new").length, [messages]);

  const openMessage = (msg: MessageRow) => {
    setSelectedMessage(msg);
    setIsViewOpen(true);
    // Automatically mark as in_progress if currently 'new'
    if (msg.status === "new") {
      updateStatusMutation.mutate({ id: msg.id, status: "in_progress" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Customer Inquiries & Inbox
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage inquiries, custom trip questions, and traveler support submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {newCount > 0 && (
            <Badge
              variant="default"
              className="bg-blue-600 hover:bg-blue-600 text-white text-xs px-3 py-1"
            >
              {newCount} New Inquir{newCount === 1 ? "y" : "ies"}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs px-3 py-1 font-medium bg-card">
            {messages.length} Total Messages
          </Badge>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by sender name, email, or message subject..."
            className="pl-10 h-10 text-sm"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "new", label: "New" },
            { id: "in_progress", label: "In Progress" },
            { id: "resolved", label: "Resolved" },
            { id: "archived", label: "Archived" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === s.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading inquiries...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-16 text-center">
            <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No inquiries found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Customer contact form submissions will appear in this inbox.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredMessages.map((m) => (
              <div
                key={m.id}
                onClick={() => openMessage(m)}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-all ${
                  m.status === "new" ? "bg-primary/5 font-medium" : ""
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      m.status === "new"
                        ? "bg-blue-500/15 text-blue-600 font-bold"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground truncate">{m.name}</span>
                      <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                        &lt;{m.email}&gt;
                      </span>
                      {m.status === "new" && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <h4 className="text-xs font-semibold text-foreground truncate mt-0.5">
                      {m.subject || "General Inquiry"}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{m.message}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {format(parseISO(m.created_at), "MMM d, HH:mm")}
                  </span>

                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-semibold ${
                      m.status === "new"
                        ? "border-blue-500/30 text-blue-700 bg-blue-500/10"
                        : m.status === "resolved"
                          ? "border-emerald-500/30 text-emerald-700 bg-emerald-500/10"
                          : m.status === "in_progress"
                            ? "border-amber-500/30 text-amber-700 bg-amber-500/10"
                            : "border-border text-muted-foreground"
                    }`}
                  >
                    {m.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View & Respond Message Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-xs capitalize font-semibold">
                Status: {selectedMessage?.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {selectedMessage?.created_at &&
                  format(parseISO(selectedMessage.created_at), "MMMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            <DialogTitle className="font-display text-xl font-bold mt-1">
              {selectedMessage?.subject || "Customer Inquiry"}
            </DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-5 py-2">
              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-border p-3.5 bg-muted/20 text-xs">
                <div>
                  <span className="text-muted-foreground block">Sender Name</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedMessage.name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Email Address</span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="font-semibold text-primary hover:underline flex items-center gap-1.5 mt-0.5 truncate"
                  >
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground block">Phone Contact</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedMessage.phone || "Not provided"}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                  Inquiry Message
                </span>
                <div className="p-4 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-semibold text-foreground">
                  Update Inquiry Status:
                </span>
                <Select
                  value={selectedMessage.status}
                  onValueChange={(val) =>
                    updateStatusMutation.mutate({ id: selectedMessage.id, status: val })
                  }
                >
                  <SelectTrigger className="w-44 h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New / Unread</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-border pt-4 flex sm:justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDeletingMessage(selectedMessage);
                setIsDeleteOpen(true);
              }}
              className="text-xs text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete Message
            </Button>

            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="text-xs shadow-xs">
                <a
                  href={`mailto:${selectedMessage?.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage?.subject || "Your Wanderlust Inquiry",
                  )}`}
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Reply via Email
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsViewOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Customer Message
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message from{" "}
              <strong>{deletingMessage?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingMessage && deleteMutation.mutate(deletingMessage.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
