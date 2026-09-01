import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plus,
  MapPin,
  CalendarDays,
  ListChecks,
  Loader2,
  AlertCircle,
  Compass,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/account/itineraries")({
  component: ItinerariesPage,
});

const createSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(100, "Title too long"),
    destination_id: z.string().min(1, "Please select a destination"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    { message: "End date must be after start date", path: ["end_date"] },
  );

type CreateFormValues = z.infer<typeof createSchema>;

type ItineraryRow = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  destination_id: string | null;
  created_at: string;
  destination_name?: string;
  item_count?: number;
};

type DestinationOption = {
  id: string;
  name: string;
  country: string;
};

function ItinerariesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch destinations for dropdown
  const destinationsQuery = useQuery({
    queryKey: ["destinations", "all-names"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("id, name, country")
        .order("name");
      if (error) throw error;
      return (data ?? []) as DestinationOption[];
    },
  });

  // Fetch user itineraries with item count
  const itinerariesQuery = useQuery({
    queryKey: ["itineraries", "own"],
    queryFn: async () => {
      const { data: itineraries, error } = await supabase
        .from("itineraries")
        .select("id, title, start_date, end_date, destination_id, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!itineraries || itineraries.length === 0) return [];

      // Fetch destination names
      const destIds = [
        ...new Set(itineraries.map((i) => i.destination_id).filter(Boolean)),
      ] as string[];

      let destMap = new Map<string, string>();
      if (destIds.length > 0) {
        const { data: dests } = await supabase
          .from("destinations")
          .select("id, name")
          .in("id", destIds);
        if (dests) {
          destMap = new Map(dests.map((d) => [d.id, d.name]));
        }
      }

      // Fetch item counts
      const itineraryIds = itineraries.map((i) => i.id);
      const { data: items } = await supabase
        .from("itinerary_items")
        .select("itinerary_id")
        .in("itinerary_id", itineraryIds);

      const countMap = new Map<string, number>();
      if (items) {
        for (const item of items) {
          countMap.set(item.itinerary_id, (countMap.get(item.itinerary_id) ?? 0) + 1);
        }
      }

      return itineraries.map((it) => ({
        ...it,
        destination_name: it.destination_id ? destMap.get(it.destination_id) : undefined,
        item_count: countMap.get(it.id) ?? 0,
      })) as ItineraryRow[];
    },
    enabled: !!user,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: CreateFormValues) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("itineraries")
        .insert({
          title: values.title,
          destination_id: values.destination_id,
          start_date: values.start_date,
          end_date: values.end_date,
          user_id: user.id,
        })
        .select("id")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Itinerary created!");
      queryClient.invalidateQueries({ queryKey: ["itineraries", "own"] });
      setDialogOpen(false);
      navigate({ to: "/account/itineraries/$id", params: { id: data.id } });
    },
    onError: (err) => {
      console.error("Create itinerary error:", err);
      toast.error("Failed to create itinerary. Please try again.");
    },
  });

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: "",
      destination_id: "",
      start_date: "",
      end_date: "",
    },
  });

  const onSubmit = (values: CreateFormValues) => {
    createMutation.mutate(values);
  };

  // Loading state
  if (itinerariesQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (itinerariesQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">Failed to load itineraries.</p>
        <Button
          variant="outline"
          onClick={() => itinerariesQuery.refetch()}
          className="rounded-full"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const itineraries = itinerariesQuery.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground">My Itineraries</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Create Itinerary
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Itinerary</DialogTitle>
              <DialogDescription>Plan your next adventure day by day.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-title">Title</Label>
                <Input
                  id="create-title"
                  placeholder="e.g. Japan Spring Adventure"
                  {...form.register("title")}
                />
                {form.formState.errors.title ? (
                  <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-destination">Destination</Label>
                <Select
                  value={form.watch("destination_id")}
                  onValueChange={(val) =>
                    form.setValue("destination_id", val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="create-destination">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {(destinationsQuery.data ?? []).map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}, {d.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.destination_id ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.destination_id.message}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="create-start">Start Date</Label>
                  <Input id="create-start" type="date" {...form.register("start_date")} />
                  {form.formState.errors.start_date ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.start_date.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-end">End Date</Label>
                  <Input id="create-end" type="date" {...form.register("end_date")} />
                  {form.formState.errors.end_date ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.end_date.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Itinerary
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {itineraries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <Compass className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-foreground">No itineraries yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Start planning your next trip by creating an itinerary. You can add activities for each
            day of your journey.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {itineraries.map((it) => (
            <Card
              key={it.id}
              className="card-lift cursor-pointer rounded-xl border border-border"
              onClick={() => navigate({ to: "/account/itineraries/$id", params: { id: it.id } })}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate({ to: "/account/itineraries/$id", params: { id: it.id } });
                }
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg leading-tight">{it.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {it.destination_name ? (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {it.destination_name}
                  </div>
                ) : null}
                {it.start_date && it.end_date ? (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {format(new Date(it.start_date), "MMM d, yyyy")} —{" "}
                    {format(new Date(it.end_date), "MMM d, yyyy")}
                  </div>
                ) : null}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                  {it.item_count} {it.item_count === 1 ? "activity" : "activities"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
