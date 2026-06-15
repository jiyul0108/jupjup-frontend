import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getChatRooms, getChatMessages } from '../api'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'

// ── 채팅방 목록 ─────────────────────────────────────────────────
export function ChatListPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getChatRooms()
      .then((res) => setRooms(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#F1EFE8' }}>
      <Header />
      <div className="flex justify-center px-4 py-6">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h1 className="text-base font-bold text-gray-900">채팅</h1>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">불러오는 중...</div>
          ) : rooms.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">채팅 내역이 없습니다</p>
            </div>
          ) : (
            rooms.map((room) => (
              <Link
                key={room.id}
                to={`/chat/${room.id}`}
                className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
              >
                <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: '#3DDC97' }}>
                  {room.productTitle?.[0]}
                  {room.unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                      style={{ background: '#FF4444' }}
                    >
                      {room.unreadCount > 9 ? '9+' : room.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{room.productTitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{room.sellerNickname} · {room.buyerNickname}</p>
                </div>
                {room.unreadCount > 0 && (
                  <span className="text-xs font-bold shrink-0" style={{ color: '#FF4444' }}>
                    {room.unreadCount}개 안읽음
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ── 채팅방 (실시간 채팅) ────────────────────────────────────────
export function ChatRoomPage() {
  const { roomId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const clientRef = useRef(null)
  const bottomRef = useRef(null)

  // 이전 메시지 로드 (입장 시 읽음 처리도 백엔드에서 자동 처리)
  useEffect(() => {
    getChatMessages(roomId)
      .then((res) => setMessages(res.data))
      .catch(() => navigate('/chat'))
  }, [roomId])

  // WebSocket 연결
  useEffect(() => {
    const token = localStorage.getItem('token')
    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws?token=${token}`),
      onConnect: () => {
        setConnected(true)
        client.subscribe(`/sub/chat/${roomId}`, (msg) => {
          const parsed = JSON.parse(msg.body)
          setMessages((prev) => [...prev, parsed])
        })
      },
      onDisconnect: () => setConnected(false),
    })
    client.activate()
    clientRef.current = client

    return () => client.deactivate()
  }, [roomId])

  // 스크롤 아래 고정
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !connected) return
    clientRef.current.publish({
      destination: `/pub/chat/${roomId}`,
      body: JSON.stringify({ content: input.trim() }),
    })
    setInput('')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F1EFE8' }}>
      <Header />

      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>

          {/* 채팅 헤더 */}
          <div className="border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
            <button onClick={() => navigate('/chat')} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: connected ? '#3DDC97' : '#D1D5DB' }} />
              <span className="text-sm font-medium text-gray-800">채팅방 #{roomId}</span>
            </div>
          </div>

          {/* 메시지 목록 */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#F9FAFB' }}>
            {messages.map((msg, i) => {
              const isMine = msg.senderNickname === user?.nickname
              return (
                <div key={msg.id ?? i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0" style={{ background: '#3DDC97' }}>
                      {msg.senderNickname?.[0]}
                    </div>
                  )}
                  <div className="max-w-xs">
                    {!isMine && <p className="text-xs text-gray-400 mb-1">{msg.senderNickname}</p>}
                    <div
                      className="px-3 py-2 rounded-2xl text-sm"
                      style={isMine
                        ? { background: '#3DDC97', color: 'white', borderBottomRightRadius: 4 }
                        : { background: 'white', color: '#111827', borderBottomLeftRadius: 4 }
                      }
                    >
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {isMine && (
                        <span className="text-[10px]" style={{ color: msg.isRead ? '#3DDC97' : '#374151' }}>
                          {msg.isRead ? '읽음' : '1'}
                        </span>
                      )}
                      <p className="text-xs text-gray-600">
                        {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* 입력창 */}
          <div className="border-t border-gray-100 px-4 py-3 shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="메시지 입력..."
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#3DDC97]"
              />
              <button
                onClick={sendMessage}
                disabled={!connected || !input.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-40"
                style={{ background: '#3DDC97' }}
              >
                ↑
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
