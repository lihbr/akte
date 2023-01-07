export type GlobalDataFn<TGlobalData> = () => Awaitable<TGlobalData>;

export type Awaitable<T> = T | Promise<T>;

declare const tag: unique symbol;
export type Empty = {
	readonly [tag]: unknown;
};
