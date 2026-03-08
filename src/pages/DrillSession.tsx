import { DrillLayout } from "../layouts/DrillLayout";
import { DrillSessionView } from "../features/practice/DrillSession";

export function DrillSessionPage() {
  return (
    <DrillLayout>
      <DrillSessionView />
    </DrillLayout>
  );
}
