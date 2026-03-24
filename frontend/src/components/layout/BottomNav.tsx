import { NavLink } from 'react-router-dom';
import { 
  BarChart3Icon, 
  LayoutDashboardIcon, 
  ReceiptIcon, 
  ScanIcon, 
  TargetIcon 
} from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../lib/utils';

export const BottomNav = () => {
  const navItems = [
    { icon: LayoutDashboardIcon, label: 'Главная', path: ROUTES.DASHBOARD },
    { icon: ReceiptIcon, label: 'Траты', path: ROUTES.EXPENSES },
    { icon: ScanIcon, label: 'Скан', path: ROUTES.SCAN, primary: true },
    { icon: TargetIcon, label: 'Бюджет', path: ROUTES.BUDGET },
    { icon: BarChart3Icon, label: 'Аналитика', path: ROUTES.ANALYTICS },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-border bg-background/80 px-4 pb-safe backdrop-blur-xl transition-all duration-300">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "group relative flex flex-col items-center justify-center gap-1 transition-all duration-200",
              item.primary ? "scale-110" : "flex-1",
              isActive && !item.primary ? "text-primary" : "text-muted-foreground",
              isActive && item.primary ? "text-primary" : ""
            )
          }
        >
          {item.primary ? (
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-90">
              <item.icon size={28} />
            </div>
          ) : (
            <>
              <item.icon size={22} className="transition-transform group-active:scale-90" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
              <div className={cn(
                "absolute -bottom-2 size-1 rounded-full bg-primary opacity-0 transition-opacity",
                "group-[.active]:opacity-100"
              )} />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
