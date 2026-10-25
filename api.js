const API_URL = "https://dummyjson.com/products?limit=100";

/**
 * Fetch products from the REST API.
 * @returns {Promise<Array>} Array of products.
 */
export async function fetchProducts() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(
            `API request failed with status ${response.status}`
        );
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.products)) {
        throw new Error("Invalid product data received from the API.");
    }

    return data.products;
}

/**
 * Fetch available product categories.
 * @returns {Promise<Array>} Array of category names.
 */
export async function fetchCategories() {
    const response = await fetch(
        "https://dummyjson.com/products/category-list"
    );

    if (!response.ok) {
        throw new Error(
            `Category request failed with status ${response.status}`
        );
    }

    const categories = await response.json();

    if (!Array.isArray(categories)) {
        throw new Error("Invalid category data received from the API.");
    }

    return categories;
}