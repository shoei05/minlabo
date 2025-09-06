## みんらぼカードゲーム デプロイ手順

このリポジトリでは、Stable Horde API への呼び出しを Cloudflare Workers 経由でプロキシし、フロントからは API キーを一切配信しません。GitHub Actions で GitHub Pages にデプロイします。

### 構成
- `app.html`: アプリ本体。`window.WORKER_URL` を参照します。
- `config.js`: 本番用。Actions が `PUBLIC_WORKER_URL` から生成します（リポジトリにはコミットしません）。
- `config.example.js`: 開発用のサンプル。
- `.github/workflows/deploy.yml`: GitHub Pages デプロイ用ワークフロー。
- `cloudflare/`: Cloudflare Worker 用のソースと `wrangler.toml`。

### セットアップ
1) Cloudflare Worker をデプロイ

   - 前提: `npm i -g wrangler` で wrangler をインストール、`wrangler login` 済み
   - `cloudflare/` ディレクトリで以下を実行:
     - `wrangler secret put STABLE_HORDE_API_KEY`（Stable Horde API キーを入力）
     - （任意）`wrangler kv namespace create MINLABO_CACHE` などの追加リソースは不要です
     - `wrangler deploy` でデプロイ
   - デプロイ後の公開URL（例: `https://minlabo-proxy.yourname.workers.dev`）を控えてください。

2) GitHub リポジトリ側の設定

   - Settings → Secrets and variables → Actions → New repository secret で以下を登録:
     - `PUBLIC_WORKER_URL` : 上記 Worker の公開URL

3) デプロイ

   - デフォルトブランチ `main` に push すると Actions が `config.js` を生成し、Pages へデプロイします。

### ローカル開発
1. `cp config.example.js config.js`
2. `config.js` に `WORKER_URL` を設定
3. `app.html` をブラウザで開く

### セキュリティ上の注意
- Cloudflare Worker が API キーを保持するため、フロントからキーは見えません。
- 追加対策として `cloudflare/wrangler.toml` の `ALLOWED_ORIGIN` を GitHub Pages のドメインに設定することで CORS 制限が可能です。
