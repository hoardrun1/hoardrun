import { Router } from 'express'
import { auth } from '../middleware/auth'
import * as userController from '../controllers/userController'
import * as transactionController from '../controllers/transactionController'
import * as investmentController from '../controllers/investmentController'
import * as cardController from '../controllers/cardController'
import * as homeController from '../controllers/homeController'
import * as savingsController from '../controllers/savingsController'
import * as transferController from '../controllers/transferController'
import * as financeController from '../controllers/financeController'
import * as settingsController from '../controllers/settingsController'

const router = Router()

// Auth routes
router.post('/auth/signup', userController.signup)
router.post('/auth/signin', userController.signin)
router.post('/auth/verify-email', userController.verifyEmail)
router.post('/auth/verify-signin', userController.verifySignin)
router.post('/auth/verify-face', userController.verifyFace)
router.post('/auth/forgot-password', userController.forgotPassword)
router.post('/auth/reset-password', userController.resetPassword)

// User routes (protected)
router.get('/user/profile', auth, userController.getProfile)
router.put('/user/profile', auth, userController.updateProfile)
router.get('/user/balance', auth, userController.getBalance)
router.post('/user/deposit', auth, userController.deposit)

// Transaction routes (protected)
router.get('/transactions', auth, transactionController.getTransactions)
router.post('/transactions/send', auth, transactionController.sendMoney)
router.post('/transactions/receive', auth, transactionController.receiveMoney)
router.get('/transactions/stats', auth, transactionController.getStats)

// Investment routes (protected)
router.get('/investments', auth, investmentController.getInvestments)
router.post('/investments', auth, investmentController.createInvestment)
router.get('/investments/stats', auth, investmentController.getStats)
router.get('/investments/recommendations', auth, investmentController.getRecommendations)

// Card routes (protected)
router.get('/cards', auth, cardController.getCards)
router.post('/cards', auth, cardController.createCard)
router.get('/cards/:id', auth, cardController.getCardDetails)
router.put('/cards/:id', auth, cardController.updateCard)
router.delete('/cards/:id', auth, cardController.deleteCard)
router.post('/cards/:id/pin', auth, cardController.setCardPin)
router.post('/cards/:id/lock', auth, cardController.lockCard)
router.post('/cards/:id/unlock', auth, cardController.unlockCard)

// Home routes (protected)
router.get('/dashboard', auth, homeController.getDashboardData)

// Savings routes (protected)
router.get('/savings/goals', auth, savingsController.getSavingsGoals)
router.post('/savings/goals', auth, savingsController.createSavingsGoal)
router.get('/savings/goals/:id', auth, savingsController.getSavingsGoal)
router.put('/savings/goals/:id', auth, savingsController.updateSavingsGoal)
router.delete('/savings/goals/:id', auth, savingsController.deleteSavingsGoal)
router.get('/savings/stats', auth, savingsController.getSavingsStats)
router.post('/savings/auto-save', auth, savingsController.processAutoSave)
router.get('/savings/recommendations', auth, savingsController.getGoalRecommendations)
router.post('/savings/goals/:id/interest', auth, savingsController.calculateGoalInterest)
router.get('/savings/analysis', auth, savingsController.analyzeSavings)
router.post('/savings/apply-interest', auth, savingsController.applyInterestToAllGoals)

// Transfer routes (protected)
router.post('/transfer/send', auth, transferController.sendMoney)
router.post('/transfer/receive', auth, transferController.receiveMoney)
router.post('/transfer/request', auth, transferController.requestMoney)
router.get('/transfer/beneficiaries', auth, transferController.getBeneficiaries)
router.get('/transfer/history/:beneficiaryId', auth, transferController.getTransferHistory)

// Finance routes (protected)
router.get('/finance/overview', auth, financeController.getFinancialOverview)
router.get('/finance/categories', auth, financeController.getCategoryAnalytics)
router.post('/finance/categories', auth, financeController.manageCategories)
router.get('/finance/budget', auth, financeController.getBudgetAnalytics)

// Settings routes (protected)
router.get('/settings', auth, settingsController.getSettings)
router.put('/settings/profile', auth, settingsController.updateProfile)
router.put('/settings/security', auth, settingsController.updateSecurity)
router.put('/settings/preferences', auth, settingsController.updatePreferences)
router.get('/settings/security/log', auth, settingsController.getSecurityLog)

export default router 