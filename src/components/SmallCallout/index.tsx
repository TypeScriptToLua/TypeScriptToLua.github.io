import React from "react";

export function SmallCallout({ children, serverity = "warning" }: { children: React.ReactNode; serverity: string }) {
    return (
        <span
            style={{
                backgroundColor: `var(--ifm-color-${serverity})`,
                borderRadius: "2px",
                color: "var(--ifm-alert-color)",
                padding: "0.3rem",
                marginLeft: "0.2rem",
                marginRight: "0.2rem",
            }}
        >
            {children}
        </span>
    );
}
