import { useMemo, useState } from 'react';
import {
  ChartLineUp,
  Users,
  CreditCard,
  Compass,
  Sparkle,
  Database,
  ChatTeardropDots,
  Cpu,
  FileCode,
  Gear,
  MagnifyingGlass,
  SignOut,
  List,
  X,
  CheckCircle,
  WarningCircle,
  Clock,
  ArrowsClockwise,
  Lightning,
  HardDrives,
  ArrowUpRight,
  CalendarBlank,
  SquaresFour,
} from '@phosphor-icons/react';

export const adminNavigation = [
  { label: 'Bảng điều khiển', path: '/dashboard', section: 'Chung', icon: ChartLineUp },
  { label: 'Chỉ số gọi vốn', path: '/metrics', section: 'Chung', icon: Lightning },
  { label: 'Người dùng', path: '/users', section: 'Dữ Liệu Khách Hàng', icon: Users },
  { label: 'Giao dịch', path: '/payments', section: 'Dữ Liệu Khách Hàng', icon: CreditCard },
  { label: 'Mô phỏng', path: '/simulations', section: 'Hệ Thống Phân Tích', icon: Compass },
  { label: 'Chuyên sâu', path: '/premium-analyses', section: 'Hệ Thống Phân Tích', icon: Sparkle },
  { label: 'Tri Thức RAG', path: '/rag', section: 'Hệ Thống Phân Tích', icon: Database },
  { label: 'Bài viết', path: '/community/posts', section: 'Cộng Đồng', icon: ChatTeardropDots },
  { label: 'AI & Mô hình', path: '/ai/logs', section: 'Cấu Hình & Kỹ Thuật', icon: Cpu },
  { label: 'Prompts', path: '/prompts', section: 'Cấu Hình & Kỹ Thuật', icon: FileCode },
  { label: 'Cài đặt', path: '/settings', section: 'Cấu Hình & Kỹ Thuật', icon: Gear },
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

export function AdminBadge({ tone = 'neutral', dot = true, children }) {
  return (
    <span className={cx('ft-badge', `ft-badge--${tone}`)}>
      {dot && <span className="ft-badge__dot" aria-hidden="true" />}
      <span className="ft-badge__label">{children}</span>
    </span>
  );
}

export function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="ft-page-header">
      <div className="ft-page-header__content">
        {eyebrow ? (
          <div className="ft-page-header__eyebrow-wrapper">
            <span className="ft-eyebrow">{eyebrow}</span>
          </div>
        ) : null}
        <h1 className="ft-page-title">{title}</h1>
        {description ? <p className="ft-page-description">{description}</p> : null}
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
          <div className="ft-card__header-content">
            {title ? <h3 className="ft-card__title">{title}</h3> : null}
            {subtitle ? <p className="ft-card__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="ft-card__actions">{actions}</div> : null}
        </header>
      )}
      <div className="ft-card__body">{children}</div>
    </section>
  );
}

function getIconForStat(label, tone) {
  const l = (label || '').toLowerCase();
  if (l.includes('doanh thu') || l.includes('tiền') || l.includes('giá')) return CreditCard;
  if (l.includes('giao dịch') || l.includes('token')) return Lightning;
  if (l.includes('người dùng') || l.includes('khách hàng')) return Users;
  if (l.includes('mô phỏng') || l.includes('lượt')) return Compass;
  if (l.includes('bài viết') || l.includes('bình luận')) return ChatTeardropDots;
  if (l.includes('rag') || l.includes('bản ghi') || l.includes('tri thức')) return Database;
  if (l.includes('dung lượng') || l.includes('size')) return HardDrives;
  if (l.includes('độ trễ') || l.includes('latency')) return Lightning;
  if (l.includes('thành công') || l.includes('hoàn thành') || l.includes('healthy')) return CheckCircle;
  if (l.includes('thất bại') || l.includes('lỗi')) return WarningCircle;
  if (l.includes('chờ') || l.includes('thử lại') || l.includes('đồng bộ')) return ArrowsClockwise;
  if (tone === 'green' || tone === 'emerald') return CheckCircle;
  if (tone === 'red' || tone === 'rose') return WarningCircle;
  if (tone === 'amber' || tone === 'orange') return Clock;
  return ChartLineUp;
}

export function AdminStatCard({ label, value, hint, tone = 'blue', icon: CustomIcon, trend }) {
  const IconComponent = CustomIcon || getIconForStat(label, tone);

  return (
    <div className={cx('ft-stat-card', `ft-stat-card--${tone}`)}>
      <div className="ft-stat-card__header">
        <span className="ft-stat-card__label">{label}</span>
        <div className={cx('ft-stat-card__icon-box', `ft-stat-card__icon-box--${tone}`)}>
          <IconComponent size={20} weight="duotone" />
        </div>
      </div>
      <div className="ft-stat-card__body">
        <strong className="ft-stat-card__value">{value}</strong>
      </div>
      {(hint || trend) && (
        <div className="ft-stat-card__footer">
          {trend ? (
            <span className={cx('ft-stat-trend', `ft-stat-trend--${trend.type || 'up'}`)}>
              <ArrowUpRight size={13} weight="bold" />
              {trend.value}
            </span>
          ) : null}
          {hint ? <span className="ft-stat-card__hint">{hint}</span> : null}
        </div>
      )}
    </div>
  );
}

export function AdminEmptyState({ title, description, action }) {
  return (
    <div className="ft-empty-state">
      <div className="ft-empty-state__icon-box">
        <SquaresFour size={36} weight="duotone" />
      </div>
      <strong className="ft-empty-state__title">{title}</strong>
      <p className="ft-empty-state__description">{description}</p>
      {action ? <div className="ft-empty-state__action">{action}</div> : null}
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
    <div className="ft-modal-backdrop" role="presentation" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ft-modal">
        <div className="ft-modal__header">
          <div>
            <span className="ft-eyebrow">Xác nhận hành động</span>
            <h3 className="ft-modal__title">{title}</h3>
          </div>
          <button className="ft-icon-button" type="button" onClick={onClose} aria-label="Đóng">
            <X size={18} weight="bold" />
          </button>
        </div>
        <p className="ft-modal__description">{description}</p>
        <label className="ft-field">
          <span className="ft-field__label">{reasonLabel}</span>
          <textarea
            className="ft-field__textarea"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Nhập lý do để ghi audit log..."
            rows={3}
          />
        </label>
        <div className="ft-modal__actions">
          <button className="ft-button ft-button--ghost" type="button" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className="ft-button ft-button--primary"
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
            <img src="/favicon-192.png" alt="" />
            <div className="ft-brand-mark__glow" />
          </div>
          <div className="ft-brand-meta">
            <strong className="ft-brand-meta__name">FutureTrace</strong>
            <div className="ft-brand-meta__tag">
              <span className="ft-brand-meta__dot" />
              <span>Control Center</span>
            </div>
          </div>
        </div>

        <div className="ft-sidebar__nav">
          {Object.entries(navBySection).map(([section, items]) => (
            <div className="ft-nav-group" key={section}>
              <span className="ft-nav-group__label">{section}</span>
              {items.map((item) => {
                const active = route === item.path || route.startsWith(`${item.path}/`);
                const ItemIcon = item.icon || SquaresFour;
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
                    <ItemIcon
                      className="ft-nav-item__icon"
                      size={18}
                      weight={active ? 'duotone' : 'regular'}
                    />
                    <span className="ft-nav-item__label">{item.label}</span>
                    {active && <span className="ft-nav-item__active-bar" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="ft-sidebar__footer">
          <div className="ft-sidebar__account">
            <div className="ft-sidebar__account-avatar">
              {(session?.name || 'Admin').charAt(0).toUpperCase()}
            </div>
            <div className="ft-sidebar__account-meta">
              <strong>{session?.name || 'Admin'}</strong>
              <span>{session?.role || 'super_admin'}</span>
            </div>
          </div>
          <button
            className="ft-sidebar__logout"
            type="button"
            onClick={onLogout}
            title="Đăng xuất khỏi hệ thống"
          >
            <SignOut size={16} weight="bold" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="ft-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="ft-main">
        <header className="ft-topbar">
          <div className="ft-topbar__left">
            <button
              className="ft-icon-button ft-mobile-only"
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              aria-label="Mở menu điều hướng"
            >
              <List size={20} weight="bold" />
            </button>
            <label className="ft-global-search" aria-label="Tìm kiếm nhanh">
              <div className="ft-global-search__box">
                <MagnifyingGlass size={17} weight="bold" className="ft-global-search__icon" />
                <input type="text" placeholder="Tìm kiếm tài khoản, tác vụ, ID, log..." />
                <kbd className="ft-kbd">⌘K</kbd>
              </div>
            </label>
          </div>
          <div className="ft-topbar__right">
            <div className="ft-system-pill">
              <span className="ft-system-pill__dot" />
              <span className="ft-system-pill__text">System Live</span>
            </div>
            <AdminBadge tone="green" dot={true}>Production</AdminBadge>
            <div className="ft-date-badge">
              <CalendarBlank size={14} weight="bold" />
              <span>12/03/2026</span>
            </div>
            <div className="ft-avatar-pill">
              <div className="ft-avatar-pill__badge" aria-hidden="true">
                <img src="/favicon-192.png" alt="" />
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
