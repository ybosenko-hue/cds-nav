/**
 * Test View page — a Linear-style hierarchy tree.
 *
 * Recreates the "Test View → Test Milestone" section from the reference
 * screenshot, using the exact tokens read from the inspector:
 *   - font: Inter Variable / SF Pro Display stack, 16px / 400 / 24px line-height
 *   - text: lch(9.894 0 282) ≈ #1a1a1a (near-black)
 *   - connector: lch(86.5 0 282) ≈ #d6d6d6, 1px, border-box, ~0.5px radius
 * A parent row (cube icon) with one nested child (amber milestone diamond)
 * joined by a rounded elbow connector.
 */
import styled from '@emotion/styled'

const FONT_STACK =
  '"Inter Variable", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'

const TEXT = '#1a1a1a' // lch(9.894 0 282)
const LINE = '#d6d6d6' // lch(86.5 0 282)
const VIEW_ICON = '#9499a0'
const MILESTONE_STROKE = '#e0b13c'
const MILESTONE_FILL = '#fbe6c2'

/* ── Icons ───────────────────────────────────────────────────────────── */
function CubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.6 13.5 4.7v6.6L8 14.4 2.5 11.3V4.7L8 1.6Z"
        stroke={VIEW_ICON}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M2.6 4.8 8 7.9l5.4-3.1M8 7.9v6.4"
        stroke={VIEW_ICON}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MilestoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2.4 13.6 8 8 13.6 2.4 8 8 2.4Z"
        stroke={MILESTONE_STROKE}
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill={MILESTONE_FILL}
      />
    </svg>
  )
}

/* ── Page ────────────────────────────────────────────────────────────── */
export default function TestViewPage() {
  return (
    <Page>
      <Tree>
        <Row>
          <IconSlot>
            <CubeIcon />
          </IconSlot>
          <Label>Test View</Label>
        </Row>

        <Child>
          <Connector aria-hidden="true" />
          <Row>
            <IconSlot>
              <MilestoneIcon />
            </IconSlot>
            <Label>Test Milestone</Label>
          </Row>
        </Child>
      </Tree>
    </Page>
  )
}

/* ── Styles ──────────────────────────────────────────────────────────── */
const Page = styled.div`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  position: fixed;
  inset: 0;
  background: #ffffff;
  font-family: ${FONT_STACK};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 48px;
`

const Tree = styled.div`
  display: flex;
  flex-direction: column;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
`

const IconSlot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`

const Label = styled.span`
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: ${TEXT};
  white-space: nowrap;
`

/* Child wrapper indents the row and hosts the absolute elbow connector. */
const Child = styled.div`
  position: relative;
  padding-left: 20px;
`

/* Rounded elbow: vertical drop from the parent icon's centre, curving
   right to meet the child icon. 1px light-gray line, border-box. */
const Connector = styled.div`
  position: absolute;
  left: 7px;
  top: -12px;
  width: 13px;
  height: 24px;
  border-left: 1px solid ${LINE};
  border-bottom: 1px solid ${LINE};
  border-bottom-left-radius: 8px;
  pointer-events: none;
`
