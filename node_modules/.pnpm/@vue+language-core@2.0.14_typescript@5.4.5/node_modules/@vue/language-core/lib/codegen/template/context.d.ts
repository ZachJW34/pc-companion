import type * as CompilerDOM from '@vue/compiler-dom';
import type { Code, VueCodeInformation } from '../../types';
export type TemplateCodegenContext = ReturnType<typeof createTemplateCodegenContext>;
export declare function createTemplateCodegenContext(): {
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
    accessGlobalVariable(name: string, offset?: number): void;
    hasLocalVariable: (name: string) => boolean;
    addLocalVariable: (name: string) => void;
    removeLocalVariable: (name: string) => void;
    getInternalVariable: () => string;
    ignoreError: () => Generator<Code>;
    expectError: (prevNode: CompilerDOM.CommentNode) => Generator<Code>;
    resetDirectiveComments: (endStr: string) => Generator<Code>;
    generateAutoImportCompletion: () => Generator<Code>;
};
