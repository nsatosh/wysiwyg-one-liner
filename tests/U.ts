import {
  TEMathNode,
  TEMediaNode,
  TENodeID,
  TERowNode,
  TESentinelNode,
  TETextNode,
  TEBaseNode
} from "../src/core/types";

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

  static end(id: TENodeID): Partial<TETextNode> {
    return {
      type: "text",
      id,
      text: [],
      style: {},
      end: true
    };
  }

  static sentinel(id: TENodeID): Partial<TESentinelNode> {
    return {
      type: "sentinel",
      id
    };
  }

  static row(id: TENodeID, attrs?: Partial<TERowNode>): Partial<TERowNode> {
    return {
      ...attrs,
      type: "row",
      id
    };
  }

  static math(id: TENodeID, attrs?: Partial<TEMathNode>): Partial<TEMathNode> {
    return {
      ...attrs,
      type: "math",
      id
    };
  }

  static media(
    id: TENodeID,
    attrs?: Partial<TEMediaNode>
  ): Partial<TEMediaNode> {
    return {
      ...attrs,
      type: "media",
      size: (attrs && attrs.size) || { width: 0, height: 0 },
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