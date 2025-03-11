import { NextReques, NextResponse } from "next/server";

import { Client } from "@notionhq/client";

const db_id = "0e443faaa8f04548922008ef00e98daa";
const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

export async function GET(request: NextRequest, response: NextResponse) {
  const res = await notion.databases.query({
    database_id: db_id,
  });
  //   console.log(res.results);
  return NextResponse.json(res);
}

export async function POST(request: NextRequest, response: NextResponse) {
  const issue = await request.json();
  console.log(issue);
  const res = await notion.databases.query({
    database_id: db_id,
  });
  const issueList = res.results.map((page) => {
    return {
      id: page.id,
      title: page.properties.title.title[0].plain_text,
    };
  });
  const page = issueList.find((page) => page.title === issue.title);
  if (page) {
    const updatePage = await notion.pages.update({
      page_id: page.id,
      properties: {
        body: {
          rich_text: [
            {
              text: {
                content: issue.description,
              },
            },
          ],
        },
        label: {
          multi_select: issue.labels.map((l: string) => {
            return {
              name: l,
            };
          }),
        },
      },
    });
    return NextResponse.json(
      `${issue.title} 已更新到 Notion: ${updatePage.url}`
    );
  }
  // find database id
  const newPage = await notion.pages.create({
    parent: {
      database_id: db_id,
    },
    properties: {
      title: {
        title: [
          {
            text: {
              content: issue.title,
            },
          },
        ],
      },
      body: {
        rich_text: [
          {
            text: {
              content: issue.description,
            },
          },
        ],
      },
      label: {
        multi_select: issue.labels.map((l: string) => {
          return {
            name: l,
          };
        }),
      },
    },
  });
  console.log(newPage);
  return NextResponse.json(`${issue.title} 已新增至 Notion: ${newPage.url}`);
}
