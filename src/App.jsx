import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import MainPage from './pages/MainPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductFormPage from './pages/ProductFormPage'
import { ChatListPage, ChatRoomPage } from './pages/ChatPage'
import WishListPage from './pages/WishListPage'
import PurchasePage from './pages/PurchasePage'
import OrderDetailPage from './pages/OrderDetailPage'
import MyPage from './pages/MyPage'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<MainPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/products/new" element={<PrivateRoute><ProductFormPage /></PrivateRoute>} />
      <Route path="/products/:id/edit" element={<PrivateRoute><ProductFormPage /></PrivateRoute>} />
      <Route path="/products/:id/purchase" element={<PrivateRoute><PurchasePage /></PrivateRoute>} />
      <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
      <Route path="/chat" element={<PrivateRoute><ChatListPage /></PrivateRoute>} />
      <Route path="/chat/:roomId" element={<PrivateRoute><ChatRoomPage /></PrivateRoute>} />
      <Route path="/wishes" element={<PrivateRoute><WishListPage /></PrivateRoute>} />
      <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}