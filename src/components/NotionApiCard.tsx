"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ValidationResult, NotionUser } from "@/types";
import { RefreshButton } from "./RefreshButton";
import { validateNotionApi } from "@/app/_actions/ValidateAction";
export function NotionApiCard() {
  const [validationResult, setValidationResult] = useState<
    | (ValidationResult & {
        details?: {
          user: NotionUser;
          workspace_name: string;
          workspace_icon?: string;
        };
      })
    | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await validateNotionApi();
      setValidationResult(response);
    } catch (error) {
      console.error("Notion API 驗證時出錯:", error);
      setValidationResult({
        success: false,
        message: "驗證 Notion API 時發生錯誤",
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
  const workspaceName =
    validationResult?.success && validationResult.details
      ? validationResult.details.workspace_name
      : "";
  const workspaceIcon =
    validationResult?.success && validationResult.details
      ? validationResult.details.workspace_icon
      : undefined;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">Notion 用戶信息</CardTitle>
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
                <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-gray-500">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.type}
                  </div>
                </div>
              </div>
            )}

            {workspaceName && (
              <div className="flex items-center gap-3 mt-2 p-2 bg-gray-50 rounded-md">
                <div className="h-8 w-8 rounded-md overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                  {workspaceIcon ? (
                    <img
                      src={workspaceIcon}
                      alt={workspaceName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-500">
                      {workspaceName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{workspaceName}</div>
                  <div className="text-xs text-muted-foreground">工作區</div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 text-xs"
                >
                  已連接
                </Badge>
              </div>
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
