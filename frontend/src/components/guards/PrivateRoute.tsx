import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { Spinner } from '../ui/spinner';

export const PrivateRoute = () => {
  const { session, isLoading } = useAuth()

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

  return <Outlet />
}
