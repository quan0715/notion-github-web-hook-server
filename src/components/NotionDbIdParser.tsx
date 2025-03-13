"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotionDbIdParser() {
  const [url, setUrl] = useState("");
  const [dbId, setDbId] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const parseDbId = () => {
    try {
      setError("");
      setCopied(false);

      // 檢查是否為空
      if (!url.trim()) {
        setError("請輸入 Notion 資料庫 URL 或 ID");
        setDbId("");
        return;
      }

      // 處理可能的不完整 URL
      let processedUrl = url.trim();
      if (!processedUrl.startsWith("http")) {
        processedUrl = `https://${processedUrl}`;
      }

      // 嘗試解析 URL
      let urlObj;
      try {
        urlObj = new URL(processedUrl);
      } catch (e) {
        setError("無效的 URL 格式");
        setDbId("");
        return;
      }

      // 檢查是否為 Notion 網址
      if (
        !urlObj.hostname.includes("notion.so") &&
        !urlObj.hostname.includes("notion.site")
      ) {
        setError("這不是一個有效的 Notion URL");
        setDbId("");
        return;
      }

      // 直接從 URL 中提取 ID
      // 方法 1: 從路徑中提取
      const pathParts = urlObj.pathname
        .split("/")
        .filter((part) => part.length > 0);

      // 尋找資料庫 ID
      let foundId = "";

      // 檢查路徑中的每個部分
      for (const part of pathParts) {
        // Notion 資料庫 ID 通常是 32 個字符，格式為 8-4-4-4-12
        if (
          /^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$/.test(
            part
          )
        ) {
          foundId = part;
          break;
        }
        // 有時 ID 可能沒有連字符
        if (/^[a-zA-Z0-9]{32}$/.test(part)) {
          // 插入連字符
          foundId = `${part.slice(0, 8)}-${part.slice(8, 12)}-${part.slice(
            12,
            16
          )}-${part.slice(16, 20)}-${part.slice(20)}`;
          break;
        }
        // 檢查是否包含 ID 格式 (例如: workspace?v=123456...)
        const idMatch = part.match(
          /([a-zA-Z0-9]{8}[a-zA-Z0-9]{4}[a-zA-Z0-9]{4}[a-zA-Z0-9]{4}[a-zA-Z0-9]{12})/
        );
        if (idMatch) {
          const rawId = idMatch[1];
          foundId = `${rawId.slice(0, 8)}-${rawId.slice(8, 12)}-${rawId.slice(
            12,
            16
          )}-${rawId.slice(16, 20)}-${rawId.slice(20)}`;
          break;
        }
      }

      // 方法 2: 從查詢參數中提取
      if (!foundId) {
        // 有時 ID 在查詢參數中，例如 ?p=123456...
        for (const [key, value] of urlObj.searchParams.entries()) {
          // 檢查參數值是否包含 ID
          const idMatch = value.match(
            /([a-zA-Z0-9]{8}[a-zA-Z0-9]{4}[a-zA-Z0-9]{4}[a-zA-Z0-9]{4}[a-zA-Z0-9]{12})/
          );
          if (idMatch) {
            const rawId = idMatch[1];
            foundId = `${rawId.slice(0, 8)}-${rawId.slice(8, 12)}-${rawId.slice(
              12,
              16
            )}-${rawId.slice(16, 20)}-${rawId.slice(20)}`;
            break;
          }

          // 檢查帶連字符的 ID
          if (
            /^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$/.test(
              value
            )
          ) {
            foundId = value;
            break;
          }
        }
      }

      // 方法 3: 從整個 URL 中提取
      if (!foundId) {
        const fullUrlMatch = processedUrl.match(
          /([a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12})/
        );
        if (fullUrlMatch) {
          foundId = fullUrlMatch[1];
        } else {
          // 嘗試匹配無連字符的 ID
          const rawIdMatch = processedUrl.match(/([a-zA-Z0-9]{32})/);
          if (rawIdMatch) {
            const rawId = rawIdMatch[1];
            foundId = `${rawId.slice(0, 8)}-${rawId.slice(8, 12)}-${rawId.slice(
              12,
              16
            )}-${rawId.slice(16, 20)}-${rawId.slice(20)}`;
          }
        }
      }

      if (foundId) {
        setDbId(foundId);
      } else {
        setError("無法從 URL 中解析出資料庫 ID");
        setDbId("");
      }
    } catch (err) {
      console.error("解析錯誤:", err);
      setError("解析過程中發生錯誤");
      setDbId("");
    }
  };

  const copyToClipboard = () => {
    if (dbId) {
      navigator.clipboard.writeText(dbId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Notion 資料庫 ID 解析工具
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="notion-url" className="text-sm font-medium">
            Notion 資料庫 URL 或 ID
          </label>
          <div className="flex gap-2">
            <Input
              id="notion-url"
              placeholder="https://www.notion.so/workspace/... 或直接輸入 ID"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  parseDbId();
                }
              }}
            />
            <Button onClick={parseDbId}>解析</Button>
          </div>
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-500 flex items-center">
                <span className="mr-1">⚠️</span> {error}
              </p>
            </div>
          )}
        </div>

        {dbId && (
          <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <label className="text-sm font-medium text-blue-700">
              資料庫 ID
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 bg-white rounded-md font-mono text-sm overflow-x-auto border border-blue-100">
                {dbId}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className={cn(
                  "transition-colors",
                  copied
                    ? "bg-green-100 text-green-700 border-green-300"
                    : "bg-blue-100 border-blue-300 text-blue-700"
                )}
                title="複製到剪貼簿"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  window.open(`https://www.notion.so/${dbId}`, "_blank")
                }
                className="bg-blue-100 border-blue-300 text-blue-700"
                title="在 Notion 中開啟"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" /> 已複製到剪貼簿！
              </p>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <p className="font-medium mb-1">支援的 URL 格式：</p>
          <ul className="space-y-1 list-disc pl-5">
            <li>
              https://www.notion.so/workspace/
              <span className="font-mono">
                abcdef12-3456-7890-abcd-ef1234567890
              </span>
            </li>
            <li>
              https://www.notion.so/
              <span className="font-mono">abcdef123456789abcdef1234567890</span>
            </li>
            <li>
              https://www.notion.site/workspace/Database-Name-
              <span className="font-mono">abcdef123456789abcdef1234567890</span>
            </li>
            <li>
              直接輸入 ID：
              <span className="font-mono">
                abcdef12-3456-7890-abcd-ef1234567890
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
