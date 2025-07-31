

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const paginationEl = document.getElementById('pagination');
const productDetailContent = document.getElementById('product-content');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

// Show loading state
function showLoading() {
    if (loadingEl) {
        loadingEl.style.display = 'block';
        loadingEl.innerHTML = '<div class="spinner"></div><p>Loading...</p>';
    }
    if (productsGrid) productsGrid.style.display = 'none';
    if (productDetailContent) productDetailContent.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
}

// Show error message
function showError(message) {
    if (errorEl) {
        errorEl.innerHTML = `
            <div class="error-icon">!</div>
            <p>${message}</p>
            <button onclick="location.reload()">Try Again</button>
        `;
        errorEl.style.display = 'flex';
    }
    if (loadingEl) loadingEl.style.display = 'none';
}

// Load products with pagination
async function loadProducts(page = 1, limit = 12) {
    showLoading();
    
    try {
        // Add artificial delay to show loading state (remove in production)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        const result = await response.json();
        renderProducts(result.data);
        renderPagination(result.pagination);
        
        if (productsGrid) productsGrid.style.display = 'grid';
        if (loadingEl) loadingEl.style.display = 'none';
        
    } catch (error) {
        showError(error.message);
        console.error('Product load error:', error);
    }
}

// Load single product details
async function loadProductDetails(productId) {
    showLoading();
    
    try {
        // Add artificial delay to show loading state (remove in production)
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        
        if (response.status === 404) {
            showError('Product not found');
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const product = await response.json();
        renderProductDetail(product);
        
        if (productDetailContent) {
            productDetailContent.style.display = 'flex';
            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (loadingEl) loadingEl.style.display = 'none';
        
    } catch (error) {
        showError(error.message);
        console.error('Product detail error:', error);
    }
}

// Render products in grid
function renderProducts(products) {
    if (!productsGrid) return;
    
    if (!products || products.length === 0) {
        productsGrid.innerHTML = '<div class="no-products">No products found</div>';
        return;
    }
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image">
                <div class="image-placeholder">
                    <span>${product.name.substring(0, 2)}</span>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${truncateText(product.name, 50)}</h3>
                <p class="product-brand">${product.brand}</p>
                <p class="product-price">$${product.retail_price.toFixed(2)}</p>
                <a href="details.html?id=${product.id}" class="view-details">View Details</a>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// Render product details
function renderProductDetail(product) {
    if (!productDetailContent) return;
    
    productDetailContent.innerHTML = `
        <div class="detail-image">
            <div class="image-placeholder large">
                <span>${product.name.substring(0, 2)}</span>
            </div>
        </div>
        <div class="detail-info">
            <h2 class="detail-name">${product.name}</h2>
            <p class="detail-price">$${product.retail_price.toFixed(2)}</p>
            
            <div class="detail-meta">
                <p><strong>Brand:</strong> ${product.brand}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Department:</strong> ${product.department}</p>
                <p><strong>SKU:</strong> ${product.sku}</p>
                <p><strong>Cost:</strong> $${product.cost.toFixed(2)}</p>
                <p><strong>Distribution Center:</strong> ${product.distribution_center_id}</p>
            </div>
            
            <button class="add-to-cart">Add to Cart</button>
        </div>
    `;
    
    // Add event listener to cart button
    const cartBtn = productDetailContent.querySelector('.add-to-cart');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            alert(`Added ${product.name} to cart!`);
        });
    }
}

// Render pagination controls
function renderPagination(pagination) {
    if (!paginationEl) return;
    
    paginationEl.innerHTML = '';
    const { page, total_pages } = pagination;
    
    // Create pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '&larr; Prev';
    prevBtn.disabled = page <= 1;
    prevBtn.onclick = () => {
        if (page > 1) window.location.href = `index.html?page=${page - 1}`;
    };
    paginationContainer.appendChild(prevBtn);
    
    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Page ${page} of ${total_pages}`;
    paginationContainer.appendChild(pageInfo);
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = 'Next &rarr;';
    nextBtn.disabled = page >= total_pages;
    nextBtn.onclick = () => {
        if (page < total_pages) window.location.href = `index.html?page=${page + 1}`;
    };
    paginationContainer.appendChild(nextBtn);
    
    paginationEl.appendChild(paginationContainer);
}

// Helper function to truncate long text
function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Initialize page based on current HTML file
function initPage() {
    const path = window.location.pathname.split('/').pop();
    
    if (path === 'index.html' || path === '') {
        const page = new URLSearchParams(window.location.search).get('page') || 1;
        loadProducts(page);
    }
    else if (path === 'details.html') {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        
        if (!productId) {
            showError('No product ID specified');
            return;
        }
        
        loadProductDetails(productId);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);