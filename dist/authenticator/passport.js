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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassportAuthenticator = void 0;
const passport = __importStar(require("passport"));
class PassportAuthenticator {
    constructor(strategy, options = {}) {
        this.options = options;
        const authStrategy = options.strategyName || strategy.name || 'default_strategy';
        passport.use(authStrategy, strategy);
        this.authenticator = passport.authenticate(authStrategy, options.authOptions || {});
    }
    getMiddleware() {
        return this.authenticator;
    }
    getRoles(req) {
        var _a;
        const roleKey = this.options.rolesKey || 'roles';
        const roles = req.user ? (_a = req.user[roleKey]) !== null && _a !== void 0 ? _a : [] : [];
        return Array.isArray(roles) ? roles : [roles];
    }
    initialize(router) {
        var _a, _b;
        router.use(passport.initialize());
        const useSession = (_b = (_a = this.options.authOptions) === null || _a === void 0 ? void 0 : _a.session) !== null && _b !== void 0 ? _b : true;
        if (useSession) {
            router.use(passport.session());
            if (this.options.serializeUser && this.options.deserializeUser) {
                passport.serializeUser((user, done) => {
                    Promise.resolve(this.options.serializeUser(user))
                        .then((result) => {
                        done(null, result);
                    }).catch((err) => {
                        done(err, null);
                    });
                });
                passport.deserializeUser((user, done) => {
                    Promise.resolve(this.options.deserializeUser(user))
                        .then((result) => {
                        done(null, result);
                    }).catch((err) => {
                        done(err, null);
                    });
                });
            }
        }
    }
}
exports.PassportAuthenticator = PassportAuthenticator;
//# sourceMappingURL=passport.js.map