// Constants and State Management
const CACHE_KEY = 'paymentProofData';
const CACHE_TIMESTAMP_KEY = 'paymentProofTimestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

let currentPage = 1;
let itemsPerPage = 20;
let payments = [];
let filteredPayments = [];

// DOM Elements
const tableContent = document.getElementById('table-content');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const itemsPerPageSelect = document.getElementById('itemsPerPage');
const loadingSpinner = document.getElementById('loadingSpinner');

// Utility Functions
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(date);
}

function generateRandomId() {
    const firstLetter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    const stars = '****';
    const alphaNumeric = Array(4).fill()
        .map(() => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 36)])
        .join('');
    return `${firstLetter}${stars}${alphaNumeric}`;
}

function generateRandomAmount() {
    return (Math.random() * 300 + 100).toFixed(2);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.querySelector('.toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Data Management
function generatePayments(count) {
    const now = new Date();
    return Array(count).fill(null).map((_, index) => ({
        id: index + 1,
        userId: generateRandomId(),
        amount: generateRandomAmount(),
        status: Math.random() < 0.65 ? 'Completed' : 'Pending',
        timestamp: new Date(now - Math.random() * 24 * 60 * 60 * 1000)
    }));
}

async function loadPayments() {
    showLoadingState();

    try {
        // Check cache
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

        if (cachedData && cachedTimestamp) {
            const now = new Date().getTime();
            const timestamp = parseInt(cachedTimestamp);

            if (now - timestamp < CACHE_DURATION) {
                payments = JSON.parse(cachedData);
                filteredPayments = [...payments];
                hideLoadingState();
                renderPayments();
                showToast('Data loaded from cache', 'success');
                return;
            }
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const recordCount = Math.floor(Math.random() * 201) + 400;
        payments = generatePayments(recordCount);
        filteredPayments = [...payments];

        // Cache new data
        localStorage.setItem(CACHE_KEY, JSON.stringify(payments));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().getTime().toString());

        hideLoadingState();
        renderPayments();
        showToast('Fresh data loaded', 'success');
    } catch (error) {
        showToast('Error loading data', 'error');
        hideLoadingState();
    }
}

// UI Rendering
function renderPayments() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPayments = filteredPayments.slice(startIndex, endIndex);

    tableContent.innerHTML = '';

    currentPayments.forEach((payment, index) => {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.style.animationDelay = `${index * 0.05}s`;
        
        row.innerHTML = `
            <span data-label="ID">${payment.id}</span>
            <span data-label="User">${payment.userId}</span>
            <span data-label="Amount">$${payment.amount}</span>
            <span data-label="Status">
                <div class="status-pill status-${payment.status.toLowerCase()}">
                    ${payment.status}
                </div>
            </span>
            <span data-label="Time">${formatDate(new Date(payment.timestamp))}</span>
        `;
        
        tableContent.appendChild(row);
    });

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = currentPage === totalPages;
}

function showLoadingState() {
    loadingSpinner.style.display = 'flex';
}

function hideLoadingState() {
    loadingSpinner.style.display = 'none';
}

// Event Handlers
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPayments();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderPayments();
    }
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;

    filteredPayments = payments.filter(payment => {
        const matchesSearch = (
            payment.userId.toLowerCase().includes(searchTerm) ||
            payment.amount.toString().includes(searchTerm)
        );
        const matchesStatus = statusFilterValue === 'all' || 
            payment.status.toLowerCase() === statusFilterValue;

        return matchesSearch && matchesStatus;
    });

    currentPage = 1;
    renderPayments();
}

function setupCacheReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 1, 0, 0);

    const timeUntilReset = tomorrow - now;

    setTimeout(() => {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        loadPayments();
        setupCacheReset(); // Setup next day's reset
    }, timeUntilReset);
}

// Event Listeners
document.getElementById('prev-btn').addEventListener('click', previousPage);
document.getElementById('next-btn').addEventListener('click', nextPage);
searchInput.addEventListener('input', handleSearch);
statusFilter.addEventListener('change', handleSearch);
itemsPerPageSelect.addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
    currentPage = 1;
    renderPayments();
});

// Initialize
window.addEventListener('load', () => {
    loadPayments();
    setupCacheReset();
});