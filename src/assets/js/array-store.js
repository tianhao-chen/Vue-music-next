import storage from 'good-storage'

function insertArray(arr, val, compare, maxLen) {
    const index = arr.findIndex(compare)
    if (index === 0) {
        return
    }
    if (index > 0) {
        arr.splice(index, 1)
    }
    arr.unshift(val)
    if (maxLen && arr.length > maxLen) {
        arr.pop()
    }
}

function removeFromArray(arr, compare) {
    const index = arr.findIndex(compare)
    if (index > -1) {
        arr.splice(index, 1)
    }
}

export function save(item, key, compare, maxLen) {
    // 永久本地存储
    const items = storage.get(key, [])
    insertArray(items, item, compare, maxLen)
    storage.set(key, items)
    return items
}

export function remove(key, compare) {
    // 永久本地存储
    const items = storage.get(key, [])
    removeFromArray(items, compare)
    storage.set(key, items)
    return items
}

export function load(key) {
    return storage.get(key, [])
}

export function clear(key) {
    storage.remove(key)
    return []
}

export function saveAll(items, key) {
    storage.set(key, items)
}
