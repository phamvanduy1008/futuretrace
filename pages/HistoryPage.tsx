import { AnimatedBackground } from "../components/AnimatedBackground";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SharedHeader from "../components/SharedHeader";
import SharedFooter from "../components/SharedFooter";

import { apiFetch } from "../services/apiClient";
import { IconMapper } from "../components/IconMapper";

const ITEMS_PER_PAGE = 5;

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch(
        `/simulations?saved=${activeTab === "saved"}`,
      );
      if (response.ok) {
        const data = await response.json();
        setHistoryItems(data.items);
      } else {
        const errData = await response.json();
        setError(errData.message || "Không thể tải lịch sử.");
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Có lỗi xảy ra khi kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setExpandedFolders({});
    fetchHistory();
  }, [activeTab]);

  const toggleFolder = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleSave = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const isCurrentlySaved = item.isSaved;
    try {
      const response = await apiFetch(`/simulations/${item.id}/save`, {
        method: isCurrentlySaved ? "DELETE" : "POST",
      });
      if (response.ok) {
        // Optimistic update or just refetch
        setHistoryItems((prev) =>
          prev.map((i) => {
            if (i.id === item.id) return { ...i, isSaved: !isCurrentlySaved };
            return i;
          }),
        );

        // If we are in 'saved' tab and just unsaved, we might want to remove it
        if (activeTab === "saved" && isCurrentlySaved) {
          setHistoryItems((prev) => prev.filter((i) => i.id !== item.id));
        }
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  // Reset về trang 1 khi tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredItems = historyItems.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Logic phân trang
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (
      window.confirm("Bạn có chắc chắn muốn xóa kịch bản này khỏi lịch sử?")
    ) {
      try {
        const response = await apiFetch(`/simulations/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          fetchHistory();
        } else {
          alert("Không thể xóa kịch bản.");
        }
      } catch (err) {
        console.error("Error deleting simulation:", err);
        alert("Có lỗi xảy ra khi xóa.");
      }
    }
  };

  return (
    <AnimatedBackground className="min-h-screen bg-white flex flex-col font-sans">
      <SharedHeader />

      <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-8 py-10 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-6xl font-black tracking-tight mb-4 font-display text-slate-900 leading-[1.8] uppercase italic">Lịch sử Quyết định
            </h1>

            <p className="text-slate-600 text-sm sm:text-lg max-w-2xl leading-relaxed font-medium">
              Kho lưu trữ bảo mật các kịch bản mô phỏng đa thời gian đã thực
              thi.
            </p>
          </div>
          <button
            onClick={() => navigate("/simulate")}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-50"
          >
            <IconMapper name="add" className=" font-bold" /> Tạo mới
          </button>
        </div>

        <div className="flex items-center gap-8 mb-10 border-b border-slate-100 pb-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === "all"
              ? "text-blue-600"
              : "text-slate-400 hover:text-slate-600"
              }`}
          >
            Toàn bộ lịch sử
            {activeTab === "all" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === "saved"
              ? "text-blue-600"
              : "text-slate-400 hover:text-slate-600"
              }`}
          >
            Đã lưu
            {activeTab === "saved" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
              />
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 pb-8">
          <div className="relative w-full sm:flex-1">
            <IconMapper
              name="search"
              className=" absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium"
              placeholder={
                activeTab === "all"
                  ? "Tìm kiếm kịch bản hoặc danh mục..."
                  : "Tìm kiếm trong mục đã lưu..."
              }
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="flex-1 bg-white border border-slate-100 rounded-xl py-3.5 pl-4 pr-10 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-blue-600">
              <option>Mới nhất</option>
              <option>ROI cao nhất</option>
            </select>
          </div>
        </div>

        <div className="space-y-6 mb-16">
          {loading && (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-bold">Đang tải dữ liệu...</p>
            </div>
          )}{" "}
          {!loading && (
            <AnimatePresence>
              {currentItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    onClick={() => {
                      if (item.isFolder) {
                        toggleFolder(
                          { stopPropagation: () => { } } as any,
                          item.id,
                        );
                      } else {
                        navigate(`/detail/${item.id}`, {
                          state: { scenario: item },
                        });
                      }
                    }}
                    className={`group bg-white border-2 ${item.isFolder ? "border-blue-100 bg-blue-50/10" : "border-slate-100"} p-6 sm:p-8 hover:border-blue-600 hover:ring-4 hover:ring-blue-600/20 transition-all cursor-pointer rounded-2xl relative overflow-hidden`}
                  >
                    {item.isFolder && (
                      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <IconMapper
                          name="folder_open"
                          className=" text-6xl text-blue-600"
                        />
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <span
                            className={`${item.isFolder ? "text-blue-600" : "text-slate-600"}`}
                          >
                            {item.isFolder
                              ? "THƯ MỤC MÔ PHỎNG"
                              : item.category === "Positive" ||
                                item.category === "positive" ||
                                item.category === "Success"
                                ? "Tích cực"
                                : item.category === "Risk" ||
                                  item.category === "risk"
                                  ? "Rủi ro"
                                  : item.category === "Neutral" ||
                                    item.category === "neutral"
                                    ? "Ổn định"
                                    : item.category}
                          </span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full hidden sm:block"></span>
                          <span>{item.date}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full hidden sm:block"></span>
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">
                            {item.id}
                          </span>
                          {item.isFolder && (
                            <>
                              <span className="w-1 h-1 bg-slate-200 rounded-full hidden sm:block"></span>
                              <span className="text-blue-600">3 KỊCH BẢN</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {item.isFolder && (
                            <IconMapper
                              name="folder"
                              className=" text-blue-600"
                            />
                          )}
                          <h3 className="text-lg sm:text-xl font-bold group-hover:text-blue-600 transition-colors font-display text-slate-900 leading-tight">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-3xl line-clamp-2 sm:line-clamp-none font-medium">
                          {item.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                        <div className="text-left sm:text-right min-w-[100px] sm:min-w-[120px]">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            ROI TRUNG BÌNH
                          </p>
                          <div className="flex items-center sm:justify-end gap-3">
                            <div className="w-20 sm:w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={false}
                                animate={{
                                  width: `${item.metrics?.roi || 0}%`,
                                }}
                                className={`h-full ${item.metrics?.roi > 80 ? "bg-emerald-500" : "bg-blue-600"}`}
                                transition={{ duration: 0.6 }}
                              />
                            </div>
                            <span className="text-xs sm:text-sm font-black text-slate-900">
                              {item.metrics?.roi || 0}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleSave(e, item)}
                            className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-sm ${item.isSaved
                              ? "bg-blue-600 text-white shadow-blue-200"
                              : "bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                              }`}
                            title={item.isSaved ? "Bỏ lưu" : "Lưu kịch bản"}
                          >
                            <IconMapper
                              name="bookmark"
                              className={` text-xl ${item.isSaved ? "fill-white" : ""}`}
                            />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                            title="Xóa kịch bản"
                          >
                            <IconMapper name="delete" className=" text-xl" />
                          </button>
                          <IconMapper
                            name={
                              item.isFolder ? "expand_more" : "arrow_forward"
                            }
                            className={` text-slate-300 group-hover:text-blue-600 transition-all ${item.isFolder && expandedFolders[item.id] ? "rotate-90" : ""}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-items for folders */}
                  <AnimatePresence>
                    {item.isFolder && expandedFolders[item.id] && (
                      <motion.div
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0 }}
                        style={{ transformOrigin: "top" }}
                        transition={{ duration: 0.25 }}
                        className="ml-8 mt-[12px] sm:ml-16 space-y-3 border-l-2 border-blue-100 pl-6 sm:pl-10 overflow-hidden mb-6"
                      >
                        {item.scenarios?.map((sub: any) => (
                          <div
                            key={sub.id}
                            onClick={() =>
                              navigate(`/detail/${sub.id}`, {
                                state: { scenario: sub },
                              })
                            }
                            className="bg-white border border-slate-100 p-5 rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group/sub"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${sub.color}`}
                                ></span>
                                <h4 className="text-sm font-bold text-slate-800 group-hover/sub:text-blue-600 transition-colors">
                                  {sub.title}
                                </h4>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium line-clamp-1">
                                {sub.desc}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-[10px] font-black text-slate-900">
                                  {sub.metrics.roi}% ROI
                                </span>
                              </div>
                              <IconMapper
                                name="arrow_forward"
                                className=" text-slate-200 group-hover/sub:text-blue-600 text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {currentItems.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <IconMapper
                name="search_off"
                className=" text-4xl text-slate-200 mb-4"
              />
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                Không tìm thấy kịch bản phù hợp
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-4">
            <button
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <IconMapper name="chevron_left" className="" />
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === number
                      ? "bg-slate-900 text-white shadow-lg"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    {number}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() =>
                currentPage < totalPages && paginate(currentPage + 1)
              }
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <IconMapper name="chevron_right" className="" />
            </button>
          </nav>
        )}
      </main>

      <SharedFooter />
    </AnimatedBackground>
  );
};

export default HistoryPage;
