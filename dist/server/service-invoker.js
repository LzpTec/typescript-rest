'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceInvoker = void 0;
const debug_1 = __importDefault(require("debug"));
const typescript_rest_1 = require("../typescript-rest");
const return_types_1 = require("./model/return-types");
const server_types_1 = require("./model/server-types");
const parameter_processor_1 = require("./parameter-processor");
const server_container_1 = require("./server-container");
class ServiceInvoker {
    constructor(serviceClass, serviceMethod) {
        this.debugger = debug_1.default('typescript-rest:service-invoker:runtime');
        this.serviceClass = serviceClass;
        this.serviceMethod = serviceMethod;
        this.preProcessors = [...new Set([...(serviceMethod.preProcessors || []), ...(serviceClass.preProcessors || [])])];
        this.postProcessors = [...new Set([...(serviceMethod.postProcessors || []), ...(serviceClass.postProcessors || [])])];
    }
    async callService(context) {
        try {
            await this.callTargetEndPoint(context);
            if (this.mustCallNext()) {
                context.next();
            }
            else if (this.debugger.enabled) {
                this.debugger('Ignoring next middlewares');
            }
        }
        catch (err) {
            context.next(err);
        }
    }
    mustCallNext() {
        return !server_container_1.ServerContainer.get().ignoreNextMiddlewares &&
            !this.serviceMethod.ignoreNextMiddlewares && !this.serviceClass.ignoreNextMiddlewares;
    }
    async runPreProcessors(context) {
        this.debugger('Running preprocessors');
        for (const processor of this.preProcessors) {
            await Promise.resolve(processor(context.request, context.response));
        }
    }
    async runPostProcessors(context) {
        if (!this.postProcessors.length)
            return;
        this.debugger('Running postprocessors');
        for (const processor of this.postProcessors) {
            await Promise.resolve(processor(context.request, context.response));
        }
    }
    async callTargetEndPoint(context) {
        this.debugger('Calling targetEndpoint %s', this.serviceMethod.resolvedPath);
        this.checkAcceptance(context);
        if (this.preProcessors.length) {
            await this.runPreProcessors(context);
        }
        const serviceObject = this.createService(context);
        const args = this.buildArgumentsList(context);
        const toCall = this.getMethodToCall();
        if (this.debugger.enabled) {
            this.debugger('Invoking service method <%s> with params: %j', this.serviceMethod.name, args);
        }
        const result = toCall.apply(serviceObject, args);
        await this.sendValue(result, context);
    }
    getMethodToCall() {
        return this.serviceClass.targetClass.prototype[this.serviceMethod.name]
            || this.serviceClass.targetClass[this.serviceMethod.name];
    }
    checkAcceptance(context) {
        this.debugger('Verifying accept headers');
        this.identifyAcceptedLanguage(context);
        this.identifyAcceptedType(context);
        if (!context.accept) {
            throw new typescript_rest_1.Errors.NotAcceptableError('Accept');
        }
        if (!context.language) {
            throw new typescript_rest_1.Errors.NotAcceptableError('Accept-Language');
        }
    }
    identifyAcceptedLanguage(context) {
        if (this.serviceMethod.resolvedLanguages) {
            const lang = context.request.acceptsLanguages(this.serviceMethod.resolvedLanguages);
            if (lang) {
                context.language = lang;
            }
        }
        else {
            const languages = context.request.acceptsLanguages();
            if (languages && languages.length > 0) {
                context.language = languages[0];
            }
        }
        this.debugger('Identified the preferable language accepted by server: %s', context.language);
    }
    identifyAcceptedType(context) {
        if (this.serviceMethod.resolvedAccepts) {
            context.accept = context.request.accepts(this.serviceMethod.resolvedAccepts);
        }
        else {
            const accepts = context.request.accepts();
            if (accepts && accepts.length > 0) {
                context.accept = accepts[0];
            }
        }
        this.debugger('Identified the preferable media type accepted by server: %s', context.accept);
    }
    createService(context) {
        const serviceObject = server_container_1.ServerContainer.get().serviceFactory.create(this.serviceClass.targetClass, context);
        this.debugger('Creating service object');
        if (this.serviceClass.hasProperties()) {
            this.serviceClass.properties.forEach((property, key) => {
                this.debugger('Setting service property %s', key);
                serviceObject[key] = this.processParameter(context, property);
            });
        }
        return serviceObject;
    }
    buildArgumentsList(context) {
        const result = new Array();
        this.serviceMethod.parameters.forEach(param => {
            this.debugger('Processing service parameter [%s]', param.name || 'body');
            result.push(this.processParameter(context, {
                name: param.name,
                propertyType: param.type,
                type: param.paramType
            }));
        });
        return result;
    }
    processParameter(context, property) {
        return parameter_processor_1.ParameterProcessor.get().processParameter(context, property);
    }
    processResponseHeaders(context) {
        if (context.response.headersSent)
            return;
        if (this.serviceMethod.resolvedLanguages) {
            if (this.serviceMethod.httpMethod === server_types_1.HttpMethod.GET) {
                this.debugger('Adding response header vary: Accept-Language');
                context.response.vary('Accept-Language');
            }
            this.debugger('Adding response header Content-Language: %s', context.language);
            context.response.set('Content-Language', context.language);
        }
        if (this.serviceMethod.resolvedAccepts) {
            if (this.serviceMethod.httpMethod === server_types_1.HttpMethod.GET) {
                this.debugger('Adding response header vary: Accept');
                context.response.vary('Accept');
            }
        }
    }
    async sendValue(value, context) {
        if (value !== return_types_1.NoResponse) {
            this.debugger('Sending response value: %o', value);
            switch (typeof value) {
                case 'number':
                case 'boolean':
                case 'string':
                    await this.runPostProcessors(context);
                    this.processResponseHeaders(context);
                    context.response.send(value.toString());
                    break;
                case 'undefined':
                    if (!context.response.headersSent) {
                        await this.runPostProcessors(context);
                        this.processResponseHeaders(context);
                        context.response.sendStatus(204);
                    }
                    break;
                default:
                    if (value === null) {
                        await this.runPostProcessors(context);
                        this.processResponseHeaders(context);
                        context.response.send(value);
                    }
                    else {
                        await this.sendComplexValue(context, value);
                    }
            }
        }
        else {
            this.debugger('Do not send any response value');
        }
    }
    async sendComplexValue(context, value) {
        if (value.filePath && value instanceof return_types_1.DownloadResource) {
            await this.downloadResToPromise(context.response, value);
        }
        else if (value instanceof return_types_1.DownloadBinaryData) {
            this.sendFile(context, value);
        }
        else if (value.location && value instanceof server_types_1.ReferencedResource) {
            await this.sendReferencedResource(context, value);
        }
        else if (value.then && value.catch) {
            const val = await value;
            await this.sendValue(val, context);
        }
        else {
            await this.runPostProcessors(context);
            this.processResponseHeaders(context);
            this.debugger('Sending a json value: %j', value);
            context.response.json(value);
        }
    }
    async sendReferencedResource(context, value) {
        this.debugger('Setting the header Location: %s', value.location);
        this.debugger('Sendinf status code: %d', value.statusCode);
        context.response.set('Location', value.location);
        if (value.body) {
            context.response.status(value.statusCode);
            await this.sendValue(value.body, context);
        }
        else {
            context.response.sendStatus(value.statusCode);
        }
    }
    sendFile(context, value) {
        this.debugger('Sending file as response');
        if (value.fileName) {
            context.response.writeHead(200, {
                'Content-Length': value.content.length,
                'Content-Type': value.mimeType,
                'Content-disposition': 'attachment;filename=' + value.fileName
            });
        }
        else {
            context.response.writeHead(200, {
                'Content-Length': value.content.length,
                'Content-Type': value.mimeType
            });
        }
        context.response.end(value.content);
    }
    downloadResToPromise(res, value) {
        this.debugger('Sending a resource to download. Path: %s', value.filePath);
        return new Promise((resolve, reject) => {
            res.download(value.filePath, value.fileName || value.filePath, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
exports.ServiceInvoker = ServiceInvoker;
//# sourceMappingURL=service-invoker.js.map