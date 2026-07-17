import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './constants/routes';
import { PrivateRoute } from './components/guards/PrivateRoute';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import OnboardingPage from './pages/Onboarding/OnboardingPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ScanPage from './pages/Scan/ScanPage';
import ReceiptsPage from './pages/Receipts/ReceiptsPage';
import ExpensesPage from './pages/Expenses/ExpensesPage';
import BudgetPage from './pages/Budget/BudgetPage';
import SubsPage from './pages/Subscriptions/SubsPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import SettingsPage from './pages/Settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes (public) */}
        <Route path={ROUTES.AUTH} element={<LoginPage />} />
        <Route path={ROUTES.AUTH_REGISTER} element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          {/* Onboarding — full screen, no bottom nav */}
          <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
          <Route element={<AppLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.EXPENSES} element={<ExpensesPage />} />
            <Route path={ROUTES.SCAN} element={<ScanPage />} />
            <Route path={ROUTES.RECEIPTS} element={<ReceiptsPage />} />
            <Route path={ROUTES.BUDGET} element={<BudgetPage />} />
            <Route path={ROUTES.SUBSCRIPTIONS} element={<SubsPage />} />
            <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
            <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
