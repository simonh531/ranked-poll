import { H3 } from "@/components/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SquareIcon, GripVerticalIcon } from "lucide-react";

export default function VoteDisplay({
  title,
  options,
}: {
  title?: string;
  options?: string[];
}) {
  return (
    <CardHeader>
      <CardTitle>
        <H3>{title}</H3>
      </CardTitle>
      <CardContent className="p-0 flex flex-col gap-2">
        {options?.map((option) => (
          <Card key={option} className="p-0">
            <CardContent className="p-2 flex items-center">
              <GripVerticalIcon />
              <div className="flex gap-2 items-center">
                <Button size="icon" variant="ghost">
                  <SquareIcon />
                </Button>
                {option}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </CardHeader>
  );
}
