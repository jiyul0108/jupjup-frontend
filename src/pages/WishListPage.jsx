import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getWishes } from '../api'
import Header from '../components/Header'

const STATUS_LABEL = {
  FOR_SALE: { text: '판매중', color: '#0F6E56' },
  RESERVED: { text: '예약중', color: '#92400E' },
  SOLD: { text: '거래완료', color: '#6B7280' },
}

export default function WishListPage() {
  const [wishes, setWishes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWishes()
      .then((res) => setWishes(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#F1EFE8' }}>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-lg font-bold text-gray-900 mb-4">
          찜한 상품 <span style={{ color: '#3DDC97' }}>{wishes.length}</span>
        </h1>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#3DDC97] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : wishes.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-3">❤️</p>
            <p className="text-sm">찜한 상품이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {wishes.map((wish) => {
              const status = STATUS_LABEL[wish.productStatus] || STATUS_LABEL.FOR_SALE
              return (
                <Link key={wish.id} to={`/products/${wish.productId}`} className="group block">
                  <div className="rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow p-3">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{wish.productTitle}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: '#0F6E56' }}>
                      {wish.productPrice.toLocaleString()}원
                    </p>
                    <p className="text-xs mt-1" style={{ color: status.color }}>{status.text}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}