// GroIntel Supabase Client
// Used for lead capture and future data storage.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// In development, if env vars are not set, provide a fallback that logs warnings
const isConfigured = supabaseUrl.includes("supabase.co") && supabaseAnonKey.length > 10;

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ========== Leads API ==========

export interface Lead {
  name: string;
  email: string;
  companyWebsite: string;
  targetMarket: string;
  growthGoal: string;
  budgetRange: string;
  message: string;
}

export async function submitLead(lead: Lead): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    console.log("[GroIntel] Supabase not configured. Lead would be saved:", lead);
    // In development, pretend it works
    await new Promise((r) => setTimeout(r, 500));
    return { success: true };
  }

  try {
    const { error } = await supabase.from("leads").insert([
      {
        name: lead.name,
        email: lead.email,
        company_website: lead.companyWebsite,
        target_market: lead.targetMarket,
        growth_goal: lead.growthGoal,
        budget_range: lead.budgetRange,
        message: lead.message,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("[GroIntel] Supabase insert error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[GroIntel] Supabase error:", err);
    return { success: false, error: message };
  }
}

// ========== SQL for Supabase ==========
// Run this in Supabase SQL Editor to create the leads table:
//
// create table leads (
//   id uuid default gen_random_uuid() primary key,
//   name text not null,
//   email text not null,
//   company_website text,
//   target_market text,
//   growth_goal text,
//   budget_range text,
//   message text,
//   created_at timestamptz default now()
// );
//
// alter table leads enable row level security;
// create policy "Allow anonymous insert" on leads for insert to anon with check (true);


