# AWSデプロイ手順メモ

DogTestをAWSにデプロイした際の作業記録。あとで見返す用のメモなので、詳細な画面操作は省略し、「何を」「なぜ」作ったかを中心にまとめる。

## 全体構成

```
利用者
  │ https
  ▼
CloudFront (フロントエンド配信)  ── S3 (静的ファイル: index.html / JS / CSS / 画像)
  │
  │ https（利用者→CloudFrontの区間のみ暗号化。CloudFront→EC2はhttpのまま）
  ▼
CloudFront (バックエンドAPI用リバースプロキシ)  ── EC2 (Spring Boot, Docker)
                                                       │
                                                       ▼
                                                     RDS (PostgreSQL)
```

- EC2・RDSは無料利用枠対象のインスタンスタイプ（EC2: t3.micro、RDS: db.t4g.micro）で24時間稼働
- S3・CloudFrontも無料利用枠の範囲内で収まる想定（S3: 5GB、CloudFront: 1TB転送・1,000万リクエスト/月）
- NAT Gateway・ロードバランサー・RDS Multi-AZ・独自ドメインなど、固定費が発生するものは使用していない

## 使用しているAWSリソース

| 種類 | 名前 / ID | 用途 |
|---|---|---|
| IAMユーザー | dog-test | AWS CLI・MCP用の認証情報 |
| RDS | dogtest-db (PostgreSQL 18.3, db.t4g.micro) | 本番用データベース |
| EC2 | dogtest-backend (t3.micro, Amazon Linux 2023) | Spring Bootバックエンド稼働用 |
| S3 | dogtest-frontend-ktsubasa2026 | ビルド済みフロントエンド静的ファイル置き場 |
| CloudFront | dogtest-frontend (`d330uf5f2vl9lz.cloudfront.net`) | フロントエンド配信用 |
| CloudFront | （バックエンドAPI用、これから作成） | EC2の前段に置き、https対応させるため |

## ステップ1: IAMユーザー作成 + AWS CLI/MCP接続

- IAMユーザー「dog-test」を作成し、アクセスキーを発行
- ローカルで`aws configure`を実行し、AWS CLIから接続できるようにした
- Claude Code用のAWS MCPサーバーも同時にセットアップ（Claude側がAWSリソースを読み取り専用で確認できるようにするため）
- 権限は`ReadOnlyAccess`（マネージドポリシー）を付与。これにより、Claude側は「確認」はできるが「変更」はできない状態にしている（実際のリソース作成・変更操作は必ず自分でAWSコンソールから行う）

## ステップ2: RDS（PostgreSQL）作成

- 「簡単に作成」で以下の設定で作成
  - エンジン: PostgreSQL 18.3
  - インスタンスタイプ: db.t4g.micro（無料利用枠対象）
  - ストレージ: 20GB gp2
  - Multi-AZ: なし（費用抑制のため。冗長化は不要と判断）
  - パブリックアクセス: なし（EC2からのみ接続できるようにするため）
  - リージョン: 東京 (ap-northeast-1)
- 注意点: 「簡単に作成」だと初期データベース（`dogtest`という名前のDB自体）は自動作成されないため、EC2から`psql`で手動で`CREATE DATABASE dogtest;`を実行する必要があった
- セキュリティグループ: RDSの5432番ポートは「EC2のセキュリティグループ」からのみ許可（全世界には公開しない）
- 拡張モニタリング（Enhanced Monitoring）は当初オンになっていたが、追加費用がかかるためオフに変更済み

## ステップ3: EC2作成 + バックエンドデプロイ

- インスタンスタイプ: t3.micro（無料利用枠対象）、Amazon Linux 2023
- セキュリティグループ: SSH(22番)は自分のIPからのみ、Spring Boot用の8080番は全世界に公開
- SSH接続後、Docker・gitをインストールし、GitHubリポジトリをclone
- 本番用の`JWT_SECRET`をローカル開発用とは別に生成（`openssl rand -base64 32`）
- Dockerイメージをビルドし、RDSのエンドポイント・本番用JWT_SECRETを環境変数として渡して`docker run`
- 動作確認: `curl http://<EC2のパブリックIP>:8080/api/dog-types` で正常なJSONが返ることを確認

## ステップ4: S3 + CloudFront（フロントエンド配信）

### S3バケット作成
- バケット名: `dogtest-frontend-ktsubasa2026`（S3のバケット名は世界で重複不可のため、任意の文字列を付与）
- リージョン: 東京 (ap-northeast-1)
- パブリックアクセスは**すべてブロック**（S3を直接公開せず、CloudFront経由でのみアクセスさせるため）
- バージョニング: 無効（不要なストレージ課金を避けるため）

### CloudFrontディストリビューション作成
- オリジン: 上記S3バケット
- 「Allow private S3 bucket access to CloudFront」を有効化 → CloudFrontだけがS3を読める仕組み（OAC）が自動設定される
- WAF（セキュリティ保護）: 無効化（月14 USD程度の追加費用が発生するため、ポートフォリオ用途では不要と判断）
- 料金クラス: 「北米、ヨーロッパ、アジア、中東、アフリカを使用する」（全世界の最上位クラスより安いクラス。無料枠内なら料金は変わらないが、方針として過剰なグレードを避けた）
- デフォルトルートオブジェクト: `index.html`（設定しないとトップページで404になる）
- ドメイン名: 独自ドメインなし。CloudFrontが自動発行する`https://d330uf5f2vl9lz.cloudfront.net`をそのまま使用

### フロントエンドのビルド・アップロード
- `frontend/.env`の`VITE_API_BASE_URL`を一時的にEC2のURLに変更してビルド（`npm run build`）
- ビルド後、`.env`はローカル開発用（localhost）に戻す
- `frontend/dist`フォルダの**中身**（`index.html`・`assets/`）をS3バケットのルートにアップロード（`dist`フォルダごとアップロードすると`index.html`の場所がずれるので注意）

### 発生した問題: 混在コンテンツ(Mixed Content)エラー
- CloudFront配信のフロントエンドは`https://`だが、APIの接続先（EC2）が`http://`のままだったため、ブラウザが「安全なページから安全でない通信を呼び出す」としてブロック
- ブラウザ上では`Failed to fetch`というエラーになる
- 対応: EC2用にもCloudFrontを立てて、利用者からは`https://`でアクセスできるようにする（次のステップへ）

## ステップ5: CloudFront（バックエンドAPI用リバースプロキシ）

- 目的: EC2(http)の前にCloudFrontを置き、利用者からは`https://`でAPIにアクセスできるようにする
- 独自ドメイン・証明書の購入は行わない（CloudFront自身がhttps対応のドメインを自動発行してくれるため）
- CloudFront→EC2間の通信はhttpのままでよい（VPC内・インターネット経由だが、AWS内部の通信であり、ブラウザの「混在コンテンツ」判定の対象にはならない）

### ディストリビューション作成時のポイント
- Origin type: 「Other」を選択（Amazon S3ではない）。CloudFrontのカスタムオリジンは**IPアドレス直接指定不可**のため、EC2に自動で割り当てられるパブリックDNS名（例: `ec2-13-196-168-164.ap-northeast-1.compute.amazonaws.com`）をオリジンドメインに指定する
- HTTP port: `8080`（EC2側のSpring Bootのポート）
- プロトコル: HTTPのみ（EC2側がhttpのため）
- ビューワープロトコルポリシー: Redirect HTTP to HTTPS
- **キャッシュポリシー: CachingDisabled**（重要。APIレスポンスをキャッシュすると、ユーザーごとに異なる結果が誤って他のユーザーに返ってしまう可能性があるため、必ず無効にする）
- オリジンリクエストポリシー: AllViewer（Authorizationヘッダーなどをそのままオリジンに転送するため）
- 許可するHTTPメソッド: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE（実際に使っているのはGET/POSTのみだが、ワイザード側のデフォルトのままで問題ない）
- 料金クラス・WAF: フロントエンド用と同様の設定（低コストなクラス、WAF無効）

作成したドメイン名: `https://d3esyxfnskbhhz.cloudfront.net`

### 発生した問題: CORSエラー
- バックエンドの`CorsConfig.java`が`http://localhost:5173`（ローカル開発用）しか許可しておらず、本番のCloudFrontドメイン(`https://d330uf5f2vl9lz.cloudfront.net`)からのAPIアクセスがブロックされていた
- 症状としては、静的ファイルの読み込みは成功する（トップページ・質問画面は一瞬表示される）が、実際のAPI通信でエラーになる、という形で現れた
- 対応: 許可するオリジンをハードコードではなく環境変数`CORS_ALLOWED_ORIGINS`から読み込むように変更（`CorsConfig.java`・`application.properties`）。DBやJWT_SECRETと同じ、環境ごとに値を切り替えられるパターンに統一した
  - ローカル開発: 未設定時は`http://localhost:5173`にフォールバック
  - 本番(EC2): `docker run`時に`-e CORS_ALLOWED_ORIGINS=https://d330uf5f2vl9lz.cloudfront.net`を指定

### フロントエンド側の追従
- `frontend/.env`の`VITE_API_BASE_URL`を、EC2の直接URLではなく**バックエンド用CloudFrontのURL**(`https://d3esyxfnskbhhz.cloudfront.net`)に変更してビルド・S3再アップロード

### EC2側の再デプロイ手順(コード変更を反映する場合の一般手順)
```bash
cd ~/dog-test
git pull
docker stop dogtest-backend
docker rm dogtest-backend
cd ~/dog-test/backend
docker build -t dogtest-backend .
docker run -d \
  --name dogtest-backend \
  -p 8080:8080 \
  -e DB_HOST=<RDSのエンドポイント> \
  -e DB_PORT=5432 \
  -e POSTGRES_DB=dogtest \
  -e POSTGRES_USER=dogtest \
  -e POSTGRES_PASSWORD=<RDSのマスターパスワード> \
  -e JWT_SECRET=<JWT_SECRET> \
  -e CORS_ALLOWED_ORIGINS=https://d330uf5f2vl9lz.cloudfront.net \
  dogtest-backend
```

## デプロイ完了

2026-09-24、フロントエンド(S3+CloudFront)・バックエンド(EC2+CloudFront)・DB(RDS)すべてがhttps経由で正常に疎通し、ブラウザで診断機能が最後まで動作することを確認済み。

## コスト管理

- AWS Budgetsで月$1.00のコスト予算「dog-test無料枠超過」を設定済み（メール通知の登録は要確認）
- MFA（二段階認証）はルートユーザー・IAMユーザーともに設定済み
- 詳細な費用方針は都度Claude Codeとの会話で確認しながら進めている（無料利用枠・保有クレジットの範囲内での構築を最優先）
