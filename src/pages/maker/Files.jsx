import { useState } from 'react';
import { FileText, Image, File, Download, Eye, Search, Grid, List } from 'lucide-react';
import Card from '../../components/common/Card';
import { files } from '../../data/mockData';
import styles from './Files.module.css';

const getFileIcon = (type) => {
  switch (type) {
    case 'pdf': return FileText;
    case 'image': return Image;
    default: return File;
  }
};

const getFileColor = (type) => {
  switch (type) {
    case 'pdf': return '#C47A7A';
    case 'image': return '#7BA876';
    case 'ai': return '#D4A76A';
    default: return '#8B7355';
  }
};

export default function Files() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>파일 관리</h1>
          <p className={styles.subtitle}>디자이너가 업로드한 파일을 확인하세요</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="파일명 또는 업로더 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={18} />
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Files */}
      {viewMode === 'grid' ? (
        <div className={styles.filesGrid}>
          {filteredFiles.map(file => {
            const FileIcon = getFileIcon(file.type);
            const iconColor = getFileColor(file.type);

            return (
              <Card key={file.id} variant="paper" padding="none" className={styles.fileCard}>
                <div className={styles.filePreview} style={{ background: `${iconColor}15` }}>
                  <FileIcon size={48} strokeWidth={1.5} style={{ color: iconColor }} />
                </div>
                <div className={styles.fileInfo}>
                  <h3 className={styles.fileName}>{file.name}</h3>
                  <p className={styles.fileMeta}>
                    {file.size} • {file.uploadedBy}
                  </p>
                  <p className={styles.fileDate}>{file.uploadedAt}</p>
                </div>
                <div className={styles.fileActions}>
                  <button className={styles.actionBtn} title="미리보기">
                    <Eye size={16} />
                  </button>
                  <button className={styles.actionBtn} title="다운로드">
                    <Download size={16} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card variant="paper" padding="none" className={styles.listCard}>
          <table className={styles.filesTable}>
            <thead>
              <tr>
                <th>파일명</th>
                <th>크기</th>
                <th>업로더</th>
                <th>업로드 일시</th>
                <th>주문번호</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map(file => {
                const FileIcon = getFileIcon(file.type);
                const iconColor = getFileColor(file.type);

                return (
                  <tr key={file.id}>
                    <td>
                      <div className={styles.fileNameCell}>
                        <FileIcon size={20} style={{ color: iconColor }} />
                        <span>{file.name}</span>
                      </div>
                    </td>
                    <td>{file.size}</td>
                    <td>{file.uploadedBy}</td>
                    <td>{file.uploadedAt}</td>
                    <td className={styles.orderLink}>{file.orderNumber}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <button className={styles.actionBtn} title="미리보기">
                          <Eye size={16} />
                        </button>
                        <button className={styles.actionBtn} title="다운로드">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {filteredFiles.length === 0 && (
        <div className={styles.empty}>
          <p>파일이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
