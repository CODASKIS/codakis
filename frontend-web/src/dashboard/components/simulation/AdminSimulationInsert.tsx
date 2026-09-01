import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { AuthApiError } from "../../../lib/authApi";
import { adminGenerateSimulation, simulationRefEmbedHtml } from "../../../lib/simulationApi";
import { SCENARIO_OPTIONS } from "./presets";
import { simulationEmbedHtml } from "./simulationEmbed";

type Props = {
  onInsert: (snippet: string) => void;
  themeId?: string;
  lessonTitle?: string;
  lessonContext?: string;
};

export default function AdminSimulationInsert({ onInsert, themeId, lessonTitle, lessonContext }: Props) {
  const { t } = useTranslation();
  const [scenarioId, setScenarioId] = useState("draft");
  const [aiTitle, setAiTitle] = useState(lessonTitle ?? "");
  const [aiContext, setAiContext] = useState(lessonContext ?? "");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleGenerate() {
    if (!aiTitle.trim() || !aiContext.trim()) {
      setError(t("simulation.aiMissing"));
      return;
    }
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      const record = await adminGenerateSimulation({
        title: aiTitle.trim(),
        context: aiContext.trim(),
        theme_id: themeId,
        language: "fr",
      });
      onInsert(simulationRefEmbedHtml(record.id));
      setSuccess(t("simulation.aiSuccess", { title: record.title }));
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : t("simulation.aiError"));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="codakis-sim-insert">
      <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
        <Form.Group className="mb-0">
          <Form.Label className="small mb-1">{t("simulation.insertLabel")}</Form.Label>
          <Form.Select size="sm" value={scenarioId} onChange={(e) => setScenarioId(e.target.value)}>
            {SCENARIO_OPTIONS.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Button type="button" size="sm" variant="outline-primary" onClick={() => onInsert(simulationEmbedHtml(scenarioId))}>
          {t("simulation.insertButton")}
        </Button>
      </div>

      <div className="codakis-sim-insert__ai">
        <strong>{t("simulation.aiTitle")}</strong>
        <p className="small text-muted mb-2">{t("simulation.aiHint")}</p>
        <Form.Group className="mb-2">
          <Form.Label className="small">{t("simulation.aiSceneTitle")}</Form.Label>
          <Form.Control size="sm" value={aiTitle} onChange={(e) => setAiTitle(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label className="small">{t("simulation.aiContext")}</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            size="sm"
            value={aiContext}
            onChange={(e) => setAiContext(e.target.value)}
            placeholder={t("simulation.aiContextPlaceholder")}
          />
        </Form.Group>
        <Button type="button" size="sm" variant="primary" disabled={generating} onClick={() => void handleGenerate()}>
          {generating ? t("simulation.aiGenerating") : t("simulation.aiGenerate")}
        </Button>
      </div>

      {error ? <Alert variant="danger" className="mt-2 py-2 small mb-0">{error}</Alert> : null}
      {success ? <Alert variant="success" className="mt-2 py-2 small mb-0">{success}</Alert> : null}
    </div>
  );
}
