"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPossibleOriginalComponentNames = exports.getCanonicalComponentName = exports.generateElement = void 0;
const CompilerDOM = require("@vue/compiler-dom");
const shared_1 = require("@vue/shared");
const common_1 = require("../common");
const camelized_1 = require("./camelized");
const elementChildren_1 = require("./elementChildren");
const elementDirectives_1 = require("./elementDirectives");
const elementEvents_1 = require("./elementEvents");
const elementProps_1 = require("./elementProps");
const interpolation_1 = require("./interpolation");
const propertyAccess_1 = require("./propertyAccess");
const stringLiteralKey_1 = require("./stringLiteralKey");
const templateChild_1 = require("./templateChild");
const colonReg = /:/g;
function* generateElement(options, ctx, node, currentElement, componentCtxVar) {
    const startTagOffset = node.loc.start.offset + options.template.content.substring(node.loc.start.offset).indexOf(node.tag);
    const propsFailedExps = [];
    const var_originalComponent = ctx.getInternalVariable();
    const var_functionalComponent = ctx.getInternalVariable();
    const var_componentInstance = ctx.getInternalVariable();
    const var_componentEvents = ctx.getInternalVariable();
    const isIntrinsicElement = node.tagType === CompilerDOM.ElementTypes.ELEMENT
        || node.tagType === CompilerDOM.ElementTypes.TEMPLATE;
    const isComponentTag = node.tag.toLowerCase() === 'component';
    let endTagOffset = !node.isSelfClosing && options.template.lang === 'html' ? node.loc.start.offset + node.loc.source.lastIndexOf(node.tag) : undefined;
    let tag = node.tag;
    let tagOffsets = endTagOffset !== undefined
        ? [startTagOffset, endTagOffset]
        : [startTagOffset];
    let props = node.props;
    let dynamicTagInfo;
    let defineComponentCtxVar;
    let usedComponentEventsVar = false;
    if (isComponentTag) {
        for (const prop of node.props) {
            if (prop.type === CompilerDOM.NodeTypes.DIRECTIVE && prop.name === 'bind' && prop.arg?.loc.source === 'is' && prop.exp) {
                dynamicTagInfo = {
                    exp: prop.exp.loc.source,
                    offset: prop.exp.loc.start.offset,
                    astHolder: prop.exp.loc,
                };
                props = props.filter(p => p !== prop);
                break;
            }
        }
    }
    else if (tag.includes('.')) {
        // namespace tag
        dynamicTagInfo = {
            exp: tag,
            astHolder: node.loc,
            offset: startTagOffset,
        };
    }
    if (isIntrinsicElement) {
        yield `const ${var_originalComponent} = __VLS_intrinsicElements[`;
        yield* (0, stringLiteralKey_1.generateStringLiteralKey)(tag, startTagOffset, ctx.codeFeatures.verification);
        yield `]${common_1.endOfLine}`;
    }
    else if (dynamicTagInfo) {
        yield `const ${var_originalComponent} = `;
        yield* (0, interpolation_1.generateInterpolation)(options, ctx, dynamicTagInfo.exp, dynamicTagInfo.astHolder, dynamicTagInfo.offset, ctx.codeFeatures.all, '(', ')');
        yield common_1.endOfLine;
    }
    else if (!isComponentTag) {
        yield `const ${var_originalComponent} = ({} as `;
        for (const componentName of getPossibleOriginalComponentNames(tag, true)) {
            yield `'${componentName}' extends keyof typeof __VLS_ctx ? { '${getCanonicalComponentName(tag)}': typeof __VLS_ctx`;
            yield* (0, propertyAccess_1.generatePropertyAccess)(options, ctx, componentName);
            yield ` }: `;
        }
        yield `typeof __VLS_resolvedLocalAndGlobalComponents)`;
        yield* (0, propertyAccess_1.generatePropertyAccess)(options, ctx, getCanonicalComponentName(tag), startTagOffset, ctx.codeFeatures.verification);
        yield common_1.endOfLine;
    }
    else {
        yield `const ${var_originalComponent} = {} as any${common_1.endOfLine}`;
    }
    if (isIntrinsicElement) {
        yield `const ${var_functionalComponent} = __VLS_elementAsFunctionalComponent(${var_originalComponent})${common_1.endOfLine}`;
    }
    else {
        yield `const ${var_functionalComponent} = __VLS_asFunctionalComponent(${var_originalComponent}, new ${var_originalComponent}({`;
        yield* (0, elementProps_1.generateElementProps)(options, ctx, node, props, false);
        yield `}))${common_1.endOfLine}`;
    }
    if (!dynamicTagInfo
        && !isIntrinsicElement
        && !isComponentTag) {
        for (const offset of tagOffsets) {
            yield `({} as { ${getCanonicalComponentName(tag)}: typeof ${var_originalComponent} }).`;
            yield* generateCanonicalComponentName(tag, offset, ctx.codeFeatures.withoutHighlightAndCompletionAndNavigation);
            yield common_1.endOfLine;
        }
    }
    if (options.vueCompilerOptions.strictTemplates) {
        // with strictTemplates, generate once for props type-checking + instance type
        yield `const ${var_componentInstance} = ${var_functionalComponent}(`;
        yield* (0, common_1.wrapWith)(startTagOffset, startTagOffset + tag.length, ctx.codeFeatures.verification, `{`, ...(0, elementProps_1.generateElementProps)(options, ctx, node, props, true, propsFailedExps), `}`);
        yield `, ...__VLS_functionalComponentArgsRest(${var_functionalComponent}))${common_1.endOfLine}`;
    }
    else {
        // without strictTemplates, this only for instacne type
        yield `const ${var_componentInstance} = ${var_functionalComponent}({`;
        yield* (0, elementProps_1.generateElementProps)(options, ctx, node, props, false);
        yield `}, ...__VLS_functionalComponentArgsRest(${var_functionalComponent}))${common_1.endOfLine}`;
        // and this for props type-checking
        yield `({} as (props: __VLS_FunctionalComponentProps<typeof ${var_originalComponent}, typeof ${var_componentInstance}> & Record<string, unknown>) => void)(`;
        yield* (0, common_1.wrapWith)(startTagOffset, startTagOffset + tag.length, ctx.codeFeatures.verification, `{`, ...(0, elementProps_1.generateElementProps)(options, ctx, node, props, true, propsFailedExps), `}`);
        yield `)${common_1.endOfLine}`;
    }
    if (node.tagType !== CompilerDOM.ElementTypes.TEMPLATE) {
        defineComponentCtxVar = ctx.getInternalVariable();
        componentCtxVar = defineComponentCtxVar;
        currentElement = node;
    }
    //#region fix #1775
    for (const failedExp of propsFailedExps) {
        yield* (0, interpolation_1.generateInterpolation)(options, ctx, failedExp.loc.source, failedExp.loc, failedExp.loc.start.offset, ctx.codeFeatures.all, '(', ')');
        yield common_1.endOfLine;
    }
    const vScope = props.find(prop => prop.type === CompilerDOM.NodeTypes.DIRECTIVE && (prop.name === 'scope' || prop.name === 'data'));
    let inScope = false;
    let originalConditionsNum = ctx.blockConditions.length;
    if (vScope?.type === CompilerDOM.NodeTypes.DIRECTIVE && vScope.exp) {
        const scopeVar = ctx.getInternalVariable();
        const condition = `__VLS_withScope(__VLS_ctx, ${scopeVar})`;
        yield `const ${scopeVar} = `;
        yield [
            vScope.exp.loc.source,
            'template',
            vScope.exp.loc.start.offset,
            ctx.codeFeatures.all,
        ];
        yield common_1.endOfLine;
        yield `if (${condition}) {${common_1.newLine}`;
        ctx.blockConditions.push(condition);
        inScope = true;
    }
    yield* (0, elementDirectives_1.generateElementDirectives)(options, ctx, node);
    yield* generateReferencesForElements(options, ctx, node); // <el ref="foo" />
    if (options.shouldGenerateScopedClasses) {
        yield* generateReferencesForScopedCssClasses(ctx, node);
    }
    if (componentCtxVar) {
        ctx.usedComponentCtxVars.add(componentCtxVar);
        yield* (0, elementEvents_1.generateElementEvents)(options, ctx, node, var_functionalComponent, var_componentInstance, var_componentEvents, () => usedComponentEventsVar = true);
    }
    if (inScope) {
        yield `}${common_1.newLine}`;
        ctx.blockConditions.length = originalConditionsNum;
    }
    //#endregion
    const slotDir = node.props.find(p => p.type === CompilerDOM.NodeTypes.DIRECTIVE && p.name === 'slot');
    if (slotDir && componentCtxVar) {
        yield* generateComponentSlot(options, ctx, node, slotDir, currentElement, componentCtxVar);
    }
    else {
        yield* (0, elementChildren_1.generateElementChildren)(options, ctx, node, currentElement, componentCtxVar);
    }
    if (defineComponentCtxVar && ctx.usedComponentCtxVars.has(defineComponentCtxVar)) {
        yield `const ${componentCtxVar} = __VLS_pickFunctionalComponentCtx(${var_originalComponent}, ${var_componentInstance})!${common_1.endOfLine}`;
    }
    if (usedComponentEventsVar) {
        yield `let ${var_componentEvents}!: __VLS_NormalizeEmits<typeof ${componentCtxVar}.emit>${common_1.endOfLine}`;
    }
}
exports.generateElement = generateElement;
function getCanonicalComponentName(tagText) {
    return common_1.variableNameRegex.test(tagText)
        ? tagText
        : (0, shared_1.capitalize)((0, shared_1.camelize)(tagText.replace(colonReg, '-')));
}
exports.getCanonicalComponentName = getCanonicalComponentName;
function getPossibleOriginalComponentNames(tagText, deduplicate) {
    const name1 = (0, shared_1.capitalize)((0, shared_1.camelize)(tagText));
    const name2 = (0, shared_1.camelize)(tagText);
    const name3 = tagText;
    const names = [name1];
    if (!deduplicate || name2 !== name1) {
        names.push(name2);
    }
    if (!deduplicate || name3 !== name2) {
        names.push(name3);
    }
    return names;
}
exports.getPossibleOriginalComponentNames = getPossibleOriginalComponentNames;
function* generateCanonicalComponentName(tagText, offset, features) {
    if (common_1.variableNameRegex.test(tagText)) {
        yield [tagText, 'template', offset, features];
    }
    else {
        yield* (0, camelized_1.generateCamelized)((0, shared_1.capitalize)(tagText.replace(colonReg, '-')), offset, features);
    }
}
function* generateComponentSlot(options, ctx, node, slotDir, currentElement, componentCtxVar) {
    yield `{${common_1.newLine}`;
    ctx.usedComponentCtxVars.add(componentCtxVar);
    if (currentElement) {
        ctx.hasSlotElements.add(currentElement);
    }
    const slotBlockVars = [];
    let hasProps = false;
    if (slotDir?.exp?.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION) {
        const slotAst = (0, common_1.createTsAst)(options.ts, slotDir, `(${slotDir.exp.content}) => {}`);
        (0, common_1.collectVars)(options.ts, slotAst, slotAst, slotBlockVars);
        hasProps = true;
        if (!slotDir.exp.content.includes(':')) {
            yield `const [`;
            yield [
                slotDir.exp.content,
                'template',
                slotDir.exp.loc.start.offset,
                ctx.codeFeatures.all,
            ];
            yield `] = __VLS_getSlotParams(`;
        }
        else {
            yield `const `;
            yield [
                slotDir.exp.content,
                'template',
                slotDir.exp.loc.start.offset,
                ctx.codeFeatures.all,
            ];
            yield ` = __VLS_getSlotParam(`;
        }
    }
    yield* (0, common_1.wrapWith)((slotDir.arg ?? slotDir).loc.start.offset, (slotDir.arg ?? slotDir).loc.end.offset, ctx.codeFeatures.verification, `(${componentCtxVar}.slots!)`, ...(slotDir?.arg?.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION && slotDir.arg.content
        ? (0, propertyAccess_1.generatePropertyAccess)(options, ctx, slotDir.arg.loc.source, slotDir.arg.loc.start.offset, slotDir.arg.isStatic ? ctx.codeFeatures.withoutHighlight : ctx.codeFeatures.all, slotDir.arg.loc)
        : [
            `.`,
            ...(0, common_1.wrapWith)(slotDir.loc.start.offset, slotDir.loc.start.offset + (slotDir.loc.source.startsWith('#')
                ? '#'.length
                : slotDir.loc.source.startsWith('v-slot:')
                    ? 'v-slot:'.length
                    : 0), ctx.codeFeatures.withoutHighlightAndCompletion, `default`)
        ]));
    if (hasProps) {
        yield `)`;
    }
    yield common_1.endOfLine;
    for (const varName of slotBlockVars) {
        ctx.addLocalVariable(varName);
    }
    yield* ctx.resetDirectiveComments('end of slot children start');
    let prev;
    for (const childNode of node.children) {
        yield* (0, templateChild_1.generateTemplateChild)(options, ctx, childNode, currentElement, prev, componentCtxVar);
        prev = childNode;
    }
    for (const varName of slotBlockVars) {
        ctx.removeLocalVariable(varName);
    }
    let isStatic = true;
    if (slotDir?.arg?.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION) {
        isStatic = slotDir.arg.isStatic;
    }
    if (isStatic && slotDir && !slotDir.arg) {
        yield `${componentCtxVar}.slots!['`;
        yield [
            '',
            'template',
            slotDir.loc.start.offset + (slotDir.loc.source.startsWith('#')
                ? '#'.length : slotDir.loc.source.startsWith('v-slot:')
                ? 'v-slot:'.length
                : 0),
            ctx.codeFeatures.completion,
        ];
        yield `'/* empty slot name completion */]${common_1.newLine}`;
    }
    yield* ctx.generateAutoImportCompletion();
    yield `}${common_1.newLine}`;
}
function* generateReferencesForElements(options, ctx, node) {
    for (const prop of node.props) {
        if (prop.type === CompilerDOM.NodeTypes.ATTRIBUTE
            && prop.name === 'ref'
            && prop.value) {
            yield `// @ts-ignore${common_1.newLine}`;
            yield* (0, interpolation_1.generateInterpolation)(options, ctx, prop.value.content, prop.value.loc, prop.value.loc.start.offset + 1, ctx.codeFeatures.navigation, '(', ')');
            yield common_1.endOfLine;
        }
    }
}
function* generateReferencesForScopedCssClasses(ctx, node) {
    for (const prop of node.props) {
        if (prop.type === CompilerDOM.NodeTypes.ATTRIBUTE
            && prop.name === 'class'
            && prop.value) {
            let startOffset = prop.value.loc.start.offset;
            let tempClassName = '';
            for (const char of (prop.value.loc.source + ' ')) {
                if (char.trim() === '' || char === '"' || char === "'") {
                    if (tempClassName !== '') {
                        ctx.scopedClasses.push({ className: tempClassName, offset: startOffset });
                        startOffset += tempClassName.length;
                        tempClassName = '';
                    }
                    startOffset += char.length;
                }
                else {
                    tempClassName += char;
                }
            }
        }
        else if (prop.type === CompilerDOM.NodeTypes.DIRECTIVE
            && prop.arg?.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION
            && prop.exp?.type === CompilerDOM.NodeTypes.SIMPLE_EXPRESSION
            && prop.arg.content === 'class') {
            yield `__VLS_styleScopedClasses = (`;
            yield [
                prop.exp.content,
                'template',
                prop.exp.loc.start.offset,
                ctx.codeFeatures.navigationAndCompletion,
            ];
            yield `)${common_1.endOfLine}`;
        }
    }
}
//# sourceMappingURL=element.js.map