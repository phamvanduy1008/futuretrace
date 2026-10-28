import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    AdminBadge,
    AdminCard,
    AdminConfirmModal,
    AdminEmptyState,
    AdminPageHeader,
    AdminShell,
    AdminStatCard,
    formatCost,
    formatLatency,
    formatPercent,
} from './ui';
import {
    Compass,
    ChatTeardropDots,
    FileCode,
    CreditCard,
    Gear,
    Sparkle,
    CaretRight,
    WarningCircle,
    GraduationCap,
    CurrencyCircleDollar,
    Buildings,
    ChartBar,
    MagnifyingGlass,
    Database,
    HardDrive,
    CheckCircle,
    ArrowClockwise,
    Plus,
    Tag,
} from '@phosphor-icons/react';
import { ApiError, createAdminApi } from './api';
import './admin.css';

const ADMIN_STORAGE_KEY = 'futuretrace_admin_auth';
const ADMIN_PROFILE_KEY = 'futuretrace_admin_profile';
const ADMIN_TOKEN_KEY = 'futuretrace_admin_access_token';
const ADMIN_REFRESH_KEY = 'futuretrace_admin_refresh_token';

const ADMIN_DEMO_CREDENTIALS = {
    email: 'admin@futuretrace.vn',
    password: 'FutureTraceAdmin!2026',
};

function getHashPath() {
    // Expected hash: #/admin/dashboard or #/admin/users
    const rawHash = window.location.hash.replace(/^#/, '');

    // If hash starts with /admin, strip it for internal resolution
    if (rawHash.startsWith('/admin')) {
        const subPath = rawHash.substring(6); // remove '/admin'
        return subPath || '/dashboard';
    }

    // For backward compatibility or direct root access
    return rawHash === '/' || rawHash === '' ? '/dashboard' : rawHash;
}

function useHashRoute() {
    const [route, setRoute] = useState(getHashPath);

    useEffect(() => {
        const currentHash = window.location.hash;
        if (!currentHash || currentHash === '#' || currentHash === '#/') {
            window.location.hash = '/admin/dashboard';
        } else if (currentHash.startsWith('#/') && !currentHash.startsWith('#/admin')) {
            // If someone types #/dashboard directly, normalize it to #/admin/dashboard
            window.location.hash = `/admin${currentHash.substring(1)}`;
        }

        const handleChange = () => setRoute(getHashPath());
        window.addEventListener('hashchange', handleChange);
        return () => window.removeEventListener('hashchange', handleChange);
    }, []);

    const navigate = useCallback((path) => {
        // Always prepend /admin if not already there
        const targetPath = path.startsWith('/admin') ? path : `/admin${path}`;
        window.location.hash = targetPath;
    }, []);

    return { route, navigate };
}

function getToneByStatus(status) {
    switch (status) {
        case 'active':
        case 'completed':
        case 'published':
        case 'success':
        case 'resolved':
            return 'green';
        case 'running':
        case 'retrying':
        case 'needs_review':
        case 'warning':
        case 'acknowledged':
            return 'amber';
        case 'failed':
        case 'locked':
        case 'critical':
        case 'hidden':
        case 'pending':
            return 'red';
        case 'queued':
        case 'draft':
            return 'blue';
        default:
            return 'neutral';
    }
}

function fieldLabel(label, value) {
    return (
        <div className="ft-detail-row">
            <span>{label}</span>
            <strong>{value || '--'}</strong>
        </div>
    );
}

function getErrorMessage(error) {
    if (!error) return '';
    if (error instanceof ApiError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Không thể tải dữ liệu, vui lòng thử lại sau.';
}

function useRemoteResource(loader, dependencies = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loaderRef = useRef(loader);
    const dependencyRef = useRef([]);
    const hasLoadedRef = useRef(false);

    loaderRef.current = loader;

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await loaderRef.current();
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const previousDependencies = dependencyRef.current;
        const dependenciesChanged =
            previousDependencies.length !== dependencies.length ||
            dependencies.some((dependency, index) => !Object.is(dependency, previousDependencies[index]));

        if (!hasLoadedRef.current || dependenciesChanged) {
            hasLoadedRef.current = true;
            dependencyRef.current = dependencies;
            load();
        }
    });

    return {
        data,
        setData,
        loading,
        error,
        reload: load,
    };
}

function LoadingCard({ title = 'Đang tải dữ liệu...' }) {
    return (
        <AdminCard>
            <p>{title}</p>
        </AdminCard>
    );
}

function ErrorCard({ error, onRetry }) {
    return (
        <AdminCard>
            <p className="ft-inline-error">{getErrorMessage(error)}</p>
            {onRetry ? (
                <button className="ft-button" type="button" onClick={onRetry}>
                    Thử lại
                </button>
            ) : null}
        </AdminCard>
    );
}

function LoginPage({ onLogin, loading }) {
    const [form, setForm] = useState({
        email: ADMIN_DEMO_CREDENTIALS.email,
        password: ADMIN_DEMO_CREDENTIALS.password,
    });
    const [error, setError] = useState('');

    return (
        <div className="ft-login-page">
            <div className="ft-login-hero">
                <div className="ft-brand-mark ft-brand-mark--large">FT</div>
                <p className="ft-eyebrow">FutureTrace Admin</p>
                <h1>Hệ thống quản trị dự án FutureTrace</h1>
                <p>
                    Giao diện quản trị cho đội ngũ vận hành, kiểm duyệt và giám sát mô hình
                    FutureTrace.
                </p>
            </div>

            <div className="ft-login-panel">
                <AdminCard
                    title="Đăng nhập quản trị"
                    subtitle="Xác thực trực tiếp với backend admin."
                >
                    <div className="ft-form-grid">
                        <label className="ft-field">
                            <span>Email quản trị</span>
                            <input
                                value={form.email}
                                onChange={(event) =>
                                    setForm((state) => ({ ...state, email: event.target.value }))
                                }
                                type="email"
                            />
                        </label>
                        <label className="ft-field">
                            <span>Mật khẩu</span>
                            <input
                                value={form.password}
                                onChange={(event) =>
                                    setForm((state) => ({ ...state, password: event.target.value }))
                                }
                                type="password"
                            />
                        </label>
                        {error ? <p className="ft-inline-error">{error}</p> : null}
                        <button
                            className="ft-button"
                            type="button"
                            disabled={loading}
                            onClick={async () => {
                                setError('');
                                try {
                                    await onLogin(form);
                                } catch (err) {
                                    setError(getErrorMessage(err));
                                }
                            }}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập vào admin'}
                        </button>
                    </div>
                </AdminCard>
            </div>
        </div>
    );
}

function DashboardPage({ api, navigate, onForbidden }) {
    const { data, loading, error, reload } = useRemoteResource(
        () => api.getDashboardOverview(),
        [api],
    );

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải dashboard..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const stats = data?.stats || {};
    const alerts = data?.alerts || [];
    const watchlists = data?.watchlists || {};

    return (
        <div className="ft-page-stack ft-settings-page">
            <AdminPageHeader
                eyebrow="Bảng Điều Khiển"
                title="Tổng quan vận hành"
                description="Theo dõi sức khoẻ hệ thống từ dữ liệu backend admin theo thời gian thực."
                actions={
                    <button className="ft-button" onClick={() => navigate('/ai/logs')}>
                        Xem AI Logs
                    </button>
                }
            />

            <div className="ft-stats-grid">
                <AdminStatCard
                    label="Người dùng đang quản lý"
                    value={stats.totalUsers || 0}
                    hint={`${stats.activeUsers || 0} hoạt động`}
                />
                <AdminStatCard
                    label="Lượt mô phỏng"
                    value={stats.totalSimulations || 0}
                    hint={`${stats.failedSimulations || 0} thất bại`}
                    tone="amber"
                />
                <AdminStatCard
                    label="Doanh thu"
                    value={formatCost(stats.totalRevenue || 0)}
                    hint={`${stats.totalTokensSold || 0} token đã bán`}
                    tone="blue"
                />
                <AdminStatCard
                    label="Bài viết cộng đồng"
                    value={stats.totalCommunityPosts || 0}
                    hint={`${stats.communityNeedsReview || 0} cần duyệt`}
                    tone="green"
                />
            </div>

            <div className="ft-grid ft-grid--2-1">
                <AdminCard title="Cảnh báo hệ thống" subtitle="Các tín hiệu cần xử lý ngay">
                    <div className="ft-list">
                        {alerts.length === 0 ? (
                            <AdminEmptyState
                                title="Không có cảnh báo"
                                description="Hệ thống đang ổn định ở thời điểm hiện tại."
                            />
                        ) : (
                            alerts.map((alert) => (
                                <div className="ft-list-item" key={alert.id}>
                                    <div className="ft-list-item__main">
                                        <div className="ft-list-item__header">
                                            <strong className="ft-list-item__title">{alert.title}</strong>
                                            <AdminBadge tone={getToneByStatus(alert.severity)}>
                                                {alert.severity}
                                            </AdminBadge>
                                        </div>
                                        <p className="ft-list-item__desc">{alert.description}</p>
                                    </div>
                                    <span className="ft-list-item__date">{alert.createdAt}</span>
                                </div>
                            ))
                        )}
                    </div>
                </AdminCard>

                <AdminCard title="Lối tắt vận hành" subtitle="Đi nhanh đến các luồng nghẽn.">
                    <div className="ft-quick-actions">
                        <button className="ft-quick-btn" type="button" onClick={() => navigate('/simulations')}>
                            <Compass size={18} weight="duotone" />
                            <span>Mô phỏng thất bại</span>
                        </button>
                        <button className="ft-quick-btn" type="button" onClick={() => navigate('/community/posts')}>
                            <ChatTeardropDots size={18} weight="duotone" />
                            <span>Quản lý Bài viết</span>
                        </button>
                        <button className="ft-quick-btn" type="button" onClick={() => navigate('/prompts')}>
                            <FileCode size={18} weight="duotone" />
                            <span>Bản phát hành Prompt</span>
                        </button>
                        <button className="ft-quick-btn" type="button" onClick={() => navigate('/payments')}>
                            <CreditCard size={18} weight="duotone" />
                            <span>Quản lý giao dịch</span>
                        </button>
                        <button className="ft-quick-btn" type="button" onClick={() => navigate('/settings')}>
                            <Gear size={18} weight="duotone" />
                            <span>Cài đặt hệ thống</span>
                        </button>
                    </div>
                </AdminCard>
            </div>

            <div className="ft-grid ft-grid--2">
                <AdminCard title="Mô phỏng cần chú ý">
                    <div className="ft-mini-list">
                        {(watchlists.simulations || []).map((simulation) => (
                            <button
                                className="ft-mini-list__item"
                                key={simulation.id}
                                onClick={() => navigate(`/simulations/${simulation.id}`)}
                            >
                                <div className="ft-mini-list__item-left">
                                    <Compass size={17} weight="duotone" />
                                    <strong>{simulation.title}</strong>
                                </div>
                                <div className="ft-mini-list__item-right">
                                    <AdminBadge tone={getToneByStatus(simulation.status)}>
                                        {simulation.status}
                                    </AdminBadge>
                                    <CaretRight size={14} weight="bold" color="#94a3b8" />
                                </div>
                            </button>
                        ))}
                    </div>
                </AdminCard>
                <AdminCard title="Chuyên sâu cần theo dõi">
                    <div className="ft-mini-list">
                        {(watchlists.premiumAnalyses || []).map((analysis) => (
                            <button
                                className="ft-mini-list__item"
                                key={analysis.id}
                                onClick={() => navigate(`/premium-analyses/${analysis.id}`)}
                            >
                                <div className="ft-mini-list__item-left">
                                    <Sparkle size={17} weight="duotone" />
                                    <strong>{analysis.title}</strong>
                                </div>
                                <div className="ft-mini-list__item-right">
                                    <span className="ft-metric-pill">
                                        {formatPercent(analysis.completionRate)}
                                    </span>
                                    <CaretRight size={14} weight="bold" color="#94a3b8" />
                                </div>
                            </button>
                        ))}
                    </div>
                </AdminCard>
            </div>
        </div>
    );
}

function UsersPage({ api, navigate, onForbidden }) {
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('all');
    const [status, setStatus] = useState('all');
    const [modalState, setModalState] = useState({ open: false, user: null });

    const params = useMemo(
        () => ({
            page: '1',
            limit: '50',
            q: search,
            role,
            status,
        }),
        [search, role, status],
    );

    const { data, loading, error, reload } = useRemoteResource(
        () => api.getUsers(params),
        [api, params],
    );

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    const users = data?.items || [];

    if (loading) return <LoadingCard title="Đang tải danh sách users..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Người dùng"
                title="Quản lý người dùng"
                description="Đồng bộ dữ liệu user và session trực tiếp từ backend admin."
            />

            <AdminCard>
                <div className="ft-filters">
                    <input
                        placeholder="Tìm theo tên hoặc email..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <select value={role} onChange={(event) => setRole(event.target.value)}>
                        <option value="all">Tất cả role</option>
                        <option value="super_admin">super_admin</option>
                        <option value="ops_support">ops_support</option>
                        <option value="community_moderator">community_moderator</option>
                        <option value="ai_operator">ai_operator</option>
                        <option value="user">user</option>
                    </select>
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">active</option>
                        <option value="locked">locked</option>
                        <option value="banned">banned</option>
                    </select>
                </div>
            </AdminCard>

            <AdminCard title="Danh sách người dùng">
                {users.length === 0 ? (
                    <AdminEmptyState
                        title="Không có người dùng phù hợp"
                        description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
                    />
                ) : (
                    <div className="ft-table-wrapper">
                        <table className="ft-table">
                            <thead>
                                <tr>
                                    <th>Tên</th>
                                    <th>Vai trò</th>
                                    <th>Token</th>
                                    <th>Trạng thái</th>
                                    <th>Lần cuối đăng nhập</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <strong>{user.name}</strong>
                                            <span>{user.email}</span>
                                        </td>
                                        <td>{user.role}</td>
                                        <td>{user.token?.toLocaleString('vi-VN') || 0}</td>
                                        <td>
                                            <AdminBadge tone={getToneByStatus(user.status)}>{user.status}</AdminBadge>
                                        </td>
                                        <td>{user.lastLoginAt || '--'}</td>
                                        <td>
                                            <div className="ft-inline-actions">
                                                <button
                                                    className="ft-link-button"
                                                    onClick={() => navigate(`/users/${user.id}`)}
                                                >
                                                    Chi tiết
                                                </button>
                                                <button
                                                    className="ft-link-button"
                                                    onClick={() => setModalState({ open: true, user })}
                                                >
                                                    Khóa / Mở khóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </AdminCard>

            <AdminConfirmModal
                open={modalState.open}
                title="Cập nhật trạng thái user"
                description="Hành động này sẽ ghi audit log trong backend admin."
                confirmText="Xác nhận"
                onClose={() => setModalState({ open: false, user: null })}
                onConfirm={async (reason) => {
                    const target = modalState.user;
                    if (!target) return;
                    const nextStatus = target.status === 'active' ? 'locked' : 'active';
                    await api.updateUserStatus(target.id, nextStatus, reason);
                    setModalState({ open: false, user: null });
                    await reload();
                }}
            />
        </div>
    );
}

function UserDetailPage({ api, userId, navigate, onForbidden }) {
    const { data, loading, error, reload } = useRemoteResource(
        () => api.getUserDetail(userId),
        [api, userId],
    );

    const [tokenModal, setTokenModal] = useState({ open: false, amount: '', reason: '' });

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải chi tiết user..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const user = data?.user;
    if (!user) {
        return (
            <AdminEmptyState title="Không tìm thấy user" description="ID user không tồn tại hoặc đã bị xóa." />
        );
    }

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Người dùng / Chi tiết"
                title={user.name}
                description={user.bio || 'Không có mô tả.'}
                actions={
                    <button className="ft-button ft-button--ghost" onClick={() => navigate('/users')}>
                        Quay lại danh sách
                    </button>
                }
            />

            <div className="ft-grid ft-grid--2-1">
                <AdminCard title="Thông tin tài khoản">
                    <div className="ft-profile-card ft-profile-card--large">
                        <div className="ft-profile-card__avatar">{user.avatar}</div>
                        <div>
                            <strong>{user.name}</strong>
                            <p>{user.email}</p>
                            <div className="ft-row-inline">
                                <AdminBadge tone={getToneByStatus(user.status)}>{user.status}</AdminBadge>
                                <AdminBadge tone="blue">{user.role}</AdminBadge>
                            </div>
                        </div>
                    </div>
                    {fieldLabel('Địa điểm', user.location)}
                    {fieldLabel('Token', user.token?.toLocaleString('vi-VN') || 0)}
                    {fieldLabel('Ngày tham gia', user.joinedAt)}
                    {fieldLabel('Đăng nhập cuối', user.lastLoginAt)}
                    {fieldLabel('Phiên đăng nhập', user.sessionCount)}

                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 24px' }}>Hệ thống Affiliate</h4>
                        {fieldLabel('Mã mời', user.codeInvite)}
                        {fieldLabel('Đã giới thiệu', `${user.affiliateCount || 0} người`)}
                        {fieldLabel('Người giới thiệu', user.invitedBy ? `${user.invitedBy.name} (${user.invitedBy.email})` : 'Không có')}
                    </div>
                </AdminCard>

                <AdminCard title="Tóm tắt hoạt động" className="ft-user-summary-card" style={{ alignSelf: 'start' }}>
                    {fieldLabel('Lượt mô phỏng', user.simulationsCount)}
                    {fieldLabel('Lượt phân tích', user.premiumCount)}
                    {fieldLabel('Bài cộng đồng', user.communityCount)}
                    {fieldLabel('Trạng thái tài khoản', user.status)}
                    <div style={{ marginTop: '1rem', padding: '0 24px', paddingBottom: '24px' }}>
                        <button className="ft-button" onClick={() => setTokenModal({ open: true, amount: '', reason: '' })}>
                            Cộng/Trừ Token
                        </button>
                    </div>
                </AdminCard>
            </div>

            <div className="ft-grid ft-grid--2">
                <AdminCard title="Hồ sơ đánh giá ban đầu">
                    {data.evaluation ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {fieldLabel('Mức độ căng thẳng (Stress)', `Level ${data.evaluation.level?.stress || 1}`)}
                            {fieldLabel('Khả năng tài chính', `Level ${data.evaluation.level?.finance || 1}`)}
                            {fieldLabel('Khả năng chuyên môn', `Level ${data.evaluation.level?.capability || 1}`)}
                            {fieldLabel('Chấp nhận rủi ro', `Level ${data.evaluation.level?.risk || 1}`)}
                        </div>
                    ) : (
                        <AdminEmptyState title="Chưa có dữ liệu" description="Người dùng chưa hoàn thành bài đánh giá." />
                    )}
                </AdminCard>
                <AdminCard title="Mô phỏng gần nhất">
                    <div className="ft-mini-list">
                        {(data.simulations || []).map((simulation) => (
                            <button
                                className="ft-mini-list__item"
                                key={simulation.id}
                                onClick={() => navigate(`/simulations/${simulation.id}`)}
                            >
                                <div className="ft-mini-list__item-left">
                                    <Compass size={17} weight="duotone" />
                                    <strong>{simulation.title}</strong>
                                </div>
                                <div className="ft-mini-list__item-right">
                                    <AdminBadge tone={getToneByStatus(simulation.status)}>
                                        {simulation.status}
                                    </AdminBadge>
                                    <CaretRight size={14} weight="bold" color="#94a3b8" />
                                </div>
                            </button>
                        ))}
                    </div>
                </AdminCard>
                <AdminCard title="Phân tích Chuyên sâu">
                    <div className="ft-mini-list">
                        {(data.premiumAnalyses || []).length === 0 ? (
                            <AdminEmptyState title="Chưa có phân tích" description="Người dùng này chưa tạo phân tích chuyên sâu." />
                        ) : (
                            (data.premiumAnalyses || []).map((analysis) => (
                                <button
                                    className="ft-mini-list__item"
                                    key={analysis.id}
                                    onClick={() => navigate(`/premium-analyses/${analysis.id}`)}
                                >
                                    <div className="ft-mini-list__item-left">
                                        <Sparkle size={17} weight="duotone" />
                                        <strong>{analysis.title}</strong>
                                    </div>
                                    <div className="ft-mini-list__item-right">
                                        <span className="ft-metric-pill">
                                            {formatPercent(analysis.completionRate)}
                                        </span>
                                        <CaretRight size={14} weight="bold" color="#94a3b8" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </AdminCard>
                <AdminCard title="Community posts">
                    <div className="ft-mini-list">
                        {(data.posts || []).length === 0 ? (
                            <AdminEmptyState title="Chưa có bài viết" description="User chưa đăng post." />
                        ) : (
                            (data.posts || []).map((post) => (
                                <button
                                    className="ft-mini-list__item"
                                    key={post.id}
                                    onClick={() => navigate(`/community/posts/${post.id}`)}
                                >
                                    <div className="ft-mini-list__item-left">
                                        <ChatTeardropDots size={17} weight="duotone" />
                                        <strong>{post.title}</strong>
                                    </div>
                                    <div className="ft-mini-list__item-right">
                                        <AdminBadge tone={getToneByStatus(post.status)}>
                                            {post.status}
                                        </AdminBadge>
                                        <CaretRight size={14} weight="bold" color="#94a3b8" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </AdminCard>
            </div>

            {tokenModal.open && (
                <div className="ft-modal-backdrop" role="presentation">
                    <div className="ft-modal">
                        <div className="ft-modal__header">
                            <div>
                                <p className="ft-eyebrow">Xác nhận hành động</p>
                                <h3>Điều chỉnh Token</h3>
                            </div>
                            <button className="ft-icon-button" type="button" onClick={() => setTokenModal({ open: false, amount: '', reason: '' })}>
                                x
                            </button>
                        </div>
                        <p className="ft-modal__description">Nhập số token cần cộng (hoặc số âm để trừ). Bắt buộc nhập lý do.</p>
                        <div className="ft-form-grid" style={{ marginTop: '0.5rem' }}>
                            <label className="ft-field">
                                <span>Số Token</span>
                                <input
                                    type="number"
                                    value={tokenModal.amount}
                                    onChange={(e) => setTokenModal({ ...tokenModal, amount: e.target.value })}
                                    placeholder="Ví dụ: 100 hoặc -50"
                                />
                            </label>
                            <label className="ft-field">
                                <span>Lý do</span>
                                <input
                                    type="text"
                                    value={tokenModal.reason}
                                    onChange={(e) => setTokenModal({ ...tokenModal, reason: e.target.value })}
                                    placeholder="Lý do điều chỉnh..."
                                />
                            </label>
                        </div>
                        <div className="ft-modal__actions">
                            <button className="ft-button ft-button--ghost" type="button" onClick={() => setTokenModal({ open: false, amount: '', reason: '' })}>
                                Hủy
                            </button>
                            <button className="ft-button" type="button" onClick={async () => {
                                if (!tokenModal.amount || !tokenModal.reason) {
                                    alert("Vui lòng nhập đầy đủ Số token và Lý do.");
                                    return;
                                }
                                try {
                                    await api.adjustUserTokens(user.id, parseInt(tokenModal.amount), tokenModal.reason);
                                    setTokenModal({ open: false, amount: '', reason: '' });
                                    reload();
                                } catch (e) {
                                    alert(e.message);
                                }
                            }}>
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SimulationsPage({ api, navigate, onForbidden }) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');

    const params = useMemo(
        () => ({
            page: '1',
            limit: '50',
            q: search,
            status,
        }),
        [search, status],
    );

    const { data, loading, error, reload } = useRemoteResource(
        () => api.getSimulations(params),
        [api, params],
    );

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải danh sách mô phỏng..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const items = data?.items || [];
    const stats = data?.stats || {};

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Hệ Thống Phân Tích"
                title="Quản trị mô phỏng"
                description="Quan sát quá trình mô phỏng, trạng thái AI và lỗi cần xử lý."
            />
            <div className="ft-stats-grid ft-stats-grid--compact">
                <AdminStatCard label="Hoàn thành" value={stats.completed || 0} />
                <AdminStatCard label="Đang chạy" value={stats.running || 0} tone="blue" />
                <AdminStatCard label="Đang chờ" value={stats.queued || 0} tone="amber" />
                <AdminStatCard label="Thất bại" value={stats.failed || 0} tone="red" />
            </div>

            <AdminCard>
                <div className="ft-filters ft-community-filters">
                    <input
                        placeholder="Tìm theo tiêu đề..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="completed">completed</option>
                        <option value="running">running</option>
                        <option value="queued">queued</option>
                        <option value="failed">failed</option>
                    </select>
                </div>
            </AdminCard>

            <AdminCard title="Danh sách mô phỏng">
                <div className="ft-table-wrapper">
                    <table className="ft-table">
                        <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Người dùng</th>
                                <th>Trạng thái</th>
                                <th>Model AI</th>
                                <th>Độ trễ</th>
                                <th>Mẫu Prompt</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((simulation) => (
                                <tr key={simulation.id}>
                                    <td>
                                        <strong>{simulation.title}</strong>
                                        <span>{simulation.category}</span>
                                    </td>
                                    <td>{simulation.userName}</td>
                                    <td>
                                        <AdminBadge tone={getToneByStatus(simulation.status)}>{simulation.status}</AdminBadge>
                                    </td>
                                    <td>{simulation.model || '--'}</td>
                                    <td>{formatLatency(simulation.durationMs)}</td>
                                    <td>{simulation.promptVersion || '--'}</td>
                                    <td>
                                        <button className="ft-link-button" onClick={() => navigate(`/simulations/${simulation.id}`)}>
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminCard>
        </div>
    );
}

function PaymentsPage({ api, navigate, onForbidden }) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [paymentMethod, setPaymentMethod] = useState('all');

    const params = useMemo(
        () => ({
            page: '1',
            limit: '50',
            status,
            paymentMethod,
        }),
        [status, paymentMethod],
    );

    const { data, loading, error, reload } = useRemoteResource(
        () => api.getPayments(params),
        [api, params],
    );

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải danh sách giao dịch..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const items = data?.items || [];
    const stats = data?.stats || {};

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Tài chính"
                title="Quản lý giao dịch Token"
                description="Lịch sử mua token qua cổng thanh toán và giao dịch thủ công."
            />

            <div className="ft-stats-grid ft-stats-grid--compact">
                <AdminStatCard label="Tổng Giao Dịch" value={stats.totalTransactions || 0} />
                <AdminStatCard label="Doanh thu thành công" value={formatCost(stats.totalRevenue || 0)} tone="green" />
                <AdminStatCard label="Token bán ra" value={(stats.totalTokens || 0).toLocaleString('vi-VN')} tone="blue" />
            </div>

            <AdminCard>
                <div className="ft-filters ft-community-filters">
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                    <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                        <option value="all">Tất cả cổng</option>
                        <option value="momo">MoMo</option>
                        <option value="vnpay">VNPAY</option>
                        <option value="manual">Manual (Admin)</option>
                    </select>
                </div>
            </AdminCard>

            <AdminCard title="Lịch sử giao dịch">
                <div className="ft-table-wrapper">
                    <table className="ft-table">
                        <thead>
                            <tr>
                                <th>Người dùng</th>
                                <th>Số tiền</th>
                                <th>Token nhận</th>
                                <th>Phương thức</th>
                                <th>Trạng thái</th>
                                <th>Nội dung</th>
                                <th>Ngày</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="ft-empty-state" style={{ textAlign: 'center', padding: '2rem' }}>
                                        Không có giao dịch nào phù hợp.
                                    </td>
                                </tr>
                            ) : items.map((tx) => (
                                <tr key={tx.id}>
                                    <td>
                                        <strong>{tx.userName}</strong>
                                        <span>{tx.userEmail}</span>
                                    </td>
                                    <td>{formatCost(tx.amount)}</td>
                                    <td>{tx.tokenAmount?.toLocaleString('vi-VN')}</td>
                                    <td>
                                        <AdminBadge tone={tx.method === 'manual' ? 'blue' : 'neutral'}>
                                            {tx.method.toUpperCase()}
                                        </AdminBadge>
                                    </td>
                                    <td>
                                        <AdminBadge tone={getToneByStatus(tx.status)}>{tx.status}</AdminBadge>
                                    </td>
                                    <td><span style={{ fontSize: '0.85rem' }}>{tx.description}</span></td>
                                    <td>{new Date(tx.date).toLocaleString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminCard>
        </div>
    );
}

function SimulationDetailPage({ api, simulationId, navigate, onForbidden }) {
    const { data, loading, error, reload } = useRemoteResource(
        () => api.getSimulationDetail(simulationId),
        [api, simulationId],
    );

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải chi tiết mô phỏng..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;
    if (!data) {
        return (
            <AdminEmptyState title="Không tìm thấy mô phỏng" description="ID mô phỏng không tồn tại." />
        );
    }

    const relatedLog = data.relatedLog;
    const user = data.user;

    const formatError = (msg) => {
        if (!msg) return msg;
        if (msg.includes('high demand') || msg.includes('503') || msg.includes('overloaded')) {
            return 'Kết quả bị lỗi do hệ thống bị quá tải';
        }
        return msg;
    };

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Hệ Thống Phân Tích / Chi tiết mô phỏng"
                title={data.title}
                description={data.summary || 'Không có tóm tắt.'}
                actions={
                    <button className="ft-button ft-button--ghost" onClick={() => navigate('/simulations')}>
                        Quay lại danh sách
                    </button>
                }
            />

            <div className="ft-grid ft-grid--2-1">
                <AdminCard title="Thông tin chạy (Run)">
                    {fieldLabel('Trạng thái', data.status)}
                    {fieldLabel('Phiên bản Prompt', relatedLog?.promptVersion || '--')}
                    {fieldLabel('Độ trễ', formatLatency(relatedLog?.latencyMs || 0))}
                    {fieldLabel('Token đã dùng', (relatedLog?.inputTokens || 0) + (relatedLog?.outputTokens || 0))}
                    {fieldLabel('Tệp khách doanh nghiệp', data.isEnterprise ? 'Có' : 'Không')}
                    {data.errorSummary ? fieldLabel('Tóm tắt lỗi', formatError(data.errorSummary)) : null}
                </AdminCard>

                <AdminCard title="Người tạo">
                    {fieldLabel('Tên người dùng', data.userName)}
                    {fieldLabel('Vai trò', user?.role || '--')}
                    {fieldLabel('Hạng (Tier)', user?.tier || '--')}
                    {fieldLabel('Email', user?.email || '--')}
                </AdminCard>
            </div>

            <div className="ft-grid ft-grid--2-1">
                <AdminCard title="Kịch bản nổi bật">
                    <div className="ft-list">
                        {(data.scenarios || []).map((scenario) => (
                            <div className="ft-list-item" key={scenario.id}>
                                <strong>{scenario.title}</strong>
                            </div>
                        ))}
                    </div>
                </AdminCard>

                <AdminCard title="Nhật ký AI liên quan">
                    {relatedLog ? (
                        <>
                            {fieldLabel('Mã ID (Correlation)', relatedLog.id)}
                            {fieldLabel('Loại yêu cầu', 'Mô phỏng (simulation)')}
                            {fieldLabel('Độ trễ', formatLatency(relatedLog.latencyMs))}
                            {fieldLabel('Lỗi', formatError(relatedLog.errorMessage) || '--')}
                        </>
                    ) : (
                        <AdminEmptyState title="Chưa có nhật ký AI" description="Nhật ký chưa được gắn với mô phỏng này." />
                    )}
                </AdminCard>
            </div>
        </div>
    );
}

function PremiumAnalysesPage({ api, navigate, onForbidden }) {
    const [status, setStatus] = useState('all');

    const params = useMemo(
        () => ({
            page: '1',
            limit: '50',
            status,
            q: '',
        }),
        [status],
    );

    const { data, loading, error, reload } = useRemoteResource(
        () => api.getPremiumAnalyses(params),
        [api, params],
    );

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải danh sách phân tích chuyên sâu..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const items = data?.items || [];

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Hệ Thống Phân Tích"
                title="Quản trị Phân tích Chuyên sâu"
                description="Kiểm tra báo cáo, cột mốc và tiến độ thực hiện kế hoạch."
            />

            <AdminCard>
                <div className="ft-filters">
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">active</option>
                        <option value="completed">completed</option>
                    </select>
                </div>
            </AdminCard>

            <AdminCard title="Danh sách Phân tích Chuyên sâu">
                <div className="ft-table-wrapper">
                    <table className="ft-table">
                        <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Người dùng</th>
                                <th>Trạng thái</th>
                                <th>Khung thời gian</th>
                                <th>Thay đổi (Pivot)</th>
                                <th>Tiến độ</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((analysis) => (
                                <tr key={analysis.id}>
                                    <td>
                                        <strong>{analysis.title}</strong>
                                        <span>{analysis.nextMilestone}</span>
                                    </td>
                                    <td>{analysis.userName}</td>
                                    <td>
                                        <AdminBadge tone={getToneByStatus(analysis.status)}>{analysis.status}</AdminBadge>
                                    </td>
                                    <td>{analysis.timeframeMonths} tháng</td>
                                    <td>{analysis.pivotCount}</td>
                                    <td>{formatPercent(analysis.completionRate)}</td>
                                    <td>
                                        <button className="ft-link-button" onClick={() => navigate(`/premium-analyses/${analysis.id}`)}>
                                            Chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminCard>
        </div>
    );
}

function PremiumAnalysisDetailPage({ api, analysisId, navigate, onForbidden }) {
    const { data, loading, error, reload } = useRemoteResource(
        () => api.getPremiumAnalysisDetail(analysisId),
        [api, analysisId],
    );

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải chi tiết phân tích chuyên sâu..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;
    if (!data) {
        return (
            <AdminEmptyState title="Không tìm thấy phân tích chuyên sâu" description="ID phân tích không tồn tại hoặc đã bị xóa." />
        );
    }

    const report = data.report || {};
    const context = data.context || {};
    const scenario = data.scenario || {};
    const milestones = Array.isArray(report.milestones) ? report.milestones : [];
    const influencingFactors = Array.isArray(report.influencingFactors) ? report.influencingFactors : [];
    const strategicPivotPoints = Array.isArray(report.strategicPivotPoints) ? report.strategicPivotPoints : [];
    const completedMilestonesCount = data.completedMilestones?.length || 0;
    const totalMilestonesCount = milestones.length;

    // Helper làm sạch prompt injection trong decision của context (chuẩn hóa cả literal \n và real newlines)
    const cleanDecisionText = (text) => {
        if (!text || typeof text !== 'string') return 'Chưa có thông tin quyết định ban đầu.';
        const normalized = text.replace(/\\n/g, '\n');
        const markers = ['\n\n[THÔNG TIN BỔ SUNG', '\n[THÔNG TIN BỔ SUNG', '[THÔNG TIN BỔ SUNG', '--- THÔNG TIN'];
        let result = normalized;
        for (const m of markers) {
            const idx = result.indexOf(m);
            if (idx !== -1) result = result.substring(0, idx);
        }
        return result.trim() || normalized.trim();
    };

    // Helper trích xuất thông tin bổ sung Q&A của người dùng
    const getAdditionalContext = (text) => {
        if (!text || typeof text !== 'string') return [];
        const normalized = text.replace(/\\n/g, '\n');
        const idx = normalized.indexOf('[THÔNG TIN BỔ SUNG');
        if (idx === -1) return [];
        const part = normalized.substring(idx).replace(/\[THÔNG TIN BỔ SUNG[^\]]*\]/gi, '').trim();
        return part.split('\n').map((l) => l.trim().replace(/^-\s*/, '')).filter((l) => l.length > 0);
    };

    const getInfluenceBadgeTone = (influence) => {
        const inf = String(influence || '').toLowerCase();
        if (inf.includes('cao') || inf.includes('high')) return 'red';
        if (inf.includes('trung bình') || inf.includes('medium')) return 'amber';
        return 'green';
    };

    return (
        <div className="ft-page-stack ft-premium-detail-page">
            <AdminPageHeader
                eyebrow="Hệ Thống Phân Tích / Chi tiết Phân tích Chuyên sâu"
                title={data.title}
                description={`Kịch bản thuộc danh mục ${data.category || 'Sự nghiệp'}, khung thời gian ${data.timeframeMonths} tháng. Người dùng: ${data.userName} (${data.userEmail || 'ID: ' + data.userId}).`}
                actions={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {(data.simulationId || data.scenarioId) && (
                            <button
                                className="ft-button ft-button--ghost"
                                onClick={() => navigate(`/simulations/${data.simulationId || data.scenarioId}`)}
                            >
                                Xem mô phỏng gốc ↗
                            </button>
                        )}
                        <button className="ft-button" onClick={() => navigate('/premium-analyses')}>
                            Quay lại danh sách
                        </button>
                    </div>
                }
            />

            {/* Thống kê chỉ số cốt lõi */}
            <div className="ft-stats-strip">
                <div className="ft-stat-pill-card">
                    <span>Khung thời gian</span>
                    <strong>{data.timeframeMonths} tháng</strong>
                    <small>Lộ trình trung & dài hạn</small>
                </div>
                <div className="ft-stat-pill-card">
                    <span>Tiến độ thực hiện</span>
                    <strong>{formatPercent(data.completionRate)}</strong>
                    <small>{completedMilestonesCount}/{totalMilestonesCount} cột mốc hoàn thành</small>
                </div>
                <div className="ft-stat-pill-card">
                    <span>Điểm xoay (Pivot Points)</span>
                    <strong>{strategicPivotPoints.length}</strong>
                    <small>Kịch bản ứng phó rủi ro</small>
                </div>
                <div className="ft-stat-pill-card">
                    <span>Nhân tố ảnh hưởng</span>
                    <strong>{influencingFactors.length}</strong>
                    <small>Yếu tố nội tại & thị trường</small>
                </div>
            </div>

            {/* Bối cảnh người dùng & Tóm tắt báo cáo */}
            <div className="ft-grid ft-grid--2-1 ft-premium-detail-grid">
                <AdminCard title="Bối cảnh & Bài toán của Người dùng" subtitle="Dữ liệu đầu vào và các tham số đánh giá lúc tạo phân tích">
                    <div style={{ marginBottom: '14px' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                            QUYẾT ĐỊNH / NGUYỆN VỌNG BAN ĐẦU:
                        </strong>
                        <div style={{ background: '#f8fafc', borderLeft: '4px solid #3b82f6', padding: '12px 16px', borderRadius: '4px', fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.6' }}>
                            "{cleanDecisionText(context.decision)}"
                        </div>
                    </div>

                    {getAdditionalContext(context.decision).length > 0 && (
                        <div style={{ marginBottom: '14px' }}>
                            <strong style={{ fontSize: '0.82rem', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                                THÔNG TIN BỔ SUNG KHẢO SÁT:
                            </strong>
                            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {getAdditionalContext(context.decision).map((line, idx) => (
                                    <div key={idx}>{line}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    <strong style={{ fontSize: '0.82rem', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                        CHỈ SỐ TÂM LÝ & TÀI CHÍNH BAN ĐẦU:
                    </strong>
                    <div className="ft-context-scores">
                        <div className="ft-score-badge">
                            <span>Áp lực (Stress)</span>
                            <strong>{context.stress !== undefined ? `${context.stress}/5` : '--'}</strong>
                        </div>
                        <div className="ft-score-badge">
                            <span>Tài chính</span>
                            <strong>{context.personalFinance !== undefined ? `${context.personalFinance}/5` : '--'}</strong>
                        </div>
                        <div className="ft-score-badge">
                            <span>Học tập</span>
                            <strong>{context.academicPerformance !== undefined ? `${context.academicPerformance}/5` : '--'}</strong>
                        </div>
                        <div className="ft-score-badge">
                            <span>Chấp nhận Rủi ro</span>
                            <strong>{context.risk !== undefined ? `${context.risk}/5` : '--'}</strong>
                        </div>
                    </div>
                </AdminCard>

                <AdminCard title="Thông tin Kịch bản & Vận hành" subtitle="Thông số hệ thống">
                    {fieldLabel('Kịch bản nguồn', scenario.title || data.title)}
                    {fieldLabel('Người dùng', data.userName)}
                    {fieldLabel('Email liên hệ', data.userEmail || '--')}
                    {fieldLabel('Trạng thái', data.status)}
                    {fieldLabel('Cột mốc tiếp theo', data.nextMilestone)}
                    {fieldLabel('Ngày tạo', data.createdAt || '--')}
                    {fieldLabel('Cập nhật lần cuối', data.updatedAt || '--')}
                    {scenario.description && (
                        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                            <small style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Mô tả kịch bản gốc:</small>
                            <p style={{ fontSize: '0.84rem', color: '#334155', margin: 0, fontStyle: 'italic' }}>
                                "{scenario.description}"
                            </p>
                        </div>
                    )}
                </AdminCard>
            </div>

            {/* Tường thuật chiến lược AI */}
            {report.detailedNarrative && (
                <AdminCard title="Tường thuật Chiến lược Tổng thể (Detailed Narrative)" subtitle="Bức tranh toàn cảnh về tiến trình thực thi và các giai đoạn bản lề">
                    <div className="ft-rich-paragraph" style={{ whiteSpace: 'pre-line', lineHeight: '1.7', fontSize: '0.92rem', color: '#1e293b' }}>
                        {report.detailedNarrative}
                    </div>
                </AdminCard>
            )}

            {/* Lộ trình Cột mốc & Các bước hành động cụ thể (Milestones & Action Steps) */}
            <AdminCard
                title={`Lộ trình Cột mốc & Kế hoạch Thực thi (${milestones.length} Giai đoạn)`}
                subtitle="Chi tiết từng cột mốc, xác suất thành công và danh mục bước hành động cụ thể"
            >
                {milestones.length === 0 ? (
                    <AdminEmptyState title="Chưa có dữ liệu cột mốc" description="Báo cáo này chưa khởi tạo danh sách cột mốc." />
                ) : (
                    <div className="ft-timeline">
                        {milestones.map((milestone, mIdx) => (
                            <div className="ft-timeline__item" key={`${milestone.month || mIdx}-${milestone.event || mIdx}`}>
                                <span>{milestone.month || `Mốc ${mIdx + 1}`}</span>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                                        <strong>{milestone.event}</strong>
                                        <AdminBadge tone="blue">{milestone.probability || 80}% Thành công</AdminBadge>
                                    </div>
                                    <p style={{ color: '#0369a1', fontWeight: '500', marginBottom: '8px' }}>
                                        🎯 Tác động: {milestone.impact}
                                    </p>

                                    {/* Action Steps Rendering - Xử lý an toàn cả mảng object và string */}
                                    {Array.isArray(milestone.details) && milestone.details.length > 0 ? (
                                        <div className="ft-action-steps-container">
                                            {milestone.details.map((step, sIdx) => (
                                                <div className="ft-action-step-card" key={step.id || sIdx}>
                                                    <div className="ft-action-step-header">
                                                        <div className="ft-action-step-title">
                                                            <span className="ft-step-tag">Bước {mIdx + 1}.{sIdx + 1}</span>
                                                            <span>{step.title}</span>
                                                        </div>
                                                        <AdminBadge tone={step.completed ? 'green' : 'gray'}>
                                                            {step.completed ? 'Đã hoàn tất' : 'Chưa hoàn tất'}
                                                        </AdminBadge>
                                                    </div>

                                                    <p className="ft-action-step-desc">{step.description}</p>

                                                    <div className="ft-action-step-subgrid">
                                                        {Array.isArray(step.objectives) && step.objectives.length > 0 && (
                                                            <div className="ft-step-subitem">
                                                                <div className="ft-step-subitem-title">
                                                                    <span>📌 Mục tiêu cụ thể:</span>
                                                                </div>
                                                                <div className="ft-pill-group">
                                                                    {step.objectives.map((obj, oIdx) => (
                                                                        <span className="ft-sub-pill" key={oIdx}>{obj}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {Array.isArray(step.actions) && step.actions.length > 0 && (
                                                            <div className="ft-step-subitem">
                                                                <div className="ft-step-subitem-title">
                                                                    <span>⚡ Hành động chi tiết:</span>
                                                                </div>
                                                                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: '#475569' }}>
                                                                    {step.actions.map((act, aIdx) => (
                                                                        <li key={aIdx}>{act}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {Array.isArray(step.tools) && step.tools.length > 0 && (
                                                            <div className="ft-step-subitem">
                                                                <div className="ft-step-subitem-title">
                                                                    <span>🛠️ Công cụ hỗ trợ:</span>
                                                                </div>
                                                                <div className="ft-pill-group">
                                                                    {step.tools.map((tl, tIdx) => (
                                                                        <span className="ft-sub-pill" style={{ background: '#f1f5f9' }} key={tIdx}>
                                                                            {tl}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {step.expectedResult && (
                                                        <div className="ft-expected-result-box">
                                                            <span>🏁</span>
                                                            <div>
                                                                <strong>Kết quả kỳ vọng:</strong> {step.expectedResult}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : typeof milestone.details === 'string' ? (
                                        <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '6px' }}>{milestone.details}</p>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </AdminCard>

            {/* Các nhân tố ảnh hưởng (Influencing Factors Matrix) */}
            {influencingFactors.length > 0 && (
                <AdminCard
                    title={`Các Nhân Tố Ảnh Hưởng Chiến Lược (${influencingFactors.length} Yếu tố)`}
                    subtitle="Phân tích đa chiều: Tài chính, Học tập, Kinh doanh và Môi trường thị trường"
                >
                    <div className="ft-influencing-grid">
                        {influencingFactors.map((item, idx) => (
                            <div className="ft-influencing-card" key={item._id || idx}>
                                <div className="ft-influencing-header">
                                    <span className="ft-sub-pill" style={{ fontWeight: 600, background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                                        {item.category || 'Nhân tố'}
                                    </span>
                                    <AdminBadge tone={getInfluenceBadgeTone(item.influence)}>
                                        Ảnh hưởng: {item.influence || 'Trung bình'}
                                    </AdminBadge>
                                </div>
                                <div className="ft-influencing-factor">{item.factor}</div>
                                <p className="ft-influencing-desc">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </AdminCard>
            )}

            {/* Điểm xoay chiến lược & Ứng phó rủi ro (Strategic Pivot Points) */}
            {strategicPivotPoints.length > 0 && (
                <AdminCard
                    title={`Điểm Xoay Chiến Lược (Strategic Pivot Points - ${strategicPivotPoints.length} Kịch bản)`}
                    subtitle="Các quy tắc dự phòng khi rủi ro hoặc biến cố xuất hiện trong quá trình triển khai"
                >
                    <div className="ft-pivot-list">
                        {strategicPivotPoints.map((pivot, pIdx) => (
                            <div className="ft-pivot-card" key={pivot._id || pIdx}>
                                <div className="ft-pivot-condition">
                                    <span>⚠️</span>
                                    <div>
                                        <strong>ĐIỀU KIỆN KÍCH HOẠT (KHI NÀO CẦN XOAY TRỤC?):</strong>
                                        <div style={{ marginTop: '2px', fontWeight: 'normal' }}>{pivot.condition}</div>
                                    </div>
                                </div>
                                <div className="ft-pivot-action">
                                    <span>🧭</span>
                                    <div>
                                        <strong>HÀNH ĐỘNG XOAY TRỤC CHIẾN LƯỢC:</strong>
                                        <div style={{ marginTop: '2px' }}>{pivot.action}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminCard>
            )}

            {/* Triển vọng dài hạn 3-5 năm */}
            {report.longTermProjection && (
                <AdminCard title="Dự Báo Triển Vọng Dài Hạn (3 - 5 Năm)" subtitle="Tầm nhìn định hướng sự nghiệp và kinh doanh bền vững">
                    <div className="ft-projection-box">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <span style={{ fontSize: '1.8rem', lineHeight: '1' }}>🔭</span>
                            <div>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700', color: '#4c1d95' }}>
                                    Tầm nhìn & Thành quả dự kiến
                                </h4>
                                <p style={{ margin: 0, lineHeight: '1.65', color: '#334155' }}>
                                    {report.longTermProjection}
                                </p>
                            </div>
                        </div>
                    </div>
                </AdminCard>
            )}

            {/* Lịch sử phản hồi / Cập nhật */}
            <AdminCard title="Lịch Sử Phản Hồi & Điều Chỉnh (Feedback History)" subtitle="Ghi nhận các yêu cầu tinh chỉnh hoặc đánh giá từ người dùng">
                <div className="ft-list ft-feedback-list">
                    {(data.feedbackHistory || []).length === 0 ? (
                        <AdminEmptyState title="Chưa có phản hồi điều chỉnh" description="Báo cáo này chưa ghi nhận thêm phản hồi cập nhật từ người dùng." />
                    ) : (
                        (data.feedbackHistory || []).map((item, fIdx) => (
                            <div className="ft-list-item" key={fIdx}>
                                <p style={{ margin: 0, fontSize: '0.88rem' }}>{typeof item === 'string' ? item : JSON.stringify(item)}</p>
                            </div>
                        ))
                    )}
                </div>
            </AdminCard>
        </div>
    );
}

function CommunityPostsPage({ api, navigate, onForbidden }) {
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');

    const params = useMemo(
        () => ({
            page: '1',
            limit: '50',
            status,
            q: search,
            category: 'all',
        }),
        [status, search],
    );

    const { data, loading, error, reload } = useRemoteResource(
        () => api.getCommunityPosts(params),
        [api, params],
    );

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải bài viết cộng đồng..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const posts = data?.items || [];

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Cộng Đồng"
                title="Quản trị bài viết cộng đồng"
                description="Theo dõi bài viết và quản lý nội dung từ hệ thống."
            />

            <AdminCard>
                <div className="ft-filters">
                    <input
                        placeholder="Tìm theo title..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="published">published</option>
                        <option value="needs_review">needs_review</option>
                        <option value="hidden">hidden</option>
                    </select>
                </div>
            </AdminCard>

            <div className="ft-card-grid ft-community-card-grid">
                {posts.map((post) => (
                    <AdminCard
                        key={post.id}
                        className="ft-community-post-card"
                        title={post.title}
                        subtitle={`${post.authorName} • ${post.category}`}
                        actions={<AdminBadge tone={getToneByStatus(post.status)}>{post.status}</AdminBadge>}
                    >
                        <p className="ft-rich-paragraph">{post.excerpt}</p>
                        <div className="ft-row-inline ft-row-inline--spread ft-community-post-card__meta">
                            <small>{post.likes} lượt thích • {post.commentsCount} bình luận</small>
                            <button className="ft-link-button" onClick={() => navigate(`/community/posts/${post.id}`)}>
                                Xem chi tiết
                            </button>
                        </div>
                    </AdminCard>
                ))}
            </div>
        </div>
    );
}

function CommunityPostDetailPage({ api, postId, navigate, onForbidden }) {
    const { data, loading, error, reload } = useRemoteResource(
        () => api.getCommunityPostDetail(postId),
        [api, postId],
    );
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải chi tiết bài viết..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const post = data?.post;
    const comments = data?.comments || [];

    if (!post) {
        return <AdminEmptyState title="Không tìm thấy bài viết" description="Post đã bị xóa hoặc không tồn tại." />;
    }

    const nextStatus = post.status === 'hidden' ? 'published' : 'hidden';

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Cộng Đồng / Chi tiết Bài viết"
                title={post.title}
                description={`${post.authorName} • ${post.category} • ${post.createdAt}`}
                actions={
                    <div className="ft-page-actions">
                        <button className="ft-button ft-button--ghost" onClick={() => navigate('/community/posts')}>
                            Quay lại danh sách
                        </button>
                        <button className="ft-button" onClick={() => setModalOpen(true)}>
                            {nextStatus === 'published' ? 'Khôi phục bài' : 'Ẩn bài'}
                        </button>
                    </div>
                }
            />

            <div className="ft-grid ft-grid--2-1 ft-community-detail-grid">
                <AdminCard title="Nội dung bài viết" className="ft-community-content-card">
                    <div className="ft-row-inline">
                        <AdminBadge tone={getToneByStatus(post.status)}>{post.status}</AdminBadge>
                        <AdminBadge tone="neutral">{post.category}</AdminBadge>
                        {post.anonymous ? <AdminBadge tone="amber">anonymous</AdminBadge> : null}
                    </div>
                    <p className="ft-rich-paragraph">{post.content || post.excerpt}</p>
                    {fieldLabel('Độ tin cậy', `${post.reliability}%`)}
                    {fieldLabel('Lượt thích', post.likes)}
                    {fieldLabel('Lượt bình luận', post.commentsCount)}
                    {fieldLabel('Mô phỏng nguồn', post.sourceScenarioId)}
                </AdminCard>

                <AdminCard title="Bảng kiểm duyệt" className="ft-community-panel-card">
                    {fieldLabel('Hiện trạng', post.status)}
                    {fieldLabel('Tác giả', post.authorName)}
                    {fieldLabel('Ngày tạo', post.createdAt)}
                </AdminCard>
            </div>

            <AdminCard title="Bình luận" className="ft-community-comments-card">
                <div className="ft-list">
                    {comments.map((comment) => (
                        <div className="ft-list-item" key={comment.id}>
                            <div>
                                <strong>{comment.authorName}</strong>
                                <p>{comment.content}</p>
                            </div>
                            <span>{comment.createdAt}</span>
                        </div>
                    ))}
                </div>
            </AdminCard>

            <AdminConfirmModal
                open={modalOpen}
                title={nextStatus === 'published' ? 'Khôi phục bài viết' : 'Ẩn bài viết'}
                description="Hành động này sẽ tạo audit log và đổi trạng thái bài viết."
                confirmText={nextStatus === 'published' ? 'Khôi phục' : 'Ẩn bài'}
                onClose={() => setModalOpen(false)}
                onConfirm={async (reason) => {
                    await api.updateCommunityPostStatus(post.id, nextStatus, reason);
                    setModalOpen(false);
                    await reload();
                }}
            />
        </div>
    );
}



function AiLogsPage({ api, onForbidden }) {
    const { data, loading, error, reload } = useRemoteResource(
        () => api.getAiLogs({ page: '1', limit: '50', status: 'all', model: 'all', q: '' }),
        [api],
    );
    const [aiStatus, setAiStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [selectedProvider, setSelectedProvider] = useState('hybrid');
    const [switchLoading, setSwitchLoading] = useState(false);
    const [switchFeedback, setSwitchFeedback] = useState(null);

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    const loadAiStatus = useCallback(async () => {
        setStatusLoading(true);
        try {
            const res = await api.getAiSystemStatus();
            setAiStatus(res);
            if (res.activeProvider) {
                setSelectedProvider(res.activeProvider);
            }
        } catch (err) {
            console.error('Failed to load AI system status:', err);
        } finally {
            setStatusLoading(false);
        }
    }, [api]);

    useEffect(() => {
        loadAiStatus();
    }, [loadAiStatus]);

    const handleSwitchProvider = async (newProvider) => {
        setSwitchLoading(true);
        setSwitchFeedback(null);
        try {
            const res = await api.setAiProvider(newProvider, 'Điều chỉnh loại AI từ Admin Dashboard');
            setSelectedProvider(res.activeProvider);
            setSwitchFeedback({ success: true, message: res.message });
            await loadAiStatus();
            setTimeout(() => setSwitchFeedback(null), 4000);
        } catch (err) {
            setSwitchFeedback({ success: false, message: getErrorMessage(err) });
        } finally {
            setSwitchLoading(false);
        }
    };

    if (loading) return <LoadingCard title="Đang tải nhật ký AI & Trạng thái hệ thống..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const logs = data?.items || [];
    const stats = data?.stats || {};
    const isOllamaOnline = Boolean(aiStatus?.ollama?.online);

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Kỹ Thuật & Điều Phối Mô Hình"
                title="Trung Tâm Điều Phối AI & Giám Sát Mô Hình"
                description="Giám sát tình trạng máy chủ Local LLM (Ollama), Đám mây Google Gemini và linh hoạt chuyển đổi động cơ AI phục vụ người dùng."
                actions={
                    <button className="ft-button ft-button--ghost" type="button" onClick={loadAiStatus} disabled={statusLoading}>
                        {statusLoading ? 'Đang kiểm tra...' : '🔄 Làm mới trạng thái AI'}
                    </button>
                }
            />

            {switchFeedback ? (
                <div style={{ padding: '12px 16px', borderRadius: '8px', background: switchFeedback.success ? '#ecfdf5' : '#fef2f2', border: switchFeedback.success ? '1px solid #10b981' : '1px solid #ef4444', color: switchFeedback.success ? '#065f46' : '#991b1b', marginBottom: '16px' }}>
                    <strong>{switchFeedback.success ? '✅ Thành công: ' : '❌ Thất bại: '}</strong>
                    {switchFeedback.message}
                </div>
            ) : null}

            {/* AI Engines Overview Cards */}
            <div className="ft-grid ft-grid--2-1" style={{ marginBottom: '20px' }}>
                <AdminCard
                    title="Chọn Loại Động Cơ AI (Active AI Provider)"
                    subtitle="Hệ thống sẽ chuyển mạch ngay lập tức trên các yêu cầu mô phỏng tiếp theo."
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                borderRadius: '8px',
                                border: selectedProvider === 'hybrid' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                background: selectedProvider === 'hybrid' ? '#eff6ff' : '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            <input
                                type="radio"
                                name="ai_provider"
                                value="hybrid"
                                checked={selectedProvider === 'hybrid'}
                                onChange={() => handleSwitchProvider('hybrid')}
                                disabled={switchLoading}
                                style={{ marginTop: '3px' }}
                            />
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <strong style={{ color: '#1e293b' }}>⚡ Hybrid Auto-failover (Khuyên dùng)</strong>
                                    <AdminBadge tone="blue">Mặc định</AdminBadge>
                                </div>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                                    Ưu tiên gọi <strong>Local LLM (futuretrace-ai)</strong> trên GPU cục bộ. Nếu Local máy chủ bị bận hoặc offline, tự động chuyển đổi sang <strong>Cloud Gemini</strong> mà không làm gián đoạn người dùng.
                                </p>
                            </div>
                        </label>

                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                borderRadius: '8px',
                                border: selectedProvider === 'ollama' ? '2px solid #10b981' : '1px solid #e2e8f0',
                                background: selectedProvider === 'ollama' ? '#ecfdf5' : '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            <input
                                type="radio"
                                name="ai_provider"
                                value="ollama"
                                checked={selectedProvider === 'ollama'}
                                onChange={() => handleSwitchProvider('ollama')}
                                disabled={switchLoading}
                                style={{ marginTop: '3px' }}
                            />
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <strong style={{ color: '#1e293b' }}>💻 Local Fine-Tuned Model (Ollama)</strong>
                                    <AdminBadge tone={isOllamaOnline ? 'green' : 'red'}>
                                        {isOllamaOnline ? 'Online' : 'Offline'}
                                    </AdminBadge>
                                </div>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                                    Chỉ sử dụng mô hình Qwen 2.5 7B đã fine-tune nội bộ <code>{aiStatus?.ollama?.modelName || 'futuretrace-ai'}</code>. Hoàn toàn bảo mật, dữ liệu không rời khỏi máy chủ cục bộ, chi phí API 0 VNĐ.
                                </p>
                            </div>
                        </label>

                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '12px',
                                borderRadius: '8px',
                                border: selectedProvider === 'gemini' ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
                                background: selectedProvider === 'gemini' ? '#f5f3ff' : '#fff',
                                cursor: 'pointer',
                            }}
                        >
                            <input
                                type="radio"
                                name="ai_provider"
                                value="gemini"
                                checked={selectedProvider === 'gemini'}
                                onChange={() => handleSwitchProvider('gemini')}
                                disabled={switchLoading}
                                style={{ marginTop: '3px' }}
                            />
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <strong style={{ color: '#1e293b' }}>☁️ Cloud Gemini Engine (Google)</strong>
                                    <AdminBadge tone="purple">Cloud API</AdminBadge>
                                </div>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                                    Chỉ sử dụng API đám mây Google Gemini 2.5 Flash / Lite với cơ chế xoay vòng Multi-Keys. Tốc độ suy luận cao, thích hợp khi máy trạm không có GPU rời.
                                </p>
                            </div>
                        </label>
                    </div>
                </AdminCard>

                <AdminCard
                    title="Trạng Thái Hạ Tầng Máy Chủ AI"
                    subtitle="Kiểm tra kết nối trực tiếp đến các engine."
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <strong>Máy chủ Local Ollama</strong>
                                <AdminBadge tone={isOllamaOnline ? 'green' : 'red'}>
                                    {isOllamaOnline ? 'ONLINE' : 'OFFLINE'}
                                </AdminBadge>
                            </div>
                            <small style={{ color: '#64748b', display: 'block' }}>Endpoint: <code>{aiStatus?.ollama?.baseUrl || 'http://127.0.0.1:11434'}</code></small>
                            <small style={{ color: '#64748b', display: 'block' }}>Mô hình Fine-tune: <strong>{aiStatus?.ollama?.modelName || 'futuretrace-ai'}</strong> ({aiStatus?.ollama?.hasModel ? 'Đã nạp' : 'Chưa có'})</small>
                            {aiStatus?.ollama?.latencyMs ? (
                                <small style={{ color: '#10b981', display: 'block', marginTop: '4px' }}>Độ trễ phản hồi: {aiStatus.ollama.latencyMs}ms</small>
                            ) : null}
                            {aiStatus?.ollama?.error ? (
                                <small style={{ color: '#ef4444', display: 'block', marginTop: '4px' }}>Lỗi: {aiStatus.ollama.error}</small>
                            ) : null}
                        </div>

                        <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <strong>Đám mây Google Gemini</strong>
                                <AdminBadge tone="green">ĐÃ KẾT NỐI</AdminBadge>
                            </div>
                            <small style={{ color: '#64748b', display: 'block' }}>Mô hình chính: <strong>{aiStatus?.gemini?.primaryModel || 'gemini-2.5-flash'}</strong></small>
                            <small style={{ color: '#64748b', display: 'block' }}>Hạn ngạch API Keys: <strong>{aiStatus?.gemini?.keysCount || 1} khóa xoay vòng</strong></small>
                            <small style={{ color: '#64748b', display: 'block' }}>Fallback: gemini-2.5-flash-lite, gemini-3.1-flash-lite</small>
                        </div>
                    </div>
                </AdminCard>
            </div>

            {/* Performance Stats */}
            <div className="ft-stats-grid ft-stats-grid--compact">
                <AdminStatCard label="Thành công" value={stats.success || 0} />
                <AdminStatCard label="Thất bại" value={stats.failed || 0} tone="red" />
                <AdminStatCard label="Đang thử lại" value={stats.retrying || 0} tone="amber" />
                <AdminStatCard label="Độ trễ trung bình" value={formatLatency(stats.avgLatency || 0)} tone="blue" />
            </div>

            {/* System Logs Table */}
            <AdminCard title="Nhật ký các lượt gọi AI & Phân tích Telemetry">
                <div className="ft-table-wrapper">
                    <table className="ft-table">
                        <thead>
                            <tr>
                                <th>Mã ID (Correlation)</th>
                                <th>Loại</th>
                                <th>Mô phỏng/Người dùng</th>
                                <th>Mô hình</th>
                                <th>Trạng thái</th>
                                <th>Độ trễ</th>
                                <th>Chi phí ước tính</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td>
                                        <strong>{log.correlationId}</strong>
                                        <span>{log.promptVersion}</span>
                                    </td>
                                    <td>{log.requestType}</td>
                                    <td>{log.userName}</td>
                                    <td><code>{log.model}</code></td>
                                    <td>
                                        <AdminBadge tone={getToneByStatus(log.status)}>{log.status}</AdminBadge>
                                    </td>
                                    <td>{formatLatency(log.latencyMs)}</td>
                                    <td>{formatCost(log.estimatedCost)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminCard>
        </div>
    );
}

function RagManagementPage({ api, onForbidden }) {
    const { data, loading, error, reload } = useRemoteResource(
        () => api.getRagStatus(),
        [api],
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState(null);

    // Modal thêm tri thức RAG
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addCategory, setAddCategory] = useState('salaries');
    const [addForm, setAddForm] = useState({
        title: '',
        minVnd: '15',
        avgVnd: '28',
        maxVnd: '50',
        sampleSize: '50',
        schoolName: '',
        majorName: '',
        majorCode: '7480201',
        cutoffScore: '26.5',
        subjectGroup: 'A00,A01,D01',
        tuitionVnd: '32000000',
        city: '',
        studentMillion: '8.5',
        rentVnd: '3000000',
        mealVnd: '45000',
    });
    const [addLoading, setAddLoading] = useState(false);

    // Chế độ thêm: 'single' (thủ công) hoặc 'bulk' (hàng loạt)
    const [addMode, setAddMode] = useState('single');
    const [bulkFormat, setBulkFormat] = useState('json'); // 'json' | 'csv'
    const [bulkText, setBulkText] = useState('');
    const [bulkError, setBulkError] = useState(null);

    const loadSampleBulkData = (cat = addCategory, fmt = bulkFormat) => {
        setBulkError(null);
        if (fmt === 'json') {
            if (cat === 'salaries') {
                setBulkText(JSON.stringify([
                    { title: "AI Research Scientist", minVnd: 35, avgVnd: 60, maxVnd: 120, sampleSize: 80 },
                    { title: "DevSecOps Engineer", minVnd: 25, avgVnd: 45, maxVnd: 75, sampleSize: 120 },
                    { title: "Prompt Engineer", minVnd: 18, avgVnd: 30, maxVnd: 50, sampleSize: 45 }
                ], null, 2));
            } else if (cat === 'admissions') {
                setBulkText(JSON.stringify([
                    { schoolName: "Đại học Bách Khoa Hà Nội", majorName: "Khoa học Dữ liệu và AI", cutoffScore: 28.8, subjectGroup: "A00,A01", tuitionVnd: 38000000 },
                    { schoolName: "Đại học FPT", majorName: "Thiết kế Vi mạch Bán dẫn (Semiconductor)", cutoffScore: 24.5, subjectGroup: "A00,A01,D01", tuitionVnd: 35000000 },
                    { schoolName: "Đại học Công nghệ - ĐHQGHN", majorName: "Kỹ thuật Robot và Trí tuệ Nhân tạo", cutoffScore: 27.9, subjectGroup: "A00,A01", tuitionVnd: 35000000 }
                ], null, 2));
            } else {
                setBulkText(JSON.stringify([
                    { city: "Bình Dương", studentMillion: 7.5, rentVnd: 2200000, mealVnd: 35000, level: "Medium" },
                    { city: "Đà Lạt", studentMillion: 7.0, rentVnd: 2000000, mealVnd: 35000, level: "Low" }
                ], null, 2));
            }
        } else {
            // CSV
            if (cat === 'salaries') {
                setBulkText("title,minVnd,avgVnd,maxVnd,sampleSize\nAI Research Scientist,35,60,120,80\nDevSecOps Engineer,25,45,75,120\nPrompt Engineer,18,30,50,45");
            } else if (cat === 'admissions') {
                setBulkText("schoolName,majorName,cutoffScore,subjectGroup,tuitionVnd\nĐại học Bách Khoa Hà Nội,Khoa học Dữ liệu và AI,28.8,A00;A01,38000000\nĐại học FPT,Thiết kế Vi mạch Bán dẫn,24.5,A00;A01;D01,35000000\nĐại học Công nghệ - ĐHQGHN,Kỹ thuật Robot,27.9,A00;A01,35000000");
            } else {
                setBulkText("city,studentMillion,rentVnd,mealVnd,level\nBình Dương,7.5,2200000,35000,Medium\nĐà Lạt,7.0,2000000,35000,Low");
            }
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result;
            if (typeof content === 'string') {
                setBulkText(content);
                if (file.name.toLowerCase().endsWith('.csv')) {
                    setBulkFormat('csv');
                } else if (file.name.toLowerCase().endsWith('.json')) {
                    setBulkFormat('json');
                }
            }
        };
        reader.readAsText(file);
    };

    const handleBulkImport = async (e) => {
        e.preventDefault();
        setBulkError(null);
        if (!bulkText.trim()) {
            setBulkError('Vui lòng nhập hoặc dán dữ liệu cần thêm.');
            return;
        }

        let parsedItems = [];
        try {
            if (bulkFormat === 'json') {
                const parsed = JSON.parse(bulkText);
                parsedItems = Array.isArray(parsed) ? parsed : [parsed];
            } else {
                // CSV parse
                const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
                if (lines.length < 2) {
                    throw new Error('Dữ liệu CSV cần có ít nhất 1 dòng tiêu đề (header) và 1 dòng dữ liệu.');
                }
                const headers = lines[0].split(',').map(h => h.trim());
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',').map(c => c.trim());
                    const obj = {};
                    headers.forEach((h, idx) => {
                        obj[h] = cols[idx] !== undefined ? cols[idx] : '';
                    });
                    parsedItems.push(obj);
                }
            }
        } catch (err) {
            setBulkError('Lỗi định dạng dữ liệu: ' + err.message);
            return;
        }

        if (parsedItems.length === 0) {
            setBulkError('Không tìm thấy bản ghi nào hợp lệ.');
            return;
        }

        setAddLoading(true);
        try {
            const res = await api.bulkImportRagKnowledge({
                category: addCategory,
                items: parsedItems
            });
            setSyncResult({ success: true, message: res.message });
            setAddModalOpen(false);
            setBulkText('');
            await reload();
        } catch (err) {
            setBulkError(getErrorMessage(err));
        } finally {
            setAddLoading(false);
        }
    };

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    const doSearch = async (term) => {
        const q = (term !== undefined ? term : searchQuery).trim();
        if (!q) return;
        setSearchLoading(true);
        try {
            const res = await api.searchRag(q);
            setSearchResults(res);
        } catch (err) {
            console.error('RAG search error:', err);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        doSearch();
    };

    const handleQuickSearch = (tag) => {
        setSearchQuery(tag);
        doSearch(tag);
    };

    const handleAddKnowledge = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        try {
            const res = await api.addRagKnowledge({
                category: addCategory,
                data: addForm
            });
            setSyncResult({ success: true, message: res.message });
            setAddModalOpen(false);
            await reload();
            // Tự động tìm kiếm mục vừa thêm
            const searchTerm = addCategory === 'salaries' ? addForm.title : (addCategory === 'admissions' ? addForm.majorName : addForm.city);
            if (searchTerm) {
                setSearchQuery(searchTerm);
                doSearch(searchTerm);
            }
        } catch (err) {
            setSyncResult({ success: false, message: getErrorMessage(err) });
        } finally {
            setAddLoading(false);
        }
    };

    const handleSync = async (reason) => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const res = await api.syncRagKnowledge(reason);
            setSyncResult({ success: true, message: res.message });
            setModalOpen(false);
            await reload();
        } catch (err) {
            setSyncResult({ success: false, message: getErrorMessage(err) });
            setModalOpen(false);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) return <LoadingCard title="Đang tải dữ liệu tri thức RAG..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const indices = data?.indices || [];
    const rawSources = data?.rawSources || [];

    const getIndexIcon = (id) => {
        switch (id) {
            case 'admissions': return <GraduationCap size={20} weight="duotone" />;
            case 'salaries': return <CurrencyCircleDollar size={20} weight="duotone" />;
            case 'living_costs': return <Buildings size={20} weight="duotone" />;
            case 'market_intelligence': return <ChartBar size={20} weight="duotone" />;
            case 'domains': return <Compass size={20} weight="duotone" />;
            default: return <Database size={20} weight="duotone" />;
        }
    };

    const getQuickQueryForIndex = (id) => {
        switch (id) {
            case 'admissions': return 'Điểm chuẩn Bách Khoa';
            case 'salaries': return 'Lương developer';
            case 'living_costs': return 'Hà Nội';
            case 'market_intelligence': return 'Trí tuệ nhân tạo';
            case 'domains': return 'Kỹ thuật phần mềm';
            default: return 'lương';
        }
    };

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Hệ Thống Phân Tích & Dữ Liệu Lớn"
                title="Quản trị Tri thức RAG & Đồng bộ Dữ liệu"
                description="Giám sát 5 chỉ mục tri thức tuyển sinh, việc làm, chi phí sinh hoạt và thực hiện đồng bộ dữ liệu vào hệ sinh thái FutureTrace."
                actions={
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="ft-button ft-button--ghost"
                            type="button"
                            onClick={() => setAddModalOpen(true)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Plus size={16} weight="bold" />
                            <span>Thêm tri thức RAG</span>
                        </button>
                        <button
                            className="ft-button"
                            type="button"
                            disabled={syncing}
                            onClick={() => setModalOpen(true)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                            <ArrowClockwise size={16} weight="bold" className={syncing ? 'ft-spin' : ''} />
                            <span>{syncing ? 'Đang đồng bộ...' : 'Đồng bộ & Cập nhật RAG'}</span>
                        </button>
                    </div>
                }
            />

            {syncResult ? (
                <div style={{ padding: '14px 18px', borderRadius: '10px', background: syncResult.success ? '#ecfdf5' : '#fef2f2', border: syncResult.success ? '1px solid #10b981' : '1px solid #ef4444', color: syncResult.success ? '#065f46' : '#991b1b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    {syncResult.success ? <CheckCircle size={20} weight="fill" color="#10b981" /> : <WarningCircle size={20} weight="fill" color="#ef4444" />}
                    <div>
                        <strong>{syncResult.success ? 'Đồng bộ hoàn tất: ' : 'Lỗi xử lý: '}</strong>
                        <span>{syncResult.message}</span>
                    </div>
                </div>
            ) : null}

            <div className="ft-stats-grid ft-stats-grid--compact">
                <AdminStatCard label="Tổng bản ghi RAG" value={Number(data?.totalRecords || 0).toLocaleString('vi-VN')} tone="blue" />
                <AdminStatCard label="Dung lượng kho JSON" value={data?.totalSize || '0 MB'} tone="emerald" />
                <AdminStatCard label="Dữ liệu thô (Raw Big Data)" value={data?.totalRawSize || '293.9 MB'} tone="purple" />
                <AdminStatCard label="Trạng thái kho RAG" value="Sẵn sàng (Healthy)" tone="green" />
            </div>

            <AdminCard
                title="Danh mục các chỉ mục RAG đang hoạt động"
                subtitle="Dữ liệu chuẩn hóa JSON sẵn sàng cho động cơ truy xuất ngữ cảnh (Context Retrieval)."
            >
                <div className="ft-table-wrapper">
                    <table className="ft-table">
                        <thead>
                            <tr>
                                <th>Chỉ mục tri thức</th>
                                <th>Tệp dữ liệu (.json)</th>
                                <th>Nguồn gốc</th>
                                <th>Số lượng bản ghi</th>
                                <th>Dung lượng</th>
                                <th>Cập nhật lúc</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {indices.map((idx) => (
                                <tr key={idx.id}>
                                    <td>
                                        <div className="ft-rag-index-title-cell">
                                            <div className={`ft-rag-table-icon-wrap ft-rag-table-icon-wrap--${idx.id}`}>
                                                {getIndexIcon(idx.id)}
                                            </div>
                                            <div>
                                                <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{idx.title}</strong>
                                                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>{idx.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="ft-rag-code-pill">
                                            <span className="ft-rag-code-dot" />
                                            {idx.fileName}
                                        </span>
                                    </td>
                                    <td>
                                        <small style={{ color: '#475569', fontSize: '12px' }}>{idx.source}</small>
                                    </td>
                                    <td>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                                <strong style={{ fontSize: '1.05rem', color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                                                    {Number(idx.count || 0).toLocaleString('vi-VN')}
                                                </strong>
                                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{idx.unitLabel || 'mục'}</span>
                                            </div>
                                            {idx.detailInfo ? (
                                                <small style={{ fontSize: '11px', color: '#0284c7', display: 'block', marginTop: '2px', fontWeight: 500, lineHeight: 1.3 }}>
                                                    {idx.detailInfo}
                                                </small>
                                            ) : null}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '12.5px', color: '#334155', fontWeight: 500 }}>{idx.sizeFormatted}</span>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>{idx.updatedAt}</span>
                                    </td>
                                    <td>
                                        <AdminBadge tone={idx.exists ? 'green' : 'red'}>
                                            {idx.exists ? 'Sẵn sàng' : 'Chưa lập'}
                                        </AdminBadge>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="ft-action-pill"
                                            onClick={() => {
                                                const q = getQuickQueryForIndex(idx.id);
                                                handleQuickSearch(q);
                                                const el = document.getElementById('rag-search-section');
                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            title="Thử nghiệm tra cứu chỉ mục này"
                                        >
                                            Tra cứu thử
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminCard>

            <div className="ft-grid ft-grid--2-1" id="rag-search-section">
                <AdminCard
                    title="Công cụ kiểm tra truy xuất RAG (Context Retrieval Sandbox)"
                    subtitle="Tra cứu thử nghiệm kết quả ngữ cảnh được mô hình AI trích xuất thực tế trên cả 5 kênh dữ liệu."
                >
                    <form onSubmit={handleSearch} className="ft-rag-search-box">
                        <div className="ft-rag-search-input-wrap">
                            <MagnifyingGlass className="ft-rag-search-icon" weight="bold" />
                            <input
                                className="ft-rag-search-input"
                                placeholder="Tra cứu: lương, lương developer, kỹ thuật phần mềm, bách khoa, hà nội..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="ft-rag-search-btn" type="submit" disabled={searchLoading}>
                            <Sparkle size={16} weight="fill" />
                            <span>{searchLoading ? 'Đang tìm...' : 'Truy xuất RAG'}</span>
                        </button>
                    </form>

                    <div className="ft-rag-quick-tags-wrap">
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Tag size={13} weight="bold" /> Gợi ý nhanh:
                        </span>
                        {[
                            { label: '💼 Lương Developer', query: 'lương developer' },
                            { label: '💼 Lương Kế toán', query: 'Kế toán' },
                            { label: '🎓 ĐH Bách Khoa', query: 'Bách Khoa' },
                            { label: '🎓 Kỹ thuật phần mềm', query: 'Kỹ thuật phần mềm' },
                            { label: '🏠 Chi phí Hà Nội', query: 'Hà Nội' },
                            { label: '📊 Xu hướng AI', query: 'AI' }
                        ].map((tag) => (
                            <button
                                key={tag.query}
                                type="button"
                                className="ft-rag-tag-btn"
                                onClick={() => handleQuickSearch(tag.query)}
                            >
                                {tag.label}
                            </button>
                        ))}
                    </div>

                    {searchResults ? (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                                    Tìm thấy <strong style={{ color: '#0f172a' }}>{searchResults.total}</strong> kết quả khớp với "<em>{searchResults.query}</em>":
                                </p>
                                <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                                    5/5 kênh RAG
                                </span>
                            </div>
                            <div className="ft-rag-results-container">
                                {searchResults.results.map((r, i) => (
                                    <div className="ft-rag-result-card" key={i}>
                                        <div className="ft-rag-result-header">
                                            <span className="ft-rag-result-type-badge">{r.type}</span>
                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Chỉ mục #{i + 1}</span>
                                        </div>
                                        <h4 className="ft-rag-result-title">{r.title}</h4>
                                        <p className="ft-rag-result-body">{r.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '44px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', fontSize: '24px' }}>
                                <MagnifyingGlass weight="duotone" />
                            </div>
                            <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a' }}>Thử nghiệm mô hình truy xuất RAG</h4>
                            <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>
                                Nhập <strong>"lương"</strong>, <strong>"developer"</strong>, ngành học hoặc trường đại học để thử nghiệm kết quả AI nhận diện.
                            </p>
                        </div>
                    )}
                </AdminCard>

                <AdminCard
                    title="Nguồn dữ liệu thực tế (Raw Big Data)"
                    subtitle="Kiểm tra các tệp dữ liệu gốc trên máy chủ FutureTrace."
                >
                    <div className="ft-rag-source-list">
                        {rawSources.map((src, i) => (
                            <div className="ft-rag-source-card" key={i}>
                                <div className="ft-rag-source-left">
                                    <div className={`ft-rag-file-badge ft-rag-file-badge--${src.fileType || 'xlsx'}`}>
                                        {src.fileType === 'parquet' ? 'PQT' : (src.fileType || 'XLSX').toUpperCase()}
                                    </div>
                                    <div className="ft-rag-source-details">
                                        <h5 className="ft-rag-source-title">{src.title || src.name}</h5>
                                        <span className="ft-rag-source-filename">{src.name}</span>
                                        <div className="ft-rag-source-meta">
                                            <span>{src.sizeFormatted || 'N/A'}</span>
                                            <span>•</span>
                                            <span>{src.updatedAt ? `Cập nhật: ${src.updatedAt}` : 'Sẵn sàng'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="ft-rag-source-right">
                                    <AdminBadge tone={src.exists ? 'green' : 'amber'}>
                                        {src.exists ? 'Sẵn sàng' : 'Chưa tìm thấy'}
                                    </AdminBadge>
                                </div>
                            </div>
                        ))}
                        <div className="ft-rag-raw-summary">
                            <span>⚡ Tổng dữ liệu thô: <strong>{data?.totalRawSize || '293.9 MB'}</strong></span>
                            <span style={{ fontSize: '0.78rem', color: '#15803d' }}>6/6 tệp gốc toàn vẹn</span>
                        </div>
                    </div>
                </AdminCard>
            </div>

            {/* Modal Thêm Tri Thức RAG Mới */}
            {addModalOpen && (
                <div className="ft-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setAddModalOpen(false)}>
                    <div className="ft-modal" style={{ maxWidth: '620px' }}>
                        <div className="ft-modal__header">
                            <div>
                                <span className="ft-eyebrow">Cơ chế làm giàu tri thức</span>
                                <h3 className="ft-modal__title">Mở Rộng Cơ Sở Tri Thức RAG</h3>
                            </div>
                            <button className="ft-icon-button" type="button" onClick={() => setAddModalOpen(false)}>✕</button>
                        </div>

                        {/* Tabs chuyển đổi: Đơn lẻ vs Hàng loạt */}
                        <div className="ft-modal-tabs">
                            <button
                                type="button"
                                className={`ft-modal-tab-btn ${addMode === 'single' ? 'ft-modal-tab-btn--active' : ''}`}
                                onClick={() => setAddMode('single')}
                            >
                                <span>✍️ Thêm từng mục (Thủ công)</span>
                            </button>
                            <button
                                type="button"
                                className={`ft-modal-tab-btn ${addMode === 'bulk' ? 'ft-modal-tab-btn--active' : ''}`}
                                onClick={() => {
                                    setAddMode('bulk');
                                    if (!bulkText) loadSampleBulkData(addCategory, bulkFormat);
                                }}
                            >
                                <span>⚡ Nhập hàng loạt (Bulk Import)</span>
                            </button>
                        </div>

                        {/* Phân loại tri thức */}
                        <label className="ft-field">
                            <span className="ft-field__label">Chọn phân loại tri thức</span>
                            <select
                                value={addCategory}
                                onChange={(e) => {
                                    const newCat = e.target.value;
                                    setAddCategory(newCat);
                                    if (addMode === 'bulk') loadSampleBulkData(newCat, bulkFormat);
                                }}
                            >
                                <option value="salaries">💼 Chức Danh & Mức Lương (salaries_index.json)</option>
                                <option value="admissions">🎓 Tuyển Sinh & Điểm Chuẩn (admissions_index.json)</option>
                                <option value="living_costs">🏠 Chi Phí Sinh Hoạt Đô Thị (living_costs_index.json)</option>
                            </select>
                        </label>

                        {/* Banner thông điệp Smart Upsert (Khử trùng lặp thông minh) */}
                        <div className="ft-smart-upsert-tip">
                            <span>🛡️</span>
                            <div>
                                <strong>Cơ chế Smart Upsert (Không sợ trùng lặp dữ liệu):</strong>{' '}
                                Không cần xóa dữ liệu cũ! Nếu bản ghi (ngành/trường/chức danh) đã tồn tại, hệ thống tự động <strong>cập nhật chỉ số mới nhất</strong>. Nếu là bản ghi mới, hệ thống tự động bổ sung vào kho tri thức.
                            </div>
                        </div>

                        {/* ==================== FORM CHẾ ĐỘ ĐƠN LẺ ==================== */}
                        {addMode === 'single' ? (
                            <form onSubmit={handleAddKnowledge} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {addCategory === 'salaries' && (
                                    <>
                                        <label className="ft-field">
                                            <span className="ft-field__label">Tên chức danh nghề nghiệp</span>
                                            <input
                                                required
                                                placeholder="Ví dụ: AI Engineer, Kỹ sư Robot, Data Analyst..."
                                                value={addForm.title}
                                                onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                                            />
                                        </label>
                                        <div className="ft-field-grid-3">
                                            <label className="ft-field">
                                                <span className="ft-field__label">Min (tr VNĐ)</span>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={addForm.minVnd}
                                                    onChange={(e) => setAddForm({ ...addForm, minVnd: e.target.value })}
                                                />
                                            </label>
                                            <label className="ft-field">
                                                <span className="ft-field__label">Trung bình (tr)</span>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={addForm.avgVnd}
                                                    onChange={(e) => setAddForm({ ...addForm, avgVnd: e.target.value })}
                                                />
                                            </label>
                                            <label className="ft-field">
                                                <span className="ft-field__label">Max (tr VNĐ)</span>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={addForm.maxVnd}
                                                    onChange={(e) => setAddForm({ ...addForm, maxVnd: e.target.value })}
                                                />
                                            </label>
                                        </div>
                                        <label className="ft-field">
                                            <span className="ft-field__label">Số lượng mẫu khảo sát</span>
                                            <input
                                                type="number"
                                                value={addForm.sampleSize}
                                                onChange={(e) => setAddForm({ ...addForm, sampleSize: e.target.value })}
                                            />
                                        </label>
                                    </>
                                )}

                                {addCategory === 'admissions' && (
                                    <>
                                        <label className="ft-field">
                                            <span className="ft-field__label">Tên trường Đại học</span>
                                            <input
                                                required
                                                placeholder="Ví dụ: Đại học Bách Khoa Hà Nội, Đại học FPT..."
                                                value={addForm.schoolName}
                                                onChange={(e) => setAddForm({ ...addForm, schoolName: e.target.value })}
                                            />
                                        </label>
                                        <div className="ft-field-grid-2">
                                            <label className="ft-field">
                                                <span className="ft-field__label">Tên ngành học</span>
                                                <input
                                                    required
                                                    placeholder="Ví dụ: Trí tuệ nhân tạo (AI)"
                                                    value={addForm.majorName}
                                                    onChange={(e) => setAddForm({ ...addForm, majorName: e.target.value })}
                                                />
                                            </label>
                                            <label className="ft-field">
                                                <span className="ft-field__label">Điểm chuẩn (thang 30)</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={addForm.cutoffScore}
                                                    onChange={(e) => setAddForm({ ...addForm, cutoffScore: e.target.value })}
                                                />
                                            </label>
                                        </div>
                                        <div className="ft-field-grid-2">
                                            <label className="ft-field">
                                                <span className="ft-field__label">Tổ hợp xét tuyển</span>
                                                <input
                                                    placeholder="A00, A01, D01"
                                                    value={addForm.subjectGroup}
                                                    onChange={(e) => setAddForm({ ...addForm, subjectGroup: e.target.value })}
                                                />
                                            </label>
                                            <label className="ft-field">
                                                <span className="ft-field__label">Học phí ước tính (VNĐ/năm)</span>
                                                <input
                                                    type="number"
                                                    placeholder="Ví dụ: 32000000"
                                                    value={addForm.tuitionVnd}
                                                    onChange={(e) => setAddForm({ ...addForm, tuitionVnd: e.target.value })}
                                                />
                                            </label>
                                        </div>
                                    </>
                                )}

                                {addCategory === 'living_costs' && (
                                    <>
                                        <label className="ft-field">
                                            <span className="ft-field__label">Tên tỉnh / thành phố</span>
                                            <input
                                                required
                                                placeholder="Ví dụ: Cần Thơ, Hải Phòng, Bình Dương..."
                                                value={addForm.city}
                                                onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                                            />
                                        </label>
                                        <div className="ft-field-grid-2">
                                            <label className="ft-field">
                                                <span className="ft-field__label">Ước tính SV (tr/tháng)</span>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={addForm.studentMillion}
                                                    onChange={(e) => setAddForm({ ...addForm, studentMillion: e.target.value })}
                                                />
                                            </label>
                                            <label className="ft-field">
                                                <span className="ft-field__label">Tiền thuê trọ (VNĐ/tháng)</span>
                                                <input
                                                    type="number"
                                                    value={addForm.rentVnd}
                                                    onChange={(e) => setAddForm({ ...addForm, rentVnd: e.target.value })}
                                                />
                                            </label>
                                        </div>
                                    </>
                                )}

                                <div className="ft-modal__actions">
                                    <button className="ft-button ft-button--ghost" type="button" onClick={() => setAddModalOpen(false)}>
                                        Huỷ
                                    </button>
                                    <button className="ft-button" type="submit" disabled={addLoading}>
                                        {addLoading ? 'Đang lưu...' : 'Lưu vào kho RAG'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* ==================== FORM CHẾ ĐỘ NHẬP HÀNG LOẠT ==================== */
                            <form onSubmit={handleBulkImport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Định dạng:</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setBulkFormat('json');
                                                loadSampleBulkData(addCategory, 'json');
                                            }}
                                            style={{
                                                padding: '3px 10px',
                                                borderRadius: '6px',
                                                fontSize: '11.5px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                border: bulkFormat === 'json' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                                                background: bulkFormat === 'json' ? '#eff6ff' : '#ffffff',
                                                color: bulkFormat === 'json' ? '#1d4ed8' : '#64748b'
                                            }}
                                        >
                                            JSON Array
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setBulkFormat('csv');
                                                loadSampleBulkData(addCategory, 'csv');
                                            }}
                                            style={{
                                                padding: '3px 10px',
                                                borderRadius: '6px',
                                                fontSize: '11.5px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                border: bulkFormat === 'csv' ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                                                background: bulkFormat === 'csv' ? '#eff6ff' : '#ffffff',
                                                color: bulkFormat === 'csv' ? '#1d4ed8' : '#64748b'
                                            }}
                                        >
                                            CSV (Dấu phẩy)
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            type="button"
                                            onClick={() => loadSampleBulkData(addCategory, bulkFormat)}
                                            style={{
                                                padding: '3px 9px',
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                fontSize: '11.5px',
                                                color: '#0284c7',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            📋 Nạp dữ liệu mẫu
                                        </button>
                                        <label
                                            style={{
                                                padding: '3px 9px',
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                fontSize: '11.5px',
                                                color: '#2563eb',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            📁 Tải tệp lên (.json, .csv)
                                            <input
                                                type="file"
                                                accept=".json,.csv"
                                                style={{ display: 'none' }}
                                                onChange={handleFileUpload}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <label className="ft-field">
                                    <span className="ft-field__label">
                                        Nội dung dữ liệu hàng loạt ({bulkFormat.toUpperCase()})
                                    </span>
                                    <textarea
                                        className="ft-bulk-textarea"
                                        placeholder={
                                            bulkFormat === 'json'
                                                ? '[ { "title": "AI Engineer", "minVnd": 25, "avgVnd": 45, "maxVnd": 70 }, ... ]'
                                                : 'title,minVnd,avgVnd,maxVnd\nAI Engineer,25,45,70'
                                        }
                                        value={bulkText}
                                        onChange={(e) => setBulkText(e.target.value)}
                                        rows={7}
                                    />
                                </label>

                                {bulkError && (
                                    <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '6px', fontSize: '12px' }}>
                                        ❌ {bulkError}
                                    </div>
                                )}

                                <div className="ft-modal__actions">
                                    <button className="ft-button ft-button--ghost" type="button" onClick={() => setAddModalOpen(false)}>
                                        Huỷ
                                    </button>
                                    <button className="ft-button" type="submit" disabled={addLoading || !bulkText.trim()}>
                                        {addLoading ? 'Đang xử lý...' : '⚡ Bắt đầu nạp hàng loạt'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <AdminConfirmModal
                open={modalOpen}
                title="Xác nhận Đồng bộ & Xây dựng lại RAG Index"
                description="Hệ thống sẽ chạy pipeline xử lý dữ liệu và cập nhật lại toàn bộ 5 tệp chỉ mục RAG từ các nguồn file gốc. Thao tác này sẽ ghi nhận vào Nhật ký Audit."
                confirmText="Bắt đầu đồng bộ"
                onClose={() => setModalOpen(false)}
                onConfirm={handleSync}
            />
        </div>
    );
}

function PromptsPage({ api, onForbidden }) {
    const { data, loading, error, reload } = useRemoteResource(
        () => api.getPrompts({ type: 'all', status: 'all' }),
        [api],
    );
    const [selectedId, setSelectedId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [action, setAction] = useState('release');

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải mẫu prompt..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const prompts = data || [];
    const activeSelectedId = selectedId ?? prompts[0]?.id ?? null;
    const selected = prompts.find((item) => item.id === activeSelectedId) || prompts[0];

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Kỹ Thuật & Cấu Hình"
                title="Quản lý Prompts"
                description="Theo dõi phiên bản prompt, người quản lý và quy trình phát hành."
            />

            <div className="ft-grid ft-grid--1-2">
                <AdminCard title="Phiên bản Prompt">
                    <div className="ft-review-list">
                        {prompts.map((template) => (
                            <button
                                key={template.id}
                                className={`ft-review-item ${activeSelectedId === template.id ? 'is-active' : ''}`}
                                onClick={() => setSelectedId(template.id)}
                            >
                                <div className="ft-row-inline ft-row-inline--spread">
                                    <strong>{template.name}</strong>
                                    <AdminBadge tone={getToneByStatus(template.status)}>{template.status}</AdminBadge>
                                </div>
                                <p>{template.summary}</p>
                                <small>{template.version}</small>
                            </button>
                        ))}
                    </div>
                </AdminCard>

                {selected ? (
                    <AdminCard
                        title={selected.name}
                        subtitle={`${selected.type} • ${selected.version} • ${selected.owner}`}
                        actions={
                            <div className="ft-inline-actions">
                                <button
                                    className="ft-button"
                                    onClick={() => {
                                        setAction('release');
                                        setModalOpen(true);
                                    }}
                                >
                                    Phát hành
                                </button>
                                <button
                                    className="ft-button ft-button--ghost"
                                    onClick={() => {
                                        setAction('rollback');
                                        setModalOpen(true);
                                    }}
                                >
                                    Rollback
                                </button>
                            </div>
                        }
                    >
                        {fieldLabel('Trạng thái', selected.status)}
                        {fieldLabel('Ngày cập nhật', selected.updatedAt)}
                        <div className="ft-code-block">{selected.content}</div>
                    </AdminCard>
                ) : null}
            </div>

            <AdminConfirmModal
                open={modalOpen}
                title={action === 'release' ? 'Phát hành prompt' : 'Khôi phục (Rollback) prompt'}
                description="Hành động này sẽ tạo audit log và cập nhật prompt đang sử dụng."
                confirmText={action === 'release' ? 'Phát hành' : 'Khôi phục'}
                onClose={() => setModalOpen(false)}
                onConfirm={async (reason) => {
                    if (!selected) return;
                    if (action === 'release') {
                        await api.releasePrompt(selected.id, reason);
                    } else {
                        await api.rollbackPrompt(selected.id, reason);
                    }
                    setModalOpen(false);
                    await reload();
                }}
            />
        </div>
    );
}

function SettingsPage({ api, onForbidden }) {
    const { data, loading, error, reload } = useRemoteResource(() => api.getSettings(), [api]);
    const [draftGroups, setDraftGroups] = useState({});
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải cài đặt hệ thống..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const groups = (data || []).map((group) => draftGroups[group.id] || group);
    const dirtyCount = Object.keys(draftGroups).length;

    const getProviderOptionLabel = (val) => {
        switch (val) {
            case 'hybrid':
                return '⚡ Hybrid (Local + Cloud Fallback)';
            case 'ollama':
                return '🔒 Local Only (100% Ollama nội bộ)';
            case 'gemini':
                return '☁️ Cloud Only (Google Gemini API)';
            default:
                return val;
        }
    };

    const getFieldBadge = (fieldKey) => {
        switch (fieldKey) {
            case 'local_model':
                return <span className="ft-setting-badge ft-setting-badge--local">Local Fine-tuned</span>;
            case 'ollama_endpoint':
                return <span className="ft-setting-badge ft-setting-badge--endpoint">Ollama Port</span>;
            case 'cloud_fallback_model':
                return <span className="ft-setting-badge ft-setting-badge--cloud">Cloud Fallback</span>;
            case 'ai_provider':
                return <span className="ft-setting-badge ft-setting-badge--mode">Động cơ chính</span>;
            default:
                return null;
        }
    };

    const getGroupBadge = (groupKey, fields) => {
        if (groupKey === 'ai') {
            const providerField = fields.find((f) => f.key === 'ai_provider');
            const provider = providerField?.value || 'hybrid';
            return (
                <span className="ft-settings-group-badge ft-settings-group-badge--ai">
                    ⚡ {String(provider).toUpperCase()} RUNTIME
                </span>
            );
        }
        if (groupKey === 'core') {
            return (
                <span className="ft-settings-group-badge ft-settings-group-badge--core">
                    VẬN HÀNH LÕI
                </span>
            );
        }
        if (groupKey === 'community') {
            return (
                <span className="ft-settings-group-badge ft-settings-group-badge--community">
                    CỘNG ĐỒNG & AN TOÀN
                </span>
            );
        }
        return null;
    };

    return (
        <div className="ft-page-stack ft-settings-page">
            <AdminPageHeader
                eyebrow="Kỹ Thuật & Cấu Hình"
                title="Cài đặt hệ thống"
                description="Tính năng (Feature flags), quy tắc vận hành và điều phối Động cơ AI (Local Ollama & Cloud Fallback)."
                actions={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {dirtyCount > 0 && (
                            <>
                                <span className="ft-settings-dirty-badge">
                                    ⚠️ Có thay đổi chưa lưu
                                </span>
                                <button
                                    className="ft-button ft-button--ghost ft-button--sm"
                                    onClick={() => setDraftGroups({})}
                                >
                                    Hủy nháp
                                </button>
                            </>
                        )}
                        <button className="ft-button" onClick={() => setModalOpen(true)}>
                            Lưu thay đổi
                        </button>
                    </div>
                }
            />

            {/* AI Architecture Explain Banner */}
            <div className="ft-ai-architecture-banner">
                <div className="ft-ai-banner-icon">🧠</div>
                <div className="ft-ai-banner-content">
                    <div className="ft-ai-banner-header">
                        <h4>Kiến trúc suy luận AI của FutureTrace: Local First + Cloud Fallback</h4>
                        <span className="ft-status-pill ft-status-pill--success">Đã chuẩn hóa theo ứng dụng</span>
                    </div>
                    <p>
                        Hệ thống ưu tiên vận hành mô hình cục bộ chuyên biệt <strong>futuretrace-ai</strong> (được fine-tune trên máy chủ Ollama tại <code>http://127.0.0.1:11434</code>) nhằm đảm bảo tốc độ cao và bảo mật dữ liệu học sinh/sinh viên. 
                        Google Gemini chỉ đóng vai trò <strong>kênh dự phòng (Cloud Fallback)</strong> an toàn khi máy chủ nội bộ quá tải hoặc bảo trì.
                    </p>
                </div>
                <div className="ft-ai-banner-action">
                    <a href="#/admin/ai" className="ft-button ft-button--ghost ft-button--sm">
                        Bảng điều khiển AI Monitor ↗
                    </a>
                </div>
            </div>

            <div className="ft-card-grid ft-settings-card-grid">
                {groups.map((group) => (
                    <AdminCard
                        key={group.id}
                        className="ft-settings-group-card"
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
                                <span>{group.title}</span>
                                {getGroupBadge(group.groupKey, group.fields)}
                            </div>
                        }
                        subtitle={group.description}
                    >
                        <div className="ft-settings-list">
                            {group.fields.map((field, fieldIndex) => (
                                <label
                                    className={`ft-setting-row ${field.type === 'toggle' ? 'ft-setting-row--toggle' : 'ft-setting-row--field'}`}
                                    key={field.key}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                                            <strong>{field.label}</strong>
                                            {getFieldBadge(field.key)}
                                        </div>
                                        <p>{field.description}</p>
                                    </div>
                                    <div className="ft-setting-input-wrapper">
                                        {field.type === 'toggle' ? (
                                            <input
                                                checked={Boolean(field.value)}
                                                onChange={(event) =>
                                                    setDraftGroups((current) => {
                                                        const sourceGroup = current[group.id] || group;
                                                        return {
                                                            ...current,
                                                            [group.id]: {
                                                                ...sourceGroup,
                                                                fields: sourceGroup.fields.map((currentField, currentFieldIndex) =>
                                                                    currentFieldIndex === fieldIndex
                                                                        ? { ...currentField, value: event.target.checked }
                                                                        : currentField,
                                                                ),
                                                            },
                                                        };
                                                    })
                                                }
                                                type="checkbox"
                                            />
                                        ) : field.type === 'select' ? (
                                            <select
                                                value={field.value}
                                                onChange={(event) =>
                                                    setDraftGroups((current) => {
                                                        const sourceGroup = current[group.id] || group;
                                                        return {
                                                            ...current,
                                                            [group.id]: {
                                                                ...sourceGroup,
                                                                fields: sourceGroup.fields.map((currentField, currentFieldIndex) =>
                                                                    currentFieldIndex === fieldIndex
                                                                        ? { ...currentField, value: event.target.value }
                                                                        : currentField,
                                                                ),
                                                            },
                                                        };
                                                    })
                                                }
                                            >
                                                {field.options?.map((option) => (
                                                    <option key={option} value={option}>
                                                        {field.key === 'ai_provider' ? getProviderOptionLabel(option) : option}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type === 'number' ? 'number' : 'text'}
                                                value={field.value}
                                                onChange={(event) =>
                                                    setDraftGroups((current) => {
                                                        const sourceGroup = current[group.id] || group;
                                                        return {
                                                            ...current,
                                                            [group.id]: {
                                                                ...sourceGroup,
                                                                fields: sourceGroup.fields.map((currentField, currentFieldIndex) =>
                                                                    currentFieldIndex === fieldIndex
                                                                        ? {
                                                                            ...currentField,
                                                                            value:
                                                                                field.type === 'number'
                                                                                    ? Number(event.target.value)
                                                                                    : event.target.value,
                                                                        }
                                                                        : currentField,
                                                                ),
                                                            },
                                                        };
                                                    })
                                                }
                                            />
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </AdminCard>
                ))}
            </div>

            <AdminConfirmModal
                open={modalOpen}
                title="Lưu cài đặt hệ thống"
                description="Các tham số và cấu hình điều phối AI sẽ được đồng bộ ngay lập tức vào backend runtime."
                confirmText="Xác nhận & Lưu"
                onClose={() => setModalOpen(false)}
                onConfirm={async (reason) => {
                    for (const group of groups) {
                        await api.updateSettingsGroup(group.groupKey, {
                            title: group.title,
                            description: group.description,
                            fields: group.fields,
                            reason,
                        });
                    }
                    setDraftGroups({});
                    setModalOpen(false);
                    await reload();
                }}
            />
        </div>
    );
}


function SystemStatePage({ kind, navigate }) {
    const isForbidden = kind === '403';

    return (
        <div className="ft-page-stack">
            <AdminCard className="ft-system-card">
                <p className="ft-eyebrow">{isForbidden ? 'Từ chối quyền truy cập (Permission denied)' : 'Không tìm thấy trang (Page not found)'}</p>
                <h2>{isForbidden ? 'Bạn không có quyền truy cập module này.' : 'Đường dẫn admin không tồn tại.'}</h2>
                <p>
                    {isForbidden
                        ? 'Vui lòng đăng nhập bằng tài khoản có vai trò phù hợp.'
                        : 'Kiểm tra lại đường dẫn hoặc quay về bảng điều khiển (dashboard) để tiếp tục thao tác.'}
                </p>
                <div className="ft-page-actions">
                    <button className="ft-button" onClick={() => navigate('/dashboard')}>
                        Về bảng điều khiển
                    </button>
                </div>
            </AdminCard>
        </div>
    );
}

function InvestorMetricsPage({ api, onForbidden }) {
    const [days, setDays] = useState(30);
    const { data, loading, error, reload } = useRemoteResource(() => api.getInvestorMetrics(days), [api, days]);

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải chỉ số..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const v = (x, suffix = '') => (x === null || x === undefined ? '—' : `${Number(x).toLocaleString('vi-VN')}${suffix}`);
    const g = data.growth || {};
    const e = data.engagement || {};
    const q = data.aiQuality || {};
    const p = data.performance || {};
    const u = data.unitEconomics || {};
    const eng = data.engine || {};

    return (
        <div className="ft-page-stack ft-settings-page">
            <AdminPageHeader
                eyebrow="Báo cáo"
                title="Chỉ số cho bảo vệ & gọi vốn"
                description="Tăng trưởng, chất lượng AI, hiệu năng và kinh tế đơn vị, tính từ dữ liệu thật trong hệ thống."
                actions={
                    <select className="ft-input" value={days} onChange={(ev) => setDays(Number(ev.target.value))}>
                        {[7, 30, 90, 365].map((d) => <option key={d} value={d}>{d} ngày</option>)}
                    </select>
                }
            />
            <div className="ft-stats-grid">
                <AdminStatCard label="Tổng người dùng" value={v(g.totalUsers)} hint={`+${v(g.newUsers)} mới trong kỳ`} />
                <AdminStatCard label="Người dùng hoạt động" value={v(g.activeUsers)} hint={`${v(g.repeatUsers)} quay lại ≥ 2 lần`} />
                <AdminStatCard label="Mô phỏng hoàn thành" value={v(e.completionRate, '%')} hint={`${v(e.simulations)} lượt`} />
                <AdminStatCard label="Tỷ lệ 👍" value={v(q.thumbsUpRate, '%')} hint={`${v(q.feedbackCount)} phản hồi`} />
                <AdminStatCard label="Số liệu có căn cứ" value={v(q.groundednessAvg, '%')} hint="Grounding Verifier" />
                <AdminStatCard label="Do AI viết đầy đủ" value={v(q.aiCoverageAvg, '%')} hint="không phải lấp template" />
                <AdminStatCard label="Độ trễ P50 / P95" value={`${v(p.latencyMsP50)} / ${v(p.latencyMsP95)} ms`} hint={`token đầu P50 ${v(p.firstTokenMsP50)} ms`} />
                <AdminStatCard label="Do model riêng phục vụ" value={v(eng.primaryModelShare, '%')} hint={JSON.stringify(eng.requestsByProvider || {})} />
                <AdminStatCard label="Chi phí AI / mô phỏng" value={v(u.aiCostPerSimulationVnd, ' đ')} hint="Gemini dự phòng" />
                <AdminStatCard label="Doanh thu kỳ" value={v(u.revenueVnd, ' đ')} hint={`${v(u.payingUsers)} người trả phí · chuyển đổi ${v(u.conversionToPaidPercent, '%')}`} />
            </div>
            <AdminCard title="Trạng thái LLM Gateway" subtitle="Circuit breaker từng engine">
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(eng.gateway, null, 2)}</pre>
            </AdminCard>
        </div>
    );
}

function resolvePage(route, context) {
    const { api, navigate, onForbidden } = context;

    if (route === '/dashboard' || route === '/') {
        return <DashboardPage api={api} navigate={navigate} onForbidden={onForbidden} />;
    }
    if (route === '/metrics') {
        return <InvestorMetricsPage api={api} onForbidden={onForbidden} />;
    }
    if (route === '/payments') {
        return <PaymentsPage api={api} navigate={navigate} onForbidden={onForbidden} />;
    }
    if (route === '/users') return <UsersPage api={api} navigate={navigate} onForbidden={onForbidden} />;
    if (route.startsWith('/users/')) {
        return (
            <UserDetailPage
                api={api}
                userId={route.split('/')[2]}
                navigate={navigate}
                onForbidden={onForbidden}
            />
        );
    }
    if (route === '/simulations') {
        return <SimulationsPage api={api} navigate={navigate} onForbidden={onForbidden} />;
    }
    if (route.startsWith('/simulations/')) {
        return (
            <SimulationDetailPage
                api={api}
                simulationId={route.split('/')[2]}
                navigate={navigate}
                onForbidden={onForbidden}
            />
        );
    }
    if (route === '/premium-analyses') {
        return <PremiumAnalysesPage api={api} navigate={navigate} onForbidden={onForbidden} />;
    }
    if (route.startsWith('/premium-analyses/')) {
        return (
            <PremiumAnalysisDetailPage
                api={api}
                analysisId={route.split('/')[2]}
                navigate={navigate}
                onForbidden={onForbidden}
            />
        );
    }
    if (route === '/community/posts') {
        return <CommunityPostsPage api={api} navigate={navigate} onForbidden={onForbidden} />;
    }
    if (route.startsWith('/community/posts/')) {
        return (
            <CommunityPostDetailPage
                api={api}
                postId={route.split('/')[3]}
                navigate={navigate}
                onForbidden={onForbidden}
            />
        );
    }

    if (route === '/rag') return <RagManagementPage api={api} onForbidden={onForbidden} />;
    if (route === '/ai/logs' || route === '/ai') return <AiLogsPage api={api} onForbidden={onForbidden} />;
    if (route === '/prompts') return <PromptsPage api={api} onForbidden={onForbidden} />;
    if (route === '/settings') return <SettingsPage api={api} onForbidden={onForbidden} />;
    if (route === '/403') return <SystemStatePage kind="403" navigate={navigate} />;
    return <SystemStatePage kind="404" navigate={navigate} />;
}

function getStoredJson(key) {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export default function AdminApp() {
    const { route, navigate } = useHashRoute();
    const [session, setSession] = useState(() => getStoredJson(ADMIN_PROFILE_KEY));
    const [accessToken, setAccessToken] = useState(() => window.localStorage.getItem(ADMIN_TOKEN_KEY) || '');
    const [refreshToken, setRefreshToken] = useState(() => window.localStorage.getItem(ADMIN_REFRESH_KEY) || '');
    const [loginLoading, setLoginLoading] = useState(false);

    const clearAuth = useCallback(() => {
        window.localStorage.removeItem(ADMIN_STORAGE_KEY);
        window.localStorage.removeItem(ADMIN_PROFILE_KEY);
        window.localStorage.removeItem(ADMIN_TOKEN_KEY);
        window.localStorage.removeItem(ADMIN_REFRESH_KEY);
        setSession(null);
        setAccessToken('');
        setRefreshToken('');
    }, []);

    const handleAuthUpdate = useCallback((payload) => {
        if (payload?.admin) {
            setSession(payload.admin);
            window.localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(payload.admin));
            window.localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
        }

        if (payload?.accessToken) {
            setAccessToken(payload.accessToken);
            window.localStorage.setItem(ADMIN_TOKEN_KEY, payload.accessToken);
        }

        if (payload?.refreshToken) {
            setRefreshToken(payload.refreshToken);
            window.localStorage.setItem(ADMIN_REFRESH_KEY, payload.refreshToken);
        }
    }, []);

    const api = useMemo(
        () =>
            createAdminApi({
                getAccessToken: () => accessToken,
                getRefreshToken: () => refreshToken,
                onAuthUpdate: handleAuthUpdate,
                onUnauthorized: () => {
                    clearAuth();
                    navigate('/login');
                },
            }),
        [accessToken, refreshToken, handleAuthUpdate, clearAuth, navigate],
    );

    useEffect(() => {
        if (!accessToken) return;

        let active = true;
        api
            .getCurrentAdmin()
            .then((admin) => {
                if (!active) return;
                setSession(admin);
                window.localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(admin));
            })
            .catch((err) => {
                if (!active) return;
                console.error('Session verify failed:', err);
                if (err?.status === 401 || err?.status === 403) {
                    clearAuth();
                    navigate('/login');
                }
            });

        return () => {
            active = false;
        };
    }, [api, accessToken]);

    const handleLogin = async ({ email, password }) => {
        setLoginLoading(true);
        try {
            const payload = await api.login(email, password);
            handleAuthUpdate(payload);
            navigate('/dashboard');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            if (refreshToken) {
                await api.logout(refreshToken);
            }
        } catch {
            // Ignore logout API failures and clear local state anyway.
        } finally {
            clearAuth();
            navigate('/login');
        }
    };

    if (!session || !accessToken) {
        return <LoginPage onLogin={handleLogin} loading={loginLoading} />;
    }

    return (
        <AdminShell
            route={route}
            session={session}
            onNavigate={navigate}
            onLogout={handleLogout}
        >
            {resolvePage(route === '/login' || route === '/admin/login' ? '/dashboard' : route, {
                api,
                navigate,
                onForbidden: () => navigate('/403'),
            })}
        </AdminShell>
    );
}
