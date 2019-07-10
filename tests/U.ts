import { TENodeID, TETextNode, TEBaseNode, TEEndNode } from "../src/core/types";
import { SentinelNodeType } from "../src/core/BuiltinNodeSchema";

interface TELinkNode extends TEBaseNode {
  type: "link";
  children: TENodeID[];
  url: string;
  parent: TENodeID;
}

interface TEGroupingNode extends TEBaseNode {
  type: "grouping";
  children: TENodeID[];
  parent: TENodeID;
}

export class U {
  static text(
    id: TENodeID,
    text: string,
    attrs?: Partial<TETextNode>
  ): Partial<TETextNode> {
    return {
      ...attrs,
      type: "text",
      id,
      style: (attrs && attrs.style) || {},
      text: text.split("")
    };
  }

  static end(id: TENodeID): Partial<TEEndNode> {
    return {
      type: "end",
      id
    };
  }

  static sentinel(id: TENodeID): Partial<TEBaseNode> {
    return {
      type: SentinelNodeType,
      id
    };
  }

  static link(id: TENodeID, attrs?: Partial<TELinkNode>): Partial<TELinkNode> {
    return {
      ...attrs,
      type: "link",
      url: (attrs && attrs.url) || "",
      id
    };
  }

  static grouping(
    id: TENodeID,
    attrs?: Partial<TEGroupingNode>
  ): Partial<TEGroupingNode> {
    return {
      ...attrs,
      type: "grouping",
      id
    };
  }

  static notSupported(id: TENodeID): Partial<TETextNode> {
    return {
      type: "text",
      id,
      text: "<<NOT SUPPORTED>>".split("")
    };
  }
}
