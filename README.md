## みんらぼカードゲーム デプロイ手順

このリポジトリでは、Stable Horde の API キーを `app.html` から外出しし、GitHub Actions で GitHub Pages にデプロイします。

注意: ブラウザから直接 API を呼ぶ構成のため、最終的に配信される `config.js` 内のキーは閲覧可能です。第三者悪用のリスクがあります。可能であればサーバ/サーバレスのプロキシ経由で秘匿する構成をご検討ください。

### 構成
- `app.html`: アプリ本体。`window.MINLABO_APIKEY` を参照します。
- `config.js`: 本番用。Actions がシークレットから生成します（リポジトリにはコミットしません）。
- `config.example.js`: 開発用のサンプル。
- `.github/workflows/deploy.yml`: GitHub Pages デプロイ用ワークフロー。

### セットアップ
1. GitHub リポジトリの Settings → Secrets and variables → Actions → "New repository secret" から以下を登録:
   - `STABLE_HORDE_API_KEY` : Stable Horde の API キー

2. デフォルトブランチ `main` へプッシュすると Actions が `config.js` を生成し、Pages へデプロイします。

### ローカル開発
1. `cp config.example.js config.js`
2. `config.js` に API キーを設定
3. `app.html` をブラウザで開く

### セキュリティ上の注意
- フロントエンドのみの構成では API キー秘匿はできません。乱用防止のため次を検討:
  - キーの発行権限/レート制限/ドメイン制限（サービス側で提供される場合）
  - 署名付きリクエストや中継サーバ導入（Cloudflare Workers, Vercel Functions など）

