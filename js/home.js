// تهيئة الصفحة الرئيسية
// تهيئة الصفحة الرئيسية
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    initializeProductFilter();
    initializeTestimonialSlider();
    initializeContactForm();
});

// تحميل المنتجات وعرضها
function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const products = ProductManager.getAll();
    
    // إذا لم تكن هناك منتجات، نضيف بعض المنتجات الافتراضية
    if (products.length === 0) {
        const defaultProducts = [
            {
                id: 1,
                name: "قات صعدي ممتاز",
                description: "من أجود أنواع القات الصعدي، يتميز بالنضارة والمذاق الرائع.",
                price: 150,
                category: "premium",
                image: "images/qat2.jpg"
            },
            {
                id: 2,
                name: "قات صعدي مميز",
                description: "نوعية مميزة من القات الصعدي، تجمع بين الجودة والسعر المناسب.",
                price: 120,
                category: "special",
                image: "https://via.placeholder.com/300x200/f5f5f5/0a5c36?text=Special+Qat"
            },
            {
                id: 3,
                name: "قات صعدي عادي",
                description: "نوعية جيدة من القات الصعدي تناسب جميع الأذواق.",
                price: 90,
                category: "regular",
                image: "https://via.placeholder.com/300x200/f5f5f5/0a5c36?text=Regular+Qat"
            },
            {
                id: 4,
                name: "قات صعدي فاخر",
                description: "أجود أنواع القات الصعدي، مخصص للذواقة والمتذوقين.",
                price: 200,
                category: "premium",
                image: "https://via.placeholder.com/300x200/f5f5f5/0a5c36?text=Premium+Qat"
            }
        ];
        
        defaultProducts.forEach(product => {
            ProductManager.add(product);
        });
        
        // إعادة تحميل المنتجات بعد الإضافة
        loadProducts();
        return;
    }
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-category', product.category);
        
        productCard.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200/f5f5f5/0a5c36?text=Product+Image'">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">
                    <span class="price">${product.price} ر.س</span>
                    <a href="#" class="btn" onclick="addToCart(${product.id})">اطلب الآن</a>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// تهيئة فلتر المنتجات
function initializeProductFilter() {
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Show/hide products based on filter
            document.querySelectorAll('.product-card').forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// تهيئة شريط آراء العملاء
function initializeTestimonialSlider() {
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.slider-dot');
    let currentSlide = 0;

    function showSlide(n) {
        // Hide all testimonials
        testimonials.forEach(testimonial => {
            testimonial.classList.remove('active');
        });
        
        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show current testimonial and activate corresponding dot
        testimonials[n].classList.add('active');
        dots[n].classList.add('active');
        
        currentSlide = n;
    }

    // Add click event to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            showSlide(index);
        });
    });

    // Auto slide every 5 seconds
    setInterval(() => {
        let nextSlide = (currentSlide + 1) % testimonials.length;
        showSlide(nextSlide);
    }, 5000);
}

// تهيئة نموذج الاتصال
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // هنا يمكنك إضافة كود لإرسال البيانات إلى الخادم
            alert(`شكراً لك ${name}!
            تم استلام رسالتك بنجاح وسنتواصل معك قريباً.`);
            
            // إعادة تعيين النموذج
            contactForm.reset();
        });
    }
}

// إضافة منتج إلى سلة التسوق (وظيفة تجريبية)
function addToCart(productId) {
    const product = ProductManager.find(productId);
    
    if (product) {
        alert(`تم إضافة ${product.name} إلى سلة التسوق!
        السعر: ${product.price} ر.س`);
        
        // هنا يمكنك إضافة منطق سلة التسوق الحقيقية
    }
}