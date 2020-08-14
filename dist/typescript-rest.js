'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.Return = void 0;
const config_1 = require("./server/config");
const Errors = __importStar(require("./server/model/errors"));
exports.Errors = Errors;
const Return = __importStar(require("./server/model/return-types"));
exports.Return = Return;
__exportStar(require("./decorators/parameters"), exports);
__exportStar(require("./decorators/methods"), exports);
__exportStar(require("./decorators/services"), exports);
__exportStar(require("./server/model/server-types"), exports);
__exportStar(require("./server/server"), exports);
__exportStar(require("./authenticator/passport"), exports);
var server_container_1 = require("./server/server-container");
Object.defineProperty(exports, "DefaultServiceFactory", { enumerable: true, get: function () { return server_container_1.DefaultServiceFactory; } });
config_1.ServerConfig.configure();
//# sourceMappingURL=typescript-rest.js.map