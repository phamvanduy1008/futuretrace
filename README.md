# FutureTrace - Decision Research System v4.0

## 📋 Tổng Quan Hệ Thống

**FutureTrace** là một nền tảng nghiên cứu quyết định được hỗ trợ bởi AI, cho phép người dùng mô phỏng và phân tích những hậu quả dài hạn của các quyết định sự nghiệp và tài chính quan trọng. Hệ thống sử dụng công nghệ AI (Google Gemini) để dự báo tương lai dựa trên dữ liệu mô phỏng từ người dùng.

**Tên hệ thống**: Decision Research System - Intelligence Simulation System v4.0  
**Slogan**: "Dự báo tương lai bằng dữ liệu mô phỏng"

---

## 🏗️ Kiến Trúc Hệ Thống

### Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React + Vite)                │
│  ┌───────────────┬──────────────┬──────────────────┐   │
│  │ Landing Page  │ Auth Module  │  Dashboard       │   │
│  │               │ (Login/Reg)  │  (Main Hub)      │   │
│  └───────────────┴──────────────┴──────────────────┘   │
│  ┌───────────────────────────────────────────────────┐  │
│  │    Simulation Flow  │  Premium Analysis          │  │
│  │    Community        │  Comparison Matrix         │  │
│  │    Payment          │  History/Progress          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕
        ┌──────────────────────────────────────────┐
        │     API Client Layer (apiClient.ts)      │
        │  - Token management & Auth interceptor  │
        │  - Token refresh flow                    │
        │  - Error handling                        │
        └──────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│             Backend API (Node.js/Express)               │
│  ┌──────────────┬──────────────┬─────────────────┐    │
│  │ Auth Module  │ Simulation   │ Community API   │    │
│  │ /api/auth    │ /api/sim     │ /community      │    │
│  └──────────────┴──────────────┴─────────────────┘    │
│  ┌──────────────┬──────────────┬─────────────────┐    │
│  │ Payment API  │ Premium API  │ Dashboard API   │    │
│  │ /api/payment │ /api/premium │ /api/dashboard  │    │
│  └──────────────┴──────────────┴─────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           ↕
        ┌──────────────────────────────────────────┐
        │     External Services & Database         │
        │  ┌──────────┬──────────┬───────────┐    │
        │  │ Gemini   │ Payment  │ MongoDB   │    │
        │  │ AI API   │ Gateway  │ Database  │    │
        │  │          │ (MoMo)   │           │    │
        │  └──────────┴──────────┴───────────┘    │
        └──────────────────────────────────────────┘
```

### Quy Trình Dữ Liệu (Data Flow)

1. **Người dùng nhập quyết định** → Simulation Flow
2. **Hệ thống thu thập context** → Factors (Stress, Finance, Risk, Academic, etc.)
3. **API gửi dữ liệu tới Backend** → Validate & Process
4. **Backend gọi Gemini AI** → Generate prediction scenarios
5. **Backend xử lý kết quả** → Structure & Analyze
6. **Trả về 3 scenarios** → Positive/Neutral/Risk outcomes
7. **Lưu vào Database** → User history
8. **Premium users** → Deep analysis & roadmap generation

---

## 🔧 Công Nghệ Stack

### Frontend
- **Framework**: React 19.2.4 (TypeScript)
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router DOM 7.13.0
- **Animation**: Framer Motion 11.11.11
- **Icons**: Phosphor Icons React 2.1.10
- **QR Code**: qrcode.react 4.2.0
- **Styling**: Tailwind CSS (implicit)

### Backend
- **Runtime**: Node.js
- **Framework**: Express (implicit from API endpoints)
- **Database**: MongoDB
- **AI Integration**: Google Gemini API v1.38.0
- **Authentication**: JWT (Bearer Token)
- **Payment**: MoMo, VNPay gateway

### DevTools
- **Language**: TypeScript 5.8.2
- **Linting**: TSC (noEmit)
- **Package Manager**: npm

---

## 🎯 Các Chức Năng Chính

### 1. **Mô Phỏng Quyết Định (Simulation Flow)**
- Người dùng nhập mô tả quyết định
- Cung cấp context thông qua 5 chỉ số:
  - **Stress level** (1-5): Áp lực tâm lý
  - **Personal Finance** (1-5): Tình hình tài chính cá nhân
  - **Risk factor** (1-5): Mức độ rủi ro chấp nhận
  - **Academic Performance** (1-5): Chỉ số học lực/chuyên môn
  - **Other Factors** (text): Các yếu tố khác
- Gemini AI phân tích và tạo **3 kịch bản**:
  - **Positive Scenario**: Kết quả tốt nhất
  - **Neutral Scenario**: Trường hợp trung bình
  - **Risk Scenario**: Trường hợp tồi tệ nhất

### 2. **Phân Tích Chi Tiết (Premium Analysis)**
Chỉ cho Premium users:
- **Phân tích SWOT**:
  - Strengths (Điểm mạnh)
  - Weaknesses (Điểm yếu)
  - Opportunities (Cơ hội)
  - Threats (Mối đe dọa)
  
- **Phân bổ Tài Nguyên**:
  - Tài chính
  - Thời gian
  - Năng lực
  - Mối quan hệ
  
- **Lộ Trình 90 Ngày** (Sprint Planning):
  - Phase 1, 2, 3, 4
  - Tasks cụ thể cho mỗi phase
  
- **Chiến Lược Giảm Thiểu Rủi Ro**:
  - Xác định rủi ro chính
  - Phương án ứng phó
  
- **Tư Vấn Chiến Thuật**:
  - Critical advice từ AI

### 3. **Dashboard Trung Tâm**
- Thống kê tổng quát:
  - Số mô phỏng đã thực hiện
  - Số báo cáo đã tạo
  - Tác động/Impact
- Mô phỏng gần đây
- Báo cáo được lưu
- Quick access tới các chức năng chính

### 4. **Cộng Đồng (Community)**
- **Chia sẻ kịch bản**:
  - Người dùng có thể chia sẻ kết quả mô phỏng công khai hoặc ẩn danh
  - Gắn tag category
  
- **Tương Tác**:
  - Like/Unlike bài viết
  - Bình luận
  - Phân trang
  
- **Tìm Kiếm & Lọc**:
  - Filter by category
  - Search by keywords
  - Phân trang (3 bài/trang)

### 5. **Quản Lý Lịch Sử & Tiến Độ**
- **History**: Xem tất cả mô phỏng đã thực hiện
- **Progress**: Tracking tiến độ thực hiện các kịch bản
- **Scenario Detail**: Chi tiết mỗi kịch bản

### 6. **Ma Trận So Sánh (Comparison Matrix)**
- So sánh nhiều kịch bản cùng lúc
- Phân tích dạng bảng
- Hiển thị các chỉ số side-by-side

### 7. **Hệ Thống Thanh Toán**
- **Hỗ trợ 2 gateway**:
  - MoMo (Ví điện tử)
  - VNPay (Cổng thanh toán)
  
- **Luồng**:
  1. Chọn plan nâng cấp
  2. Nhập thông tin (Tên, Địa chỉ)
  3. Chọn phương thức thanh toán
  4. Quét mã QR hoặc chuyển hướng
  5. Verify thanh toán
  6. Cập nhật tier user

### 8. **Hệ Thống Tài Khoản**
- **Đăng ký**: Email, Password, Full Name, Role
- **Đăng nhập**: Email, Password
- **Quản lý Profile**: Avatar, Bio, Role
- **Session Management**: Token + Refresh token

### 9. **Admin Panel** (pages/admin/)
- Quản lý người dùng
- Quản lý mô phỏng
- Thống kê hệ thống
- Quản lý thanh toán

---

## 💰 Mô Hình Giá & User Tiers

### 📊 Bảng So Sánh Plans

| Tính Năng | Free | Premium | Enterprise |
|-----------|------|---------|-----------|
| Giá | 0đ (miễn phí) | 299.000đ/tháng | Liên hệ |
| Mô phỏng | 3 kịch bản | Không giới hạn | Không giới hạn |
| Lưu trữ báo cáo | Max 5 | Không giới hạn | Không giới hạn |
| Phân tích SWOT | Cơ bản | Nâng cao | Nâng cao tùy chỉnh |
| Timeline | Đơn giản | Chi tiết | Chi tiết + Pivot |
| Tư vấn AI | Không | Cơ bản | Riêng cho doanh nghiệp |
| Xuất báo cáo | Không | HTML | PDF/Excel |
| Quản lý đội | Không | Không | Có |
| Hỗ trợ | Cộng đồng | Ưu tiên | Dedicated |

### Quy Trình Nâng Cấp
```
Free User
    ↓
Click "Nâng cấp ngay" button
    ↓
Navigate to /premium → Chọn plan
    ↓
Navigate to /payment → Nhập thông tin + chọn gateway
    ↓
Hiển thị QR Code / Redirect to gateway
    ↓
Check status mỗi 30 giây
    ↓
Payment confirmed (resultCode = 0)
    ↓
Redirect to /payment-result
    ↓
Backend update user.tier = "premium"
    ↓
Access Premium features
```

---

## 📁 Cấu Trúc Dự Án

```
futuretrace/
├── 📄 App.tsx                          # Root component + routing
├── 📄 index.tsx                        # React DOM render
├── 📄 index.html                       # HTML template
├── 📄 index.css                        # Global styles
├── 📄 types.ts                         # TypeScript types & interfaces
├── 📄 vite.config.ts                   # Vite configuration
├── 📄 tsconfig.json                    # TypeScript config
├── 📄 package.json                     # Dependencies
├── 📄 metadata.json                    # App metadata
│
├── 📁 components/                      # Reusable components
│   ├── AnimatedBackground.tsx          # Background animation
│   ├── IconMapper.tsx                  # Icon management
│   ├── SharedHeader.tsx                # Header component
│   └── SharedFooter.tsx                # Footer component
│
├── 📁 pages/                           # Page components
│   ├── LandingPage.tsx                 # Landing/home page
│   ├── LoginPage.tsx                   # User login
│   ├── RegisterPage.tsx                # User registration
│   ├── DashboardPage.tsx               # Main dashboard hub
│   ├── SimulationFlow.tsx              # Decision simulation
│   ├── PremiumAnalysisPage.tsx         # Premium deep analysis
│   ├── CommunityPage.tsx               # Community posts & sharing
│   ├── HistoryPage.tsx                 # View past simulations
│   ├── ProgressPage.tsx                # Track progress
│   ├── ScenarioDetailPage.tsx          # Single scenario detail
│   ├── ComparisonMatrixPage.tsx        # Compare multiple scenarios
│   ├── RiskAnalysisPage.tsx            # Risk assessment
│   ├── PremiumPage.tsx                 # Pricing & upgrade
│   ├── PaymentPage.tsx                 # Payment processing
│   ├── PaymentResultPage.tsx           # Payment confirmation
│   │
│   └── 📁 admin/                       # Admin panel
│       ├── AdminApp.jsx                # Admin app root
│       ├── ui.jsx                      # Admin UI components
│       ├── api.js                      # Admin API calls
│       └── admin.css                   # Admin styles
│
├── 📁 services/                        # Business logic & API calls
│   ├── authService.ts                  # Auth operations (login, register, logout)
│   ├── apiClient.ts                    # Base HTTP client + token management
│   ├── api.ts                          # General API utilities
│   ├── geminiService.ts                # Gemini AI integration
│   └── communityService.ts             # Community operations (posts, likes, comments)
│
├── 📁 data/                            # Data layer
│   └── mockDatabase.ts                 # Local data management
│
├── 📁 public/                          # Static assets
│   └── _redirects                      # Deployment redirects
│
└── 📁 .git/                            # Git repository
```

---

## 🔌 Dịch Vụ & API Tích Hợp

### 1. **Authentication Service** (`authService.ts`)
```typescript
- login(email, password)           // Đăng nhập
- register(userData)               // Đăng ký
- logout()                         // Đăng xuất
- getCurrentUser()                 // Lấy user hiện tại từ localStorage
- getUserProfile()                 // Fetch profile từ backend
```

### 2. **API Client** (`apiClient.ts`)
```typescript
- apiFetch(path, options)          // Base HTTP client với auth
- Token Management:
  - getToken() / setToken()
  - getRefreshToken() / setRefreshToken()
- Auto token refresh on 401
- Error handling & retry logic
```

### 3. **Gemini AI Service** (`geminiService.ts`)
```typescript
- generateSimulation(data)              // Tạo 3 kịch bản dự báo
  Input: decision, stress, finance, risk, academic, otherFactors
  Output: 3 scenarios với scores (careerGrowth, happiness, roi)

- generatePremiumAnalysis()             // Deep analysis cho premium users
  Output: SWOT, Resources, Sprint90, Risk mitigation

- pivotPremiumAnalysis()                // Điều chỉnh lộ trình dựa trên feedback
  Input: currentReport, completedMilestones, feedback
  Output: Updated report
```

### 4. **Community Service** (`communityService.ts`)
```typescript
- getPosts(page, limit, filter, q)     // Lấy danh sách bài viết
- publishPost(data)                    // Chia sẻ kịch bản
- toggleLike(postId)                   // Like/unlike
- deletePost(postId)                   // Xóa bài viết
- getComments(postId)                  // Lấy bình luận
```

### 5. **Backend API Endpoints**

#### Authentication
```
POST   /api/auth/login              // Đăng nhập
POST   /api/auth/register           // Đăng ký
POST   /api/auth/refresh            // Refresh token
GET    /api/auth/me                 // Lấy profile người dùng
```

#### Simulations
```
POST   /api/simulations             // Tạo mô phỏng mới
GET    /api/simulations             // Danh sách mô phỏng của user
GET    /api/simulations/:id         // Chi tiết mô phỏng
DELETE /api/simulations/:id         // Xóa mô phỏng
```

#### Premium Analysis
```
POST   /api/premium/analyze         // Tạo deep analysis
POST   /api/premium/pivot           // Điều chỉnh lộ trình
GET    /api/premium/reports         // Danh sách báo cáo premium
```

#### Community
```
GET    /api/community/posts         // Danh sách bài viết (có pagination + filter)
POST   /api/community/posts         // Chia sẻ bài viết mới
POST   /api/community/posts/:id/like    // Toggle like
DELETE /api/community/posts/:id     // Xóa bài viết
GET    /api/community/posts/:id/comments   // Lấy comments
POST   /api/community/posts/:id/comments   // Thêm comment
```

#### Dashboard
```
GET    /api/dashboard/summary       // Tổng quát user stats + recent simulations
```

#### Payment
```
POST   /api/payment/create          // Tạo đơn thanh toán (Momo/VNPay)
POST   /api/payment/check-status    // Kiểm tra trạng thái thanh toán
GET    /api/payment/history         // Lịch sử giao dịch
```

---

## 📊 Data Models & Types

### User Model
```typescript
interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  avatar_url?: string;
  role: string;                    // e.g., "student", "professional"
  tier: "free" | "premium" | "enterprise";
  bio?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Simulation Data
```typescript
interface SimulationData {
  decision: string;                // Mô tả quyết định
  stress: number;                  // 1-5
  personalFinance: number;         // 1-5
  risk: number;                    // 1-5
  academicPerformance: number;     // 1-5
  otherFactors?: string;           // Text
  tier: "free" | "premium";
}

interface ScenarioResult {
  id?: string;
  title: string;
  description: string;
  careerGrowth: number;            // Score 0-100
  happiness: number;               // Score 0-100
  roi: number;                     // Score 0-100
  type: "Positive" | "Neutral" | "Risk";
  deepAnalysis?: {
    swot: SWOT[];
    resources: Resource[];
    sprint90: SprintPhase[];
    criticalAdvice: string;
    riskMitigation?: string;
  };
}

interface PremiumAnalysisReport {
  detailedNarrative: string;
  milestones: Milestone[];
  influencingFactors: Factor[];
  strategicPivotPoints: PivotPoint[];
  longTermProjection: string;
}
```

### Community Post
```typescript
interface CommunityPost extends ScenarioResult {
  id: string;
  author: string;
  authorAvatar?: string;
  isAnonymous: boolean;
  date: string;
  likes: number;
  commentsCount: number;
  category: string;
  reliability: number;
}
```

---

## 🔄 Luồng Nghiệp Vụ Chính

### Luồng 1: Mô Phỏng Quyết Định (Free & Premium)

```
START
  ↓
User không đăng nhập? → Redirect /login
  ↓
User click "Chạy mô phỏng đầu tiên"
  ↓
SimulationFlow Page Load
  ↓
STEP 1: DESCRIPTION
  - User nhập mô tả quyết định
  - Click Next
  ↓
STEP 2: CONTEXT
  - User chỉnh 5 factors (Stress, Finance, Risk, Academic, Other)
  - Mặc định: 3/5 cho mỗi factor
  - Click "Xác nhận & Phân tích"
  ↓
STEP 3: PROCESSING
  - Show loading bar (0-95%)
  - Backend: geminiService.generateSimulation()
  - Gemini AI tạo 3 scenarios
  - Backend save vào database
  ↓
STEP 4: RESULTS
  - Display 3 scenarios:
    • Positive: Kết quả tốt
    • Neutral: Kết quả trung bình
    • Risk: Kết quả xấu
  - Mỗi scenario có:
    • Title & Description
    • Scores (careerGrowth, happiness, roi)
    • Visual representation
  ↓
User Actions:
  a) View Details → ScenarioDetailPage
  b) Share to Community → Modal publish
  c) Save to History → saveToHistory()
  d) Nâng cấp Premium? → /premium page
  e) Try Another? → Reset SimulationFlow
  ↓
END
```

### Lualexandru 2: Premium Deep Analysis

```
START
  ↓
Premium User click scenario → ScenarioDetailPage
  ↓
Click "Phân tích Chuyên Sâu" (chỉ for premium users)
  ↓
Page transitions to PremiumAnalysisPage
  ↓
Backend: geminiService.generatePremiumAnalysis()
  - Input: scenario title, description, context data
  - Output: Detailed report với:
    • Detailed Narrative (1000+ words)
    • Milestones (6-12 months roadmap)
    • Influencing Factors (PESTLE analysis)
    • Strategic Pivot Points
    • Long-term Projection (5-10 years)
  ↓
Display Analysis:
  - SWOT Matrix (4 quadrants)
  - Resource Allocation (Time, Money, Skills, Network)
  - 90-day Sprint (4 phases with tasks)
  - Risk Mitigation strategies
  - Critical Advice from AI
  ↓
User can:
  a) Read & Analyze
  b) Export Report (PDF/Excel) - Enterprise only
  c) Pivot Analysis (update & regenerate)
  ↓
Pivot Flow:
  - User mark "Milestones completed"
  - User enter feedback/progress
  - Click "Điều chỉnh lộ trình"
  - Backend: pivotPremiumAnalysis()
  - Report updated based on new progress
  ↓
END
```

### Luồng 3: Cộng Đồng & Chia Sẻ

```
START
  ↓
User view scenario results
  ↓
Click "Chia sẻ trong cộng đồng"
  ↓
Modal opens:
  - Input: Title, Description (auto-filled from scenario)
  - Choose: Public or Anonymous
  - Select: Category (Career, Finance, Education, etc.)
  ↓
User click "Chia sẻ"
  ↓
Backend: communityService.publishPost()
  - Save to community_posts collection
  - Author = user.id or "Anonymous"
  ↓
Show success notification
  ↓
Redirect to CommunityPage
  ↓
Post appears in community feed
  ↓
OTHER USERS:
  - View posts (paginated, 3/page)
  - Like/Unlike posts
  - Filter by category
  - Search by keywords
  - View comments
  - Add comments (if premium)
  ↓
END
```

### Luồng 4: Thanh Toán & Nâng Cấp

```
START
  ↓
Free User click "Nâng cấp Premium"
  ↓
Navigate to /premium (PremiumPage)
  ↓
Display 3 plans:
  - Free (current)
  - Premium (with "Nâng cấp ngay" button)
  - Enterprise
  ↓
Click "Nâng cấp ngay"
  ↓
Navigate to /payment with plan info
  ↓
PaymentPage:
  1. Display plan details + price
  2. Input personal info (Name, Address)
  3. Choose payment method:
     a) MoMo (e-wallet)
     b) VNPay (bank)
  4. Calculate total with VAT (10%)
  ↓
Click "Thanh toán"
  ↓
Backend: POST /api/payment/create
  - Generate order ID
  - Call MoMo/VNPay API
  - Get QR code URL
  ↓
Display QR Modal:
  - Show QR code
  - Instructions: Scan & pay
  - Countdown timer (10 minutes)
  ↓
Frontend: Poll /api/payment/check-status
  - Every 30 seconds
  - Max 20 attempts (10 minutes)
  - Check if payment resultCode = 0
  ↓
PAYMENT SUCCESS:
  - resultCode = 0
  - Redirect to /payment-result?resultCode=0
  - Show success message
  - Backend update user.tier = "premium"
  ↓
PAYMENT FAILED:
  - resultCode != 0
  - Show error message
  - Allow retry
  ↓
TIMEOUT (10 min passed):
  - Dismiss QR modal
  - Show: "Transaction expired"
  ↓
END
```

### Luồng 5: Xác Thực & Quản Lý Session

```
START
  ↓
App Initialization (App.tsx)
  ↓
Check localStorage.getItem('token')
  ↓
IF token exists:
  - setIsInitializing(true)
  - Call getUserProfile() to verify token
  - IF valid: setIsAuthenticated(true)
  - IF invalid: logout(), setIsAuthenticated(false)
  - setIsInitializing(false)
  ↓
ELSE:
  - setIsAuthenticated(false)
  - setIsInitializing(false)
  ↓
Listen to events:
  - window.storage event (token change in other tabs)
  - auth-unauthorized event (401 response)
  ↓
Protected Routes:
  - /dashboard, /simulate, /community, etc.
  - IF !isAuthenticated → Redirect /login
  - IF isAuthenticated → Render component
  ↓
Login Flow:
  - User input email + password
  - POST /api/auth/login
  - Backend returns: { accessToken, user, refreshToken? }
  - Save token to localStorage
  - Save user info to localStorage
  - setIsAuthenticated(true)
  - Redirect to /dashboard
  ↓
Token Expiry:
  - API returns 401 with code 'TOKEN_EXPIRED'
  - apiClient auto-call POST /api/auth/refresh
  - IF refresh successful: get new token & retry request
  - IF refresh failed: logout() & redirect /login
  ↓
Logout:
  - Clear localStorage (token, user, etc.)
  - setIsAuthenticated(false)
  - Redirect /login
  ↓
END
```

---

## 🎨 UI/UX Highlights

### Design System
- **Color Scheme**: 
  - Primary: Blue (rgb(37, 99, 235))
  - Secondary: Slate (gray palette)
  - Backgrounds: White + gradient overlays
  
- **Typography**:
  - Display font: Bold, uppercase tracking
  - Body: Medium weight, readable contrast
  
- **Animations**:
  - Framer Motion for page transitions
  - Stagger animations for list items
  - Smooth fade-in/out effects

### Key UI Components
- **AnimatedBackground**: Animated particle/gradient background
- **SharedHeader**: Navigation with user menu
- **SharedFooter**: Footer with links
- **IconMapper**: Centralized icon management (Phosphor Icons)

---

## 🚀 Deployment & Environment

### Environment Variables
```
VITE_API_BASE_URL=https://futuretrace-server.onrender.com
GOOGLE_GEMINI_API_KEY=<from .env>
MOMO_API_KEY=<from .env>
VNPAY_API_KEY=<from .env>
```

### Build & Run
```bash
# Development
npm run dev                    # Start Vite dev server

# Build for production
npm run build                  # Create dist/ folder

# Type checking
npm run lint                   # Run TypeScript check

# Preview production build
npm run preview               # Preview dist/ locally
```

### Deployment Platforms
- **Frontend**: Netlify, Vercel (with _redirects)
- **Backend**: Heroku, Render (deployed at https://futuretrace-server.onrender.com)

---

## 📈 Metrics & KPIs

### User Engagement
- Simulations per user (Free: 3, Premium: unlimited)
- Community posts published
- Like/comment activity
- Repeat user rate

### Business Metrics
- Free to Premium conversion rate
- Average revenue per premium user
- Churn rate
- Monthly active users

### System Performance
- AI response time (Gemini API)
- Payment gateway success rate
- API uptime
- Database query performance

---

## 🔐 Security Considerations

### Authentication & Authorization
- JWT tokens with expiry
- Automatic token refresh
- Protected routes check authentication
- Role-based access (user roles)

### Data Protection
- Password hashing on backend
- HTTPS for all API calls
- CORS configuration for frontend
- Input validation & sanitization

### Privacy
- Anonymous community posts
- User profile visibility settings
- Data export capabilities
- GDPR compliance (implicit)



## 📝 Future Enhancements

### V5.0 Roadmap
1. **Real-time Collaboration**: Multiple users on same scenario
2. **Advanced Analytics**: Custom metrics & KPI tracking
3. **Mobile App**: React Native version
4. **Integrations**: Slack, Notion, Google Calendar
5. **AI Improvements**: Multi-language support, custom models
6. **Social Features**: User profiles, following, messaging
7. **Blockchain**: Scenario NFTs, smart contracts for milestones
8. **Gamification**: Badges, leaderboards, achievements

---

## 🤝 Contributing

### Development Guidelines
- Use TypeScript for type safety
- Follow React best practices (hooks, functional components)
- Commit messages: `[FEATURE/FIX/DOCS] Short description`
- Create feature branches from main

### Testing
- Unit tests for services (jest)
- Integration tests for API flows
- E2E tests for critical user journeys

---

## 📞 Support & Documentation

- **Technical Docs**: [Backend Repository]
- **API Docs**: Swagger at `/api/docs`
- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Discussions

---

## 📄 License

Copyright © 2024 FutureTrace. All rights reserved.

---

## 👥 Team

- **Product**: Decision Research Platform Team
- **AI/ML**: Gemini API Integration
- **Backend**: Node.js/Express/MongoDB Team
- **Frontend**: React/Vite Team

---

**Last Updated**: June 2024  
**Version**: 4.0  
**Status**: Production Ready ✅
