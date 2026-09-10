export declare class CustomerService {
    /**
     * Tính toán lại tổng chi tiêu và phân hạng khách hàng dựa trên lịch sử đơn hàng hoàn thành
     */
    static syncCustomerStatsByPhone(phone: string, customerName?: string, address?: string): Promise<void>;
}
