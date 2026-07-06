import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const PlanTripPage = lazy(() => import('./pages/PlanTripPage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const DestinationDetailPage = lazy(() => import('./pages/DestinationDetailPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SharedTripPage = lazy(() => import('./pages/SharedTripPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      <span className="text-sm text-slate-500">Loading...</span>
    </div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/plan" element={<PlanTripPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/destination/:id" element={<DestinationDetailPage />} />
            <Route path="/shared/:shareId" element={<SharedTripPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
