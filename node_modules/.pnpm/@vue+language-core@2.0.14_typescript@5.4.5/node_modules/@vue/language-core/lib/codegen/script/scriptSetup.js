"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScriptSetup = exports.generateScriptSetupImports = void 0;
const common_1 = require("../common");
const component_1 = require("./component");
const index_1 = require("./index");
const template_1 = require("./template");
function generateScriptSetupImports(scriptSetup, scriptSetupRanges) {
    return [
        scriptSetup.content.substring(0, Math.max(scriptSetupRanges.importSectionEndOffset, scriptSetupRanges.leadingCommentEndOffset)) + common_1.newLine,
        'scriptSetup',
        0,
        index_1.codeFeatures.all,
    ];
}
exports.generateScriptSetupImports = generateScriptSetupImports;
function* generateScriptSetup(options, ctx, scriptSetup, scriptSetupRanges) {
    const definePropMirrors = new Map();
    if (scriptSetup.generic) {
        if (!options.scriptRanges?.exportDefault) {
            yield `export default `;
        }
        yield `(<`;
        yield [
            scriptSetup.generic,
            scriptSetup.name,
            scriptSetup.genericOffset,
            index_1.codeFeatures.all,
        ];
        if (!scriptSetup.generic.endsWith(`,`)) {
            yield `,`;
        }
        yield `>(${common_1.newLine}`
            + `	__VLS_props: Awaited<typeof __VLS_setup>['props'],${common_1.newLine}`
            + `	__VLS_ctx?: ${ctx.helperTypes.Prettify.name}<Pick<Awaited<typeof __VLS_setup>, 'attrs' | 'emit' | 'slots'>>,${common_1.newLine}` // use __VLS_Prettify for less dts code
            + `	__VLS_expose?: NonNullable<Awaited<typeof __VLS_setup>>['expose'],${common_1.newLine}`
            + `	__VLS_setup = (async () => {${common_1.newLine}`;
        yield* generateSetupFunction(options, ctx, scriptSetup, scriptSetupRanges, undefined, definePropMirrors);
        yield `		return {} as {${common_1.newLine}`
            + `			props: ${ctx.helperTypes.Prettify.name}<typeof __VLS_functionalComponentProps & typeof __VLS_componentProps> & typeof __VLS_publicProps,${common_1.newLine}`
            + `			expose(exposed: import('${options.vueCompilerOptions.lib}').ShallowUnwrapRef<${scriptSetupRanges.expose.define ? 'typeof __VLS_exposed' : '{}'}>): void,${common_1.newLine}`
            + `			attrs: any,${common_1.newLine}`
            + `			slots: ReturnType<typeof __VLS_template>,${common_1.newLine}`
            + `			emit: typeof ${scriptSetupRanges.emits.name ?? '__VLS_emit'} & typeof __VLS_modelEmitsType,${common_1.newLine}`
            + `		}${common_1.endOfLine}`;
        yield `	})(),${common_1.newLine}`; // __VLS_setup = (async () => {
        yield `) => ({} as import('${options.vueCompilerOptions.lib}').VNode & { __ctx?: Awaited<typeof __VLS_setup> }))`;
    }
    else if (!options.sfc.script) {
        // no script block, generate script setup code at root
        yield* generateSetupFunction(options, ctx, scriptSetup, scriptSetupRanges, 'export default', definePropMirrors);
    }
    else {
        if (!options.scriptRanges?.exportDefault) {
            yield `export default `;
        }
        yield `await (async () => {${common_1.newLine}`;
        yield* generateSetupFunction(options, ctx, scriptSetup, scriptSetupRanges, 'return', definePropMirrors);
        yield `})()`;
    }
    if (ctx.scriptSetupGeneratedOffset !== undefined) {
        for (const defineProp of scriptSetupRanges.defineProp) {
            if (!defineProp.name) {
                continue;
            }
            const propName = scriptSetup.content.substring(defineProp.name.start, defineProp.name.end);
            const propMirror = definePropMirrors.get(propName);
            if (propMirror !== undefined) {
                options.linkedCodeMappings.push({
                    sourceOffsets: [defineProp.name.start + ctx.scriptSetupGeneratedOffset],
                    generatedOffsets: [propMirror],
                    lengths: [defineProp.name.end - defineProp.name.start],
                    data: undefined,
                });
            }
        }
    }
}
exports.generateScriptSetup = generateScriptSetup;
function* generateSetupFunction(options, ctx, scriptSetup, scriptSetupRanges, syntax, definePropMirrors) {
    const definePropProposalA = scriptSetup.content.trimStart().startsWith('// @experimentalDefinePropProposal=kevinEdition') || options.vueCompilerOptions.experimentalDefinePropProposal === 'kevinEdition';
    const definePropProposalB = scriptSetup.content.trimStart().startsWith('// @experimentalDefinePropProposal=johnsonEdition') || options.vueCompilerOptions.experimentalDefinePropProposal === 'johnsonEdition';
    if (options.vueCompilerOptions.target >= 3.3) {
        yield `const { `;
        for (const macro of Object.keys(options.vueCompilerOptions.macros)) {
            if (!ctx.bindingNames.has(macro)) {
                yield macro + `, `;
            }
        }
        yield `} = await import('${options.vueCompilerOptions.lib}')${common_1.endOfLine}`;
    }
    if (definePropProposalA) {
        yield `declare function defineProp<T>(name: string, options: { required: true } & Record<string, unknown>): import('${options.vueCompilerOptions.lib}').ComputedRef<T>${common_1.endOfLine}`;
        yield `declare function defineProp<T>(name: string, options: { default: any } & Record<string, unknown>): import('${options.vueCompilerOptions.lib}').ComputedRef<T>${common_1.endOfLine}`;
        yield `declare function defineProp<T>(name?: string, options?: any): import('${options.vueCompilerOptions.lib}').ComputedRef<T | undefined>${common_1.endOfLine}`;
    }
    if (definePropProposalB) {
        yield `declare function defineProp<T>(value: T | (() => T), required?: boolean, rest?: any): import('${options.vueCompilerOptions.lib}').ComputedRef<T>${common_1.endOfLine}`;
        yield `declare function defineProp<T>(value: T | (() => T) | undefined, required: true, rest?: any): import('${options.vueCompilerOptions.lib}').ComputedRef<T>${common_1.endOfLine}`;
        yield `declare function defineProp<T>(value?: T | (() => T), required?: boolean, rest?: any): import('${options.vueCompilerOptions.lib}').ComputedRef<T | undefined>${common_1.endOfLine}`;
    }
    ctx.scriptSetupGeneratedOffset = options.getGeneratedLength() - scriptSetupRanges.importSectionEndOffset;
    let setupCodeModifies = [];
    if (scriptSetupRanges.props.define && !scriptSetupRanges.props.name) {
        const range = scriptSetupRanges.props.withDefaults ?? scriptSetupRanges.props.define;
        const statement = scriptSetupRanges.props.define.statement;
        if (statement.start === range.start && statement.end === range.end) {
            setupCodeModifies.push([[`const __VLS_props = `], range.start, range.start]);
        }
        else {
            setupCodeModifies.push([[
                    `const __VLS_props = `,
                    (0, common_1.generateSfcBlockSection)(scriptSetup, range.start, range.end, index_1.codeFeatures.all),
                    `${common_1.endOfLine}`,
                    (0, common_1.generateSfcBlockSection)(scriptSetup, statement.start, range.start, index_1.codeFeatures.all),
                    `__VLS_props`,
                ], statement.start, range.end]);
        }
    }
    if (scriptSetupRanges.slots.define && !scriptSetupRanges.slots.name) {
        setupCodeModifies.push([[`const __VLS_slots = `], scriptSetupRanges.slots.define.start, scriptSetupRanges.slots.define.start]);
    }
    if (scriptSetupRanges.emits.define && !scriptSetupRanges.emits.name) {
        setupCodeModifies.push([[`const __VLS_emit = `], scriptSetupRanges.emits.define.start, scriptSetupRanges.emits.define.start]);
    }
    if (scriptSetupRanges.expose.define) {
        if (scriptSetupRanges.expose.define?.typeArg) {
            setupCodeModifies.push([
                [
                    `let __VLS_exposed!: `,
                    (0, common_1.generateSfcBlockSection)(scriptSetup, scriptSetupRanges.expose.define.typeArg.start, scriptSetupRanges.expose.define.typeArg.end, index_1.codeFeatures.navigation),
                    `${common_1.endOfLine}`,
                ],
                scriptSetupRanges.expose.define.start,
                scriptSetupRanges.expose.define.start,
            ]);
        }
        else if (scriptSetupRanges.expose.define?.arg) {
            setupCodeModifies.push([
                [
                    `const __VLS_exposed = `,
                    (0, common_1.generateSfcBlockSection)(scriptSetup, scriptSetupRanges.expose.define.arg.start, scriptSetupRanges.expose.define.arg.end, index_1.codeFeatures.navigation),
                    `${common_1.endOfLine}`,
                ],
                scriptSetupRanges.expose.define.start,
                scriptSetupRanges.expose.define.start,
            ]);
        }
        else {
            setupCodeModifies.push([
                [`const __VLS_exposed = {}${common_1.endOfLine}`],
                scriptSetupRanges.expose.define.start,
                scriptSetupRanges.expose.define.start,
            ]);
        }
    }
    setupCodeModifies = setupCodeModifies.sort((a, b) => a[1] - b[1]);
    if (setupCodeModifies.length) {
        yield (0, common_1.generateSfcBlockSection)(scriptSetup, scriptSetupRanges.importSectionEndOffset, setupCodeModifies[0][1], index_1.codeFeatures.all);
        while (setupCodeModifies.length) {
            const [codes, _start, end] = setupCodeModifies.shift();
            for (const code of codes) {
                yield code;
            }
            if (setupCodeModifies.length) {
                const nextStart = setupCodeModifies[0][1];
                yield (0, common_1.generateSfcBlockSection)(scriptSetup, end, nextStart, index_1.codeFeatures.all);
            }
            else {
                yield (0, common_1.generateSfcBlockSection)(scriptSetup, end, scriptSetup.content.length, index_1.codeFeatures.all);
            }
        }
    }
    else {
        yield (0, common_1.generateSfcBlockSection)(scriptSetup, scriptSetupRanges.importSectionEndOffset, scriptSetup.content.length, index_1.codeFeatures.all);
    }
    if (scriptSetupRanges.props.define?.typeArg && scriptSetupRanges.props.withDefaults?.arg) {
        // fix https://github.com/vuejs/language-tools/issues/1187
        yield `const __VLS_withDefaultsArg = (function <T>(t: T) { return t })(`;
        yield (0, common_1.generateSfcBlockSection)(scriptSetup, scriptSetupRanges.props.withDefaults.arg.start, scriptSetupRanges.props.withDefaults.arg.end, index_1.codeFeatures.navigation);
        yield `)${common_1.endOfLine}`;
    }
    yield* generateComponentProps(options, ctx, scriptSetup, scriptSetupRanges, definePropMirrors);
    yield* generateModelEmits(options, scriptSetup, scriptSetupRanges);
    yield* (0, template_1.generateTemplate)(options, ctx);
    if (syntax) {
        if (!options.vueCompilerOptions.skipTemplateCodegen && (options.templateCodegen?.hasSlot || scriptSetupRanges?.slots.define)) {
            yield `const __VLS_component = `;
            yield* (0, component_1.generateComponent)(options, ctx, scriptSetup, scriptSetupRanges);
            yield common_1.endOfLine;
            yield `${syntax} `;
            yield `{} as ${ctx.helperTypes.WithTemplateSlots.name}<typeof __VLS_component, ReturnType<typeof __VLS_template>>${common_1.endOfLine}`;
        }
        else {
            yield `${syntax} `;
            yield* (0, component_1.generateComponent)(options, ctx, scriptSetup, scriptSetupRanges);
            yield common_1.endOfLine;
        }
    }
}
function* generateComponentProps(options, ctx, scriptSetup, scriptSetupRanges, definePropMirrors) {
    if (scriptSetupRanges.props.define?.arg || scriptSetupRanges.emits.define) {
        yield `const __VLS_fnComponent = `
            + `(await import('${options.vueCompilerOptions.lib}')).defineComponent({${common_1.newLine}`;
        if (scriptSetupRanges.props.define?.arg) {
            yield `	props: `;
            yield (0, common_1.generateSfcBlockSection)(scriptSetup, scriptSetupRanges.props.define.arg.start, scriptSetupRanges.props.define.arg.end, index_1.codeFeatures.navigation);
            yield `,${common_1.newLine}`;
        }
        if (scriptSetupRanges.emits.define) {
            yield `	emits: ({} as __VLS_NormalizeEmits<typeof `;
            yield scriptSetupRanges.emits.name ?? '__VLS_emit';
            yield `>),${common_1.newLine}`;
        }
        yield `})${common_1.endOfLine}`;
        yield `let __VLS_functionalComponentProps!: `;
        yield `${ctx.helperTypes.OmitKeepDiscriminatedUnion.name}<InstanceType<typeof __VLS_fnComponent>['$props'], keyof typeof __VLS_publicProps>`;
        yield common_1.endOfLine;
    }
    else {
        yield `let __VLS_functionalComponentProps!: {}${common_1.endOfLine}`;
    }
    yield `let __VLS_publicProps!:${common_1.newLine}`
        + `	import('${options.vueCompilerOptions.lib}').VNodeProps${common_1.newLine}`
        + `	& import('${options.vueCompilerOptions.lib}').AllowedComponentProps${common_1.newLine}`
        + `	& import('${options.vueCompilerOptions.lib}').ComponentCustomProps${common_1.endOfLine}`;
    if (scriptSetupRanges.defineProp.length) {
        yield `const __VLS_defaults = {${common_1.newLine}`;
        for (const defineProp of scriptSetupRanges.defineProp) {
            if (defineProp.defaultValue) {
                if (defineProp.name) {
                    yield scriptSetup.content.substring(defineProp.name.start, defineProp.name.end);
                }
                else {
                    yield `modelValue`;
                }
                yield `: `;
                yield scriptSetup.content.substring(defineProp.defaultValue.start, defineProp.defaultValue.end);
                yield `,${common_1.newLine}`;
            }
        }
        yield `}${common_1.endOfLine}`;
    }
    yield `let __VLS_componentProps!: `;
    if (scriptSetupRanges.slots.define && options.vueCompilerOptions.jsxSlots) {
        if (ctx.generatedPropsType) {
            yield ` & `;
        }
        ctx.generatedPropsType = true;
        yield `${ctx.helperTypes.PropsChildren.name}<typeof __VLS_slots>`;
    }
    if (scriptSetupRanges.defineProp.length) {
        if (ctx.generatedPropsType) {
            yield ` & `;
        }
        ctx.generatedPropsType = true;
        yield `{${common_1.newLine}`;
        for (const defineProp of scriptSetupRanges.defineProp) {
            let propName = 'modelValue';
            if (defineProp.name && defineProp.nameIsString) {
                // renaming support
                yield (0, common_1.generateSfcBlockSection)(scriptSetup, defineProp.name.start, defineProp.name.end, index_1.codeFeatures.navigation);
            }
            else if (defineProp.name) {
                propName = scriptSetup.content.substring(defineProp.name.start, defineProp.name.end);
                definePropMirrors.set(propName, options.getGeneratedLength());
                yield propName;
            }
            else {
                yield propName;
            }
            yield defineProp.required
                ? `: `
                : `?: `;
            if (defineProp.type) {
                yield scriptSetup.content.substring(defineProp.type.start, defineProp.type.end);
            }
            else if (!defineProp.nameIsString) {
                yield `NonNullable<typeof ${propName}['value']>`;
            }
            else if (defineProp.defaultValue) {
                yield `typeof __VLS_defaults['${propName}']`;
            }
            else {
                yield `any`;
            }
            yield `,${common_1.newLine}`;
            if (defineProp.modifierType) {
                let propModifierName = 'modelModifiers';
                if (defineProp.name) {
                    propModifierName = `${scriptSetup.content.substring(defineProp.name.start + 1, defineProp.name.end - 1)}Modifiers`;
                }
                const modifierType = scriptSetup.content.substring(defineProp.modifierType.start, defineProp.modifierType.end);
                definePropMirrors.set(propModifierName, options.getGeneratedLength());
                yield `${propModifierName}?: Record<${modifierType}, true>,${common_1.endOfLine}`;
            }
        }
        yield `}`;
    }
    if (scriptSetupRanges.props.define?.typeArg) {
        if (ctx.generatedPropsType) {
            yield ` & `;
        }
        ctx.generatedPropsType = true;
        yield (0, common_1.generateSfcBlockSection)(scriptSetup, scriptSetupRanges.props.define.typeArg.start, scriptSetupRanges.props.define.typeArg.end, index_1.codeFeatures.all);
    }
    if (!ctx.generatedPropsType) {
        yield `{}`;
    }
    yield common_1.endOfLine;
}
function* generateModelEmits(options, scriptSetup, scriptSetupRanges) {
    yield `let __VLS_modelEmitsType!: {}`;
    if (scriptSetupRanges.defineProp.length) {
        yield ` & ReturnType<typeof import('${options.vueCompilerOptions.lib}').defineEmits<{${common_1.newLine}`;
        for (const defineProp of scriptSetupRanges.defineProp) {
            if (!defineProp.isModel) {
                continue;
            }
            let propName = 'modelValue';
            if (defineProp.name) {
                propName = scriptSetup.content.substring(defineProp.name.start, defineProp.name.end);
                propName = propName.replace(/['"]+/g, '');
            }
            yield `'update:${propName}': [${propName}:`;
            if (defineProp.type) {
                yield scriptSetup.content.substring(defineProp.type.start, defineProp.type.end);
            }
            else {
                yield `any`;
            }
            yield `]${common_1.endOfLine}`;
        }
        yield `}>>`;
    }
    yield common_1.endOfLine;
}
//# sourceMappingURL=scriptSetup.js.map