import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

import {
  annotationColor,
  r5annotationColor,
  xLine,
  yLine,
  Scatter,
} from "./common";
import { useApi } from "../../utils/client";
import { useState } from "react";
import { classForPercent } from "../../../../shared/utils/classification";
import { bgColorForClass } from "../../utils/color";
import { SelectButton } from "primereact/selectbutton";

const lines = {
  ...yLine("0.9th", 0.9, annotationColor(0.7)),
  ...yLine("4.75th", 4.75, annotationColor(0.5)),
  ...yLine("14.5th", 14.5, annotationColor(0.4)),
  ...yLine("40th", 40, annotationColor(0.3)),
  ...yLine("80th", 80, annotationColor(0.2)),
  ...xLine("95%", 95, r5annotationColor(0.5), 2.5),
  ...xLine("85%", 85, r5annotationColor(0.5), 2.5),
  ...xLine("75%", 75, r5annotationColor(0.5), 2.5),
  ...xLine("60%", 60, r5annotationColor(0.5), 2.5),
  ...xLine("40%", 40, r5annotationColor(0.5), 2.5),
};

const modes = ["HQ", "Cur. HHF", "Recommended"];
const fieldForMode = (mode) =>
  ({
    HQ: "curPercent",
    "Cur. HHF": "curHHFPercent",
    Recommended: "recPercent",
  }[mode]);

export const ShootersDistributionChart = ({ division }) => {
  const [colorMode, setColorMode] = useState(modes[2]);
  const [xMode, setXMode] = useState(modes[2]);
  const data = useApi(`/shooters/${division}/chart`);

  if (!data?.length) {
    return <ProgressSpinner />;
  }

  const graph = (
    <Scatter
      style={{ position: "relative", width: "100%", height: "100%" }}
      options={{
        maintainAspectRatio: true,
        scales: { y: { reverse: true } },
        elements: {
          point: {
            radius: 3,
          },
        },
        plugins: {
          zoom: {
            pan: { enabled: true },
            zoom: {
              mode: "xy",
              enabled: true,
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: ({
                raw: { recPercent, curHHFPercent, curPercent, memberNumber, y },
              }) =>
                `${memberNumber}; ${y.toFixed(
                  2
                )}th, Rec: ${recPercent}%, curHHF: ${curHHFPercent}%, HQ: ${curPercent}%`,
            },
          },
          annotation: { annotations: lines },
        },
      }}
      data={{
        datasets: [
          {
            label: "Classification / Percentile",
            data: data.map((c) => ({
              ...c,
              x: c[fieldForMode(xMode)],
              y: c[fieldForMode(xMode) + "Percentile"],
            })),
            pointBorderColor: "white",
            pointBorderWidth: 0,
            backgroundColor: "#ae9ef1",
            pointBackgroundColor: data.map(
              (c) =>
                bgColorForClass[classForPercent(c[fieldForMode(colorMode)])]
            ),
          },
        ],
      }}
    />
  );

  return (
    <div
      style={{
        maxHeight: "100%",
        maxWidth: "100%",
      }}
    >
      <div className="flex align-items-center mt-4 justify-content-between">
        <div
          className="flex flex-row align-items-center"
          style={{ transform: "scale(0.65)" }}
        >
          <span className="text-xl mx-4">Color:</span>
          <SelectButton
            options={modes}
            value={colorMode}
            onChange={(e) => setColorMode(e.value)}
            style={{ transforms: "scale(0.65)" }}
          />
        </div>
        <div className="flex-grow-1" />
        <div
          className="flex flex-row align-items-center"
          style={{ transform: "scale(0.65)" }}
        >
          <span className="text-xl mx-4">Position:</span>
          <SelectButton
            options={modes}
            value={xMode}
            onChange={(e) => setXMode(e.value)}
            style={{ transforms: "scale(0.65)" }}
          />
        </div>
      </div>
      {graph}
    </div>
  );
};

export default ShootersDistributionChart;