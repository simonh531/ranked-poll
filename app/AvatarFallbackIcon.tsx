import { User } from "lucide-react";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

export default function AvatarFallbackIcon() {
  return (
    <Suspense fallback={<User />}>
      <AvatarFallbackIconWithData />
    </Suspense>
  );
}

async function AvatarFallbackIconWithData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return user.id.slice(0, 2);
  }
  return <User />;
}
