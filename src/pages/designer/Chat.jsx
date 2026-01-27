import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, ArrowLeft } from 'lucide-react';
import { chats } from '../../data/mockData';
import styles from './Chat.module.css';

export default function Chat() {
  const makerChats = chats.filter(c => c.partnerRole === 'maker');
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

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
            onKeyPress={handleKeyPress}
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
        {makerChats.map(chat => (
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
