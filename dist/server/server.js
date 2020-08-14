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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const debug_1 = __importDefault(require("debug"));
const fs = __importStar(require("fs-extra"));
require("multer");
const path = __importStar(require("path"));
const yamljs_1 = __importDefault(require("yamljs"));
const server_container_1 = require("./server-container");
const serverDebugger = debug_1.default('typescript-rest:server:build');
/**
 * The Http server main class.
 */
class Server {
    /**
     * Create the routes for all classes decorated with our decorators
     */
    static buildServices(router, ...types) {
        if (!Server.locked) {
            serverDebugger('Creating typescript-rest services handlers');
            const serverContainer = server_container_1.ServerContainer.get();
            serverContainer.router = router;
            serverContainer.buildServices(types);
        }
    }
    /**
     * An alias for Server.loadServices()
     */
    static loadControllers(router, patterns, baseDir) {
        Server.loadServices(router, patterns, baseDir);
    }
    /**
     * Load all services from the files that matches the patterns provided
     */
    static loadServices(router, patterns, baseDir) {
        if (!Server.locked) {
            serverDebugger('Loading typescript-rest services %j. BaseDir: %s', patterns, baseDir);
            const importedTypes = [];
            const requireGlob = require('require-glob');
            baseDir = baseDir || process.cwd();
            const loadedModules = requireGlob.sync(patterns, {
                cwd: baseDir
            });
            Object.values(loadedModules).forEach(serviceModule => {
                Object.values(serviceModule)
                    .filter((service) => typeof service === 'function')
                    .forEach((service) => {
                    importedTypes.push(service);
                });
            });
            try {
                Server.buildServices(router, ...importedTypes);
            }
            catch (e) {
                serverDebugger('Error loading services for pattern: %j. Error: %o', patterns, e);
                serverDebugger('ImportedTypes: %o', importedTypes);
                throw new TypeError(`Error loading services for pattern: ${JSON.stringify(patterns)}. Error: ${e.message}`);
            }
        }
    }
    /**
     * Makes the server immutable. Any configuration change request to the Server
     * is ignored when immutable is true
     * @param value true to make immutable
     */
    static immutable(value) {
        Server.locked = value;
    }
    /**
     * Return true if the server is immutable. Any configuration change request to the Server
     * is ignored when immutable is true
     */
    static isImmutable() {
        return Server.locked;
    }
    /**
     * Retrieve the express router that serves the rest endpoints
     */
    static server() {
        return server_container_1.ServerContainer.get().router;
    }
    /**
     * Return all paths accepted by the Server
     */
    static getPaths() {
        const result = new Array();
        server_container_1.ServerContainer.get().getPaths().forEach(value => {
            result.push(value);
        });
        return result;
    }
    /**
     * Register a custom serviceFactory. It will be used to instantiate the service Objects
     * If You plan to use a custom serviceFactory, You must ensure to call this method before any typescript-rest service declaration.
     */
    static registerServiceFactory(serviceFactory) {
        var _a;
        if (!Server.locked) {
            let factory;
            if (typeof serviceFactory === 'string') {
                const mod = require(serviceFactory);
                factory = (_a = mod.default) !== null && _a !== void 0 ? _a : mod;
            }
            else {
                factory = serviceFactory;
            }
            serverDebugger('Registering a new serviceFactory');
            server_container_1.ServerContainer.get().serviceFactory = factory;
        }
    }
    /**
     * Register a service authenticator. It will be used to authenticate users before the service method
     * invocations occurs.
     */
    static registerAuthenticator(authenticator, name = 'default') {
        if (!Server.locked) {
            serverDebugger('Registering a new authenticator with name %s', name);
            server_container_1.ServerContainer.get().authenticator.set(name, authenticator);
        }
    }
    /**
     * Return the set oh HTTP verbs configured for the given path
     * @param servicePath The path to search HTTP verbs
     */
    static getHttpMethods(servicePath) {
        const result = new Array();
        server_container_1.ServerContainer.get().getHttpMethods(servicePath).forEach(value => {
            result.push(value);
        });
        return result;
    }
    /**
     * A string used for signing cookies. This is optional and if not specified,
     * will not parse signed cookies.
     * @param secret the secret used to sign
     */
    static setCookiesSecret(secret) {
        if (!Server.locked) {
            serverDebugger('Setting a new secret for cookies: %s', secret);
            server_container_1.ServerContainer.get().cookiesSecret = secret;
        }
    }
    /**
     * Specifies a function that will be used to decode a cookie's value.
     * This function can be used to decode a previously-encoded cookie value
     * into a JavaScript string.
     * The default function is the global decodeURIComponent, which will decode
     * any URL-encoded sequences into their byte representations.
     *
     * NOTE: if an error is thrown from this function, the original, non-decoded
     * cookie value will be returned as the cookie's value.
     * @param decoder The decoder function
     */
    static setCookiesDecoder(decoder) {
        if (!Server.locked) {
            serverDebugger('Setting a new secret decoder');
            server_container_1.ServerContainer.get().cookiesDecoder = decoder;
        }
    }
    /**
     * Set where to store the uploaded files
     * @param dest Destination folder
     */
    static setFileDest(dest) {
        if (!Server.locked) {
            serverDebugger('Setting a new destination for files: %s', dest);
            server_container_1.ServerContainer.get().fileDest = dest;
        }
    }
    /**
     * Set a Function to control which files are accepted to upload
     * @param filter The filter function
     */
    static setFileFilter(filter) {
        if (!Server.locked) {
            serverDebugger('Setting a new filter for files');
            server_container_1.ServerContainer.get().fileFilter = filter;
        }
    }
    /**
     * Set the limits of uploaded data
     * @param limit The data limit
     */
    static setFileLimits(limit) {
        if (!Server.locked) {
            serverDebugger('Setting a new fileLimits: %j', limit);
            server_container_1.ServerContainer.get().fileLimits = limit;
        }
    }
    /**
     * Adds a converter for param values to have an ability to intercept the type that actually will be passed to service
     * @param converter The converter
     * @param type The target type that needs to be converted
     */
    static addParameterConverter(converter, type) {
        if (!Server.locked) {
            serverDebugger('Adding a new parameter converter');
            server_container_1.ServerContainer.get().paramConverters.set(type, converter);
        }
    }
    /**
     * Remove the converter associated with the given type.
     * @param type The target type that needs to be converted
     */
    static removeParameterConverter(type) {
        if (!Server.locked) {
            serverDebugger('Removing a parameter converter');
            server_container_1.ServerContainer.get().paramConverters.delete(type);
        }
    }
    /**
     * Makes the server ignore next middlewares for all endpoints.
     * It has the same effect than add @IgnoreNextMiddlewares to all
     * services.
     * @param value - true to ignore next middlewares.
     */
    static ignoreNextMiddlewares(value) {
        if (!Server.locked) {
            serverDebugger('Ignoring next middlewares: %b', value);
            server_container_1.ServerContainer.get().ignoreNextMiddlewares = value;
        }
    }
    /**
     * Creates and endpoint to publish the swagger documentation.
     * @param router Express router
     * @param options Options for swagger endpoint
     */
    static swagger(router, options) {
        if (!Server.locked) {
            const swaggerUi = require('swagger-ui-express');
            options = Server.getOptions(options);
            serverDebugger('Configuring open api documentation endpoints for options: %j', options);
            const swaggerDocument = Server.loadSwaggerDocument(options);
            if (options.host) {
                swaggerDocument.host = options.host;
            }
            if (options.schemes) {
                swaggerDocument.schemes = options.schemes;
            }
            router.get(path.posix.join('/', options.endpoint, 'json'), (req, res, next) => {
                res.send(swaggerDocument);
            });
            router.get(path.posix.join('/', options.endpoint, 'yaml'), (req, res, next) => {
                res.set('Content-Type', 'text/vnd.yaml');
                res.send(yamljs_1.default.stringify(swaggerDocument, 1000));
            });
            router.use(path.posix.join('/', options.endpoint), swaggerUi.serve, swaggerUi.setup(swaggerDocument, options.swaggerUiOptions));
        }
    }
    static loadSwaggerDocument(options) {
        let swaggerDocument;
        if (options.filePath && (options.filePath.endsWith('.yml') || options.filePath.endsWith('.yaml'))) {
            swaggerDocument = yamljs_1.default.load(options.filePath);
        }
        else {
            swaggerDocument = fs.readJSONSync(options.filePath);
        }
        serverDebugger('Loaded swagger configurations: %j', swaggerDocument);
        return swaggerDocument;
    }
    static getOptions(options) {
        const def = {
            endpoint: 'api-docs',
            filePath: './swagger.json'
        };
        options = { ...def, ...options };
        if (options.filePath && options.filePath.startsWith('.')) {
            options.filePath = path.join(process.cwd(), options.filePath);
        }
        return options;
    }
}
exports.Server = Server;
Server.locked = false;
//# sourceMappingURL=server.js.map