import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts } from '../api'
import ProductCard from '../components/ProductCard'
import Header from '../components/Header'

const CATEGORIES = [
  { value: '디지털/가전', label: '디지털/가전', icon: '💻' },
  { value: '가구/인테리어', label: '가구/인테리어', icon: '🛋️' },
  { value: '의류', label: '의류', icon: '👕' },
  { value: '도서/음반', label: '도서/음반', icon: '📚' },
  { value: '스포츠/레저', label: '스포츠/레저', icon: '⚽' },
  { value: '뷰티/미용', label: '뷰티/미용', icon: '💄' },
  { value: '식품', label: '식품', icon: '🍱' },
  { value: '기타', label: '기타', icon: '📦' },
]

const SORTS = [
  { value: 'createdAt,desc', label: '최신순' },
  { value: 'price,asc', label: '낮은 가격순' },
  { value: 'price,desc', label: '높은 가격순' },
]

const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'SELLING', label: '판매중' },
  { value: 'RESERVED', label: '예약중' },
  { value: 'SOLD', label: '거래완료' },
]

const PAGE_SIZE = 8

export default function MainPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [priceInput, setPriceInput] = useState({ min: '', max: '' })

  const keyword = searchParams.get('keyword') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'createdAt,desc'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const status = searchParams.get('status') || ''

  const selectedCategories = category ? category.split(',').filter(Boolean) : []

  const buildParams = (pageNum) => ({
    sort,
    page: pageNum,
    size: PAGE_SIZE,
    ...(keyword && { keyword }),
    ...(selectedCategories.length > 0 && { categories: selectedCategories }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(status && { status }),
  })

  // 조건 바뀌면 첫 페이지부터 새로 로드
  useEffect(() => {
    const fetchFirst = async () => {
      setLoading(true)
      setPage(0)
      try {
        const res = await getProducts(buildParams(0))
        setProducts(res.data.content)
        setTotalElements(res.data.totalElements)
        setHasMore(!res.data.last)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchFirst()
  }, [keyword, category, sort, minPrice, maxPrice, status])

  // 더보기
  const handleLoadMore = async () => {
    const nextPage = page + 1
    setLoadingMore(true)
    try {
      const res = await getProducts(buildParams(nextPage))
      setProducts((prev) => [...prev, ...res.data.content])
      setPage(nextPage)
      setHasMore(!res.data.last)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMore(false)
    }
  }

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const toggleCategory = (val) => {
    const next = new URLSearchParams(searchParams)
    const current = next.get('category') ? next.get('category').split(',').filter(Boolean) : []
    const updated = current.includes(val)
      ? current.filter((c) => c !== val)
      : [...current, val]
    if (updated.length > 0) next.set('category', updated.join(','))
    else next.delete('category')
    setSearchParams(next)
  }

  const applyFilter = () => {
    const next = new URLSearchParams(searchParams)
    if (priceInput.min) next.set('minPrice', priceInput.min)
    else next.delete('minPrice')
    if (priceInput.max) next.set('maxPrice', priceInput.max)
    else next.delete('maxPrice')
    setSearchParams(next)
    setShowFilter(false)
  }

  const resetFilter = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('minPrice')
    next.delete('maxPrice')
    next.delete('category')
    next.delete('status')
    setPriceInput({ min: '', max: '' })
    setSearchParams(next)
    setShowFilter(false)
  }

  useEffect(() => {
    setShowFilter(false)
  }, [keyword])

  const isSearching = !!keyword
  const hasFilter = minPrice || maxPrice || category || status

  return (
    <div className="min-h-screen" style={{ background: '#F1EFE8' }}>
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        {/* 사이드바 */}
        <aside className="w-44 shrink-0">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xs font-bold text-gray-500 px-2 mb-2">카테고리</p>
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams)
                next.delete('category')
                setSearchParams(next)
              }}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-left transition-colors"
              style={
                selectedCategories.length === 0
                  ? { background: '#E1F5EE', color: '#0F6E56', fontWeight: 600 }
                  : { color: '#374151' }
              }
            >
              <span>🏠</span>
              <span>전체</span>
            </button>
            {CATEGORIES.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => toggleCategory(value)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-left transition-colors"
                style={
                  selectedCategories.includes(value)
                    ? { background: '#E1F5EE', color: '#0F6E56', fontWeight: 600 }
                    : { color: '#374151' }
                }
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* 메인 영역 */}
        <main className="flex-1 min-w-0">
          {/* 필터바 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600">
                {keyword && <span className="font-bold" style={{ color: '#0F6E56' }}>'{keyword}' </span>}
                상품 <span className="font-bold" style={{ color: '#0F6E56' }}>{totalElements}</span>개
              </p>
              {isSearching && (
                <div className="relative">
                  <button
                    onClick={() => setShowFilter(!showFilter)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                    style={
                      hasFilter
                        ? { background: '#1D9E75', color: 'white', borderColor: '#1D9E75' }
                        : { background: 'white', color: '#374151', borderColor: '#E5E7EB' }
                    }
                  >
                    🔍 필터{hasFilter ? ' 적용중' : ''}
                  </button>

                  {showFilter && (
                    <div
                      className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 p-5 w-80"
                      style={{ top: '4.5rem', left: '50%', transform: 'translateX(-50%)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-xs font-bold text-gray-500 mb-2">가격 필터</p>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <input
                          type="number"
                          placeholder="최소"
                          value={priceInput.min}
                          onChange={(e) => setPriceInput({ ...priceInput, min: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                        />
                        <input
                          type="number"
                          placeholder="최대"
                          value={priceInput.max}
                          onChange={(e) => setPriceInput({ ...priceInput, max: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#3DDC97]"
                        />
                      </div>

                      <p className="text-xs font-bold text-gray-500 mb-2">카테고리</p>
                      <div className="flex gap-1.5 flex-wrap mb-4">
                        {CATEGORIES.map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => toggleCategory(value)}
                            className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
                            style={
                              selectedCategories.includes(value)
                                ? { background: '#1D9E75', color: 'white', borderColor: '#1D9E75' }
                                : { background: 'white', color: '#374151', borderColor: '#E5E7EB' }
                            }
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <p className="text-xs font-bold text-gray-500 mb-2">거래 상태</p>
                      <div className="flex gap-2 flex-wrap mb-4">
                        {STATUS_OPTIONS.map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setParam('status', value)}
                            className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
                            style={
                              status === value
                                ? { background: '#1D9E75', color: 'white', borderColor: '#1D9E75' }
                                : { background: 'white', color: '#374151', borderColor: '#E5E7EB' }
                            }
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={resetFilter}
                          className="flex-1 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:bg-gray-50"
                        >
                          초기화
                        </button>
                        <button
                          onClick={applyFilter}
                          className="flex-1 py-1.5 rounded-lg text-xs text-white font-medium"
                          style={{ background: '#1D9E75' }}
                        >
                          적용
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {SORTS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setParam('sort', value)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={
                    sort === value
                      ? { background: '#1D9E75', color: 'white' }
                      : { background: 'white', color: '#374151', border: '1px solid #E5E7EB' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {showFilter && (
            <div className="fixed inset-0 z-40" onClick={() => setShowFilter(false)} />
          )}

          {/* 상품 목록 */}
          {loading ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="rounded-xl bg-white overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm">{keyword ? `'${keyword}' 검색 결과가 없습니다` : '상품이 없습니다'}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* 더보기 버튼 */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 rounded-full text-sm font-medium border-2 transition-colors disabled:opacity-50"
                    style={{ borderColor: '#1D9E75', color: '#1D9E75', background: 'white' }}
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
                        불러오는 중...
                      </span>
                    ) : (
                      `더보기 (${products.length} / ${totalElements})`
                    )}
                  </button>
                </div>
              )}

              {/* 전체 로드 완료 */}
              {!hasMore && products.length > PAGE_SIZE && (
                <p className="text-center text-xs text-gray-400 mt-8">
                  전체 {totalElements}개 상품을 모두 불러왔습니다
                </p>
              )}
            </>
          )}
        </main>
      </div>

      <Link
        to="/products/new"
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-2xl hover:scale-105 transition-transform"
        style={{ background: '#1D9E75' }}
      >
        +
      </Link>
    </div>
  )
}
