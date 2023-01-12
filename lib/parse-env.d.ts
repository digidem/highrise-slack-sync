/**
 * @param {Record<string, unknown>} env
 * @returns {{ highriseToken: string, highriseUrl: string, slackUrl: string, groups: number[], showEveryone: boolean }}
 **/
export default function parseEnv(env: Record<string, unknown>): {
    highriseToken: string;
    highriseUrl: string;
    slackUrl: string;
    groups: number[];
    showEveryone: boolean;
};
