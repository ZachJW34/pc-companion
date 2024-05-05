import * as CompilerDOM from '@vue/compiler-dom';
import type * as ts from 'typescript';
import type { Code } from '../../types';
import type { TemplateCodegenContext } from './context';
import type { TemplateCodegenOptions } from './index';
export declare function generateElementEvents(options: TemplateCodegenOptions, ctx: TemplateCodegenContext, node: CompilerDOM.ElementNode, componentVar: string, componentInstanceVar: string, eventsVar: string, used: () => void): Generator<Code>;
export declare function isCompoundExpression(ts: typeof import('typescript'), ast: ts.SourceFile): boolean;
