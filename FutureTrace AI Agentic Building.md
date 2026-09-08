# Chuyển Đổi Hệ Thống Sang AI Knowledge Base & Kiến Trúc Agentic

Tài liệu này trình bày kế hoạch chuyển đổi hệ thống FutureTrace từ việc phụ thuộc hoàn toàn vào Gemini API sang tự chủ công nghệ AI với Hệ Cơ Sở Tri Thức (Knowledge Base) riêng và Kiến trúc Đa Đặc vụ (AI Agentic Workflow).

## 1. Phân Tích Hiện Trạng

**Hệ thống hiện tại:**
- **Frontend:** React/Vite, giao diện mô phỏng và hiển thị kết quả tĩnh.
- **Backend:** Node.js/Express.
- **AI Core:** Phụ thuộc 100% vào `geminiService.ts` gọi trực tiếp Gemini API với một prompt lớn (Monolithic Prompting) để trả về toàn bộ kịch bản và phân tích.

**Nhược điểm hiện tại:**
- **Thiếu thực tế (Hallucination):** LLM tự suy diễn kết quả mà không dựa trên dữ liệu thực tế (thống kê lương, xu hướng thị trường, chi phí sống thực).
- **Vendor Lock-in:** Phụ thuộc hoàn toàn vào Google Gemini.
- **Khó tinh chỉnh:** Một prompt khổng lồ rất khó để debug hoặc cải thiện chất lượng của từng phần nhỏ (như SWOT, hay tài chính).

---

## 2. Đề Xuất Kiến Trúc Mới: "FutureTrace Agentic Core"

Thay vì dùng 1 prompt để giải quyết mọi thứ, hệ thống sẽ được chia nhỏ thành các **Đặc vụ (Agents)** làm việc với một **Hệ cơ sở tri thức (Knowledge Base - RAG)** của riêng bạn.

### A. Hệ Cơ Sở Tri Thức Riêng (Custom Knowledge Base / RAG)
Đây là "bộ não thực tế" của hệ thống.
- **Dữ liệu:** Các báo cáo thị trường việc làm, chi phí sinh hoạt các thành phố, thông tin các trường đại học, và các quyết định thành công/thất bại trong quá khứ.
- **Công nghệ:** Vector Database (Qdrant, Milvus, hoặc PostgreSQL + pgvector). Sử dụng mô hình nhúng (Embedding) tiếng Việt (vd: `bkai-foundation-models/vietnamese-bi-encoder`).

### B. Kiến Trúc AI Agentic
Sử dụng framework như **LangGraph** hoặc **CrewAI** trên backend để điều phối các agents:
1. **Router Agent:** Tiếp nhận quyết định của user và phân loại (Career, Finance, Education).
2. **Researcher Agent (Trích xuất tri thức):** Tìm kiếm trong Vector DB các thông tin liên quan (vd: lương trung bình ngành IT năm 2026, học phí trường ĐH X).
3. **Simulator Agent (Mô phỏng):** Dùng dữ liệu thật từ Researcher kết hợp bối cảnh của user (Áp lực, Tài chính) để dự phóng 3 kịch bản. Sử dụng mô hình LLM mã nguồn mở (ví dụ: Llama-3-8B-Instruct hoặc Qwen-2.5 triển khai nội bộ).
4. **Critic/Reviewer Agent (Phản biện):** Đánh giá xem kịch bản của Simulator có logic không? Nếu phi thực tế -> Yêu cầu Simulator làm lại.
5. **Formatter Agent (Nhiệm vụ cho Gemini):** Gemini chỉ đóng vai trò nhỏ ở bước cuối cùng là định dạng dữ liệu thô thành chuẩn JSON (để đảm bảo frontend không bị lỗi parse).

---

## 3. Các Công Việc Cần Phải Làm (Action Plan)

> [!IMPORTANT]
> Quá trình chuyển đổi này sẽ tác động lớn đến Backend. Do hiện tại tôi chỉ thấy mã nguồn Frontend, kế hoạch dưới đây sẽ bao gồm cả những phần việc bạn cần thực hiện ở phía Backend.

### Giai đoạn 1: Xây Dựng Hệ Cơ Sở Tri Thức (Tuần 1-2) - BẢN CHI TIẾT

Trong giai đoạn này, mục tiêu là biến FutureTrace từ một hệ thống "nói suông" (chỉ dựa vào dự đoán của Gemini) thành một chuyên gia có số liệu thực tế (Data-driven).

#### Bước 1.1: Xác định Nguồn Dữ Liệu (Data Sources)
Bạn cần tập trung vào 3 nhóm dữ liệu chính cho đối tượng học sinh/sinh viên tại Việt Nam:

**1. Dữ liệu Tuyển dụng & Mức lương (Career & Salary Data):**
*   **Nơi lấy:**
    *   *TopCV, VietnamWorks, ITviec, Glints:* Tải các "Báo cáo thị trường nhân sự & Mức lương" hằng năm (thường dưới dạng PDF).
    *   *Trang web tuyển dụng:* Cào dữ liệu (Web Scraping) trực tiếp các JD (Job Description) để trích xuất: `Tên vị trí`, `Yêu cầu kinh nghiệm`, `Mức lương (Min-Max)`, `Kỹ năng yêu cầu`.
*   **Dạng dữ liệu cần lưu:** `[Tên Ngành] - [Mức Lương Fresher] - [Kỹ năng cần thiết]`

**2. Dữ liệu Giáo dục & Chi phí (Education Data):**
*   **Nơi lấy:**
    *   *Website các trường Đại học (VNU, HUST, NEU, RMIT...):* Cào dữ liệu phần "Tuyển sinh" và "Học phí".
    *   *Bộ Giáo dục và Đào tạo (moet.gov.vn):* Lấy thống kê về tỷ lệ chọi, điểm chuẩn các khối.
*   **Dạng dữ liệu cần lưu:** `[Tên Trường] - [Ngành Học] - [Điểm Chuẩn 3 năm gần nhất] - [Học phí/năm]`

**3. Dữ liệu Chi phí Sinh hoạt & Tài chính Cá nhân (Cost of Living):**
*   **Nơi lấy:**
    *   *Numbeo (Việt Nam):* Dữ liệu chi phí sống ở các thành phố lớn (Tiền thuê nhà, ăn uống, đi lại).
    *   *Tổng cục Thống kê (GSO):* Chỉ số giá tiêu dùng (CPI).
*   **Dạng dữ liệu cần lưu:** `[Thành phố] - [Chi phí Thuê nhà trung bình] - [Chi phí Sinh hoạt sinh viên]`

#### Bước 1.2: Cách thức Thu Thập & Làm Sạch (Scraping & Cleaning Pipeline)
*   **Công cụ Cào Dữ Liệu (Scraping):**
    *   Dùng Python với thư viện `Playwright` hoặc `Selenium` (cho các trang dùng React/Vue).
    *   Dùng thư viện `BeautifulSoup` (cho trang HTML tĩnh).
    *   Dùng thư viện `PyMuPDF` hoặc `pdfplumber` để trích xuất text từ các file PDF Báo cáo mức lương.
*   **Làm Sạch & Chia Nhỏ (Chunking):**
    *   Dữ liệu cào về thường rất rác. Cần dùng script Python xóa HTML tags, số liệu lỗi.
    *   **Chunking Strategy:** Sử dụng `LangChain` -> `RecursiveCharacterTextSplitter` cắt văn bản thành các đoạn nhỏ (khoảng 500 - 1000 tokens) nhưng vẫn giữ được ngữ cảnh (Overlap = 100 tokens).

#### Bước 1.3: Gắn Metadata (Vô cùng quan trọng cho AI Agentic)
Mỗi "Chunk" văn bản phải được gắn Metadata để `Researcher Agent` có thể lọc nhanh trước khi tìm kiếm ngữ nghĩa.
Ví dụ một record trước khi nhúng (Embed):
```json
{
  "content": "Mức lương trung bình của Lập trình viên Front-end (React) Fresher tại Hà Nội năm 2025 là từ 8 - 12 triệu VNĐ.",
  "metadata": {
    "category": "Career",
    "domain": "IT_Software",
    "location": "Ha Noi",
    "year": 2025
  }
}
```

#### Bước 1.4: Khởi Tạo Vector Database & Embedding
*   **Mô hình Nhúng (Embedding Model):** 
    *   *Tối ưu Tiếng Việt:* Sử dụng mô hình mã nguồn mở `bkai-foundation-models/vietnamese-bi-encoder` (chạy qua HuggingFace/SentenceTransformers) để biến text thành ma trận số (Vector).
*   **Hệ quản trị Vector (Vector DB):** 
    *   *Khuyến nghị:* **Qdrant** hoặc **Milvus**.
    *   *Lý do:* Qdrant hỗ trợ chạy qua Docker rất nhẹ, có API dễ dùng và quan trọng nhất là hỗ trợ **Payload Filtering** (Lọc theo Metadata kết hợp với tìm kiếm Vector - Rất quan trọng khi User chỉ muốn tìm lương ở "Hà Nội").
*   **Công việc cụ thể:** Viết một script Node.js (hoặc Python) để đọc file JSON đã làm sạch -> Gọi Embedding Model -> Push vào Qdrant Database.

### Giai đoạn 2: Xây Dựng Backend Agentic Workflow (Tuần 3-5)
- [ ] Tích hợp framework LangGraph hoặc LlamaIndex vào Backend Node.js (hoặc viết một Microservice bằng Python/FastAPI nếu muốn tận dụng hệ sinh thái AI tốt hơn).
- [ ] Lập trình các Agents: Researcher, Simulator, Critic.
- [ ] Triển khai mô hình Open-Source LLM cục bộ (dùng vLLM hoặc Ollama) làm Core AI. Tích hợp Gemini API chỉ cho tác vụ Formatter.

### Giai đoạn 3: Cập Nhật Frontend & Trải Nghiệm Người Dùng (Tuần 6-7)
- [ ] **Chuyển đổi sang Streaming (SSE / WebSockets):** Do Agentic workflow chạy qua nhiều bước sẽ mất thời gian hơn. Frontend cần hiển thị trạng thái theo thời gian thực (vd: *"Agent đang tìm kiếm học phí...", "Đang giả lập kịch bản..."*) để user không bị chán.
- [ ] Cập nhật `services/geminiService.ts` thành `services/aiService.ts` để gọi API Agentic mới.
- [ ] Thêm UI hiển thị "Nguồn tham khảo" (Citations) để chứng minh với user rằng AI đang dựa trên dữ liệu thật.

---

## 4. Đề Xuất Bổ Sung (Better Suggestions)

> [!TIP]
> **1. Human-in-the-Loop (Con người cùng tham gia vòng lặp)**
> Trong kiến trúc Agentic, nếu Researcher Agent không tìm thấy dữ liệu hoặc Simulator Agent thấy dữ kiện của user quá mơ hồ, hệ thống thay vì tự bịa ra (hallucinate) thì sẽ **tạm dừng và hỏi lại user**.
> *Ví dụ:* "Bạn định học trường Công hay Tư? Mức học phí bạn chịu được là bao nhiêu?" -> User trả lời -> Agent chạy tiếp. Điều này tạo ra trải nghiệm "Cố vấn 1-1" cực kỳ cao cấp.
>
> **2. Tái sử dụng dữ liệu Cộng Đồng (Community loop)**
> Các bài viết ẩn danh có ROI cao trên trang Community có thể được tự động làm sạch và đưa ngược lại vào Vector Database, biến chính dữ liệu người dùng thành tri thức cho hệ thống (Data Flywheel effect).

## User Review Required

Bạn có đồng ý với định hướng kiến trúc Agentic phân tách thành nhiều Agents và dùng cơ sở tri thức (Vector DB) như trên không? Bạn định triển khai phần Backend Agentic này bằng Node.js hay muốn tách ra một Microservice bằng Python? Hãy cho tôi biết để tôi có thể thiết kế cấu trúc thư mục và viết code chi tiết cho các phần tiếp theo.
