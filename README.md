# 📘 AI 繪本生成平台 | AI Storybook Generator

一個使用 AI 技術創作、瀏覽與分享繪本的線上平台，讓每個人都能輕鬆創造屬於自己的故事。

An online platform for creating, browsing, and sharing storybooks using AI technology, making storytelling accessible to everyone.

## ✨ 功能特色 | Features

### 🎯 核心功能 | Core Features
- **AI 故事生成** - 根據主題提示自動生成完整故事內容
- **AI 插圖生成** - 為故事自動創建相應的精美插圖
- **AI 語音合成** - 將故事轉換為語音，支援多種聲音選擇
- **多格式匯出** - 支援 PDF 和圖片格式匯出
- **響應式設計** - 完美支援桌面和行動裝置

### 🌐 社群功能 | Community Features
- **故事分享** - 發布並分享您的創作作品
- **互動系統** - 點讚、評論和收藏功能
- **探索頁面** - 瀏覽其他創作者的精彩作品
- **個人檔案** - 管理您的作品集和設定

### 🔧 技術特色 | Technical Features
- **多語言支援** - 繁體中文 / English
- **現代化 UI** - 基於 shadcn/ui 的精美介面
- **安全認證** - 完整的用戶註冊登入系統
- **雲端儲存** - 安全可靠的作品儲存

## 🏗️ 技術架構 | Tech Stack

### 前端 | Frontend
- **框架**: Next.js 15 (App Router)
- **UI 庫**: React + shadcn/ui + Tailwind CSS
- **狀態管理**: Zustand
- **表單驗證**: Zod
- **多語言**: next-intl

### 後端 | Backend
- **資料庫**: PostgreSQL (NeonDB)
- **ORM**: Prisma
- **認證**: Better Auth
- **API**: Next.js API Routes

### AI 服務 | AI Services
- **文本生成**: OpenAI GPT
- **圖像生成**: OpenAI DALL-E
- **語音合成**: OpenAI TTS
- **可選服務**: Replicate, ElevenLabs

### 基礎設施 | Infrastructure
- **部署**: Vercel
- **儲存**: AWS S3 (可選)
- **DNS**: Cloudflare

## 🚀 快速開始 | Quick Start

### 前置需求 | Prerequisites
- Node.js 18+
- PostgreSQL 資料庫
- OpenAI API Key

### 安裝步驟 | Installation

1. **複製專案**
   ```bash
   git clone https://github.com/Ray-Tsai-0214/ai-storybook-NTHU.git
   cd ai-storybook-NTHU
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **環境設定**
   
   建立 `.env.local` 檔案：
   ```env
   # 資料庫
   DATABASE_URL="your_postgresql_connection_string"
   
   # OpenAI API (必需)
   OPENAI_API_KEY="your_openai_api_key"
   
   # 可選 API Keys
   REPLICATE_API_KEY="your_replicate_api_key"
   ELEVENLABS_API_KEY="your_elevenlabs_api_key"
   
   # Better Auth 設定
   BETTER_AUTH_SECRET="your_auth_secret"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

4. **資料庫設定**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **種子資料 (可選)**
   ```bash
   npm run seed
   ```

6. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

   開啟 [http://localhost:3000](http://localhost:3000) 開始使用！

## 📁 專案結構 | Project Structure

```
ai-storybook/
├── app/                    # Next.js 13+ App Router
│   ├── (root)/            # 主要頁面
│   ├── api/               # API 路由
│   └── auth/              # 認證頁面
├── components/            # React 元件
│   ├── ui/               # shadcn/ui 元件
│   ├── artbook/          # 繪本相關元件
│   └── profile/          # 用戶資料元件
├── lib/                   # 工具函數和設定
│   ├── api/              # API 函數
│   └── stores/           # Zustand 狀態管理
├── prisma/               # 資料庫 Schema 和遷移
├── types/                # TypeScript 型別定義
├── messages/             # 多語言翻譯檔案
└── docs/                 # 專案文件
```

## 🎨 使用說明 | Usage Guide

### 創建繪本 | Creating a Storybook

1. **登入帳號** - 註冊或登入您的帳號
2. **點選「Create Artbook」** - 開始創作新的繪本
3. **輸入故事主題** - 描述您想要的故事類型和主角
4. **AI 生成內容** - 系統會自動生成故事大綱和內容
5. **生成插圖** - 為每一頁生成對應的精美插圖
6. **添加語音** - 選擇合適的聲音為故事配音
7. **發布分享** - 完成後可以發布到社群或匯出檔案

### 探索社群 | Community Exploration

- **瀏覽作品** - 在 Discovery 頁面探索其他用戶的創作
- **互動功能** - 對喜歡的作品點讚、留言或收藏
- **個人檔案** - 查看和管理您的作品集

## 🤝 貢獻指南 | Contributing

歡迎貢獻！請遵循以下步驟：

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權 | License

本專案僅供學習和展示用途。

This project is for educational and demonstration purposes only.

## 🙋‍♂️ 聯絡資訊 | Contact

如有任何問題或建議，歡迎聯繫！

For any questions or suggestions, feel free to reach out!

---

⭐ 如果您覺得這個專案有趣，請給我們一個 Star！

⭐ If you find this project interesting, please give us a star!