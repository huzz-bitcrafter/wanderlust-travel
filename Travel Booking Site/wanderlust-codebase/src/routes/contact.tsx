import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/layout/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

const title = "Contact Us — Wanderlust Concierge";
const description =
  "Connect with our travel architects for custom itineraries, booking assistance, or expedition planning. We respond within 24 hours.";

const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message cannot exceed 2000 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const QUICK_TOPICS = [
  "Custom Itinerary Design",
  "Booking Assistance",
  "Private Group / Corporate",
  "Cancellation / Rescheduling",
  "General Inquiry",
];

const FAQS = [
  {
    q: "How quickly will a travel specialist respond to my inquiry?",
    a: "Our concierge team reviews all incoming inquiries 7 days a week. You will receive a personalized response from a dedicated travel specialist within 24 hours (usually under 4 hours during business operating times).",
  },
  {
    q: "Can any tour package be customized for private travel?",
    a: "Absolutely. All of our curated multi-day tour packages can be customized for private groups, honeymooners, families, or bespoke solo travel. Mention your preferred departure dates and customizations in your message.",
  },
  {
    q: "What is your booking cancellation and refund policy?",
    a: "Direct hotel and tour package bookings can be cancelled free of charge up to 48 hours prior to the scheduled start date via your Wanderlust Account Dashboard. Flight schedules adhere to airline fare class rules.",
  },
  {
    q: "Do you assist with visa guidance and travel insurance?",
    a: "Yes! Once your booking is confirmed, our travel architects provide complimentary visa entry requirement summaries and partner insurance coverage options tailored to your destination.",
  },
];

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { user, profile } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedSubject, setSubmittedSubject] = useState("");
  const [ticketId, setTicketId] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: profile?.full_name || "",
      email: user?.email || "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const { data: inserted, error } = await supabase
        .from("contact_messages")
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject,
          message: data.message,
          status: "new",
        })
        .select("id")
        .single();

      if (error) throw error;

      setTicketId(inserted?.id ? inserted.id.slice(0, 8).toUpperCase() : "WL-INQ");
      setSubmittedSubject(data.subject);
      setIsSubmitted(true);
      toast.success("Inquiry sent successfully! Our concierge will be in touch.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send message.";
      toast.error(message);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    reset({
      name: profile?.full_name || "",
      email: user?.email || "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  return (
    <SiteLayout>
      <PageHeader eyebrow="Travel Concierge" title="Get in Touch" description={description} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        {/* Main Grid: Form + Info Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start max-w-6xl mx-auto">
          {/* Left / Form Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm">
              {isSubmitted ? (
                <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-300">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase">
                      Inquiry Ref #{ticketId}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      Message Received
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Thank you for contacting Wanderlust. We've logged your request regarding{" "}
                      <strong>"{submittedSubject}"</strong>. A senior travel architect will review
                      your details and respond via email within 24 hours.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      Average response time: <strong>3 hours 40 minutes</strong>
                    </span>
                  </div>

                  <Button onClick={handleReset} variant="outline" className="text-xs">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Send Us a Message
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fill out the form below and an expedition designer will get back to you.
                    </p>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact_name"
                        className="text-xs font-semibold text-foreground"
                      >
                        Your Full Name *
                      </label>
                      <Input
                        id="contact_name"
                        placeholder="e.g. Eleanor Vance"
                        {...register("name")}
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && (
                        <p className="text-[11px] text-destructive font-medium">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact_email"
                        className="text-xs font-semibold text-foreground"
                      >
                        Email Address *
                      </label>
                      <Input
                        id="contact_email"
                        type="email"
                        placeholder="e.g. eleanor@wanderlust.test"
                        {...register("email")}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-destructive font-medium">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact_phone"
                        className="text-xs font-semibold text-foreground"
                      >
                        Phone Number (Optional)
                      </label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        placeholder="e.g. +1 (555) 234-5678"
                        {...register("phone")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact_subject"
                        className="text-xs font-semibold text-foreground"
                      >
                        Inquiry Topic / Subject *
                      </label>
                      <Input
                        id="contact_subject"
                        placeholder="e.g. Custom 10-Day Greece Itinerary"
                        {...register("subject")}
                        className={errors.subject ? "border-destructive" : ""}
                      />
                      {errors.subject && (
                        <p className="text-[11px] text-destructive font-medium">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Topic Chips */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Quick Topics:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_TOPICS.map((topic) => (
                        <button
                          type="button"
                          key={topic}
                          onClick={() => setValue("subject", topic, { shouldValidate: true })}
                          className="px-2.5 py-1 rounded-lg border border-border text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted hover:border-primary/40 transition-colors"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact_message"
                      className="text-xs font-semibold text-foreground"
                    >
                      Your Message or Travel Wishlist *
                    </label>
                    <Textarea
                      id="contact_message"
                      rows={5}
                      placeholder="Tell us about your travel dates, party size, dream destinations, or specific questions..."
                      {...register("message")}
                      className={errors.message ? "border-destructive" : ""}
                    />
                    {errors.message && (
                      <p className="text-[11px] text-destructive font-medium">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 text-sm font-semibold shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Transmitting Message...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Inquiry to Concierge
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Right / Office Details Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Card */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">Direct Contact</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Reach our global concierge desks across London and North America.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-muted/40 border border-border/70">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Email Desk</span>
                    <a
                      href="mailto:concierge@wanderlust.travel"
                      className="text-xs font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      concierge@wanderlust.travel
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-muted/40 border border-border/70">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Telephone Hotline</span>
                    <span className="text-xs font-semibold text-foreground">
                      +1 (800) 555-WNDR / +44 20 7946 0991
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-muted/40 border border-border/70">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Operating Hours</span>
                    <span className="text-xs font-semibold text-foreground">
                      Monday – Saturday, 08:00 – 20:00 GMT
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-muted/40 border border-border/70">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Flagship Studios</span>
                    <span className="text-xs font-semibold text-foreground">
                      Mayfair, London &amp; Presidio, San Francisco
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                  <ShieldCheck className="h-4 w-4" />
                  <span>The Wanderlust Promise</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  No automated bots. Every message is directly handled by experienced travel
                  architects with on-the-ground regional expertise.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="max-w-4xl mx-auto space-y-6 pt-6 border-t border-border">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-xs font-semibold">
              <HelpCircle className="h-3 w-3 mr-1 text-primary" /> FAQ
            </Badge>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Quick answers about trip planning, booking changes, and customized travel.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {FAQS.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="rounded-2xl border border-border bg-card px-5 shadow-xs"
              >
                <AccordionTrigger className="text-left font-display text-sm font-semibold text-foreground hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </SiteLayout>
  );
}
