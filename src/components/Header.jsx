import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getTotalUnread } from '../api'

export default function Header() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      getTotalUnread()
        .then((res) => setUnreadCount(res.data))
        .catch(() => {})
    } else {
      setUnreadCount(0)
    }
  }, [user])

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (keyword.trim()) {
      navigate(`/?keyword=${encodeURIComponent(keyword.trim())}`)
    } else {
      navigate('/')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#3DDC97' }}>
            <span className="text-white font-black text-sm">줍</span>
          </div>
          <span className="font-bold text-lg" style={{ color: '#0F6E56' }}>줍줍</span>
        </Link>

        {/* 검색바 */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">
          <input
            type="text"
            placeholder="어떤 물건을 찾고 있나요?"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 px-4 py-2 text-sm rounded-full border border-gray-200 focus:outline-none focus:border-[#3DDC97]"
            style={{ background: '#F1EFE8' }}
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-full text-white font-medium shrink-0"
            style={{ background: '#3DDC97' }}
          >
            검색
          </button>
        </form>

        {/* 메뉴 */}
        <nav className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <Link to="/chat" className="relative text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700">
                💬 채팅
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                    style={{ background: '#FF4444' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/wishes" className="text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700">
                ❤️ 찜
              </Link>
              <Link to="/mypage" className="text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700">
                👤 마이페이지
              </Link>
              <Link to="/products/new" className="text-sm px-4 py-1.5 rounded-full text-white font-medium" style={{ background: '#1D9E75' }}>
                + 판매하기
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm px-4 py-1.5 rounded-full border font-medium" style={{ borderColor: '#3DDC97', color: '#1D9E75' }}>
                로그인
              </Link>
              <Link to="/signup" className="text-sm px-4 py-1.5 rounded-full text-white font-medium" style={{ background: '#3DDC97' }}>
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
