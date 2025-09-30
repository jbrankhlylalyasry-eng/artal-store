// إدارة دفتر الحسابات
document.addEventListener('DOMContentLoaded', function() {
    initializeAccountingNavigation();
    loadCategories();
    loadTransactions();
    updateAccountingSummary();
    updateReports();
    initializeCharts();
    initializeEventListeners();
    
    // تعيين التاريخ الافتراضي لتاريخ اليوم
    const transactionDate = document.getElementById('transactionDate');
    if (transactionDate) {
        transactionDate.valueAsDate = new Date();
    }
    
    // تعيين تواريخ الفلتر لتكون الشهر الحالي
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    
    if (filterDateFrom && filterDateTo) {
        filterDateFrom.value = Helper.formatDateForInput(firstDayOfMonth);
        filterDateTo.value = Helper.formatDateForInput(today);
    }
});

// تهيئة التنقل في دفتر الحسابات
function initializeAccountingNavigation() {
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
            
            // إذا كان القسم هو التقارير، قم بتحديث المخططات
            if (targetSection === 'reports') {
                updateReports();
                initializeCharts();
            }
        });
    });
}

// تهيئة مستمعي الأحداث
function initializeEventListeners() {
    // إضافة حركة مالية جديدة
    const addTransactionForm = document.getElementById('addTransactionForm');
    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const type = document.getElementById('transactionType').value;
            const amount = parseFloat(document.getElementById('transactionAmount').value);
            const date = document.getElementById('transactionDate').value;
            const category = document.getElementById('transactionCategory').value;
            const description = document.getElementById('transactionDescription').value;
            const paymentMethod = document.getElementById('transactionPaymentMethod').value;
            
            // إنشاء حركة جديدة
            const newTransaction = {
                type: type,
                amount: amount,
                date: date,
                category: category,
                description: description,
                paymentMethod: paymentMethod
            };
            
            TransactionManager.add(newTransaction);
            loadTransactions();
            updateAccountingSummary();
            updateReports();
            initializeCharts();
            
            // إعادة تعيين النموذج
            this.reset();
            document.getElementById('transactionDate').valueAsDate = new Date();
            
            alert('تم إضافة الحركة المالية بنجاح!');
        });
    }

    // تطبيق الفلاتر
    const applyFilters = document.getElementById('applyFilters');
    if (applyFilters) {
        applyFilters.addEventListener('click', function() {
            loadTransactions();
        });
    }

    // تصدير التقرير
    const exportReport = document.getElementById('exportReport');
    if (exportReport) {
        exportReport.addEventListener('click', exportReportHandler);
    }

    // إضافة تصنيف جديد
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', addNewCategory);
    }
}

// تحميل وعرض التصنيفات
function loadCategories() {
    const categories = CategoryManager.getAll();
    
    // تحديث قائمة التصنيفات في النموذج
    updateCategorySelects(categories);
    
    // تحديث قائمة التصنيفات في الفلتر
    updateFilterCategories(categories);
    
    // تحديث قائمة التصنيفات في قسم إدارة التصنيفات
    renderCategories(categories);
}

// تحديث قوائم التصنيفات في النموذج
function updateCategorySelects(categories) {
    const incomeCategories = document.getElementById('incomeCategories');
    const expenseCategories = document.getElementById('expenseCategories');
    
    if (incomeCategories) {
        incomeCategories.innerHTML = '';
        categories.income.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            incomeCategories.appendChild(option);
        });
    }
    
    if (expenseCategories) {
        expenseCategories.innerHTML = '';
        categories.expense.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            expenseCategories.appendChild(option);
        });
    }
}

// تحديث قائمة التصنيفات في الفلتر
function updateFilterCategories(categories) {
    const filterCategory = document.getElementById('filterCategory');
    
    if (filterCategory) {
        filterCategory.innerHTML = '<option value="">الكل</option>';
        
        // إضافة تصنيفات الإيرادات
        categories.income.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            filterCategory.appendChild(option);
        });
        
        // إضافة تصنيفات المصروفات
        categories.expense.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            filterCategory.appendChild(option);
        });
    }
}

// عرض التصنيفات في قسم إدارة التصنيفات
function renderCategories(categories) {
    const incomeCategoriesList = document.getElementById('incomeCategoriesList');
    const expenseCategoriesList = document.getElementById('expenseCategoriesList');
    
    if (incomeCategoriesList) {
        incomeCategoriesList.innerHTML = '';
        
        categories.income.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';
            categoryElement.style.borderRightColor = category.color;
            
            categoryElement.innerHTML = `
                <div>
                    <strong>${category.name}</strong>
                    <small style="display:block; color: var(--text-light);">${getCategoryTransactionCount(category.id)} حركة</small>
                </div>
                <div class="category-actions">
                    <button class="action-btn" onclick="editCategory('income', '${category.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn btn-danger" onclick="deleteCategory('income', '${category.id}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            incomeCategoriesList.appendChild(categoryElement);
        });
    }
    
    if (expenseCategoriesList) {
        expenseCategoriesList.innerHTML = '';
        
        categories.expense.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';
            categoryElement.style.borderRightColor = category.color;
            
            categoryElement.innerHTML = `
                <div>
                    <strong>${category.name}</strong>
                    <small style="display:block; color: var(--text-light);">${getCategoryTransactionCount(category.id)} حركة</small>
                </div>
                <div class="category-actions">
                    <button class="action-btn" onclick="editCategory('expense', '${category.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn btn-danger" onclick="deleteCategory('expense', '${category.id}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            expenseCategoriesList.appendChild(categoryElement);
        });
    }
}

// الحصول على عدد الحركات لكل تصنيف
function getCategoryTransactionCount(categoryId) {
    const transactions = TransactionManager.getAll();
    return transactions.filter(t => t.category === categoryId).length;
}

// تحميل وعرض الحركات المالية
function loadTransactions() {
    const transactionsTableBody = document.getElementById('transactionsTableBody');
    const transactionsMobileCards = document.getElementById('transactionsMobileCards');
    
    // تطبيق الفلاتر
    const filteredTransactions = filterTransactions();
    
    // تحديث الجدول (لشاشات الكمبيوتر)
    if (transactionsTableBody) {
        transactionsTableBody.innerHTML = '';
        
        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${Helper.formatDate(transaction.date)}</td>
                <td><span class="transaction-type type-${transaction.type}">${getTypeText(transaction.type)}</span></td>
                <td>${getCategoryName(transaction.category)}</td>
                <td>${transaction.description}</td>
                <td class="amount-${transaction.type}">${Helper.formatCurrency(transaction.amount)}</td>
                <td>${getPaymentMethodText(transaction.paymentMethod)}</td>
                <td>
                    <button class="action-btn" onclick="editTransaction(${transaction.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn btn-danger" onclick="deleteTransaction(${transaction.id})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            transactionsTableBody.appendChild(row);
        });
    }
    
    // تحديث البطاقات (للهواتف)
    if (transactionsMobileCards) {
        transactionsMobileCards.innerHTML = '';
        
        filteredTransactions.forEach(transaction => {
            const card = document.createElement('div');
            card.className = `mobile-card ${transaction.type}`;
            
            card.innerHTML = `
                <div class="mobile-card-header">
                    <div class="mobile-card-title">${getCategoryName(transaction.category)}</div>
                    <span class="transaction-type type-${transaction.type}">${getTypeText(transaction.type)}</span>
                </div>
                <div class="mobile-card-body">
                    <div class="mobile-card-row">
                        <span class="mobile-card-label">التاريخ:</span>
                        <span class="mobile-card-value">${Helper.formatDate(transaction.date)}</span>
                    </div>
                    <div class="mobile-card-row">
                        <span class="mobile-card-label">الوصف:</span>
                        <span class="mobile-card-value">${transaction.description}</span>
                    </div>
                    <div class="mobile-card-row">
                        <span class="mobile-card-label">المبلغ:</span>
                        <span class="mobile-card-value ${transaction.type === 'income' ? 'amount-income' : 'amount-expense'}">${Helper.formatCurrency(transaction.amount)}</span>
                    </div>
                    <div class="mobile-card-row">
                        <span class="mobile-card-label">طريقة الدفع:</span>
                        <span class="mobile-card-value">${getPaymentMethodText(transaction.paymentMethod)}</span>
                    </div>
                </div>
                <div class="mobile-card-actions">
                    <button class="action-btn" onclick="editTransaction(${transaction.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn btn-danger" onclick="deleteTransaction(${transaction.id})"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            transactionsMobileCards.appendChild(card);
        });
    }
}

// تطبيق الفلاتر على الحركات
function filterTransactions() {
    const typeFilter = document.getElementById('filterType')?.value;
    const categoryFilter = document.getElementById('filterCategory')?.value;
    const dateFromFilter = document.getElementById('filterDateFrom')?.value;
    const dateToFilter = document.getElementById('filterDateTo')?.value;
    
    const filters = {};
    
    if (typeFilter) filters.type = typeFilter;
    if (categoryFilter) filters.category = categoryFilter;
    if (dateFromFilter) filters.dateFrom = dateFromFilter;
    if (dateToFilter) filters.dateTo = dateToFilter;
    
    return TransactionManager.filter(filters);
}

// تحديث ملخص الحسابات
function updateAccountingSummary() {
    const stats = TransactionManager.getStats();
    const transactions = TransactionManager.getAll();
    
    // حساب الحركات الشهرية
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyIncome = transactions
        .filter(t => t.type === 'income' && 
            new Date(t.date).getMonth() === currentMonth &&
            new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = transactions
        .filter(t => t.type === 'expense' && 
            new Date(t.date).getMonth() === currentMonth &&
            new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyProfit = monthlyIncome - monthlyExpenses;
    
    // تحديث واجهة المستخدم
    const totalIncome = document.getElementById('totalIncome');
    const totalExpenses = document.getElementById('totalExpenses');
    const netProfit = document.getElementById('netProfit');
    const cashBalance = document.getElementById('cashBalance');
    const monthlyIncomeElement = document.getElementById('monthlyIncome');
    const monthlyExpensesElement = document.getElementById('monthlyExpenses');
    const monthlyProfitElement = document.getElementById('monthlyProfit');
    
    if (totalIncome) totalIncome.textContent = Helper.formatCurrency(stats.totalIncome);
    if (totalExpenses) totalExpenses.textContent = Helper.formatCurrency(stats.totalExpenses);
    if (netProfit) netProfit.textContent = Helper.formatCurrency(stats.netProfit);
    if (cashBalance) cashBalance.textContent = Helper.formatCurrency(stats.netProfit);
    if (monthlyIncomeElement) monthlyIncomeElement.textContent = Helper.formatCurrency(monthlyIncome);
    if (monthlyExpensesElement) monthlyExpensesElement.textContent = Helper.formatCurrency(monthlyExpenses);
    if (monthlyProfitElement) monthlyProfitElement.textContent = Helper.formatCurrency(monthlyProfit);
}

// تحديث التقارير
function updateReports() {
    const transactions = TransactionManager.getAll();
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0;
    
    // حساب الحركات الشهرية
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => 
        new Date(t.date).getMonth() === currentMonth &&
        new Date(t.date).getFullYear() === currentYear
    ).length;
    
    // حساب نسبة الإيرادات إلى المصروفات
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const incomeExpenseRatio = totalIncome > 0 ? 
        Math.round((totalExpenses / totalIncome) * 100) : 0;
    
    // تحديث واجهة المستخدم
    const totalTransactionsElement = document.getElementById('totalTransactions');
    const avgTransactionElement = document.getElementById('avgTransaction');
    const monthlyTransactionsElement = document.getElementById('monthlyTransactions');
    const incomeExpenseRatioElement = document.getElementById('incomeExpenseRatio');
    
    if (totalTransactionsElement) totalTransactionsElement.textContent = totalTransactions;
    if (avgTransactionElement) avgTransactionElement.textContent = Helper.formatCurrency(avgTransaction);
    if (monthlyTransactionsElement) monthlyTransactionsElement.textContent = monthlyTransactions;
    if (incomeExpenseRatioElement) incomeExpenseRatioElement.textContent = `${incomeExpenseRatio}%`;
}

// تهيئة المخططات
function initializeCharts() {
    const transactions = TransactionManager.getAll();
    const categories = CategoryManager.getAll();
    
    // مخطط الإيرادات والمصروفات
    const incomeExpenseChart = document.getElementById('incomeExpenseChart');
    if (incomeExpenseChart) {
        const ctx = incomeExpenseChart.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['الإيرادات', 'المصروفات'],
                datasets: [{
                    data: [
                        transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                        transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
                    ],
                    backgroundColor: ['#27ae60', '#e74c3c'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        rtl: true
                    }
                }
            }
        });
    }
    
    // مخطط الإيرادات والمصروفات الشهرية
    const monthlyTrendChart = document.getElementById('monthlyTrendChart');
    if (monthlyTrendChart) {
        const ctx = monthlyTrendChart.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: getLast6Months(),
                datasets: [
                    {
                        label: 'الإيرادات',
                        data: getMonthlyData('income'),
                        backgroundColor: '#27ae60',
                        borderWidth: 1
                    },
                    {
                        label: 'المصروفات',
                        data: getMonthlyData('expense'),
                        backgroundColor: '#e74c3c',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // مخطط توزيع المصروفات حسب التصنيف
    const expensesByCategoryChart = document.getElementById('expensesByCategoryChart');
    if (expensesByCategoryChart) {
        const ctx = expensesByCategoryChart.getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories.expense.map(c => c.name),
                datasets: [{
                    data: categories.expense.map(c => 
                        transactions.filter(t => t.type === 'expense' && t.category === c.id)
                            .reduce((sum, t) => sum + t.amount, 0)
                    ),
                    backgroundColor: categories.expense.map(c => c.color),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        rtl: true
                    }
                }
            }
        });
    }
    
    // مخطط توزيع الإيرادات حسب التصنيف
    const incomeByCategoryChart = document.getElementById('incomeByCategoryChart');
    if (incomeByCategoryChart) {
        const ctx = incomeByCategoryChart.getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories.income.map(c => c.name),
                datasets: [{
                    data: categories.income.map(c => 
                        transactions.filter(t => t.type === 'income' && t.category === c.id)
                            .reduce((sum, t) => sum + t.amount, 0)
                    ),
                    backgroundColor: categories.income.map(c => c.color),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        rtl: true
                    }
                }
            }
        });
    }
}

// الحصول على بيانات الشهور الستة الأخيرة
function getLast6Months() {
    const months = [];
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
    }
    
    return months;
}

// الحصول على البيانات الشهرية
function getMonthlyData(type) {
    const data = [];
    const today = new Date();
    const transactions = TransactionManager.getAll();
    
    for (let i = 5; i >= 0; i--) {
        const year = today.getFullYear();
        const month = today.getMonth() - i;
        
        const monthlyAmount = transactions
            .filter(t => t.type === type && 
                new Date(t.date).getFullYear() === year &&
                new Date(t.date).getMonth() === month)
            .reduce((sum, t) => sum + t.amount, 0);
        
        data.push(monthlyAmount);
    }
    
    return data;
}

// معالج تصدير التقرير
function exportReportHandler() {
    const format = document.getElementById('exportFormat').value;
    const dateFrom = document.getElementById('exportDateFrom').value;
    const dateTo = document.getElementById('exportDateTo').value;
    
    // فلترة البيانات حسب التاريخ
    let filteredData = TransactionManager.getAll();
    if (dateFrom) {
        filteredData = filteredData.filter(t => t.date >= dateFrom);
    }
    if (dateTo) {
        filteredData = filteredData.filter(t => t.date <= dateTo);
    }
    
    if (filteredData.length === 0) {
        alert('لا توجد بيانات للتصدير في الفترة المحددة');
        return;
    }
    
    // حساب الإحصائيات
    const totalIncome = filteredData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalExpenses = filteredData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const netProfit = totalIncome - totalExpenses;
    
    // إنشاء اسم الملف
    const fileName = `تقرير_المالي_${dateFrom || 'الكل'}_${dateTo || 'الكل'}`;
    
    // التصدير حسب الصيغة
    if (format === 'pdf') {
        exportToPDF(filteredData, fileName, totalIncome, totalExpenses, netProfit, dateFrom, dateTo);
    } else if (format === 'excel') {
        exportToExcel(filteredData, fileName);
    } else if (format === 'csv') {
        exportToCSV(filteredData, fileName);
    }
}

// تصدير إلى PDF
function exportToPDF(data, fileName, totalIncome, totalExpenses, netProfit, dateFrom, dateTo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // إعداد الخط العربي
    doc.setFont('Times', 'normal');
    
    // عنوان التقرير
    doc.setFontSize(18);
    doc.text('تقرير مالي - متجر أرتل', 105, 15, { align: 'center' });
    
    // فترة التقرير
    doc.setFontSize(12);
    let dateRange = 'كل الفترة';
    if (dateFrom && dateTo) {
        dateRange = `من ${Helper.formatDate(dateFrom)} إلى ${Helper.formatDate(dateTo)}`;
    } else if (dateFrom) {
        dateRange = `من ${Helper.formatDate(dateFrom)}`;
    } else if (dateTo) {
        dateRange = `إلى ${Helper.formatDate(dateTo)}`;
    }
    doc.text(`فترة التقرير: ${dateRange}`, 105, 25, { align: 'center' });
    
    // الإحصائيات
    doc.setFontSize(14);
    doc.text('الإحصائيات', 20, 40);
    doc.setFontSize(10);
    doc.text(`إجمالي الإيرادات: ${Helper.formatCurrency(totalIncome)}`, 20, 50);
    doc.text(`إجمالي المصروفات: ${Helper.formatCurrency(totalExpenses)}`, 20, 57);
    doc.text(`صافي الربح: ${Helper.formatCurrency(netProfit)}`, 20, 64);
    doc.text(`عدد الحركات: ${data.length}`, 20, 71);
    
    // جدول الحركات
    const tableData = data.map(t => [
        Helper.formatDate(t.date),
        getTypeText(t.type),
        getCategoryName(t.category),
        t.description,
        Helper.formatCurrency(t.amount),
        getPaymentMethodText(t.paymentMethod)
    ]);
    
    doc.autoTable({
        startY: 80,
        head: [['التاريخ', 'النوع', 'التصنيف', 'الوصف', 'المبلغ', 'طريقة الدفع']],
        body: tableData,
        styles: { font: 'Times', fontStyle: 'normal', fontSize: 8, halign: 'right' },
        headStyles: { fillColor: [10, 92, 54], textColor: 255 },
        margin: { right: 10, left: 10 }
    });
    
    // حفظ الملف
    doc.save(`${fileName}.pdf`);
}

// تصدير إلى Excel
function exportToExcel(data, fileName) {
    // تحضير البيانات
    const excelData = data.map(t => ({
        'التاريخ': Helper.formatDate(t.date),
        'النوع': getTypeText(t.type),
        'التصنيف': getCategoryName(t.category),
        'الوصف': t.description,
        'المبلغ (ر.ي)': t.amount,
        'طريقة الدفع': getPaymentMethodText(t.paymentMethod)
    }));
    
    // إنشاء ورقة العمل
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // إنشاء مصنف وإضافة الورقة
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الحركات المالية');
    
    // حفظ الملف
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

// تصدير إلى CSV
function exportToCSV(data, fileName) {
    // تحضير البيانات
    const headers = ['التاريخ', 'النوع', 'التصنيف', 'الوصف', 'المبلغ (ر.ي)', 'طريقة الدفع'];
    const csvData = data.map(t => [
        Helper.formatDate(t.date),
        getTypeText(t.type),
        getCategoryName(t.category),
        t.description,
        t.amount,
        getPaymentMethodText(t.paymentMethod)
    ]);
    
    // إنشاء محتوى CSV
    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
        csvContent += row.join(',') + '\n';
    });
    
    // إنشاء رابط تنزيل
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// إضافة تصنيف جديد
function addNewCategory() {
    const type = prompt('اختر نوع التصنيف:\n1 - إيرادات\n2 - مصروفات');
    if (!type) return;
    
    const categoryType = type === '1' ? 'income' : 'expense';
    const categoryName = prompt('أدخل اسم التصنيف الجديد:');
    if (!categoryName) return;
    
    const categoryColor = prompt('أدخل لون التصنيف (كود HEX):', categoryType === 'income' ? '#27ae60' : '#e74c3c');
    
    // إضافة التصنيف الجديد
    const newCategory = {
        name: categoryName,
        color: categoryColor || (categoryType === 'income' ? '#27ae60' : '#e74c3c')
    };
    
    CategoryManager.add(categoryType, newCategory);
    loadCategories();
    
    alert(`تم إضافة التصنيف "${categoryName}" بنجاح!`);
}

// تعديل تصنيف
function editCategory(type, categoryId) {
    const category = CategoryManager.find(categoryId);
    if (!category) return;
    
    const newName = prompt('أدخل الاسم الجديد للتصنيف:', category.name);
    if (!newName) return;
    
    const newColor = prompt('أدخل اللون الجديد للتصنيف (كود HEX):', category.color);
    
    const updatedCategory = {
        name: newName,
        color: newColor || category.color
    };
    
    CategoryManager.update(type, categoryId, updatedCategory);
    loadCategories();
    
    alert('تم تعديل التصنيف بنجاح!');
}

// حذف تصنيف
function deleteCategory(type, categoryId) {
    // التحقق إذا كان التصنيف مستخدم في أي حركات
    const transactions = TransactionManager.getAll();
    const isUsed = transactions.some(t => t.category === categoryId);
    
    if (isUsed) {
        alert('لا يمكن حذف هذا التصنيف لأنه مستخدم في حركات مالية!');
        return;
    }
    
    if (window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
        CategoryManager.delete(type, categoryId);
        loadCategories();
    }
}

// تعديل حركة مالية
function editTransaction(id) {
    const transaction = TransactionManager.find(id);
    if (transaction) {
        document.getElementById('transactionType').value = transaction.type;
        document.getElementById('transactionAmount').value = transaction.amount;
        document.getElementById('transactionDate').value = transaction.date;
        document.getElementById('transactionCategory').value = transaction.category;
        document.getElementById('transactionDescription').value = transaction.description;
        document.getElementById('transactionPaymentMethod').value = transaction.paymentMethod;
        
        // حذف الحركة القديمة
        deleteTransaction(id, false);
        
        alert('يمكنك الآن تعديل بيانات الحركة وحفظها مرة أخرى');
    }
}

// حذف حركة مالية
function deleteTransaction(id, confirm = true) {
    if (!confirm || window.confirm('هل أنت متأكد من حذف هذه الحركة المالية؟')) {
        TransactionManager.delete(id);
        loadTransactions();
        updateAccountingSummary();
        updateReports();
        initializeCharts();
    }
}

// وظائف مساعدة
function getTypeText(type) {
    return type === 'income' ? 'إيراد' : 'مصروف';
}

function getCategoryName(categoryId) {
    const category = CategoryManager.find(categoryId);
    return category ? category.name : categoryId;
}

function getPaymentMethodText(method) {
    const methods = {
        'cash': 'نقدي',
        'bank-transfer': 'تحويل بنكي',
        'card': 'بطاقة ائتمان'
    };
    
    return methods[method] || method;
        }
