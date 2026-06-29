# Catch-up

ルート表示アプリです。
お店から配達する地域までの最短ルートを自分で登録、検索することができます。
スマホから操作でき、そのままグーグルマップにルートを反映できます。

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/cd06f8f0-d116-46ef-9f60-5a0916af8066" />
<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/4577f452-5b76-4f73-81f4-e03839624d89" />

## URL
https://delivery-catchup.com/
サイドメニューまたはトグルで「ゲストログイン」ボタンを押すだけで利用できます。

## 使用技術
**Backend**
* Ruby 3.2.10
* Ruby on Rails 8.1.3
  
**frontend**
* JavaScript (ES6)
* Bootstrap
* Sass
  
**Databese**
* PostgreSQL

**External API**
* Google Maps Platform

**Testing**
* Minitest
* Capybara
* Selenium WebDriver
* Jest

**Code Quality**
* RuboCop
* Brakeman
* Bundler Audit

**Infrastructure**
* Nginx
* Puma
* AWS
  - VPC
  - EC2
  - Route53

## AWS構成図
<img width="1110" height="731" alt="Image" src="https://github.com/user-attachments/assets/ee01dad4-a0e4-4770-8a6b-e05b5a6a5b66" />

## 画面遷移図
黒矢印：ログイン前にも移動可能　赤矢印：ログイン後に移動可能

<img width="1081" height="761" alt="Image" src="https://github.com/user-attachments/assets/45c02d27-add0-4459-997d-c8ad50f53018" />

## ER図

```mermaid
erDiagram

    USERS ||--o{ ROUTES : creates
    TOWNS ||--o{ ROUTES : contains
    ROUTES ||--o{ ROUTE_POINTS : has

    USERS {
        bigint id PK
        string name
        string email
    }

    TOWNS {
        bigint id PK
        string name
        string kana
    }

    ROUTES {
        bigint id PK
        bigint user_id FK
        bigint town_id FK
        string name
        integer estimated_duration
    }

    ROUTE_POINTS {
        bigint id PK
        bigint route_id FK
        string address
        integer position
    }
```
  
## 機能一覧
* ユーザー登録・ログイン機能(bcrypt)
* 配送ルート作成機能
* 配送地点管理機能
* 地図表示機能(Google Maps JavaScript API)
* ルート検索機能(Google Directions API)
* ページネーション機能(kaminari)
* メール送信機能(Action Mailer)
* システムテスト(Minitest / Capybara)
* JavaScriptテスト(Jest)

## ゲストログイン

初めての方でもすぐに機能を体験できるよう、ゲストログインを用意しています。

### 利用方法
サイドメニューまたはトグルで「ゲストログイン」ボタンを押すだけで利用できます。

または以下の情報でもログイン可能です：

- email: guest@example.com
- password: password

