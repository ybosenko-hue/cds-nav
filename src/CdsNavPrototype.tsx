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
} from '@carbon/icons-react'

/* ──────────────────────────────────────────────────────────────────────
 *  Design tokens (CSS custom properties so they read like the rest of the
 *  design system). Sourced from Figma variables on node 19577-131.
 * ────────────────────────────────────────────────────────────────────── */
const tokens = css`
  :root {
    --cds-font-primary: 'Suisse Intl', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --cds-font-mono: 'ABC Diatype Mono', 'SF Mono', 'Monaco', 'Consolas', monospace;

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

    --cds-border: #343a40;
    --cds-border-subtle: #1f2326;

    --cds-text-primary: #ffffff;
    --cds-text-secondary: #adb5bd;
    --cds-text-tertiary: #868e96;
    --cds-text-muted: #565859;

    --cds-icon-primary: #f8f9fa;
    --cds-icon-secondary: #ced4da;

    --cds-hi-vis: #ceeb13;
    --cds-positive: #acc695;
    --cds-positive-bg: #242a1f;
    --cds-positive-border: #607c48;
    --cds-positive-pill-bg: #323c2a;
    --cds-positive-pill-text: #d6e9c4;
    --cds-negative: #e86958;
    --cds-negative-bg: #680c00;
    --cds-negative-text: #f3b4ab;
    --cds-warning-bg: #5a4800;
    --cds-warning-text: #ffeea9;
    --cds-pill-neutral-bg: #343a40;

    --cds-rail-width: 212px;
    --cds-row-height: 32px;
    --cds-radius-md: 8px;
    --cds-radius-lg: 12px;
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
  const [product, setProduct] = useState<Product>('cloud')
  const [cloudActive, setCloudActive] = useState<NavId>('command-center')
  const [foundryActive, setFoundryActive] = useState<NavId>('model-hub')
  const [adminActive, setAdminActive] = useState<NavId>('usage')
  const [prevProduct, setPrevProduct] = useState<Exclude<Product, 'admin'>>('cloud')

  const [overlay, setOverlay] = useState<null | 'profile' | 'notifications' | 'projects'>(null)
  const [project, setProject] = useState<Project>('Staging')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

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
    return null
  }, [isAdmin, isFoundry, adminActive, foundryActive])

  const [tabActive, setTabActive] = useState(0)
  useEffect(() => {
    setTabActive(0)
  }, [pageTitle])

  const openAdmin = () => {
    if (product !== 'admin') setPrevProduct(product)
    setProduct('admin')
    setOverlay(null)
  }
  const backToApp = () => {
    setProduct(prevProduct)
    setOverlay(null)
  }
  const switchToCloud = () => {
    setProduct('cloud')
    setOverlay(null)
  }
  const switchToFoundry = () => {
    setProduct('foundry')
    setOverlay(null)
  }

  return (
    <Shell>
      <Global styles={tokens} />
      <Sidebar>
        <NavTop>
          <RailIconBtn aria-label="Collapse navigation" role="button" tabIndex={0}>
            <OpenPanelLeft size={16} />
          </RailIconBtn>
          <CrusoeBadge product={isAdmin ? 'cloud' : (product as 'cloud' | 'foundry')} />
          <ProductLabel>
            {isAdmin
              ? 'Infrastructure Cloud'
              : isFoundry
                ? 'Intelligence Foundry'
                : 'Infrastructure Cloud'}
          </ProductLabel>
        </NavTop>

        <SidebarBody>
          {isAdmin ? (
            <AdminNav activeId={adminActive} onSelect={setAdminActive} onBack={backToApp} />
          ) : isFoundry ? (
            <FoundryNav
              activeId={foundryActive}
              onSelect={setFoundryActive}
              project={project}
              onProjectClick={() => setOverlay(overlay === 'projects' ? null : 'projects')}
              projectBtnRef={projectBtnRef}
              onAdminClick={openAdmin}
            />
          ) : (
            <CloudNav
              activeId={cloudActive}
              onSelect={setCloudActive}
              project={project}
              onProjectClick={() => setOverlay(overlay === 'projects' ? null : 'projects')}
              projectBtnRef={projectBtnRef}
              onAdminClick={openAdmin}
            />
          )}
        </SidebarBody>

        {isFoundry && (
          <FoundryApiKeyWrap>
            <GetApiKeyBtn role="button" tabIndex={0}>
              <Password size={16} />
              <span>Get API Key</span>
            </GetApiKeyBtn>
          </FoundryApiKeyWrap>
        )}

        <SidebarBottom>
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
          >
            <AvatarSquare>J</AvatarSquare>
            <UserName>John Doe</UserName>
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
      <RailDivider />
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
      <RailDivider />
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
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={16} />
      <RailRowLabel>{label}</RailRowLabel>
    </RailRow>
  )
}

function GroupHeading({ children }: { children: ReactNode }) {
  return <RailGroupHeading>{children}</RailGroupHeading>
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
    >
      <ProjectAvatar>{project[0]}</ProjectAvatar>
      {twoLine ? (
        <ProjectTwoLine>
          <ProjectLabelSmall>Project</ProjectLabelSmall>
          <ProjectName>{project}</ProjectName>
        </ProjectTwoLine>
      ) : (
        <ProjectName>{project}</ProjectName>
      )}
      <ChevronSort size={16} />
    </ProjectRow>
  )
})

function CrusoeBadge({ product }: { product: 'cloud' | 'foundry' }) {
  return (
    <CrusoeBadgeBox>
      <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1.3l5.8 3.35v6.7L8 14.7 2.2 11.35v-6.7L8 1.3z"
          stroke="#cdcdcd"
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        <circle cx="8" cy="8" r="1.6" fill={product === 'foundry' ? 'var(--cds-hi-vis)' : '#cdcdcd'} />
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
    background: rgba(206, 235, 19, 0.08);
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
  font-size: 18px;
  font-weight: 700;
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
  box-shadow: 0px 2px 24px 0px rgba(0, 0, 0, 0.5);
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
  box-shadow: 0px 2px 24px 0px rgba(0, 0, 0, 0.5);
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
    color: #d3a13b;
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
  left: 200px;
  top: 88px;
  width: 400px;
  z-index: 100;
  background: var(--cds-bg-panel);
  border: 1px solid var(--cds-border);
  border-radius: var(--cds-radius-lg);
  box-shadow: 0px 2px 24px 0px rgba(0, 0, 0, 0.5);
  font-family: var(--cds-font-primary);
  animation: cdsPanelIn 140ms ease;
  overflow: hidden;
  &[data-foundry] {
    top: 52px;
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
