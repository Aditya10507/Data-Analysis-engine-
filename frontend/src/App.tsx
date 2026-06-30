import { ShowAppShell } from "./components/AppShell";
import { CatchAppErrors } from "./components/AppErrorBoundary";
import { ShowToastViewport } from "./components/ToastViewport";

/** Render and return the root application component. */
export function RenderApp() {
  return (
    <CatchAppErrors>
      <ShowAppShell />
      <ShowToastViewport />
    </CatchAppErrors>
  );
}
