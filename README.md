# 全国ライブカメラ

奈良県ライブカメラの既存HTMLをもとに、GitHub Pagesで運用しやすいように画面・スタイル・処理・データを分離した静的サイトです。

## フォルダ構成

```text
national-live-camera-starter/
├─ index.html                 # 共通画面
├─ css/
│  └─ style.css               # デザイン・レスポンシブ対応
├─ js/
│  └─ app.js                  # 読み込み、地図、更新、検索など
├─ data/
│  ├─ prefectures.json        # 全国47都道府県のメニュー設定
│  └─ cameras/
│     └─ nara.json            # 奈良県のカメラ60地点
├─ .nojekyll                  # GitHub Pagesでそのまま配信
└─ README.md
```

## 公開方法

1. このフォルダの中身をGitHubリポジトリへアップロードします。
2. GitHubの **Settings → Pages** を開きます。
3. **Deploy from a branch** を選び、`main` ブランチの `/ (root)` を指定します。
4. 数分後に発行されるURLを開きます。

JSONを`fetch()`で読むため、PC上で `index.html` を直接ダブルクリックする方法では正常に動かないブラウザがあります。確認時はGitHub Pagesを使うか、フォルダ内で次のように簡易サーバーを起動してください。

```bash
python -m http.server 8000
```

その後、ブラウザで `http://localhost:8000/` を開きます。

## 都道府県を追加する方法

### 1. カメラJSONを追加

`data/cameras/osaka.json` のようなファイルを作成します。基本形は以下です。

```json
{
  "id": "osaka",
  "name": "大阪府",
  "shortName": "大阪",
  "region": "近畿",
  "center": { "latitude": 34.69, "longitude": 135.50 },
  "zoom": 9,
  "refreshIntervalMinutes": 10,
  "areas": [
    { "id": "north", "name": "北部", "color": "blue" },
    { "id": "south", "name": "南部", "color": "red" }
  ],
  "cameras": [
    {
      "id": "osaka-001",
      "area": "north",
      "city": "枚方市",
      "place": "【平地】地点名",
      "terrain": "平地",
      "pageUrl": "https://提供元の紹介ページ",
      "imageUrl": "https://直接表示できる画像URL",
      "latitude": 34.81,
      "longitude": 135.65
    }
  ]
}
```

### 2. 都道府県メニューを有効化

`data/prefectures.json` の該当都道府県を次のように変更します。

```json
{ "id": "osaka", "name": "大阪府", "enabled": true }
```

これだけで、左上の都道府県メニューから切り替えられます。

## 奈良県版から行った主な変更

- 1ファイルに入っていたHTML・CSS・JavaScript・カメラ情報を分離
- 奈良県の有効な60地点を `nara.json` に移行
- 全国47都道府県のメニューを準備（奈良県以外は準備中表示）
- URLクエリ `?pref=nara` による都道府県切り替えに対応
- 市町村名・地点名検索を追加
- エリア選択時に地図の表示範囲を自動調整
- 画像エラー表示、遅延読み込み、拡大表示、Escキー操作に対応
- 10分更新時刻の計算を修正
- 自動スクロールをフレームレートに依存しない速度へ変更
- GitHub PagesのHTTPSに合わせ、奈良県JSON内の画像URLをHTTPSへ統一
- スマートフォン・タブレット表示へ対応

## 確認しておきたいデータ

元の奈良県版にあるデータを原則そのまま移しています。次の点は今後、提供元ページと照合するのがおすすめです。

- 「五條市北部／京奈和道 岡町西」の画像URLが、宇陀市の「室生大野寺」と同じURLになっています。
- 提供元側の仕様変更、アクセス制限、画像URL変更により表示できない地点が出る可能性があります。
- 外部画像を直接表示するため、提供元の利用条件や更新頻度を確認してください。
