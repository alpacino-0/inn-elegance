import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProtectedPageClient from "./page-client";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return <ProtectedPageClient />;
}
