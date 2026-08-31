import { axiosInstance } from './axios';

export interface CreditBalanceResponse {
    balance: number;
    totalPurchased: number;
    totalConsumed: number;
}

export interface CreditTransaction {
    id: string;
    type: 'PURCHASE' | 'INTERVIEW_USAGE' | 'REFUND' | 'ADJUSTMENT';
    credits: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
}

export const getCreditBalance = async (): Promise<CreditBalanceResponse> => {
    const response = await axiosInstance.get('/credits/balance');
    return response.data.data;
};

export const getCreditTransactions = async (): Promise<CreditTransaction[]> => {
    const response = await axiosInstance.get('/credits/transactions');
    return response.data.data;
};

export const consumeInterviewCredits = async (interviewId: string): Promise<CreditBalanceResponse> => {
    const response = await axiosInstance.post('/credits/consume-interview', { interviewId });
    return response.data.data;
};
