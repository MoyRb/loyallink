import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function uploadBusinessLogo(ownerId: string, file: File) {
  const supabase = getSupabaseBrowserClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const filePath = `${ownerId}/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await supabase.storage.from("business-logos").upload(filePath, file, {
    upsert: false,
    cacheControl: "3600",
  });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage.from("business-logos").getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}
