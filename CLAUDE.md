# CLAUDE.md - AI Artbook Platform Development Memory

## 🎯 專案概述
**專案名稱**: AI Artbook Platform (品牌名: Storyr)
**專案描述**: 使用 AI 創建、瀏覽和分享圖畫書的線上平台
**GitHub Repo**: https://github.com/Meowbotz-ll/ai-storybook
**技術棧**: Next.js 15, React, shadcn/ui, OpenAI API, Prisma, NeonDB

## 📋 重要指令
```bash
# 開發環境
npm run dev --turbopack  # 啟動開發伺服器 with Turbopack (port 3000)
npm run build            # 建構生產版本
npm run start            # 啟動生產伺服器
npm run lint             # 執行程式碼檢查
npx tsc --noEmit        # TypeScript 類型檢查

# Git 工作流程
git pull origin master    # 開始工作前同步
git add .                 # 暫存更改
git commit -m "訊息"      # 提交更改
git push origin master    # 推送到遠端
```

## 🏗️ 專案結構
```
/app              # Next.js App Router 頁面
  /api            # API 路由
    /auth         # Better Auth 認證端點
    /artbooks     # 繪本 CRUD 操作
    /user         # 用戶資料管理
    /generate-outline          # 故事大綱生成 (GPT-4)
    /generate-story           # 完整故事生成 (GPT-4)
    /generate-image           # 圖片生成 (DALL-E 3)
    /generate-consistent-image # 一致性圖片生成
    /generate-audio           # 音頻生成 (TTS)
    /extract-character-info    # 角色特徵提取
  /artbook        # 繪本相關頁面
  /create         # 創建繪本頁面
  /discovery      # 探索頁面
  /profile        # 個人檔案頁面
  /login          # 登入頁面
  /signup         # 註冊頁面
/components       # React 元件
  /ui             # shadcn/ui 元件庫
  /auth           # 認證相關組件
  /artbook        # 繪本創作組件
  /discovery      # 探索頁面組件
  /profile        # 個人資料組件
/lib              # 工具函數和 API 客戶端
  /api            # OpenAI API 整合
  /stores         # Zustand 狀態管理
/prisma           # 資料庫 schema 和遷移
/messages         # 翻譯檔案 (en.json, zh-TW.json)
```

## 🎨 設計系統
- **主色調**: 橘色 (#FF6900)
- **背景色**: 白色 (#FFFFFF)
- **側邊欄**: 淺橘色 (#FFEDD4)
- **字體**: Syne, Manrope, Comic Neue, Playfair Display
- **陰影效果**: Neumorphic 風格

## 🤖 AI 整合
### 文字生成 (GPT-4)
- **故事大綱生成** (`/api/generate-outline`)
  - 溫度: 0.7, 最大 tokens: 1000
  - 自動分頁功能
- **故事內容生成** (`/api/generate-story`)
- **角色特徵提取** (`/api/extract-character-info`)
  - 自動分析角色外觀特徵
  - 用於保持圖片一致性

### 圖片生成 (DALL-E 3)
- **基礎圖片生成** (`/api/generate-image`)
  - 模型: dall-e-3
  - 尺寸: 1024x1024
  - 品質: standard
- **一致性圖片生成** (`/api/generate-consistent-image`)
  - 智能角色特徵延續
  - 多頁面視覺一致性
- **優化特色**:
  - 兒童友善內容過濾
  - 無邊框純淨插畫
  - 卡通風格優化

### 音頻生成 (TTS-1)
- **語音合成** (`/api/generate-audio`)
  - 模型: TTS-1 with 'alloy' voice
  - 支援中英文內容

### 環境變數
- `OPENAI_API_KEY` (必需)
- `DATABASE_URL` (NeonDB PostgreSQL)
- `BETTER_AUTH_SECRET` (認證加密金鑰)

## 📈 當前進度
### ✅ 已完成功能
- [x] 基本專案架構和路由設定
- [x] **用戶認證系統 (Better Auth)** ⭐ 完成
- [x] **資料庫整合 (Prisma + NeonDB)** ⭐ 完成
- [x] 多語言支援框架 (中英文)
- [x] 側邊欄可收合功能 (270px ↔ 70px)
- [x] 創建繪本頁面 (多頁導航系統)
- [x] AI 故事生成整合 (GPT-4)
- [x] **圖片生成整合 (DALL-E 3)** ⭐ 完成
- [x] **圖片一致性系統** ⭐ 完成
- [x] **音頻生成整合 (TTS-1)** ⭐ 完成
- [x] 預覽和閱讀界面
- [x] 新設計系統實施 (橘色主題)
- [x] **社交功能 (按讚/評論)** ⭐ 完成
- [x] **個人檔案頁面** ⭐ 完成

### 🚧 進行中任務
- [ ] AWS S3 媒體儲存整合
- [ ] PDF/PNG 匯出功能
- [ ] 使用限制 (10本/天, 10頁/本)

### 📅 待開發功能
- [ ] 探索頁面進階篩選功能
- [ ] 繪本分享連結生成
- [ ] 管理員後台
- [ ] 行動裝置優化

## 🔥 核心功能詳解
### 圖片一致性系統
1. **智能角色記憶**：第1頁生成圖片後自動提取角色特徵
2. **延續性生成**：後續頁面自動融合角色特徵與新場景
3. **視覺一致性**：確保主角在所有頁面保持相同外觀
4. **用戶體驗**：橘色提示框顯示已記錄的角色特徵

### Create Artbook 頁面功能
- **雙欄佈局**：左側預覽區 + 右側編輯區
- **多頁導航**：頁碼切換、新增/刪除頁面
- **實時預覽**：生成的圖片即時顯示
- **重新生成**：圖片右上角一鍵重生成
- **智能提示**：不同頁面提供相應的輸入指引
- **用戶認證整合**：需登入才能創建
- **資料庫儲存**：完整的繪本資料保存

### 組件架構
**重要**: 每個組件都分割成獨立檔案以提高可維護性和重用性

```
components/
├── auth/
│   └── user-nav.tsx              # 用戶導航組件 (✅ 完成)
├── profile/
│   ├── profile-info-form.tsx     # 個人資料表單 (✅ 完成)
│   └── password-change-form.tsx  # 密碼變更表單 (✅ 完成)
├── artbook/
│   ├── artbook-metadata-form.tsx # 繪本元資料表單 (✅ 完成)
│   ├── page-preview.tsx          # 頁面圖片預覽 (✅ 完成)
│   ├── story-outline-section.tsx # 故事生成區域 (✅ 完成)
│   ├── image-generation-section.tsx # 圖片生成區域 (✅ 完成)
│   └── audio-generation-section.tsx # 音頻生成區域 (✅ 完成)
├── discovery/
│   ├── filters-bar.tsx           # 分類和排序篩選 (✅ 完成)
│   └── artbook-card.tsx          # 繪本卡片 (✅ 完成)
└── ui/                          # Reusable UI components (shadcn/ui)
```

## 🐛 已知問題
- [x] ~~圖片生成帶有書本邊框問題~~ (已解決)
- [ ] 側邊欄在某些情況下間距需要調整
- [ ] 行動裝置響應式設計待優化

## 💡 開發注意事項
1. **環境變數**: 確保設定 `OPENAI_API_KEY`, `DATABASE_URL`, `BETTER_AUTH_SECRET`
2. **圖片生成 PROMPT**: 避免使用 "children's book illustration" 等會產生邊框的詞彙
3. **圖片一致性**: 第1頁描述要詳細，包含角色外觀特徵
4. **TypeScript**: 編輯任何 TypeScript 檔案後執行 `npx tsc --noEmit`
5. **組件架構**: 每個組件應分割成獨立檔案，避免在 page.tsx 中寫所有組件
6. **Git 提交**: 使用描述性的提交訊息
7. **程式碼風格**: 遵循現有的程式碼慣例
8. **測試**: 在推送前確保功能正常運作
9. **文檔更新**: 重要更改請同步更新此文件

## 🎯 圖片生成最佳實踐
### 推薦 PROMPT 關鍵詞
- ✅ `clean illustration`, `flat design`, `cartoon style`
- ✅ `colorful artwork`, `digital painting`, `no borders`

### 避免的關鍵詞  
- ❌ `children's book illustration`, `storybook art`
- ❌ `book page`, `picture book`, `page illustration`

### PROMPT 模板
```
第1頁（封面）：[主角詳細外觀], [動作/姿勢], [環境背景], cartoon style, colorful, clean flat illustration, no borders
後續頁面：[場景描述], [動作], vibrant colors, cartoon illustration, clean artwork, no frames
```

## 🔐 認證系統
### Better Auth 整合
- **登入/註冊**: 完整的用戶認證流程
- **會話管理**: 安全的會話處理
- **用戶狀態**: Zustand store 管理認證狀態
- **保護路由**: 創建繪本需要登入

### 資料庫 Schema (Prisma)
主要實體：
- **Users**: 用戶資料
- **Artbooks**: 繪本資料 (標題、內容、可見性)
- **Pages**: 繪本頁面 (故事文字、圖片URL、音頻URL)
- **Likes**: 用戶按讚關係
- **Comments**: 評論系統 (支援回覆)
- **Views**: 瀏覽量追蹤

## 📝 工作日誌
### 2025-06-26 (第一次工作階段)
- 初始化 CLAUDE.md 文件
- 分析專案結構和文檔
- 設定開發環境記憶架構

### 2025-06-26 (第二次工作階段)
- ✅ **完成 DALL-E 3 圖片生成整合**
  - 建立 `/api/generate-image` 基礎圖片生成 API
  - 建立 `/api/generate-consistent-image` 一致性圖片生成 API
  - 建立 `/api/extract-character-info` 角色特徵提取 API
- ✅ **實作圖片一致性系統**
  - 智能角色記憶功能
  - 多頁面視覺延續性
  - 角色特徵自動提取與融合
- ✅ **優化 Create Artbook 頁面**
  - 圖片預覽區域升級
  - 重新生成按鈕整合
  - 角色特徵記錄顯示區域
  - 智能提示詞指引
- ✅ **解決圖片邊框問題**
  - 移除會產生書本邊框的關鍵詞
  - 優化 PROMPT 模板
  - 制定圖片生成最佳實踐指南
- ✅ **合併遠端更新**
  - 整合用戶認證系統 (Better Auth)
  - 整合資料庫功能 (Prisma + NeonDB)
  - 整合音頻生成功能 (TTS-1)
  - 整合社交功能 (按讚/評論)
  - 整合組件架構重構

---
**最後更新**: 2025-06-26 18:30
**更新者**: Claude Code

> 💡 **使用提示**: 每次開始新的工作階段時，請先查看此文件了解最新進度。完成重要更改後，請更新相關章節並提交。