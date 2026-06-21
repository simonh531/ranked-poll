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
  
  if (user && !user.is_anonymous) {
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return user.id.slice(0, 2).toUpperCase();
  }
  
  return <User className="h-4 w-4 text-muted-foreground" />;
}

