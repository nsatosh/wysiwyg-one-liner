import { createGlobalStyle } from "styled-components";

export const GlobalCSS = createGlobalStyle`
:root {
  --White: #ffffff;
  --Black: #101010;
  --Tint1: #247ba0;
  --Tint2: #ff1654;
  --Tint3: #b2dbbf;
  --Tint4: #70c1b3;
  --Gray0: #f6f6f6;
  --Gray1: #ebf0f1;
  --GrayHover: #eee;
  --Gray2: #c8c9ca;
  --Gray3: #888888;
  --Gray4: #717171;
  --Gray5: #515151;
  --ErrorColor: #f08c8cc9;
  --LayoutPadding: 10px;
  --ListPadding: 8px;
  --TreeEditorSectionFontSize: 18px;
  --TreeEditorTextFontSize: 14px;
  --TreeEditorNodePadding: 4px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}
`;
