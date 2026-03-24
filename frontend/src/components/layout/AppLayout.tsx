import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const AppLayout = () => {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Mesh Gradient Background (Premium Look) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] size-[40%] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] size-[40%] rounded-full bg-chart-1/20 blur-[100px]" />
      </div>

      <main className="pb-20 pt-safe transition-all duration-300">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};
