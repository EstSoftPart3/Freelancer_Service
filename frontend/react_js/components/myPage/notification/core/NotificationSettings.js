import { userState, useEffect} from 'react';

export default function NotificationSettings(){
    const [settings, setSettings] = useState({
        project : true,
        apply : true,
        community : true
    });

    useEffect(() => {
        const saved = localStorage.getItem('notificationSettings');
        if (saved) setSettings(JSON.parse(saved));
    },[]);

    const toggle = (key) => {
        const next = { ...settings, [key]: !settings[key]};
        setSettings(next);
        localStorage.setItem(`notificationsSettings`, JSON.stringify(next));
    };

    return (
        <div className='d-flex-column gap-3'>
            <label>
                <input ype="checkbox" checked={settings.project} onChange={() => toggle('project')} />
                프로젝트 알림
            </label>
            <label>
                <input ype="checkbox" checked={settings.apply} onChange={() => toggle('apply')} />
                지원 알림
            </label>
            <label>
                <input ype="checkbox" checked={settings.community} onChange={() => toggle('community')} />
                커뮤니티 알림
            </label>
        </div>
    )
}