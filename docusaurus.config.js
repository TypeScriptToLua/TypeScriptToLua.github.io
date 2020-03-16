/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
    title: "TypeScriptToLua",
    // TODO: Remove
    tagline: "",
    url: "https://typescripttolua.github.io",
    baseUrl: "/",
    favicon: "images/favicon.ico",
    themeConfig: {
        navbar: {
            title: "TypeScriptToLua",
            logo: { src: "images/logo.png" },
            links: [
                { to: "play", label: "Playground", position: "left" },
                { href: "https://discord.gg/BWAq58Y", label: "Discord", position: "right" },
                { href: "https://github.com/TypeScriptToLua/TypeScriptToLua", label: "GitHub", position: "right" },
            ],
        },
        prism: {
            additionalLanguages: ["lua"],
            theme: require("prism-react-renderer/themes/github"),
            darkTheme: require("prism-react-renderer/themes/vsDark"),
        },
    },
    presets: [
        [
            "@docusaurus/preset-classic",
            {
                theme: {
                    customCss: require.resolve("./src/custom.scss"),
                },
                pages: {
                    include: ["index.tsx", "play/index.tsx"],
                },
            },
        ],
    ],
    plugins: [require.resolve("./docusaurus-plugin")],
};
