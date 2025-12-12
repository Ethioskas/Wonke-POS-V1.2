export type Language = 'en' | 'am';

export const translations = {
  en: {
    appName: "Wonke POS",
    login: "Login",
    username: "Username",
    password: "Password",
    dashboard: "Dashboard",
    pos: "POS",
    inventory: "Inventory",
    grv: "GRV (Receive Stock)",
    reports: "Reports",
    profile: "Profile",
    dayend: "Day End",
    logout: "Logout",
    language: "Language",
    licenseStatus: "License Status",
    active: "Active",
    expired: "Expired",
    contactSupport: "Contact Support",
    daysRemaining: "Days Remaining",
    
    // POS
    searchProduct: "Search product...",
    total: "Total",
    checkout: "Checkout",
    pay: "Pay",
    cash: "Cash",
    card: "Card",
    change: "Change",
    receipt: "Receipt",
    addToCart: "Add",
    
    // Inventory
    addProduct: "Add Product",
    editProduct: "Edit Product",
    productName: "Product Name",
    category: "Category",
    price: "Price",
    cost: "Cost",
    stock: "Stock",
    barcode: "Barcode",
    uom: "Unit of Measure",
    baseUnit: "Base Unit",
    save: "Save",
    cancel: "Cancel",
    
    // GRV
    supplier: "Supplier",
    invoiceNo: "Invoice No",
    receiveStock: "Receive Stock",
    quantity: "Quantity",
    newCost: "New Cost",
    submitGRV: "Submit GRV",
    
    // Roles
    role_owner: "Owner",
    role_supervisor: "Supervisor",
    role_cashier: "Cashier",

    // Day End
    cashOut: "Cash Out",
    reconcile: "Reconcile",
    salesSummary: "Sales Summary",
    totalSales: "Total Sales",
    openSales: "Open Sales",

    // Alerts
    licenseExpiredMsg: "Your license has expired. Please contact support to renew.",
    lowStock: "Low Stock",
    offlineMode: "Offline Mode",

    // Admin
    admin: "Admin Panel",
    userManagement: "User Management",
    licenseManagement: "License Management",
    addNewUser: "Add New User",
    editUser: "Edit User",
    deleteUser: "Delete User",
    fullName: "Full Name",
    role: "Role",
    confirmDelete: "Are you sure you want to delete this user?",
    expiryDate: "Expiry Date",
    updateLicense: "Update License",
    status: "Status"
  },
  am: {
    appName: "Wonke POS",
    login: "ግባ",
    username: "የተጠቃሚ ስም",
    password: "የይለፍ ቃል",
    dashboard: "ዳሽቦርድ",
    pos: "ሽያጭ (POS)",
    inventory: "ንብረት አስተዳደር",
    grv: "ዕቃ መቀበያ (GRV)",
    reports: "ሪፖርቶች",
    profile: "መገለጫ",
    dayend: "የቀን መጨረሻ",
    logout: "ውጣ",
    language: "ቋንቋ",
    licenseStatus: "የፍቃድ ሁኔታ",
    active: "በመስራት ላይ",
    expired: "ጊዜው አልፎበታል",
    contactSupport: "ድጋፍ ያግኙ",
    daysRemaining: "ቀሪ ቀናት",
    
    // POS
    searchProduct: "ምርት ይፈልጉ...",
    total: "ጠቅላላ",
    checkout: "ጨርስ",
    pay: "ክፈል",
    cash: "ጥሬ ገንዘብ",
    card: "ካርድ",
    change: "መልስ",
    receipt: "ደረሰኝ",
    addToCart: "ጨምር",
    
    // Inventory
    addProduct: "ምርት ጨምር",
    editProduct: "ምርት አስተካክል",
    productName: "የምርት ስም",
    category: "ዘርፍ",
    price: "መሸጫ ዋጋ",
    cost: "መግዣ ዋጋ",
    stock: "ክምችት",
    barcode: "ባርኮድ",
    uom: "መለኪያ",
    baseUnit: "መነሻ መለኪያ",
    save: "አስቀምጥ",
    cancel: "ሰርዝ",
    
    // GRV
    supplier: "አቅራቢ",
    invoiceNo: "የደረሰኝ ቁጥር",
    receiveStock: "ዕቃ ተቀበል",
    quantity: "ብዛት",
    newCost: "አዲስ ዋጋ",
    submitGRV: "GRV ጨርስ",
    
    // Roles
    role_owner: "ባለቤት",
    role_supervisor: "ተቆጣጣሪ",
    role_cashier: "ካሸር",

    // Day End
    cashOut: "ሂሳብ ዝጋ",
    reconcile: "አመሳክር",
    salesSummary: "የሽያጭ ማጠቃለያ",
    totalSales: "ጠቅላላ ሽያጭ",
    openSales: "ያልተዘጋ ሽያጭ",

    // Alerts
    licenseExpiredMsg: "የፍቃድ ጊዜዎ አብቅቷል። እባክዎ ድጋፍ ያግኙ።",
    lowStock: "ዝቅተኛ ክምችት",
    offlineMode: "ከመስመር ውጭ",

    // Admin
    admin: "አስተዳዳሪ ፓነል",
    userManagement: "ተጠቃሚ አስተዳደር",
    licenseManagement: "ፍቃድ አስተዳደር",
    addNewUser: "አዲስ ተጠቃሚ ጨምር",
    editUser: "ተጠቃሚ አስተካክል",
    deleteUser: "ተጠቃሚ ሰርዝ",
    fullName: "ሙሉ ስም",
    role: "ሚና",
    confirmDelete: "እርግጠኛ ነዎት ይህን ተጠቃሚ መሰረዝ ይፈልጋሉ?",
    expiryDate: "የማብቂያ ቀን",
    updateLicense: "ፍቃድ አዘምን",
    status: "ሁኔታ"
  }
};
