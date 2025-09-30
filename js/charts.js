// مكتبة المخططات البيانية
// هذا الملف يمكن استخدامه لإضافة وظائف إضافية للمخططات إذا لزم الأمر

const ChartManager = {
    // تهيئة جميع المخططات في الصفحة
    initializeAllCharts: function() {
        // يمكن إضافة منطق لتهيئة المخططات هنا
        console.log('Charts initialized');
    },
    
    // تحديث مخطط معين
    updateChart: function(chartId, newData) {
        // يمكن إضافة منطق لتحديث المخططات هنا
        console.log(`Updating chart: ${chartId}`);
    },
    
    // تصدير مخطط كصورة
    exportChart: function(chartId, fileName) {
        const chartCanvas = document.getElementById(chartId);
        if (chartCanvas) {
            const link = document.createElement('a');
            link.download = `${fileName}.png`;
            link.href = chartCanvas.toDataURL();
            link.click();
        }
    }
};
