export var Role;
(function (Role) {
    Role["Admin"] = "Admin";
    Role["Owner"] = "Owner";
    Role["Staff"] = "Staff";
    Role["Customer"] = "Customer";
})(Role || (Role = {}));
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["Pending"] = "pending";
    OrderStatus["Confirmed"] = "confirmed";
    OrderStatus["Shipping"] = "shipping";
    OrderStatus["Completed"] = "completed";
    OrderStatus["Cancelled"] = "cancelled";
})(OrderStatus || (OrderStatus = {}));
export var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["COD"] = "cod";
    PaymentMethod["Banking"] = "banking";
})(PaymentMethod || (PaymentMethod = {}));
export var CustomerTier;
(function (CustomerTier) {
    CustomerTier["VIP"] = "VIP";
    CustomerTier["Loyal"] = "Th\u00E2n thi\u1EBFt";
    CustomerTier["New"] = "Kh\u00E1ch m\u1EDBi";
})(CustomerTier || (CustomerTier = {}));
export var ShiftType;
(function (ShiftType) {
    ShiftType["Morning"] = "morning";
    ShiftType["Afternoon"] = "afternoon";
    ShiftType["Evening"] = "evening";
})(ShiftType || (ShiftType = {}));
export var ShiftStatus;
(function (ShiftStatus) {
    ShiftStatus["Scheduled"] = "scheduled";
    ShiftStatus["Active"] = "active";
    ShiftStatus["Completed"] = "completed";
    ShiftStatus["Off"] = "off";
})(ShiftStatus || (ShiftStatus = {}));
export var GenderCategory;
(function (GenderCategory) {
    GenderCategory["Nam"] = "Nam";
    GenderCategory["Nu"] = "N\u1EEF";
    GenderCategory["Unisex"] = "Unisex";
})(GenderCategory || (GenderCategory = {}));
//# sourceMappingURL=enums.js.map