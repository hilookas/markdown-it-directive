import DefaultMarkdownIt, {PluginSimple} from 'markdown-it';
import * as StateInline from 'markdown-it/lib/rules_inline/state_inline';
import * as StateBlock from 'markdown-it/lib/rules_block/state_block';

export type DirectiveAttrs = Record<string, string>;
export type DirectiveDests = ["link"|"string", string][];

interface InlineHandlerArgs {
    state: StateInline;
    content: string | undefined;
    dests: DirectiveDests | undefined;
    attrs: DirectiveAttrs | undefined;
    contentStart: number | undefined;
    contentEnd: number | undefined;
    directiveStart: number;
    directiveEnd: number;
}
interface BlockHandlerArgs {
    state: StateBlock;
    content?: string;
    contentTitle: string;
    inlineContent: string | undefined;
    dests: DirectiveDests | undefined;
    attrs: DirectiveAttrs | undefined;
    contentStartLine?: number;
    contentEndLine?: number;
    contentTitleStart: number;
    contentTitleEnd: number;
    inlineContentStart: number | undefined;
    inlineContentEnd: number | undefined;
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

declare const load: PluginSimple;

export default load;
