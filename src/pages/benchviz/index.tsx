import React from "react";
import Benchmark from "./Benchmark";

export default function CreateBenchmark() {
    const isSSR = typeof window === "undefined";
    return (
        !isSSR && (
            <React.Suspense fallback={<div />}>
                <Benchmark />
            </React.Suspense>
        )
    );
}
