"use server";

import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ContactFormState {
  success?: boolean;
  error?: string;
}

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const subject = formData.get("subject")?.toString().trim() || null;
  const message = formData.get("message")?.toString().trim();

  // Basic validation
  if (!name || name.length < 2) {
    return { error: "Please provide a valid name (at least 2 characters)." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!message || message.length < 10) {
    return { error: "Message must be at least 10 characters long." };
  }

  // If Supabase is configured, insert into contact_messages
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.from("contact_messages").insert({
        name,
        email,
        subject,
        message,
      });

      if (error) {
        console.error("Supabase contact_messages error:", error);
        return { error: "Failed to submit message to database. Please email directly." };
      }
    } catch (err) {
      console.error("Contact action error:", err);
      return { error: "A server error occurred. Please contact via email directly." };
    }
  }

  return { success: true };
}
