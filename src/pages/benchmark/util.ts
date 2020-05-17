interface JoinResult<T> {
    left?: T,
    right?: T,
}

export function join<TItem, TKey>(left: TItem[], right: TItem[], joinOnProperty: (item: TItem) => TKey): Array<JoinResult<TItem>> {
    const map = new Map<TKey, JoinResult<TItem>>();

    for (const item of left) {
        map.set(joinOnProperty(item), { left: item });
    }
    for (const item of right) {
        const key = joinOnProperty(item);
        const entry = map.get(key);
        if (entry) {
            entry.right = item;
        } else {
            map.set(key, { right: item });
        }
    }

    return [...map.values()];
}