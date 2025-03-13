"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotionDatabaseCard } from "@/components/NotionDatabaseCard";
import { NotionDatabaseValidateResponse, NotionRepoOption } from "@/types";
import { validateNotionDatabase } from "@/app/_actions/ValidateAction";
export function NotionDatabaseCheckCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [database, setDatabase] =
    useState<NotionDatabaseValidateResponse | null>(null);
  const [validatingRepos, setValidatingRepos] = useState<string | null>(null);
  const [repoOptions, setRepoOptions] = useState<
    Record<string, NotionRepoOption[]>
  >({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await validateNotionDatabase();
      if (!response.success) {
        throw new Error(response.message);
      }
      setDatabase(response.details?.database || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生未知錯誤");
      console.error("Error fetching Notion database validation:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
    // 清除所有儲存庫選項的驗證結果
    setRepoOptions({});
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Notion 資料庫檢查</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              載入中...
            </>
          ) : (
            "重新整理"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            <p>無法驗證 Notion 資料庫：{error}</p>
          </div>
        ) : !database ? (
          <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
            <p>
              未找到任何 Notion 資料庫。請確保您已正確設定 Notion API
              並有權限存取資料庫。
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <NotionDatabaseCard db={database} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
