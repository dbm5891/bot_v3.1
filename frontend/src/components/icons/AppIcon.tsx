import React from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

// Example: import { Home, BarChart, Settings } from 'lucide-react';
// Add more Lucide icons as needed

type LucideProps = React.ComponentProps<'svg'> & { size?: number | string };

interface AppIconProps extends Omit<LucideProps, 'color'> {
  name: keyof typeof LucideIcons;
  color?: string;
  title?: string;
  'aria-label'?: string;
}

const AppIcon = React.forwardRef<SVGSVGElement, AppIconProps>(
  ({ name, color, size = 22, title, className, 'aria-label': ariaLabel, ...rest }, ref) => {
    const LucideIcon = LucideIcons[name] as React.FC<LucideProps>;
    if (!LucideIcon) return null;
    
    return (
      <LucideIcon
        ref={ref}
        className={cn('text-foreground', className)}
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