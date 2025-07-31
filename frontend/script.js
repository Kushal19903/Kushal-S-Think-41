// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const paginationEl = document.getElementById('pagination');
const productDetailContent = document.getElementById('product-content');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart display
function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Update cart count
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-cart-x fs-1"></i>
                <p class="mt-3">Your cart is empty</p>
            </div>
        `;
        cartTotal.textContent = '0.00';
        checkoutBtn.disabled = true;
    } else {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
        checkoutBtn.disabled = false;
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item d-flex align-items-center border-bottom py-3">
                <div class="cart-item-image me-3">
                    <div class="bg-light rounded d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                        <span class="fw-bold text-primary">${item.name.substring(0, 2)}</span>
                    </div>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.name}</h6>
                    <p class="text-muted mb-1 small">${item.brand}</p>
                    <p class="text-success mb-0 fw-bold">$${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">
                        <i class="bi bi-dash"></i>
                    </button>
                    <span class="mx-2 fw-bold">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">
                        <i class="bi bi-plus"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Add to cart function
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.retail_price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    
    // Show success toast
    showToast('Product added to cart!', 'success');
}

// Update cart quantity
function updateCartQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCartDisplay();
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    showToast('Product removed from cart', 'info');
}

// Search functionality
function performSearch() {
    const searchTerm = document.getElementById('search-input').value.trim();
    if (searchTerm) {
        searchProducts(searchTerm);
    }
}

// Search products
async function searchProducts(searchTerm) {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/products?search=${encodeURIComponent(searchTerm)}&limit=50`);
        if (!response.ok) {
            throw new Error('Search failed');
        }
        
        const result = await response.json();
        renderProducts(result.data);
        
        // Update header
        document.getElementById('current-department-name').textContent = `Search Results for "${searchTerm}"`;
        document.getElementById('current-department-count').textContent = `${result.data.length} products found`;
        document.getElementById('breadcrumb-path').textContent = `Home > Search > "${searchTerm}"`;
        
        if (productsGrid) productsGrid.style.display = 'grid';
        if (loadingEl) loadingEl.style.display = 'none';
        
        // Clear active department
        document.querySelectorAll('.department-item').forEach(item => {
            item.classList.remove('active');
        });
        
    } catch (error) {
        showError(error.message);
        console.error('Search error:', error);
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'primary'} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Add toast
    const toastElement = document.createElement('div');
    toastElement.innerHTML = toastHtml;
    toastContainer.appendChild(toastElement.firstElementChild);
    
    // Show toast
    const toast = new bootstrap.Toast(toastContainer.lastElementChild);
    toast.show();
    
    // Remove toast element after it's hidden
    toastContainer.lastElementChild.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

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
        const params = new URLSearchParams(window.location.search);
        const departmentId = params.get('department');
        
        let url = `${API_BASE_URL}/products?page=${page}&limit=${limit}`;
        if (departmentId) {
            url += `&department=${departmentId}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }
        
        const result = await response.json();
        renderProducts(result.data);
        renderPagination(result.pagination);
        
        // Update current department count if we're showing all products
        if (!departmentId) {
            const departmentCountEl = document.getElementById('current-department-count');
            if (departmentCountEl) {
                departmentCountEl.textContent = `${result.pagination.total} products`;
            }
        }
        
        if (productsGrid) productsGrid.style.display = 'grid';
        if (loadingEl) loadingEl.style.display = 'none';
        
    } catch (error) {
        showError(error.message);
        console.error('Product load error:', error);
    }
}

// Load departments list
async function loadDepartmentsList() {
    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/departments`);
        if (!response.ok) {
            throw new Error('Failed to load departments.');
        }
        const result = await response.json();
        renderDepartments(result.departments);
        loadingEl.style.display = 'none';
    } catch (error) {
        showError(error.message);
        console.error('Departments load error:', error);
    }
}

// Load departments for sidebar
async function loadDepartmentsSidebar() {
    try {
        const response = await fetch(`${API_BASE_URL}/departments`);
        if (!response.ok) {
            throw new Error('Failed to load departments.');
        }
        const result = await response.json();
        renderDepartmentsSidebar(result.departments);
        
        // Also get total product count for "All Products"
        const productsResponse = await fetch(`${API_BASE_URL}/products?page=1&limit=1`);
        if (productsResponse.ok) {
            const productsResult = await productsResponse.json();
            const allCountEl = document.getElementById('all-count');
            if (allCountEl) {
                allCountEl.textContent = `${productsResult.pagination.total} products`;
            }
        }
    } catch (error) {
        console.error('Departments sidebar load error:', error);
        const departmentsList = document.getElementById('departments-list');
        if (departmentsList) {
            departmentsList.innerHTML = '<div class="error-message">Failed to load departments</div>';
        }
    }
}

// Render departments in sidebar
function renderDepartmentsSidebar(departments) {
    const departmentsList = document.getElementById('departments-list');
    if (!departmentsList) return;

    departmentsList.innerHTML = '';
    departments.forEach(department => {
        const departmentItem = document.createElement('div');
        departmentItem.className = 'department-item';
        departmentItem.setAttribute('data-department', department.id);
        departmentItem.onclick = () => selectDepartment(department.id, department.name);

        departmentItem.innerHTML = `
            <span class="department-name">${department.name}</span>
            <span class="product-count">${department.product_count} products</span>
        `;

        departmentsList.appendChild(departmentItem);
    });
}

// Get department name by ID
async function getDepartmentName(departmentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/departments/${departmentId}`);
        if (response.ok) {
            const department = await response.json();
            return department.name;
        }
    } catch (error) {
        console.error('Error getting department name:', error);
    }
    return 'Unknown Department';
}

// Render departments in grid
function renderDepartments(departments) {
    const departmentsGrid = document.getElementById('departments-grid');
    if (!departmentsGrid) return;

    departmentsGrid.innerHTML = '';
    departments.forEach(department => {
        const departmentCard = document.createElement('div');
        departmentCard.className = 'department-card';

        departmentCard.innerHTML = `
            <h2>${department.name}</h2>
            <p>${department.product_count} products</p>
            <a href="department.html?id=${department.id}" class="view-department">View Department</a>
        `;

        departmentsGrid.appendChild(departmentCard);
    });
}

// Load department products
async function loadDepartmentProducts(departmentId, page = 1, limit = 12) {
    showLoading();

    try {
        const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/products?page=${page}&limit=${limit}`);
        if (!response.ok) {
            throw new Error('Failed to load department products.');
        }
        const result = await response.json();
        renderProducts(result.products);
        renderPagination(result.pagination);

        // Update header
        const departmentNameEl = document.getElementById('current-department-name');
        const departmentCountEl = document.getElementById('current-department-count');
        if (departmentNameEl) departmentNameEl.textContent = result.department;
        if (departmentCountEl) departmentCountEl.textContent = `${result.pagination.total} products`;

        if (productsGrid) productsGrid.style.display = 'grid';
        if (loadingEl) loadingEl.style.display = 'none';

    } catch (error) {
        showError(`${error.message}`);
        console.error('Department products load error:', error);
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
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm add-to-cart-btn" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <i class="bi bi-cart-plus"></i> Add to Cart
                    </button>
                    <a href="details.html?id=${product.id}" class="btn btn-outline-primary btn-sm">View Details</a>
                </div>
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
                <p><strong>Department:</strong> ${product.department || 'N/A'}</p>
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
function renderPagination(pagination, currentPage = 'index') {
    if (!paginationEl) return;
    
    paginationEl.innerHTML = '';
    const { page, total_pages } = pagination;
    
    // Create pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container';
    
    // Determine the current page URL
    const path = window.location.pathname.split('/').pop();
    const params = new URLSearchParams(window.location.search);
    
    let baseUrl = 'index.html';
    if (path === 'department.html') {
        baseUrl = 'department.html';
    }
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '&larr; Prev';
    prevBtn.disabled = page <= 1;
    prevBtn.onclick = () => {
        if (page > 1) {
            params.set('page', page - 1);
            window.location.href = `${baseUrl}?${params.toString()}`;
        }
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
        if (page < total_pages) {
            params.set('page', page + 1);
            window.location.href = `${baseUrl}?${params.toString()}`;
        }
    };
    paginationContainer.appendChild(nextBtn);
    
    paginationEl.appendChild(paginationContainer);
}

// Add department filter functionality
async function loadDepartments() {
    try {
        const response = await fetch(`${API_BASE_URL}/departments`);
        const departments = await response.json();
        
        const filterEl = document.getElementById('department-filter');
        if (filterEl) {
            filterEl.innerHTML = `
                <select onchange="filterByDepartment(this.value)">
                    <option value="">All Departments</option>
                    ${departments.map(d => `
                        <option value="${d.id}">${d.name}</option>
                    `).join('')}
                </select>
            `;
        }
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

async function filterByDepartment(departmentId) {
    const params = new URLSearchParams(window.location.search);
    if (departmentId) {
        params.set('department', departmentId);
    } else {
        params.delete('department');
    }
    params.set('page', '1');
    window.location.search = params.toString();
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
        loadDepartments();
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