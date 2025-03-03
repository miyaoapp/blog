---
title: "テストページB"
description: "ショートコードを使ってみる"
date: 2024-12-25
thumb: "ogp_tama-graphig.webp"
tags: 
  - その他
  - Notion
  - 11ty
---

## ショートコード


{% talkicon_r {img: 'mimmy.webp', name: 'Mimmy'} %}{% says_r %}
まずはアタシからネ！アタシ、ミミィ！  
カラダはウサギ、ココロは乙女！
ヨロシクね！ウフフ！  
{% endsays_r %}


{% talkicon_l {img: 'tama.webp', name: 'Tamachii'} %}{% think_l %}
マスコットキャラがいきなりオネェ全開って SEO 的にどうなんだろ…
{% endthink_l %}


## floatbox


{% floatbox {
    img: 'tama_900.webp',
    title: '',
    width: '200px',
    colortheme: 'silver'
  } %}
  <i class="fa-solid fa-magnifying-glass"></i> クリックで拡大
  {% endfloatbox %}


## ウェブブックマーク


{% bookmark {link:'https://katayu.de/2024/orange-pi-de-ocoge/'} %}


長いタイトル


{% bookmark {link:'https://katayu.de/2024/esp32-s3-platformio-ide-memo/'} %}


長い概要


{% bookmark {link:'https://ocoge.club/2022-04-27_ict-motto/'} %}

