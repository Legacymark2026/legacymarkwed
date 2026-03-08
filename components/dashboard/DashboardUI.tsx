'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ─── Page-level wrapper ───────────────────────────────────────────────────────
interface DashboardPageProps {
    children: ReactNode;
    className?: string;
}
export function DashboardPage({ children, className }: DashboardPageProps) {
    return (
        <div className={cn('ds-page space-y-6', className)}>
            {children}
        </div>
    );
}

// ─── Page header with title, subtitle, and optional right actions ─────────────
interface DashboardPageHeaderProps {
    title: string;
    subtitle?: string;
    badge?: { label: string; variant?: 'purple' | 'green' | 'amber' | 'red' | 'blue' | 'pink' };
    actions?: ReactNode;
    icon?: ReactNode;
}
export function DashboardPageHeader({ title, subtitle, badge, actions, icon }: DashboardPageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6"
            style={{ borderBottom: '1px solid var(--ds-border)' }}>
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'var(--ds-accent-glow)', border: '1px solid rgba(124,58,237,0.2)' }}>
                        <span style={{ color: '#a78bfa' }}>{icon}</span>
                    </div>
                )}
                <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="ds-heading-page">{title}</h1>
                        {badge && (
                            <span className={`ds-badge ds-badge-${badge.variant ?? 'purple'}`}>{badge.label}</span>
                        )}
                    </div>
                    {subtitle && <p className="ds-subtext mt-0.5">{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
    );
}

// ─── Section container (replaces bg-white rounded-xl shadow cards) ──────────
interface DashboardSectionProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
    className?: string;
    noPadding?: boolean;
}
export function DashboardSection({ children, title, subtitle, actions, className, noPadding }: DashboardSectionProps) {
    return (
        <div className={cn('ds-section', noPadding && '!p-0', className)}>
            {(title || actions) && (
                <div className="flex items-center justify-between mb-4 gap-3">
                    <div>
                        {title && <h2 className="ds-heading-section">{title}</h2>}
                        {subtitle && <p className="ds-subtext mt-0.5">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
                </div>
            )}
            {children}
        </div>
    );
}

// ─── KPI card ────────────────────────────────────────────────────────────────
interface DashboardKPIProps {
    label: string;
    value: string | number;
    delta?: string;
    deltaUp?: boolean;
    icon?: ReactNode;
    accentClass?: string;
}
export function DashboardKPI({ label, value, delta, deltaUp, icon, accentClass = 'text-violet-400' }: DashboardKPIProps) {
    return (
        <div className="ds-kpi flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
                <p className="ds-stat-label">{label}</p>
                {icon && <span className={cn('opacity-80', accentClass)}>{icon}</span>}
            </div>
            <div>
                <p className="ds-stat-value">{value}</p>
                {delta && (
                    <p className={deltaUp ? 'ds-stat-delta-up' : 'ds-stat-delta-down'}>
                        {deltaUp ? '↑' : '↓'} {delta}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Simple status badge ──────────────────────────────────────────────────────
type BadgeVariant = 'purple' | 'green' | 'amber' | 'red' | 'blue' | 'pink';

interface StatusBadgeProps {
    label: string;
    variant?: BadgeVariant;
}
export function StatusBadge({ label, variant = 'purple' }: StatusBadgeProps) {
    return <span className={`ds-badge ds-badge-${variant}`}>{label}</span>;
}

// ─── Empty state ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 space-y-3">
            {icon && <div className="text-4xl opacity-30">{icon}</div>}
            <p className="ds-heading-section">{title}</p>
            {description && <p className="ds-subtext max-w-sm">{description}</p>}
            {action}
        </div>
    );
}
