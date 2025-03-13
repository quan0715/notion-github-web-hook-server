"use client";

import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  XCircle,
  GitBranch,
  GitGraph,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  NotionDatabaseValidateResponse,
  NotionRepoOption,
  SimilarField,
} from "@/types";

interface NotionDatabaseCardProps {
  db: NotionDatabaseValidateResponse;
}

interface RepositoryValidationResultProps {
  repo: {
    name: string;
    isValid: boolean;
    private?: boolean;
    description?: string;
    permission?: string;
    hasIssues?: boolean;
    canCreateIssues?: boolean;
    canEditIssues?: boolean;
    url?: string;
    error?: string;
  };
}

export function NotionDatabaseCard({ db }: NotionDatabaseCardProps) {
  const isCurrentlyValidating = true;
  const hasValidationResults = true;
  const shouldShowResults = hasValidationResults;
  console.log(db);
  // 計算驗證狀態摘要
  const hasMissingFields = db.missingFields.length > 0;
  const hasInvalidTypes = db.invalidTypes.length > 0;
  const isValid = !hasMissingFields && !hasInvalidTypes;

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

        {/* 資料庫結構驗證結果 */}
        {db && (
          <div className="space-y-4">
            {/* 驗證狀態摘要 */}
            <div className="rounded-md border p-4">
              <div className="flex items-center gap-3">
                {isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <h3 className="text-lg font-semibold">
                  {isValid ? "資料庫結構驗證通過" : "資料庫結構驗證失敗"}
                </h3>
              </div>

              {!isValid && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>您的 Notion 資料庫需要進行以下修改：</p>
                  <ul className="ml-5 mt-1 list-disc">
                    {hasMissingFields && (
                      <li>新增缺少的欄位 ({db.missingFields.length} 個)</li>
                    )}
                    {hasInvalidTypes && (
                      <li>修正欄位類型不匹配 ({db.invalidTypes.length} 個)</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* 儲存庫選項驗證 */}
            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">儲存庫選項驗證</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isValid && (
          <>
            {/* 欄位問題詳細說明 */}
            <div className="space-y-4 my-4">
              {hasMissingFields && (
                <div className="p-3 bg-red-50 rounded-md border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <p className="font-medium text-red-700">缺少必要欄位</p>
                  </div>
                  <p className="text-xs text-red-600 mb-3">
                    您的資料庫缺少以下必要欄位，請添加這些欄位並確保名稱和類型完全符合要求。
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="bg-red-100 text-red-700">
                          欄位名稱
                        </TableHead>
                        <TableHead className="bg-red-100 text-red-700">
                          欄位類型
                        </TableHead>
                        <TableHead className="bg-red-100 text-red-700">
                          說明
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {db.missingFields.map((field, index) => (
                        <TableRow
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-red-50" : "bg-red-100/50"
                          }
                        >
                          <TableCell className="font-mono font-medium">
                            {typeof field === "string"
                              ? field
                              : field.fieldName}
                          </TableCell>
                          <TableCell>{field.expectedType}</TableCell>
                          <TableCell>
                            {typeof field === "string" ? "" : field.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="bg-orange-100 text-orange-700">
                          欄位名稱
                        </TableHead>
                        <TableHead className="bg-orange-100 text-orange-700">
                          目前類型
                        </TableHead>
                        <TableHead className="bg-orange-100 text-orange-700">
                          需要的類型
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {db.invalidTypes.map((type, index) => (
                        <TableRow
                          key={index}
                          className={
                            index % 2 === 0
                              ? "bg-orange-50"
                              : "bg-orange-100/50"
                          }
                        >
                          <TableCell className="font-mono font-medium">
                            {type.fieldName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200"
                            >
                              {type.actual}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              {type.expected}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* 修正後的驗證步驟 */}
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p className="font-medium text-blue-700">完成修改後</p>
              </div>
              <p className="text-xs text-blue-600 mb-2">
                完成上述修改後，請返回此頁面並再次點擊「驗證 Notion
                資料庫」按鈕，系統將重新檢查您的資料庫是否符合要求。
              </p>
              <div className="flex justify-end">
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
        </div>

        {/* 顯示儲存庫選項 */}
      </CardContent>
    </Card>
  );
}

// export function RepositoryValidationResult({
//   repo,
// }: RepositoryValidationResultProps) {
//   return (
//     <div
//       className={
//         repo.valid
//           ? "p-3 rounded-md bg-green-50 border border-green-200"
//           : "p-3 rounded-md bg-red-50 border border-red-200"
//       }
//     >
//       <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <span className="font-medium break-all">{repo.name}</span>
//         </div>
//         <div className="flex gap-2">
//           <Badge
//             variant="outline"
//             className={
//               repo.valid
//                 ? "bg-green-50 text-green-700 whitespace-nowrap"
//                 : "bg-red-50 text-red-700 whitespace-nowrap"
//             }
//           >
//             {repo.valid ? "有效" : "無效"}
//           </Badge>
//           {repo.private && (
//             <Badge
//               variant="outline"
//               className="bg-yellow-50 text-yellow-700 whitespace-nowrap"
//             >
//               私有
//             </Badge>
//           )}
//           {!repo.private && repo.valid && (
//             <Badge
//               variant="outline"
//               className="bg-blue-50 text-blue-700 whitespace-nowrap"
//             >
//               公開
//             </Badge>
//           )}
//         </div>
//       </div>

//       {repo.valid ? (
//         <div className="mt-2 text-sm">
//           {repo.description && (
//             <p className="text-muted-foreground mb-1 break-words">
//               {repo.description}
//             </p>
//           )}
//           <div className="flex flex-wrap items-center gap-2 mt-1">
//             {repo.permission && (
//               <Badge
//                 variant="outline"
//                 className="bg-purple-50 text-purple-700 whitespace-nowrap"
//               >
//                 {repo.permission === "admin" ? "管理員權限" : "寫入權限"}
//               </Badge>
//             )}
//             {repo.hasIssues && repo.canCreateIssues && repo.canEditIssues && (
//               <Badge
//                 variant="outline"
//                 className="bg-green-50 text-green-700 whitespace-nowrap"
//               >
//                 可操作 Issues
//               </Badge>
//             )}
//             {repo.url && (
//               <Link
//                 href={repo.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-500 hover:underline flex items-center gap-1"
//               >
//                 <span>查看儲存庫</span>
//                 <ExternalLink className="w-3 h-3 flex-shrink-0" />
//               </Link>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div>
//           <p className="text-sm text-red-600 mt-1 break-words">{repo.error}</p>
//           {repo.url && (
//             <Link
//               href={repo.url}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-sm text-blue-500 hover:underline flex items-center gap-1 mt-1"
//             >
//               <span>在 GitHub 中查看</span>
//               <ExternalLink className="w-3 h-3 flex-shrink-0" />
//             </Link>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
