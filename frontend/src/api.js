const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

export async function apiFetch(path, options = {}) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`

    console.log("url invoked: ", `${API_BASE_URL}${normalizedPath}`)

    return fetch(`${API_BASE_URL}${normalizedPath}`, options)
}
