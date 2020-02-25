---
title: LuaTransformer
---

If you need some Lua transformations for a very specific environment, it is possible to implement these using custom transformers. Writing a custom transformer involves extending the [default TypeScriptToLua LuaTransformer class](https://github.com/TypeScriptToLua/TypeScriptToLua/blob/master/src/LuaTransformer.ts) and overriding its functionality.

### Visitor Pattern

The LuaTransformer class implements the visitor pattern. Therefore to override specific transformation behavior for specific TypeScript statements, it is only necessary to override that specific statement's transform method.

### Example

Assume we want to add to add a `array.n` property to all array table literals, we need to override:

```ts
transformArrayLiteral(expression: ts.ArrayLiteralExpression): ExpressionVisitResult
```

Since the rest of the functionality should be the same, we can simply copy paste the default implementation and add our extra parameter.

The resulting transformer would look something like:

```ts
class CustomTransformer extends tstl.LuaTransformer {
  public transformArrayLiteral(node: ts.ArrayLiteralExpression): ExpressionVisitResult {
    const values: tstl.TableFieldExpression[] = [];

    node.elements.forEach(e => {
      const element = this.transformExpression(e); // We can just call the default transformations
      values.push(tstl.createTableFieldExpression(element, undefined, e));
    });

    // Custom behavior: Add n=<node.elements.length> to lua array table.
    const nIdentifier = tstl.createStringLiteral("n");
    const nValue = tstl.createNumericLiteral(node.elements.length);
    values.push(tstl.createTableFieldExpression(nValue, nIdentifier));
    // End of custom behavior

    return tstl.createTableExpression(values, node);
  }
}
```

## API Reference

This is a list of all public overridable methods in the default TypeScriptToLua tranformer:

```ts
class LuaTransformer {
  public transformSourceFile(sourceFile: ts.SourceFile): [tstl.Block, Set<LuaLibFeature>];

  public transformStatement(statement: ts.Statement): StatementVisitResult;

  public transformBlock(block: ts.Block): tstl.Block;

  public transformExportDeclaration(declaration: ts.ExportDeclaration): StatementVisitResult;

  public transformImportDeclaration(declaration: ts.ImportDeclaration): StatementVisitResult;

  public transformClassDeclaration(
    declaration: ts.ClassLikeDeclaration,
    nameOverride?: tstl.Identifier,
  ): StatementVisitResult;

  public transformGetAccessorDeclaration(
    declaration: ts.GetAccessorDeclaration,
    className: tstl.Identifier,
  ): StatementVisitResult;

  public transformSetAccessorDeclaration(
    declaration: ts.GetAccessorDeclaration,
    className: tstl.Identifier,
  ): StatementVisitResult;

  public transformMethodDeclaration(
    declaration: ts.MethodDeclaration,
    className: tstl.Identifier,
    noPrototype: boolean,
  ): StatementVisitResult;

  public transformBindingPattern(
    pattern: ts.BindingPattern,
    table: tstl.Identifier,
    propertyStack: ts.PropertyName,
  ): StatementVisitResult;

  public transformModuleDeclaration(declaration: ts.ModuleDeclaration): StatementVisitResult;

  public transformEnumDeclaration(declaration: ts.EnumDeclaration): StatementVisitResult;

  public transformFunctionDeclaration(declaration: ts.FunctionDeclaration): StatementVisitResult;

  public transformTypeAliasDeclaration(declaration: ts.TypeAliasDeclaration): StatementVisitResult;

  public transformInterfaceDeclaration(declaration: ts.InterfaceDeclaration): StatementVisitResult;

  public transformVariableDeclaration(declaration: ts.VariableDeclaration): StatementVisitResult;

  public transformVariableStatement(statement: ts.VariableStatement): StatementVisitResult;

  public transformExpressionStatement(statement: ts.ExpressionStatement | ts.Expression): StatementVisitResult;

  public transformReturnStatement(statement: ts.ReturnStatement): StatementVisitResult;

  public transformIfStatement(statement: ts.IfStatement): StatementVisitResult;

  public transformWhileStatement(statement: ts.WhileStatement): StatementVisitResult;

  public transformDoStatement(statement: ts.DoStatement): StatementVisitResult;

  public transformForStatement(statement: ts.ForStatement): StatementVisitResult;

  public transformForOfStatement(statement: ts.ForOfStatement): StatementVisitResult;

  public transformForInStatement(statement: ts.ForInStatement): StatementVisitResult;

  public transformSwitchStatement(statement: ts.SwitchStatement): StatementVisitResult;

  public transformBreakStatement(statement: ts.BreakStatement): StatementVisitResult;

  public transformTryStatement(statement: ts.TryStatement): StatementVisitResult;

  public transformThrowStatement(statement: ts.ThrowStatement): StatementVisitResult;

  public transformContinueStatement(statement: ts.ContinueStatement): StatementVisitResult;

  public transformEmptyStatement(statement: ts.EmptyStatement): StatementVisitResult;

  // Expressions

  public transformExpression(expression: ts.Expression): ExpressionVisitResult;

  public transformBinaryExpression(expression: ts.BinaryExpression): ExpressionVisitResult;

  public transformBinaryOperator(operator: ts.BinaryOperator, node: ts.Node): tstl.BinaryOperator;

  public transformClassExpression(expression: ts.ClassExpression): ExpressionVisitResult;

  public transformConditionalExpression(expression: ts.ConditionalExpression): ExpressionVisitResult;

  public transformPostfixUnaryExpression(expression: ts.PostfixUnaryExpression): ExpressionVisitResult;

  public transformPrefixUnaryExpression(expression: ts.PrefixUnaryExpression): ExpressionVisitResult;

  public transformArrayLiteral(expression: ts.ArrayLiteralExpression): ExpressionVisitResult;

  public transformObjectLiteral(expression: ts.ObjectLiteralExpression): ExpressionVisitResult;

  public transformDeleteExpression(expression: ts.DeleteExpression): ExpressionVisitResult;

  public transformFunctionExpresssion(expression: ts.FunctionExpression): ExpressionVisitResult;

  public transformNewExpression(expression: ts.NewExpression): ExpressionVisitResult;

  public transformParenthesizedExpression(expression: ts.ParenthesizedExpression): ExpressionVisitResult;

  public transformSuperKeyword(expression: ts.SuperExpression): ExpressionVisitResult;

  public transformCallExpression(expression: ts.CallExpression): ExpressionVisitResult;

  public transformPropertyAccessExpression(expression: ts.PropertyAccessExpression): ExpressionVisitResult;

  public transformElementAccessExpression(expression: ts.ElementAccessExpression): ExpressionVisitResult;

  public transformArrayBindingElement(expression: ts.ArrayBindingelement): ExpressionVisitResult;

  public transformAssertionExpression(expression: ts.AssertionExpression): ExpressionVisitResult;

  public transformTypeOfExpression(expression: ts.TypeOfExpression): ExpressionVisitResult;

  public transformSpreadElement(expression: ts.SpreadElement): ExpressionVisitResult;

  public transformStringLIteral(literal: ts.StringLiteralLike): ExpressionVisitResult;

  public transformNumericLiteral(literal: ts.NumericLiteral): ExpressionVisitResult;

  public transformTrueKeyword(keyword: ts.BooleanLiteral): ExpressionVisitResult;

  public transformFalseKeyword(keyword: ts.BooleanLiteral): ExpressionVisitResult;

  public transformNullOrUndefinedKeyword(keyword: ts.Node): ExpressionVisitResult;

  public transformThisKeyword(keyword: ts.ThisExpression): ExpressionVisitResult;

  public transformTemplateExpression(expression: ts.TemplateExpression): ExpressionVisitResult;

  public transformPropertyName(expression: ts.PropertyName): ExpressionVisitResult;

  public transformIdentifier(expression: ts.Identifier): tstl.Identifier;

  public transformYield(expression: ts.YieldExpression): ExpressionVisitResult;
}
```
