"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onRefresh: () => void;
}

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onRefresh}
      className="h-8 w-8 rounded-full"
    >
      <RefreshCw className="h-4 w-4" />
      <span className="sr-only">刷新</span>
    </Button>
  );
}
