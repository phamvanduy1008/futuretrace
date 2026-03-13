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
                eyebrow="Overview"
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
                    hint={`${stats.activeUsers || 0} active`}
                />
                <AdminStatCard
                    label="Simulation runs"
                    value={stats.totalSimulations || 0}
                    hint={`${stats.failedSimulations || 0} failed`}
                    tone="amber"
                />
                <AdminStatCard
                    label="Premium analyses"
                    value={stats.totalPremiumAnalyses || 0}
                    hint={`${stats.activePremiumAnalyses || 0} active`}
                    tone="blue"
                />
                <AdminStatCard
                    label="Bài viết cộng đồng"
                    value={stats.totalCommunityPosts || 0}
                    hint={`${stats.communityNeedsReview || 0} can review`}
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
                            onClick={() => navigate('/community/review')}
                        >
                            Hàng đợi kiểm duyệt
                        </button>
                        <button className="ft-button ft-button--ghost" onClick={() => navigate('/prompts')}>
                            Prompt releases
                        </button>
                        <button className="ft-button ft-button--ghost" onClick={() => navigate('/settings')}>
                            Cài đặt hệ thống
                        </button>
                    </div>
                </AdminCard>
            </div>

            <div className="ft-grid ft-grid--3">
                <AdminCard title="Simulation cần chú ý">
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
                <AdminCard title="Premium cần theo dõi">
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
                <AdminCard title="Audit gần nhất">
                    <div className="ft-mini-list">
                        {(watchlists.auditLogs || []).map((item) => (
                            <div className="ft-mini-list__item" key={item.id}>
                                <strong>{item.action}</strong>
                                <span>{item.actor}</span>
                            </div>
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
    const [tier, setTier] = useState('all');
    const [modalState, setModalState] = useState({ open: false, user: null });

    const params = useMemo(
        () => ({
            page: '1',
            limit: '50',
            q: search,
            role,
            status,
            tier,
        }),
        [search, role, status, tier],
    );

    const { data, loading, error, reload } = useRemoteResource(
        () => api.getUsers(params),
        [api, params],
    );

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    const users = data?.items || [];
    const previewUser = users[0] || null;

    if (loading) return <LoadingCard title="Đang tải danh sách users..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Users"
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
                    <select value={tier} onChange={(event) => setTier(event.target.value)}>
                        <option value="all">Tất cả tier</option>
                        <option value="free">free</option>
                        <option value="premium">premium</option>
                    </select>
                </div>
            </AdminCard>

            <div className="ft-grid ft-grid--2-1">
                <AdminCard title="Danh sách user">
                    {users.length === 0 ? (
                        <AdminEmptyState
                            title="Không có user phù hợp"
                            description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
                        />
                    ) : (
                        <div className="ft-table-wrapper">
                            <table className="ft-table">
                                <thead>
                                    <tr>
                                        <th>Ten</th>
                                        <th>Role</th>
                                        <th>Tier</th>
                                        <th>Status</th>
                                        <th>Last login</th>
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
                                            <td>{user.tier}</td>
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

                {previewUser ? (
                    <AdminCard title="Xem nhanh user dau tien">
                        <div className="ft-profile-card">
                            <div className="ft-profile-card__avatar">{previewUser.avatar}</div>
                            <div>
                                <strong>{previewUser.name}</strong>
                                <p>{previewUser.email}</p>
                            </div>
                        </div>
                        {fieldLabel('Role', previewUser.role)}
                        {fieldLabel('Tier', previewUser.tier)}
                        {fieldLabel('Trạng thái', previewUser.status)}
                        {fieldLabel('Simulations', previewUser.simulationsCount)}
                        {fieldLabel('Premium', previewUser.premiumCount)}
                        {fieldLabel('Community', previewUser.communityCount)}
                    </AdminCard>
                ) : null}
            </div>

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
                eyebrow="Users / Detail"
                title={user.name}
                description={user.bio || 'Không có mô tả.'}
                actions={
                    <button className="ft-button ft-button--ghost" onClick={() => navigate('/users')}>
                        Quay lại list
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
                                <AdminBadge tone="neutral">{user.tier}</AdminBadge>
                            </div>
                        </div>
                    </div>
                    {fieldLabel('Địa điểm', user.location)}
                    {fieldLabel('Tham gia', user.joinedAt)}
                    {fieldLabel('Dang nhap cuoi', user.lastLoginAt)}
                    {fieldLabel('Phiên đăng nhập', user.sessionCount)}
                </AdminCard>

                <AdminCard title="Tóm tắt hoạt động">
                    {fieldLabel('Simulation runs', user.simulationsCount)}
                    {fieldLabel('Premium analyses', user.premiumCount)}
                    {fieldLabel('Bai cong dong', user.communityCount)}
                    {fieldLabel('Trạng thái tài khoản', user.status)}
                </AdminCard>
            </div>

            <div className="ft-grid ft-grid--3">
                <AdminCard title="Simulations gần nhất">
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
                <AdminCard title="Premium analyses">
                    <div className="ft-mini-list">
                        {(data.premiumAnalyses || []).length === 0 ? (
                            <AdminEmptyState title="Chưa có premium" description="User này chưa tạo premium." />
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

    if (loading) return <LoadingCard title="Đang tải simulations..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const items = data?.items || [];
    const stats = data?.stats || {};

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Research Ops"
                title="Quản trị mô phỏng"
                description="Quan sát simulation runs, trạng thái AI và lỗi cần xử lý."
            />
            <div className="ft-stats-grid ft-stats-grid--compact">
                <AdminStatCard label="Completed" value={stats.completed || 0} />
                <AdminStatCard label="Running" value={stats.running || 0} tone="blue" />
                <AdminStatCard label="Queued" value={stats.queued || 0} tone="amber" />
                <AdminStatCard label="Failed" value={stats.failed || 0} tone="red" />
            </div>

            <AdminCard>
                <div className="ft-filters ft-community-filters">
                    <input
                        placeholder="Tìm theo title..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="all">Tất cả status</option>
                        <option value="completed">completed</option>
                        <option value="running">running</option>
                        <option value="queued">queued</option>
                        <option value="failed">failed</option>
                    </select>
                </div>
            </AdminCard>

            <AdminCard title="Simulation runs">
                <div className="ft-table-wrapper">
                    <table className="ft-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>User</th>
                                <th>Status</th>
                                <th>Model</th>
                                <th>Latency</th>
                                <th>Prompt</th>
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

function SimulationDetailPage({ api, simulationId, navigate, onForbidden }) {
    const { data, loading, error, reload } = useRemoteResource(
        () => api.getSimulationDetail(simulationId),
        [api, simulationId],
    );

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải chi tiết simulation..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;
    if (!data) {
        return (
            <AdminEmptyState title="Không tìm thấy simulation" description="ID simulation không tồn tại." />
        );
    }

    const relatedLog = data.relatedLog;
    const user = data.user;

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Research Ops / Simulation Detail"
                title={data.title}
                description={data.summary || 'Không có tóm tắt.'}
                actions={
                    <button className="ft-button ft-button--ghost" onClick={() => navigate('/simulations')}>
                        Quay lại list
                    </button>
                }
            />

            <div className="ft-grid ft-grid--2-1">
                <AdminCard title="Thông tin run">
                    {fieldLabel('Status', data.status)}
                    {fieldLabel('Prompt version', relatedLog?.promptVersion || '--')}
                    {fieldLabel('Latency', formatLatency(relatedLog?.latencyMs || 0))}
                    {fieldLabel('Tokens used', (relatedLog?.inputTokens || 0) + (relatedLog?.outputTokens || 0))}
                    {fieldLabel('Enterprise detected', data.isEnterprise ? 'Có' : 'Không')}
                    {data.errorSummary ? fieldLabel('Error summary', data.errorSummary) : null}
                </AdminCard>

                <AdminCard title="Nguoi tao">
                    {fieldLabel('User', data.userName)}
                    {fieldLabel('Role', user?.role || '--')}
                    {fieldLabel('Tier', user?.tier || '--')}
                    {fieldLabel('Email', user?.email || '--')}
                </AdminCard>
            </div>

            <div className="ft-grid ft-grid--2-1">
                <AdminCard title="Scenario highlights">
                    <div className="ft-list">
                        {(data.scenarios || []).map((scenario) => (
                            <div className="ft-list-item" key={scenario.id}>
                                <strong>{scenario.title}</strong>
                            </div>
                        ))}
                    </div>
                </AdminCard>

                <AdminCard title="AI log liên quan">
                    {relatedLog ? (
                        <>
                            {fieldLabel('Correlation ID', relatedLog.id)}
                            {fieldLabel('Request type', 'simulation')}
                            {fieldLabel('Latency', formatLatency(relatedLog.latencyMs))}
                            {fieldLabel('Error', relatedLog.errorMessage || '--')}
                        </>
                    ) : (
                        <AdminEmptyState title="Chưa có AI log" description="Log chưa được gắn với simulation này." />
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

    if (loading) return <LoadingCard title="Đang tải premium analyses..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const items = data?.items || [];

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Research Ops"
                title="Quản trị Premium analyses"
                description="Kiem tra report, milestones va tien do action plan."
            />

            <AdminCard>
                <div className="ft-filters">
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="all">Tất cả status</option>
                        <option value="active">active</option>
                        <option value="completed">completed</option>
                    </select>
                </div>
            </AdminCard>

            <AdminCard title="Premium analyses">
                <div className="ft-table-wrapper">
                    <table className="ft-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>User</th>
                                <th>Status</th>
                                <th>Timeframe</th>
                                <th>Pivot</th>
                                <th>Completion</th>
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

    if (loading) return <LoadingCard title="Đang tải chi tiết premium..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;
    if (!data) {
        return (
            <AdminEmptyState title="Không tìm thấy premium analysis" description="ID premium không tồn tại." />
        );
    }

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Research Ops / Premium Detail"
                title={data.title}
                description={`Lộ trình ${data.timeframeMonths} tháng, cập nhật ${data.updatedAt}.`}
                actions={
                    <button className="ft-button ft-button--ghost" onClick={() => navigate('/premium-analyses')}>
                        Quay lại list
                    </button>
                }
            />

            <div className="ft-grid ft-grid--2-1 ft-premium-detail-grid">
                <AdminCard title="Tóm tắt báo cáo">
                    {fieldLabel('User', data.userName)}
                    {fieldLabel('Status', data.status)}
                    {fieldLabel('Pivot count', data.pivotCount)}
                    {fieldLabel('Completion', formatPercent(data.completionRate))}
                    {fieldLabel('Next milestone', data.nextMilestone)}
                    <p className="ft-rich-paragraph">{data.report?.detailedNarrative || '--'}</p>
                </AdminCard>
                <AdminCard title="Feedback history" className="ft-feedback-card">
                    <div className="ft-list ft-feedback-list">
                        {(data.feedbackHistory || []).length === 0 ? (
                            <AdminEmptyState title="Chưa có feedback" description="Chưa có lịch sử feedback cho report này." />
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

            <AdminCard title="Milestones">
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
                eyebrow="Community"
                title="Quản trị bài viết cộng đồng"
                description="Theo dõi post và luồng moderation từ backend admin."
            />

            <AdminCard>
                <div className="ft-filters">
                    <input
                        placeholder="Tìm theo title..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="all">Tất cả status</option>
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
                            <small>{post.likes} likes • {post.commentsCount} comments</small>
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
                eyebrow="Community / Post Detail"
                title={post.title}
                description={`${post.authorName} • ${post.category} • ${post.createdAt}`}
                actions={
                    <div className="ft-page-actions">
                        <button className="ft-button ft-button--ghost" onClick={() => navigate('/community/posts')}>
                            Quay lại list
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
                    {fieldLabel('Reliability', `${post.reliability}%`)}
                    {fieldLabel('Likes', post.likes)}
                    {fieldLabel('Comments', post.commentsCount)}
                    {fieldLabel('Source scenario', post.sourceScenarioId)}
                </AdminCard>

                <AdminCard title="Moderation panel" className="ft-community-panel-card">
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

function ReviewQueuePage({ api, onForbidden }) {
    const { data, loading, error, reload } = useRemoteResource(() => api.getModerationReports(), [api]);
    const [selectedId, setSelectedId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải moderation queue..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const items = data || [];
    const activeSelectedId = selectedId ?? items[0]?.id ?? null;
    const selectedItem = items.find((item) => item.id === activeSelectedId) || items[0];

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="Community"
                title="Hàng đợi kiểm duyệt"
                description="Tổng hợp các content report cần moderator xử lý."
            />

            <div className="ft-grid ft-grid--2-1 ft-community-review-grid">
                <AdminCard title="Queue" className="ft-community-review-queue-card">
                    <div className="ft-review-list">
                        {items.map((item) => (
                            <button
                                className={`ft-review-item ${activeSelectedId === item.id ? 'is-active' : ''}`}
                                key={item.id}
                                onClick={() => setSelectedId(item.id)}
                            >
                                <div className="ft-row-inline ft-row-inline--spread">
                                    <strong>{item.targetTitle}</strong>
                                    <AdminBadge tone={getToneByStatus(item.priority)}>{item.priority}</AdminBadge>
                                </div>
                                <p>{item.reason}</p>
                                <small>{item.createdAt}</small>
                            </button>
                        ))}
                    </div>
                </AdminCard>

                {selectedItem ? (
                    <AdminCard
                        className="ft-community-review-decision-card"
                        title="Decision panel"
                        subtitle="Mỗi quyết định moderation đều ghi audit log."
                        actions={<AdminBadge tone={getToneByStatus(selectedItem.status)}>{selectedItem.status}</AdminBadge>}
                    >
                        {fieldLabel('Loại nội dung', selectedItem.type)}
                        {fieldLabel('Author', selectedItem.authorName)}
                        {fieldLabel('Reports', selectedItem.reportsCount)}
                        {fieldLabel('Priority', selectedItem.priority)}
                        <p className="ft-rich-paragraph">{selectedItem.reason}</p>
                        <div className="ft-inline-actions">
                            <button className="ft-button" onClick={() => setModalOpen(true)}>
                                Xử lý nội dung
                            </button>
                        </div>
                    </AdminCard>
                ) : null}
            </div>

            <AdminConfirmModal
                open={modalOpen}
                title="Xử lý moderation report"
                description="Mặc định sẽ mark report đã resolve và giữ trạng thái published."
                confirmText="Xác nhận xử lý"
                onClose={() => setModalOpen(false)}
                onConfirm={async (reason) => {
                    if (!selectedItem) return;
                    await api.resolveModerationReport(selectedItem.id, {
                        resolution: reason,
                        resolutionAction: 'published',
                        reason,
                    });
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

    if (loading) return <LoadingCard title="Đang tải AI logs..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const logs = data?.items || [];
    const stats = data?.stats || {};

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="System"
                title="AI Logs / Gemini Monitoring"
                description="Theo dõi latency, token usage, cost estimate và error code."
            />

            <div className="ft-stats-grid ft-stats-grid--compact">
                <AdminStatCard label="Success" value={stats.success || 0} />
                <AdminStatCard label="Failed" value={stats.failed || 0} tone="red" />
                <AdminStatCard label="Retrying" value={stats.retrying || 0} tone="amber" />
                <AdminStatCard label="Avg latency" value={formatLatency(stats.avgLatency || 0)} tone="blue" />
            </div>

            <AdminCard title="Gemini logs">
                <div className="ft-table-wrapper">
                    <table className="ft-table">
                        <thead>
                            <tr>
                                <th>Correlation ID</th>
                                <th>Type</th>
                                <th>User</th>
                                <th>Status</th>
                                <th>Latency</th>
                                <th>Cost</th>
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

    if (loading) return <LoadingCard title="Đang tải prompt templates..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const prompts = data || [];
    const activeSelectedId = selectedId ?? prompts[0]?.id ?? null;
    const selected = prompts.find((item) => item.id === activeSelectedId) || prompts[0];

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="System"
                title="Quản lý prompts"
                description="Theo dõi version prompt, owner và release workflow."
            />

            <div className="ft-grid ft-grid--1-2">
                <AdminCard title="Prompt versions">
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
                        {fieldLabel('Updated at', selected.updatedAt)}
                        <div className="ft-code-block">{selected.content}</div>
                    </AdminCard>
                ) : null}
            </div>

            <AdminConfirmModal
                open={modalOpen}
                title={action === 'release' ? 'Phát hành prompt' : 'Rollback prompt'}
                description="Hành động này sẽ tạo audit log và cập nhật active prompt."
                confirmText={action === 'release' ? 'Phát hành' : 'Rollback'}
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

    if (loading) return <LoadingCard title="Đang tải system settings..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const groups = (data || []).map((group) => draftGroups[group.id] || group);

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="System"
                title="Cài đặt hệ thống"
                description="Feature flags và rule vận hành được đồng bộ từ backend admin."
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

function AuditLogsPage({ api, onForbidden }) {
    const [severity, setSeverity] = useState('all');

    const { data, loading, error, reload } = useRemoteResource(
        () => api.getAuditLogs({ page: '1', limit: '100', severity, q: '' }),
        [api, severity],
    );

    useEffect(() => {
        if (error?.status === 403) onForbidden();
    }, [error, onForbidden]);

    if (loading) return <LoadingCard title="Đang tải audit logs..." />;
    if (error) return <ErrorCard error={error} onRetry={reload} />;

    const items = data?.items || [];

    return (
        <div className="ft-page-stack">
            <AdminPageHeader
                eyebrow="System"
                title="Audit logs"
                description="Append-only activity log cho các hành động nhạy cảm trong admin app."
            />

            <AdminCard>
                <div className="ft-filters">
                    <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
                        <option value="all">Tất cả severity</option>
                        <option value="info">info</option>
                        <option value="warning">warning</option>
                        <option value="critical">critical</option>
                    </select>
                </div>
            </AdminCard>

            <AdminCard title="Event timeline">
                <div className="ft-table-wrapper">
                    <table className="ft-table">
                        <thead>
                            <tr>
                                <th>Actor</th>
                                <th>Action</th>
                                <th>Resource</th>
                                <th>Severity</th>
                                <th>Summary</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.actor}</strong>
                                        <span>{item.role}</span>
                                    </td>
                                    <td>{item.action}</td>
                                    <td>{item.resourceName}</td>
                                    <td>
                                        <AdminBadge tone={getToneByStatus(item.severity)}>{item.severity}</AdminBadge>
                                    </td>
                                    <td>{item.summary}</td>
                                    <td>{item.createdAt}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminCard>
        </div>
    );
}

function SystemStatePage({ kind, navigate }) {
    const isForbidden = kind === '403';

    return (
        <div className="ft-page-stack">
            <AdminCard className="ft-system-card">
                <p className="ft-eyebrow">{isForbidden ? 'Permission denied' : 'Page not found'}</p>
                <h2>{isForbidden ? 'Bạn không có quyền truy cập module này.' : 'Route admin không tồn tại.'}</h2>
                <p>
                    {isForbidden
                        ? 'Vui lòng đăng nhập bằng tài khoản có role phù hợp.'
                        : 'Kiểm tra lại route hoặc quay về dashboard để tiếp tục thao tác.'}
                </p>
                <div className="ft-page-actions">
                    <button className="ft-button" onClick={() => navigate('/dashboard')}>
                        Về dashboard
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
    if (route === '/community/review') {
        return <ReviewQueuePage api={api} onForbidden={onForbidden} />;
    }
    if (route === '/ai/logs') return <AiLogsPage api={api} onForbidden={onForbidden} />;
    if (route === '/prompts') return <PromptsPage api={api} onForbidden={onForbidden} />;
    if (route === '/settings') return <SettingsPage api={api} onForbidden={onForbidden} />;
    if (route === '/audit-logs') return <AuditLogsPage api={api} onForbidden={onForbidden} />;
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
        if (!session || !accessToken) return;

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
    }, [api, session, accessToken]);

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
