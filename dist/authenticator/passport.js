'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassportAuthenticator = void 0;
const passport_1 = __importDefault(require("passport"));
class PassportAuthenticator {
    constructor(strategy, options = {}) {
        this.options = options;
        const authStrategy = options.strategyName || strategy.name || 'default_strategy';
        passport_1.default.use(authStrategy, strategy);
        this.authenticator = passport_1.default.authenticate(authStrategy, options.authOptions || {});
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
        router.use(passport_1.default.initialize());
        const useSession = (_b = (_a = this.options.authOptions) === null || _a === void 0 ? void 0 : _a.session) !== null && _b !== void 0 ? _b : true;
        if (useSession) {
            router.use(passport_1.default.session());
            if (this.options.serializeUser && this.options.deserializeUser) {
                passport_1.default.serializeUser((user, done) => {
                    Promise.resolve(this.options.serializeUser(user))
                        .then((result) => {
                        done(null, result);
                    }).catch((err) => {
                        done(err, null);
                    });
                });
                passport_1.default.deserializeUser((user, done) => {
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