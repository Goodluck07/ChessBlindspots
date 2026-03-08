import { DashboardLayout } from "../layouts/DashboardLayout";
import {
  PracticeView,
  type PracticeViewProps,
} from "../features/practice/Practice";

export function PracticePage({ blunders }: Readonly<PracticeViewProps>) {
  return (
    <DashboardLayout>
      <PracticeView blunders={blunders} />
    </DashboardLayout>
  );
}
