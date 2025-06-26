# CLAUDE.md - AI Artbook Platform Development Memory

## 🎯 專案概述
**專案名稱**: AI Artbook Platform (品牌名: Storyr)
**專案描述**: 使用 AI 創建、瀏覽和分享圖畫書的線上平台
**GitHub Repo**: https://github.com/Meowbotz-ll/ai-storybook
**技術棧**: Next.js 15, React, shadcn/ui, OpenAI API, Prisma, NeonDB

## 📋 重要指令
```bash
# 開發環境
npm run dev       # 啟動開發伺服器 (port 3000)
npm run build     # 建構生產版本
npm run lint      # 執行程式碼檢查

# Git 工作流程
git pull origin master    # 開始工作前同步
git add .                 # 暫存更改
git commit -m "訊息"      # 提交更改
git push origin master    # 推送到遠端
```

## 🏗️ 專案結構
```
/app              # Next.js App Router 頁面
  /api            # API 路由 (generate-outline, generate-story)
  /artbook        # 繪本相關頁面
  /create         # 創建繪本頁面
  /discovery      # 探索頁面
  /profile        # 個人檔案頁面
/components       # React 元件
  /ui             # shadcn/ui 元件庫
/docs             # 專案文檔
/i18n             # 國際化設定
/lib              # 工具函數和 API 客戶端
/messages         # 翻譯檔案 (en.json, zh-TW.json)
```

## 🎨 設計系統
- **主色調**: 橘色 (#FF6900)
- **背景色**: 白色 (#FFFFFF)
- **側邊欄**: 淺橘色 (#FFEDD4)
- **字體**: Syne, Manrope, Comic Neue, Playfair Display
- **陰影效果**: Neumorphic 風格

## 🤖 AI 整合
- **模型**: OpenAI GPT-4
- **用途**: 
  - 故事大綱生成 (`/api/generate-outline`)
  - 完整故事內容生成 (`/api/generate-story`)
- **參數**: Temperature: 0.7, Max tokens: 1000
- **環境變數**: `OPENAI_API_KEY`

## 📈 當前進度
### ✅ 已完成功能
- [x] 基本專案架構和路由設定
- [x] 多語言支援框架 (中英文)
- [x] 側邊欄可收合功能 (270px ↔ 70px)
- [x] 創建繪本頁面 (多頁導航系統)
- [x] AI 故事生成整合
- [x] 預覽和閱讀界面
- [x] 新設計系統實施 (橘色主題)

### 🚧 進行中任務
- [ ] 使用者認證系統 (Better Auth)
- [ ] 圖片生成整合 (DALL-E/Stable Diffusion)
- [ ] 語音合成功能 (TTS)

### 📅 待開發功能
- [ ] AWS S3 媒體儲存
- [ ] 使用限制 (10本/天, 10頁/本)
- [ ] 探索頁面 (搜尋/篩選)
- [ ] 社交功能 (按讚/評論)
- [ ] PDF/PNG 匯出
- [ ] 個人檔案頁面

## 🐛 已知問題
- [ ] 側邊欄在某些情況下間距需要調整
- [ ] 行動裝置響應式設計待優化

## 💡 開發注意事項
1. **環境變數**: 確保設定 `OPENAI_API_KEY`
2. **Git 提交**: 使用描述性的提交訊息
3. **程式碼風格**: 遵循現有的程式碼慣例
4. **測試**: 在推送前確保功能正常運作
5. **文檔更新**: 重要更改請同步更新此文件

## 📝 工作日誌
### 2025-06-26
- 初始化 CLAUDE.md 文件
- 分析專案結構和文檔
- 設定開發環境記憶架構

---
**最後更新**: 2025-06-26
**更新者**: Claude Code

> 💡 **使用提示**: 每次開始新的工作階段時，請先查看此文件了解最新進度。完成重要更改後，請更新相關章節並提交。