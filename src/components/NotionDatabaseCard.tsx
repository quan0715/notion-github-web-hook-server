import Link from "next/link";
import {
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotionDatabase, NotionRepoOption, SimilarField } from "@/types";

interface NotionDatabaseCardProps {
  db: NotionDatabase;
  // isValid: boolean;
  validatingRepos: string | null;
  notionRepoOptions: NotionRepoOption[];
  validateNotionRepos: (databaseId: string) => void;
}

interface RepositoryValidationResultProps {
  repo: NotionRepoOption;
}

export function NotionDatabaseCard({
  db,
  validatingRepos,
  notionRepoOptions,
  validateNotionRepos,
}: NotionDatabaseCardProps) {
  const isCurrentlyValidating = validatingRepos === db.id;
  const hasValidationResults =
    notionRepoOptions.length > 0 && validatingRepos === null;
  const shouldShowResults = hasValidationResults && db.id === db.id; // 可以根據需要調整條件
  console.log(db);
  // 計算驗證狀態摘要
  const hasMissingFields = db.missingFields.length > 0;
  const hasInvalidTypes = db.invalidTypes.length > 0;
  const hasSimilarFields = db.similarFields && db.similarFields.length > 0;
  const isValid = !hasMissingFields && !hasInvalidTypes && !hasSimilarFields;
  // 獲取所有問題的欄位名稱
  const problemFields = [
    ...db.missingFields.map((f) => f.name),
    ...db.invalidTypes.map((t) => t.name),
    ...(db.similarFields ? db.similarFields.map((s) => s.expected) : []),
  ];

  // 移除重複的欄位名稱
  const uniqueProblemFields = [...new Set(problemFields)];

  return (
    <Card
      className={
        isValid
          ? "overflow-hidden border-green-500"
          : "overflow-hidden border-yellow-500"
      }
    >
      <div className={isValid ? "h-1 bg-green-500" : "h-1 bg-yellow-500"}></div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h3 className="font-semibold break-words">
            {db.title || "未命名資料庫"}
          </h3>
          <Badge
            variant="outline"
            className={
              isValid
                ? "ml-2 bg-green-50 whitespace-nowrap"
                : "ml-2 bg-yellow-50 text-yellow-700 whitespace-nowrap"
            }
          >
            {isValid ? "符合要求" : "需要修改"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-2 break-all">
          ID: {db.id}
        </p>

        {!isValid && (
          <>
            {/* 驗證狀態摘要 */}
            <div className="mb-4 p-3 bg-amber-50 rounded-md border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <p className="font-medium text-amber-700">資料庫欄位驗證失敗</p>
              </div>
              <p className="text-sm text-amber-600 mb-2">
                您的 Notion 資料庫需要進行以下修改才能與系統整合：
              </p>
              <ul className="text-sm list-disc list-inside text-amber-700 ml-2">
                {hasMissingFields && (
                  <li>新增缺少的必要欄位 ({db.missingFields.length} 個)</li>
                )}
                {hasInvalidTypes && (
                  <li>修正欄位類型不符的問題 ({db.invalidTypes.length} 個)</li>
                )}
                {hasSimilarFields && (
                  <li>
                    修正欄位名稱格式不符的問題 ({db.similarFields!.length} 個)
                  </li>
                )}
              </ul>
            </div>

            {/* 欄位問題詳細說明 */}
            <div className="space-y-4 mb-4">
              {hasSimilarFields && (
                <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <p className="font-medium text-yellow-700">
                      欄位名稱格式不符
                    </p>
                  </div>
                  <p className="text-xs text-yellow-600 mb-3">
                    以下欄位名稱與系統要求的名稱相似，但不完全相同。請修改欄位名稱，確保
                    <span className="font-medium">大小寫和空格</span>
                    都完全一致。
                  </p>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-yellow-100">
                        <th className="text-left py-1.5 px-2 font-medium text-yellow-700 rounded-tl-md">
                          您需要的欄位名稱
                        </th>
                        <th className="text-left py-1.5 px-2 font-medium text-yellow-700">
                          目前的欄位名稱
                        </th>
                        <th className="text-left py-1.5 px-2 font-medium text-yellow-700 rounded-tr-md">
                          修正方法
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {db.similarFields!.map(
                        (field: SimilarField, index: number) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0
                                ? "bg-yellow-50"
                                : "bg-yellow-100/50"
                            }
                          >
                            <td className="py-2 px-2 font-mono font-medium">
                              {field.expected}
                            </td>
                            <td className="py-2 px-2 font-mono">
                              {field.actual}
                            </td>
                            <td className="py-2 px-2">
                              <span className="text-yellow-700">
                                將「{field.actual}」改為「{field.expected}」
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                  <div className="mt-2 text-xs text-yellow-600 bg-yellow-100/50 p-2 rounded">
                    <span className="font-medium">提示：</span> 欄位名稱必須
                    <span className="font-medium">完全相符</span>
                    ，包括大小寫和空格。例如「Issue
                    Tag」和「IssueTag」是不同的欄位名稱。
                  </div>
                </div>
              )}

              {hasMissingFields && (
                <div className="p-3 bg-red-50 rounded-md border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <p className="font-medium text-red-700">缺少必要欄位</p>
                  </div>
                  <p className="text-xs text-red-600 mb-3">
                    您的資料庫缺少以下必要欄位，請添加這些欄位並確保名稱和類型完全符合要求。
                  </p>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-red-100">
                        <th className="text-left py-1.5 px-2 font-medium text-red-700 rounded-tl-md">
                          欄位名稱
                        </th>
                        <th className="text-left py-1.5 px-2 font-medium text-red-700">
                          欄位類型
                        </th>
                        <th className="text-left py-1.5 px-2 font-medium text-red-700 rounded-tr-md">
                          說明
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {db.missingFields.map((field, index) => (
                        <tr
                          key={field.name}
                          className={
                            index % 2 === 0 ? "bg-red-50" : "bg-red-100/50"
                          }
                        >
                          <td className="py-2 px-2 font-mono font-medium">
                            {field.name}
                          </td>
                          <td className="py-2 px-2">
                            {db.invalidTypes.find((t) => t.name === field.name)
                              ?.expected || "未知"}
                          </td>
                          <td className="py-2 px-2">{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {hasInvalidTypes && (
                <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <p className="font-medium text-orange-700">欄位類型不符</p>
                  </div>
                  <p className="text-xs text-orange-600 mb-3">
                    以下欄位的類型與系統要求不符，請修改這些欄位的類型。
                  </p>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-orange-100">
                        <th className="text-left py-1.5 px-2 font-medium text-orange-700 rounded-tl-md">
                          欄位名稱
                        </th>
                        <th className="text-left py-1.5 px-2 font-medium text-orange-700">
                          目前類型
                        </th>
                        <th className="text-left py-1.5 px-2 font-medium text-orange-700 rounded-tr-md">
                          需要的類型
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {db.invalidTypes.map((type, index) => (
                        <tr
                          key={type.name}
                          className={
                            index % 2 === 0
                              ? "bg-orange-50"
                              : "bg-orange-100/50"
                          }
                        >
                          <td className="py-2 px-2 font-mono font-medium">
                            {type.name}
                          </td>
                          <td className="py-2 px-2">
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200"
                            >
                              {type.actual}
                            </Badge>
                          </td>
                          <td className="py-2 px-2">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              {type.expected}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-2 text-xs text-orange-600 bg-orange-100/50 p-2 rounded">
                    <span className="font-medium">提示：</span>{" "}
                    修改欄位類型時，可能會導致現有數據丟失。建議先備份您的資料。
                  </div>
                </div>
              )}
            </div>

            {/* 修正後的驗證步驟 */}
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p className="font-medium text-blue-700">完成修改後</p>
              </div>
              <p className="text-xs text-blue-600 mb-2">
                完成上述修改後，請返回此頁面並再次點擊「驗證 Notion
                資料庫」按鈕，系統將重新檢查您的資料庫是否符合要求。
              </p>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
                  onClick={() => window.location.reload()}
                >
                  重新驗證
                </Button>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          <Link
            href={db.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline flex items-center gap-1"
          >
            <span>在 Notion 中查看</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </Link>

          {isValid && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 whitespace-nowrap"
              onClick={() => validateNotionRepos(db.id)}
              disabled={isCurrentlyValidating}
            >
              {isCurrentlyValidating ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-primary mr-1 flex-shrink-0"></div>
                  <span className="truncate">驗證儲存庫選項中...</span>
                </>
              ) : (
                "驗證儲存庫選項"
              )}
            </Button>
          )}
        </div>

        {shouldShowResults && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">儲存庫選項驗證結果</h4>
            <div className="grid grid-cols-1 gap-2">
              {notionRepoOptions.map((repo) => (
                <RepositoryValidationResult key={repo.name} repo={repo} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RepositoryValidationResult({
  repo,
}: RepositoryValidationResultProps) {
  return (
    <div
      className={
        repo.isValid
          ? "p-3 rounded-md bg-green-50 border border-green-200"
          : "p-3 rounded-md bg-red-50 border border-red-200"
      }
    >
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium break-all">{repo.name}</span>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className={
              repo.isValid
                ? "bg-green-50 text-green-700 whitespace-nowrap"
                : "bg-red-50 text-red-700 whitespace-nowrap"
            }
          >
            {repo.isValid ? "有效" : "無效"}
          </Badge>
        </div>
      </div>

      {repo.isValid ? (
        <div className="mt-2 text-sm">
          {repo.description && (
            <p className="text-muted-foreground mb-1 break-words">
              {repo.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {repo.hasIssues && repo.canCreateIssues && repo.canEditIssues && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 whitespace-nowrap"
              >
                可操作 Issues
              </Badge>
            )}
            {repo.url && (
              <Link
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1"
              >
                <span>查看儲存庫</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-red-600 mt-1 break-words">{repo.error}</p>
          {repo.url && (
            <Link
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline flex items-center gap-1 mt-1"
            >
              <span>在 GitHub 中查看</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
