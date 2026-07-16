import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type WeeklyDigestReminderItem = {
  hackathonName: string;
  /* Date-based headline, e.g. "Applications open Jul 23, 2026" — digest items
     land up to two weeks ahead, so relative wording like "in a week" would lie. */
  headline: string;
  detailUrl: string;
};

export type WeeklyDigestCountryItem = {
  name: string;
  location: string;
  dateRange: string;
  detailUrl: string;
};

export type WeeklyDigestEmailProps = {
  greetingName: string;
  reminderItems: WeeklyDigestReminderItem[];
  country: string | null;
  countryItems: WeeklyDigestCountryItem[];
  browseUrl: string;
  pipelineUrl: string;
  unsubscribeUrl: string;
};

const maroon = "#660000";
const ink = "#1A1A1A";
const muted = "#706F6B";
const border = "#E5E1DC";

const main = {
  backgroundColor: "#EFEDEA",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'",
};

const container = {
  margin: "0 auto",
  maxWidth: "520px",
  padding: "32px 0 48px",
};

const card = {
  backgroundColor: "#FFFFFF",
  border: `1px solid ${border}`,
  borderRadius: "12px",
  padding: "32px",
};

const eyebrow = {
  color: maroon,
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
};

const heading = {
  color: ink,
  fontSize: "22px",
  fontWeight: 600,
  lineHeight: "28px",
  margin: "0 0 16px",
};

const paragraph = {
  color: ink,
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const sectionTitle = {
  color: maroon,
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  margin: "24px 0 12px",
};

const itemRow = {
  border: `1px solid ${border}`,
  borderRadius: "10px",
  margin: "0 0 12px",
  padding: "16px 18px",
};

const itemName = {
  color: ink,
  fontSize: "16px",
  fontWeight: 600,
  lineHeight: "22px",
  margin: "0 0 4px",
};

const meta = {
  color: muted,
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0",
};

const button = {
  backgroundColor: maroon,
  borderRadius: "8px",
  color: "#FFFFFF",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 600,
  padding: "12px 20px",
  textDecoration: "none",
};

const secondaryLink = {
  color: maroon,
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
};

const footer = {
  color: muted,
  fontSize: "12px",
  lineHeight: "18px",
  margin: "24px 0 0",
  textAlign: "center" as const,
};

const unsubscribeButton = {
  border: `1px solid ${muted}`,
  borderRadius: "8px",
  color: muted,
  display: "inline-block",
  fontSize: "12px",
  fontWeight: 600,
  marginTop: "12px",
  padding: "8px 14px",
  textDecoration: "none",
};

export function WeeklyDigestEmail({
  greetingName,
  reminderItems,
  country,
  countryItems,
  browseUrl,
  pipelineUrl,
  unsubscribeUrl,
}: WeeklyDigestEmailProps) {
  const updateCount = reminderItems.length + countryItems.length;
  const intro =
    updateCount === 1
      ? "One update for your week ahead."
      : `${updateCount} updates for your week ahead.`;

  return (
    <Html>
      <Head />
      <Preview>{intro}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Text style={eyebrow}>Weekly digest</Text>
            <Heading style={heading}>Your week ahead</Heading>
            <Text style={paragraph}>Hey {greetingName},</Text>
            <Text style={paragraph}>{intro}</Text>

            {reminderItems.length ? (
              <>
                <Text style={sectionTitle}>Coming up</Text>
                {reminderItems.map((item) => (
                  <Section key={`${item.detailUrl}:${item.headline}`} style={itemRow}>
                    <Text style={itemName}>
                      <Link href={item.detailUrl} style={{ color: ink, textDecoration: "none" }}>
                        {item.hackathonName}
                      </Link>
                    </Text>
                    <Text style={meta}>{item.headline}</Text>
                  </Section>
                ))}
              </>
            ) : null}

            {country && countryItems.length ? (
              <>
                <Text style={sectionTitle}>New in {country}</Text>
                {countryItems.map((item) => (
                  <Section key={item.detailUrl} style={itemRow}>
                    <Text style={itemName}>
                      <Link href={item.detailUrl} style={{ color: ink, textDecoration: "none" }}>
                        {item.name}
                      </Link>
                    </Text>
                    <Text style={meta}>
                      {item.location} · {item.dateRange}
                    </Text>
                  </Section>
                ))}
              </>
            ) : null}

            <Section style={{ margin: "24px 0" }}>
              <Button href={reminderItems.length ? pipelineUrl : browseUrl} style={button}>
                {reminderItems.length ? "Open your pipeline" : "Browse the Hackathons DB"}
              </Button>
            </Section>
            <Hr style={{ borderColor: border, margin: "24px 0" }} />
            <Text style={meta}>
              Keeping your status current keeps these digests accurate.{" "}
              <Link href={pipelineUrl} style={secondaryLink}>
                Open your pipeline
              </Link>
              .
            </Text>
          </Section>
          <Text style={footer}>
            You are receiving this weekly digest because of your saved hackathons and alerts on Haethon.
          </Text>
          <Section style={{ textAlign: "center" }}>
            <Button href={unsubscribeUrl} style={unsubscribeButton}>
              Unsubscribe from all emails
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
