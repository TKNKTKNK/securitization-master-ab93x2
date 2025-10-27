Pull Request パック（2024年UI+ローダ対応）
====================================

このパックは、白背景/黒文字/赤強調のUI切替と、2024年データを /data/2024.json から読み込む変更を含みます。
（中身の 2024.json はサンプルです。後で本番データに差し替え可能な構成）

手順（GitHub WebだけでOK）
-------------------------
1) あなたの GitHub リポジトリを開く
2) 「Add file → Upload files」から、このZIPの中身を **そのまま** ルートにドラッグ
   - 既存の index.html / app.js / sw.js は上書き
   - 新規: data/2024.json を追加
3) ページ最下部で「Create a new branch」にチェック → ブランチ名例: `feat/2024-ui-loader`
4) 「Propose changes」→ 「Create pull request」
5) Vercel が自動で Preview を作るので確認 → 問題なければ「Merge pull request」

本番データの流し込み
-------------------
- `data/2024.json` を本番版に置き換えるだけで即反映（次回のPRで提供）
- 将来的に `data/2023.json` など複数年にも拡張予定

iPhoneの更新方法
----------------
- ホーム画面アプリを開き、画面を上から下へ引っぱって更新（PWA対応）