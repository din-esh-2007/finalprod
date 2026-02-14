import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import TaskList from './pages/employee/TaskList';
import Meetings from './pages/employee/Meetings';
import Mindfulness from './pages/employee/Mindfulness';
import CognitiveInsights from './pages/employee/CognitiveInsights';
import WellnessReports from './pages/employee/WellnessReports';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import EmployeeAnalytics from './pages/manager/EmployeeAnalytics';
import TaskReviews from './pages/manager/TaskReviews';
import AssignWork from './pages/manager/AssignWork';
import StabilityMapPage from './pages/manager/StabilityMapPage';
import RiskAlerts from './pages/manager/RiskAlerts';
import WorkloadBalancer from './pages/manager/WorkloadBalancer';
import TeamInsights from './pages/manager/TeamInsights';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateUser from './pages/admin/CreateUser';
import WorkersTable from './pages/admin/WorkersTable';
import WorkerReport from './pages/admin/WorkerReport';
import OrgIntelligencePage from './pages/admin/OrgIntelligencePage';
import PolicySimulator from './pages/admin/PolicySimulator';
import CrisisConsole from './pages/admin/CrisisConsole';
import AuditCenter from './pages/admin/AuditCenter';
import AssignToManager from './pages/admin/AssignToManager';
import Complaints from './pages/admin/Complaints';
import CalendarView from './components/CalendarView';

// AI/ML Pages
import FocusForecast from './pages/employee/FocusForecast';
import NeuroRecovery from './pages/employee/NeuroRecovery';
import RetentionPredictor from './pages/manager/RetentionPredictor';
import TeamSentiment from './pages/manager/TeamSentiment';
import EconomicImpact from './pages/admin/EconomicImpact';
import ConsolidatedAIReport from './pages/admin/ConsolidatedAIReport';
import UniversalAIPage from './pages/ai/UniversalAIPage';

function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to={`/${user?.role?.toLowerCase()}`} replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={`/${user?.role?.toLowerCase()}`} replace /> : <Login />
      } />

      {/* Employee Routes */}
      <Route path="/employee" element={
        <ProtectedRoute roles={['EMPLOYEE']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<EmployeeDashboard />} />
        <Route path="tasks" element={<TaskList />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="mindfulness" element={<Mindfulness />} />
        <Route path="insights" element={<CognitiveInsights />} />
        <Route path="reports" element={<WellnessReports />} />
        <Route path="focus-prediction" element={<FocusForecast />} />
        <Route path="neuro-recovery" element={<NeuroRecovery />} />
        <Route path="stability-comparison" element={<UniversalAIPage />} />
        <Route path="habit-ai" element={<UniversalAIPage />} />
        <Route path="calendar" element={<CalendarView apiPrefix="/employee" />} />
      </Route>

      {/* Manager Routes */}
      <Route path="/manager" element={
        <ProtectedRoute roles={['MANAGER']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<ManagerDashboard />} />
        <Route path="analytics/:id" element={<EmployeeAnalytics />} />
        <Route path="submissions" element={<TaskReviews />} />
        <Route path="assign-task" element={<AssignWork />} />
        <Route path="stability" element={<StabilityMapPage />} />
        <Route path="retention-risk" element={<RetentionPredictor />} />
        <Route path="team-sentiment" element={<TeamSentiment />} />
        <Route path="future-load" element={<UniversalAIPage />} />
        <Route path="intensity-heatmap" element={<UniversalAIPage />} />
        <Route path="risk-alerts" element={<RiskAlerts />} />
        <Route path="balancer" element={<WorkloadBalancer />} />
        <Route path="team-insights" element={<TeamInsights />} />
        <Route path="calendar" element={<CalendarView apiPrefix="/manager" />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['ADMIN']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="economic-impact" element={<EconomicImpact />} />
        <Route path="strategic-intelligence" element={<ConsolidatedAIReport />} />
        <Route path="create-user" element={<CreateUser />} />
        <Route path="org-intelligence" element={<OrgIntelligencePage />} />
        <Route path="policy-sim" element={<PolicySimulator />} />
        <Route path="crisis-console" element={<CrisisConsole />} />
        <Route path="audit" element={<AuditCenter />} />
        <Route path="workers" element={<WorkersTable />} />
        <Route path="report/:id" element={<WorkerReport />} />
        <Route path="assign-manager" element={<AssignToManager />} />
        <Route path="complaints" element={<Complaints />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to={`/${user?.role?.toLowerCase()}`} replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
