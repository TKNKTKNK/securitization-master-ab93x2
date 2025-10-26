証券化マスター（静的版・ドラッグ&ドロップ即デプロイ）
====================================================

このフォルダをそのまま Vercel の「New Project > …or deploy from your computer」に
**ドラッグ＆ドロップ**すればURLが発行されます。

手順：
1) https://vercel.com にログイン（無料）
2) 右上「Add New」>「Project」> 画面中央のアップロード枠にこのフォルダをドラッグ
3) プロジェクト名を入力して Deploy
4) 発行された URL を iPhone Safari で開く → 共有 → 「ホーム画面に追加」

補足：
- 検索避け（noindex）は `robots.txt` と `<meta name="robots">` で設定済み（1️⃣b対応）。
- オフライン用の service worker は最小構成（sw.js）。
- アイコンは `icons/` に同梱。

本番データ（過去問）の挿入について：
- `app.js` の `SAMPLE_QUESTIONS` を生成データに置換すれば反映されます。