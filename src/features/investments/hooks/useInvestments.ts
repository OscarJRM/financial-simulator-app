import { useInvestmentContext } from "../context/InvestmentProvider";

export const useInvestments = () => {
    return useInvestmentContext();
};