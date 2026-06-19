import { useMemo, useState } from 'react';

export const adminNavigation = [
  { label: 'Bảng điều khiển', path: '/dashboard', section: 'Chung' },
  { label: 'Người dùng', path: '/users', section: 'Dữ Liệu Khách Hàng' },
  { label: 'Giao dịch', path: '/payments', section: 'Dữ Liệu Khách Hàng' },
  { label: 'Mô phỏng', path: '/simulations', section: 'Hệ Thống Phân Tích' },
  { label: 'Chuyên sâu', path: '/premium-analyses', section: 'Hệ Thống Phân Tích' },
  { label: 'Bài viết', path: '/community/posts', section: 'Cộng Đồng' },
  { label: 'Nhật ký AI', path: '/ai/logs', section: 'Cấu Hình & Kỹ Thuật' },
  { label: 'Prompts', path: '/prompts', section: 'Cấu Hình & Kỹ Thuật' },
  { label: 'Cài đặt', path: '/settings', section: 'Cấu Hình & Kỹ Thuật' },
];

export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatLatency(latencyMs) {
  if (!latencyMs) return '--';
  if (latencyMs >= 1000) {
    return `${(latencyMs / 1000).toFixed(1)}s`;
  }
  return `${latencyMs}ms`;
}

export function formatCost(cost) {
  return Number(cost || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

export function formatPercent(value) {
  return `${Number(value || 0)}%`;
}

export function AdminBadge({ tone = 'neutral', children }) {
  return <span className={cx('ft-badge', `ft-badge--${tone}`)}>{children}</span>;
}

export function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="ft-page-header">
      <div>
        {eyebrow ? <p className="ft-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="ft-page-actions">{actions}</div> : null}
    </div>
  );
}

const CARD_TONES = ['blue', 'indigo', 'purple', 'pink', 'rose', 'orange', 'amber', 'emerald', 'teal', 'cyan'];

function getToneForString(str) {
  if (!str) return 'neutral';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CARD_TONES[Math.abs(hash) % CARD_TONES.length];
}

export function AdminCard({ title, subtitle, actions, className = '', tone, children }) {
  const finalTone = tone || (title ? getToneForString(title) : 'neutral');
  return (
    <section className={cx('ft-card', className)}>
      {(title || subtitle || actions) && (
        <header className={cx('ft-card__header', `ft-card__header--${finalTone}`)}>
          <div>
            {title ? <h3>{title}</h3> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {actions ? <div className="ft-card__actions">{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}

export function AdminStatCard({ label, value, hint, tone = 'blue' }) {
  return (
    <div className={cx('ft-stat-card', `ft-stat-card--${tone}`)}>
      <span className="ft-stat-card__label">{label}</span>
      <strong>{value}</strong>
      {hint ? <p>{hint}</p> : null}
    </div>
  );
}

export function AdminEmptyState({ title, description, action }) {
  return (
    <div className="ft-empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function AdminConfirmModal({
  open,
  title,
  description,
  reasonLabel = 'Lý do thực hiện',
  confirmText = 'Xác nhận',
  cancelText = 'Huỷ',
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState('');

  if (!open) return null;

  return (
    <div className="ft-modal-backdrop" role="presentation">
      <div className="ft-modal">
        <div className="ft-modal__header">
          <div>
            <p className="ft-eyebrow">Xác nhận hành động</p>
            <h3>{title}</h3>
          </div>
          <button className="ft-icon-button" type="button" onClick={onClose}>
            x
          </button>
        </div>
        <p className="ft-modal__description">{description}</p>
        <label className="ft-field">
          <span>{reasonLabel}</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Nhập lý do để ghi audit log..."
          />
        </label>
        <div className="ft-modal__actions">
          <button className="ft-button ft-button--ghost" type="button" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className="ft-button"
            type="button"
            disabled={!reason.trim()}
            onClick={() => {
              onConfirm(reason);
              setReason('');
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function groupNavigation() {
  return adminNavigation.reduce((acc, item) => {
    acc[item.section] = acc[item.section] || [];
    acc[item.section].push(item);
    return acc;
  }, {});
}

export function AdminShell({ route, session, onNavigate, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navBySection = useMemo(() => groupNavigation(), []);

  return (
    <div className="ft-admin-shell">
      <aside className={cx('ft-sidebar', sidebarOpen && 'ft-sidebar--open')}>
        <div className="ft-sidebar__brand">
          <div className="ft-brand-mark" aria-hidden="true">
            <img src="/favicon.png" alt="" />
          </div>
          <div>
            <strong>FutureTrace Admin</strong>
          </div>
        </div>

        <div className="ft-sidebar__nav">
          {Object.entries(navBySection).map(([section, items]) => (
            <div className="ft-nav-group" key={section}>
              <span className="ft-nav-group__label">{section}</span>
              {items.map((item) => {
                const active = route === item.path || route.startsWith(`${item.path}/`);
                return (
                  <button
                    key={item.path}
                    className={cx('ft-nav-item', active && 'ft-nav-item--active')}
                    type="button"
                    onClick={() => {
                      onNavigate(item.path);
                      setSidebarOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="ft-sidebar__footer">
          <div className="ft-sidebar__account">
            <strong>{session?.name || 'Admin'}</strong>
            <span>{session?.role || 'super_admin'}</span>
          </div>
          <button className="ft-button ft-button--ghost" type="button" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="ft-main">
        <header className="ft-topbar">
          <div className="ft-topbar__left">
            <button
              className="ft-icon-button ft-mobile-only"
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
            >
              =
            </button>
            <label className="ft-global-search" aria-label="Tìm kiếm nhanh">
              <div className="ft-global-search__box">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M10.5 3.75a6.75 6.75 0 1 1 0 13.5 6.75 6.75 0 0 1 0-13.5Zm0 1.5a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5Zm6.89 11.08 3.39 3.39a.75.75 0 0 1-1.06 1.06l-3.39-3.39a.75.75 0 1 1 1.06-1.06Z" />
                </svg>
                <input type="text" placeholder="Tìm kiếm..." />
              </div>
            </label>
          </div>
          <div className="ft-topbar__right">
            <AdminBadge tone="blue">Production</AdminBadge>
            <AdminBadge tone="neutral">12/03/2026</AdminBadge>
            <div className="ft-avatar-pill">
              <div className="ft-avatar-pill__badge" aria-hidden="true">
                <img src="/favicon.png" alt="" />
              </div>
              <div className="ft-avatar-pill__meta">
                <strong>{session?.name || 'Admin'}</strong>
                <small>{session?.role || 'super_admin'}</small>
              </div>
            </div>
          </div>
        </header>

        <main className="ft-content">{children}</main>
      </div>
    </div>
  );
}
