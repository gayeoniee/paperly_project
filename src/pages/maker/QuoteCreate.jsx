import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Save, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input, { TextArea, Select } from '../../components/common/Input';
import styles from './QuoteCreate.module.css';

const initialItem = {
  name: '',
  material: '',
  size: '',
  quantity: 1,
  unit: '장',
  varieties: 1,
  frontPrint: '',
  backPrint: '없음'
};

const materialOptions = [
  { value: '페트 210µ', label: '페트 210µ' },
  { value: '아트지 150g', label: '아트지 150g' },
  { value: '아트지 200g', label: '아트지 200g' },
  { value: '스노우지 200g', label: '스노우지 200g' },
  { value: '크라프트 120g', label: '크라프트 120g' },
  { value: '모조지 100g', label: '모조지 100g' }
];

const printOptions = [
  { value: '수성잉크 4색', label: '수성잉크 4색' },
  { value: '유성잉크 4색', label: '유성잉크 4색' },
  { value: '1도', label: '1도 인쇄' },
  { value: '2도', label: '2도 인쇄' },
  { value: '없음', label: '없음' }
];

export default function QuoteCreate() {
  const navigate = useNavigate();
  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, '0')}월 ${String(today.getDate()).padStart(2, '0')}일`;

  const [quoteData, setQuoteData] = useState({
    date: formattedDate,
    recipient: '',
    items: [{ ...initialItem }],
    subtotal: 0,
    tax: 0,
    additionalCost: 0,
    shipping: 0,
    notes: ''
  });

  const [supplier] = useState({
    businessNumber: '367-87-00976',
    companyName: '(주)성원인쇄소',
    representative: '김장인',
    address: '서울 성동구 성수2가 284-49',
    phone: '02-1234-5678'
  });

  const calculateTotal = () => {
    const subtotal = quoteData.subtotal || 0;
    const tax = Math.round(subtotal * 0.1);
    const additional = quoteData.additionalCost || 0;
    return subtotal + tax + additional;
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...quoteData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setQuoteData({ ...quoteData, items: newItems });
  };

  const addItem = () => {
    setQuoteData({
      ...quoteData,
      items: [...quoteData.items, { ...initialItem }]
    });
  };

  const removeItem = (index) => {
    if (quoteData.items.length > 1) {
      const newItems = quoteData.items.filter((_, i) => i !== index);
      setQuoteData({ ...quoteData, items: newItems });
    }
  };

  const handleSubmit = (action) => {
    alert(action === 'send' ? '견적서가 발송되었습니다!' : '견적서가 저장되었습니다!');
    if (action === 'send') {
      navigate('/maker/orders');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>견적서 작성</h1>
        <p className={styles.subtitle}>PDF 양식과 동일한 레이아웃으로 견적서를 작성하세요</p>
      </div>

      <div className={styles.quoteDocument}>
        {/* Document Header */}
        <div className={styles.documentHeader}>
          <h2 className={styles.documentTitle}>견 적 서</h2>
        </div>

        {/* Top Section */}
        <div className={styles.topSection}>
          {/* Left - Date & Recipient */}
          <div className={styles.leftInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>견적일</span>
              <span className={styles.colon}>:</span>
              <span className={styles.infoValue}>{quoteData.date}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>수신</span>
              <span className={styles.colon}>:</span>
              <input
                type="text"
                value={quoteData.recipient}
                onChange={(e) => setQuoteData({ ...quoteData, recipient: e.target.value })}
                placeholder="수신인을 입력하세요"
                className={styles.inlineInput}
              />
              <span className={styles.honorific}>귀하</span>
            </div>
            <p className={styles.greeting}>아래와 같이 견적합니다.</p>
          </div>

          {/* Right - Supplier Info */}
          <div className={styles.supplierBox}>
            <div className={styles.supplierTitle}>공급자</div>
            <table className={styles.supplierTable}>
              <tbody>
                <tr>
                  <td className={styles.supplierLabel}>사업자번호</td>
                  <td className={styles.supplierValue}>{supplier.businessNumber}</td>
                </tr>
                <tr>
                  <td className={styles.supplierLabel}>상호</td>
                  <td className={styles.supplierValue}>
                    {supplier.companyName}
                    <span className={styles.repLabel}>대표</span>
                    <span>{supplier.representative}</span>
                  </td>
                </tr>
                <tr>
                  <td className={styles.supplierLabel}>주소</td>
                  <td className={styles.supplierValue}>{supplier.address}</td>
                </tr>
                <tr>
                  <td className={styles.supplierLabel}>전화번호</td>
                  <td className={styles.supplierValue}>{supplier.phone}</td>
                </tr>
              </tbody>
            </table>
            <div className={styles.sealPlaceholder}>
              <span>인</span>
            </div>
          </div>
        </div>

        {/* Total Summary Bar */}
        <div className={styles.totalBar}>
          <span>
            합계금액 {(quoteData.subtotal || 0).toLocaleString()}원 + 부가세{' '}
            {Math.round((quoteData.subtotal || 0) * 0.1).toLocaleString()}원 + 배송비 별도
          </span>
          <span className={styles.totalAmount}>
            총 합계금액 : <strong>{calculateTotal().toLocaleString()}원</strong>
          </span>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Left - Material Specs */}
          <div className={styles.specSection}>
            <div className={styles.sectionTitle}>재질 및 규격</div>
            {quoteData.items.map((item, index) => (
              <div key={index} className={styles.itemBlock}>
                {quoteData.items.length > 1 && (
                  <button
                    className={styles.removeItemBtn}
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <table className={styles.specTable}>
                  <tbody>
                    <tr>
                      <td className={styles.specLabel}>품명</td>
                      <td>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          placeholder="예: 실내용배너"
                          className={styles.tableInput}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className={styles.specLabel}>재질</td>
                      <td>
                        <select
                          value={item.material}
                          onChange={(e) => handleItemChange(index, 'material', e.target.value)}
                          className={styles.tableInput}
                        >
                          <option value="">선택하세요</option>
                          {materialOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td className={styles.specLabel}>규격</td>
                      <td>
                        <input
                          type="text"
                          value={item.size}
                          onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                          placeholder="예: 600*1800"
                          className={styles.tableInput}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className={styles.specLabel}>수량</td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className={styles.tableInput}
                          min="1"
                        />
                        <span className={styles.unitText}>{item.unit} * {item.varieties}종류</span>
                      </td>
                    </tr>
                    <tr>
                      <td className={styles.specLabel}>인쇄도수(전면)</td>
                      <td>
                        <select
                          value={item.frontPrint}
                          onChange={(e) => handleItemChange(index, 'frontPrint', e.target.value)}
                          className={styles.tableInput}
                        >
                          <option value="">선택하세요</option>
                          {printOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td className={styles.specLabel}>인쇄도수(후면)</td>
                      <td>
                        <select
                          value={item.backPrint}
                          onChange={(e) => handleItemChange(index, 'backPrint', e.target.value)}
                          className={styles.tableInput}
                        >
                          {printOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
            <button className={styles.addItemBtn} onClick={addItem}>
              <Plus size={16} /> 품목 추가
            </button>
          </div>

          {/* Right - Price Summary */}
          <div className={styles.priceSection}>
            <div className={styles.sectionTitle}>인쇄세부항목</div>
            <table className={styles.priceTable}>
              <tbody>
                <tr>
                  <td className={styles.priceLabel}>주문건</td>
                  <td className={styles.priceValue}>{quoteData.items.length}종류</td>
                </tr>
                <tr>
                  <td className={styles.priceLabel}>합계</td>
                  <td className={styles.priceValue}>
                    <input
                      type="number"
                      value={quoteData.subtotal}
                      onChange={(e) => setQuoteData({ ...quoteData, subtotal: Number(e.target.value) })}
                      placeholder="0"
                      className={styles.priceInput}
                    />
                    원
                  </td>
                </tr>
                <tr>
                  <td className={styles.priceLabel}>부가세</td>
                  <td className={styles.priceValue}>
                    {Math.round((quoteData.subtotal || 0) * 0.1).toLocaleString()}원
                  </td>
                </tr>
                <tr>
                  <td className={styles.priceLabel}>추가비용</td>
                  <td className={styles.priceValue}>
                    <input
                      type="number"
                      value={quoteData.additionalCost}
                      onChange={(e) => setQuoteData({ ...quoteData, additionalCost: Number(e.target.value) })}
                      placeholder="추가비용을 입력하세요"
                      className={styles.priceInput}
                    />
                    원
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes Section */}
        <div className={styles.notesSection}>
          <div className={styles.sectionTitle}>비고</div>
          <textarea
            value={quoteData.notes}
            onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
            placeholder="비고 사항을 입력하세요"
            className={styles.notesInput}
          />
        </div>

        {/* Disclaimer */}
        <div className={styles.disclaimer}>
          <p>- 본 견적의 유효기간은 견적일로부터 15일입니다.</p>
          <p>- 본 견적에서 배송비는 별도입니다.</p>
          <p>- 본 견적은 사양과 작업의 난이도에 따라서 가격이 변동될 수 있습니다.</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <Button variant="outline" icon={Save} onClick={() => handleSubmit('save')}>
          저장하기
        </Button>
        <Button icon={Send} onClick={() => handleSubmit('send')}>
          견적서 발송
        </Button>
      </div>
    </div>
  );
}
