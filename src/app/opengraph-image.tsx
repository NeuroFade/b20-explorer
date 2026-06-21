import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "B20 Explorer — Base Native Token Standard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#030712",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Grid background effect */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "300px",
            background: "radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: "100px",
            padding: "8px 20px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#60a5fa",
            }}
          />
          <span style={{ color: "#60a5fa", fontSize: "18px" }}>
            Beryl Hardfork · Mainnet June 25, 2026
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <span style={{ color: "#60a5fa", fontSize: "80px", fontWeight: 800 }}>
            B20
          </span>
          <span style={{ color: "#ffffff", fontSize: "72px", fontWeight: 700 }}>
            Explorer
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            color: "#9ca3af",
            fontSize: "28px",
            textAlign: "center",
            maxWidth: "800px",
            margin: "0",
            lineHeight: 1.5,
          }}
        >
          The first explorer for Base's native token standard.
          Track B20 deployments, inspect policies, go onchain.
        </p>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "60px",
            color: "#4b5563",
            fontSize: "18px",
          }}
        >
          b20-explorer.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
