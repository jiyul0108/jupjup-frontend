import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct, deleteProduct, updateProductStatus, toggleWish, createChatRoom, createReport, getImageUrl } from '../api'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'

const STATUS_OPTIONS = [
  { value: 'SELLING', label: '판매중' },
  { value: 'RESERVED', label: '예약중' },
  { value: 'SOLD', label: '거래완료' },
]

function ImageViewer({ images }) {
  const [current, setCurrent] = useState(0)
  const [expanded, setExpanded] = useState(false)

  if (!images || images.length === 0)
    return (
      <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-300 text-6xl">📦</div>
    )

  const resolvedImages = images.map(getImageUrl)

  return (
    <div>
      {/* 메인 이미지 */}
      <div
        className="aspect-video bg-gray-100 relative cursor-zoom-in"
        onClick={() => setExpanded(true)}
      >
        <img src={resolvedImages[current]} alt="상품" className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
          {current + 1} / {images.length}
        </div>
      </div>

      {/* 썸네일 */}
      {images.length > 1 && (
        <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto">
          {images.map((url, i) => (
            <button
            key={i}
            onClick={() => setCurrent(i)}
            className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
            style={{ borderColor: i === current ? '#3DDC97' : 'transparent' }}
            >
            <img src={resolvedImages[i]} alt={`썸네일 ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* 확대 모달 */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setExpanded(false)}
        >
          <img
            src={resolvedImages[current]}
            alt="확대"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={() => setExpanded(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    getProduct(id)
      .then((res) => setProduct(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('상품을 삭제할까요?')) return
    await deleteProduct(id)
    navigate('/')
  }

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value
    if (!confirm(`거래 상태를 "${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}"로 변경하겠습니까?`)) return
    const res = await updateProductStatus(id, newStatus)
    setProduct(res.data)
  }

  const handleWish = async () => {
    const res = await toggleWish(id)
    alert(res.data)
  }

  const handleChat = async () => {
    const res = await createChatRoom(Number(id))
    navigate(`/chat/${res.data.id}`)
  }

  const handleReport = async () => {
    if (!reportReason.trim()) { alert('신고 사유를 입력해주세요.'); return }
    setReportLoading(true)
    try {
      await createReport({ productId: Number(id), reason: reportReason })
      alert('신고가 접수되었습니다.')
      setShowReportModal(false)
      setReportReason('')
    } catch (e) {
      alert(e.response?.data?.message || '신고 접수에 실패했습니다.')
    } finally {
      setReportLoading(false)
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
  const isMine = user?.nickname === product.sellerNickname

  return (
    <>
      <div className="min-h-screen" style={{ background: '#F1EFE8' }}>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 이미지 */}
          <ImageViewer images={product.imageUrls} />

          {/* 정보 */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1">{product.category}</p>
                <h1 className="text-xl font-bold text-gray-900">{product.title}</h1>
                <p className="text-2xl font-bold mt-2" style={{ color: '#0F6E56' }}>
                  {product.price.toLocaleString()}원
                </p>
              </div>
              <div className="text-right text-sm text-gray-400">
                <p>{product.location}</p>
                <p className="mt-1">조회 {product.viewCount}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
              {product.description || '상세 설명이 없습니다.'}
            </p>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#3DDC97' }}>
                {product.sellerNickname?.[0]}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-800">{product.sellerNickname}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs text-gray-400">줍줍Score</span>
                  <span className="text-xs font-bold" style={{ color: '#1D9E75' }}>{product.sellerScore ?? 0}</span>
                </div>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="mt-6 flex gap-3">
              {isMine ? (
                <>
                  <select
                    value={product.status}
                    onChange={handleStatusChange}
                    className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                  >
                    {STATUS_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => navigate(`/products/${id}/edit`)}
                    className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2.5 text-sm font-medium rounded-lg text-red-500 border border-red-100 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleWish}
                    className="px-4 py-2.5 text-sm font-medium rounded-lg border"
                    style={{ borderColor: '#3DDC97', color: '#0F6E56' }}
                  >
                    ❤️ 찜하기
                  </button>
                  <button
                    onClick={handleChat}
                    className="flex-1 py-2.5 text-sm font-medium rounded-lg border"
                    style={{ borderColor: '#3DDC97', color: '#0F6E56' }}
                  >
                    💬 채팅하기
                  </button>
                  <button
                    onClick={() => navigate(`/products/${id}/purchase`)}
                    className="flex-1 py-2.5 text-sm font-medium rounded-lg text-white"
                    style={{ background: '#1D9E75' }}
                  >
                    구매하기
                  </button>
                </>
              )}
            </div>

            {/* 신고 버튼 (구매자에게만) */}
            {!isMine && user && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  🚨 신고하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* 신고 모달 */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96 mx-4">
            <h2 className="text-base font-bold text-gray-900 mb-1">🚨 신고하기</h2>
            <p className="text-xs text-gray-400 mb-4">적절하지 않은 게시물을 신고합니다</p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">신고 사유</label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-red-300 resize-none"
                placeholder="예) 사기 의심 게시물, 허위 사진, 부적절한 내용..."
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowReportModal(false); setReportReason('') }}
                className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleReport}
                disabled={reportLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 bg-red-500 hover:bg-red-600"
              >
                {reportLoading ? '접수 중...' : '신고하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}