/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
    title: "TypeScriptToLua",
    organizationName: "TypeScriptToLua",
    url: "https://typescripttolua.github.io",
    baseUrl: "/",
    favicon: "images/favicon.ico",
    themeConfig: {
        navbar: {
            title: "TypeScriptToLua",
            logo: { src: "images/logo.png" },
            hideOnScroll: true,
            items: [
                { to: "docs/getting-started", label: "Docs", position: "left" },
                { to: "play", label: "Playground", position: "left" },
                { href: "https://discord.gg/BWAq58Y", label: "Discord", position: "right" },
                { href: "https://github.com/TypeScriptToLua/TypeScriptToLua", label: "GitHub", position: "right" },
            ],
        },
        footer: {
            logo: {
                alt: "TypeScriptToLua Logo",
                src: "images/logo.png",
                href: "https://github.com/TypeScriptToLua",
            },
            links: [
                {
                    title: "Docs",
                    items: [
                        {
                            label: "Getting Started",
                            to: "docs/getting-started",
                        },
                        {
                            label: "Configuration",
                            to: "docs/configuration",
                        },
                        {
                            label: "Advanced",
                            to: "docs/advanced/writing-declarations",
                        },
                    ],
                },
                {
                    title: "Community",
                    items: [
                        {
                            label: "Discord",
                            href: "https://discord.gg/BWAq58Y",
                        },
                    ],
                },
                {
                    title: "More",
                    items: [
                        {
                            label: "Github",
                            href: "https://github.com/TypeScriptToLua",
                        },
                        {
                            label: "Playground",
                            to: "play",
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} TypeScriptToLua Contributors`,
        },
        prism: {
            additionalLanguages: ["lua"],
            theme: require("prism-react-renderer/themes/github"),
            darkTheme: require("prism-react-renderer/themes/vsDark"),
        },
        algolia: {
            apiKey: "c0cf59beed38709e9ed6b0ac80b24ee5",
            indexName: "typescripttolua",
        },
    },
    presets: [
        [
            "@docusaurus/preset-classic",
            {
                docs: {
                    sidebarPath: require.resolve("./sidebars.json"),
                    editUrl: "https://github.com/TypeScriptToLua/TypeScriptToLua.github.io/edit/source/",
                },
                theme: {
                    customCss: require.resolve("./src/custom.scss"),
                },
                pages: {
                    include: ["index.tsx", "play/index.tsx", "benchviz/index.tsx"],
                },
            },
        ],
    ],
    plugins: [require.resolve("./docusaurus-plugin")],
};
