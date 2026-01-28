import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMaker, setIsMaker] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (isMaker) {
      navigate('/maker/dashboard');
    } else {
      navigate('/designer/home');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
        <div className={styles.bgCircle3} />
      </div>

      <div className={styles.content}>
        <button className={styles.backBtn} onClick={handleBack}>
          <ArrowLeft size={20} />
          <span>뒤로가기</span>
        </button>

        <div className={styles.logo}>
          <h1 className={styles.logoText}>Paperly</h1>
          <p className={styles.tagline}>로그인하고 종이의 세계로</p>
        </div>

        <Card variant="paper" padding="large" className={styles.loginCard}>
          <h2 className={styles.loginTitle}>로그인</h2>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <Input
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
            />
            <Input
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
            />

            <label className={styles.makerCheckbox}>
              <input
                type="checkbox"
                checked={isMaker}
                onChange={(e) => setIsMaker(e.target.checked)}
              />
              <Printer size={18} strokeWidth={1.5} />
              <span>인쇄소 사장님으로 로그인</span>
            </label>

            <Button type="submit" fullWidth size="large" icon={ArrowRight}>
              로그인
            </Button>
          </form>

          <div className={styles.loginFooter}>
            <button className={styles.textButton}>비밀번호 찾기</button>
            <span className={styles.divider}>|</span>
            <button className={styles.textButton}>회원가입</button>
          </div>
        </Card>

        <p className={styles.copyright}>© 2026 Paperly. All rights reserved.</p>
      </div>
    </div>
  );
}
