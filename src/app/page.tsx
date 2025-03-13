import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnvCheckCard } from "@/components/EnvCheckCard";
import { GitHubApiCard } from "@/components/GitHubApiCard";
import { NotionApiCard } from "@/components/NotionApiCard";
import { NotionDatabaseCheckCard } from "@/components/NotionDatabaseCheckCard";
import { DashboardSummary } from "@/components/DashboardSummary";
import { NotionDbIdParser } from "@/components/NotionDbIdParser";

export default function Home() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">儀表板</TabsTrigger>
          <TabsTrigger value="docs">API 文檔</TabsTrigger>
          <TabsTrigger value="db-parser">解析 DB ID</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardSummary />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnvCheckCard />
            <NotionDatabaseCheckCard />
            <GitHubApiCard />
            <NotionApiCard />
          </div>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>API 文檔</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ApiDocCard
                  title="GitHub API"
                  description="GitHub REST API 文檔"
                  url="https://docs.github.com/en/rest"
                />
                <ApiDocCard
                  title="Notion API"
                  description="Notion API 文檔"
                  url="https://developers.notion.com/reference/intro"
                />
                <ApiDocCard
                  title="Octokit.js"
                  description="GitHub REST API 的 JavaScript 客戶端"
                  url="https://github.com/octokit/octokit.js"
                />
                <ApiDocCard
                  title="Notion SDK"
                  description="Notion API 的 JavaScript 客戶端"
                  url="https://github.com/makenotion/notion-sdk-js"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="db-parser">
          <NotionDbIdParser />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// API 文檔卡片元件
function ApiDocCard({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </a>
  );
}
