import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Paperclip, ArrowLeft } from 'lucide-react';
import { chats } from '../../data/mockData';
import styles from './Chat.module.css';

export default function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const makerChats = chats.filter(c => c.partnerRole === 'maker');
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatList, setChatList] = useState(makerChats);
  const messagesEndRef = useRef(null);

  // 새 채팅이 전달되면 처리
  useEffect(() => {
    if (location.state?.newChat) {
      const newPartner = location.state.newChat;

      // 이미 존재하는 채팅인지 확인
      const existingChat = chatList.find(c => c.partnerId === newPartner.id);

      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        // 새 채팅 생성
        const newChat = {
          id: `chat-new-${Date.now()}`,
          partnerId: newPartner.id,
          partnerName: newPartner.name,
          partnerCompany: newPartner.name,
          partnerRole: 'maker',
          lastMessage: '',
          lastMessageTime: '방금',
          unreadCount: 0,
          messages: []
        };
        setChatList(prev => [newChat, ...prev]);
        setSelectedChat(newChat);
      }

      // state 초기화 (뒤로가기 시 중복 실행 방지)
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, chatList, navigate, location.pathname]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      alert(`메시지 전송: ${newMessage}`);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (selectedChat) {
    return (
      <div className={styles.chatWindow}>
        <div className={styles.windowHeader}>
          <button className={styles.backBtn} onClick={() => setSelectedChat(null)}>
            <ArrowLeft size={20} />
          </button>
          <div className={styles.avatar}>
            {selectedChat.partnerName.charAt(0)}
          </div>
          <div className={styles.headerInfo}>
            <h3 className={styles.headerName}>{selectedChat.partnerName}</h3>
            <span className={styles.headerCompany}>{selectedChat.partnerCompany}</span>
          </div>
        </div>

        <div className={styles.messagesArea}>
          {selectedChat.messages.map(message => (
            <div
              key={message.id}
              className={`${styles.message} ${message.isMe ? styles.mine : styles.theirs}`}
            >
              <div className={styles.messageBubble}>
                {message.text}
              </div>
              <span className={styles.messageTime}>{message.time}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <button className={styles.attachBtn}>
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className={styles.input}
          />
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!newMessage.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>채팅</h1>
        <p className={styles.subtitle}>장인과 실시간으로 소통하세요</p>
      </div>

      <div className={styles.chatList}>
        {chatList.map(chat => (
          <button
            key={chat.id}
            className={styles.chatItem}
            onClick={() => setSelectedChat(chat)}
          >
            <div className={styles.avatar}>
              {chat.partnerName.charAt(0)}
            </div>
            <div className={styles.chatInfo}>
              <div className={styles.chatMeta}>
                <span className={styles.chatName}>{chat.partnerName}</span>
                <span className={styles.chatTime}>{chat.lastMessageTime}</span>
              </div>
              <div className={styles.chatPreview}>
                <p className={styles.lastMessage}>{chat.lastMessage}</p>
                {chat.unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{chat.unreadCount}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
