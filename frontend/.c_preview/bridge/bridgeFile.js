import { render } from "../preset/react.js";
export const bridgeData = {
    "workspaceFolder": "file:///c%3A/D/frontend",
    "serverRootDir": "",
    "previewFolderRelPath": "preview",
    "activeFileRelPath": "src/bo_cuc/BoCucChinh.jsx",
    "mapFileRelPath": "src/bo_cuc/BoCucChinh.jsx",
    "presetName": "react",
    "workspaceFolderName": "frontend"
};
export const preview = () => render(getMod);
const getMod = () => import("../../src/bo_cuc/BoCucChinh.jsx");