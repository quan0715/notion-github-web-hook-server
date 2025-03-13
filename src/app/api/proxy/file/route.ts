import { NextResponse } from "next/server";
import { NotionClient } from "@/lib/server/NotionClient";
import { isFullBlock } from "@notionhq/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get("block_id");

    if (!blockId) {
      return NextResponse.json(
        { error: "缺少必要參數 block_id" },
        { status: 400 }
      );
    }

    // 從 Notion 獲取區塊資訊
    const block = await NotionClient.blocks.retrieve({ block_id: blockId });

    if (!isFullBlock(block)) {
      return NextResponse.json(
        { error: "無法獲取完整區塊資訊" },
        { status: 400 }
      );
    }

    // 檢查區塊類型是否為檔案
    if (block.type !== "file" && block.type !== "pdf") {
      return NextResponse.json(
        { error: "指定的區塊不是檔案類型" },
        { status: 400 }
      );
    }

    // 獲取檔案 URL
    let fileUrl = "";
    let fileName = "";

    if (block.type === "file") {
      if (block.file.type === "external") {
        fileUrl = block.file.external.url;
      } else {
        fileUrl = block.file.file.url;
      }
      // 嘗試從 URL 中提取檔案名稱
      fileName = fileUrl.split("/").pop() || `notion-file-${blockId}`;
    } else if (block.type === "pdf") {
      if (block.pdf.type === "external") {
        fileUrl = block.pdf.external.url;
      } else {
        fileUrl = block.pdf.file.url;
      }
      fileName = fileUrl.split("/").pop() || `notion-pdf-${blockId}`;
    }

    // 獲取檔案內容
    const fileResponse = await fetch(fileUrl);

    if (!fileResponse.ok) {
      return NextResponse.json({ error: "無法獲取檔案內容" }, { status: 500 });
    }

    // 獲取檔案的 Content-Type
    const contentType =
      fileResponse.headers.get("content-type") || "application/octet-stream";

    // 獲取檔案的二進制數據
    const fileBuffer = await fileResponse.arrayBuffer();

    // 創建新的 Response 並設置適當的 headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "public, max-age=86400", // 快取 24 小時
      },
    });

    return response;
  } catch (error) {
    console.error("檔案代理 API 錯誤:", error);
    return NextResponse.json({ error: "處理請求時發生錯誤" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { block_id } = body;

    if (!block_id) {
      return NextResponse.json(
        { error: "缺少必要參數 block_id" },
        { status: 400 }
      );
    }

    // 從 Notion 獲取區塊資訊
    const block = await NotionClient.blocks.retrieve({ block_id });

    if (!isFullBlock(block)) {
      return NextResponse.json(
        { error: "無法獲取完整區塊資訊" },
        { status: 400 }
      );
    }

    // 檢查區塊類型是否為檔案
    if (block.type !== "file" && block.type !== "pdf") {
      return NextResponse.json(
        { error: "指定的區塊不是檔案類型" },
        { status: 400 }
      );
    }

    // 獲取檔案 URL
    let fileUrl = "";
    let fileName = "";

    if (block.type === "file") {
      if (block.file.type === "external") {
        fileUrl = block.file.external.url;
      } else {
        fileUrl = block.file.file.url;
      }
      // 嘗試從 URL 中提取檔案名稱
      fileName = fileUrl.split("/").pop() || `notion-file-${block_id}`;
    } else if (block.type === "pdf") {
      if (block.pdf.type === "external") {
        fileUrl = block.pdf.external.url;
      } else {
        fileUrl = block.pdf.file.url;
      }
      fileName = fileUrl.split("/").pop() || `notion-pdf-${block_id}`;
    }

    // 返回檔案 URL 和名稱
    return NextResponse.json({
      url: `/api/proxy/file?block_id=${block_id}`,
      fileName,
      originalUrl: fileUrl,
    });
  } catch (error) {
    console.error("檔案代理 API 錯誤:", error);
    return NextResponse.json({ error: "處理請求時發生錯誤" }, { status: 500 });
  }
}
