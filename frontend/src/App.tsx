import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import Admin from './pages/Admin';
import Assistant from './pages/Assistant';
import { ForgotPasswordPage, LoginPage, RegisterPage } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Journey from './pages/Journey';
import Navigator from './pages/Navigator';
import Onboarding from './pages/Onboarding';
import { DirectoryPage, ResourcesPage } from './pages/Resources';
import { NotFoundPage, PrivacyPage } from './pages/Static';
import Understand from './pages/Understand';
import { RequireAuth, RequireSession } from './routes/guards';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="understand" element={<Understand />} />
        <Route path="journey" element={<Journey />} />
        <Route path="navigator" element={<Navigator />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="directory" element={<DirectoryPage />} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="onboarding" element={<RequireSession><Onboarding /></RequireSession>} />
        <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="admin" element={<RequireAuth role="admin"><Admin /></RequireAuth>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
