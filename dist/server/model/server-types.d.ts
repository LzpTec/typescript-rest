import * as express from 'express';
/**
 * Limits for file uploads
 */
export interface FileLimits {
    /** Max field name size (Default: 100 bytes) */
    fieldNameSize?: number;
    /** Max field value size (Default: 1MB) */
    fieldSize?: number;
    /** Max number of non- file fields (Default: Infinity) */
    fields?: number;
    /** For multipart forms, the max file size (in bytes)(Default: Infinity) */
    fileSize?: number;
    /** For multipart forms, the max number of file fields (Default: Infinity) */
    files?: number;
    /** For multipart forms, the max number of parts (fields + files)(Default: Infinity) */
    parts?: number;
    /** For multipart forms, the max number of header key=> value pairs to parse Default: 2000(same as node's http). */
    headerPairs?: number;
}
/**
 * The supported HTTP methods.
 */
export declare enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    HEAD = "HEAD",
    OPTIONS = "OPTIONS",
    PATCH = "PATCH"
}
/**
 * Represents the current context of the request being handled.
 */
export declare class ServiceContext {
    /**
     * The resolved language to be used in the current request handling.
     */
    language: string;
    /**
     * The preferred media type to be used in the current request handling.
     */
    accept: string;
    /**
     * The request object.
     */
    request: express.Request;
    /**
     * The response object
     */
    response: express.Response;
    /**
     * The next function. It can be used to delegate to the next middleware
     * registered the processing of the current request.
     */
    next: express.NextFunction;
}
/**
 * Used to create a reference to a resource.
 */
export declare abstract class ReferencedResource<T> {
    location: string;
    statusCode: number;
    /**
     * the body to be sent
     */
    body: T;
    /**
     * Constructor. Receives the location of the resource.
     * @param location To be added to the Location header on response
     * @param statusCode the response status code to be sent
     */
    constructor(location: string, statusCode: number);
}
/**
 * The factory used to instantiate the object services
 */
export interface ServiceFactory {
    /**
     * Create a new service object. Called before each request handling.
     */
    create: (serviceClass: Function, context: ServiceContext) => any;
    /**
     * Return the type used to handle requests to the target service.
     * By default, returns the serviceClass received, but you can use this
     * to implement IoC integrations.
     */
    getTargetClass: (serviceClass: Function) => FunctionConstructor;
}
/**
 * An optional authenticator for rest services
 */
export interface ServiceAuthenticator {
    /**
     * Get the user list of roles.
     */
    getRoles: (req: express.Request) => Array<string>;
    /**
     * Initialize the authenticator
     */
    initialize(router: express.Router): void;
    /**
     * Retrieve the middleware used to authenticate users.
     */
    getMiddleware(): express.RequestHandler;
}
export declare type ServiceProcessor = (req: express.Request, res?: express.Response) => void;
export declare type ParameterConverter = (paramValue: any) => any;
/**
 * The types of parsers to parse the message body
 */
export declare enum ParserType {
    json = "json",
    text = "text",
    raw = "raw"
}
