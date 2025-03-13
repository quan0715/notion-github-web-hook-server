"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshButton } from "./RefreshButton";
import { ValidationResult } from "@/types";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { validateEnv } from "@/app/_actions/ValidateAction";
import { cn } from "@/lib/utils";
const EnvVarItem = ({
  name,
  description,
  isSet,
}: {
  name: string;
  description: string;
  isSet: boolean;
}) => (
  <div className={cn("flex items-center space-x-2 text-sm p-1.5 rounded-md")}>
    <div
      className={cn(
        "w-1 h-10 bg-gray-200 rounded-md",
        isSet ? "bg-green-500" : "bg-red-500"
      )}
    ></div>
    <div className="flex-1 flex flex-col">
      <span className="font-semibold">{name}</span>
      <span className={`text-xs`}>{description}</span>
    </div>
    <div
      className={cn(
        "flex flex-row items-center space-x-2 rounded-xl p-2 border",
        isSet
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      )}
    >
      <span className={cn("text-xs font-semibold")}>
        {isSet ? "已設置" : "未設置"}
      </span>
      {isSet ? (
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 flex-shrink-0" />
      )}
    </div>
  </div>
);

export function EnvCheckCard() {
  const [validationResult, setValidationResult] = useState<
    | (ValidationResult & {
        details?: {
          envVarsInfo: Array<{
            name: string;
            description: string;
            isSet: boolean;
          }>;
        };
      })
    | null
  >(null);

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const response = await validateEnv();
    setValidationResult(response);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const allEnvVars = validationResult?.details?.envVarsInfo || [];
  const missingCount = allEnvVars.filter(
    (env: { isSet: boolean }) => !env.isSet
  ).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">環境變數檢查</CardTitle>
        <RefreshButton onRefresh={handleRefresh} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div
              className={`p-3 rounded-md border mb-4 ${
                validationResult?.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {validationResult?.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <p
                    className={`font-medium ${
                      validationResult?.success
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {validationResult?.success
                      ? "所有環境變數已設置"
                      : `環境變數缺失數量 (${missingCount})`}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      validationResult?.success
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {validationResult?.success
                      ? "所有必要的環境變數已正確設置，您可以繼續進行下一步驗證。"
                      : "請設置以下標記為缺失的環境變數。"}
                  </p>
                </div>
              </div>
            </div>
            <div className="">
              {allEnvVars.map(
                (
                  envVar: {
                    name: string;
                    description: string;
                    isSet: boolean;
                  },
                  index: number
                ) => (
                  <EnvVarItem
                    key={index}
                    name={envVar.name}
                    description={envVar.description}
                    isSet={envVar.isSet}
                  />
                )
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
