import { THEME } from '../lib/constants';

interface PanelTitleProps {
  children: React.ReactNode;
  className?: string;
}

export default function PanelTitle({ children, className = '' }: PanelTitleProps) {
  return (
    <p
      className={`${THEME.PANEL_TITLE.fontSize} ${THEME.PANEL_TITLE.fontWeight} ${THEME.PANEL_TITLE.textTransform} ${THEME.PANEL_TITLE.letterSpacing} ${className}`}
      style={{ color: THEME.COLORS.TAIKO_PINK }}
    >
      {children}
    </p>
  );
}
