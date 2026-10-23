import React from 'react';
import * as LucideIcons from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  color?: string;
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  color,
  size = 20,
  className = '',
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Tag;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl shrink-0 ${className}`}
      style={color ? { backgroundColor: `${color}18`, color: color } : undefined}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
};
