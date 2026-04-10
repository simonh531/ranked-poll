import { H3 } from "@/components/typography";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Framework({
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
      <CardContent>
        {options?.map((option) => (
          <p key={option}>{option}</p>
        ))}
      </CardContent>
    </CardHeader>
  );
}
