/**
 * CDS Navigation Prototype — pixel-perfect implementation of
 * https://www.figma.com/design/Ddl1SvLNSOJlp3dcIsql9i/Crusoe-Design-System--CDS-?node-id=19577-131
 *
 * Implements:
 *  1. Hover states on left-nav items
 *  2. Clickable sections that change the page title
 *  3. John Doe -> profile dropdown anchored above the avatar
 *  4. Product switcher (Cloud <-> Foundry) wired through the profile tiles
 *  5. Bell -> notifications tray anchored to the right of the rail
 *  6. Staging -> project-selector dropdown anchored to the Staging row
 *  7. Admin shell that remembers the previously visited app
 *
 * Styling uses @emotion/styled with design tokens exposed as CSS custom
 * properties. This mirrors the existing NewNav prototype pattern in the repo.
 */
import { useState, useRef, useEffect, useMemo, forwardRef, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styled from '@emotion/styled'
import { Global, css } from '@emotion/react'
import {
  OpenPanelLeft,
  ChevronSort,
  ArrowLeft,
  ArrowRight,
  Chip as ChipIcon,
  EdgeCluster,
  Db2Database,
  Network_2,
  ContainerRegistry,
  SettingsServices,
  Notification as NotificationCarbonIcon,
  Dashboard as DashboardIcon,
  Meter,
  CurrencyDollar,
  UserSettings,
  Portfolio,
  RecentlyViewed,
  NetworkEnterprise,
  Search,
  Home as HomeIcon,
  Play,
  CloudServices,
  DataCenter,
  CheckmarkFilled,
  WarningAlt,
  UserAvatar,
  Password,
  Asleep,
  Light,
  Logout,
  Rocket,
  ChartCustom,
  Ai,
  Add,
} from '@carbon/icons-react'

/* ──────────────────────────────────────────────────────────────────────
 *  Design tokens (CSS custom properties so they read like the rest of the
 *  design system). Sourced from Figma variables on node 19577-131.
 * ────────────────────────────────────────────────────────────────────── */
const tokens = css`
  /* ── Shared (theme-independent) + DARK defaults ──────────────────────
     :root carries the dark palette so the app renders dark before any
     theme attribute is applied (matches index.html's initial bg). The
     light palette below overrides under [data-cds-theme='light']. */
  :root {
    --cds-font-primary: 'Suisse Intl', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --cds-font-mono: 'ABC Diatype Mono', 'SF Mono', 'Monaco', 'Consolas', monospace;

    --cds-rail-width: 212px;
    --cds-row-height: 32px;
    --cds-radius-md: 8px;
    --cds-radius-lg: 12px;

    /* surfaces */
    --cds-bg-page: #0a0a0a;
    --cds-bg-sidebar: #0a0a0a;
    --cds-bg-panel: #161616;
    --cds-bg-panel-elevated: #1a1a1a;
    --cds-bg-item-active: #1f2123;
    --cds-bg-item-hover: rgba(255, 255, 255, 0.04);
    --cds-bg-item-hover-strong: rgba(255, 255, 255, 0.06);
    --cds-bg-avatar: #2a2a2c;
    --cds-bg-product-tile: #1d1e1f;
    --cds-bg-product-tile-hover: #222324;
    --cds-bg-product-tile-active: #28292a;
    --cds-table-header-bg: rgba(255, 255, 255, 0.02);

    /* borders */
    --cds-border: #343a40;
    --cds-border-subtle: #1f2326;

    /* text */
    --cds-text-primary: #ffffff;
    --cds-text-secondary: #adb5bd;
    --cds-text-tertiary: #868e96;
    --cds-text-muted: #565859;

    /* icons */
    --cds-icon-primary: #f8f9fa;
    --cds-icon-secondary: #ced4da;

    /* brand + status */
    --cds-hi-vis: #ceeb13;
    --cds-accent-tint: rgba(206, 235, 19, 0.08);
    --cds-positive: #acc695;
    --cds-positive-bg: #242a1f;
    --cds-positive-border: #607c48;
    --cds-positive-pill-bg: #323c2a;
    --cds-positive-pill-text: #d6e9c4;
    --cds-negative: #e86958;
    --cds-negative-bg: #680c00;
    --cds-negative-text: #f3b4ab;
    --cds-warning: #d3a13b;
    --cds-warning-bg: #5a4800;
    --cds-warning-text: #ffeea9;
    --cds-pill-neutral-bg: #343a40;

    /* semantic helpers (theme-flipping so primary buttons never break) */
    --cds-btn-primary-bg: #ffffff;
    --cds-btn-primary-text: #111111;
    --cds-btn-primary-hover-bg: #e9ecef;
    --cds-shadow-panel: 0px 2px 24px 0px rgba(0, 0, 0, 0.5);
    --cds-focus-ring: var(--cds-hi-vis);
  }

  /* ── LIGHT palette ───────────────────────────────────────────────────
     Analyzed from Cursor + Linear: soft-gray chrome against white content,
     hairline borders, near-black text, translucent-black hover, and solid
     black primary buttons. Status hues use Crusoe-DS light values
     (negative #b41f0b etc.) and the lime is deepened to #6b7700 so it stays
     legible as text/lines/the Foundry glyph on white — legibility over the
     raw neon, by intent. */
  [data-cds-theme='light'] {
    /* surfaces */
    --cds-bg-page: #ffffff;
    --cds-bg-sidebar: #f8f9fa;
    --cds-bg-panel: #ffffff;
    --cds-bg-panel-elevated: #f1f3f5;
    --cds-bg-item-active: #e9ecef;
    --cds-bg-item-hover: rgba(17, 17, 17, 0.04);
    --cds-bg-item-hover-strong: rgba(17, 17, 17, 0.06);
    --cds-bg-avatar: #dee2e6;
    --cds-bg-product-tile: #ffffff;
    --cds-bg-product-tile-hover: #f1f3f5;
    --cds-bg-product-tile-active: #e9ecef;
    --cds-table-header-bg: #f8f9fa;

    /* borders */
    --cds-border: #dee2e6;
    --cds-border-subtle: #eef0f2;

    /* text */
    --cds-text-primary: #111111;
    --cds-text-secondary: #495057;
    --cds-text-tertiary: #868e96;
    --cds-text-muted: #adb5bd;

    /* icons */
    --cds-icon-primary: #111111;
    --cds-icon-secondary: #495057;

    /* brand + status */
    --cds-hi-vis: #6b7700;
    --cds-accent-tint: rgba(107, 119, 0, 0.1);
    --cds-positive: #4c6b2c;
    --cds-positive-bg: #eef6e3;
    --cds-positive-border: #a3c585;
    --cds-positive-pill-bg: #e6f0d6;
    --cds-positive-pill-text: #3f5d1f;
    --cds-negative: #b41f0b;
    --cds-negative-bg: #fce8e6;
    --cds-negative-text: #b41f0b;
    --cds-warning: #9a6b00;
    --cds-warning-bg: #fdf2cf;
    --cds-warning-text: #7a5c00;
    --cds-pill-neutral-bg: #e9ecef;

    /* semantic helpers */
    --cds-btn-primary-bg: #111111;
    --cds-btn-primary-text: #ffffff;
    --cds-btn-primary-hover-bg: #2b2b2b;
    --cds-shadow-panel: 0px 8px 24px rgba(16, 24, 40, 0.12),
      0px 1px 2px rgba(16, 24, 40, 0.06);
  }

  @keyframes cdsPanelIn {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

/* ──────────────────────────────────────────────────────────────────────
 *  Domain types
 * ────────────────────────────────────────────────────────────────────── */
type Product = 'cloud' | 'foundry' | 'admin'
type NavId = string

interface NavItem {
  id: NavId
  label: string
  icon: typeof ChipIcon
}

const CLOUD_ITEMS: NavItem[] = [
  { id: 'compute', label: 'Compute', icon: ChipIcon },
  { id: 'orchestration', label: 'Orchestration', icon: EdgeCluster },
  { id: 'storage', label: 'Storage', icon: Db2Database },
  { id: 'networking', label: 'Networking', icon: Network_2 },
  { id: 'registry', label: 'Registry', icon: ContainerRegistry },
]

/* Sub-tabs shown under the page title for each Cloud section. */
const CLOUD_PAGE_TABS: Record<string, string[]> = {
  compute: ['Instances', 'Instance Templates', 'Custom Images'],
  orchestration: ['Kubernetes', 'Slurm'],
  storage: ['Disks', 'Buckets'],
  networking: ['VPC Networks', 'Subnets', 'Firewall Rules', 'Infiniband', 'Load Balancers'],
}

const FOUNDRY_TOP: NavItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'model-hub', label: 'Model Hub', icon: EdgeCluster },
  { id: 'playground', label: 'Playground', icon: Play },
  { id: 'command-center', label: 'Command Center', icon: DashboardIcon },
]
const FOUNDRY_DEV: NavItem[] = [
  { id: 'fine-tuning', label: 'Fine-tuning', icon: Ai },
  { id: 'evaluations', label: 'Evaluations', icon: ChartCustom },
  { id: 'datasets', label: 'Datasets', icon: Db2Database },
]
const FOUNDRY_DEPLOY: NavItem[] = [
  { id: 'dedicated-deployments', label: 'Dedicated Deployments', icon: Rocket },
  { id: 'api-keys', label: 'API Keys', icon: Password },
]

const ADMIN_ITEMS: NavItem[] = [
  { id: 'usage', label: 'Usage', icon: Meter },
  { id: 'billing', label: 'Billing', icon: CurrencyDollar },
  { id: 'user-access', label: 'User Access', icon: UserSettings },
  { id: 'projects', label: 'Projects', icon: Portfolio },
  { id: 'audit-logs', label: 'Audit Logs', icon: RecentlyViewed },
  { id: 'org-details', label: 'Org Details', icon: NetworkEnterprise },
  { id: 'all-notifications', label: 'All Notifications', icon: NotificationCarbonIcon },
]

const PROJECTS = ['Prod', 'Staging', 'Test'] as const
type Project = (typeof PROJECTS)[number]

/* ══════════════════════════════════════════════════════════════════════
 *  Root component
 * ══════════════════════════════════════════════════════════════════════ */
export default function CdsNavPrototype() {
  const navigate = useNavigate()
  const location = useLocation()

  /* ── URL is the source of truth for product + active page ──────────────
     basename="/cds-nav" is stripped, so pathname is e.g. "/", "/compute",
     "/foundry/model-hub", "/admin/usage". */
  const { product, cloudActive, foundryActive, adminActive } = useMemo(() => {
    const seg = location.pathname.split('/').filter(Boolean)
    if (seg[0] === 'admin') {
      return {
        product: 'admin' as Product,
        cloudActive: 'command-center',
        foundryActive: 'model-hub',
        adminActive: seg[1] ?? 'usage',
      }
    }
    if (seg[0] === 'foundry') {
      return {
        product: 'foundry' as Product,
        cloudActive: 'command-center',
        foundryActive: seg[1] ?? 'model-hub',
        adminActive: 'usage',
      }
    }
    return {
      product: 'cloud' as Product,
      cloudActive: seg[0] ?? 'command-center',
      foundryActive: 'model-hub',
      adminActive: 'usage',
    }
  }, [location.pathname])

  // Remember the last non-admin path so "Back to app" returns to it.
  const prevAppPathRef = useRef<string>('/command-center')
  useEffect(() => {
    if (product !== 'admin') {
      prevAppPathRef.current = location.pathname === '/' ? '/command-center' : location.pathname
    }
  }, [location.pathname, product])

  const [overlay, setOverlay] = useState<null | 'profile' | 'notifications' | 'projects'>(null)
  const [project, setProject] = useState<Project>('Staging')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [collapsed, setCollapsed] = useState(false)

  // Navigate + close any open overlay in one go.
  const go = (path: string) => {
    navigate(path)
    setOverlay(null)
  }

  const profileBtnRef = useRef<HTMLDivElement>(null)
  const profilePanelRef = useRef<HTMLDivElement>(null)
  const notifBtnRef = useRef<HTMLDivElement>(null)
  const notifPanelRef = useRef<HTMLDivElement>(null)
  const projectBtnRef = useRef<HTMLDivElement>(null)
  const projectPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!overlay) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      const within = (a: React.RefObject<HTMLElement>, b: React.RefObject<HTMLElement>) =>
        (a.current && a.current.contains(t)) || (b.current && b.current.contains(t))
      if (overlay === 'profile' && within(profileBtnRef, profilePanelRef)) return
      if (overlay === 'notifications' && within(notifBtnRef, notifPanelRef)) return
      if (overlay === 'projects' && within(projectBtnRef, projectPanelRef)) return
      setOverlay(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [overlay])

  useEffect(() => {
    if (!overlay) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOverlay(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [overlay])

  const isAdmin = product === 'admin'
  const isFoundry = product === 'foundry'

  const pageTitle = useMemo(() => {
    if (isAdmin) return ADMIN_ITEMS.find((i) => i.id === adminActive)?.label ?? 'Admin'
    if (isFoundry) {
      const all = [...FOUNDRY_TOP, ...FOUNDRY_DEV, ...FOUNDRY_DEPLOY]
      return all.find((i) => i.id === foundryActive)?.label ?? 'Foundry'
    }
    if (cloudActive === 'command-center') return 'Command Center'
    return CLOUD_ITEMS.find((i) => i.id === cloudActive)?.label ?? 'Command Center'
  }, [isAdmin, isFoundry, cloudActive, foundryActive, adminActive])

  const titleTabs = useMemo<string[] | null>(() => {
    if (isAdmin && adminActive === 'usage') return ['Cloud Usage', 'Inference Usage', 'Quotas']
    if (isFoundry && foundryActive === 'model-hub') {
      return [
        'Serverless Inference Models',
        'Tunable Open-Source Models',
        'My fine-tuned Models',
        'My Proprietary Models',
      ]
    }
    if (!isAdmin && !isFoundry && CLOUD_PAGE_TABS[cloudActive]) {
      return CLOUD_PAGE_TABS[cloudActive]
    }
    return null
  }, [isAdmin, isFoundry, adminActive, foundryActive, cloudActive])

  const [tabActive, setTabActive] = useState(0)
  useEffect(() => {
    setTabActive(0)
  }, [pageTitle])

  const selectCloud = (id: NavId) => go(`/${id}`)
  const selectFoundry = (id: NavId) => go(`/foundry/${id}`)
  const selectAdmin = (id: NavId) => go(`/admin/${id}`)
  const openAdmin = () => go('/admin/usage')
  const backToApp = () => go(prevAppPathRef.current)
  const switchToCloud = () => go('/command-center')
  const switchToFoundry = () => go('/foundry/model-hub')

  return (
    <Shell data-cds-theme={theme}>
      <Global styles={tokens} />
      <Sidebar data-collapsed={collapsed || undefined}>
        <NavTop data-rail-nav-top="">
          <RailIconBtn
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-pressed={collapsed}
            role="button"
            tabIndex={0}
            onClick={() => {
              setCollapsed((c) => !c)
              setOverlay(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setCollapsed((c) => !c)
                setOverlay(null)
              }
            }}
          >
            <OpenPanelLeft size={16} />
          </RailIconBtn>
          <span data-rail-product-glyph="">
            <CrusoeBadge product={isAdmin ? 'cloud' : (product as 'cloud' | 'foundry')} />
          </span>
          <ProductLabel data-rail-product-label="">
            {isAdmin
              ? 'Infrastructure Cloud'
              : isFoundry
                ? 'Intelligence Foundry'
                : 'Infrastructure Cloud'}
          </ProductLabel>
        </NavTop>

        <SidebarBody data-rail-body="">
          {isAdmin ? (
            <AdminNav activeId={adminActive} onSelect={selectAdmin} onBack={backToApp} />
          ) : isFoundry ? (
            <FoundryNav
              activeId={foundryActive}
              onSelect={selectFoundry}
              project={project}
              onProjectClick={() => setOverlay(overlay === 'projects' ? null : 'projects')}
              projectBtnRef={projectBtnRef}
              onAdminClick={openAdmin}
            />
          ) : (
            <CloudNav
              activeId={cloudActive}
              onSelect={selectCloud}
              project={project}
              onProjectClick={() => setOverlay(overlay === 'projects' ? null : 'projects')}
              projectBtnRef={projectBtnRef}
              onAdminClick={openAdmin}
            />
          )}
        </SidebarBody>

        {isFoundry && (
          <FoundryApiKeyWrap data-rail-api-pill-wrap="">
            <GetApiKeyBtn
              role="button"
              tabIndex={0}
              data-rail-api-pill=""
              title="Get API Key"
            >
              <Password size={16} />
              <span data-rail-api-text="">Get API Key</span>
            </GetApiKeyBtn>
          </FoundryApiKeyWrap>
        )}

        <SidebarBottom data-rail-bottom="">
          <UserPill
            ref={profileBtnRef}
            role="button"
            tabIndex={0}
            onClick={() => setOverlay(overlay === 'profile' ? null : 'profile')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOverlay(overlay === 'profile' ? null : 'profile')
              }
            }}
            aria-haspopup="menu"
            aria-expanded={overlay === 'profile'}
            data-open={overlay === 'profile' || undefined}
            data-rail-user-pill=""
            title="John Doe"
          >
            <AvatarSquare>J</AvatarSquare>
            <UserName data-rail-username="">John Doe</UserName>
          </UserPill>
          {!isFoundry && (
            <BellBtn
              ref={notifBtnRef}
              role="button"
              tabIndex={0}
              onClick={() => setOverlay(overlay === 'notifications' ? null : 'notifications')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setOverlay(overlay === 'notifications' ? null : 'notifications')
                }
              }}
              aria-label="Notifications"
              aria-haspopup="dialog"
              aria-expanded={overlay === 'notifications'}
              data-open={overlay === 'notifications' || undefined}
              data-rail-bell=""
            >
              <NotificationCarbonIcon size={18} />
            </BellBtn>
          )}
        </SidebarBottom>

        {overlay === 'profile' && (
          <ProfilePanelWrap ref={profilePanelRef}>
            <ProfilePanel
              isFoundry={isFoundry}
              theme={theme}
              onTheme={setTheme}
              onCloud={switchToCloud}
              onFoundry={switchToFoundry}
            />
          </ProfilePanelWrap>
        )}

        {overlay === 'projects' && (
          <ProjectPanelWrap ref={projectPanelRef} data-foundry={isFoundry || undefined}>
            <ProjectSelectorPanel
              current={project}
              onPick={(p) => {
                setProject(p)
                setOverlay(null)
              }}
            />
          </ProjectPanelWrap>
        )}
      </Sidebar>

      <MainArea>
        {!isAdmin && !isFoundry && cloudActive === 'command-center' ? (
          <CommandCenterPage />
        ) : (
          <>
            <MainHeader>
              <PageTitle>{pageTitle}</PageTitle>
            </MainHeader>
            {titleTabs && (
              <TabsRow>
                {titleTabs.map((label, i) => (
                  <TabBtn
                    key={label}
                    role="button"
                    tabIndex={0}
                    onClick={() => setTabActive(i)}
                    data-active={tabActive === i || undefined}
                  >
                    {label}
                  </TabBtn>
                ))}
              </TabsRow>
            )}
          </>
        )}

        {overlay === 'notifications' && (
          <NotifPanelWrap ref={notifPanelRef}>
            <NotificationsPanel />
          </NotifPanelWrap>
        )}
      </MainArea>
    </Shell>
  )
}

/* ══════════════════════════════════════════════════════════════════════
 *  Nav variants
 * ══════════════════════════════════════════════════════════════════════ */
function CloudNav(props: {
  activeId: NavId
  onSelect: (id: NavId) => void
  project: Project
  onProjectClick: () => void
  projectBtnRef: React.RefObject<HTMLDivElement>
  onAdminClick: () => void
}) {
  const { activeId, onSelect, project, onProjectClick, projectBtnRef, onAdminClick } = props
  return (
    <>
      <SidebarRow
        label="Command Center"
        icon={DashboardIcon}
        active={activeId === 'command-center'}
        onClick={() => onSelect('command-center')}
      />
      <RailDivider data-rail-divider="" />
      <ProjectSelectorRow ref={projectBtnRef} project={project} onClick={onProjectClick} />
      <Spacer h={8} />
      {CLOUD_ITEMS.map((item) => (
        <SidebarRow
          key={item.id}
          label={item.label}
          icon={item.icon}
          active={activeId === item.id}
          onClick={() => onSelect(item.id)}
        />
      ))}
      <Spacer h={16} />
      <SidebarRow label="Admin" icon={SettingsServices} onClick={onAdminClick} />
    </>
  )
}

function FoundryNav(props: {
  activeId: NavId
  onSelect: (id: NavId) => void
  project: Project
  onProjectClick: () => void
  projectBtnRef: React.RefObject<HTMLDivElement>
  onAdminClick: () => void
}) {
  const { activeId, onSelect, project, onProjectClick, projectBtnRef, onAdminClick } = props
  return (
    <>
      <ProjectSelectorRow ref={projectBtnRef} project={project} onClick={onProjectClick} twoLine />
      <Spacer h={4} />
      {FOUNDRY_TOP.map((item) => (
        <SidebarRow
          key={item.id}
          label={item.label}
          icon={item.icon}
          active={activeId === item.id}
          onClick={() => onSelect(item.id)}
        />
      ))}
      <GroupHeading>Model Development</GroupHeading>
      {FOUNDRY_DEV.map((item) => (
        <SidebarRow
          key={item.id}
          label={item.label}
          icon={item.icon}
          active={activeId === item.id}
          onClick={() => onSelect(item.id)}
        />
      ))}
      <GroupHeading>Model Deployments</GroupHeading>
      {FOUNDRY_DEPLOY.map((item) => (
        <SidebarRow
          key={item.id}
          label={item.label}
          icon={item.icon}
          active={activeId === item.id}
          onClick={() => onSelect(item.id)}
        />
      ))}
      <Spacer h={8} />
      <RailDivider data-rail-divider="" />
      <Spacer h={4} />
      <SidebarRow label="Admin" icon={SettingsServices} onClick={onAdminClick} />
    </>
  )
}

function AdminNav(props: {
  activeId: NavId
  onSelect: (id: NavId) => void
  onBack: () => void
}) {
  const { activeId, onSelect, onBack } = props
  return (
    <>
      <SidebarRow label="Back to app" icon={ArrowLeft} onClick={onBack} />
      <Spacer h={4} />
      {ADMIN_ITEMS.map((item) => (
        <SidebarRow
          key={item.id}
          label={item.label}
          icon={item.icon}
          active={activeId === item.id}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </>
  )
}

/* ──────────────────────────────────────────────────────────────────────
 *  Primitives
 * ────────────────────────────────────────────────────────────────────── */
function SidebarRow(props: {
  label: string
  icon: typeof ChipIcon
  active?: boolean
  onClick?: () => void
}) {
  const { label, icon: Icon, active, onClick } = props
  return (
    <RailRow
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      data-active={active || undefined}
      data-rail-row=""
      aria-current={active ? 'page' : undefined}
      title={label}
    >
      <Icon size={16} />
      <RailRowLabel data-rail-label="">{label}</RailRowLabel>
    </RailRow>
  )
}

function GroupHeading({ children }: { children: ReactNode }) {
  return <RailGroupHeading data-rail-group-heading="">{children}</RailGroupHeading>
}

const Spacer = styled.div<{ h: number }>`
  height: ${(p) => p.h}px;
  flex-shrink: 0;
`

const ProjectSelectorRow = forwardRef<
  HTMLDivElement,
  { project: Project; onClick: () => void; twoLine?: boolean }
>(function ProjectSelectorRowImpl({ project, onClick, twoLine }, ref) {
  return (
    <ProjectRow
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      data-rail-project-row=""
      title={project}
    >
      <ProjectAvatar>{project[0]}</ProjectAvatar>
      {twoLine ? (
        <ProjectTwoLine data-rail-two-line="">
          <ProjectLabelSmall>Project</ProjectLabelSmall>
          <ProjectName>{project}</ProjectName>
        </ProjectTwoLine>
      ) : (
        <ProjectName data-rail-project-name="">{project}</ProjectName>
      )}
      <ChevronSort size={16} />
    </ProjectRow>
  )
})

function CrusoeBadge({ product }: { product: 'cloud' | 'foundry' }) {
  // The Crusoe product mark (18×18). Foundry tints the glyph hi-vis green to
  // mirror the accent treatment elsewhere; Cloud uses primary text white.
  const fill = product === 'foundry' ? 'var(--cds-hi-vis)' : 'currentColor'
  return (
    <CrusoeBadgeBox aria-hidden="true">
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fill={fill}
          d="M13.4433 4.94617L13.1955 4.69481C13.1412 4.64092 13.0843 4.65851 13.068 4.73203L12.9137 5.43239C12.8974 5.50591 12.9273 5.61085 12.9816 5.66474L13.1193 5.81066C13.1695 5.86762 13.2326 5.85577 13.2592 5.7849L13.4874 5.17551C13.5139 5.10385 13.4928 5.00073 13.4418 4.94455L13.4442 4.9446L13.4433 4.94617ZM11.6688 3.62287L11.4063 3.49992C11.3364 3.47026 11.2876 3.50636 11.2976 3.58215L11.4268 4.54356C11.4367 4.61856 11.502 4.70454 11.5721 4.73421L11.7302 4.79797C11.7994 4.82999 11.852 4.7948 11.8476 4.71837L11.8003 3.8211C11.796 3.74546 11.7378 3.65569 11.6696 3.62209L11.6688 3.62287ZM6.94902 3.37131L6.66291 3.48467C6.59374 3.51387 6.58326 3.57879 6.64092 3.628L7.9818 4.77776C8.04024 4.8262 8.14393 4.84243 8.2131 4.81164L8.36761 4.74175C8.43846 4.71259 8.45048 4.64612 8.39618 4.59303L7.17916 3.41947C7.12486 3.36637 7.0213 3.34538 6.95057 3.37056L6.9498 3.37054L6.94902 3.37131ZM6.95006 5.51718L5.16235 4.57197C5.09486 4.53681 4.99518 4.5501 4.93972 4.60192L4.72251 4.81567C4.6695 4.86914 4.68269 4.94024 4.75108 4.97225L6.63407 5.85873C6.70247 5.89073 6.9255 5.72801 6.97773 5.67612C7.02996 5.62501 7.01755 5.55313 6.95084 5.5172L6.95006 5.51718ZM3.55799 6.52475L3.44356 6.79684C3.41551 6.86687 3.45507 6.93152 3.52967 6.93983L5.87772 7.20005C5.95219 7.20836 6.03856 7.15815 6.06674 7.08813L6.12557 6.93702C6.15596 6.86785 6.12117 6.80095 6.0467 6.78946L3.75244 6.42012C3.67797 6.40863 3.59095 6.45406 3.55889 6.52319V6.52477L3.55799 6.52475ZM10.1726 4.29925L9.58979 3.14309C9.55488 3.0754 9.4658 3.01661 9.38952 3.01223L9.07418 3C8.99867 2.99961 8.96868 3.0521 9.00746 3.11751L9.70732 4.30217C9.7461 4.36759 10.0256 4.41386 10.0996 4.41738C10.1734 4.42091 10.2066 4.36851 10.1725 4.30084L10.1726 4.29925ZM3.02867 8.70047L3.02246 9.02786C3.02207 9.10418 3.08349 9.15666 3.15783 9.14509L5.63078 8.75984C5.7059 8.74829 5.76899 8.67759 5.77093 8.60132L5.77235 8.42645C5.77675 8.35102 5.71856 8.29544 5.6428 8.3022L3.17257 8.55078C3.09758 8.55837 3.03216 8.62661 3.02776 8.70283L3.02867 8.70047ZM12.0895 6.74571L11.9469 6.63783C11.9102 6.61221 11.878 6.62806 11.8751 6.67252L11.8546 6.9733C11.8519 7.01776 11.879 7.07412 11.9156 7.09973L12.0162 7.1771C12.0497 7.20659 12.0834 7.19316 12.0909 7.15043L12.1386 6.87659C12.1461 6.83306 12.1245 6.77446 12.0904 6.74573L12.0895 6.74571ZM10.1389 6.37504L9.9646 6.44203C9.92362 6.45924 9.91703 6.49882 9.95038 6.52832L10.4413 6.97288C10.474 7.00236 10.5326 7.01025 10.5729 6.99063L10.6823 6.94499C10.7241 6.9294 10.733 6.89068 10.7021 6.85807L10.2709 6.4087C10.2399 6.37768 10.1807 6.36262 10.1381 6.37581L10.1397 6.37426L10.1389 6.37504ZM9.13779 7.2528C9.09512 7.23976 9.08025 7.19803 9.10353 7.16048L9.21265 7.00273C9.23902 6.96764 9.29513 6.95082 9.3369 6.96703L10.1014 7.25895C10.1432 7.27514 10.1563 7.31763 10.1315 7.35514L10.074 7.45699C10.0515 7.49535 9.99848 7.51702 9.95581 7.50399L9.13779 7.2528ZM9.85484 8.08093C9.85212 8.12538 9.81372 8.16254 9.77002 8.16378L8.8293 8.18766C8.7847 8.18967 8.75224 8.15383 8.75586 8.1094L8.78043 7.93117C8.78793 7.88763 8.83098 7.85298 8.87546 7.85494L9.79304 7.8901C9.83751 7.89206 9.87074 7.92949 9.86557 7.97388L9.85484 8.08173V8.08093ZM11.0469 6.29306C11.0033 6.28715 10.9779 6.3167 10.9918 6.3592L11.1255 6.78169C11.1387 6.82418 11.1855 6.86118 11.23 6.86314L11.3505 6.87583C11.394 6.88254 11.4218 6.85305 11.4111 6.80905L11.3171 6.4186C11.3064 6.37459 11.2622 6.33209 11.2195 6.32223L11.0469 6.29227V6.29306ZM7.81527 5.8809L8.77048 6.39726C8.81676 6.42152 8.88696 6.4146 8.92679 6.38147L9.03552 6.29606C9.07767 6.26536 9.07651 6.21763 9.03112 6.18941L8.13359 5.63005C8.08989 5.60187 8.01904 5.60559 7.97754 5.6371L7.80609 5.77572C7.7655 5.80805 7.76912 5.85505 7.8154 5.88011L7.8145 5.88009L7.81527 5.8809ZM12.5711 6.55002L12.7017 6.05573C12.7158 6.00521 12.6946 5.93549 12.6564 5.89951L12.4706 5.73643C12.4302 5.70358 12.3917 5.71926 12.3854 5.77077L12.3187 6.31443C12.3119 6.36673 12.3377 6.43817 12.375 6.47571L12.4797 6.57466C12.5162 6.61218 12.557 6.60132 12.571 6.55081L12.5711 6.55002ZM13.3842 6.84003L13.2578 6.62682C13.2295 6.58157 13.1788 6.57705 13.1427 6.61507L12.8703 6.90846C12.8342 6.94647 12.8278 7.01468 12.8544 7.05911L12.9098 7.15677C12.9349 7.20273 12.9901 7.2169 13.034 7.18704L13.3488 6.97505C13.3925 6.94598 13.4076 6.88437 13.3827 6.83839L13.3842 6.84003ZM11.7948 5.30373L11.5969 5.21348C11.5497 5.19077 11.5157 5.21532 11.5239 5.26801L11.6076 5.89352C11.615 5.9454 11.6588 6.00617 11.7068 6.02809L11.8395 6.09358C11.8857 6.11785 11.9213 6.09573 11.9179 6.04396L11.886 5.44127C11.8833 5.38952 11.842 5.32801 11.7956 5.30454L11.7948 5.30373ZM8.65372 5.23898C8.60614 5.26079 8.59942 5.30673 8.63989 5.34039L9.38499 5.97925C9.42391 6.01286 9.4967 6.0243 9.54415 6.00408L9.67693 5.94872C9.72503 5.9301 9.73421 5.88423 9.69697 5.84827L9.01212 5.18794C8.97488 5.15199 8.90364 5.13661 8.85542 5.15522L8.6545 5.23901L8.65372 5.23898ZM8.42966 6.93056L8.50633 6.82444C8.53762 6.78233 8.52301 6.73503 8.47336 6.71863L7.36961 6.34945C7.31996 6.33225 7.25506 6.3536 7.22441 6.39732L7.1096 6.56129C7.08064 6.60504 7.09771 6.6524 7.14813 6.66644L8.28499 6.9856C8.33554 6.99964 8.3998 6.97588 8.42876 6.93213L8.42966 6.93056ZM10.8427 4.97827L10.6535 4.94787C10.602 4.94016 10.574 4.97521 10.5926 5.0242L10.8396 5.70328C10.8575 5.75224 10.9142 5.79984 10.9657 5.80756L11.0854 5.82499C11.1368 5.83508 11.1671 5.80169 11.1525 5.75201L10.9623 5.08874C10.9485 5.03828 10.8942 4.98916 10.8427 4.97906V4.97827ZM10.3999 5.70051L9.98723 5.00119C9.96059 4.95598 9.89621 4.92328 9.84436 4.92828L9.64487 4.95248C9.59302 4.95908 9.57453 4.99914 9.60363 5.04283L10.0736 5.74286C10.1027 5.78655 10.1686 5.8161 10.2206 5.80792L10.3538 5.79074C10.4056 5.78573 10.4258 5.74492 10.3999 5.70051ZM7.90254 8.07673L6.61804 8.2053C6.56619 8.2103 6.52043 8.25681 6.51745 8.30999L6.50607 8.52993C6.50556 8.58239 6.54758 8.61847 6.59865 8.61026L7.88108 8.41009C7.93293 8.4027 7.97805 8.353 7.98102 8.30061L7.98865 8.16087C7.99395 8.10854 7.95439 8.06934 7.90254 8.07515V8.07673ZM6.62968 9.51903C6.64351 9.56947 6.69523 9.59706 6.745 9.58088L7.98697 9.16339C8.03675 9.14641 8.06687 9.09155 8.05382 9.04031L8.02317 8.90436C8.01348 8.85242 7.96409 8.82252 7.91366 8.83629L6.65256 9.19366C6.60214 9.20743 6.57046 9.26067 6.58339 9.31189L6.62968 9.51823V9.51903ZM6.85994 7.22815C6.80758 7.2228 6.75095 7.2579 6.73453 7.30755L6.66756 7.49503C6.65282 7.54472 6.68269 7.58923 6.73505 7.59219L7.98387 7.67259C8.03636 7.67556 8.09222 7.63806 8.10786 7.58839L8.15156 7.4655C8.1703 7.4167 8.14367 7.37228 8.09209 7.36615L6.86072 7.22817L6.85994 7.22815ZM15.0208 9.05813C15.0212 8.98261 14.9679 8.89137 14.9004 8.85621L14.323 8.55647C14.2555 8.52131 14.2013 8.55487 14.2017 8.63121L14.1966 8.83142C14.1929 8.90765 14.2405 9.0051 14.3022 9.04886L14.8861 9.46565C14.9477 9.50939 15.0016 9.48457 15.006 9.40836L15.0225 9.05579V9.05817L15.0208 9.05813ZM14.5895 11.2269C14.6183 11.1569 14.6012 11.0507 14.5534 10.9914L13.988 10.2928C13.9403 10.2335 13.8772 10.243 13.8476 10.3122L13.7727 10.4653C13.7407 10.5344 13.7499 10.6412 13.7928 10.7043L14.3395 11.505C14.3825 11.5673 14.4431 11.5625 14.475 11.4934L14.5879 11.226L14.5887 11.2261L14.5895 11.2269ZM11.25 14.5701C11.32 14.5417 11.3825 14.4567 11.3869 14.3805L11.5059 12.6949C11.5111 12.6195 11.4573 12.5775 11.3858 12.6035L11.2245 12.6549C11.1524 12.6777 11.0858 12.7594 11.0751 12.8347L10.8487 14.5858C10.8389 14.6603 10.8902 14.7022 10.9609 14.6778L11.2491 14.5708L11.25 14.5709V14.5701ZM9.81411 12.975C9.83984 12.9041 9.80092 12.8427 9.72787 12.8392C9.65469 12.8357 9.37969 12.8642 9.35073 12.9334L8.54499 14.8515C8.51538 14.9215 8.55275 14.9821 8.62812 14.9864L8.93248 14.9999C9.00876 15.0019 9.09137 14.9445 9.11788 14.8728L9.81411 12.975V12.975ZM6.62024 14.4966C6.69018 14.5262 6.78547 14.5025 6.83318 14.4433L8.29132 12.6338C8.33903 12.5754 8.32106 12.5018 8.25111 12.4713L8.1067 12.3984C8.0383 12.3656 7.94081 12.3853 7.89078 12.442L6.32003 14.2057C6.27012 14.2616 6.28408 14.3367 6.35157 14.3695L6.61869 14.495L6.62024 14.4966ZM13.0225 11.7241C13.002 11.6512 12.9429 11.633 12.8898 11.6856C12.8376 11.7383 12.6608 11.9595 12.6756 12.0338L12.948 13.3822C12.9627 13.4565 13.0203 13.4755 13.0765 13.4245L13.3025 13.2047C13.3564 13.1504 13.3831 13.047 13.3635 12.9733L13.0225 11.7241ZM4.76776 13.2317C4.82193 13.2856 4.91567 13.2928 4.97644 13.2475L6.9785 11.7797C7.03927 11.7352 7.04535 11.6543 6.99195 11.6012L6.87442 11.4717C6.8218 11.4163 6.7282 11.4059 6.66433 11.4471L4.56865 12.8154C4.50556 12.8567 4.4947 12.9367 4.54654 12.9929L4.77009 13.2317L4.76931 13.2317L4.76776 13.2317ZM12.8102 8.62261C12.8169 8.57906 12.793 8.52039 12.7587 8.49326L12.5406 8.32138C12.5063 8.29424 12.4726 8.30688 12.4666 8.35124L12.4435 8.47625C12.4335 8.51973 12.4511 8.58061 12.4828 8.61165L12.7 8.82167C12.7318 8.85272 12.7662 8.84328 12.7769 8.79983L12.8109 8.62422L12.8102 8.62261ZM11.6076 10.2043C11.648 10.1863 11.6826 10.1355 11.6846 10.091L11.7041 9.46821C11.7052 9.42372 11.6733 9.40141 11.6316 9.41701L11.52 9.45623C11.4767 9.46861 11.4389 9.51374 11.4337 9.55733L11.3664 10.2162C11.3621 10.2607 11.3933 10.2853 11.435 10.2705L11.6093 10.2035L11.6078 10.2035L11.6076 10.2043ZM10.7175 9.48769C10.7407 9.44935 10.7945 9.43008 10.8363 9.44311L10.8371 9.44312L10.9482 9.48023C10.9917 9.49169 11.0106 9.53274 10.9904 9.57196L10.6174 10.3008C10.5974 10.3408 10.545 10.3657 10.5014 10.3574L10.3149 10.3136C10.2723 10.3013 10.2551 10.2595 10.2783 10.222L10.7182 9.48772L10.7175 9.48769ZM10.3361 9.19945C10.3695 9.22974 10.3698 9.27904 10.338 9.31001L9.67939 9.94948C9.64758 9.98044 9.59263 9.98378 9.5576 9.95583L9.4199 9.83933C9.38732 9.80905 9.38771 9.76057 9.42275 9.73207L10.1377 9.12031C10.1711 9.09177 10.2244 9.09396 10.2562 9.12501L10.3362 9.19786L10.3361 9.19945ZM12.4471 9.52026C12.4727 9.48436 12.4767 9.42245 12.4555 9.38293L12.2643 9.02969C12.2431 8.99018 12.2026 8.98674 12.1747 9.02099L12.0936 9.11109C12.0618 9.14206 12.0507 9.20139 12.0704 9.24166L12.2538 9.64479C12.2718 9.68581 12.3107 9.69 12.3394 9.65657L12.4471 9.51866V9.52026ZM10.2141 12.1252C10.1962 12.174 10.2246 12.2121 10.2772 12.2088L10.497 12.197C10.5487 12.192 10.6041 12.1481 10.6173 12.0976L10.9104 11.0813C10.9251 11.0308 10.8936 10.9942 10.8425 10.9992L10.7047 11.0091C10.6522 11.0109 10.5954 11.0523 10.5781 11.102L10.2141 12.1244L10.2149 12.1244L10.2141 12.1252ZM13.2991 8.44857C13.2545 8.41958 13.2174 8.43928 13.2152 8.49169L13.2044 8.63531C13.2014 8.6877 13.2297 8.75841 13.2702 8.79286L13.6839 9.15192C13.7227 9.18633 13.7629 9.17228 13.7705 9.1208L13.7992 8.87509C13.8047 8.82276 13.773 8.75674 13.7284 8.72854L13.3007 8.44861L13.2991 8.44857ZM13.7095 7.6897C13.6972 7.6385 13.645 7.60294 13.593 7.61033L13.217 7.6641C13.1652 7.67148 13.1329 7.71914 13.1452 7.76954L13.1693 7.8791C13.179 7.93023 13.2296 7.97608 13.2819 7.98064L13.6811 8.01652C13.7327 8.02106 13.7678 7.98301 13.7588 7.9311L13.7103 7.68814V7.68973L13.7095 7.6897ZM13.5579 9.8928C13.5767 9.84399 13.5659 9.77136 13.5335 9.73076L13.1538 9.26128C13.1214 9.22069 13.0799 9.22754 13.0619 9.27636L13.0075 9.41407C12.9863 9.46282 12.9947 9.53697 13.0238 9.58067L13.3798 10.1012C13.4089 10.1449 13.4504 10.1404 13.4707 10.0925L13.5571 9.89277L13.5579 9.8928ZM11.4716 11.9697C11.5198 11.9511 11.5626 11.8926 11.5664 11.841L11.6334 10.8919C11.6371 10.8403 11.5997 10.8123 11.5515 10.8309L11.4159 10.8782C11.3669 10.8952 11.3209 10.9529 11.314 11.0036L11.1874 11.9766C11.1806 12.0289 11.2164 12.0584 11.266 12.043L11.4716 11.9705V11.9697ZM9.96615 10.9357C9.9156 10.9224 9.85134 10.9478 9.82393 10.9924L9.19261 11.9895C9.16442 12.0333 9.18304 12.0799 9.23437 12.0932L9.42973 12.1381C9.48106 12.1498 9.54376 12.122 9.56962 12.0765L10.1425 11.0635C10.1684 11.0181 10.1473 10.973 10.0958 10.9629L9.96771 10.9357L9.96615 10.9357ZM13.0673 10.7704C13.0986 10.7283 13.1061 10.6561 13.0827 10.6086L12.78 9.98851C12.7574 9.9418 12.7129 9.93666 12.6809 9.97876L12.6037 10.0721C12.5708 10.1126 12.5601 10.1863 12.5795 10.2345L12.8506 10.9047C12.87 10.9529 12.9144 10.9604 12.9472 10.9207L13.0673 10.7712V10.7704ZM12.2537 10.5313C12.2431 10.4801 12.2006 10.4631 12.1592 10.4946L12.0483 10.5712C12.0046 10.5995 11.9749 10.6655 11.9823 10.7182L12.102 11.5529C12.1094 11.6048 12.1503 11.6225 12.1932 11.5927L12.3576 11.4769C12.3999 11.4454 12.4263 11.3785 12.4149 11.3274L12.2537 10.5313ZM8.80861 10.4363C8.85076 10.4056 8.85374 10.3508 8.81495 10.3148L8.71578 10.216C8.67855 10.1793 8.61197 10.172 8.56826 10.2018L7.4808 10.9112C7.4371 10.9395 7.43012 10.9941 7.46567 11.0332L7.62147 11.1892C7.65857 11.2259 7.72451 11.2308 7.76588 11.1993L8.80706 10.4355L8.80861 10.4363ZM7.00113 10.3993C7.02608 10.4453 7.0853 10.4643 7.13197 10.4409L8.30826 9.8627C8.35506 9.83928 8.37161 9.78485 8.34407 9.73882L8.27568 9.61777C8.2515 9.57103 8.19242 9.5504 8.14419 9.57139L6.94153 10.0925C6.89408 10.1135 6.87352 10.1686 6.89692 10.2153L7.00113 10.3993ZM9.42482 10.838C9.45921 10.7992 9.44938 10.748 9.40232 10.7246L9.28777 10.6627C9.24239 10.6361 9.17606 10.6455 9.13934 10.6827L8.26495 11.5773C8.22823 11.6145 8.2356 11.6679 8.27943 11.6945L8.45501 11.789C8.50052 11.8148 8.56607 11.803 8.60201 11.7642L9.42482 10.838ZM8.86279 8.97246L8.91994 9.12977C8.93636 9.17075 8.98432 9.19029 9.02543 9.17388L9.91625 8.80444C9.95724 8.78724 9.97598 8.74001 9.96034 8.69827L9.9209 8.59548C9.90771 8.55299 9.86221 8.52953 9.82045 8.54514L8.91088 8.86877C8.86912 8.88357 8.8465 8.93067 8.86292 8.97165L8.86279 8.97246ZM14.5544 6.67508C14.526 6.60516 14.4465 6.57605 14.3795 6.61008L13.9546 6.82872C13.887 6.86352 13.8561 6.94938 13.8861 7.01854L13.9579 7.22157C13.9846 7.29223 14.0664 7.33491 14.1391 7.31535L14.6012 7.19389C14.6749 7.17435 14.7135 7.10062 14.689 7.02922L14.556 6.67512L14.5544 6.67508ZM6.00598 10.4106C6.07579 10.3823 6.10902 10.3012 6.08058 10.2313L6.01348 10.0634C5.98827 9.99199 5.90888 9.95412 5.83751 9.97929L3.44382 10.8246C3.37323 10.8498 3.3369 10.9283 3.36366 10.999L3.47821 11.3017C3.50666 11.3716 3.58759 11.4063 3.65767 11.3764L6.0052 10.4098L6.00598 10.4106ZM12.6811 7.78125C12.7237 7.76805 12.7463 7.72173 12.7331 7.67925L12.6639 7.49935C12.6483 7.4576 12.601 7.43966 12.5608 7.46008L12.4141 7.53176C12.3738 7.55138 12.3551 7.60098 12.3707 7.64274L12.4251 7.77772C12.44 7.81945 12.4871 7.84295 12.5296 7.82975L12.6811 7.78125Z"
        />
      </svg>
    </CrusoeBadgeBox>
  )
}

/* ──────────────────────────────────────────────────────────────────────
 *  Profile panel
 * ────────────────────────────────────────────────────────────────────── */
function ProfilePanel(props: {
  isFoundry: boolean
  theme: 'light' | 'dark'
  onTheme: (t: 'light' | 'dark') => void
  onCloud: () => void
  onFoundry: () => void
}) {
  const { isFoundry, theme, onTheme, onCloud, onFoundry } = props
  return (
    <ProfileMenu>
      <ProfileIdentity>
        <ProfileName>John Doe</ProfileName>
        <ProfileEmail>johndoe@abc.ai</ProfileEmail>
      </ProfileIdentity>
      <PanelDivider />
      <ProfileItem icon={UserAvatar} label="Profile" />
      <ProfileItem icon={Password} label="Security" />
      <PanelDivider />
      <ProfileHealthPill>
        <CheckmarkFilled size={14} />
        <span>No known issues</span>
      </ProfileHealthPill>
      <ProductTiles>
        <ProductTile
          icon={CloudServices}
          line1="Infrastructure"
          line2="Cloud"
          active={!isFoundry}
          onClick={onCloud}
        />
        <ProductTile
          icon={DataCenter}
          line1="Intelligence"
          line2="Foundry"
          active={isFoundry}
          onClick={onFoundry}
        />
      </ProductTiles>
      <ThemeToggleWrap>
        <ThemeBtn
          role="button"
          tabIndex={0}
          onClick={() => onTheme('light')}
          data-active={theme === 'light' || undefined}
          aria-pressed={theme === 'light'}
        >
          <Light size={16} />
        </ThemeBtn>
        <ThemeBtn
          role="button"
          tabIndex={0}
          onClick={() => onTheme('dark')}
          data-active={theme === 'dark' || undefined}
          aria-pressed={theme === 'dark'}
        >
          <Asleep size={16} />
        </ThemeBtn>
      </ThemeToggleWrap>
      <PanelDivider />
      <ProfileItem icon={Logout} label="Log out" />
    </ProfileMenu>
  )
}

function ProfileItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof ChipIcon
  label: string
  onClick?: () => void
}) {
  return (
    <ProfileMenuItemBtn
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <Icon size={16} />
      <span>{label}</span>
    </ProfileMenuItemBtn>
  )
}

function ProductTile(props: {
  icon: typeof ChipIcon
  line1: string
  line2: string
  active?: boolean
  onClick: () => void
}) {
  const { icon: Icon, line1, line2, active, onClick } = props
  return (
    <ProductTileBtn
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      data-active={active || undefined}
      aria-pressed={active}
    >
      <Icon size={20} />
      <ProductTileText>
        {line1}
        <br />
        {line2}
      </ProductTileText>
    </ProductTileBtn>
  )
}

/* ──────────────────────────────────────────────────────────────────────
 *  Notifications Panel
 * ────────────────────────────────────────────────────────────────────── */
const NOTIF_TABS = [
  { label: 'Operations', count: 1, tone: 'positive' as const },
  { label: 'Health', count: 2, tone: 'neutral' as const },
  { label: 'Account', count: 0, tone: 'neutral' as const },
  { label: 'Maintenance', count: 0, tone: 'neutral' as const },
  { label: 'Support', count: 0, tone: 'neutral' as const },
]

function NotificationsPanel() {
  const [tab, setTab] = useState(0)
  return (
    <NotifPanel>
      <NotifTabs>
        {NOTIF_TABS.map((t, i) => (
          <NotifTabBtn
            key={t.label}
            role="button"
            tabIndex={0}
            onClick={() => setTab(i)}
            data-active={tab === i || undefined}
          >
            <span>{t.label}</span>
            {t.count > 0 && (
              <NotifCount data-tone={t.tone} data-active={tab === i || undefined}>
                {t.count}
              </NotifCount>
            )}
          </NotifTabBtn>
        ))}
      </NotifTabs>
      <NotifList>
        <NotifEntry
          severity="critical"
          time="1 sec ago"
          unread
          project="prod...-1"
          resource="vm-h100-prod-007"
          tag="Action Required"
          tagTone="negative"
          title="m-h100-prod-007 degraded. ThermalViolation (XID 76)"
          body="GPU no longer accessible to workload; training step likely crashed."
          affected={['vm-h100-prod-007']}
          events={[{ label: '1 critical', tone: 'negative' }]}
        />
        <NotifEntry
          severity="warning"
          time="1 sec ago"
          project="prod...-1/"
          resource="vm-h100-prod-007"
          tag="Action Required"
          tagTone="negative"
          title="3 GPU nodes degraded — 16 hardware events in 30m"
          body="Multiple XID errors and HCA flaps; workloads on these nodes may be unreliable."
          affected={['vm-h100-prod-007', '+2 more']}
          events={[
            { label: '2 critical', tone: 'negative' },
            { label: '14 warning', tone: 'warning' },
          ]}
        />
        {[0, 1, 2, 3].map((i) => (
          <NotifEntry
            key={i}
            severity="positive"
            time="1 sec ago"
            project="prod...-1"
            resource="vm-h100-prod-007"
            body="vm-h100-prod-007 failed to start."
          />
        ))}
      </NotifList>
      <NotifFooter>
        <NotifFooterBtn role="button" tabIndex={0}>
          All notifications
        </NotifFooterBtn>
      </NotifFooter>
    </NotifPanel>
  )
}

interface NotifEvt {
  label: string
  tone: 'negative' | 'warning' | 'positive'
}
function NotifEntry(props: {
  severity: 'critical' | 'warning' | 'positive'
  time: string
  unread?: boolean
  project: string
  resource: string
  tag?: string
  tagTone?: 'negative' | 'warning' | 'positive'
  title?: string
  body: string
  affected?: string[]
  events?: NotifEvt[]
}) {
  const { severity, time, unread, project, resource, tag, tagTone, title, body, affected, events } = props
  return (
    <NotifRow>
      <NotifSeverity data-tone={severity}>
        {severity === 'positive' ? <CheckmarkFilled size={16} /> : <WarningAlt size={16} />}
      </NotifSeverity>
      <NotifRowBody>
        <NotifRowHeader>
          <NotifResource>
            <span>{project} / </span>
            <strong>{resource}</strong>
          </NotifResource>
          <NotifTime>
            {unread && <UnreadDot />}
            {time}
          </NotifTime>
        </NotifRowHeader>
        {tag && (
          <NotifTagRow>
            <NotifTag data-tone={tagTone || 'negative'}>{tag}</NotifTag>
          </NotifTagRow>
        )}
        {title && <NotifTitle>{title}</NotifTitle>}
        <NotifBody>{body}</NotifBody>
        {affected && (
          <NotifAffected>
            <span>Affected: </span>
            {affected.map((a, i) => (
              <span key={a}>
                <NotifLink>{a}</NotifLink>
                {i < affected.length - 1 && ', '}
              </span>
            ))}
          </NotifAffected>
        )}
        {events && (
          <NotifEvents>
            <span>Events: </span>
            {events.map((e) => (
              <NotifEventPill key={e.label} data-tone={e.tone}>
                {e.label}
              </NotifEventPill>
            ))}
          </NotifEvents>
        )}
      </NotifRowBody>
    </NotifRow>
  )
}

/* ──────────────────────────────────────────────────────────────────────
 *  Project Selector Panel
 * ────────────────────────────────────────────────────────────────────── */
function ProjectSelectorPanel({
  current,
  onPick,
}: {
  current: Project
  onPick: (p: Project) => void
}) {
  const [q, setQ] = useState('')
  const list = PROJECTS.filter((p) => p.toLowerCase().includes(q.toLowerCase()))
  return (
    <ProjectMenu>
      <ProjectSearchWrap>
        <Search size={16} />
        <ProjectSearchField
          type="text"
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
      </ProjectSearchWrap>
      <ProjectOptions>
        {list.map((p) => (
          <ProjectOption
            key={p}
            role="option"
            aria-selected={current === p}
            tabIndex={0}
            onClick={() => onPick(p)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onPick(p)
              }
            }}
            data-active={current === p || undefined}
          >
            {p}
          </ProjectOption>
        ))}
      </ProjectOptions>
      <PanelDivider />
      <ProjectManageBtn role="button" tabIndex={0}>
        <span>Manage projects</span>
        <ArrowRight size={16} />
      </ProjectManageBtn>
    </ProjectMenu>
  )
}

/* ══════════════════════════════════════════════════════════════════════
 *  Command Center → Infrastructure Overview page
 *
 *  Implementation of Figma node 6928:1948 from the Command Center file.
 *  Layout, type, and spacing match the Figma; colors are translated to the
 *  prototype's dark-theme tokens so the page composes with the rest of
 *  the shell instead of dropping in a light surface.
 * ────────────────────────────────────────────────────────────────────── */
function CommandCenterPage() {
  return (
    <PageScroll>
      <PageHeader>
        <PageHeading>Infrastructure Overview</PageHeading>
      </PageHeader>

      {/* Install Crusoe MCP banner */}
      <InstallBanner>
        <InstallBannerText>Install Crusoe MCP</InstallBannerText>
        <InstallBannerBtn role="button" tabIndex={0}>
          Install
        </InstallBannerBtn>
      </InstallBanner>

      {/* Stat cards */}
      <StatCardRow>
        <StatCard>
          <StatCardValue>0</StatCardValue>
          <StatCardLabel>Total Active Instances (VMs + CMK Nodes)</StatCardLabel>
        </StatCard>
        <StatCardDivider />
        <StatCard>
          <StatCardValue>0</StatCardValue>
          <StatCardLabel>Total CPUs</StatCardLabel>
        </StatCard>
      </StatCardRow>

      {/* Resource table */}
      <ResourceTable>
        <ResourceTableHeader>
          <ResourceCol>Instance type</ResourceCol>
          <ResourceCol>Instances</ResourceCol>
          <ResourceCol>Utilization</ResourceCol>
          <ResourceCol>Instance health</ResourceCol>
        </ResourceTableHeader>
        <ResourceTableEmpty>
          <ResourceEmptyLabel>No resources</ResourceEmptyLabel>
          <ResourceEmptyActions>
            <PrimaryBtn role="button" tabIndex={0}>
              <Add size={16} />
              <span>Create Cluster</span>
            </PrimaryBtn>
            <SecondaryBtn role="button" tabIndex={0}>
              <Add size={16} />
              <span>Create Instance</span>
            </SecondaryBtn>
          </ResourceEmptyActions>
        </ResourceTableEmpty>
      </ResourceTable>
    </PageScroll>
  )
}

/* ══════════════════════════════════════════════════════════════════════
 *  Command Center styles
 * ══════════════════════════════════════════════════════════════════════ */
const PageScroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
`

const PageHeader = styled.header`
  display: flex;
  align-items: center;
  height: 32px;
  padding-left: 4px;
`

const PageHeading = styled.div`
  /* Standard page title — 16px Suisse Regular, 1.4 lh.
     Matches every other page title in the shell. */
  font-family: var(--cds-font-primary);
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1.4;
  margin: 0;
  color: var(--cds-text-primary);
`

const InstallBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 16px;
  background: var(--cds-bg-panel);
  border: 1px solid var(--cds-border);
  border-radius: var(--cds-radius-md);
`

const InstallBannerText = styled.span`
  font-family: var(--cds-font-primary);
  font-size: 14px;
  font-weight: 400;
  color: var(--cds-text-primary);
  line-height: 1.3;
`

const InstallBannerBtn = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 12px;
  background: var(--cds-btn-primary-bg);
  color: var(--cds-btn-primary-text);
  border-radius: var(--cds-radius-md);
  font-family: var(--cds-font-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 120ms ease, transform 80ms ease;
  &:hover {
    background: var(--cds-btn-primary-hover-bg);
  }
  &:active {
    transform: scale(0.98);
  }
`

const StatCardRow = styled.div`
  display: flex;
  align-items: stretch;
  height: 160px;
  background: var(--cds-bg-panel);
  border: 1px solid var(--cds-border);
  border-radius: var(--cds-radius-md);
`

const StatCard = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  min-width: 0;
`

const StatCardValue = styled.div`
  font-family: var(--cds-font-mono);
  font-size: 48px;
  font-weight: 400;
  letter-spacing: -2px;
  line-height: 1;
  color: var(--cds-text-primary);
  font-variant-numeric: tabular-nums;
`

const StatCardLabel = styled.div`
  font-family: var(--cds-font-primary);
  font-size: 14px;
  font-weight: 400;
  color: var(--cds-text-primary);
  line-height: 1.3;
`

const StatCardDivider = styled.div`
  width: 1px;
  background: var(--cds-border);
`

const ResourceTable = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--cds-bg-panel);
  border: 1px solid var(--cds-border);
  border-radius: var(--cds-radius-md);
  overflow: hidden;
`

const ResourceTableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  align-items: center;
  height: 36px;
  padding: 0 16px;
  background: var(--cds-table-header-bg);
  border-bottom: 1px solid var(--cds-border);
  font-family: var(--cds-font-primary);
  font-size: 12px;
  font-weight: 700;
  color: var(--cds-text-secondary);
`

const ResourceCol = styled.div`
  text-align: left;
`

const ResourceTableEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px 24px;
  min-height: 166px;
`

const ResourceEmptyLabel = styled.div`
  font-family: var(--cds-font-primary);
  font-size: 14px;
  font-weight: 400;
  color: var(--cds-text-secondary);
`

const ResourceEmptyActions = styled.div`
  display: flex;
  gap: 12px;
`

const PrimaryBtn = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 16px;
  background: var(--cds-btn-primary-bg);
  color: var(--cds-btn-primary-text);
  border-radius: var(--cds-radius-md);
  font-family: var(--cds-font-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: background-color 120ms ease, transform 80ms ease;
  & svg {
    color: var(--cds-btn-primary-text);
  }
  &:hover {
    background: var(--cds-btn-primary-hover-bg);
  }
  &:active {
    transform: scale(0.98);
  }
`

const SecondaryBtn = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 16px;
  background: transparent;
  color: var(--cds-text-primary);
  border: 1px solid var(--cds-border);
  border-radius: var(--cds-radius-md);
  font-family: var(--cds-font-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: background-color 120ms ease, transform 80ms ease;
  & svg {
    color: var(--cds-icon-primary);
  }
  &:hover {
    background: var(--cds-bg-item-hover-strong);
  }
  &:active {
    transform: scale(0.98);
  }
`

/* ══════════════════════════════════════════════════════════════════════
 *  Styled primitives (div-based to keep the layout dark-theme prototype)
 * ══════════════════════════════════════════════════════════════════════ */
const Shell = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  background: var(--cds-bg-page);
  color: var(--cds-text-primary);
  font-family: var(--cds-font-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`

const Sidebar = styled.aside`
  position: relative;
  width: var(--cds-rail-width);
  min-width: var(--cds-rail-width);
  background: var(--cds-bg-sidebar);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  transition: width 180ms cubic-bezier(0.4, 0, 0.2, 1),
    min-width 180ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ── Collapsed state: icons only, 56px rail ─────────────────── */
  &[data-collapsed] {
    --cds-rail-width: 56px;

    /* Top product row: only the toggle stays visible */
    [data-rail-nav-top] {
      padding: 16px 0 12px;
      gap: 0;
      justify-content: center;
    }
    [data-rail-product-glyph],
    [data-rail-product-label],
    [data-rail-label],
    [data-rail-group-heading],
    [data-rail-divider],
    [data-rail-two-line],
    [data-rail-project-name],
    [data-rail-username],
    [data-rail-api-text] {
      display: none !important;
    }

    /* Body padding tightens, all items center on the icon */
    [data-rail-body] {
      padding: 8px 8px;
      gap: 4px;
    }

    /* Center icons in rows */
    [data-rail-row] {
      justify-content: center;
      gap: 0;
      width: 40px;
      margin: 0 auto;
      padding: 0;
    }

    /* Bottom user area: stack avatar above bell, both centered */
    [data-rail-bottom] {
      flex-direction: column;
      gap: 4px;
      padding: 8px 4px 16px;
      align-items: center;
    }
    [data-rail-user-pill] {
      flex: 0 0 auto;
      padding: 0;
      justify-content: center;
    }
    [data-rail-bell] {
      margin-left: 0;
    }

    /* Foundry "Get API Key" pill collapses to a circle */
    [data-rail-api-pill-wrap] {
      padding: 0 8px 8px;
      display: flex;
      justify-content: center;
    }
    [data-rail-api-pill] {
      width: 40px;
      padding: 0;
      justify-content: center;
    }

    /* Project selector row: avatar only, no chevron */
    [data-rail-project-row] {
      justify-content: center;
      padding: 0;
      gap: 0;
      width: 40px;
      margin: 0 auto;
    }
    [data-rail-project-row] > svg {
      display: none;
    }
  }
`

const NavTop = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 16px 12px 12px;
  height: 48px;
  box-sizing: border-box;
  & > span:first-of-type {
    margin-left: 4px;
  }
`

const RailIconBtn = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--cds-icon-primary);
  padding: 0;
  flex-shrink: 0;
  transition: background-color 120ms ease;
  &:hover {
    background: var(--cds-bg-item-hover);
  }
`

const CrusoeBadgeBox = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
`

const ProductLabel = styled.span`
  font-family: var(--cds-font-primary);
  font-size: 14px;
  line-height: 1.21;
  color: var(--cds-text-primary);
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0;
`

const SidebarBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 8px;
  gap: 2px;
  overflow-y: auto;
  min-height: 0;
`

const RailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  height: var(--cds-row-height);
  padding: 0 8px;
  border-radius: var(--cds-radius-md);
  cursor: pointer;
  text-align: left;
  font-family: var(--cds-font-primary);
  font-size: 14px;
  font-weight: 400;
  color: var(--cds-text-primary);
  background: transparent;
  transition: background-color 120ms ease;
  width: 100%;
  flex-shrink: 0;
  box-sizing: border-box;
  & svg {
    color: var(--cds-icon-primary);
    flex-shrink: 0;
  }
  &:hover {
    background: var(--cds-bg-item-hover);
  }
  &[data-active] {
    background: var(--cds-bg-item-active);
  }
  &:focus-visible {
    outline: 2px solid var(--cds-hi-vis);
    outline-offset: -2px;
  }
`

const RailRowLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.21;
`

const RailDivider = styled.div`
  height: 1px;
  background: var(--cds-border);
  margin: 8px 0;
`

const RailGroupHeading = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: var(--cds-text-secondary);
  padding: 12px 8px 4px;
  letter-spacing: 0;
`

const ProjectRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 4px;
  border-radius: var(--cds-radius-md);
  cursor: pointer;
  user-select: none;
  transition: background-color 120ms ease;
  & > svg {
    margin-left: auto;
    flex-shrink: 0;
    color: var(--cds-text-tertiary);
  }
  &:hover {
    background: var(--cds-bg-item-hover);
  }
`

const ProjectAvatar = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: var(--cds-bg-avatar);
  color: var(--cds-text-primary);
  font-size: 13px;
  font-family: var(--cds-font-primary);
  flex-shrink: 0;
`

const ProjectName = styled.span`
  font-size: 14px;
  line-height: 1.21;
  color: var(--cds-text-primary);
  white-space: nowrap;
  font-weight: 400;
`

const ProjectTwoLine = styled.span`
  display: flex;
  flex-direction: column;
  gap: 0;
  line-height: 1.05;
`

const ProjectLabelSmall = styled.span`
  font-size: 11px;
  color: var(--cds-text-secondary);
  font-weight: 400;
  line-height: 1.21;
`

const SidebarBottom = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  padding: 8px 8px 16px;
  flex-shrink: 0;
`

const UserPill = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border-radius: var(--cds-radius-md);
  padding: 4px 6px;
  cursor: pointer;
  color: var(--cds-text-primary);
  flex: 1;
  text-align: left;
  transition: background-color 120ms ease;
  &:hover,
  &[data-open] {
    background: var(--cds-bg-item-hover-strong);
  }
`

const AvatarSquare = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--cds-radius-md);
  background: var(--cds-bg-avatar);
  color: var(--cds-text-primary);
  font-weight: 700;
  font-size: 14px;
  font-family: var(--cds-font-primary);
  flex-shrink: 0;
`

const UserName = styled.span`
  font-size: 14px;
  color: var(--cds-text-primary);
  font-family: var(--cds-font-primary);
  line-height: 1.21;
  white-space: nowrap;
  font-weight: 400;
`

const BellBtn = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border-radius: var(--cds-radius-md);
  cursor: pointer;
  color: var(--cds-icon-primary);
  margin-left: auto;
  flex-shrink: 0;
  transition: background-color 120ms ease;
  &:hover,
  &[data-open] {
    background: var(--cds-bg-item-hover-strong);
  }
`

const FoundryApiKeyWrap = styled.div`
  padding: 0 16px 8px;
`

const GetApiKeyBtn = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--cds-hi-vis);
  border-radius: 999px;
  color: var(--cds-hi-vis);
  font-family: var(--cds-font-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 120ms ease;
  & svg {
    color: var(--cds-hi-vis);
  }
  &:hover {
    background: var(--cds-accent-tint);
  }
`

const MainArea = styled.main`
  position: relative;
  flex: 1;
  overflow: auto;
  padding: 16px 24px;
  background: var(--cds-bg-page);
  border-left: 1px solid var(--cds-border);
  min-width: 0;
`

const MainHeader = styled.header`
  display: flex;
  align-items: center;
  height: 32px;
  padding-left: 4px;
`

const PageTitle = styled.div`
  font-family: var(--cds-font-primary);
  font-size: 16px;
  font-weight: 400;
  color: var(--cds-text-primary);
  margin: 0;
  line-height: 1.4;
`

const TabsRow = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 4px 0;
  border-bottom: 1px solid var(--cds-border);
  position: relative;
`

const TabBtn = styled.div`
  position: relative;
  padding: 8px 12px;
  background: transparent;
  color: var(--cds-text-secondary);
  font-family: var(--cds-font-primary);
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  transition: color 120ms ease, border-color 120ms ease;
  &[data-active] {
    color: var(--cds-text-primary);
    font-weight: 500;
    border-bottom-color: var(--cds-hi-vis);
  }
  &:hover {
    color: var(--cds-text-primary);
  }
`

const ProfilePanelWrap = styled.div`
  position: absolute;
  left: 12px;
  bottom: 56px;
  width: 280px;
  z-index: 100;
  background: var(--cds-bg-panel);
  border: 1px solid var(--cds-border);
  border-radius: var(--cds-radius-lg);
  box-shadow: var(--cds-shadow-panel);
  padding: 8px;
  font-family: var(--cds-font-primary);
  animation: cdsPanelIn 140ms ease;
`

const ProfileMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const ProfileIdentity = styled.div`
  padding: 8px;
`

const ProfileName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--cds-text-primary);
  line-height: 1.3;
`

const ProfileEmail = styled.div`
  font-size: 14px;
  color: var(--cds-text-muted);
  margin-top: 4px;
  line-height: 1.3;
`

const PanelDivider = styled.div`
  height: 1px;
  background: var(--cds-border);
  margin: 4px 0;
`

const ProfileMenuItemBtn = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 36px;
  padding: 0 8px;
  background: transparent;
  color: var(--cds-text-primary);
  font-family: var(--cds-font-primary);
  font-size: 14px;
  border-radius: var(--cds-radius-md);
  cursor: pointer;
  text-align: left;
  transition: background-color 120ms ease;
  & svg {
    color: var(--cds-icon-primary);
  }
  &:hover {
    background: var(--cds-bg-item-hover-strong);
  }
`

const ProfileHealthPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  margin: 4px 8px;
  padding: 4px 8px;
  background: var(--cds-positive-bg);
  border: 1px solid var(--cds-positive-border);
  border-radius: 999px;
  font-size: 12px;
  color: var(--cds-positive);
  & svg {
    color: var(--cds-positive);
  }
  & span {
    font-weight: 500;
  }
`

const ProductTiles = styled.div`
  display: flex;
  gap: 8px;
  padding: 4px 8px;
`

const ProductTileBtn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 8px;
  border-radius: var(--cds-radius-md);
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease;
  font-family: var(--cds-font-primary);
  min-height: 80px;
  background: var(--cds-bg-product-tile);
  border: 1px solid var(--cds-border-subtle);
  color: var(--cds-text-primary);
  & svg {
    color: var(--cds-icon-primary);
  }
  &:hover {
    background: var(--cds-bg-product-tile-hover);
  }
  &[data-active] {
    background: var(--cds-bg-product-tile-active);
    border-color: var(--cds-border);
  }
`

const ProductTileText = styled.span`
  font-size: 13px;
  color: var(--cds-text-primary);
  text-align: center;
  line-height: 1.3;
`

const ThemeToggleWrap = styled.div`
  display: flex;
  gap: 0;
  margin: 4px 8px;
  border-radius: var(--cds-radius-md);
  background: var(--cds-bg-product-tile);
  padding: 2px;
  border: 1px solid var(--cds-border-subtle);
`

const ThemeBtn = styled.div`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--cds-icon-primary);
  transition: background-color 120ms ease;
  & svg {
    color: var(--cds-icon-primary);
  }
  &[data-active] {
    background: var(--cds-bg-avatar);
  }
`

const NotifPanelWrap = styled.div`
  position: absolute;
  left: -1px;
  top: 16px;
  width: 512px;
  max-height: calc(100vh - 64px);
  z-index: 100;
  background: var(--cds-bg-panel);
  border: 1px solid var(--cds-border);
  border-radius: var(--cds-radius-lg);
  box-shadow: var(--cds-shadow-panel);
  font-family: var(--cds-font-primary);
  animation: cdsPanelIn 140ms ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const NotifPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`

const NotifTabs = styled.div`
  position: relative;
  display: flex;
  gap: 0;
  padding: 8px 12px 0;
  border-bottom: 1px solid var(--cds-border);
`

const NotifTabBtn = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  color: var(--cds-text-secondary);
  font-size: 14px;
  font-weight: 400;
  font-family: var(--cds-font-primary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 120ms ease, border-color 120ms ease;
  &[data-active] {
    color: var(--cds-text-primary);
    font-weight: 500;
    border-bottom-color: var(--cds-hi-vis);
  }
  &:hover {
    color: var(--cds-text-primary);
  }
`

const NotifCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  border-radius: 4px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 500;
  background: var(--cds-pill-neutral-bg);
  color: var(--cds-text-primary);
  &[data-tone='positive'][data-active] {
    background: var(--cds-positive-pill-bg);
    color: var(--cds-positive-pill-text);
  }
`

const NotifList = styled.div`
  flex: 1;
  overflow-y: auto;
`

const NotifRow = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--cds-border-subtle);
`

const NotifSeverity = styled.span`
  padding-top: 2px;
  & svg {
    color: var(--cds-positive);
  }
  &[data-tone='critical'] svg {
    color: var(--cds-negative);
  }
  &[data-tone='warning'] svg {
    color: var(--cds-warning);
  }
`

const NotifRowBody = styled.div`
  flex: 1;
  min-width: 0;
`

const NotifRowHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const NotifResource = styled.span`
  color: var(--cds-text-secondary);
  font-size: 13px;
  strong {
    color: var(--cds-text-primary);
    font-weight: 400;
  }
`

const NotifTime = styled.span`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--cds-text-secondary);
  font-size: 12px;
`

const UnreadDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--cds-negative);
  display: inline-block;
`

const NotifTagRow = styled.div`
  margin-top: 6px;
`

const NotifTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: var(--cds-negative-bg);
  color: var(--cds-negative-text);
  &[data-tone='warning'] {
    background: var(--cds-warning-bg);
    color: var(--cds-warning-text);
  }
  &[data-tone='positive'] {
    background: var(--cds-positive-pill-bg);
    color: var(--cds-positive-pill-text);
  }
`

const NotifTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--cds-text-primary);
  margin-top: 8px;
  line-height: 1.3;
`

const NotifBody = styled.div`
  font-size: 13px;
  color: var(--cds-text-secondary);
  margin-top: 4px;
  line-height: 1.4;
`

const NotifAffected = styled.div`
  margin-top: 8px;
  font-size: 13px;
  color: var(--cds-text-secondary);
`

const NotifLink = styled.a`
  color: var(--cds-text-primary);
  text-decoration: underline;
  cursor: pointer;
`

const NotifEvents = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--cds-text-secondary);
  flex-wrap: wrap;
`

const NotifEventPill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: var(--cds-negative-bg);
  color: var(--cds-negative-text);
  &[data-tone='warning'] {
    background: var(--cds-warning-bg);
    color: var(--cds-warning-text);
  }
  &[data-tone='positive'] {
    background: var(--cds-positive-pill-bg);
    color: var(--cds-positive-pill-text);
  }
`

const NotifFooter = styled.div`
  padding: 12px;
  border-top: 1px solid var(--cds-border);
`

const NotifFooterBtn = styled.div`
  width: 100%;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--cds-border);
  border-radius: var(--cds-radius-md);
  color: var(--cds-text-primary);
  font-family: var(--cds-font-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 120ms ease;
  &:hover {
    background: var(--cds-bg-item-hover-strong);
  }
`

const ProjectPanelWrap = styled.div`
  position: absolute;
  /* Anchor to the right edge of the rail so it tracks collapse/expand. */
  left: calc(var(--cds-rail-width) - 12px);
  top: 88px;
  width: 280px;
  z-index: 100;
  background: var(--cds-bg-panel);
  border: 1px solid var(--cds-border);
  border-radius: var(--cds-radius-lg);
  box-shadow: var(--cds-shadow-panel);
  font-family: var(--cds-font-primary);
  animation: cdsPanelIn 140ms ease;
  overflow: hidden;
  &[data-foundry] {
    top: 52px;
  }
  /* When the rail is collapsed the project avatar sits in a different
     vertical slot — pin the panel to the avatar's row. */
  aside[data-collapsed] & {
    left: var(--cds-rail-width);
    top: 92px;
  }
  aside[data-collapsed] &[data-foundry] {
    top: 56px;
  }
`

const ProjectMenu = styled.div`
  display: flex;
  flex-direction: column;
`

const ProjectSearchWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px;
  padding: 0 12px;
  height: 40px;
  background: var(--cds-bg-panel-elevated);
  border: 1px solid var(--cds-border);
  border-radius: var(--cds-radius-md);
  & svg {
    color: var(--cds-text-tertiary);
    flex-shrink: 0;
  }
`

const ProjectSearchField = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--cds-text-primary);
  font-family: var(--cds-font-primary);
  font-size: 14px;
  &::placeholder {
    color: var(--cds-text-tertiary);
  }
`

const ProjectOptions = styled.div`
  padding: 4px 0;
  display: flex;
  flex-direction: column;
`

const ProjectOption = styled.div`
  display: flex;
  align-items: center;
  width: calc(100% - 16px);
  margin: 0 8px;
  height: 36px;
  padding: 0 12px;
  background: transparent;
  border-radius: var(--cds-radius-md);
  color: var(--cds-text-primary);
  font-family: var(--cds-font-primary);
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  cursor: pointer;
  transition: background-color 120ms ease;
  &:hover {
    background: var(--cds-bg-item-hover-strong);
  }
  &[data-active] {
    background: var(--cds-bg-avatar);
  }
`

const ProjectManageBtn = styled.div`
  display: flex;
  align-items: center;
  width: calc(100% - 16px);
  margin: 4px 8px 8px;
  height: 36px;
  padding: 0 12px;
  background: transparent;
  border-radius: var(--cds-radius-md);
  color: var(--cds-text-primary);
  font-family: var(--cds-font-primary);
  font-size: 14px;
  cursor: pointer;
  transition: background-color 120ms ease;
  & svg {
    margin-left: auto;
    color: var(--cds-text-secondary);
  }
  &:hover {
    background: var(--cds-bg-item-hover-strong);
  }
`
