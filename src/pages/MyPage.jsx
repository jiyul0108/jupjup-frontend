import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMyProfile, updateMyProfile, getMySellingProducts, getMyOrders, getUserReviews, createReview } from '../api'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'

const TABS = [
  { key: 'profile', label: '프로필' },
  { key: 'selling', label: '내 판매' },
  { key: 'orders', label: '내 구매' },
  { key: 'wishes', label: '찜 목록' },
  { key: 'reviews', label: '받은 리뷰' },
  { key: 'edit', label: '정보 수정' },
]

const STATUS_LABEL = { SELLING: '판매중', RESERVED: '예약중', SOLD: '거래완료' }
const STATUS_COLOR = { SELLING: '#1D9E75', RESERVED: '#F59E0B', SOLD: '#9CA3AF' }

function getScoreBadge(score) {
  if (score >= 50) return { icon: '🌳', label: '나무', color: '#1D9E75' }
  if (score >= 20) return { icon: '🌿', label: '새싹', color: '#3DDC97' }
  return { icon: '🌱', label: '씨앗', color: '#6EE7B7' }
}

export default function MyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // 개인정보 수정 폼
  const [editForm, setEditForm] = useState({ nickname: '', location: '', currentPassword: '', newPassword: '', confirmPassword: '' })
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  // 리뷰 작성 모달
  const [reviewModal, setReviewModal] = useState(null) // { productId, productTitle }
  const [reviewForm, setReviewForm] = useState({ content: '', score: 5 })
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    Promise.all([
      getMyProfile(),
      getMySellingProducts(),
      getMyOrders(),
    ]).then(([profileRes, productsRes, ordersRes]) => {
      setProfile(profileRes.data)
      setProducts(productsRes.data)
      setOrders(ordersRes.data)
      setEditForm((f) => ({ ...f, nickname: profileRes.data.nickname, location: profileRes.data.location || '' }))
      // 리뷰는 userId 필요
      return getUserReviews(profileRes.data.id)
    }).then((reviewRes) => {
      setReviews(reviewRes.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleReviewSubmit = async () => {
    if (!reviewForm.content.trim()) { alert('리뷰 내용을 입력해주세요.'); return }
    setReviewLoading(true)
    try {
      await createReview({
        productId: reviewModal.productId,
        content: reviewForm.content,
        score: reviewForm.score,
      })
      alert('리뷰가 등록되었습니다!')
      setReviewModal(null)
      setReviewForm({ content: '', score: 5 })
      // 리뷰 목록 새로고침
      getUserReviews(profile.id).then((res) => setReviews(res.data))
    } catch (e) {
      alert(e.response?.data?.message || '리뷰 등록에 실패했습니다.')
    } finally {
      setReviewLoading(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditError('')
    setEditSuccess('')
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      setEditError('새 비밀번호가 일치하지 않습니다.')
      return
    }
    setEditLoading(true)
    try {
      const res = await updateMyProfile({
        nickname: editForm.nickname,
        location: editForm.location,
        currentPassword: editForm.currentPassword || null,
        newPassword: editForm.newPassword || null,
      })
      setProfile(res.data)
      setEditSuccess('정보가 수정되었습니다!')
      setEditForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }))
    } catch (err) {
      setEditError(err.response?.data?.message || '수정에 실패했습니다.')
    } finally {
      setEditLoading(false)
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

  const badge = getScoreBadge(profile?.jupjupScore ?? 0)

  return (
    <>
      <div className="min-h-screen" style={{ background: '#F1EFE8' }}>
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* 프로필 요약 카드 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0" style={{ background: '#3DDC97' }}>
            {profile?.nickname?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">{profile?.nickname}</h1>
              <span className="text-sm px-2 py-0.5 rounded-full font-medium" style={{ background: '#E1F5EE', color: badge.color }}>
                {badge.icon} {badge.label}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-0.5">{profile?.email}</p>
            <div className="flex items-center gap-3 mt-1">
              {profile?.location && <span className="text-xs text-gray-500">📍 {profile.location}</span>}
              <span className="text-xs font-bold" style={{ color: '#1D9E75' }}>줍줍Score {profile?.jupjupScore ?? 0}</span>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-4 overflow-x-auto">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
              style={tab === key
                ? { background: '#1D9E75', color: 'white' }
                : { color: '#6B7280' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">

          {/* 프로필 */}
          {tab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-700">내 정보</h2>
              <div className="space-y-3">
                {[
                  { label: '닉네임', value: profile?.nickname },
                  { label: '이메일', value: profile?.email },
                  { label: '동네', value: profile?.location || '미설정' },
                  { label: '줍줍Score', value: `${profile?.jupjupScore ?? 0}점 (${badge.icon} ${badge.label})` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-3 rounded-xl" style={{ background: '#F1EFE8' }}>
                  <p className="text-xl font-bold" style={{ color: '#1D9E75' }}>{products.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">판매 상품</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: '#F1EFE8' }}>
                  <p className="text-xl font-bold" style={{ color: '#1D9E75' }}>{orders.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">구매 내역</p>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: '#F1EFE8' }}>
                  <p className="text-xl font-bold" style={{ color: '#1D9E75' }}>{reviews.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">받은 리뷰</p>
                </div>
              </div>
            </div>
          )}

          {/* 내 판매 */}
          {tab === 'selling' && (
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-4">내 판매 상품 ({products.length})</h2>
              {products.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-3xl mb-2">📦</p>
                  <p className="text-sm">등록한 상품이 없습니다</p>
                  <Link to="/products/new" className="inline-block mt-3 text-xs px-4 py-2 rounded-full text-white" style={{ background: '#1D9E75' }}>상품 등록하기</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((p) => (
                    <Link key={p.id} to={`/products/${p.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                      {p.imageUrls?.[0] ? (
                        <img src={p.imageUrls[0]} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-2xl shrink-0">📦</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                        <p className="text-sm font-bold mt-0.5" style={{ color: '#1D9E75' }}>{p.price.toLocaleString()}원</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full font-medium shrink-0" style={{ background: '#E1F5EE', color: STATUS_COLOR[p.status] }}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 내 구매 */}
          {tab === 'orders' && (
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-4">구매 내역 ({orders.length})</h2>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-3xl mb-2">🛒</p>
                  <p className="text-sm">구매 내역이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o.id} className="p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{o.productTitle}</p>
                          <p className="text-xs text-gray-400 mt-0.5">판매자: {o.sellerNickname} · {o.paymentMethod}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: '#1D9E75' }}>{o.productPrice.toLocaleString()}원</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString('ko-KR')}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/orders/${o.id}`)}
                          className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
                        >
                          주문 상세
                        </button>
                        <button
                          onClick={() => {
                            setReviewModal({ productId: o.productId, productTitle: o.productTitle })
                            setReviewForm({ content: '', score: 5 })
                          }}
                          className="text-xs px-3 py-1 rounded-full text-white font-medium"
                          style={{ background: '#3DDC97' }}
                        >
                          ⭐ 리뷰 작성
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 찜 목록 */}
          {tab === 'wishes' && (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">❤️</p>
              <p className="text-sm text-gray-600 mb-4">찜한 상품 목록은 별도 페이지에서 확인할 수 있어요</p>
              <Link to="/wishes" className="inline-block text-sm px-6 py-2.5 rounded-full text-white font-medium" style={{ background: '#1D9E75' }}>
                찜 목록 보기
              </Link>
            </div>
          )}

          {/* 받은 리뷰 */}
          {tab === 'reviews' && (
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-4">받은 리뷰 ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-3xl mb-2">⭐</p>
                  <p className="text-sm">아직 받은 리뷰가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl" style={{ background: '#F9FAFB' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">{r.reviewerNickname}</span>
                        <span className="text-xs text-yellow-500">{'⭐'.repeat(r.score)}</span>
                      </div>
                      <p className="text-sm text-gray-800">{r.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 개인정보 수정 */}
          {tab === 'edit' && (
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-4">개인정보 수정</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
                  <input
                    type="text"
                    value={editForm.nickname}
                    onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">동네</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                    placeholder="예) 강남구 역삼동"
                  />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-3">비밀번호 변경 (변경 시에만 입력)</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
                      <input
                        type="password"
                        value={editForm.currentPassword}
                        onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                        placeholder="현재 비밀번호 입력"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
                      <input
                        type="password"
                        value={editForm.newPassword}
                        onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                        placeholder="새 비밀번호 입력"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
                      <input
                        type="password"
                        value={editForm.confirmPassword}
                        onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                        placeholder="새 비밀번호 재입력"
                      />
                    </div>
                  </div>
                </div>
                {editError && <p className="text-xs text-red-500">{editError}</p>}
                {editSuccess && <p className="text-xs" style={{ color: '#1D9E75' }}>{editSuccess}</p>}
                <button
                  type="submit"
                  disabled={editLoading}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: '#1D9E75' }}
                >
                  {editLoading ? '저장 중...' : '저장하기'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* 리뷰 작성 모달 */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96 mx-4">
            <h2 className="text-base font-bold text-gray-900 mb-1">⭐ 리뷰 작성</h2>
            <p className="text-xs text-gray-400 mb-4">{reviewModal.productTitle}</p>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-2">별점</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setReviewForm((f) => ({ ...f, score: s }))}
                    className="text-2xl transition-opacity"
                    style={{ opacity: s <= reviewForm.score ? 1 : 0.3 }}
                  >
                    ⭐
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600 self-center">{reviewForm.score}점</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">리뷰 내용</label>
              <textarea
                value={reviewForm.content}
                onChange={(e) => setReviewForm((f) => ({ ...f, content: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97] resize-none"
                placeholder="거래는 어때셨나요? 소감을 작성해주세요!"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={reviewLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: '#1D9E75' }}
              >
                {reviewLoading ? '등록 중...' : '리뷰 등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
