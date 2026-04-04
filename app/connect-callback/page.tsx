"use client";

import { useEffect } from "react";

export default function ConnectCallbackPage() {
  useEffect(() => {
    // Auto-close popup after a brief delay
    const timer = setTimeout(() => {
      if (window.opener) {
        window.close();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "system-ui, sans-serif",
        background: "#0a0a0f",
        color: "#a0a0b0",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "18px", marginBottom: "8px" }}>
          ✅ Account connected!
        </p>
        <p style={{ fontSize: "14px", opacity: 0.7 }}>
          This window will close automatically...
        </p>
      </div>
    </div>
  );
}
