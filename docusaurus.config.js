/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
    title: "TypeScriptToLua",
    organizationName: "TypeScriptToLua",
    url: "https://typescripttolua.github.io",
    baseUrl: "/",
    favicon: "images/favicon.ico",
    themeConfig: {
        metadata: [
            {
                name: "keywords",
                content: "typescript-to-lua, typescript to lua, tstl, typescript, lua, transpiler, compiler",
            },
        ],
        navbar: {
            title: "TypeScriptToLua",
            logo: { src: "images/logo.png" },
            hideOnScroll: true,
            items: [
                { to: "docs/getting-started", label: "Docs", position: "left" },
                { to: "play", label: "Playground", position: "left" },
                {
                    href: "https://discord.gg/BWAq58Y",
                    className: "header-discord-link",
                    "aria-label": "Discord Server",
                    position: "right",
                },
                {
                    href: "https://github.com/TypeScriptToLua/TypeScriptToLua",
                    className: "header-github-link",
                    "aria-label": "GitHub repository",
                    position: "right",
                },
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
                            to: "docs/advanced/compiler-annotations",
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
            appId: "4V397Y2OP8",
            apiKey: "3f8bee8a3aa9cf31191d31230a1e8ba5",
            indexName: "typescripttolua",
            contextualSearch: false,
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
    plugins: ["docusaurus-plugin-sass", require.resolve("./docusaurus-plugin")],
};
