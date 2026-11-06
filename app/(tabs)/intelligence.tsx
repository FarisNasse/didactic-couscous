import React, { useState } from "react";
import { Linking } from "react-native";
import {
  Button,
  Card,
  Chart,
  Choices,
  Notice,
  Pill,
  Row,
  Screen,
  Section,
  Stack,
  Txt,
  useAction,
} from "../../src/components/ui";
import { useData, getProfile, commit } from "../../src/state/store";
import { addDays, dailyValues, localDay } from "../../src/domain/metrics";
import { correlation, insights } from "../../src/domain/insights";
import { reportHtml } from "../../src/domain/report";
import { shareReport } from "../../src/integrations/files";
export default function Intelligence() {
  const d = useData(),
    p = getProfile(),
    a = useAction(),
    today = localDay(new Date(), p.timezone);
  const findings = insights(d, p, today);
  const [period, setPeriod] = useState("7"),
    [pair, setPair] = useState("Activity & resting heart rate");
  const start = addDays(today, -29);
  const first = dailyValues(
    d.measurements,
    pair === "Sleep & perceived energy" ? "sleep" : "steps",
    p,
  ).filter((v) => v.date >= start && v.date <= today);
  const second =
    pair === "Sleep & perceived energy"
      ? d.checkins
          .filter((c) => c.date >= start && c.date <= today)
          .map((c) => ({ date: c.date, value: c.energy }))
      : dailyValues(d.measurements, "restingHeartRate", p).filter(
          (v) => v.date >= start && v.date <= today,
        );
  const result = correlation(first, second);
  return (
    <Screen title="A clearer picture." eyebrow="Personal intelligence">
      <Card tone="sage">
        <Pill>From observations to useful action</Pill>
        <Txt variant="heading">Small changes. Clear reasons.</Txt>
        <Txt>
          These findings use your recorded history and transparent rules.
          Missing measurements stay missing. No universal health score.
        </Txt>
      </Card>
      <Section title="Worth your attention">
        {findings.map((i) => (
          <Card key={i.id}>
            <Pill>{i.confidence} evidence</Pill>
            <Txt variant="heading">{i.title}</Txt>
            <Txt>{i.observation}</Txt>
            <Txt style={{ fontWeight: "500" }}>{i.action}</Txt>
            <Txt variant="caption">{i.evidence}</Txt>
            <Txt variant="caption">{i.source}</Txt>
            {a.error && <Notice text={a.error} error />}
            <Row>
              <Button
                kind="secondary"
                onPress={() =>
                  a.run(() =>
                    commit([
                      {
                        collection: "insightStates",
                        id: i.id,
                        value: {
                          id: i.id,
                          status: "accepted",
                          updatedAt: new Date().toISOString(),
                        },
                      },
                    ]),
                  )
                }
              >
                {d.insightStates.some(
                  (s) => s.id === i.id && s.status === "accepted",
                )
                  ? "Saved priority"
                  : "Save priority"}
              </Button>
              <Button
                kind="quiet"
                onPress={() =>
                  a.run(() =>
                    commit([
                      {
                        collection: "insightStates",
                        id: i.id,
                        value: {
                          id: i.id,
                          status: "dismissed",
                          updatedAt: new Date().toISOString(),
                        },
                      },
                    ]),
                  )
                }
              >
                Dismiss
              </Button>
              {i.source.startsWith("https:") && (
                <Button
                  kind="quiet"
                  onPress={() =>
                    Linking.openURL(i.source).then(() => undefined)
                  }
                >
                  Source
                </Button>
              )}
            </Row>
          </Card>
        ))}
      </Section>
      <Section title="Explore a relationship">
        <Card>
          <Choices
            options={[
              "Activity & resting heart rate",
              "Sleep & perceived energy",
            ]}
            value={pair}
            onChange={setPair}
          />
          <Txt variant="heading">
            {result.r === null
              ? "More shared history needed"
              : `Correlation: ${result.r.toFixed(2)}`}
          </Txt>
          <Txt>
            {result.n} matched days in the last 30. At least seven are required,
            with variation in both measurements.
          </Txt>
          <Txt variant="caption">
            Association does not establish cause. A small sample, missing days
            and changes in routines may distort this relationship.
          </Txt>
          {first.length > 0 && (
            <>
              <Txt variant="caption">
                {pair === "Sleep & perceived energy"
                  ? "Sleep · hours"
                  : "Activity · steps"}
              </Txt>
              <Chart points={first} label={pair} />
            </>
          )}
        </Card>
      </Section>
      <Section title="Take your progress with you">
        <Card>
          <Choices
            label="Review period"
            options={["7", "30", "90"]}
            value={period}
            onChange={setPeriod}
          />
          <Txt>
            Create a printable review with activity, sleep, nutrition coverage,
            observations and blood-pressure context.
          </Txt>
          <Notice text="Reports contain personal health information. Exporting opens your device’s share sheet; the exported copy is not encrypted." />
          <Button
            disabled={a.busy}
            icon="download-outline"
            onPress={() =>
              a.run(() => shareReport(reportHtml(d, p, today, Number(period))))
            }
          >
            Create{" "}
            {period === "7"
              ? "weekly"
              : period === "30"
                ? "monthly"
                : "quarterly"}{" "}
            PDF review
          </Button>
          {a.error && <Notice text={a.error} error />}
        </Card>
      </Section>
    </Screen>
  );
}
