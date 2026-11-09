"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(_prev: string | null, fd: FormData): Promise<string | null> {
  const username = String(fd.get("username") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!username || !password) return "Enter your username and password.";
  const supabase = await createClient();
  const { data: email } = await supabase.rpc("login_email", { p_username: username });
  if (!email) return "Incorrect username or password.";
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return "Incorrect username or password.";
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
