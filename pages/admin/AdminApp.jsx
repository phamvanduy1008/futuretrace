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
                                    <div>
                                        <div className="ft-row-inline">
                                            <strong>{alert.title}</strong>
                                            <AdminBadge tone={getToneByStatus(alert.severity)}>
                                                {alert.severity}
                                            </AdminBadge>
                                        </div>
                                        <p>{alert.description}</p>
                                    </div>
                                    <span>{alert.createdAt}</span>
                                </div>
                            ))
                        )}
                    </div>
                </AdminCard>

                <AdminCard title="Lối tắt vận hành" subtitle="Đi nhanh đến các luồng nghẽn.">
                    <div className="ft-quick-actions">
                        <button className="ft-button ft-button--ghost" onClick={() => navigate('/simulations')}>
                            Mô phỏng thất bại
                        </button>
                        <button
                            className="ft-button ft-button--ghost"
                            onClick={() => navigate('/community/posts')}
                        >
                            Quản lý Bài viết
                        </button>
                        <button className="ft-button ft-button--ghost" onClick={() => navigate('/prompts')}>
                            Bản phát hành Prompt
                        </button>
                        <button className="ft-button ft-button--ghost" onClick={() => navigate('/payments')}>
                            Quản lý giao dịch
                        </button>
                        <button className="ft-button ft-button--ghost" onClick={() => navigate('/settings')}>
                            Cài đặt hệ thống
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
                                <strong>{simulation.title}</strong>
                                <span>{simulation.status}</span>
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
                                <strong>{analysis.title}</strong>
                                <span>{formatPercent(analysis.completionRate)}</span>
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
                                <strong>{simulation.title}</strong>
                                <span>{simulation.status}</span>
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
                                    <strong>{analysis.title}</strong>
                                    <span>{formatPercent(analysis.completionRate)}</span>
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
                                    <strong>{post.title}</strong>
                                    <span>{post.status}</span>
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
            <AdminEmptyState title="Không tìm thấy phân tích chuyên sâu" description="ID phân tích không tồn tại." />
        );
    }

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Hệ Thống Phân Tích / Chi tiết Phân tích Chuyên sâu"
                title={data.title}
                description={`Lộ trình ${data.timeframeMonths} tháng, cập nhật ${data.updatedAt}.`}
                actions={
                    <button className="ft-button ft-button--ghost" onClick={() => navigate('/premium-analyses')}>
                        Quay lại danh sách
                    </button>
                }
            />

            <div className="ft-grid ft-grid--2-1 ft-premium-detail-grid">
                <AdminCard title="Tóm tắt báo cáo">
                    {fieldLabel('Người dùng', data.userName)}
                    {fieldLabel('Trạng thái', data.status)}
                    {fieldLabel('Số lần thay đổi (Pivot)', data.pivotCount)}
                    {fieldLabel('Tiến độ', formatPercent(data.completionRate))}
                    {fieldLabel('Cột mốc tiếp theo', data.nextMilestone)}
                    <p className="ft-rich-paragraph">{data.report?.detailedNarrative || '--'}</p>
                </AdminCard>
                <AdminCard title="Lịch sử Phản hồi" className="ft-feedback-card">
                    <div className="ft-list ft-feedback-list">
                        {(data.feedbackHistory || []).length === 0 ? (
                            <AdminEmptyState title="Chưa có phản hồi" description="Chưa có lịch sử phản hồi (feedback) cho báo cáo này." />
                        ) : (
                            (data.feedbackHistory || []).map((item) => (
                                <div className="ft-list-item" key={item}>
                                    <p>{item}</p>
                                </div>
                            ))
                        )}
                    </div>
                </AdminCard>
            </div>

            <AdminCard title="Các cột mốc (Milestones)">
                <div className="ft-timeline">
                    {(data.report?.milestones || []).map((milestone) => (
                        <div className="ft-timeline__item" key={`${milestone.month}-${milestone.event}`}>
                            <span>{milestone.month}</span>
                            <div>
                                <strong>{milestone.event}</strong>
                                <p>{milestone.impact}</p>
                                <small>{milestone.details}</small>
                            </div>
                            <AdminBadge tone="blue">{milestone.probability}%</AdminBadge>
                        </div>
                    ))}
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

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải nhật ký AI..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const logs = data?.items || [];
    const stats = data?.stats || {};

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Kỹ Thuật & Cấu Hình"
                title="Nhật ký AI / Giám sát Gemini"
                description="Theo dõi độ trễ, mức sử dụng token, chi phí ước tính và mã lỗi."
            />

            <div className="ft-stats-grid ft-stats-grid--compact">
                <AdminStatCard label="Thành công" value={stats.success || 0} />
                <AdminStatCard label="Thất bại" value={stats.failed || 0} tone="red" />
                <AdminStatCard label="Đang thử lại" value={stats.retrying || 0} tone="amber" />
                <AdminStatCard label="Độ trễ trung bình" value={formatLatency(stats.avgLatency || 0)} tone="blue" />
            </div>

            <AdminCard title="Nhật ký hệ thống Gemini">
                <div className="ft-table-wrapper">
                    <table className="ft-table">
                        <thead>
                            <tr>
                                <th>Mã ID (Correlation)</th>
                                <th>Loại</th>
                                <th>Người dùng</th>
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

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Kỹ Thuật & Cấu Hình"
                title="Cài đặt hệ thống"
                description="Tính năng (Feature flags) và quy tắc vận hành được đồng bộ từ backend admin."
                actions={
                    <button className="ft-button" onClick={() => setModalOpen(true)}>
                        Lưu thay đổi
                    </button>
                }
            />

            <div className="ft-card-grid ft-settings-card-grid">
                {groups.map((group) => (
                    <AdminCard
                        key={group.id}
                        className="ft-settings-group-card"
                        title={group.title}
                        subtitle={group.description}
                    >
                        <div className="ft-settings-list">
                            {group.fields.map((field, fieldIndex) => (
                                <label
                                    className={`ft-setting-row ${field.type === 'toggle' ? 'ft-setting-row--toggle' : 'ft-setting-row--field'}`}
                                    key={field.key}
                                >
                                    <div>
                                        <strong>{field.label}</strong>
                                        <p>{field.description}</p>
                                    </div>
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
                                                    {option}
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
                                </label>
                            ))}
                        </div>
                    </AdminCard>
                ))}
            </div>

            <AdminConfirmModal
                open={modalOpen}
                title="Lưu cài đặt hệ thống"
                description="Thay đổi sẽ được cập nhật vào backend và ghi audit log."
                confirmText="Lưu thay đổi"
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

function resolvePage(route, context) {
    const { api, navigate, onForbidden } = context;

    if (route === '/dashboard' || route === '/') {
        return <DashboardPage api={api} navigate={navigate} onForbidden={onForbidden} />;
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

    if (route === '/ai/logs') return <AiLogsPage api={api} onForbidden={onForbidden} />;
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
