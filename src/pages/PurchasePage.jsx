import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct, createOrder } from '../api'
import Header from '../components/Header'

const PAYMENT_METHODS = ['직거래', '계좌이체', '카카오페이', '네이버페이']

export default function PurchasePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    buyerName: '',
    phone: '',
    address: '',
    paymentMethod: '직거래',
    request: '',
  })

  useEffect(() => {
    getProduct(id)
      .then((res) => setProduct(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await createOrder({ ...form, productId: Number(id) })
      navigate(`/orders/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || '주문에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen" style={{ background: '#F1EFE8' }}>
      <Header />
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#3DDC97] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (!product) return null

  return (
    <div className="min-h-screen" style={{ background: '#F1EFE8' }}>
      <Header />
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* 상품 요약 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex gap-4 items-center">
          {product.imageUrls?.[0] ? (
            <img src={product.imageUrls[0]} className="w-20 h-20 object-cover rounded-xl" />
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">📦</div>
          )}
          <div className="flex-1">
            <p className="text-xs text-gray-400">{product.category}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{product.title}</p>
            <p className="text-lg font-bold mt-1" style={{ color: '#0F6E56' }}>
              {product.price.toLocaleString()}원
            </p>
            <p className="text-xs text-gray-400 mt-0.5">판매자: {product.sellerNickname}</p>
          </div>
        </div>

        {/* 주문 폼 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-6">주문 정보 입력</h1>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">구매자 이름</label>
              <input
                type="text"
                value={form.buyerName}
                onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                placeholder="이름을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                placeholder="010-0000-0000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">배송지 주소</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                placeholder="예) 서울시 강남구 역삼동 123-45"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">결제 방법</label>
              <div className="flex gap-2 flex-wrap">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setForm({ ...form, paymentMethod: method })}
                    className="px-4 py-2 rounded-full text-sm font-medium border transition-colors"
                    style={
                      form.paymentMethod === method
                        ? { background: '#1D9E75', color: 'white', borderColor: '#1D9E75' }
                        : { background: 'white', color: '#374151', borderColor: '#E5E7EB' }
                    }
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">요청사항 (선택)</label>
              <textarea
                value={form.request}
                onChange={(e) => setForm({ ...form, request: e.target.value })}
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97] resize-none"
                placeholder="판매자에게 전달할 요청사항을 입력하세요"
              />
            </div>

            {/* 최종 결제 금액 */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">결제 금액</span>
                <span className="text-xl font-bold" style={{ color: '#0F6E56' }}>
                  {product.price.toLocaleString()}원
                </span>
              </div>

              {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: '#1D9E75' }}
                >
                  {submitting ? '주문 중...' : '구매하기'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
