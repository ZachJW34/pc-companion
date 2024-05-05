import * as CompilerDOM from '@vue/compiler-dom';
import type * as ts from 'typescript';
import type { Code, Sfc, VueCodeInformation, VueCompilerOptions } from '../../types';
export interface TemplateCodegenOptions {
    ts: typeof ts;
    compilerOptions: ts.CompilerOptions;
    vueCompilerOptions: VueCompilerOptions;
    template: NonNullable<Sfc['template']>;
    shouldGenerateScopedClasses?: boolean;
    stylesScopedClasses: Set<string>;
    hasDefineSlots?: boolean;
    slotsAssignName?: string;
    propsAssignName?: string;
}
export declare function generateTemplate(options: TemplateCodegenOptions): Generator<Code, {
    ctx: {
        slots: {
            name: string;
            loc?: number | undefined;
            tagRange: [number, number];
            varName: string;
            nodeLoc: any;
        }[];
        dynamicSlots: {
            expVar: string;
            varName: string;
        }[];
        codeFeatures: {
            all: VueCodeInformation;
            verification: VueCodeInformation;
            completion: VueCodeInformation;
            additionalCompletion: VueCodeInformation;
            navigation: VueCodeInformation;
            navigationAndCompletion: VueCodeInformation;
            withoutHighlight: VueCodeInformation;
            withoutHighlightAndCompletion: VueCodeInformation;
            withoutHighlightAndCompletionAndNavigation: VueCodeInformation;
        };
        accessGlobalVariables: Map<string, Set<number>>;
        hasSlotElements: Set<CompilerDOM.ElementNode>;
        blockConditions: string[];
        usedComponentCtxVars: Set<string>;
        scopedClasses: {
            className: string;
            offset: number;
        }[];
        accessGlobalVariable(name: string, offset?: number | undefined): void;
        hasLocalVariable: (name: string) => boolean;
        addLocalVariable: (name: string) => void;
        removeLocalVariable: (name: string) => void;
        getInternalVariable: () => string;
        ignoreError: () => Generator<Code, any, unknown>;
        expectError: (prevNode: CompilerDOM.CommentNode) => Generator<Code, any, unknown>;
        resetDirectiveComments: (endStr: string) => Generator<Code, any, unknown>;
        generateAutoImportCompletion: () => Generator<Code, any, unknown>;
    };
    hasSlot: boolean;
}, unknown>;
export declare function forEachElementNode(node: CompilerDOM.RootNode | CompilerDOM.TemplateChildNode): Generator<CompilerDOM.ElementNode>;
export declare function isFragment(node: CompilerDOM.IfNode | CompilerDOM.ForNode): boolean | undefined;
