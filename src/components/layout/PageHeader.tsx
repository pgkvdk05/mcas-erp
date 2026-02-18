"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}) => {
  return (
    <div className={cn("space-y-2 mb-6", className)}>
      <h2 className={cn("text-3xl font-bold text-primary", titleClassName)}>
        {title}
      </h2>
      {description && (
        <p className={cn("text-muted-foreground text-lg", descriptionClassName)}>
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;