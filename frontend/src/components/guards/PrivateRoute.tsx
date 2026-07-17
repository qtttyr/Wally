import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { Spinner } from '../ui/spinner';

export const PrivateRoute = () => {
  const { user, session, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to={ROUTES.AUTH} replace />
  }

  // Redirect new users to onboarding if they haven't set a monthly budget yet
  // monthly_budget === 0 means it's the default (unset) value from the DB
  const needsOnboarding = user && (user.monthly_budget === undefined || user.monthly_budget === 0)

  if (needsOnboarding && location.pathname !== ROUTES.ONBOARDING) {
    return <Navigate to={ROUTES.ONBOARDING} replace />
  }

  return <Outlet />
}
