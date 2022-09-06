import Layout from "@theme/Layout";
import React from "react";
import Benchmark from "./Benchmark";

export default function CreateBenchmark() {
    const isSSR = typeof window === "undefined";
    return <Layout>{!isSSR && <Benchmark />}</Layout>;
}
