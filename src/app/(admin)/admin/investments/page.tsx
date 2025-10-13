import { InvestmentProductsAdminView, InvestmentProductsProvider } from "@/features/investment-products";

export default function AdminInvestmentsPage() {
  return (
          <InvestmentProductsProvider>
              <InvestmentProductsAdminView />
          </InvestmentProductsProvider>
      );
}