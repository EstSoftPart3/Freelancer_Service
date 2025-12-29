import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";
import styles from "./NotificationSettingsPanel.module.css";

const Y = "Y";
const N = "N";

function unwrap(res) {
  return res?.output ?? res;
}

function yn(v) {
  return v === Y ? Y : N;
}

export default function NotificationSettingsPanel() {
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [error, setError] = useState(null);

  const [settings, setSettings] = useState({
    allNoticeYn: Y,
    recruitNoticeYn: Y,
    commentNoticeYn: Y,
    scrapCompanyNoticeYn: Y,
  });

  const allOff = useMemo(() => settings.allNoticeYn !== Y, [settings.allNoticeYn]);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.$get("/notifications/settings");
      const data = unwrap(res);
      setSettings({
        allNoticeYn: yn(data?.allNoticeYn),
        recruitNoticeYn: yn(data?.recruitNoticeYn),
        commentNoticeYn: yn(data?.commentNoticeYn),
        scrapCompanyNoticeYn: yn(data?.scrapCompanyNoticeYn),
      });
    } catch (e) {
      console.error(e);
      setError("알림 설정을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const patchSetting = async (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    try {
      await api.$patch("/notifications/settings", patch);
    } catch (e) {
      console.error(e);
      setError("설정을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
      await fetchSettings();
    } finally {
      setSavingKey(null);
    }
  };

  const onToggle = async (key) => {
    if (allOff && key !== "allNoticeYn") return;

    const next = settings[key] === Y ? N : Y;
    setSavingKey(key);
    await patchSetting({ [key]: next });
  };

  if (loading) return <div className={styles.loading}>불러오는 중...</div>;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>알림 설정</h2>
        <p className={styles.subTitle}>알림 수신 여부를 항목별로 설정할 수 있습니다.</p>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      {/* 전체 알림 유지 */}
      <SettingCard
        title="전체 알림 수신"
        desc="전체 알림을 일괄적으로 켜거나 끕니다."
        value={settings.allNoticeYn}
        onClick={() => onToggle("allNoticeYn")}
        saving={savingKey === "allNoticeYn"}
      />

      <div className={styles.section}>
        <SettingCard
          title="프로젝트"
          desc="지원한 프로젝트 변경사항 및 결과 알림"
          value={settings.recruitNoticeYn}
          onClick={() => onToggle("recruitNoticeYn")}
          disabled={allOff}
          saving={savingKey === "recruitNoticeYn"}
        />

        <SettingCard
          title="커뮤니티"
          desc="커뮤니티 게시글 작성/수정/댓글 및 반응 알림"
          value={settings.commentNoticeYn}
          onClick={() => onToggle("commentNoticeYn")}
          disabled={allOff}
          saving={savingKey === "commentNoticeYn"}
        />

        <SettingCard
          title="스크랩"
          desc="스크랩한 기업의 프로젝트 공고 알림"
          value={settings.scrapCompanyNoticeYn}
          onClick={() => onToggle("scrapCompanyNoticeYn")}
          disabled={allOff}
          saving={savingKey === "scrapCompanyNoticeYn"}
        />
      </div>
    </div>
  );
}

function SettingCard({ title, desc, value, onClick, disabled, saving }) {
  const isOn = value === Y;

  return (
    <div className={`${styles.card} ${disabled ? styles.cardDisabled : ""}`}>
      <div className={styles.cardText}>
        <div className={styles.cardTitle}>{title}</div>
        <div className={styles.cardDesc}>{desc}</div>
      </div>

      <button
        type="button"
        className={styles.toggleBtn}
        onClick={onClick}
        disabled={disabled || saving}
        aria-pressed={isOn}
      >
        <span className={styles.toggleLabel}>{isOn ? "On" : "Off"}</span>
        <span className={`${styles.switch} ${isOn ? styles.switchOn : styles.switchOff}`}>
          <span className={styles.knob} />
        </span>
      </button>
    </div>
  );
}
