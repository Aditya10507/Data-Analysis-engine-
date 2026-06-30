import { Chart, registerables, type ChartConfiguration } from "chart.js";
import { useEffect, useRef } from "react";

Chart.register(...registerables);

type ChartCanvasProps = {
  config: ChartConfiguration;
};

/** Show and return a Chart.js canvas. */
export function ShowChartCanvas({ config }: ChartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined;
    }

    const chart = new Chart(canvasRef.current, config);
    return () => chart.destroy();
  }, [config]);

  return <canvas ref={canvasRef} className="h-80 w-full" />;
}
