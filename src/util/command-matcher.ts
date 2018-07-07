export interface CommandMatcherOptions {
    cmd: string;
    arity?: number;
}

export const commandMatcher = (opts: CommandMatcherOptions) => {
    const arityPattern = ' (\\w+)'.repeat(opts.arity);
    const finalPattern = `^${opts.cmd}${arityPattern}$`;

    return (msg: string): boolean => !!msg.match(finalPattern);
};
