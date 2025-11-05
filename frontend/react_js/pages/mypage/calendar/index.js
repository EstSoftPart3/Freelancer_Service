import MyPageLayout from '../MyPageLayout';
import Calendar from './Calendar';

export default function CalendarPage() {
  return (
    <MyPageLayout userType="PERSONAL">
      <Calendar />
    </MyPageLayout>
  );
}

