'use strict';
import * as express from 'express';
import * as passport from 'passport';
import { ServiceAuthenticator } from '../server/model/server-types';

export interface PassportAuthenticatorOptions {
    authOptions?: passport.AuthenticateOptions;
    rolesKey?: string;
    strategyName?: string;
    serializeUser?: (user: any) => string | Promise<string>;
    deserializeUser?: (user: string) => any;
}

export class PassportAuthenticator implements ServiceAuthenticator {
    private authenticator: express.Handler;
    private options: PassportAuthenticatorOptions;

    constructor(strategy: passport.Strategy, options: PassportAuthenticatorOptions = {}) {
        this.options = options;
        const authStrategy = options.strategyName || strategy.name || 'default_strategy';
        passport.use(authStrategy, strategy);
        this.authenticator = passport.authenticate(authStrategy, options.authOptions || {});
    }

    public getMiddleware(): express.RequestHandler {
        return this.authenticator;
    }

    public getRoles(req: express.Request): Array<string> {
        const roleKey = this.options.rolesKey || 'roles';
        const roles: any = req.user ? (req.user as any)[roleKey] ?? [] : [];
        return Array.isArray(roles) ? roles : [roles];
    }

    public initialize(router: express.Router): void {
        router.use(passport.initialize());

        const useSession = this.options.authOptions?.session ?? true;
        if (useSession) {
            router.use(passport.session());
            if (this.options.serializeUser && this.options.deserializeUser) {
                passport.serializeUser((user: any, done: (a: any, b: string) => void) => {
                    Promise.resolve(this.options.serializeUser(user))
                        .then((result: string) => {
                            done(null, result);
                        }).catch((err: Error) => {
                            done(err, null);
                        });
                });
                passport.deserializeUser((user: string, done: (a: any, b: any) => void) => {
                    Promise.resolve(this.options.deserializeUser(user))
                        .then((result: any) => {
                            done(null, result);
                        }).catch((err: Error) => {
                            done(err, null);
                        });
                });
            }
        }
    }
}