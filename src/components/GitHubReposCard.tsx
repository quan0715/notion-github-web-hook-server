"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ValidationResult } from "@/types";
import { RefreshButton } from "./RefreshButton";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  private: boolean;
  permissions: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
  has_issues: boolean;
}

export function GitHubReposCard() {
  const [validationResult, setValidationResult] = useState<
    | (ValidationResult & {
        details?: {
          repositories: Repository[];
        };
      })
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/config/validate-github-repos", {
        cache: "no-store",
      });
      const data = await response.json();
      setValidationResult(data);
    } catch (error) {
      console.error("GitHub 儲存庫權限驗證時出錯:", error);
      setValidationResult({
        success: false,
        message: "驗證 GitHub 儲存庫權限時發生錯誤",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const repositories =
    validationResult?.success && validationResult.details
      ? validationResult.details.repositories || []
      : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">
          GitHub 儲存庫權限驗證
        </CardTitle>
        <RefreshButton onRefresh={handleRefresh} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : validationResult?.success ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-700">
              找到 {repositories.length} 個可用的儲存庫
            </p>
            {repositories.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 mt-2">
                {repositories.map((repo: Repository) => (
                  <div
                    key={repo.id}
                    className="p-4 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <h3 className="font-medium break-all">{repo.name}</h3>
                      <div className="flex gap-2">
                        {repo.private ? (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 whitespace-nowrap"
                          >
                            私有
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 whitespace-nowrap"
                          >
                            公開
                          </Badge>
                        )}
                      </div>
                    </div>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground mb-2 break-words">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {repo.permissions.admin && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 whitespace-nowrap"
                        >
                          管理員權限
                        </Badge>
                      )}
                      {repo.permissions.push && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 whitespace-nowrap"
                        >
                          寫入權限
                        </Badge>
                      )}
                      {repo.has_issues && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 whitespace-nowrap"
                        >
                          Issues 已啟用
                        </Badge>
                      )}
                      {repo.html_url && (
                        <Link
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                        >
                          <span>查看儲存庫</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-amber-600">沒有找到可用的儲存庫</p>
            )}
          </div>
        ) : (
          <div className="p-4 bg-red-50 rounded-md border border-red-200">
            <p className="text-red-700 font-medium">驗證失敗</p>
            <p className="text-sm text-red-600 mt-1">
              {validationResult?.message || "未知錯誤"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
