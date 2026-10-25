import {
    fetchProducts,
    fetchCategories
} from "./api.js";


/* =========================================
   APPLICATION STATE
   ========================================= */

const state = {
    products: [],
    filteredProducts: [],
    searchTerm: "",
    category: "all",
    sort: "default",
    theme: localStorage.getItem("theme") || "light"
};


/* =========================================
   DOM ELEMENTS
   ========================================= */

const productsGrid =
    document.getElementById("products-grid");

const searchInput =
    document.getElementById("search-input");

const categoryFilter =
    document.getElementById("category-filter");

const sortSelect =
    document.getElementById("sort-select");

const resultsSummary =
    document.getElementById("results-summary");

const loadingState =
    document.getElementById("loading-state");

const errorState =
    document.getElementById("error-state");

const errorMessage =
    document.getElementById("error-message");

const retryButton =
    document.getElementById("retry-button");

const refreshButton =
    document.getElementById("refresh-button");

const emptyState =
    document.getElementById("empty-state");

const themeToggle =
    document.getElementById("theme-toggle");


/* =========================================
   INITIALIZATION
   ========================================= */

document.addEventListener("DOMContentLoaded", initialize);


async function initialize() {
    applyTheme();
    setupEventListeners();

    await loadApplicationData();
}


/* =========================================
   EVENT LISTENERS
   ========================================= */

function setupEventListeners() {

    searchInput.addEventListener(
        "input",
        handleSearch
    );

    categoryFilter.addEventListener(
        "change",
        handleCategoryChange
    );

    sortSelect.addEventListener(
        "change",
        handleSortChange
    );

    retryButton.addEventListener(
        "click",
        loadApplicationData
    );

    refreshButton.addEventListener(
        "click",
        loadApplicationData
    );

    themeToggle.addEventListener(
        "click",
        toggleTheme
    );
}


/* =========================================
   API DATA LOADING
   ========================================= */

async function loadApplicationData() {

    showLoadingState();

    try {

        const [
            products,
            categories
        ] = await Promise.all([
            fetchProducts(),
            fetchCategories()
        ]);

        state.products = products;

        populateCategories(categories);

        restoreSavedFilters();

        applyFilters();

        hideLoadingState();

    } catch (error) {

        console.error(
            "Failed to load application data:",
            error
        );

        showErrorState(
            error.message
        );
    }
}


/* =========================================
   CATEGORY FILTER
   ========================================= */

function populateCategories(categories) {

    const sortedCategories =
        [...categories].sort();

    categoryFilter.innerHTML = `
        <option value="all">
            All categories
        </option>
    `;

    sortedCategories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent =
            formatCategoryName(category);

        categoryFilter.appendChild(option);
    });
}


function formatCategoryName(category) {

    return category
        .replace(/-/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );
}


/* =========================================
   SEARCH
   ========================================= */

function handleSearch(event) {

    state.searchTerm =
        event.target.value
            .trim()
            .toLowerCase();

    saveFilters();

    applyFilters();
}


/* =========================================
   CATEGORY CHANGE
   ========================================= */

function handleCategoryChange(event) {

    state.category =
        event.target.value;

    saveFilters();

    applyFilters();
}


/* =========================================
   SORTING
   ========================================= */

function handleSortChange(event) {

    state.sort =
        event.target.value;

    saveFilters();

    applyFilters();
}


/* =========================================
   FILTER + SORT PIPELINE
   ========================================= */

function applyFilters() {

    let results =
        [...state.products];


    /* Search filtering */

    if (state.searchTerm) {

        results =
            results.filter(product =>
                product.title
                    .toLowerCase()
                    .includes(state.searchTerm)
            );
    }


    /* Category filtering */

    if (state.category !== "all") {

        results =
            results.filter(product =>
                product.category === state.category
            );
    }


    /* Sorting */

    switch (state.sort) {

        case "title-asc":

            results.sort((a, b) =>
                a.title.localeCompare(b.title)
            );

            break;


        case "title-desc":

            results.sort((a, b) =>
                b.title.localeCompare(a.title)
            );

            break;


        case "price-asc":

            results.sort((a, b) =>
                a.price - b.price
            );

            break;


        case "price-desc":

            results.sort((a, b) =>
                b.price - a.price
            );

            break;


        default:
            break;
    }


    state.filteredProducts =
        results;

    renderProducts(results);
}


/* =========================================
   DOM RENDERING
   ========================================= */

function renderProducts(products) {

    productsGrid.innerHTML = "";

    if (products.length === 0) {

        emptyState.hidden = false;

        updateResultsSummary(0);

        return;
    }

    emptyState.hidden = true;

    const fragment =
        document.createDocumentFragment();


    products.forEach(product => {

        const card =
            createProductCard(product);

        fragment.appendChild(card);
    });


    productsGrid.appendChild(fragment);

    updateResultsSummary(products.length);
}


function createProductCard(product) {

    const article =
        document.createElement("article");

    article.className =
        "product-card";


    const image =
        document.createElement("img");

    image.className =
        "product-image";

    image.src =
        product.thumbnail;

    image.alt =
        product.title;

    image.loading =
        "lazy";


    const content =
        document.createElement("div");

    content.className =
        "product-content";


    const category =
        document.createElement("span");

    category.className =
        "product-category";

    category.textContent =
        formatCategoryName(
            product.category
        );


    const title =
        document.createElement("h3");

    title.className =
        "product-title";

    title.textContent =
        product.title;


    const description =
        document.createElement("p");

    description.className =
        "product-description";

    description.textContent =
        product.description;


    const footer =
        document.createElement("div");

    footer.className =
        "product-footer";


    const price =
        document.createElement("strong");

    price.className =
        "product-price";

    price.textContent =
        `$${product.price.toFixed(2)}`;


    const rating =
        document.createElement("span");

    rating.className =
        "product-rating";

    rating.textContent =
        `★ ${product.rating.toFixed(1)}`;


    footer.append(
        price,
        rating
    );


    content.append(
        category,
        title,
        description,
        footer
    );


    article.append(
        image,
        content
    );


    return article;
}


/* =========================================
   RESULTS SUMMARY
   ========================================= */

function updateResultsSummary(count) {

    const total =
        state.products.length;

    resultsSummary.textContent =
        `Showing ${count} of ${total} products`;
}


/* =========================================
   LOCAL STORAGE
   ========================================= */

function saveFilters() {

    const filters = {
        searchTerm: state.searchTerm,
        category: state.category,
        sort: state.sort
    };

    localStorage.setItem(
        "productExplorerFilters",
        JSON.stringify(filters)
    );
}


function restoreSavedFilters() {

    const saved =
        localStorage.getItem(
            "productExplorerFilters"
        );

    if (!saved) {
        return;
    }

    try {

        const filters =
            JSON.parse(saved);


        if (
            typeof filters.searchTerm ===
            "string"
        ) {
            state.searchTerm =
                filters.searchTerm;

            searchInput.value =
                filters.searchTerm;
        }


        if (
            typeof filters.category ===
            "string"
        ) {
            const categoryExists =
                [...categoryFilter.options]
                    .some(
                        option =>
                            option.value ===
                            filters.category
                    );

            if (categoryExists) {

                state.category =
                    filters.category;

                categoryFilter.value =
                    filters.category;
            }
        }


        if (
            typeof filters.sort ===
            "string"
        ) {

            state.sort =
                filters.sort;

            sortSelect.value =
                filters.sort;
        }

    } catch (error) {

        console.warn(
            "Could not restore saved filters:",
            error
        );
    }
}


/* =========================================
   LOADING STATE
   ========================================= */

function showLoadingState() {

    loadingState.hidden = false;

    errorState.hidden = true;

    emptyState.hidden = true;

    productsGrid.innerHTML = "";

    resultsSummary.textContent =
        "Loading products...";
}


function hideLoadingState() {

    loadingState.hidden = true;
}


/* =========================================
   ERROR STATE
   ========================================= */

function showErrorState(message) {

    loadingState.hidden = true;

    errorState.hidden = false;

    productsGrid.innerHTML = "";

    emptyState.hidden = true;

    errorMessage.textContent =
        message ||
        "Unable to load product data.";

    resultsSummary.textContent =
        "Unable to load products.";
}


/* =========================================
   THEME
   ========================================= */

function applyTheme() {

    const isDark =
        state.theme === "dark";

    document.body.classList.toggle(
        "dark-theme",
        isDark
    );

    themeToggle.textContent =
        isDark ? "☀️" : "🌙";

    themeToggle.setAttribute(
        "aria-label",
        isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
    );
}


function toggleTheme() {

    state.theme =
        state.theme === "dark"
            ? "light"
            : "dark";

    localStorage.setItem(
        "theme",
        state.theme
    );

    applyTheme();
}