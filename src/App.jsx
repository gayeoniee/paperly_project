import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MakerLayout from './layouts/MakerLayout';
import DesignerLayout from './layouts/DesignerLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';

// Maker Pages
import MakerDashboard from './pages/maker/Dashboard';
import QuoteCreate from './pages/maker/QuoteCreate';
import MakerOrders from './pages/maker/Orders';
import MakerChat from './pages/maker/Chat';
import MakerFiles from './pages/maker/Files';
import MakerOutsourcing from './pages/maker/Outsourcing';

// Designer Pages
import DesignerHome from './pages/designer/Home';
import AIChat from './pages/designer/AIChat';
import DesignerQuotes from './pages/designer/Quotes';
import DesignerChat from './pages/designer/Chat';
import DesignerOrders from './pages/designer/Orders';
import DesignerOutsourcing from './pages/designer/Outsourcing';

export default function App() {
  return (
    <Routes>
      {/* 메인 홈 - 포트폴리오 (반응형) */}
      <Route path="/" element={<Home />} />

      {/* 로그인 - 역할 선택 */}
      <Route path="/login" element={<Login />} />

      {/* Maker (인쇄소 사장님) Routes */}
      <Route path="/maker" element={<MakerLayout />}>
        <Route index element={<Navigate to="/maker/dashboard" replace />} />
        <Route path="dashboard" element={<MakerDashboard />} />
        <Route path="quote/new" element={<QuoteCreate />} />
        <Route path="orders" element={<MakerOrders />} />
        <Route path="chat" element={<MakerChat />} />
        <Route path="files" element={<MakerFiles />} />
        <Route path="outsourcing" element={<MakerOutsourcing />} />
      </Route>

      {/* Designer (사용자) Routes */}
      <Route path="/designer" element={<DesignerLayout />}>
        <Route index element={<Navigate to="/designer/home" replace />} />
        <Route path="home" element={<DesignerHome />} />
        <Route path="ai-chat" element={<AIChat />} />
        <Route path="quotes" element={<DesignerQuotes />} />
        <Route path="chat" element={<DesignerChat />} />
        <Route path="orders" element={<DesignerOrders />} />
        <Route path="outsourcing" element={<DesignerOutsourcing />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
