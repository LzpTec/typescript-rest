export function union<T>(array: Array<T>, array2: Array<T>) {
    if (!array || !Array.isArray(array)) {
        return array2 || [];
    } else if (!array2 || !Array.isArray(array2)) {
        return array || [];
    }

    const conc = array.concat(array2);
    return conc.filter((i, p) => {
        return conc.indexOf(i) === p;
    });
}