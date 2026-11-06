import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  Button,
  Card,
  Chart,
  Choices,
  ConfirmButton,
  Field,
  Notice,
  Row,
  Screen,
  Stack,
  Txt,
  useAction,
} from "../src/components/ui";
import { commit, getProfile, updateProfile, useData } from "../src/state/store";
import { metricNames, type Metric } from "../src/domain/model";
import {
  metrics,
  addDays,
  dailyValues,
  displayUnit,
  fromCanonical,
  localDay,
  rollingAverage,
} from "../src/domain/metrics";
export default function History() {
  const { metric: param } = useLocalSearchParams<{ metric?: string }>();
  const d = useData(),
    p = getProfile(),
    a = useAction();
  const [metric, setMetric] = useState<Metric>(
      metricNames.includes(param as Metric) ? (param as Metric) : "weight",
    ),
    [period, setPeriod] = useState("30");
  const today = localDay(new Date(), p.timezone);
  const [start, setStart] = useState(addDays(today, -29)),
    [end, setEnd] = useState(today);
  const from =
      period === "Custom" ? start : addDays(today, -Number(period) + 1),
    to = period === "Custom" ? end : today;
  const rows = d.measurements
    .filter(
      (m) =>
        m.metric === metric &&
        localDay(m.recordedAt, p.timezone) >= from &&
        localDay(m.recordedAt, p.timezone) <= to,
    )
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  const points = dailyValues(d.measurements, metric, p)
    .filter((r) => r.date >= from && r.date <= to)
    .map((r) => ({ ...r, value: fromCanonical(r.value, metric, p.units) }));
  const sources = [...new Set(rows.map((m) => m.source))];
  const avg = rollingAverage(points, to, 7);
  if (p.hideWeight && metric === "weight")
    return (
      <Screen title="Weight is hidden." back>
        <Notice text="Your weight history is retained. Change its visibility in Settings to view these records." />
        <Button onPress={() => router.push("/settings")}>
          Manage visibility
        </Button>
      </Screen>
    );
  return (
    <Screen title={metrics[metric].label} eyebrow="Your recorded history" back>
      <Choices
        label="Metric"
        options={metricNames.filter((m) => !(p.hideWeight && m === "weight"))}
        value={metric}
        onChange={setMetric}
      />
      <Choices
        label="Time window · days"
        options={["1", "7", "30", "90", "365", "Custom"]}
        value={period}
        onChange={setPeriod}
      />
      {period === "Custom" && (
        <Card>
          <Field label="From (YYYY-MM-DD)" value={start} onChange={setStart} />
          <Field label="To (YYYY-MM-DD)" value={end} onChange={setEnd} />
        </Card>
      )}
      <Card>
        <Txt variant="label">
          7-day average · {displayUnit(metric, p.units)}
        </Txt>
        <Txt variant="number">{avg?.toFixed(1) ?? "—"}</Txt>
        <Chart points={points} label={`${metrics[metric].label} history`} />
        <Txt variant="caption">
          One selected source per day. Missing days are omitted. All source
          records remain visible below.
        </Txt>
      </Card>
      {sources.length > 1 && (
        <Card>
          <Choices
            label="Preferred source for this metric"
            options={["Automatic", ...sources]}
            value={p.preferredSources[metric] || "Automatic"}
            onChange={(source) =>
              void a.run(() =>
                updateProfile({
                  preferredSources: {
                    ...p.preferredSources,
                    [metric]: source === "Automatic" ? "" : source,
                  },
                }),
              )
            }
          />
        </Card>
      )}
      <Button icon="add" onPress={() => router.push(`/log?metric=${metric}`)}>
        Add measurement
      </Button>
      {a.error && <Notice text={a.error} error />}
      {!rows.length && <Txt>No measurements in this period.</Txt>}
      {rows.slice(0, 150).map((m) => (
        <Card key={m.id}>
          <Row style={{ justifyContent: "space-between" }}>
            <Txt variant="heading">
              {fromCanonical(m.value, metric, p.units).toFixed(
                metric === "steps" ? 0 : 1,
              )}
              {m.secondary != null ? ` / ${m.secondary}` : ""}{" "}
              <Txt variant="caption">{displayUnit(metric, p.units)}</Txt>
            </Txt>
            <Button
              kind="quiet"
              onPress={() => router.push(`/log?id=${encodeURIComponent(m.id)}`)}
            >
              Review
            </Button>
          </Row>
          <Txt variant="caption">
            {new Date(m.recordedAt).toLocaleString()} · {m.source}
          </Txt>
          {m.notes && <Txt>{m.notes}</Txt>}
          <Txt variant="caption">
            Recorded unit: {m.unit} · Time zone: {m.timezone}
          </Txt>
          <ConfirmButton
            label="Delete this local entry"
            detail={
              m.dataType
                ? "This removes FORM’s copy. The original stays in Health Connect and can be imported again after reconciliation."
                : "Delete this measurement from your journal?"
            }
            onConfirm={() =>
              commit([{ collection: "measurements", id: m.id, value: null }])
            }
          />
        </Card>
      ))}
      {rows.length > 150 && (
        <Txt variant="caption">
          Showing 150 of {rows.length} entries. Narrow the date range to inspect
          older records.
        </Txt>
      )}
    </Screen>
  );
}
