import Layout from "@theme/Layout";
import React from "react";

const Benchmark = React.lazy(() => import("./Benchmark"));
export default function CreateBenchmark() {
    const isSSR = typeof window === "undefined";
    return (
        <Layout title="Benchmark">
            {!isSSR && (
                <React.Suspense fallback={<div />}>
                    <Benchmark />
                </React.Suspense>
            )}
        </Layout>
    );
}
