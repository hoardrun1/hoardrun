export class NavigationFlow {
  private static instance: NavigationFlow;
  private flowStates: Map<string, boolean> = new Map();
  private userData: Map<string, any> = new Map();
  private validFlows: Set<string> = new Set([
    // Authentication & Onboarding Flow
    'landing->signup',
    'landing->signin',
    'signup->check-email',
    'check-email->verify-email',
    'signup->verify-email',
    'verify-email->create-profile',
    'create-profile->kyc-verification',
    'kyc-verification->identity-check',
    'identity-check->document-upload',
    'document-upload->face-verification',
    'face-verification->home',

    // Main Navigation Flow
    'home->dashboard',
    'dashboard->home',
    'home->cards',
    'cards->home',
    'home->investments',
    'investments->home',
    'home->savings',
    'savings->home',

    // Money Movement Flow
    'home->send-money',
    'send-money->beneficiary-selection',
    'beneficiary-selection->amount-entry',
    'amount-entry->transfer-confirmation',
    'transfer-confirmation->transfer-success',
    'transfer-success->home',

    // Investment Flow
    'investments->market-analysis',
    'market-analysis->stock-details',
    'stock-details->buy-sell-confirmation',
    'buy-sell-confirmation->portfolio',

    // Card Management Flow
    'cards->card-activation',
    'card-activation->set-pin',
    'set-pin->card-settings',
    'cards->freeze-card',
    'cards->card-limits',
    'cards->virtual-card',

    // Settings & Profile Flow
    'home->settings',
    'settings->profile',
    'settings->security',
    'settings->preferences',
    'settings->notifications',
    'security->change-password',
    'security->two-factor',
    'security->biometric',

    // Support Flow
    'home->support',
    'support->chat',
    'support->ticket-creation',
    'support->faq',

    // Financial Planning Flow
    'home->financial-goals',
    'financial-goals->goal-creation',
    'financial-goals->goal-tracking',
    'home->budgeting',
    'budgeting->expense-tracking',
    'budgeting->category-management',

    // Notification & Alerts Flow
    'any->notifications',
    'notifications->transaction-details',
    'notifications->security-alerts',

    // Account Management Flow
    'home->accounts',
    'accounts->account-details',
    'accounts->statements',
    'accounts->linked-accounts',

    // Emergency Flow
    'any->block-card',
    'any->fraud-report',
    'any->emergency-support'
  ]);

  private constructor() {
    // Initialize emergency routes
    this.flowStates.set('any->block-card', true);
    this.flowStates.set('any->fraud-report', true);
    this.flowStates.set('any->emergency-support', true);
    this.flowStates.set('any->notifications', true);
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new NavigationFlow();
    }
    return this.instance;
  }

  connect(from: string, to: string, data?: any) {
    const flowKey = `${from}->${to}`;

    // Allow emergency routes from any screen
    if (from === 'any' && this.flowStates.get(flowKey)) {
      return true;
    }

    // Validate the flow is allowed
    if (!this.validFlows.has(flowKey)) {
      console.error(`Invalid navigation flow: ${flowKey}`);
      return false;
    }

    this.flowStates.set(flowKey, true);
    if (data) {
      this.userData.set(to, data);
    }
    return true;
  }

  isValidTransition(from: string, to: string): boolean {
    const flowKey = `${from}->${to}`;

    // Allow emergency routes from any screen
    if (from === 'any' && this.flowStates.get(`any->${to}`)) {
      return true;
    }

    return this.flowStates.get(flowKey) === true;
  }

  getData(page: string): any {
    return this.userData.get(page);
  }

  clearFlow() {
    this.flowStates.clear();
    this.userData.clear();

    // Reinitialize emergency routes
    this.flowStates.set('any->block-card', true);
    this.flowStates.set('any->fraud-report', true);
    this.flowStates.set('any->emergency-support', true);
    this.flowStates.set('any->notifications', true);
  }

  getAvailableDestinations(currentPage: string): string[] {
    return Array.from(this.validFlows)
      .filter(flow => flow.startsWith(`${currentPage}->`))
      .map(flow => flow.split('->')[1]);
  }

  getPreviousPages(currentPage: string): string[] {
    return Array.from(this.validFlows)
      .filter(flow => flow.endsWith(`->${currentPage}`))
      .map(flow => flow.split('->')[0]);
  }
}

export const navigation = NavigationFlow.getInstance();