---
title: Printer
---

The [LuaPrinter](https://github.com/TypeScriptToLua/TypeScriptToLua/blob/master/src/LuaPrinter.ts) class takes Lua AST and prints it to a string (with source map). The printer implements the [visitor pattern](https://en.wikipedia.org/wiki/Visitor_pattern). All methods visit nodes in the AST to print them to a [`SourceNode`](https://github.com/mozilla/source-map#sourcenode), this will automatically produce correct mappings in the resulting source map.

## API Reference

```ts
interface PrintResult {
  code: string;
  sourceMap: string;
  sourceMapNode: SourceNode;
}

class LuaPrinter {
  constructor(options: CompilerOptions, emitHost: EmitHost, fileName: string);
  public print(block: lua.Block, luaLibFeatures: Set<LuaLibFeature>): PrintResult;
  public printStatement(statement: lua.Statement): SourceNode;
  public printDoStatement(statement: lua.DoStatement): SourceNode;
  public printVariableDeclarationStatement(statement: lua.VariableDeclarationStatement): SourceNode;
  public printVariableAssignmentStatement(statement: lua.AssignmentStatement): SourceNode;
  public printIfStatement(statement: lua.IfStatement, isElseIf?: boolean): SourceNode;
  public printWhileStatement(statement: lua.WhileStatement): SourceNode;
  public printRepeatStatement(statement: lua.RepeatStatement): SourceNode;
  public printForStatement(statement: lua.ForStatement): SourceNode;
  public printForInStatement(statement: lua.ForInStatement): SourceNode;
  public printGotoStatement(statement: lua.GotoStatement): SourceNode;
  public printLabelStatement(statement: lua.LabelStatement): SourceNode;
  public printReturnStatement(statement: lua.ReturnStatement): SourceNode;
  public printBreakStatement(statement: lua.BreakStatement): SourceNode;
  public printExpressionStatement(statement: lua.ExpressionStatement): SourceNode;
  public printExpression(expression: lua.Expression): SourceNode;
  public printStringLiteral(expression: lua.StringLiteral): SourceNode;
  public printNumericLiteral(expression: lua.NumericLiteral): SourceNode;
  public printNilLiteral(expression: lua.NilLiteral): SourceNode;
  public printDotsLiteral(expression: lua.DotsLiteral): SourceNode;
  public printBooleanLiteral(expression: lua.BooleanLiteral): SourceNode;
  public printFunctionExpression(expression: lua.FunctionExpression): SourceNode;
  public printFunctionDefinition(statement: lua.FunctionDefinition): SourceNode;
  public printTableFieldExpression(expression: lua.TableFieldExpression): SourceNode;
  public printTableExpression(expression: lua.TableExpression): SourceNode;
  public printUnaryExpression(expression: lua.UnaryExpression): SourceNode;
  public printBinaryExpression(expression: lua.BinaryExpression): SourceNode;
  public printCallExpression(expression: lua.CallExpression): SourceNode;
  public printMethodCallExpression(expression: lua.MethodCallExpression): SourceNode;
  public printIdentifier(expression: lua.Identifier): SourceNode;
  public printTableIndexExpression(expression: lua.TableIndexExpression): SourceNode;
  public printOperator(kind: lua.Operator): SourceNode;
  protected pushIndent(): void;
  protected popIndent(): void;
  protected indent(input?: SourceChunk): SourceChunk;
  protected createSourceNode(node: lua.Node, chunks: SourceChunk | SourceChunk[], name?: string): SourceNode;
  protected concatNodes(...chunks: SourceChunk[]): SourceNode;
  protected printBlock(block: lua.Block): SourceNode;
  protected printStatementArray(statements: lua.Statement[]): SourceChunk[];
  protected isStatementEmpty(statement: lua.Statement): boolean;
  protected joinChunks(separator: string, chunks: SourceChunk[]): SourceChunk[];
  protected printExpressionList(expressions: lua.Expression[]): SourceChunk[];
}
```
