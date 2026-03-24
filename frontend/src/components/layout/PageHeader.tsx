import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  showBack = false, 
  rightAction,
  className 
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className={cn(
      "sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/50 bg-background/60 px-4 pt-safe backdrop-blur-md",
      className
    )}>
      <div className="flex items-center gap-3">
        {showBack && (
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeftIcon size={20} />
          </Button>
        )}
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </header>
  );
};
