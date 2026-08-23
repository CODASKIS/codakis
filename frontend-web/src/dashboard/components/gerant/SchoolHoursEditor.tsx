import { Form, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { DEFAULT_SCHOOL_HOURS, SCHOOL_HOUR_DAYS, type SchoolHours } from "../../../lib/schoolHours";

type SchoolHoursEditorProps = {
  value: SchoolHours;
  onChange: (value: SchoolHours) => void;
  readOnly?: boolean;
};

export default function SchoolHoursEditor({ value, onChange, readOnly = false }: SchoolHoursEditorProps) {
  const { t } = useTranslation();

  function updateDay(day: keyof SchoolHours, next: string) {
    onChange({ ...value, [day]: next });
  }

  return (
    <div>
      <h6 className="mb-2">{t("dashboard.profile.schoolHoursTitle")}</h6>
      <p className="text-muted mb-3">{t("dashboard.profile.schoolHoursHint")}</p>
      <Table size="sm" className="align-middle mb-0">
        <thead>
          <tr>
            <th>{t("dashboard.profile.schoolHoursDay")}</th>
            <th>{t("dashboard.profile.schoolHoursValue")}</th>
          </tr>
        </thead>
        <tbody>
          {SCHOOL_HOUR_DAYS.map((day) => (
            <tr key={day}>
              <td className="fw-semibold">{t(`dashboard.profile.weekdays.${day}`)}</td>
              <td>
                <Form.Control
                  value={value[day]}
                  placeholder={DEFAULT_SCHOOL_HOURS[day]}
                  readOnly={readOnly}
                  disabled={readOnly}
                  onChange={(event) => updateDay(day, event.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
