import { useState, useCallback, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  Printer,
  ArrowLeft,
  Clock,
  Save,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/itineraries/$id")({
  component: ItineraryEditorPage,
});

type ItineraryItem = {
  id: string;
  itinerary_id: string;
  day_number: number;
  order_index: number;
  time: string | null;
  title: string;
  description: string | null;
  created_at: string;
};

type Itinerary = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  destination_id: string | null;
  notes: string | null;
  user_id: string;
};

const itemSchema = z.object({
  time: z.string().optional(),
  title: z.string().trim().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

function ItineraryEditorPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeDay, setActiveDay] = useState(1);
  const [editItem, setEditItem] = useState<ItineraryItem | null>(null);
  const [addingForDay, setAddingForDay] = useState<number | null>(null);
  const [printView, setPrintView] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch itinerary
  const itineraryQuery = useQuery({
    queryKey: ["itinerary", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itineraries")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("NOT_FOUND");
      return data as Itinerary;
    },
    enabled: !!user,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "NOT_FOUND") return false;
      return failureCount < 2;
    },
  });

  // Fetch itinerary items
  const itemsQuery = useQuery({
    queryKey: ["itinerary-items", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itinerary_items")
        .select("*")
        .eq("itinerary_id", id)
        .order("day_number")
        .order("order_index");

      if (error) throw error;
      return (data ?? []) as ItineraryItem[];
    },
    enabled: !!user && itineraryQuery.isSuccess,
  });

  // Fetch destination name
  const destinationQuery = useQuery({
    queryKey: ["destination-name", itineraryQuery.data?.destination_id],
    queryFn: async () => {
      const destId = itineraryQuery.data?.destination_id;
      if (!destId) return null;
      const { data } = await supabase
        .from("destinations")
        .select("name")
        .eq("id", destId)
        .maybeSingle();
      return data?.name ?? null;
    },
    enabled: !!itineraryQuery.data?.destination_id,
  });

  // Compute days from date range
  const days = (() => {
    const it = itineraryQuery.data;
    if (!it?.start_date || !it?.end_date) return [];
    try {
      return eachDayOfInterval({
        start: parseISO(it.start_date),
        end: parseISO(it.end_date),
      });
    } catch {
      return [];
    }
  })();

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (values: ItemFormValues & { day_number: number }) => {
      const existingItems = (itemsQuery.data ?? []).filter(
        (i) => i.day_number === values.day_number,
      );
      const maxOrder = existingItems.reduce((max, i) => Math.max(max, i.order_index), -1);

      const { error } = await supabase.from("itinerary_items").insert({
        itinerary_id: id,
        day_number: values.day_number,
        order_index: maxOrder + 1,
        time: values.time || null,
        title: values.title,
        description: values.description || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Activity added");
      queryClient.invalidateQueries({ queryKey: ["itinerary-items", id] });
      setAddingForDay(null);
    },
    onError: (err) => {
      console.error("Add item error:", err);
      toast.error("Failed to add activity");
    },
  });

  // Edit item mutation
  const editItemMutation = useMutation({
    mutationFn: async (values: ItemFormValues & { itemId: string }) => {
      const { error } = await supabase
        .from("itinerary_items")
        .update({
          time: values.time || null,
          title: values.title,
          description: values.description || null,
        })
        .eq("id", values.itemId);

      if (error) throw error;
    },
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ["itinerary-items", id] });
      const previous = queryClient.getQueryData<ItineraryItem[]>(["itinerary-items", id]);
      queryClient.setQueryData<ItineraryItem[]>(["itinerary-items", id], (old) =>
        (old ?? []).map((item) =>
          item.id === values.itemId
            ? {
                ...item,
                time: values.time || null,
                title: values.title,
                description: values.description || null,
              }
            : item,
        ),
      );
      return { previous };
    },
    onError: (err, _values, context) => {
      console.error("Edit item error:", err);
      toast.error("Failed to update activity");
      if (context?.previous) {
        queryClient.setQueryData(["itinerary-items", id], context.previous);
      }
    },
    onSuccess: () => {
      toast.success("Activity updated");
      setEditItem(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary-items", id] });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from("itinerary_items").delete().eq("id", itemId);
      if (error) throw error;
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["itinerary-items", id] });
      const previous = queryClient.getQueryData<ItineraryItem[]>(["itinerary-items", id]);
      queryClient.setQueryData<ItineraryItem[]>(["itinerary-items", id], (old) =>
        (old ?? []).filter((item) => item.id !== itemId),
      );
      return { previous };
    },
    onError: (err, _itemId, context) => {
      console.error("Delete item error:", err);
      toast.error("Failed to delete activity");
      if (context?.previous) {
        queryClient.setQueryData(["itinerary-items", id], context.previous);
      }
    },
    onSuccess: () => {
      toast.success("Activity removed");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary-items", id] });
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async ({ itemId, direction }: { itemId: string; direction: "up" | "down" }) => {
      const items = itemsQuery.data ?? [];
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const dayItems = items
        .filter((i) => i.day_number === item.day_number)
        .sort((a, b) => a.order_index - b.order_index);

      const idx = dayItems.findIndex((i) => i.id === itemId);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= dayItems.length) return;

      const swapItem = dayItems[swapIdx];

      // Swap order_index values
      await Promise.all([
        supabase
          .from("itinerary_items")
          .update({ order_index: swapItem.order_index })
          .eq("id", item.id),
        supabase
          .from("itinerary_items")
          .update({ order_index: item.order_index })
          .eq("id", swapItem.id),
      ]);
    },
    onMutate: async ({ itemId, direction }) => {
      await queryClient.cancelQueries({ queryKey: ["itinerary-items", id] });
      const previous = queryClient.getQueryData<ItineraryItem[]>(["itinerary-items", id]);

      queryClient.setQueryData<ItineraryItem[]>(["itinerary-items", id], (old) => {
        if (!old) return old;
        const items = [...old];
        const item = items.find((i) => i.id === itemId);
        if (!item) return items;

        const dayItems = items
          .filter((i) => i.day_number === item.day_number)
          .sort((a, b) => a.order_index - b.order_index);

        const idx = dayItems.findIndex((i) => i.id === itemId);
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= dayItems.length) return items;

        const swapItem = dayItems[swapIdx];
        const tempOrder = item.order_index;
        item.order_index = swapItem.order_index;
        swapItem.order_index = tempOrder;
        return items;
      });

      return { previous };
    },
    onError: (err, _vars, context) => {
      console.error("Reorder error:", err);
      if (context?.previous) {
        queryClient.setQueryData(["itinerary-items", id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary-items", id] });
    },
  });

  const handlePrint = useCallback(() => {
    setPrintView(true);
    setTimeout(() => {
      window.print();
      setPrintView(false);
    }, 100);
  }, []);

  // 404 state (RLS blocks foreign itineraries)
  if (
    itineraryQuery.isError &&
    itineraryQuery.error instanceof Error &&
    itineraryQuery.error.message === "NOT_FOUND"
  ) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-xl font-semibold">Itinerary Not Found</h2>
        <p className="text-sm text-muted-foreground">
          This itinerary doesn't exist or you don't have access.
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/account/itineraries">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Itineraries
          </Link>
        </Button>
      </div>
    );
  }

  // Loading state
  if (itineraryQuery.isLoading || itemsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // Error state
  if (itineraryQuery.isError || itemsQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">Failed to load itinerary.</p>
        <Button
          variant="outline"
          onClick={() => {
            itineraryQuery.refetch();
            itemsQuery.refetch();
          }}
          className="rounded-full"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const itinerary = itineraryQuery.data;
  if (!itinerary) return null;

  const allItems = itemsQuery.data ?? [];

  // Print-friendly view
  if (printView) {
    return (
      <div ref={printRef} className="space-y-6 print:block">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; top: 0; left: 0; width: 100%; }
            nav, header, footer, aside { display: none !important; }
          }
        `}</style>
        <div className="print-area">
          <h1 className="text-2xl font-bold">{itinerary.title}</h1>
          {destinationQuery.data ? (
            <p className="text-muted-foreground">{destinationQuery.data}</p>
          ) : null}
          {itinerary.start_date && itinerary.end_date ? (
            <p className="text-sm text-muted-foreground">
              {format(parseISO(itinerary.start_date), "MMM d, yyyy")} —{" "}
              {format(parseISO(itinerary.end_date), "MMM d, yyyy")}
            </p>
          ) : null}
          <Separator className="my-4" />
          {days.map((day, dayIdx) => {
            const dayNumber = dayIdx + 1;
            const dayItems = allItems
              .filter((i) => i.day_number === dayNumber)
              .sort((a, b) => a.order_index - b.order_index);

            return (
              <div key={dayNumber} className="mb-6">
                <h2 className="mb-2 text-lg font-semibold">
                  Day {dayNumber} — {format(day, "EEEE, MMM d")}
                </h2>
                {dayItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No activities planned</p>
                ) : (
                  <ul className="space-y-2">
                    {dayItems.map((item) => (
                      <li key={item.id} className="text-sm">
                        {item.time ? <strong>{item.time}</strong> : null}
                        {item.time ? " — " : ""}
                        <strong>{item.title}</strong>
                        {item.description ? (
                          <span className="text-muted-foreground"> — {item.description}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
            <Link to="/account/itineraries">
              <ArrowLeft className="mr-1 h-4 w-4" />
              All Itineraries
            </Link>
          </Button>
          <h2 className="text-2xl font-bold leading-tight">{itinerary.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {destinationQuery.data ? <span>{destinationQuery.data}</span> : null}
            {itinerary.start_date && itinerary.end_date ? (
              <span>
                {format(parseISO(itinerary.start_date), "MMM d")} —{" "}
                {format(parseISO(itinerary.end_date), "MMM d, yyyy")}
              </span>
            ) : null}
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
          Print
        </Button>
      </div>

      {/* Day Tabs */}
      {days.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2">
            {days.map((day, idx) => {
              const dayNumber = idx + 1;
              const dayItemCount = allItems.filter((i) => i.day_number === dayNumber).length;
              return (
                <button
                  key={dayNumber}
                  type="button"
                  onClick={() => setActiveDay(dayNumber)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors",
                    activeDay === dayNumber
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  Day {dayNumber}
                  {dayItemCount > 0 ? (
                    <span className="rounded-full bg-background/50 px-1.5 text-[10px]">
                      {dayItemCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Active Day Content */}
          <DayPanel
            dayNumber={activeDay}
            dayDate={days[activeDay - 1]}
            items={allItems
              .filter((i) => i.day_number === activeDay)
              .sort((a, b) => a.order_index - b.order_index)}
            addingForDay={addingForDay}
            setAddingForDay={setAddingForDay}
            editItem={editItem}
            setEditItem={setEditItem}
            addItemMutation={addItemMutation}
            editItemMutation={editItemMutation}
            deleteItemMutation={deleteItemMutation}
            reorderMutation={reorderMutation}
          />
        </>
      ) : (
        <Card className="rounded-xl border-dashed">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <p className="text-muted-foreground">
              No date range set. Edit the itinerary dates to start planning.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DayPanel({
  dayNumber,
  dayDate,
  items,
  addingForDay,
  setAddingForDay,
  editItem,
  setEditItem,
  addItemMutation,
  editItemMutation,
  deleteItemMutation,
  reorderMutation,
}: {
  dayNumber: number;
  dayDate: Date | undefined;
  items: ItineraryItem[];
  addingForDay: number | null;
  setAddingForDay: (day: number | null) => void;
  editItem: ItineraryItem | null;
  setEditItem: (item: ItineraryItem | null) => void;
  addItemMutation: {
    mutate: (values: ItemFormValues & { day_number: number }) => void;
    isPending: boolean;
  };
  editItemMutation: {
    mutate: (values: ItemFormValues & { itemId: string }) => void;
    isPending: boolean;
  };
  deleteItemMutation: { mutate: (itemId: string) => void; isPending: boolean };
  reorderMutation: {
    mutate: (vars: { itemId: string; direction: "up" | "down" }) => void;
    isPending: boolean;
  };
}) {
  const addForm = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { time: "", title: "", description: "" },
  });

  const editForm = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    values: editItem
      ? {
          time: editItem.time ?? "",
          title: editItem.title,
          description: editItem.description ?? "",
        }
      : { time: "", title: "", description: "" },
  });

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          Day {dayNumber}
          {dayDate ? (
            <span className="text-sm font-normal text-muted-foreground">
              — {format(dayDate, "EEEE, MMM d")}
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm italic text-muted-foreground">
            No activities yet. Add your first one below.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li
                key={item.id}
                className="group flex items-start gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <button
                    type="button"
                    disabled={idx === 0 || reorderMutation.isPending}
                    onClick={() => reorderMutation.mutate({ itemId: item.id, direction: "up" })}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1 || reorderMutation.isPending}
                    onClick={() => reorderMutation.mutate({ itemId: item.id, direction: "down" })}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  {item.time ? (
                    <div className="mb-0.5 flex items-center gap-1 text-xs text-secondary">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {item.time}
                    </div>
                  ) : null}
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  {item.description ? (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => setEditItem(item)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`Edit ${item.title}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Activity</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove "{item.title}"? This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteItemMutation.mutate(item.id)}
                          className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Add Activity Button */}
        {addingForDay === dayNumber ? (
          <form
            onSubmit={addForm.handleSubmit((values) =>
              addItemMutation.mutate({ ...values, day_number: dayNumber }),
            )}
            className="space-y-3 rounded-lg border border-dashed border-secondary/40 bg-secondary/5 p-3"
          >
            <div className="grid grid-cols-[1fr_auto] gap-3 sm:grid-cols-[100px_1fr]">
              <div className="space-y-1">
                <Label htmlFor={`add-time-${dayNumber}`} className="text-xs">
                  Time
                </Label>
                <Input
                  id={`add-time-${dayNumber}`}
                  type="time"
                  className="text-sm"
                  {...addForm.register("time")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`add-title-${dayNumber}`} className="text-xs">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`add-title-${dayNumber}`}
                  placeholder="e.g. Visit the temple"
                  className="text-sm"
                  {...addForm.register("title")}
                />
                {addForm.formState.errors.title ? (
                  <p className="text-xs text-destructive">
                    {addForm.formState.errors.title.message}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`add-desc-${dayNumber}`} className="text-xs">
                Description
              </Label>
              <Textarea
                id={`add-desc-${dayNumber}`}
                placeholder="Optional details..."
                rows={2}
                className="text-sm"
                {...addForm.register("description")}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={addItemMutation.isPending}
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {addItemMutation.isPending ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="mr-1 h-3.5 w-3.5" />
                )}
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setAddingForDay(null);
                  addForm.reset();
                }}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-full border-dashed"
            onClick={() => {
              addForm.reset();
              setAddingForDay(dayNumber);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit((values) => {
              if (!editItem) return;
              editItemMutation.mutate({ ...values, itemId: editItem.id });
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-time">Time</Label>
              <Input id="edit-time" type="time" {...editForm.register("time")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input id="edit-title" {...editForm.register("title")} />
              {editForm.formState.errors.title ? (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.title.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea id="edit-desc" rows={3} {...editForm.register("description")} />
            </div>
            <Button
              type="submit"
              disabled={editItemMutation.isPending}
              className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {editItemMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
