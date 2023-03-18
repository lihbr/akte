export const toReadonlyMap = <K, V>(map: Map<K, V>): ReadonlyMap<K, V> => {
	return {
		has: map.has.bind(map),
		get: map.get.bind(map),
		keys: map.keys.bind(map),
		values: map.values.bind(map),
		entries: map.entries.bind(map),
		forEach: map.forEach.bind(map),
		size: map.size,
		[Symbol.iterator]: map[Symbol.iterator].bind(map),
	};
};
