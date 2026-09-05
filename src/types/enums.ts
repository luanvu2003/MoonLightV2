export enum Role {
  Admin = 'Admin',
  Owner = 'Owner',
  Staff = 'Staff'
}

export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Shipping = 'shipping',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export enum PaymentMethod {
  COD = 'cod',
  Banking = 'banking'
}

export enum CustomerTier {
  VIP = 'VIP',
  Loyal = 'Thân thiết',
  New = 'Khách mới'
}

export enum ShiftType {
  Morning = 'morning',
  Afternoon = 'afternoon',
  Evening = 'evening'
}

export enum ShiftStatus {
  Scheduled = 'scheduled',
  Active = 'active',
  Completed = 'completed',
  Off = 'off'
}

export enum GenderCategory {
  Nam = 'Nam',
  Nu = 'Nữ',
  Unisex = 'Unisex'
}
