---
title: "テストページＡ"
description: "Notion の基本ブロック"
date: 2024-11-20
thumb: "ogp_blog.webp"
tags: 
  - ブログ
  - 11ty
  - Notion
---

# Heading1


**太字**　_斜体ABC_　<u>下線</u>　~~打ち消し~~　`inline`　[リンク](https://miyao.app/)　文字色　背景色


## 見出し２：表


| テーブル | 列１  | 列２ |
| ---- | --- | -- |
| 行１   | 相生  | 本多 |
| 行２   | 長野原 | 相沢 |
| 行３   | 水上  | 富樫 |


### 見出し３：リスト

- 相生
本多
- 長野原
相沢
- 水上
富樫
1. 相生
本多
2. 長野原
相沢
3. 水上
富樫

---

<details>
<summary>トグル</summary>

ブロックが入れられるらしい


</details>

> 引用文。すらまっぱぎ。

{% simplebox 'box_stripe' %}💡 コールアウト  
２行目。  
３行目！{% endsimplebox %}


{% bookmark {link:'https://www.yahoo.co.jp/'} %}


{% floatbox {
    img: 'cat.jpg',
    title: '現場猫（アップロード）',
    width: '200px',
    colortheme: 'silver'
  } %}
  <i class="fa-solid fa-magnifying-glass"></i> クリックで拡大
  {% endfloatbox %}


![GIPHY（外部）](https://media1.giphy.com/media/mlvseq9yvZhba/giphy.gif?cid=7941fdc6oj6uqaeu4nblzjkew23q74s9pu0vvdf5p3mj0bo9&ep=v1_gifs_search&rid=giphy.gif&ct=g "GIPHY（外部）")


[Youtube埋め込み](https://youtu.be/Q8CCj9NnLHM)


```cpp
unsigned long p_len = 64 * 1024;
uint8_t *p_buffer = (uint8_t *)ps_malloc(p_len * sizeof(uint8_t));
doHttpGet(art_url, p_buffer, &p_len);
lcd.drawJpg(p_buffer, p_len);
free(p_buffer);
```


[embed](https://gist.github.com/ocogeclub/866615dac4bc1e35d7f9e58b34b6aefc)


[embed](https://x.com/NotionJP/status/1849686431830253668)

