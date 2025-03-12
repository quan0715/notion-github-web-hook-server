import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ResourceLinkProps {
  href: string;
  title: string;
  icon: string;
}

export function ResourceLink({ href, title, icon }: ResourceLinkProps) {
  const getIcon = () => {
    switch (icon) {
      case "github":
        return (
          <img
            src="https://github.com/favicon.ico"
            alt="GitHub"
            className="w-5 h-5 flex-shrink-0"
          />
        );
      case "notion":
        return (
          <img
            src="https://www.notion.so/images/favicon.ico"
            alt="Notion"
            className="w-5 h-5 flex-shrink-0"
          />
        );
      case "vercel":
        return (
          <img
            src="https://vercel.com/favicon.ico"
            alt="Vercel"
            className="w-5 h-5 flex-shrink-0"
          />
        );
      default:
        return <ExternalLink className="w-5 h-5 flex-shrink-0" />;
    }
  };

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4 flex items-center gap-3">
          {getIcon()}
          <span className="font-medium break-words">{title}</span>
          <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground flex-shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}
