require("dotenv").config();
const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");

const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const sizeOf = require("image-size");

/** 関数 */
// リモートファイル（バイナリ）ダウンロード
const dlFile = async (target_url, save_path) => {
  const buf = await axios.get(target_url, {
    responseType: "arraybuffer",
  });
  await fs.writeFile(save_path, new Buffer.from(buf.data), "binary");
};

// 記事データをマークダウンに変換
// const getContent = async (id) => {
//   const mdblocks = await n2m.pageToMarkdown(id);
//   return n2m.toMarkdownString(mdblocks);
// };

module.exports = async () => {
  const notion = new Client({ auth: process.env.NOTION_KEY });
  const n2m = new NotionToMarkdown({ notionClient: notion });

  /*** notion-to-md カスタマイズ ココカラ **************************************************************/
  // Callout => SimpleBox
  n2m.setCustomTransformer("callout", async (block) => {
    const { callout } = block;
    let content = callout.rich_text[0].plain_text.replace("\n", "  \n");
    if (callout.icon?.type == "emoji")
      content = callout.icon.emoji + " " + content;
    return `{% simplebox 'box_stripe' %}${content}{% endsimplebox %}`;
  });
  // "c++" -> "cpp" 置換 (prism.js用)
  n2m.setCustomTransformer("code", async (block) => {
    const { code } = block;
    if (!code?.rich_text) return "";
    let lang = "";
    if (code.language == "c++") lang = "cpp";
    else lang = code.language;
    let r = `\`\`\`${lang}
${code.rich_text[0].plain_text}
\`\`\``;
    return r;
  });
  // WebBookmark
  n2m.setCustomTransformer("bookmark", async (block) => {
    const { bookmark } = block;
    if (!bookmark?.url) return "";
    return `{% bookmark {link:'${bookmark?.url}'} %}`;
  });
  // Image => FloatBox (>200px width)
  n2m.setCustomTransformer("image", async (block) => {
    const { image } = block;
    let str = "";
    let caption = image.caption[0]?.text.content || "";
    if (image.type == "file") {
      let fname = image.file.url.split("?")[0].split("/").pop();
      let fpath = path.join("./src/posts/img", fname);
      await dlFile(image.file.url, fpath);
      const dimensions = sizeOf(fpath);
      if (dimensions.width > 240) {
        str = `{% floatbox {
    img: '${fname}',
    title: '${caption}',
    width: '200px',
    colortheme: 'silver'
  } %}
  <i class="fa-solid fa-magnifying-glass"></i> クリックで拡大
  {% endfloatbox %}`;
      } else {
        str = `{% centerimg {img: '${fname}', width: '${dimensions.width}px', height: '${dimensions.height}px'} %}${caption}{% endcenterimg %}`;
      }
    } else if (image.type == "external") {
      // Direct link
      str = `![${caption}](${image.external.url} "${caption}")`;
    }
    return str;
  });
  /*** Customize notion-to-md END ***************************************************************/

  // 状態が Ready の記事を取得
  const databaseId = process.env.NOTION_BLOG_ID;
  const db = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Status",
      status: { equals: process.env.STATUS_READY },
    },
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });

  // 取得したデータをリマップ
  const posts = db.results.map((result) => ({
    id: result.id,
    title: result.properties["Title"]?.title.pop()?.plain_text || undefined,
    tags: result.properties["Tags"]?.multi_select || undefined,
    date: result.properties["Date"]?.date?.start || undefined,
    desc:
      result.properties["Description"]?.rich_text.pop()?.plain_text ||
      undefined,
    thumb: result.properties["Thumb"]?.files[0] || undefined,
    slug: result.properties["Slug"]?.url || undefined,
    created: result.created_time,
  }));

  // フロントマター部
  for (const page of posts) {
    let front_matter = "---\n";
    if (page.title !== undefined) front_matter += `title: "${page.title}"\n`;
    if (page.desc !== undefined)
      front_matter += `description: "${page.desc}"\n`;
    if (page.date === undefined) {
      let c = page.created.substr(0, 10);
      front_matter += `date: ${c}\n`;
      // notionに反映：Dateが未設定の場合、初回デプロイの日付とする
      await notion.pages.update({
        page_id: page.id,
        properties: {
          Date: {
            date: {
              start: c,
            },
          },
        },
      });
    } else front_matter += `date: ${page.date}\n`;
    if (page.thumb !== undefined && page.thumb.file !== undefined) {
      await dlFile(
        // Download thumb file
        page.thumb.file.url,
        path.join("./src/posts/img", page.thumb.name)
      );
      front_matter += `thumb: "${page.thumb.name}"\n`;
    }
    if (page.tags !== undefined) {
      front_matter += `tags: \n`;
      let tagstr = "";
      for (const tag of page.tags) {
        tagstr += `  - ${tag.name}\n`;
      }
    }
    front_matter += `---\n`;

    // 本文をマークダウン変換して保存
    // let content = await getContent(page.id);
    let content = n2m.toMarkdownString(await n2m.pageToMarkdown(page.id));
  
    // Save to file
    let fbase;
    if (page.slug === undefined) fbase = page.created.substr(0, 10);
    else fbase = page.slug;
    try {
      await fs.writeFile(
        path.join("./src/posts", fbase + ".md"),
        front_matter + content.parent
      );
    } catch (e) {
      console.log(e);
    }

    // Update status to Published
    await notion.pages.update({
      page_id: page.id,
      properties: {
        Status: {
          status: {
            name: process.env.STATUS_PUBLISHED,
          },
        },
      },
    });

    //   // Print block list in page
    //   const response = await notion.blocks.children.list({
    //     block_id: page.id,
    //     page_size: 50,
    //   });
    //   console.log(JSON.stringify(response));
  }
  // }
  return;
};
