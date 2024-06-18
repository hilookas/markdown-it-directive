import DefaultMarkdownIt, {PluginSimple} from 'markdown-it';
import * as StateInline from 'markdown-it/lib/rules_inline/state_inline';
import * as StateBlock from 'markdown-it/lib/rules_block/state_block';

interface InlineHandlerArgs {
    state: StateInline;
    content: string;
    dests: Record<string, string>[];
    attrs: Record<string, string>[]
    contentStart: number;
    contentEnd: number;
    directiveStart: number;
    directiveEnd: number;
}
interface BlockHandlerArgs {
    state: StateBlock;
    content?: string;
    contentTitle: string;
    inlineContent: string;
    dests: Record<string, string>[];
    attrs: Record<string, string>[];
    contentStartLine?: number;
    contentEndLine?: number;
    contentTitleStart: number;
    contentTitleEnd: number;
    inlineContentStart: number;
    inlineContentEnd: number;
    directiveStartLine: number;
    directiveEndLine: number;
}
type InlineHandler = (args: DirectiveInlineHandlerArgs) => boolean | void;
type BlockHandler = (args: DirectiveBlockHandlerArgs) => boolean | void;

export type DirectiveInlineHandler = InlineHandler;
export type DirectiveInlineHandlerArgs = InlineHandlerArgs;
export type DirectiveBlockHandler = BlockHandler;
export type DirectiveBlockHandlerArgs = BlockHandlerArgs;

interface MarkdownIt extends DefaultMarkdownIt {
    inlineDirectives: Record<string, DirectiveInlineHandler>;
    blockDirectives: Record<string, DirectiveBlockHandler>;
}

export interface MarkdownItWithDirectives extends MarkdownIt {}

declare module 'markdown-it' {
    export type DirectiveInlineHandler = InlineHandler;
    export type DirectiveInlineHandlerArgs = InlineHandlerArgs;
    export type DirectiveBlockHandler = BlockHandler;
    export type DirectiveBlockHandlerArgs = BlockHandlerArgs;
    export interface MarkdownItWithDirectives extends MarkdownIt {}
}

declare function load(): PluginSimple;

export default load;