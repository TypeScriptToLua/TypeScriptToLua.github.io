import monaco from "monaco-editor/esm/vs/editor/editor.api";
import * as ts from "typescript";

export interface TypeScriptWorker extends monaco.languages.typescript.TypeScriptWorker {}
export class TypeScriptWorker {
    static clearFiles(diagnostics: ts.Diagnostic[]): monaco.languages.typescript.Diagnostic[];
    constructor(context: any, createData: any);
    protected _languageService: ts.LanguageService;
}