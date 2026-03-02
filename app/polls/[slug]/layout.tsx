import { ReactNode } from "react";

import { Card } from "@/components/ui/card";

export default function Page({ children }: { children: ReactNode }) {
  return (
    <div className="pt-8 relative flex justify-center">
      <Card className="w-full max-w-200">{children}</Card>
    </div>
  );
}
