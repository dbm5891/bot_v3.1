import React from 'react';
import { LucideProps } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

// Example: import { Home, BarChart, Settings } from 'lucide-react';
// Add more Lucide icons as needed
import * as LucideIcons from 'lucide-react';

export interface AppIconProps extends LucideProps {
  name: keyof typeof LucideIcons;
  color?: string;
  size?: number | string;
  title?: string;
  'aria-label'?: string;
}

const AppIcon = React.forwardRef<SVGSVGElement, AppIconProps>(
  ({ name, color, size = 22, title, 'aria-label': ariaLabel, ...rest }, ref) => {
    const theme = useTheme();
    const LucideIcon = LucideIcons[name] as React.FC<LucideProps>;
    if (!LucideIcon) return null;
    return (
      <LucideIcon
        ref={ref}
        color={color || theme.palette.text.primary}
        size={size}
        aria-label={ariaLabel || title || name}
        {...rest}
      >
        {title && <title>{title}</title>}
      </LucideIcon>
    );
  }
);

AppIcon.displayName = 'AppIcon';

export default AppIcon; 