import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import type { Database } from "../types";

type CreateClientOptions = {
  admin?: boolean;
  schema?: "public" | "storage";
};

export const createClient = (options?: CreateClientOptions) => {
  const { admin = false, ...rest } = options ?? {};

  const cookieStore = cookies();

  const key = admin
    ? process.env.SUPABASE_SERVICE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const auth = admin
    ? {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      }
    : {};

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      ...rest,
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
      auth,
      global: {
        headers: {
          // Pass user agent from browser
          "user-agent": headers().get("user-agent") as string,
        },
      },
    }
  );
};
