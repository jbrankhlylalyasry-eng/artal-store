console.log('Admin JS loaded');
// إدارة لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminNavigation();
    loadDashboardData();
    loadProducts();
    loadOrders();
    initializeImageUpload();
});

// تهيئة التنقل في لوحة التحكم
function initializeAdminNavigation() {
    // إضافة حدث النقر لروابط التنقل
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            
            // تحديث الروابط النشطة
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // إظهار القسم المطلوب وإخفاء الآخرين
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

// تحميل بيانات لوحة التحكم
function loadDashboardData() {
    const products = ProductManager.getAll();
    const transactions = TransactionManager.getAll();
    
    // تحديث العدادات
    document.getElementById('productsCount').textContent = products.length;
    document.getElementById('ordersCount').textContent = '24'; // بيانات افتراضية
    document.getElementById('customersCount').textContent = '156'; // بيانات افتراضية
    
    // حساب الإيرادات من الحركات المالية
    const revenue = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    document.getElementById('revenueCount').textContent = Helper.formatCurrency(revenue);
    
    // تحميل التنبيهات
    loadAlerts();
    
    // تحميل المخططات
    loadCharts();
}

// تحميل التنبيهات
function loadAlerts() {
    const alertList = document.getElementById('alertList');
    const products = ProductManager.getAll();
    
    // تنظيف القائمة
    alertList.innerHTML = '';
    
    // تنبيهات المنتجات منخفضة الكمية (محاكاة)
    const lowStockProducts = products.filter(p => Math.random() > 0.7);
    
    lowStockProducts.forEach(product => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item warning';
        alertItem.innerHTML = `
            <i class="fas fa-exclamation-circle" style="color:var(--warning);"></i>
            <div class="alert-content">
                <strong>منتج على وشك النفاد</strong>
                <p>المنتج "${product.name}" كميته منخفضة في المخزن</p>
                <small>منذ ${Math.floor(Math.random() * 24)} ساعة</small>
            </div>
        `;
        alertList.appendChild(alertItem);
    });
    
    // تنبيهات افتراضية
    const defaultAlerts = [
        {
            type: 'info',
            icon: 'fas fa-shopping-cart',
            title: 'طلب جديد #1256',
            message: 'تم استلام طلب جديد من العميل أحمد محمد',
            time: 'منذ 5 دقائق'
        },
        {
            type: 'success',
            icon: 'fas fa-check-circle',
            title: 'تم توصيل الطلب #1248',
            message: 'تم توصيل الطلب إلى العميل سعيد القحطاني',
            time: 'منذ ساعة'
        }
    ];
    
    defaultAlerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item ${alert.type}`;
        alertItem.innerHTML = `
            <i class="${alert.icon}" style="color:var(--${alert.type});"></i>
            <div class="alert-content">
                <strong>${alert.title}</strong>
                <p>${alert.message}</p>
                <small>${alert.time}</small>
            </div>
        `;
        alertList.appendChild(alertItem);
    });
}

// تحميل المخططات
function loadCharts() {
    const salesChart = document.getElementById('salesChart');
    
    if (salesChart) {
        const ctx = salesChart.getContext('2d');
        
        // بيانات افتراضية للمخطط
        const data = {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [{
                label: 'المبيعات',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: 'rgba(10, 92, 54, 0.2)',
                borderColor: 'rgba(10, 92, 54, 1)',
                borderWidth: 2,
                tension: 0.4
            }]
        };
        
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true
                    },
                    title: {
                        display: true,
                        text: 'تطور المبيعات الشهرية'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };
        
        new Chart(ctx, config);
    }
}

// تحميل وعرض المنتجات
function loadProducts() {
    const productsList = document.getElementById('productsList');
    const products = ProductManager.getAll();
    
    productsList.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200/f5f5f5/0a5c36?text=Product+Image'">
                <div class="product-actions">
                    <button class="action-btn" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-meta">
                    <span class="price">${Helper.formatCurrency(product.price)}</span>
                    <span class="category">${getCategoryName(product.category)}</span>
                </div>
            </div>
        `;
        
        productsList.appendChild(productCard);
    });
}

// الحصول على اسم التصنيف
function getCategoryName(category) {
    switch(category) {
        case 'premium': return 'ممتاز';
        case 'special': return 'مميز';
        case 'regular': return 'عادي';
        default: return 'غير مصنف';
    }
}

// تهيئة رفع الصور
function initializeImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadedImages = document.getElementById('uploadedImages');

    // فتح متصفح الملفات عند النقر
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
    }
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });
    }

    // معالجة اختيار الملفات
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const files = e.target.files;
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        addImageToGallery(e.target.result, file.name);
                    };
                    
                    reader.readAsDataURL(file);
                }
            }
            
            fileInput.value = '';
        });
    }

    // السحب والإفلات
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary)';
            uploadArea.style.backgroundColor = '#f9f9f9';
        });

        uploadArea.addEventListener('dragleave', function() {
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.backgroundColor = '';
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.backgroundColor = '';
            
            const files = e.dataTransfer.files;
            fileInput.files = files;
            
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        });
    }
}

// إضافة صورة للمعرض
function addImageToGallery(src, filename) {
    const uploadedImages = document.getElementById('uploadedImages');
    
    if (!uploadedImages) return;
    
    // مسح الصور القديمة أولاً (نحتفظ بصورة واحدة فقط)
    uploadedImages.innerHTML = '';
    
    const imageId = 'img-' + Date.now();
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    imageItem.id = imageId;
    
    imageItem.innerHTML = `
        <img src="${src}" alt="${filename}">
        <button class="delete-btn" onclick="deleteImage('${imageId}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    uploadedImages.appendChild(imageItem);
    
    // حفظ الصورة في localStorage مع طابع زمني
    const imageData = {
        src: src,
        filename: filename,
        timestamp: Date.now()
    };
    
    localStorage.setItem(imageId, JSON.stringify(imageData));
}

// حذف الصورة
function deleteImage(imageId) {
    const imageItem = document.getElementById(imageId);
    if (imageItem) {
        imageItem.remove();
        localStorage.removeItem(imageId);
    }
}

// إضافة منتج جديد
const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
    addProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('productName').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const category = document.getElementById('productCategory').value;
        const description = document.getElementById('productDescription').value;
        
        // الحصول على الصورة المرفوعة (إن وجدت)
        const uploadedImages = document.getElementById('uploadedImages');
        let imageUrl = "https://via.placeholder.com/300x200/f5f5f5/0a5c36?text=New+Product";
        
        if (uploadedImages && uploadedImages.firstChild) {
            imageUrl = uploadedImages.firstChild.querySelector('img').src;
        }
        
        // إنشاء المنتج جديد
        const newProduct = {
            name: name,
            description: description,
            price: price,
            category: category,
            image: imageUrl
        };
        
        ProductManager.add(newProduct);
        loadProducts();
        loadDashboardData();
        
        // إعادة تعيين النموذج
        this.reset();
        if (uploadedImages) {
            uploadedImages.innerHTML = '';
        }
        
        alert('تم إضافة المنتج بنجاح!');
    });
}

// تعديل المنتج
function editProduct(id) {
    const product = ProductManager.find(id);
    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productDescription').value = product.description;
        
        // حذف المنتج القديم
        deleteProduct(id, false);
        
        alert('يمكنك الآن تعديل بيانات المنتج وحفظه مرة أخرى');
    }
}

// حذف المنتج
function deleteProduct(id, confirm = true) {
    if (!confirm || window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        ProductManager.delete(id);
        loadProducts();
        loadDashboardData();
    }
}

// تحميل وعرض الطلبات
function loadOrders() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    const ordersMobileCards = document.getElementById('ordersMobileCards');
    
    if (!ordersTableBody && !ordersMobileCards) return;
    
    // بيانات افتراضية للطلبات
    const orders = [
        {
            id: 1256,
            customer: "أحمد محمد",
            date: "2023-10-15",
            amount: 15000,
            status: "pending",
            statusText: "قيد المعالجة"
        },
        {
            id: 1255,
            customer: "سعيد القحطاني",
            date: "2023-10-14",
            amount: 12000,
            status: "completed",
            statusText: "مكتمل"
        },
        {
            id: 1254,
            customer: "خالد عبدالله",
            date: "2023-10-13",
            amount: 9000,
            status: "cancelled",
            statusText: "ملغي"
        }
    ];
    
    // تحديث الجدول (لشاشات الكمبيوتر)
    if (ordersTableBody) {
        ordersTableBody.innerHTML = '';
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.id}</td>
                <td>${order.customer}</td>
                <td>${Helper.formatDate(order.date)}</td>
                <td>${Helper.formatCurrency(order.amount)}</td>
                <td><span class="status status-${order.status}">${order.statusText}</span></td>
                <td>
                    <button class="action-btn"><i class="fas fa-eye"></i></button>
                    <button class="action-btn"><i class="fas fa-edit"></i></button>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });
    }
    
    // تحديث البطاقات (للهواتف)
    if (ordersMobileCards) {
        ordersMobileCards.innerHTML = '';
        
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'mobile-card';
            orderCard.innerHTML = `
                <div class="mobile-card-header">
                    <div class="mobile-card-title">طلب #${order.id}</div>
                    <span class="status status-${order.status}">${order.statusText}</span>
                </div>
                <div class="mobile-card-body">
                    <div class="mobile-card-row">
                        <span class="mobile-card-label">العميل:</span>
                        <span class="mobile-card-value">${order.customer}</span>
                    </div>
                    <div class="mobile-card-row">
                        <span class="mobile-card-label">التاريخ:</span>
                        <span class="mobile-card-value">${Helper.formatDate(order.date)}</span>
                    </div>
                    <div class="mobile-card-row">
                        <span class="mobile-card-label">المبلغ:</span>
                        <span class="mobile-card-value">${Helper.formatCurrency(order.amount)}</span>
                    </div>
                </div>
                <div class="mobile-card-actions">
                    <button class="action-btn"><i class="fas fa-eye"></i></button>
                    <button class="action-btn"><i class="fas fa-edit"></i></button>
                </div>
            `;
            ordersMobileCards.appendChild(orderCard);
        });
    }
}