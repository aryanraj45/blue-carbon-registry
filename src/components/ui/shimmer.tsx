import React from 'react';
import { cn } from '@/lib/utils';

interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

const Shimmer: React.FC<ShimmerProps> = ({ className, children }) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  );
};

interface ShimmerSkeletonProps {
  className?: string;
}

const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({ className }) => {
  return (
    <div className={cn("bg-muted rounded animate-shimmer", className)} />
  );
};

export { Shimmer, ShimmerSkeleton };