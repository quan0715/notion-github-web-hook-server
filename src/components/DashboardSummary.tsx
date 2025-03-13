"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import {
  validateEnv,
  validateGitHubApi,
  validateNotionDatabase,
  validateNotionApi,
} from "@/app/_actions/ValidateAction";
interface ValidationStatus {
  env: boolean | null;
  github: boolean | null;
  notion: boolean | null;
  notionDatabase: boolean | null;
}

export function DashboardSummary() {
  const [status, setStatus] = useState<ValidationStatus>({
    env: null,
    github: null,
    notion: null,
    notionDatabase: null,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const envData = await validateEnv();
        // 獲取環境變數狀態
        // 獲取 GitHub API 狀態
        const githubData = await validateGitHubApi();

        // 獲取 Notion API 狀態
        const notionData = await validateNotionApi();

        // 獲取 Notion 資料庫狀態
        const notionDbData = await validateNotionDatabase();

        setStatus({
          env: envData.success,
          github: githubData.success,
          notion: notionData.success,
          notionDatabase: notionDbData.success,
        });
      } catch (error) {
        console.error("獲取狀態時出錯:", error);
      }
    };

    fetchStatus();
  }, []);

  const allValid =
    status.env === true &&
    status.github === true &&
    status.notion === true &&
    status.notionDatabase === true;

  const anyFailed =
    status.env === false ||
    status.github === false ||
    status.notion === false ||
    status.notionDatabase === false;

  return (
    <Card
      className={`border-l-4 ${
        allValid
          ? "border-l-green-500"
          : anyFailed
          ? "border-l-red-500"
          : "border-l-yellow-500"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {allValid ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : anyFailed ? (
            <XCircle className="h-6 w-6 text-red-500" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          )}
          <h3 className="text-lg font-semibold">
            {allValid
              ? "所有配置驗證通過"
              : anyFailed
              ? "配置驗證失敗"
              : "配置驗證進行中"}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatusBadge label="環境變數" status={status.env} />
          <StatusBadge label="GitHub API" status={status.github} />
          <StatusBadge label="Notion API" status={status.notion} />
          <StatusBadge label="Notion 資料庫" status={status.notionDatabase} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({
  label,
  status,
}: {
  label: string;
  status: boolean | null;
}) {
  if (status === null) {
    return (
      <Badge
        variant="outline"
        className="bg-gray-100 text-gray-700 flex items-center gap-1 py-1 px-2"
      >
        <div className="animate-pulse rounded-full h-2 w-2 bg-gray-500"></div>
        {label}
      </Badge>
    );
  }

  if (status) {
    return (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 flex items-center gap-1 py-1 px-2"
      >
        <CheckCircle className="h-3 w-3" />
        {label}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-red-50 text-red-700 flex items-center gap-1 py-1 px-2"
    >
      <XCircle className="h-3 w-3" />
      {label}
    </Badge>
  );
}
