import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createProduct, getProduct, updateProduct, generateAiDescription } from '../api'
import Header from '../components/Header'

const CATEGORIES = ['디지털/가전', '가구/인테리어', '의류', '도서/음반', '스포츠/레저', '뷰티/미용', '식품', '기타']

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', location: '' })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [aiMemo, setAiMemo] = useState('')
  const [error, setError] = useState('')

  const handleAiGenerate = async () => {
    setAiLoading(true)
    try {
      const res = await generateAiDescription({
        title: form.title,
        category: form.category,
        memo: aiMemo,
      })
      setForm((f) => ({ ...f, description: res.data.description }))
      setShowAiModal(false)
      setAiMemo('')
    } catch (e) {
      alert('AI 설명 작성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    if (isEdit) {
      getProduct(id).then((res) => {
        const p = res.data
        setForm({ title: p.title, description: p.description || '', price: p.price, category: p.category, location: p.location })
        setExistingImages(p.imageUrls || [])
      })
    }
  }, [id])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const combined = [...images, ...files].slice(0, 5)
    const newPreviews = [
      ...previews.slice(0, images.length),
      ...files.map((f) => URL.createObjectURL(f))
    ].slice(0, 5)
    setImages(combined)
    setPreviews(newPreviews)
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setImages(newImages)
    setPreviews(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit) {
        await updateProduct(id, form)
      } else {
        const formData = new FormData()
        formData.append(
          'data',
          new Blob([JSON.stringify({ ...form, price: Number(form.price) })], { type: 'application/json' })
        )
        images.forEach((img) => formData.append('images', img))
        await createProduct(formData)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || '저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen" style={{ background: '#F1EFE8' }}>
        <Header />
        <div className="max-w-xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h1 className="text-lg font-bold text-gray-900 mb-6">{isEdit ? '상품 수정' : '상품 등록'}</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사진 {isEdit ? '' : `(${images.length}/5)`}
                </label>
                {isEdit && existingImages.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-400 mb-1">등록된 이미지</p>
                    <div className="flex gap-2 flex-wrap">
                      {existingImages.map((url, i) => (
                        <img key={i} src={url} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                      ))}
                    </div>
                  </div>
                )}
                {!isEdit && (
                  <>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#3DDC97] transition-colors">
                      <span className="text-2xl mb-1">📷</span>
                      <span className="text-xs text-gray-400">사진 추가 (최대 5장)</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                    </label>
                    {previews.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {previews.map((url, i) => (
                          <div key={i} className="relative">
                            <img src={url} className="w-16 h-16 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                  placeholder="상품명을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                  required
                >
                  <option value="">카테고리 선택</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">동네</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                  placeholder="예) 강남구 역삼동"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">설명</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.title.trim()) {
                        alert('제목을 먼저 입력해주세요!')
                        return
                      }
                      setShowAiModal(true)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    ✨ AI 설명 작성
                  </button>
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97] resize-none"
                  placeholder="상품 설명을 입력하세요 (또는 AI 설명 작성 버튼 클릭)"
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: '#3DDC97' }}
                >
                  {loading ? '저장 중...' : isEdit ? '수정 완료' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* AI 설명 작성 모달 */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96 mx-4">
            <h2 className="text-base font-bold text-gray-900 mb-1">✨ AI 설명 작성</h2>
            <p className="text-xs text-gray-400 mb-4">AI가 상품 설명을 자동으로 작성합니다</p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">상품명</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">{form.title}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">카테고리</label>
                <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">{form.category || '미선택'}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  간단 메모 <span className="text-gray-300">(선택)</span>
                </label>
                <textarea
                  value={aiMemo}
                  onChange={(e) => setAiMemo(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97] resize-none"
                  placeholder="예) 거의 새 제품, 1년 사용, 박스 미개봉..."
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowAiModal(false); setAiMemo('') }}
                className="flex-1 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {aiLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    작성 중...
                  </span>
                ) : '✨ 설명 생성'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
