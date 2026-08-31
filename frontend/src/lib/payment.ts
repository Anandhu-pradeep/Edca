import { axiosInstance } from './axios';

export interface PaymentOrderRequest {
    credits: number;
}

export interface PaymentOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    credits: number;
}

export interface PaymentVerificationRequest {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export interface PaymentDto {
    id: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    credits: number;
    status: 'CREATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    createdAt: string;
}

export const createPaymentOrder = async (request: PaymentOrderRequest): Promise<PaymentOrderResponse> => {
    const response = await axiosInstance.post('/payment/create-order', request);
    return response.data.data;
};

export const verifyPayment = async (request: PaymentVerificationRequest): Promise<void> => {
    await axiosInstance.post('/payment/verify', request);
};

export const getPaymentHistory = async (): Promise<PaymentDto[]> => {
    const response = await axiosInstance.get('/payment/history');
    return response.data.data;
};
