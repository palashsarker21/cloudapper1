import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const testAdminDirect = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error, count } = await supabaseAdmin
      .from("products")
      .select("*", { count: 'exact' });
    return { data, error, count };
  });
