import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption } from "./types";

export const palette = {
  shell: "#f6ecde",
  shellDeep: "#e9dac7",
  surface: "#fffaf3",
  surfaceMuted: "#f4e6d6",
  line: "#ddc6ab",
  burgundy: "#5a1a2a",
  burgundyDeep: "#341018",
  orange: "#f97316",
  orangeSoft: "#f3b27e",
  ink: "#241814",
  muted: "#7b6658",
  success: "#278c60",
  successSoft: "#d9f2e5",
};

export const fontFamily = {
  display: '"Bricolage Grotesque", "Trebuchet MS", sans-serif',
  body: '"Bricolage Grotesque", "Aptos", "Segoe UI", sans-serif',
};

export const BrowserFrame = ({
  title,
  accent,
  style,
  children,
}: {
  title: string;
  accent: string;
  style?: CSSProperties;
  children: ReactNode;
}) => {
  return (
    <div
      style={{
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: palette.surface,
        border: `1px solid ${palette.line}`,
        boxShadow: "0 28px 54px rgba(36, 24, 20, 0.12)",
        ...style,
      }}
    >
      <div
        style={{
          height: 52,
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#fdf7ef",
          borderBottom: `1px solid ${palette.line}`,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {["#c86c58", "#e0a350", "#69a06c"].map((color) => (
            <div
              key={color}
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                backgroundColor: color,
              }}
            />
          ))}
        </div>
        <div
          style={{
            padding: "9px 16px",
            minWidth: 200,
            borderRadius: 999,
            backgroundColor: palette.surfaceMuted,
            color: palette.muted,
            textAlign: "center",
            fontFamily: fontFamily.body,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            backgroundColor: accent,
          }}
        />
      </div>
      <div style={{ position: "relative", height: "calc(100% - 52px)" }}>{children}</div>
    </div>
  );
};

export const DeviceShell = ({
  title,
  style,
  children,
}: {
  title: string;
  style?: CSSProperties;
  children: ReactNode;
}) => {
  return (
    <div
      style={{
        width: 210,
        height: 360,
        borderRadius: 36,
        backgroundColor: palette.ink,
        padding: 10,
        boxShadow: "0 24px 48px rgba(36, 24, 20, 0.16)",
        ...style,
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 28,
          backgroundColor: palette.surface,
          overflow: "hidden",
          border: `1px solid ${palette.line}`,
        }}
      >
        <div
          style={{
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: `1px solid ${palette.line}`,
            fontFamily: fontFamily.body,
            fontWeight: 700,
            color: palette.burgundy,
            backgroundColor: "#fdf7ef",
          }}
        >
          {title}
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
};

export const StatCard = ({
  label,
  value,
  tone = "burgundy",
  style,
}: {
  label: string;
  value: string;
  tone?: "burgundy" | "orange";
  style?: CSSProperties;
}) => {
  const highlight = tone === "orange" ? palette.orange : palette.burgundy;

  return (
    <div
      style={{
        padding: "18px 18px 16px",
        borderRadius: 20,
        border: `1px solid ${palette.line}`,
        backgroundColor: "#fffdf9",
        boxShadow: "0 14px 30px rgba(36, 24, 20, 0.06)",
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: fontFamily.body,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: palette.muted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: fontFamily.display,
          fontSize: 30,
          lineHeight: 1,
          fontWeight: 700,
          color: highlight,
        }}
      >
        {value}
      </div>
    </div>
  );
};

export const ProofPillRow = ({ items }: { items: string[] }) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
      {items.map((item) => (
        <div
          key={item}
          style={{
            padding: "12px 16px",
            borderRadius: 999,
            backgroundColor: palette.surface,
            border: `1px solid ${palette.line}`,
            color: palette.burgundy,
            fontFamily: fontFamily.body,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export const CTAAccentCard = ({
  label,
  headline,
  body,
}: {
  label: string;
  headline: string;
  body: string;
}) => {
  return (
    <div
      style={{
        padding: 24,
        borderRadius: 26,
        backgroundColor: palette.burgundy,
        color: "white",
        boxShadow: "0 22px 44px rgba(52, 16, 24, 0.24)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#f7d8bf",
          fontFamily: fontFamily.body,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: fontFamily.display,
          fontSize: 30,
          fontWeight: 700,
          lineHeight: 1.05,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: fontFamily.body,
          fontSize: 16,
          lineHeight: 1.5,
          color: "#f9ebdd",
        }}
      >
        {body}
      </div>
    </div>
  );
};

export const CaptionOverlay = ({ captions }: { captions: Caption[] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;
  const activeCaption = captions.find((caption) => {
    return currentMs >= caption.startMs && currentMs < caption.endMs;
  }) ?? null;
  const reveal = spring({
    frame,
    fps,
    config: {
      damping: 18,
      stiffness: 120,
      mass: 0.8,
    },
  });

  if (!activeCaption) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 34,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 840,
          minHeight: 90,
          padding: "20px 26px",
          borderRadius: 28,
          backgroundColor: "rgba(36, 24, 20, 0.92)",
          color: "white",
          boxShadow: "0 20px 40px rgba(36, 24, 20, 0.28)",
          textAlign: "center",
          whiteSpace: "pre-wrap",
          fontFamily: fontFamily.display,
          fontSize: 32,
          fontWeight: 700,
          lineHeight: 1.2,
          transform: `translateY(${interpolate(reveal, [0, 1], [28, 0])}px)`,
          opacity: interpolate(reveal, [0, 1], [0, 1]),
        }}
      >
        {activeCaption.text}
      </div>
    </AbsoluteFill>
  );
};

export const SceneLayout = ({
  eyebrow,
  headline,
  subcopy,
  proofPoints,
  children,
}: {
  eyebrow: string;
  headline: string;
  subcopy: string;
  proofPoints: string[];
  children: ReactNode;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const intro = spring({
    frame,
    fps,
    config: {
      damping: 20,
      stiffness: 110,
      mass: 0.8,
    },
  });
  const copyOffset = interpolate(intro, [0, 1], [42, 0]);
  const visualOffset = interpolate(intro, [0, 1], [58, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.shell,
        color: palette.ink,
        fontFamily: fontFamily.body,
        padding: "56px 60px 40px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: palette.shellDeep,
          opacity: 0.36,
          transform: `translateX(${interpolate(frame, [0, 240], [0, -10], {
            extrapolateRight: "clamp",
          })}px)`,
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          gap: 36,
          flex: 1,
        }}
      >
        <div
          style={{
            width: 410,
            opacity: intro,
            transform: `translateX(${copyOffset}px)`,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: palette.orange,
              fontFamily: fontFamily.body,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 56,
              lineHeight: 1.02,
              letterSpacing: "-0.05em",
              fontWeight: 700,
              fontFamily: fontFamily.display,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 19,
              lineHeight: 1.55,
              color: palette.muted,
              maxWidth: 390,
            }}
          >
            {subcopy}
          </div>
          <ProofPillRow items={proofPoints} />
        </div>
        <div
          style={{
            flex: 1,
            position: "relative",
            opacity: intro,
            transform: `translateX(${visualOffset}px)`,
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};
