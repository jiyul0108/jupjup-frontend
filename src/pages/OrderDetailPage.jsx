import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getOrder } from '../api'
import Header from '../components/Header'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrder(id)
      .then((res) => setOrder(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen" style={{ background: '#F1EFE8' }}>
      <Header />
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#3DDC97] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (!order) return null

  return (
    <div className="min-h-screen" style={{ background: '#F1EFE8' }}>
      <Header />
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* 완료 헤더 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-3" style={{ background: '#E1F5EE' }}>
            🎉
          </div>
          <h1 className="text-xl font-bold text-gray-900">주문이 완료되었습니다!</h1>
          <p className="text-sm text-gray-400 mt-1">주문번호 #{order.id}</p>
        </div>

        {/* 상품 정보 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="text-sm font-bold text-gray-500 mb-3">주문 상품</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-gray-900">{order.productTitle}</p>
              <p className="text-xs text-gray-400 mt-0.5">판매자: {order.sellerNickname}</p>
            </div>
            <p className="text-lg font-bold" style={{ color: '#0F6E56' }}>
              {order.productPrice.toLocaleString()}원
            </p>
          </div>
        </div>

        {/* 주문 정보 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="text-sm font-bold text-gray-500 mb-3">주문 정보</h2>
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">구매자</span>
              <span className="text-sm font-medium text-gray-900">{order.buyerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">연락처</span>
              <span className="text-sm font-medium text-gray-900">{order.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">배송지</span>
              <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{order.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">결제 방법</span>
              <span className="text-sm font-medium text-gray-900">{order.paymentMethod}</span>
            </div>
            {order.request && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">요청사항</span>
                <span className="text-sm font-medium text-gray-900 text-right max-w-xs">{order.request}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-500">주문일시</span>
              <span className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Link
            to="/"
            className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 text-center hover:bg-gray-50"
          >
            홈으로
          </Link>
          <Link
            to="/chat"
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white text-center"
            style={{ background: '#1D9E75' }}
          >
            채팅으로 연락하기
          </Link>
        </div>
      </div>
    </div>
  )
}
