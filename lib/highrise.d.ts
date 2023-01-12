export default class Highrise {
    /**
     * @param {string} url Base URL for Highrise API requests
     * @param {string} token Highrise API token
     */
    constructor(url: string, token: string);
    client: import("ky/distribution/types/ky").KyInstance;
    /** @typedef {{ since?: string, n?: number }} SearchParams */
    /**
     * @param {string} path API URL relative path
     * @param {{ since?: Date, n?: number }} [options]
     * @returns
     */
    get(path: string, options?: {
        since?: Date | undefined;
        n?: number | undefined;
    } | undefined): Promise<any>;
}
