// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// إدارة بيانات localStorage
const DataManager = {
    // حفظ البيانات
    save: function(key, data) {
        localStorage.setItem(`artal_${key}`, JSON.stringify(data));
    },
    
    // جلب البيانات
    get: function(key) {
        return JSON.parse(localStorage.getItem(`artal_${key}`)) || null;
    },
    
    // حذف البيانات
    remove: function(key) {
        localStorage.removeItem(`artal_${key}`);
    },
    
    // مسح جميع البيانات
    clear: function() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('artal_')) {
                localStorage.removeItem(key);
            }
        });
    }
};

// إدارة المنتجات
const ProductManager = {
    // جلب جميع المنتجات
    getAll: function() {
        return DataManager.get('products') || [];
    },
    
    // حفظ المنتجات
    saveAll: function(products) {
        DataManager.save('products', products);
    },
    
    // إضافة منتج جديد
    add: function(product) {
        const products = this.getAll();
        product.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push(product);
        this.saveAll(products);
        return product;
    },
    
    // تحديث منتج
    update: function(id, updatedProduct) {
        const products = this.getAll();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct };
            this.saveAll(products);
            return true;
        }
        return false;
    },
    
    // حذف منتج
    delete: function(id) {
        const products = this.getAll();
        const filteredProducts = products.filter(p => p.id !== id);
        this.saveAll(filteredProducts);
        return filteredProducts.length !== products.length;
    },
    
    // البحث عن منتج بالمعرف
    find: function(id) {
        const products = this.getAll();
        return products.find(p => p.id === id) || null;
    }
};

// إدارة الحركات المالية
const TransactionManager = {
    // جلب جميع الحركات
    getAll: function() {
        return DataManager.get('transactions') || [];
    },
    
    // حفظ الحركات
    saveAll: function(transactions) {
        DataManager.save('transactions', transactions);
    },
    
    // إضافة حركة جديدة
    add: function(transaction) {
        const transactions = this.getAll();
        transaction.id = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
        transactions.push(transaction);
        this.saveAll(transactions);
        return transaction;
    },
    
    // تحديث حركة
    update: function(id, updatedTransaction) {
        const transactions = this.getAll();
        const index = transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            transactions[index] = { ...transactions[index], ...updatedTransaction };
            this.saveAll(transactions);
            return true;
        }
        return false;
    },
    
    // حذف حركة
    delete: function(id) {
        const transactions = this.getAll();
        const filteredTransactions = transactions.filter(t => t.id !== id);
        this.saveAll(filteredTransactions);
        return filteredTransactions.length !== transactions.length;
    },
    
    // البحث عن حركة بالمعرف
    find: function(id) {
        const transactions = this.getAll();
        return transactions.find(t => t.id === id) || null;
    },
    
    // فلترة الحركات
    filter: function(filters = {}) {
        let transactions = this.getAll();
        
        if (filters.type) {
            transactions = transactions.filter(t => t.type === filters.type);
        }
        
        if (filters.category) {
            transactions = transactions.filter(t => t.category === filters.category);
        }
        
        if (filters.dateFrom) {
            transactions = transactions.filter(t => t.date >= filters.dateFrom);
        }
        
        if (filters.dateTo) {
            transactions = transactions.filter(t => t.date <= filters.dateTo);
        }
        
        return transactions;
    },
    
    // حساب الإحصائيات
    getStats: function() {
        const transactions = this.getAll();
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const netProfit = totalIncome - totalExpenses;
        
        return {
            totalIncome,
            totalExpenses,
            netProfit,
            totalTransactions: transactions.length
        };
    }
};

// إدارة التصنيفات
const CategoryManager = {
    // جلب جميع التصنيفات
    getAll: function() {
        return DataManager.get('categories') || {
            income: [
                { id: 'sales', name: 'مبيعات', color: '#27ae60' },
                { id: 'investment', name: 'استثمار', color: '#2ecc71' },
                { id: 'other-income', name: 'إيرادات أخرى', color: '#1abc9c' }
            ],
            expense: [
                { id: 'purchases', name: 'مشتريات', color: '#e74c3c' },
                { id: 'salaries', name: 'رواتب', color: '#c0392b' },
                { id: 'rent', name: 'إيجار', color: '#d35400' },
                { id: 'utilities', name: 'مرافق', color: '#e67e22' },
                { id: 'marketing', name: 'تسويق', color: '#f39c12' },
                { id: 'other-expenses', name: 'مصروفات أخرى', color: '#e74c3c' }
            ]
        };
    },
    
    // حفظ التصنيفات
    saveAll: function(categories) {
        DataManager.save('categories', categories);
    },
    
    // إضافة تصنيف جديد
    add: function(type, category) {
        const categories = this.getAll();
        category.id = category.name.replace(/\s+/g, '-').toLowerCase();
        categories[type].push(category);
        this.saveAll(categories);
        return category;
    },
    
    // تحديث تصنيف
    update: function(type, categoryId, updatedCategory) {
        const categories = this.getAll();
        const index = categories[type].findIndex(c => c.id === categoryId);
        if (index !== -1) {
            categories[type][index] = { ...categories[type][index], ...updatedCategory };
            this.saveAll(categories);
            return true;
        }
        return false;
    },
    
    // حذف تصنيف
    delete: function(type, categoryId) {
        const categories = this.getAll();
        categories[type] = categories[type].filter(c => c.id !== categoryId);
        this.saveAll(categories);
    },
    
    // البحث عن تصنيف بالمعرف
    find: function(categoryId) {
        const categories = this.getAll();
        let category = categories.income.find(c => c.id === categoryId);
        if (!category) {
            category = categories.expense.find(c => c.id === categoryId);
        }
        return category || null;
    }
};

// وظائف مساعدة
const Helper = {
    // تنسيق التاريخ
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG');
    },
    
    // تنسيق التاريخ للإدخال
    formatDateForInput: function(date) {
        return date.toISOString().split('T')[0];
    },
    
    // تنسيق المبلغ
    formatCurrency: function(amount) {
        return amount.toLocaleString() + ' ر.ي';
    },
    
    // إنشاء معرف فريد
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};
