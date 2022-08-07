import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import Layout from "@theme/Layout";
import React from "react";
import styles from "./styles.module.scss";

interface Feature {
    title: string;
    description: JSX.Element;
}

const features: Feature[] = [
    {
        title: "Declare and use existing APIs",
        description: (
            <>
                This project is useful in any environment where Lua code is accepted, with the powerful option of
                declaring types for any existing API using TypeScript declaration files.
            </>
        ),
    },
    {
        title: "Type Safety",
        description: (
            <>
                Static types can ease the mental burden of writing programs, by automatically tracking information the
                programmer would otherwise have to track mentally in some fashion. Types serve as documentation for
                yourself and other programmers and provide a check that tells you what terms make sense to write.
            </>
        ),
    },
    {
        title: "IDE Support",
        description: (
            <>
                Types enable Lua developers to use highly-productive development tools and practices like static
                checking and code refactoring when developing Lua applications. TypeScript extensions are available for
                many text editors.
            </>
        ),
    },
];

const exampleSource = `
function onAbilityCast(caster: Unit, targetPos: Vector) {
    const units = findUnitsInRadius(targetPos, 500);

    const enemies = units.filter(unit => caster.isEnemy(unit));

    for (const enemy of enemies) {
        enemy.kill();
    }

}
`.trim();

const exampleOutput = `
function onAbilityCast(caster, targetPos)
    local units = findUnitsInRadius(targetPos, 500)
    local enemies = __TS__ArrayFilter(
        units,
        function(____, unit) return caster:isEnemy(unit) end
    )
    for ____, enemy in ipairs(enemies) do
        enemy:kill()
    end
end
`.trim();

function Feature({ title, description }: Feature) {
    return (
        <div className="col col--4">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

export default function Home() {
    return (
        <Layout>
            <header className={`hero ${styles.heroBanner} container`}>
                <h1 className={`hero__title ${styles.title}`}>
                    <b>Type</b>
                    <wbr />
                    Script
                    <wbr />
                    To<b>Lua</b>
                </h1>
                <p className="hero__subtitle">Write Lua with TypeScript</p>
                <div className={styles.quickNavButtons}>
                    <Link
                        className={`button button--outline button--primary button--lg ${styles.quickNavButton}`}
                        to={useBaseUrl("docs/getting-started")}
                    >
                        Get Started
                    </Link>
                    <Link
                        className={`button button--outline button--success button--lg ${styles.quickNavButton}`}
                        to={useBaseUrl("play")}
                    >
                        Try Online
                    </Link>
                </div>
            </header>
            <main>
                <section className="padding-vert--md container">
                    <div className="row">
                        <div className={`col col--6 ${styles.example}`}>
                            <CodeBlock className="typescript">{exampleSource}</CodeBlock>
                        </div>
                        <div className={`col col--6 ${styles.example}`}>
                            <CodeBlock className="lua">{exampleOutput}</CodeBlock>
                        </div>
                    </div>
                </section>
                <section className="padding-vert--lg container">
                    <div className="row">
                        {features.map((props, idx) => (
                            <Feature key={idx} {...props} />
                        ))}
                    </div>
                </section>
            </main>
        </Layout>
    );
}
