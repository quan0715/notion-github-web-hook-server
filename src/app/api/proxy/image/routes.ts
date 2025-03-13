import { NextRequest, NextResponse } from "next/server";
import { NotionClient } from "@/lib/client/NotionClient";
import { isFullBlock } from "@notionhq/client";
import { ImageBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export async function GET(request: NextRequest) {
  try {
    const blockId = request.nextUrl.searchParams.get("block_id");

    if (!blockId) {
      return NextResponse.json(
        { error: "缺少必要參數 block_id" },
        { status: 400 }
      );
    }

    const block = await NotionClient.blocks.retrieve({
      block_id: blockId,
    });

    if (!isFullBlock(block)) {
      return NextResponse.json(
        { error: "找不到指定的圖片區塊" },
        { status: 404 }
      );
    }
    const imageBlock = block as ImageBlockObjectResponse;
    const imageUrl =
      imageBlock.image.type === "external"
        ? imageBlock.image.external.url
        : imageBlock.image.file.url;

    const imageResponse = await fetch(imageUrl);
    const imageData = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get("content-type");

    return new NextResponse(imageData, {
      headers: {
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("圖片代理錯誤:", error);
    return NextResponse.json(
      { error: "處理圖片請求時發生錯誤" },
      { status: 500 }
    );
  }
}
