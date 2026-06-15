import { Link } from 'react-router-dom'
import { getImageUrl } from '../api'

const STATUS_LABEL = {
  SELLING: { text: '판매중', bg: '#E1F5EE', color: '#0F6E56' },
  RESERVED: { text: '예약중', bg: '#FEF3C7', color: '#92400E' },
  SOLD: { text: '거래완료', bg: '#F3F4F6', color: '#6B7280' },
}

export default function ProductCard({ product }) {
  const status = STATUS_LABEL[product.status] || STATUS_LABEL.FOR_SALE
  const imageUrl = getImageUrl(product.imageUrls?.[0])

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow duration-200">
        {/* 이미지 */}
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
              📦
            </div>
          )}
        </div>

        {/* 정보 */}
        {/* 정보 */}
        <div className="p-3">
          <span
            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1"
            style={{ background: status.bg, color: status.color }}
          >
            {status.text}
          </span>
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {product.title}
          </p>
          <p className="text-sm font-bold mt-1" style={{ color: '#0F6E56' }}>
            {product.price.toLocaleString()}원
          </p>
          <p className="text-xs text-gray-400 mt-1">{product.location}</p>
        </div>
      </div>
    </Link>
  )
}