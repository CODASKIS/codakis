import { useMemo } from "react";
import { DRIVING_SIMULATOR_ENABLED, SimulationsFromHtml, stripSimulationBlocks } from "./simulationEmbed";

type Props = {
  html: string;
  className?: string;
};

export default function RichPedagogyContent({ html, className = "" }: Props) {
  const displayHtml = useMemo(() => stripSimulationBlocks(html), [html]);

  return (
    <>
      {displayHtml.trim() ? (
        <div className={className} dangerouslySetInnerHTML={{ __html: displayHtml }} />
      ) : null}
      <SimulationsFromHtml html={html} />
    </>
  );
}
