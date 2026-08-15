import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const testSearch = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ q: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const searchTerm = `%${data.q}%`;
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("name")
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
    return { products, error };
  });
