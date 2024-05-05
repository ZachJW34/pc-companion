"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFragment = exports.forEachElementNode = exports.generateTemplate = void 0;
const CompilerDOM = require("@vue/compiler-dom");
const shared_1 = require("@vue/shared");
const shared_2 = require("../../utils/shared");
const common_1 = require("../common");
const camelized_1 = require("./camelized");
const context_1 = require("./context");
const element_1 = require("./element");
const objectProperty_1 = require("./objectProperty");
const propertyAccess_1 = require("./propertyAccess");
const stringLiteralKey_1 = require("./stringLiteralKey");
const templateChild_1 = require("./templateChild");
function* generateTemplate(options) {
    const ctx = (0, context_1.createTemplateCodegenContext)();
    const { componentTagNameOffsets, elementTagNameOffsets } = collectTagOffsets();
    let hasSlot = false;
    if (options.slotsAssignName) {
        ctx.addLocalVariable(options.slotsAssignName);
    }
    if (options.propsAssignName) {
        ctx.addLocalVariable(options.propsAssignName);
    }
    yield* generatePreResolveComponents();
    if (options.template.ast) {
        yield* (0, templateChild_1.generateTemplateChild)(options, ctx, options.template.ast, undefined, undefined, undefined);
    }
    yield* generateStyleScopedClasses();
    if (!options.hasDefineSlots) {
        yield `var __VLS_slots!:`;
        yield* generateSlotsType();
        yield common_1.endOfLine;
    }
    yield* ctx.generateAutoImportCompletion();
    return {
        ctx,
        hasSlot,
    };
    function collectTagOffsets() {
        const componentTagNameOffsets = new Map();
        const elementTagNameOffsets = new Map();
        if (!options.template.ast) {
            return {
                componentTagNameOffsets,
                elementTagNameOffsets,
            };
        }
        for (const node of forEachElementNode(options.template.ast)) {
            if (node.tagType === CompilerDOM.ElementTypes.SLOT) {
                // ignore
                continue;
            }
            if (node.tag === 'component' || node.tag === 'Component') {
                // ignore
                continue;
            }
            const map = node.tagType === CompilerDOM.ElementTypes.COMPONENT
                ? componentTagNameOffsets
                : elementTagNameOffsets;
            let offsets = map.get(node.tag);
            if (!offsets) {
                map.set(node.tag, offsets = []);
            }
            const source = options.template.content.substring(node.loc.start.offset);
            const startTagOffset = node.loc.start.offset + source.indexOf(node.tag);
            offsets.push(startTagOffset); // start tag
            if (!node.isSelfClosing && options.template.lang === 'html') {
                const endTagOffset = node.loc.start.offset + node.loc.source.lastIndexOf(node.tag);
                if (endTagOffset !== startTagOffset) {
                    offsets.push(endTagOffset); // end tag
                }
            }
        }
        return {
            componentTagNameOffsets,
            elementTagNameOffsets,
        };
    }
    function* generateSlotsType() {
        for (const { expVar, varName } of ctx.dynamicSlots) {
            hasSlot = true;
            yield `Partial<Record<NonNullable<typeof ${expVar}>, (_: typeof ${varName}) => any>> &${common_1.newLine}`;
        }
        yield `{${common_1.newLine}`;
        for (const slot of ctx.slots) {
            hasSlot = true;
            if (slot.name && slot.loc !== undefined) {
                yield* (0, objectProperty_1.generateObjectProperty)(options, ctx, slot.name, slot.loc, {
                    ...ctx.codeFeatures.withoutHighlightAndCompletion,
                    __referencesCodeLens: true,
                }, slot.nodeLoc);
            }
            else {
                yield* (0, common_1.wrapWith)(slot.tagRange[0], slot.tagRange[1], {
                    ...ctx.codeFeatures.withoutHighlightAndCompletion,
                    __referencesCodeLens: true,
                }, `default`);
            }
            yield `?(_: typeof ${slot.varName}): any,${common_1.newLine}`;
        }
        yield `}`;
    }
    function* generateStyleScopedClasses() {
        yield `if (typeof __VLS_styleScopedClasses === 'object' && !Array.isArray(__VLS_styleScopedClasses)) {${common_1.newLine}`;
        for (const { className, offset } of ctx.scopedClasses) {
            yield `__VLS_styleScopedClasses[`;
            yield* (0, stringLiteralKey_1.generateStringLiteralKey)(className, offset, {
                ...ctx.codeFeatures.navigationAndCompletion,
                __displayWithLink: options.stylesScopedClasses.has(className),
            });
            yield `]${common_1.endOfLine}`;
        }
        yield `}${common_1.newLine}`;
    }
    function* generatePreResolveComponents() {
        yield `let __VLS_resolvedLocalAndGlobalComponents!: {}`;
        for (const [tagName] of componentTagNameOffsets) {
            const isNamespacedTag = tagName.includes('.');
            if (isNamespacedTag) {
                continue;
            }
            yield ` & __VLS_WithComponent<'${(0, element_1.getCanonicalComponentName)(tagName)}', typeof __VLS_localComponents, `;
            yield (0, element_1.getPossibleOriginalComponentNames)(tagName, false)
                .map(name => `"${name}"`)
                .join(', ');
            yield `>`;
        }
        yield common_1.endOfLine;
        for (const [tagName, offsets] of elementTagNameOffsets) {
            for (const tagOffset of offsets) {
                yield `__VLS_intrinsicElements`;
                yield* (0, propertyAccess_1.generatePropertyAccess)(options, ctx, tagName, tagOffset, ctx.codeFeatures.withoutHighlightAndCompletion);
                yield `;`;
            }
            yield `${common_1.newLine}`;
        }
        for (const [tagName, offsets] of componentTagNameOffsets) {
            if (!common_1.variableNameRegex.test((0, shared_1.camelize)(tagName))) {
                continue;
            }
            for (const tagOffset of offsets) {
                for (const shouldCapitalize of (tagName[0] === tagName[0].toUpperCase() ? [false] : [true, false])) {
                    const expectName = shouldCapitalize ? (0, shared_1.capitalize)((0, shared_1.camelize)(tagName)) : (0, shared_1.camelize)(tagName);
                    yield `__VLS_components.`;
                    yield* (0, camelized_1.generateCamelized)(shouldCapitalize ? (0, shared_1.capitalize)(tagName) : tagName, tagOffset, {
                        navigation: {
                            resolveRenameNewName: tagName !== expectName ? camelizeComponentName : undefined,
                            resolveRenameEditText: getTagRenameApply(tagName),
                        },
                    });
                    yield `;`;
                }
            }
            yield `${common_1.newLine}`;
            yield `// @ts-ignore${common_1.newLine}`; // #2304
            yield `[`;
            for (const tagOffset of offsets) {
                yield* (0, camelized_1.generateCamelized)((0, shared_1.capitalize)(tagName), tagOffset, {
                    completion: {
                        isAdditional: true,
                        onlyImport: true,
                    },
                });
                yield `,`;
            }
            yield `]${common_1.endOfLine}`;
        }
    }
}
exports.generateTemplate = generateTemplate;
function* forEachElementNode(node) {
    if (node.type === CompilerDOM.NodeTypes.ROOT) {
        for (const child of node.children) {
            yield* forEachElementNode(child);
        }
    }
    else if (node.type === CompilerDOM.NodeTypes.ELEMENT) {
        const patchForNode = (0, templateChild_1.getVForNode)(node);
        if (patchForNode) {
            yield* forEachElementNode(patchForNode);
        }
        else {
            yield node;
            for (const child of node.children) {
                yield* forEachElementNode(child);
            }
        }
    }
    else if (node.type === CompilerDOM.NodeTypes.IF) {
        // v-if / v-else-if / v-else
        for (let i = 0; i < node.branches.length; i++) {
            const branch = node.branches[i];
            for (const childNode of branch.children) {
                yield* forEachElementNode(childNode);
            }
        }
    }
    else if (node.type === CompilerDOM.NodeTypes.FOR) {
        // v-for
        for (const child of node.children) {
            yield* forEachElementNode(child);
        }
    }
}
exports.forEachElementNode = forEachElementNode;
function camelizeComponentName(newName) {
    return (0, shared_1.camelize)('-' + newName);
}
function getTagRenameApply(oldName) {
    return oldName === (0, shared_2.hyphenateTag)(oldName) ? shared_2.hyphenateTag : undefined;
}
function isFragment(node) {
    return node.codegenNode && 'consequent' in node.codegenNode && 'tag' in node.codegenNode.consequent && node.codegenNode.consequent.tag === CompilerDOM.FRAGMENT;
}
exports.isFragment = isFragment;
//# sourceMappingURL=index.js.map