"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ValidationResult, GitHubUser } from "@/types";
import { RefreshButton } from "./RefreshButton";
import { ExternalLink } from "lucide-react";
import { validateGitHubApi } from "@/app/_actions/ValidateAction";

export function GitHubApiCard() {
  const [validationResult, setValidationResult] = useState<
    | (ValidationResult & {
        details?: {
          user: GitHubUser;
          is_fine_grained: boolean;
          is_expired: boolean;
        };
      })
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await validateGitHubApi();
      setValidationResult(response);
    } catch (error) {
      console.error("GitHub API 驗證時出錯:", error);
      setValidationResult({
        success: false,
        message: "驗證 GitHub API 時發生錯誤",
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

  const user =
    validationResult?.success && validationResult.details
      ? validationResult.details.user
      : null;
  const tokenScopes =
    validationResult?.success && validationResult.details
      ? validationResult.details.token_scopes
      : "";
  const isFineGrained =
    validationResult?.success && validationResult.details
      ? validationResult.details.is_fine_grained
      : false;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">GitHub 用戶信息</CardTitle>
        <RefreshButton onRefresh={handleRefresh} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : validationResult?.success ? (
          <div className="space-y-3">
            {user && (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={user.avatar_url}
                    alt={user.login}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    @{user.login}
                  </div>
                </div>
                <a
                  href={`https://github.com/${user.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mt-2">
              {isFineGrained && (
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 text-xs"
                >
                  Fine-grained token
                </Badge>
              )}
            </div>
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
