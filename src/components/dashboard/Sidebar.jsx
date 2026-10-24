import React from 'react';
import {
  LayoutDashboard,
  Car,
  Bus,
  Workflow,
  Leaf,
  Building2,
  Zap,
  ShieldAlert,
  TrendingUp,
  Users,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Activity,
  ShieldCheck
} from 'lucide-react';

const iconMap = {
  overview: LayoutDashboard,
  mobility: Car,
  transit: Bus,
  infrastructure: Workflow,
  environment: Leaf,
  buildings: Building2,
  energy: Zap,
  safety: ShieldAlert,
  economy: TrendingUp,
  citizen: Users,
  insights: Cpu,
  admin: ShieldCheck
};

export default function Sidebar({
  navItems,
  activeNav,
  onSelectNav,
  isCollapsed,
  onToggleCollapse
}) {
  return (
    <aside className={`dash-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="dash-sidebar-brand">
        <div className="dash-sidebar-brand-icon">
          <Activity size={18} />
        </div>
        {!isCollapsed && (
          <div className="dash-sidebar-brand-text">
            <div className="dash-sidebar-brand-title">MIRA ROAD TWIN</div>
            <div className="dash-sidebar-brand-sub">URBAN INTELLIGENCE</div>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="dash-sidebar-nav" aria-label="Dashboard Modules">
        {navItems.map((item) => {
          const IconComponent = iconMap[item.id] || LayoutDashboard;
          const isActive = activeNav === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectNav(item.id)}
              className={`dash-nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
              type="button"
            >
              <IconComponent size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="dash-sidebar-toggle">
        <button
          onClick={onToggleCollapse}
          type="button"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </aside>
  );
}
