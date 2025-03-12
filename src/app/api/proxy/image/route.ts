import { NextResponse } from "next/server";
import { notionClient } from "@/lib/client/notionClient";
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
    const block = await notionClient.blocks.retrieve({ block_id: blockId });

    if (!isFullBlock(block)) {
      return NextResponse.json(
        { error: "無法獲取完整區塊資訊" },
        { status: 400 }
      );
    }

    // 檢查區塊類型是否為圖片
    if (block.type !== "image") {
      return NextResponse.json(
        { error: "指定的區塊不是圖片類型" },
        { status: 400 }
      );
    }

    // 獲取圖片 URL
    let imageUrl = "";
    if (block.image.type === "external") {
      imageUrl = block.image.external.url;
    } else {
      imageUrl = block.image.file.url;
    }

    // 獲取圖片內容
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return NextResponse.json({ error: "無法獲取圖片內容" }, { status: 500 });
    }

    // 獲取圖片的 Content-Type
    const contentType =
      imageResponse.headers.get("content-type") || "image/jpeg";

    // 獲取圖片的二進制數據
    const imageBuffer = await imageResponse.arrayBuffer();

    // 創建新的 Response 並設置適當的 headers
    const response = new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // 快取 24 小時
      },
    });

    return response;
  } catch (error) {
    console.error("圖片代理 API 錯誤:", error);
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
    const block = await notionClient.blocks.retrieve({ block_id });

    if (!isFullBlock(block)) {
      return NextResponse.json(
        { error: "無法獲取完整區塊資訊" },
        { status: 400 }
      );
    }

    // 檢查區塊類型是否為圖片
    if (block.type !== "image") {
      return NextResponse.json(
        { error: "指定的區塊不是圖片類型" },
        { status: 400 }
      );
    }

    // 獲取圖片 URL
    let imageUrl = "";
    if (block.image.type === "external") {
      imageUrl = block.image.external.url;
    } else {
      imageUrl = block.image.file.url;
    }

    // 返回圖片 URL
    return NextResponse.json({
      url: `/api/proxy/image?block_id=${block_id}`,
      originalUrl: imageUrl,
    });
  } catch (error) {
    console.error("圖片代理 API 錯誤:", error);
    return NextResponse.json({ error: "處理請求時發生錯誤" }, { status: 500 });
  }
}
