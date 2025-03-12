import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UserInfoCardProps {
  type: "github" | "notion";
  user: {
    name?: string;
    login?: string;
    id?: string | number;
    avatar_url?: string;
    type?: string;
  };
  tokenScopes?: string[] | null;
  isFineGrained?: boolean;
}

export function UserInfoCard({
  type,
  user,
  tokenScopes,
  isFineGrained,
}: UserInfoCardProps) {
  const isGitHub = type === "github";
  const borderColor = isGitHub ? "gray" : "blue";
  const bgColor = isGitHub ? "gray" : "blue";

  return (
    <Card className={`overflow-hidden border-${borderColor}-500 shadow-md`}>
      <div className={`h-1 bg-${borderColor}-500`}></div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="break-words">
            {isGitHub ? "GitHub" : "Notion"} 用戶信息
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 whitespace-nowrap"
          >
            驗證成功
          </Badge>
        </div>
        <CardDescription>
          整合已成功連接到您的 {isGitHub ? "GitHub" : "Notion"} 帳戶
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`p-4 bg-${bgColor}-50/30 rounded-lg border border-${bgColor}-100`}
        >
          <div className="flex items-center gap-3 flex-wrap">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || user.login || "User"}
                className={`w-12 h-12 rounded-full border-2 border-${bgColor}-200 flex-shrink-0`}
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-full bg-${bgColor}-100 flex items-center justify-center text-${bgColor}-700 font-semibold text-lg border-2 border-${bgColor}-200 flex-shrink-0`}
              >
                {(user.name || user.login || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-medium text-lg break-words">
                {user.name || (isGitHub ? user.login : "用戶")}
              </h3>
              {isGitHub && user.login ? (
                <p className="text-sm text-muted-foreground break-all">
                  @{user.login}
                </p>
              ) : (
                user.id && (
                  <p className="text-sm text-muted-foreground break-all">
                    ID:{" "}
                    {typeof user.id === "string" && user.id.length > 10
                      ? `${user.id.substring(0, 8)}...`
                      : user.id}
                  </p>
                )
              )}
            </div>
          </div>

          {(tokenScopes || isFineGrained) && (
            <div className="mt-4 pt-4 border-t border-blue-100">
              <div className="flex flex-wrap items-center gap-2">
                {!isGitHub && user.type && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap"
                  >
                    {user.type === "person" ? "個人用戶" : "機器人"}
                  </Badge>
                )}

                {tokenScopes && tokenScopes.length > 0 && (
                  <>
                    {tokenScopes.map((scope, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`bg-${
                          isGitHub ? "gray" : "purple"
                        }-50 text-${isGitHub ? "gray" : "purple"}-700 border-${
                          isGitHub ? "gray" : "purple"
                        }-200 whitespace-nowrap`}
                      >
                        {scope}
                      </Badge>
                    ))}
                  </>
                )}

                {isFineGrained && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200 whitespace-nowrap"
                  >
                    細粒度權限令牌
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
