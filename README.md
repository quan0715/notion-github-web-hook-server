# Notion-GitHub Webhook 伺服器

這個專案是一個連接 Notion 和 GitHub 的 Webhook 伺服器，可以讓你在 Notion 資料庫中建立和管理 GitHub Issues。當 Notion 資料庫中的項目更新時，系統會自動在 GitHub 上建立或更新對應的 Issue。

## 功能特色

- 🔄 雙向同步：Notion 資料庫與 GitHub Issues 之間的雙向同步
- 📝 自動建立：從 Notion 資料庫項目自動建立 GitHub Issues
- 🔔 狀態更新：當 GitHub Issue 狀態變更時，自動更新 Notion 中的狀態
- 📊 日誌記錄：在 Notion 頁面中記錄所有操作的日誌
- 🖼️ 圖片代理：處理 Notion 中的圖片和檔案，避免 URL 過期問題

## 前置需求

- [Node.js](https://nodejs.org/) 18.0.0 或更高版本
- [Notion](https://www.notion.so/) 帳號和工作區
- [GitHub](https://github.com/) 帳號和儲存庫
- [Vercel](https://vercel.com/) 帳號（用於部署）

## 設定指南

### 1. 設定 Notion API

1. 前往 [Notion 開發者頁面](https://www.notion.so/my-integrations)
2. 點擊「+ 新增整合」按鈕
3. 填寫整合的基本資訊：
   - 名稱：例如「GitHub Issue 同步器」
   - 關聯工作區：選擇你要使用的工作區
   - Logo：可選
4. 在「功能」區域中，確保勾選以下權限：
   - 讀取內容
   - 更新內容
   - 插入內容
5. 點擊「提交」按鈕
6. 複製生成的「Internal Integration Token」（這將是你的 `NOTION_SECRET`）

接著，你需要在 Notion 中建立一個資料庫，並將你的整合添加到該資料庫：

1. 在 Notion 中建立一個新的資料庫（或使用現有的）
2. 確保資料庫包含以下屬性：
   - Issue Title（標題）
   - Issue Body（內容）
   - Issue Tag（標籤）
   - Repository（儲存庫）- 多選類型
   - Status（狀態）- 狀態類型
   - Issue Link（連結）- URL 類型
3. 在資料庫頁面的右上角，點擊「...」，然後選擇「新增連接」
4. 找到並選擇你剛才創建的整合
5. 複製資料庫的 ID（在資料庫 URL 中，格式為 `https://www.notion.so/xxx?v=yyy`，其中 `xxx` 是資料庫 ID）

### 2. 設定 GitHub API

1. 前往 [GitHub 開發者設定](https://github.com/settings/developers)
2. 點擊「OAuth Apps」標籤，然後點擊「New OAuth App」
3. 填寫應用程式的基本資訊：
   - Application name：例如「Notion Issue Sync」
   - Homepage URL：你的應用程式 URL（可以暫時填寫 `http://localhost:3000`）
   - Authorization callback URL：你的回調 URL（可以暫時填寫 `http://localhost:3000/api/auth/callback`）
4. 點擊「Register application」按鈕
5. 在下一個頁面，點擊「Generate a new client secret」
6. 複製「Client ID」和「Client Secret」（這將是你的 `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET`）

接著，你需要生成一個個人訪問令牌（Personal Access Token）：

1. 前往 [GitHub 個人訪問令牌設定](https://github.com/settings/tokens)
2. 點擊「Generate new token」，然後選擇「Generate new token (classic)」
3. 填寫令牌的基本資訊：
   - Note：例如「Notion Issue Sync」
   - Expiration：根據需要選擇過期時間
   - Scopes：勾選 `repo` 範圍（這將允許訪問儲存庫）
4. 點擊「Generate token」按鈕
5. 複製生成的令牌（這將是你的 `GITHUB_TOKEN`）

### 3. 本地開發設定

1. 複製本專案：

```bash
git clone https://github.com/yourusername/web_hook_server.git
cd web_hook_server
```

2. 安裝依賴：

```bash
npm install
```

3. 創建 `.env.local` 檔案，並添加以下環境變數：

```
NOTION_SECRET=你的_Notion_整合令牌
GITHUB_TOKEN=你的_GitHub_個人訪問令牌
GITHUB_CLIENT_ID=你的_GitHub_OAuth_應用程式_ID
GITHUB_CLIENT_SECRET=你的_GitHub_OAuth_應用程式密鑰
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. 更新 `src/lib/config/notionConfig.ts` 檔案，設定你的 Notion 資料庫欄位和允許的儲存庫：

```typescript
export const NOTION_FIELDS: NotionIssueConfig = {
  fields: {
    ISSUE_TITLE: "Issue Title",
    ISSUE_BODY: "Issue Body",
    ISSUE_TAG: "Issue Tag",
    ISSUE_LINK: "Issue Link",
    REPOS: "Repository",
    STATUS: "Status",
    FILES: "Files",
  },
  STATUS_VALUES: {
    UPDATING: "更新中",
    CREATING: "建立中",
    OPEN: "Issue 開啟中",
    CLOSED: "Issue 關閉中",
    ERROR: "錯誤",
    WEBHOOK_ERROR: "Webhook 異常",
  },
  ALLOWED_REPOS: [
    {
      owner: "你的GitHub用戶名",
      repo: "你的儲存庫名稱",
    },
    // 可以添加更多儲存庫
  ],
};
```

5. 啟動開發伺服器：

```bash
npm run dev
```

6. 使用 [ngrok](https://ngrok.com/) 或 [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) 將本地伺服器暴露到公網：

```bash
# 使用 ngrok
ngrok http 3000

# 或使用 Cloudflare Tunnel
cloudflared tunnel --url http://localhost:3000
```

7. 複製生成的公開 URL，並在 GitHub 儲存庫中設定 Webhook：
   - 前往你的 GitHub 儲存庫
   - 點擊「Settings」>「Webhooks」>「Add webhook」
   - Payload URL：`你的公開URL/api/webhook`
   - Content type：`application/json`
   - 勾選「Let me select individual events」，然後選擇「Issues」和「Issue comments」
   - 點擊「Add webhook」按鈕

### 4. 部署到 Vercel

1. 在 [Vercel](https://vercel.com/) 上創建一個帳號（如果還沒有）
2. 安裝 [Vercel CLI](https://vercel.com/cli)：

```bash
npm install -g vercel
```

3. 登入 Vercel：

```bash
vercel login
```

4. 在專案根目錄中執行：

```bash
vercel
```

5. 按照提示完成部署設定：

   - 設定專案名稱
   - 選擇你的 Vercel 團隊或個人帳號
   - 確認專案設定

6. 部署完成後，在 Vercel 儀表板中設定環境變數：

   - 前往你的專案設定
   - 點擊「Environment Variables」
   - 添加與 `.env.local` 檔案中相同的環境變數
   - 將 `NEXT_PUBLIC_BASE_URL` 設定為你的 Vercel 部署 URL

7. 重新部署專案以應用環境變數：

```bash
vercel --prod
```

8. 更新 GitHub Webhook 的 Payload URL 為你的 Vercel 部署 URL + `/api/webhook`

## 使用指南

### 在 Notion 中建立 Issue

1. 在你的 Notion 資料庫中建立一個新項目
2. 填寫 Issue 標題和內容
3. 選擇目標儲存庫（在 Repository 欄位中）
4. 系統將自動在 GitHub 上建立對應的 Issue，並更新 Notion 中的 Issue Link 和 Status

### 從 GitHub 同步更新

當 GitHub Issue 狀態變更時（例如關閉或重新開啟），Webhook 將自動更新 Notion 中的狀態。

### 查看操作日誌

每個 Notion 頁面頂部都有一個「Webhook Log」區塊，記錄了所有與該頁面相關的操作。

## 故障排除

### Webhook 沒有觸發

1. 檢查 GitHub Webhook 設定是否正確
2. 確認 Vercel 環境變數是否正確設定
3. 查看 Vercel 日誌以獲取更多資訊

### Notion API 錯誤

1. 確認 `NOTION_SECRET` 是否正確
2. 檢查整合是否已添加到資料庫
3. 確認資料庫結構是否符合設定

### GitHub API 錯誤

1. 確認 `GITHUB_TOKEN` 是否有效
2. 檢查令牌是否具有正確的權限
3. 確認 `ALLOWED_REPOS` 設定是否正確

## 進階設定

### 自訂 Notion 欄位

你可以在 `src/lib/config/notionConfig.ts` 中自訂 Notion 資料庫的欄位名稱。

### 添加更多儲存庫

在 `src/lib/config/notionConfig.ts` 的 `ALLOWED_REPOS` 陣列中添加更多儲存庫設定。

### 自訂日誌格式

你可以在 `src/lib/client/notionLog.ts` 中自訂日誌的格式和行為。

## 貢獻指南

歡迎提交 Pull Request 或開 Issue 來改進這個專案！

## 授權

本專案採用 MIT 授權。

---

希望這個 README 能幫助你快速上手這個 Notion-GitHub Webhook 伺服器！如有任何問題，請隨時開 Issue 或聯繫我們。
