module.exports = (config) => {
  config.addPassthroughCopy('src/assets/img/**/*');
  config.addPassthroughCopy({ 'src/posts/img/**/*': 'assets/img/' });

  config.addWatchTarget("src/assets/js/");

  config.addLayoutAlias('default', 'layouts/default.njk');
  config.addLayoutAlias('post', 'layouts/post.njk');

  config.addFilter('readableDate', require('./lib/filters/readableDate'));
  config.addFilter('minifyJs', require('./lib/filters/minifyJs'));

  config.addTransform('minifyHtml', require('./lib/transforms/minifyHtml'));

  config.addCollection('posts', require('./lib/collections/posts'));
  config.addCollection('tagList', require('./lib/collections/tagList'));
  config.addCollection('pagedPosts', require('./lib/collections/pagedPosts'));
  config.addCollection('pagedPostsByTag', require('./lib/collections/pagedPostsByTag'));

  /** MIYAO.APP 追加コード ココカラ */

  // Floatbox
  config.addPassthroughCopy("src/assets/floatbox/**/*");
  // Prism.js
  config.addPassthroughCopy("src/assets/prism/**/*");
  // PageFind
  const { execSync, spawn } = require("child_process");
  config.on("eleventy.after", () => {
    execSync(`npx -y pagefind --site dist`, { encoding: "utf-8" });
  });
  // Notion から記事を取得
  config.on("eleventy.before", async () => {
    const n2e = require("./n2e");
    await n2e();
  });

  //** ショートコード */
  const md = require("markdown-it")({ html: true });
  const axios = require("axios");
  const metascraper = require("metascraper")([
    require("metascraper-description")(),
    require("metascraper-image")(),
    require("metascraper-logo")(),
    require("metascraper-logo-favicon")(),
    require("metascraper-publisher")(),
    require("metascraper-title")(),
    require("metascraper-url")(),
  ]);
  // 単純なボックス
  config.addPairedShortcode("simplebox", (content, cls) => {
    content = md.renderInline(content);
    return `<div class="max-w-4xl m-[24px] px-[2em] py-[1em] rounded-sm ml-auto mr-auto strp"><p class="mt-0 mb-0 -indent-[1.2em]">${content}</p></div>`;
  });
  // ウェブブックマーク
  config.addAsyncShortcode("bookmark", async (conf) => {
    try {
      var response = await axios.get(conf.link);
    } catch (error) {
      console.error("MyTryCatchError: " + error);
      return "<p>404</p>";
    }
    const url = response.request.res.responseUrl;
    const html = response.data;
    const host = response.request.host;

    const metadata = await metascraper({ html, url });

    return `
    <div class="max-w-2xl mx-auto">
    <a href="${metadata.url}" target="_blank" class="rounded-xl no-underline">
    <div class="hover:opacity-90 hover:bg-gray-50 flex gap-3 bg-white border border-gray-300 rounded-xl overflow-hidden items-center justify-start">
        <div class="flex flex-col gap-2 py-2 ml-4">
            <p class="max-h-[1.5rem] overflow-hidden mt-0 mb-0 text-lg font-bold text-sky-700">${metadata.title}</p>
            ${metadata.description
                ? `<p class="mt-0 mb-0 text-gray-500 text-sm max-h-[2.5rem] overflow-hidden">${metadata.description}</p>`
                : "No Description"
            }
            <span class="flex items-center justify-start text-gray-500">
            ${metadata.logo
                ? `<img loading="lazy" class="mt-0 mb-0 mr-1 max-w-[1rem]" src="${metadata.logo}">`
                : `<svg class="w-4 h-4 mr-1 mt-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"></path>
                </svg>`
            }${metadata.publisher
                    ? `${metadata.publisher}`
                    : `${host}`
                }
            </span>
        </div>
      <div class="relative w-32 h-32 flex-shrink-0 mr-0 ml-auto">
        ${metadata.image
            ? `<img class="mt-0 mb-0 absolute left-0 top-0 w-full h-full object-cover object-center transition duration-50" loading="lazy" src="${metadata.image}">`
            : ``
        }
        </div>
    </div>
</a></div>`;
  });

  // FloatBox
  config.addPairedShortcode("floatbox", (content, conf) => {
    content = md.renderInline(content);
    w = conf.width ? conf.width : "auto";
    return `<figure style="max-width: ${w}; margin: 0 auto;"><div class="floatbox"
    data-fb-options="colorTheme:${
      conf.colortheme ? conf.colortheme : "silver"
    }" style="width: 100%;">
    <a href="/assets/img/${conf.img}" title="${
      conf.title ? conf.title : ""
    }"><img loading="lazy" src="/assets/img/${
      conf.img
    }" style="width: 100%;"></a></div>
    <figcaption class="text-center">${content}</figcaption>
    </figure>`;
  });
  // キャプション付きセンタリング画像
  config.addPairedShortcode("centerimg", (content, conf) => {
    content = md.renderInline(content);
    return `<figure class="center"><img loading="lazy" src="/assets/img/${conf.img}" width="${conf.width}" height="${conf.height}" alt="${content}" title="${content}">
<figcaption>${content}</figcaption>
</figure>`;
  });
  
  // 現在の年(footerで使用)
  config.addShortcode("year", () => `${new Date().getFullYear()}`);


  // 吹き出し
  // 話者アイコン（左）
  config.addShortcode("talkicon_l", function (conf) {
    return `<div class="balloon">
  <div class="faceicon">
    <img src="/assets/img/${conf.img}">
   <p>${conf.name ? conf.name : ""}</p>
  </div>`;
  });
  //吹き出し（左）
  config.addPairedShortcode("says_l", function (content) {
    content = md.renderInline(content);
    return `<div class="chatting">
<div class="says">${content}</div>
</div>
</div>`;
  });
  //話者アイコン（右）
  config.addShortcode("talkicon_r", function (conf) {
    return `<div class="balloon_right">
<div class="faceicon_right">
   <img src="/assets/img/${conf.img}">
   <p>${conf.name ? conf.name : ""}</p>
 </div>`;
  });
  //吹き出し（右）
  config.addPairedShortcode("says_r", function (content) {
    content = md.renderInline(content);
    return `<div class="chatting">
<div class="says_right"><p>${content}</p></div>
</div>
</div>`;
  });
  // 考える吹き出し
  config.addPairedShortcode("think_l", (content) => {
    content = md.renderInline(content);
    return `  <div class="chatting">
  <div class="think-l-bal-s"></div>
  <div class="think-l-bal-l"></div>
    <div class="tamathink">
      <p>${content}</p>
    </div>
  </div>
  </div>`;
  });


  /** 追加コード ココマデ */

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    // pathPrefix: "/subfolder/",
    templateFormats: ['md', 'njk', 'html'],
    dataTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  };
};
