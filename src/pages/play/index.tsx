import Layout from "@theme/Layout";
import React from "react";
import Head from "@docusaurus/Head";

const Playground = React.lazy(() => import("./Playground"));
export default function Play() {
    const isSSR = typeof window === "undefined";
    return (
        <Layout>
            <Head>
                <title>Playground | TypeScriptToLua</title>
                <meta name="description" content="Try and share TypeScriptToLua in the online editor."></meta>
            </Head>
            {!isSSR && (
                <React.Suspense fallback={<div />}>
                    <Playground />
                </React.Suspense>
            )}
        </Layout>
    );
}
