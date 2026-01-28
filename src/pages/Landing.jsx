import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone } from 'lucide-react';
import Card from '../components/common/Card';
import styles from './Landing.module.css';

export default function Landing() {
  const navigate = useNavigate();

  const handlePlatformSelect = (platform) => {
    navigate(`/${platform}/home`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.paperTexture} />
        <div className={styles.floatingPaper1} />
        <div className={styles.floatingPaper2} />
        <div className={styles.floatingPaper3} />
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.logo}>Paperly</h1>
          <h2 className={styles.tagline}>
            <span className={styles.highlight}>종이</span>로 연결되는<br />
            장인과 디자이너의 특별한 만남
          </h2>
          <p className={styles.description}>
            당신의 감성을 담을 완벽한 종이를 찾아보세요
          </p>
        </div>

        <div className={styles.paperVisual}>
          <div className={styles.paperStack}>
            <div className={styles.paper1} />
            <div className={styles.paper2} />
            <div className={styles.paper3} />
          </div>
        </div>

        <div className={styles.selection}>
          <p className={styles.selectLabel}>어떤 환경에서 이용하시나요?</p>

          <div className={styles.platformCards}>
            <Card
              variant="paper"
              padding="large"
              hover
              onClick={() => handlePlatformSelect('web')}
              className={styles.platformCard}
            >
              <div className={styles.platformIcon}>
                <Monitor size={32} strokeWidth={1.5} />
              </div>
              <h3 className={styles.platformTitle}>웹</h3>
              <p className={styles.platformDesc}>
                PC나 태블릿의<br />
                넓은 화면에서 편하게
              </p>
            </Card>

            <Card
              variant="paper"
              padding="large"
              hover
              onClick={() => handlePlatformSelect('app')}
              className={styles.platformCard}
            >
              <div className={styles.platformIcon}>
                <Smartphone size={32} strokeWidth={1.5} />
              </div>
              <h3 className={styles.platformTitle}>앱</h3>
              <p className={styles.platformDesc}>
                모바일에서<br />
                언제 어디서나
              </p>
            </Card>
          </div>
        </div>

        <p className={styles.copyright}>© 2026 Paperly. All rights reserved.</p>
      </div>
    </div>
  );
}
