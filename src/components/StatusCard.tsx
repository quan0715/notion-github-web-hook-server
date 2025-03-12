import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface StatusCardProps {
  title: string;
  status: boolean;
  description: string;
}

export function StatusCard({ title, status, description }: StatusCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className={`h-1 ${status ? "bg-green-500" : "bg-red-500"}`}></div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold break-words">{title}</h3>
          <Badge
            variant={status ? "default" : "destructive"}
            className="ml-2 whitespace-nowrap"
          >
            {status ? "已配置" : "未配置"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground break-words">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
