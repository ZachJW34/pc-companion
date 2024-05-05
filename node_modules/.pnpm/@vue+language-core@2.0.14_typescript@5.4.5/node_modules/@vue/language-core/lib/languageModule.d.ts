import { type LanguagePlugin } from '@volar/language-core';
import type * as ts from 'typescript';
import type { VueCompilerOptions, VueLanguagePlugin } from './types';
import { VueVirtualCode } from './virtualFile/vueFile';
interface _Plugin extends LanguagePlugin<VueVirtualCode> {
    getCanonicalFileName: (fileName: string) => string;
    pluginContext: Parameters<VueLanguagePlugin>[0];
}
export declare function createVueLanguagePlugin(ts: typeof import('typescript'), getFileName: (fileId: string) => string, useCaseSensitiveFileNames: boolean, getProjectVersion: () => string, getScriptFileNames: () => string[] | Set<string>, compilerOptions: ts.CompilerOptions, vueCompilerOptions: VueCompilerOptions): _Plugin;
export {};
