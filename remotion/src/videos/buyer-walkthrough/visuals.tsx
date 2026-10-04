import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  BrowserFrame,
  CTAAccentCard,
  DeviceShell,
  StatCard,
  fontFamily,
  palette,
} from "./components";

const SurfacePanel = ({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      style={{
        borderRadius: 22,
        backgroundColor: "#fffdf9",
        border: `1px solid ${palette.line}`,
        boxShadow: "0 14px 30px rgba(36, 24, 20, 0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const SearchBar = ({ placeholder }: { placeholder: string }) => {
  return (
    <div
      style={{
        height: 46,
        borderRadius: 999,
        border: `1px solid ${palette.line}`,
        backgroundColor: palette.surfaceMuted,
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
        color: palette.muted,
        fontFamily: fontFamily.body,
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {placeholder}
    </div>
  );
};

const ProductTile = ({
  title,
  price,
  tone,
}: {
  title: string;
  price: string;
  tone: string;
}) => {
  return (
    <SurfacePanel style={{ padding: 12 }}>
      <div
        style={{
          height: 110,
          borderRadius: 16,
          backgroundColor: tone,
        }}
      />
      <div
        style={{
          marginTop: 12,
          fontFamily: fontFamily.display,
          fontSize: 20,
          lineHeight: 1.1,
          color: palette.ink,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            color: palette.burgundy,
            fontFamily: fontFamily.body,
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          {price}
        </div>
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 999,
            backgroundColor: palette.burgundy,
            color: "white",
            fontFamily: fontFamily.body,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Preview
        </div>
      </div>
    </SurfacePanel>
  );
};

const FieldRow = ({ label, fill = 0.72 }: { label: string; fill?: number }) => {
  return (
    <div>
      <div
        style={{
          fontFamily: fontFamily.body,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: palette.muted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          height: 42,
          marginTop: 10,
          borderRadius: 16,
          border: `1px solid ${palette.line}`,
          backgroundColor: "#fffdf9",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
        }}
      >
        <div
          style={{
            height: 10,
            width: `${fill * 100}%`,
            borderRadius: 999,
            backgroundColor: palette.surfaceMuted,
          }}
        />
      </div>
    </div>
  );
};

const ChartColumn = ({ height, tone }: { height: number; tone: string }) => {
  return (
    <div
      style={{
        width: 44,
        height,
        borderRadius: "14px 14px 0 0",
        backgroundColor: tone,
      }}
    />
  );
};

export const PlatformOverviewVisual = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrance = spring({ frame, fps, config: { damping: 20, stiffness: 100, mass: 0.9 } });
  const drift = interpolate(frame, [0, 240], [0, -16], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: "6px 0 0 0" }}>
      <BrowserFrame
        title="Stankings Brand Experience"
        accent={palette.orange}
        style={{
          position: "absolute",
          left: 0,
          top: 24,
          width: 480,
          height: 470,
          transform: `translateX(${interpolate(entrance, [0, 1], [36, 0]) + drift}px)`,
        }}
      >
        <div style={{ padding: 28 }}>
          <div style={{ display: "flex", gap: 14 }}>
            <SurfacePanel
              style={{
                width: 128,
                height: 150,
                backgroundColor: palette.burgundy,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: fontFamily.display,
                  fontSize: 34,
                  lineHeight: 1.05,
                  color: palette.ink,
                }}
              >
                Premium handmade pieces with a story-first storefront.
              </div>
              <div
                style={{
                  marginTop: 12,
                  height: 14,
                  width: 240,
                  borderRadius: 999,
                  backgroundColor: palette.surfaceMuted,
                }}
              />
              <div
                style={{
                  marginTop: 10,
                  height: 14,
                  width: 210,
                  borderRadius: 999,
                  backgroundColor: palette.surfaceMuted,
                }}
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 18 }}>
            {[palette.shellDeep, "#e3c09d", "#ddad7f"].map((tone, index) => (
              <SurfacePanel key={tone} style={{ padding: 14 }}>
                <div style={{ height: 90, borderRadius: 14, backgroundColor: tone }} />
                <div
                  style={{
                    marginTop: 12,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: palette.surfaceMuted,
                    width: index === 1 ? "76%" : "68%",
                  }}
                />
                <div
                  style={{
                    marginTop: 8,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: palette.surfaceMuted,
                    width: index === 2 ? "52%" : "60%",
                  }}
                />
              </SurfacePanel>
            ))}
          </div>
        </div>
      </BrowserFrame>
      <DeviceShell
        title="Store"
        style={{
          position: "absolute",
          left: 330,
          top: 154,
          transform: `translateY(${interpolate(entrance, [0, 1], [28, 0])}px)`,
        }}
      >
        <div
          style={{
            height: 86,
            borderRadius: 18,
            backgroundColor: "#e9caa8",
          }}
        />
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[palette.surfaceMuted, "#eed2b4", "#e6c5a0", palette.shellDeep].map((tone) => (
            <div key={tone} style={{ height: 72, borderRadius: 14, backgroundColor: tone }} />
          ))}
        </div>
      </DeviceShell>
      <SurfacePanel
        style={{
          position: "absolute",
          right: 8,
          top: 108,
          width: 248,
          padding: 18,
          transform: `translateX(${interpolate(entrance, [0, 1], [32, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fontFamily.body,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: palette.orange,
          }}
        >
          Protected Admin
        </div>
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <StatCard label="Orders" value="126" style={{ padding: 14 }} />
          <StatCard label="Revenue" value="$9.8k" tone="orange" style={{ padding: 14 }} />
        </div>
        <div
          style={{
            marginTop: 16,
            height: 150,
            borderRadius: 18,
            backgroundColor: palette.surfaceMuted,
            padding: 16,
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
          }}
        >
          {[70, 106, 92, 132, 156].map((height, index) => (
            <ChartColumn
              key={height}
              height={height}
              tone={index % 2 === 0 ? palette.burgundy : palette.orangeSoft}
            />
          ))}
        </div>
      </SurfacePanel>
    </AbsoluteFill>
  );
};

export const LandingSiteVisual = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 240], [0, -18], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ paddingTop: 22 }}>
      <BrowserFrame
        title="Landing Experience"
        accent={palette.burgundy}
        style={{
          width: 690,
          height: 500,
          transform: `translateX(${drift}px)`,
        }}
      >
        <div style={{ padding: 28 }}>
          <div
            style={{
              height: 196,
              borderRadius: 24,
              backgroundColor: palette.burgundy,
              padding: 24,
              color: "white",
            }}
          >
            <div
              style={{
                width: 110,
                padding: "8px 12px",
                borderRadius: 999,
                backgroundColor: "#6e2638",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: fontFamily.body,
              }}
            >
              Crafted
            </div>
            <div
              style={{
                marginTop: 18,
                fontFamily: fontFamily.display,
                fontSize: 40,
                lineHeight: 1.05,
                maxWidth: 380,
              }}
            >
              Tell the story behind the brand before the first purchase.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16, marginTop: 16 }}>
            <SurfacePanel style={{ padding: 18 }}>
              <div style={{ display: "flex", gap: 12 }}>
                {[palette.shellDeep, "#ebc9a5", "#e2b387"].map((tone) => (
                  <div key={tone} style={{ flex: 1, height: 96, borderRadius: 16, backgroundColor: tone }} />
                ))}
              </div>
              <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                {[0.92, 0.82, 0.7].map((fill) => (
                  <div key={fill} style={{ height: 10, width: `${fill * 100}%`, borderRadius: 999, backgroundColor: palette.surfaceMuted }} />
                ))}
              </div>
            </SurfacePanel>
            <SurfacePanel style={{ padding: 18 }}>
              <div
                style={{
                  fontFamily: fontFamily.body,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: palette.orange,
                }}
              >
                FAQ + Contact
              </div>
              <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                {["Delivery timelines", "Custom requests", "Care instructions"].map((item) => (
                  <div
                    key={item}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 14,
                      backgroundColor: palette.surfaceMuted,
                      color: palette.ink,
                      fontFamily: fontFamily.body,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </SurfacePanel>
          </div>
        </div>
      </BrowserFrame>
      <DeviceShell title="WhatsApp CTA" style={{ position: "absolute", right: 18, top: 146 }}>
        <div
          style={{
            padding: 16,
            borderRadius: 18,
            backgroundColor: "#def0e5",
            color: palette.success,
            fontFamily: fontFamily.body,
            fontWeight: 700,
          }}
        >
          Ask about custom orders and get a direct response.
        </div>
        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 18,
            backgroundColor: palette.burgundy,
            color: "white",
            fontFamily: fontFamily.display,
            fontSize: 24,
            lineHeight: 1.1,
          }}
        >
          Start the conversation where the buyer already is.
        </div>
      </DeviceShell>
    </AbsoluteFill>
  );
};

export const StorefrontVisual = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({ frame, fps, config: { damping: 22, stiffness: 120, mass: 0.9 } });

  return (
    <AbsoluteFill style={{ paddingTop: 20 }}>
      <BrowserFrame title="Storefront" accent={palette.orange} style={{ width: 704, height: 510 }}>
        <div style={{ padding: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.65fr", gap: 18 }}>
            <div>
              <SearchBar placeholder="Search handcrafted bags, baskets, and custom sets" />
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                {["All", "Bags", "Sets", "Decor"].map((item, index) => (
                  <div
                    key={item}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 999,
                      backgroundColor: index === 0 ? palette.burgundy : palette.surfaceMuted,
                      color: index === 0 ? "white" : palette.burgundy,
                      fontFamily: fontFamily.body,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  transform: `translateY(${interpolate(reveal, [0, 1], [24, 0])}px)`,
                  opacity: reveal,
                }}
              >
                <ProductTile title="Signature Tote" price="$120" tone="#e7c29d" />
                <ProductTile title="Palm Storage Set" price="$85" tone="#dec0a0" />
                <ProductTile title="Travel Basket" price="$98" tone="#e9d4bc" />
                <ProductTile title="Gift Bundle" price="$140" tone="#efc998" />
              </div>
            </div>
            <SurfacePanel style={{ padding: 18 }}>
              <div
                style={{
                  fontFamily: fontFamily.body,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: palette.orange,
                }}
              >
                Live Cart
              </div>
              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                {[
                  ["Signature Tote", "$120"],
                  ["Gift Bundle", "$140"],
                ].map(([item, amount]) => (
                  <div
                    key={item}
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      backgroundColor: palette.surfaceMuted,
                    }}
                  >
                    <div style={{ fontFamily: fontFamily.display, fontSize: 19, color: palette.ink }}>{item}</div>
                    <div style={{ marginTop: 6, color: palette.burgundy, fontWeight: 700, fontFamily: fontFamily.body }}>{amount}</div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 18,
                  padding: "16px 18px",
                  borderRadius: 18,
                  backgroundColor: palette.burgundy,
                  color: "white",
                  fontFamily: fontFamily.display,
                  fontSize: 26,
                }}
              >
                Total $260
              </div>
            </SurfacePanel>
          </div>
        </div>
      </BrowserFrame>
      <DeviceShell title="Product Preview" style={{ position: "absolute", right: 10, top: 120 }}>
        <div style={{ height: 140, borderRadius: 18, backgroundColor: "#e4bf96" }} />
        <div style={{ marginTop: 14, fontFamily: fontFamily.display, fontSize: 26, color: palette.ink }}>
          Signature Tote
        </div>
        <div style={{ marginTop: 8, color: palette.muted, fontFamily: fontFamily.body, lineHeight: 1.4 }}>
          Quick product details keep the path to cart clear on mobile too.
        </div>
      </DeviceShell>
    </AbsoluteFill>
  );
};

export const CheckoutVisual = () => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, 240], [22, -10], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ paddingTop: 18 }}>
      <BrowserFrame title="Checkout + Verification" accent={palette.orange} style={{ width: 720, height: 520 }}>
        <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1.08fr 0.92fr", gap: 18 }}>
          <SurfacePanel style={{ padding: 18 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <FieldRow label="Customer name" />
              <FieldRow label="Phone number" fill={0.6} />
              <FieldRow label="Delivery address" fill={0.9} />
              <FieldRow label="Notes" fill={0.42} />
            </div>
            <div
              style={{
                marginTop: 18,
                padding: "16px 18px",
                borderRadius: 18,
                backgroundColor: palette.burgundy,
                color: "white",
                fontFamily: fontFamily.display,
                fontSize: 24,
                textAlign: "center",
              }}
            >
              Continue to Paystack
            </div>
          </SurfacePanel>
          <SurfacePanel style={{ padding: 18 }}>
            <div
              style={{
                fontFamily: fontFamily.body,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: palette.orange,
              }}
            >
              Order Summary
            </div>
            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {[
                ["Signature Tote", "$120"],
                ["Gift Bundle", "$140"],
                ["Delivery", "$12"],
              ].map(([item, amount]) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: `1px solid ${palette.line}`,
                    fontFamily: fontFamily.body,
                  }}
                >
                  <div style={{ color: palette.ink, fontWeight: 600 }}>{item}</div>
                  <div style={{ color: palette.burgundy, fontWeight: 700 }}>{amount}</div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 18,
                padding: 18,
                borderRadius: 18,
                backgroundColor: "#def0e5",
                color: palette.success,
                fontFamily: fontFamily.body,
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Server confirms payment before the order is marked successful.
            </div>
          </SurfacePanel>
        </div>
      </BrowserFrame>
      <SurfacePanel
        style={{
          position: "absolute",
          right: 12,
          top: 132,
          width: 250,
          padding: 20,
          transform: `translateY(${rise}px)`,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 999,
            backgroundColor: "#def0e5",
            color: palette.success,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          1
        </div>
        <div style={{ marginTop: 14, fontFamily: fontFamily.display, fontSize: 28, color: palette.ink }}>
          Payment verified
        </div>
        <div style={{ marginTop: 8, color: palette.muted, fontFamily: fontFamily.body, lineHeight: 1.45 }}>
          Order confirmation and customer messaging follow a successful server-side check.
        </div>
      </SurfacePanel>
      <SurfacePanel
        style={{
          position: "absolute",
          right: 42,
          bottom: 34,
          width: 218,
          padding: 18,
          backgroundColor: palette.burgundy,
          color: "white",
        }}
      >
        <div style={{ fontFamily: fontFamily.body, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f5d8bf" }}>
          Notification
        </div>
        <div style={{ marginTop: 12, fontFamily: fontFamily.display, fontSize: 24, lineHeight: 1.1 }}>
          Customer update sent instantly.
        </div>
      </SurfacePanel>
    </AbsoluteFill>
  );
};

export const AnalyticsVisual = () => {
  const frame = useCurrentFrame();
  const chartLift = interpolate(frame, [0, 240], [16, -8], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ paddingTop: 18 }}>
      <BrowserFrame title="Admin Analytics Dashboard" accent={palette.burgundy} style={{ width: 720, height: 518 }}>
        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <StatCard label="GMV" value="$18.4k" tone="orange" />
            <StatCard label="Orders" value="126" />
            <StatCard label="Conversion" value="4.8%" tone="orange" />
            <StatCard label="AOV" value="$146" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 16, marginTop: 18 }}>
            <SurfacePanel style={{ padding: 18 }}>
              <div style={{ color: palette.muted, fontFamily: fontFamily.body, fontWeight: 700, fontSize: 13 }}>
                Monthly demand
              </div>
              <div
                style={{
                  marginTop: 20,
                  height: 220,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 16,
                  transform: `translateY(${chartLift}px)`,
                }}
              >
                {[78, 104, 130, 122, 166, 188].map((height, index) => (
                  <ChartColumn
                    key={height}
                    height={height}
                    tone={index > 3 ? palette.burgundy : palette.orangeSoft}
                  />
                ))}
              </div>
            </SurfacePanel>
            <SurfacePanel style={{ padding: 18 }}>
              <div style={{ color: palette.muted, fontFamily: fontFamily.body, fontWeight: 700, fontSize: 13 }}>
                Category mix
              </div>
              <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
                {[
                  ["Bags", "42%"],
                  ["Sets", "31%"],
                  ["Decor", "17%"],
                  ["Custom", "10%"],
                ].map(([label, share], index) => (
                  <div key={label}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontFamily: fontFamily.body,
                        fontSize: 14,
                        fontWeight: 700,
                        color: palette.ink,
                      }}
                    >
                      <span>{label}</span>
                      <span style={{ color: palette.burgundy }}>{share}</span>
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        height: 12,
                        borderRadius: 999,
                        backgroundColor: palette.surfaceMuted,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${[42, 31, 17, 10][index]}%`,
                          borderRadius: 999,
                          backgroundColor: index % 2 === 0 ? palette.burgundy : palette.orange,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SurfacePanel>
          </div>
        </div>
      </BrowserFrame>
      <SurfacePanel style={{ position: "absolute", right: 12, top: 152, width: 250, padding: 18 }}>
        <div style={{ fontFamily: fontFamily.body, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: palette.orange }}>
          Access model
        </div>
        <div style={{ marginTop: 12, fontFamily: fontFamily.display, fontSize: 28, lineHeight: 1.08, color: palette.ink }}>
          Google-only admin login.
        </div>
        <div style={{ marginTop: 10, color: palette.muted, fontFamily: fontFamily.body, lineHeight: 1.45 }}>
          Only approved accounts can enter the dashboard and manage the business.
        </div>
      </SurfacePanel>
    </AbsoluteFill>
  );
};

export const ProductManagementVisual = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const floatIn = spring({ frame, fps, config: { damping: 18, stiffness: 110, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ paddingTop: 18 }}>
      <BrowserFrame title="Catalog Management" accent={palette.orange} style={{ width: 704, height: 520 }}>
        <div style={{ padding: 24, display: "grid", gridTemplateColumns: "0.86fr 1.14fr", gap: 18 }}>
          <SurfacePanel style={{ padding: 16 }}>
            <SearchBar placeholder="Search products" />
            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
              {[
                ["Signature Tote", "$120"],
                ["Palm Storage Set", "$85"],
                ["Gift Bundle", "$140"],
              ].map(([name, amount], index) => (
                <div
                  key={name}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    backgroundColor: index === 0 ? "#f0ded0" : palette.surfaceMuted,
                    border: `1px solid ${palette.line}`,
                  }}
                >
                  <div style={{ fontFamily: fontFamily.display, fontSize: 22, color: palette.ink }}>{name}</div>
                  <div style={{ marginTop: 6, color: palette.burgundy, fontFamily: fontFamily.body, fontWeight: 700 }}>{amount}</div>
                </div>
              ))}
            </div>
          </SurfacePanel>
          <SurfacePanel style={{ padding: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "0.42fr 0.58fr", gap: 16 }}>
              <div style={{ height: 232, borderRadius: 20, backgroundColor: "#e3bf97" }} />
              <div style={{ display: "grid", gap: 12 }}>
                <FieldRow label="Product title" fill={0.8} />
                <FieldRow label="Price" fill={0.35} />
                <FieldRow label="Category" fill={0.5} />
                <FieldRow label="Image upload" fill={0.62} />
              </div>
            </div>
            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 18,
                  backgroundColor: palette.burgundy,
                  color: "white",
                  fontFamily: fontFamily.display,
                  fontSize: 24,
                  textAlign: "center",
                }}
              >
                Save changes
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: 18,
                  backgroundColor: palette.surfaceMuted,
                  color: palette.burgundy,
                  fontFamily: fontFamily.body,
                  fontSize: 16,
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                Update inventory
              </div>
            </div>
          </SurfacePanel>
        </div>
      </BrowserFrame>
      <div
        style={{
          position: "absolute",
          right: 18,
          bottom: 28,
          width: 274,
          transform: `translateY(${interpolate(floatIn, [0, 1], [36, 0])}px)`,
          opacity: floatIn,
        }}
      >
        <CTAAccentCard
          label="Client close"
          headline="Own the full sales system, not just the pages."
          body="Brand presentation, purchase flow, payments, and operations all live in one business-ready platform."
        />
      </div>
    </AbsoluteFill>
  );
};
