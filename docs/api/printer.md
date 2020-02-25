---
title: LuaPrinter
---

The [LuaPrinter](https://github.com/TypeScriptToLua/TypeScriptToLua/blob/master/src/LuaPrinter.ts) class takes Lua AST and prints it to a string (with source map). Like the LuaTransformer, the printer implements the visitor pattern. All methods visit nodes in the AST to print them to a `SourceNode`, this will automatically produce correct mappings in the resulting source map.

## Visitor Pattern

Like the LuaTransformer, the LuaPrinter class also implements a visitor pattern. For more explanation see the [visitor pattern explanation on the LuaTransformer page](https://github.com/TypeScriptToLua/TypeScriptToLua/wiki/Custom-LuaTransformer-API#visitor-pattern)

## API Reference

This is a list of all public overridable methods in the default TypeScriptToLua printer:

```ts
class LuaPrinter {
  public printStatement(statement: tstl.Statement): SourceNode;

  public printDoStatement(statement: tstl.DoStatement): SourceNode;

  public printVariableDeclarationStatement(statement: tstl.VariableDeclarationStatement): SourceNode;

  public printVariableAssignmentStatement(statement: tstl.AssignmentStatement): SourceNode;

  public printIfStatement(statement: tstl.IfStatement): SourceNode;

  public printWhileStatement(statement: tstl.WhileStatement): SourceNode;

  public printRepeatStatement(statement: tstl.RepeatStatement): SourceNode;

  public printForStatement(statement: tstl.ForStatement): SourceNode;

  public printForInStatement(statement: tstl.ForInStatement): SourceNode;

  public printGotoStatement(statement: tstl.GotoStatement): SourceNode;

  public printLabelStatement(statement: tstl.LabelStatement): SourceNode;

  public printReturnStatement(statement: tstl.ReturnStatement): SourceNode;

  public printBreakStatement(statement: tstl.BreakStatement): SourceNode;

  public printExpressionStatement(statement: tstl.ExpressionStatement): SourceNode;

  public printExpression(expression: tstl.Expression): SourceNode;

  public printStringLiteral(expression: tstl.StringLiteral): SourceNode;

  public printNumericLiteral(expression: tstl.NumericLiteral): SourceNode;

  public printNilLiteral(expression: tstl.NilLiteral): SourceNode;

  public printDotsLiteral(expression: tstl.DotsLiteral): SourceNode;

  public printBooleanLiteral(expression: tstl.BooleanLiteral): SourceNode;

  public printFunctionExpression(expression: tstl.FunctionExpression): SourceNode;

  public printFunctionDefinition(statement: tstl.FunctionDefinition): SourceNode;

  public printTableFieldExpression(expression: tstl.TableFieldExpression): SourceNode;

  public printTableExpression(expression: tstl.TableExpression): SourceNode;

  public printUnaryExpression(expression: tstl.UnaryExpression): SourceNode;

  public printBinaryExpression(expression: tstl.BinaryExpression): SourceNode;

  public printParenthesizedExpression(expression: tstl.ParenthesizedExpression): SourceNode;

  public printCallExpression(expression: tstl.CallExpression): SourceNode;

  public printMethodCallExpression(expression: tstl.MethodCallExpression): SourceNode;

  public printIdentifier(expression: tstl.Identifier): SourceNode;

  public printTableIndexExpression(expression: tstl.TableIndexExpression): SourceNode;

  public printOperator(kind: tstl.Operator): SourceNode;
}
```
