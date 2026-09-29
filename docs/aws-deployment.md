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
CloudFront (バックエンドAPI用リバースプロキシ)  ── EC2 (t4g.micro)
                                                   ├── Dockerコンテナ: Spring Boot（dogtest-backend）
                                                   └── Dockerコンテナ: PostgreSQL 18（dogtest-db）
```

- データベースはRDSを使わず、EC2の中でバックエンドと一緒にDockerで動かしている（2026-09-29にRDSから移行。理由は「料金」の項目を参照）
- NAT Gateway・ロードバランサー・RDS・独自ドメインなど、固定費が発生するものは使用していない

## 料金

### 無料プランの仕組み（重要）

このアカウントの「AWS Free Plan」（2025年7月15日以降に作成したアカウント向け）は、以前の「12か月間、EC2などが毎月750時間まで無料」という仕組みではなく、**使った分を保有クレジットから差し引く仕組み**。

- 請求画面の「今月のコスト：$0.00」は、クレジットを差し引いた後の金額。実際の利用額は、Cost Explorerでクレジットを除外して確認する
- 無料プランの期限は2027年1月9日。**期限までに有料プランへ切り替えないと、アカウントが閉鎖される**（切り替えても、残りのクレジットは引き続き使える）

### 月額の目安（移行後）

| 内訳 | 1か月あたり |
|---|---|
| EC2（t4g.micro） | 約$7.9 |
| EC2のパブリックIPv4アドレス | 約$3.6 |
| EC2のストレージ（10GB gp3） | 約$1.0 |
| S3・CloudFront | ほぼ$0（CloudFrontは無料枠内） |
| **合計** | **約$12.5** |

### RDSからEC2内のPostgreSQLへ移行した経緯

- 当初はEC2（t3.micro）＋RDS（db.t4g.micro）の構成で、「無料利用枠の範囲内で24時間稼働できる」と考えていた
- 実際には、上記の仕組みにより**1日あたり約$1.16（月約$35）**がクレジットから引かれていた。このままだと2027年1月上旬にクレジットが尽きる見込みだった
- RDS（インスタンス＋ストレージで月約$21）をやめてEC2の中でPostgreSQLを動かし、EC2もより安いt4g.micro（Arm）に変更して、月約$12.5に下げた

## 使用しているAWSリソース

| 種類 | 名前 / ID | 用途 |
|---|---|---|
| IAMユーザー | dog-test | AWS CLI・MCP用の認証情報（読み取り専用） |
| EC2 | dogtest-backend-arm（t4g.micro / Amazon Linux 2023 / ストレージ10GB gp3） | バックエンド・データベースの稼働用 |
| セキュリティグループ | launch-wizard-2 | SSH(22番)は自分のIPからのみ、8080番は全世界に公開 |
| S3 | dogtest-frontend-ktsubasa2026 | ビルド済みフロントエンドの静的ファイル置き場 |
| CloudFront | E3E7CSRLOUZ5FU（`d330uf5f2vl9lz.cloudfront.net`） | フロントエンド配信用 |
| CloudFront | E244EROSPVC2SP（`d3esyxfnskbhhz.cloudfront.net`） | EC2の前段に置き、APIをhttps対応させるため |
| AWS Budgets | dog-test無料枠超過 | 月$15の予算。実際の利用額が80%（$12）を超えたらメール通知 |

## ステップ1: IAMユーザー作成 + AWS CLI/MCP接続

- IAMユーザー「dog-test」を作成し、アクセスキーを発行
- ローカルで`aws configure`を実行し、AWS CLIから接続できるようにした
- Claude Code用のAWS MCPサーバーも同時にセットアップ（Claude側がAWSリソースを読み取り専用で確認できるようにするため）
- 権限は`ReadOnlyAccess`（マネージドポリシー）を付与。これにより、Claude側は「確認」はできるが「変更」はできない状態にしている（実際のリソース作成・変更操作は必ず自分でAWSコンソールから行う）

## ステップ2: EC2作成 + 初期設定

### EC2の作成
- AMI: Amazon Linux 2023、アーキテクチャ: **64ビット (Arm)**（t4g系はArm用のため。x86のままだと選択肢に出てこない）
- インスタンスタイプ: t4g.micro（無料プランで選べるタイプの中で最も安い）
- ストレージ: 10GB gp3（バックエンド・PostgreSQLのDockerイメージとスワップ2GBを置くため、8GBから増やした）
- パブリックIPの自動割り当て: 有効

### Docker・Gitのインストール
```bash
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
# 反映のため、いったんexitして接続し直す
```

### スワップ（2GB）の作成
t4g.microはメモリが1GBしかなく、Spring BootとPostgreSQLを同時に動かすには足りないため、ストレージの一部をメモリの代わりに使えるようにする。
```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap defaults 0 0' | sudo tee -a /etc/fstab
```
- 最後の行は、再起動後もスワップを自動で有効にするための設定
- `tee`に`-a`を付け忘れると`/etc/fstab`が上書きされ、EC2が起動できなくなるので注意。実行後に`cat /etc/fstab`で、元からある`UUID=`の行が残っていることを確認する

## ステップ3: データベース・バックエンドの起動

### データベース（PostgreSQL）
```bash
# DB用のパスワードを作る（表示された値を控えておく）
openssl rand -hex 16

# コンテナ同士をつなぐネットワークを作る
docker network create dogtest-net

# PostgreSQLを起動する
docker run -d --name dogtest-db --network dogtest-net --restart unless-stopped \
  -e POSTGRES_DB=dogtest -e POSTGRES_USER=dogtest -e POSTGRES_PASSWORD=DBパスワード \
  -v dogtest-db-data:/var/lib/postgresql postgres:18
```
- `--restart unless-stopped`: EC2を再起動しても自動で起動する
- `-v dogtest-db-data:...`: データをコンテナの外（Dockerのボリューム）に保存する。コンテナを作り直してもデータは消えない
- `-p`（ポートの公開）を付けないことで、データベースはインターネットからは接続できず、同じネットワーク内のバックエンドからのみ接続できる

### バックエンド（Spring Boot）
```bash
git clone https://github.com/K-Tsubasa2026/dog-test.git
cd ~/dog-test/backend && docker build -t dogtest-backend .

docker run -d --name dogtest-backend --network dogtest-net --restart unless-stopped -p 8080:8080 \
  -e DB_HOST=dogtest-db -e DB_PORT=5432 \
  -e POSTGRES_DB=dogtest -e POSTGRES_USER=dogtest -e POSTGRES_PASSWORD=DBパスワード \
  -e JWT_SECRET=JWTシークレット \
  -e CORS_ALLOWED_ORIGINS=https://d330uf5f2vl9lz.cloudfront.net \
  -e JAVA_TOOL_OPTIONS=-Xmx300m \
  dogtest-backend
```
- `DB_HOST=dogtest-db`: 接続先はデータベースのコンテナ名
- `JWT_SECRET`: 本番用の値（`openssl rand -base64 32`で作ったもの）。IAMのシークレットアクセスキーとは別物。変えると、ログイン中のユーザーが全員ログアウト扱いになる
- `JAVA_TOOL_OPTIONS=-Xmx300m`: Spring Bootが使うメモリの上限を300MBにして、PostgreSQLと一緒に動けるようにしている
- 初回のイメージ作成は、メモリが小さいため5〜10分ほどかかる
- 動作確認: `curl -s localhost:8080/api/dog-types`で犬種のJSONが返ることを確認

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
- 料金クラス: 「北米、ヨーロッパ、アジア、中東、アフリカを使用する」（全世界の最上位クラスより安いクラス。方針として過剰なグレードを避けた）
- デフォルトルートオブジェクト: `index.html`（設定しないとトップページで404になる）
- ドメイン名: 独自ドメインなし。CloudFrontが自動発行する`https://d330uf5f2vl9lz.cloudfront.net`をそのまま使用

### 発生した問題: 混在コンテンツ(Mixed Content)エラー
- CloudFront配信のフロントエンドは`https://`だが、APIの接続先（EC2）が`http://`のままだったため、ブラウザが「安全なページから安全でない通信を呼び出す」としてブロック
- ブラウザ上では`Failed to fetch`というエラーになる
- 対応: EC2用にもCloudFrontを立てて、利用者からは`https://`でアクセスできるようにした（次のステップ）

## ステップ5: CloudFront（バックエンドAPI用リバースプロキシ）

- 目的: EC2(http)の前にCloudFrontを置き、利用者からは`https://`でAPIにアクセスできるようにする
- 独自ドメイン・証明書の購入は行わない（CloudFront自身がhttps対応のドメインを自動発行してくれるため）
- CloudFront→EC2間の通信はhttpのままでよい（ブラウザの「混在コンテンツ」判定の対象にはならない）

### ディストリビューション作成時のポイント
- Origin type: 「Other」を選択（Amazon S3ではない）。CloudFrontのカスタムオリジンは**IPアドレス直接指定不可**のため、EC2に自動で割り当てられるパブリックDNS名（例: `ec2-13-114-194-52.ap-northeast-1.compute.amazonaws.com`）をオリジンドメインに指定する
- HTTP port: `8080`（EC2側のSpring Bootのポート）
- プロトコル: HTTPのみ（EC2側がhttpのため）
- ビューワープロトコルポリシー: Redirect HTTP to HTTPS
- **キャッシュポリシー: CachingDisabled**（重要。APIレスポンスをキャッシュすると、ユーザーごとに異なる結果が誤って他のユーザーに返ってしまう可能性があるため、必ず無効にする）
- オリジンリクエストポリシー: AllViewer（Authorizationヘッダーなどをそのままオリジンに転送するため）
- 許可するHTTPメソッド: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE（実際に使っているのはGET/POSTのみだが、ウィザード側のデフォルトのままで問題ない）
- 料金クラス・WAF: フロントエンド用と同様の設定（低コストなクラス、WAF無効）

### 発生した問題: CORSエラー
- バックエンドの`CorsConfig.java`が`http://localhost:5173`（ローカル開発用）しか許可しておらず、本番のCloudFrontドメイン(`https://d330uf5f2vl9lz.cloudfront.net`)からのAPIアクセスがブロックされていた
- 症状としては、静的ファイルの読み込みは成功する（トップページ・質問画面は一瞬表示される）が、実際のAPI通信でエラーになる、という形で現れた
- 対応: 許可するオリジンをハードコードではなく環境変数`CORS_ALLOWED_ORIGINS`から読み込むように変更（`CorsConfig.java`・`application.properties`）。DBやJWT_SECRETと同じ、環境ごとに値を切り替えられるパターンに統一した
  - ローカル開発: 未設定時は`http://localhost:5173`にフォールバック
  - 本番(EC2): `docker run`時に`-e CORS_ALLOWED_ORIGINS=https://d330uf5f2vl9lz.cloudfront.net`を指定

## 運用手順

### フロントエンドの更新（コード変更のたびに毎回行う）
1. `frontend/.env`の`VITE_APP_URL`・`VITE_API_BASE_URL`を一時的に本番用URL（それぞれフロントエンド用・バックエンド用CloudFrontのドメイン）に変更してビルド（`npm run build`）
2. ビルド後、`.env`はローカル開発用（localhost）に戻す
3. `frontend/dist`フォルダの**中身**（`index.html`・`assets/`）をS3バケットのルートにアップロード（`dist`フォルダごとアップロードすると`index.html`の場所がずれるので注意）
4. **CloudFront（フロントエンド用）で`/index.html`のキャッシュ削除（Invalidation）を作成する**（下記参照。これを忘れると古い画面が配信され続ける）

**CloudFrontのキャッシュについて**
- JS/CSSファイルはビルドのたびにファイル名にハッシュが付く（例: `index-C4Y5DX_R.js`）ため、常に新しいファイルとして扱われる
- しかし`index.html`はファイル名が変わらないため、CloudFrontが古いキャッシュを配信し続けてしまうことがある（デフォルトのキャッシュ設定では最大24時間程度保持される）
- そのため、S3再アップロード後は必ず、CloudFrontの「キャッシュ削除」タブ→「キャッシュ削除を作成」→オブジェクトパスに`/index.html`を指定、を行う
- 費用: キャッシュ削除は月1,000パスまで無料枠があり、通常の更新作業であれば実質無料

### バックエンドの更新（コード変更を反映する場合）
```bash
cd ~/dog-test
git pull
docker stop dogtest-backend
docker rm dogtest-backend
cd ~/dog-test/backend
docker build -t dogtest-backend .
# あとは「ステップ3」のバックエンドのdocker runを同じ値で実行する
```
- データベースのコンテナ（dogtest-db）は止めなくてよい

### データベースのバックアップ
```bash
# EC2の中で実行し、バックアップファイルを作る
docker exec dogtest-db pg_dump -U dogtest -d dogtest -F c > ~/dogtest-backup.dump

# Macのターミナルで実行し、手元に保存する（dog-testフォルダ内には置かない）
scp -i backend/dogtest-key.pem ec2-user@EC2のパブリックIP:~/dogtest-backup.dump ~/dogtest-backup.dump
```
- バックアップファイルには登録ユーザーのメールアドレスなどが含まれるため、Gitの管理下のフォルダには置かない

### 注意点
- **EC2は「停止」しない**: 再起動ではIPアドレスは変わらないが、「停止→開始」をするとパブリックIPアドレス（とパブリックDNS名）が変わる。その場合は、バックエンド用CloudFrontのオリジンドメインを新しいDNS名に書き換える必要がある
- **2027年1月9日より前に有料プランへ切り替える**（「料金」の項目を参照）

## 経過

- 2026-09-24: フロントエンド(S3+CloudFront)・バックエンド(EC2+CloudFront)・DB(RDS)の構成で公開
- 2026-09-29: 費用削減のため、RDSを廃止してEC2(t4g.micro)内のPostgreSQLに移行。RDSのデータは`pg_dump`で書き出して新しいデータベースに戻し、バックエンド用CloudFrontの接続先を新しいEC2に切り替えた。古いEC2(t3.micro)とRDSは削除済み

## コスト管理・セキュリティ

- AWS Budgets: 月$15の予算を設定。クレジット・返金を除いた実際の利用額で判定し、80%（$12）を超えたらメールで通知
- MFA（二段階認証）はルートユーザー・IAMユーザーともに設定済み
