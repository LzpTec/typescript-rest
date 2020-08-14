"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerConfig = void 0;
const debug_1 = __importDefault(require("debug"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const server_1 = require("./server");
const serverDebugger = debug_1.default('typescript-rest:server:config:build');
class ServerConfig {
    static configure() {
        try {
            const CONFIG_FILE = this.searchConfigFile();
            if (CONFIG_FILE && fs.existsSync(CONFIG_FILE)) {
                const config = fs.readJSONSync(CONFIG_FILE);
                serverDebugger('rest.config file found: %j', config);
                if (config.serviceFactory) {
                    if (config.serviceFactory.indexOf('.') === 0) {
                        config.serviceFactory = path.join(process.cwd(), config.serviceFactory);
                    }
                    server_1.Server.registerServiceFactory(config.serviceFactory);
                }
            }
        }
        catch (e) {
            // tslint:disable-next-line:no-console
            console.error(e);
        }
    }
    static searchConfigFile() {
        serverDebugger('Searching for rest.config file');
        let configFile = path.join(__dirname, 'rest.config');
        while (!fs.existsSync(configFile)) {
            const fileOnParent = path.normalize(path.join(path.dirname(configFile), '..', 'rest.config'));
            if (configFile === fileOnParent) {
                return null;
            }
            configFile = fileOnParent;
        }
        return configFile;
    }
}
exports.ServerConfig = ServerConfig;
//# sourceMappingURL=config.js.map