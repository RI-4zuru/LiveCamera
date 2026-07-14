# 全国ライブカメラ

奈良県ライブカメラの既存HTMLをもとに、GitHub Pagesで運用しやすいよう、画面・スタイル・処理・データを分離した静的サイトです。

## フォルダ構成

```text
national-live-camera-starter/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  └─ app.js
├─ data/
│  ├─ prefectures.json
│  └─ cameras/
│     └─ nara.json
├─ .nojekyll
└─ README.md
```

## 現在の画面仕様

- PCでは左側にライブカメラ、右側に地図を表示
- PCのカメラ一覧は1行4枚
- 右側の地図はページをスクロールしても追従表示
- 画面幅880px以下では、操作しやすいよう地図を一覧上部へ移動
- 通常表示は静止画カメラのみ
- `YouTube` ボタンを押すと、YouTubeライブカメラと専用の赤い地図ピンを追加表示
- 地点名を押すと、各カメラの提供元ページを新しいタブで開く
- 緯度・経度は各カードに小数第4位まで表示

## 奈良県データ

現在の `nara.json` には次のデータが入っています。

- 静止画カメラ：61地点
- YouTubeライブカメラ：3地点
- 合計：64地点

今回、奈良国道事務所の一覧と照合し、静止画カメラの「名阪国道 一本松」を追加しました。また、「京奈和道 岡町西」の画像URLを正しい静止画URLへ修正しています。

YouTubeカメラは初期表示では読み込まれません。ボタンを押した場合のみ、次の3地点を表示します。

- 東大寺大仏殿
- 談山神社
- 金剛山 国見城址

YouTube側で配信URLや埋め込み設定が変更された場合は、`youtubeId` または `pageUrl` の更新が必要です。

## 公開方法

1. このフォルダの中身をGitHubリポジトリへアップロードします。
2. GitHubの **Settings → Pages** を開きます。
3. **Deploy from a branch** を選び、`main` ブランチの `/ (root)` を指定します。
4. 発行されたURLを開きます。

JSONを `fetch()` で読むため、PC上で `index.html` を直接ダブルクリックすると正常に動かない場合があります。確認時はGitHub Pagesを使うか、フォルダ内で簡易サーバーを起動してください。

```bash
python -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開きます。

## 静止画カメラの追加方法

`data/cameras/nara.json` の `cameras` に次の形式で追加します。

```json
{
  "id": "nara-100",
  "area": "northwest",
  "city": "奈良市",
  "place": "【平地】地点名",
  "terrain": "平地",
  "mediaType": "image",
  "provider": "提供機関名",
  "pageUrl": "https://提供元の紹介ページ",
  "imageUrl": "https://直接表示できる静止画像URL",
  "latitude": 34.0000,
  "longitude": 135.0000
}
```

`pageUrl` は、地点名をクリックしたときに開くリンクです。画像だけのURLではなく、原則としてカメラの説明・公開元が確認できるページを指定してください。

## YouTubeカメラの追加方法

```json
{
  "id": "nara-youtube-100",
  "area": "northwest",
  "city": "奈良市",
  "place": "地点名 ライブカメラ",
  "terrain": "観光",
  "mediaType": "youtube",
  "provider": "配信者名 / YouTube",
  "pageUrl": "https://www.youtube.com/watch?v=動画ID",
  "youtubeId": "動画ID",
  "latitude": 34.0000,
  "longitude": 135.0000
}
```

`mediaType` を `youtube` にしたカメラは、通常表示には出ず、YouTubeボタンが有効なときだけ表示されます。

## 都道府県を追加する方法

1. `data/cameras/osaka.json` のような県別JSONを追加します。
2. `data/prefectures.json` の該当県を次のように有効化します。

```json
{ "id": "osaka", "name": "大阪府", "enabled": true }
```

県別JSONの基本構造は奈良県の `nara.json` を複製して変更するのが簡単です。

## 運用時の注意

- 外部画像を直接表示するため、提供元の利用条件を確認してください。
- 静止画URLがHTTPのみの場合、HTTPSのGitHub Pagesではブラウザに遮断されます。
- 河川・道路管理者側の仕様変更で画像URLが変わる場合があります。
- YouTubeライブは配信終了、動画ID変更、埋め込み禁止設定によって表示できなくなる場合があります。
