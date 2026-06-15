import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../api'

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', nickname: '', location: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(form)
      alert('회원가입이 완료되었습니다!')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'email', label: '이메일', type: 'email', placeholder: 'example@email.com' },
    { key: 'password', label: '비밀번호', type: 'password', placeholder: '8자 이상 입력' },
    { key: 'nickname', label: '닉네임', type: 'text', placeholder: '사용할 닉네임' },
    { key: 'location', label: '동네', type: 'text', placeholder: '예) 강남구 역삼동' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F1EFE8' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: '#3DDC97' }}>
            <span className="text-white font-black text-3xl">줍</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F6E56' }}>줍줍 가입하기</h1>
          <p className="text-sm text-gray-500 mt-1">동네 거래를 시작해보세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50"
              style={{ background: '#3DDC97' }}
            >
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="font-medium" style={{ color: '#1D9E75' }}>로그인</Link>
          </p>
        </div>
      </div>
    </div>
  )
}