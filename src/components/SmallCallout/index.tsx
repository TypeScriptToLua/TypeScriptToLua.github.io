import React from "react";

type Props = {
    children: React.ReactNode;
    severity: string;
};

export function SmallCallout({ children, severity }: Props) {
    return (
        <span
            style={{
                backgroundColor: `var(--ifm-color-${severity})`,
                borderRadius: "2px",
                color: "var(--ifm-alert-color)",
                padding: "0.3rem",
                marginRight: "0.2rem",
            }}
        >
            {children}
        </span>
    );
}
