export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_type: string;
          created_at: string;
          end_date: string | null;
          guest_details: Json;
          guests: number;
          id: string;
          item_id: string | null;
          payment_status: string;
          reference: string;
          status: string;
          total_price: number;
          travel_date: string | null;
          user_id: string;
        };
        Insert: {
          booking_type: string;
          created_at?: string;
          end_date?: string | null;
          guest_details?: Json;
          guests?: number;
          id?: string;
          item_id?: string | null;
          payment_status?: string;
          reference?: string;
          status?: string;
          total_price?: number;
          travel_date?: string | null;
          user_id: string;
        };
        Update: {
          booking_type?: string;
          created_at?: string;
          end_date?: string | null;
          guest_details?: Json;
          guests?: number;
          id?: string;
          item_id?: string | null;
          payment_status?: string;
          reference?: string;
          status?: string;
          total_price?: number;
          travel_date?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          phone: string | null;
          status: string;
          subject: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          phone?: string | null;
          status?: string;
          subject: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          phone?: string | null;
          status?: string;
          subject?: string;
        };
        Relationships: [];
      };
      destinations: {
        Row: {
          best_season: string | null;
          continent: string | null;
          country: string;
          created_at: string;
          description: string | null;
          hero_image: string | null;
          id: string;
          is_featured: boolean;
          name: string;
          region: string | null;
          short_description: string | null;
          slug: string;
        };
        Insert: {
          best_season?: string | null;
          continent?: string | null;
          country: string;
          created_at?: string;
          description?: string | null;
          hero_image?: string | null;
          id?: string;
          is_featured?: boolean;
          name: string;
          region?: string | null;
          short_description?: string | null;
          slug: string;
        };
        Update: {
          best_season?: string | null;
          continent?: string | null;
          country?: string;
          created_at?: string;
          description?: string | null;
          hero_image?: string | null;
          id?: string;
          is_featured?: boolean;
          name?: string;
          region?: string | null;
          short_description?: string | null;
          slug?: string;
        };
        Relationships: [];
      };
      flights: {
        Row: {
          airline: string;
          arrival_time: string;
          class: string;
          created_at: string;
          departure_time: string;
          destination_city: string;
          destination_code: string;
          duration_minutes: number;
          flight_number: string;
          id: string;
          origin_city: string;
          origin_code: string;
          price: number;
          seats_available: number;
          seats_total: number;
          status: string;
        };
        Insert: {
          airline: string;
          arrival_time: string;
          class?: string;
          created_at?: string;
          departure_time: string;
          destination_city: string;
          destination_code: string;
          duration_minutes?: number;
          flight_number: string;
          id?: string;
          origin_city: string;
          origin_code: string;
          price?: number;
          seats_available?: number;
          seats_total?: number;
          status?: string;
        };
        Update: {
          airline?: string;
          arrival_time?: string;
          class?: string;
          created_at?: string;
          departure_time?: string;
          destination_city?: string;
          destination_code?: string;
          duration_minutes?: number;
          flight_number?: string;
          id?: string;
          origin_city?: string;
          origin_code?: string;
          price?: number;
          seats_available?: number;
          seats_total?: number;
          status?: string;
        };
        Relationships: [];
      };
      gallery_images: {
        Row: {
          caption: string | null;
          created_at: string;
          destination_id: string | null;
          id: string;
          url: string;
        };
        Insert: {
          caption?: string | null;
          created_at?: string;
          destination_id?: string | null;
          id?: string;
          url: string;
        };
        Update: {
          caption?: string | null;
          created_at?: string;
          destination_id?: string | null;
          id?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gallery_images_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          },
        ];
      };
      hotels: {
        Row: {
          address: string | null;
          amenities: Json;
          created_at: string;
          description: string | null;
          destination_id: string | null;
          id: string;
          image_url: string | null;
          name: string;
          price_per_night: number;
          star_rating: number;
          status: string;
        };
        Insert: {
          address?: string | null;
          amenities?: Json;
          created_at?: string;
          description?: string | null;
          destination_id?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          price_per_night?: number;
          star_rating?: number;
          status?: string;
        };
        Update: {
          address?: string | null;
          amenities?: Json;
          created_at?: string;
          description?: string | null;
          destination_id?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          price_per_night?: number;
          star_rating?: number;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hotels_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          },
        ];
      };
      itineraries: {
        Row: {
          created_at: string;
          destination_id: string | null;
          end_date: string | null;
          id: string;
          notes: string | null;
          start_date: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          destination_id?: string | null;
          end_date?: string | null;
          id?: string;
          notes?: string | null;
          start_date?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          destination_id?: string | null;
          end_date?: string | null;
          id?: string;
          notes?: string | null;
          start_date?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "itineraries_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          },
        ];
      };
      itinerary_items: {
        Row: {
          created_at: string;
          day_number: number;
          description: string | null;
          id: string;
          itinerary_id: string;
          order_index: number;
          time: string | null;
          title: string;
        };
        Insert: {
          created_at?: string;
          day_number?: number;
          description?: string | null;
          id?: string;
          itinerary_id: string;
          order_index?: number;
          time?: string | null;
          title: string;
        };
        Update: {
          created_at?: string;
          day_number?: number;
          description?: string | null;
          id?: string;
          itinerary_id?: string;
          order_index?: number;
          time?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "itinerary_items_itinerary_id_fkey";
            columns: ["itinerary_id"];
            isOneToOne: false;
            referencedRelation: "itineraries";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          author_name: string | null;
          comment: string | null;
          created_at: string;
          id: string;
          is_approved: boolean;
          rating: number;
          target_id: string;
          target_type: string;
          title: string | null;
          user_id: string;
        };
        Insert: {
          author_name?: string | null;
          comment?: string | null;
          created_at?: string;
          id?: string;
          is_approved?: boolean;
          rating?: number;
          target_id: string;
          target_type: string;
          title?: string | null;
          user_id: string;
        };
        Update: {
          author_name?: string | null;
          comment?: string | null;
          created_at?: string;
          id?: string;
          is_approved?: boolean;
          rating?: number;
          target_id?: string;
          target_type?: string;
          title?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      tour_packages: {
        Row: {
          created_at: string;
          description: string | null;
          destination_id: string | null;
          difficulty: string;
          duration_days: number;
          excludes: Json;
          group_size_max: number;
          id: string;
          image_url: string | null;
          includes: Json;
          is_featured: boolean;
          itinerary: Json;
          price_per_person: number;
          slug: string;
          status: string;
          summary: string | null;
          title: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          destination_id?: string | null;
          difficulty?: string;
          duration_days?: number;
          excludes?: Json;
          group_size_max?: number;
          id?: string;
          image_url?: string | null;
          includes?: Json;
          is_featured?: boolean;
          itinerary?: Json;
          price_per_person?: number;
          slug: string;
          status?: string;
          summary?: string | null;
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          destination_id?: string | null;
          difficulty?: string;
          duration_days?: number;
          excludes?: Json;
          group_size_max?: number;
          id?: string;
          image_url?: string | null;
          includes?: Json;
          is_featured?: boolean;
          itinerary?: Json;
          price_per_person?: number;
          slug?: string;
          status?: string;
          summary?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tour_packages_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      app_role: "user" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin"],
    },
  },
} as const;
