import { useState } from 'react';
import { Send, Paperclip, Image, Search } from 'lucide-react';
import { chats } from '../../data/mockData';
import styles from './Chat.module.css';

export default function Chat() {
  const designerChats = chats.filter(c => c.partnerRole === 'designer');
  const [selectedChat, setSelectedChat] = useState(designerChats[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = designerChats.filter(chat =>
    chat.partnerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>채팅</h1>
        <p className={styles.subtitle}>디자이너와 실시간으로 소통하세요</p>
      </div>

      <div className={styles.chatLayout}>
        {/* Chat List */}
        <div className={styles.chatList}>
          <div className={styles.listHeader}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="대화 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
          <div className={styles.listBody}>
            {filteredChats.map(chat => (
              <button
                key={chat.id}
                className={`${styles.chatItem} ${selectedChat?.id === chat.id ? styles.active : ''}`}
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

        {/* Chat Window */}
        <div className={styles.chatWindow}>
          {selectedChat ? (
            <>
              <div className={styles.windowHeader}>
                <div className={styles.avatar}>
                  {selectedChat.partnerName.charAt(0)}
                </div>
                <div>
                  <h3 className={styles.windowName}>{selectedChat.partnerName}</h3>
                  <span className={styles.windowCompany}>{selectedChat.partnerCompany}</span>
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
              </div>

              <div className={styles.inputArea}>
                <button className={styles.attachBtn}>
                  <Paperclip size={20} />
                </button>
                <button className={styles.attachBtn}>
                  <Image size={20} />
                </button>
                <input
                  type="text"
                  placeholder="메시지를 입력하세요..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={styles.messageInput}
                />
                <button
                  className={styles.sendBtn}
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>대화를 선택해주세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
