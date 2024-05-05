"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateElementChildren = void 0;
const common_1 = require("../common");
const templateChild_1 = require("./templateChild");
function* generateElementChildren(options, ctx, node, currentElement, componentCtxVar) {
    yield* ctx.resetDirectiveComments('end of element children start');
    let prev;
    for (const childNode of node.children) {
        yield* (0, templateChild_1.generateTemplateChild)(options, ctx, childNode, currentElement, prev, componentCtxVar);
        prev = childNode;
    }
    // fix https://github.com/vuejs/language-tools/issues/932
    if (!ctx.hasSlotElements.has(node) && node.children.length) {
        yield `(${componentCtxVar}.slots!).`;
        yield* (0, common_1.wrapWith)(node.children[0].loc.start.offset, node.children[node.children.length - 1].loc.end.offset, ctx.codeFeatures.navigation, `default`);
        yield common_1.endOfLine;
    }
}
exports.generateElementChildren = generateElementChildren;
//# sourceMappingURL=elementChildren.js.map