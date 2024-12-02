import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { HomePageComponent } from "@/components/home-page"
import { InvestmentPageComponent } from "@/components/investment-page"
import { SavingsPageComponent } from "@/components/savings-page"
import { ReceiveMoneyPageComponent } from "@/components/receive-money-page"
import { SendMoneyPageComponent } from "@/components/send-money-page" // Ensure this component exists
import { SettingsPageComponent } from "@/components/settings-page"
import { FinancePageComponent } from "@/components/finance-page"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePageComponent />} />
        <Route path="/investment" element={<InvestmentPageComponent />} />
        <Route path="/savings" element={<SavingsPageComponent />} />
        <Route path="/receive" element={<ReceiveMoneyPageComponent />} />
        <Route path="/send" element={<SendMoneyPageComponent />} />
        <Route path="/settings" element={<SettingsPageComponent />} />
        <Route path="/finance" element={<FinancePageComponent />} />
      </Routes>
    </Router>
  )
} 