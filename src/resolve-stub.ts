// Can't resolve files in browser (nor do we have any reason to try), so just stub all of this
export function resolveDependencies(_: any, files: string[]) {
    return { resolvedFiles: files, diagnostics: [] };
}
