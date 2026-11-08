import { getAdmin } from "./supabase-admin";
import { getBusiness, type BusinessConfig } from "./businesses";

// Looks in the database first, then falls back to the businesses hard-coded in businesses.ts.
export async function getBusinessAsync(id: unknown): Promise<BusinessConfig | null> {
    if (typeof id === "string" && /^[a-z0-9-]{1,60}$/.test(id)) {
        try {
            const { data } = await getAdmin()
                .from("businesses")
                .select("*")
                .eq("slug", id)
                .maybeSingle();
            if (data) {
                return {
                    id: data.slug,
                    name: data.name ?? "",
                    city: data.city ?? "",
                    industry: data.industry ?? "",
                    phone: data.phone ?? "",
                    hours: data.hours ?? "",
                    services: String(data.services ?? "")
                        .split(",")
                        .map((s: string) => s.trim())
                        .filter(Boolean),
                    greeting: data.greeting ?? "",
                    notes: data.notes ?? "",
                    notifyEmail: data.notify_email ?? "",
                    demo: Boolean(data.demo),
                };
            }
        } catch (error) {
            console.error("Business lookup error:", error instanceof Error ? error.message : "unknown");
        }
    }
    return getBusiness(id);
}