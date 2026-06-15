import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(form)
      loginUser({ email: res.data.email, nickname: res.data.nickname }, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F1EFE8' }}>
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: '#3DDC97' }}>
            <span className="text-white font-black text-3xl">줍</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F6E56' }}>줍줍</h1>
          <p className="text-sm text-gray-500 mt-1">내 동네 득템 마켓</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">로그인</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                placeholder="example@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                placeholder="비밀번호 입력"
                required
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50"
              style={{ background: '#3DDC97' }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="font-medium" style={{ color: '#1D9E75' }}>회원가입</Link>
          </p>

          <p className="text-center text-sm text-gray-500 mt-2">
            <Link to="/" className="font-medium" style={{ color: '#3DDC97' }}>로그인 없이 둘러보기 →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}