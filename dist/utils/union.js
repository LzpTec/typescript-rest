"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.union = void 0;
function union(array, array2) {
    if (!array || !Array.isArray(array)) {
        return array2 || [];
    }
    else if (!array2 || !Array.isArray(array2)) {
        return array || [];
    }
    const conc = array.concat(array2);
    return conc.filter((i, p) => {
        return conc.indexOf(i) === p;
    });
}
exports.union = union;
//# sourceMappingURL=union.js.map