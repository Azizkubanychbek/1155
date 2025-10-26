/**
 * Gas configuration helper for zkSync transactions
 * 
 * zkSync uses a different gas model than Ethereum mainnet.
 * This helper provides utilities to handle gas estimation properly.
 */

export const zkSyncGasConfig = {
  // Let zkSync auto-calculate gas limits
  // Don't set maxFeePerGas or maxPriorityFeePerGas for zkSync
  // The network will handle fee estimation
  
  // Helper to prepare transaction config
  prepareTransaction: (baseConfig: any) => {
    // Remove any gas limit constraints for zkSync
    const {  maxFeePerGas, maxPriorityFeePerGas, gasLimit, ...cleanConfig } = baseConfig;
    
    return {
      ...cleanConfig,
      // zkSync will auto-estimate gas
      // No need to set gas parameters manually
    };
  },
  
  // Helper for retry logic with increased gas
  prepareRetryTransaction: (baseConfig: any, multiplier: number = 1.5) => {
    const { gas, ...config } = baseConfig;
    return {
      ...config,
      // Let zkSync handle gas estimation even on retries
    };
  },
};

// Export default gas settings for zkSync
export const DEFAULT_ZKSYNC_GAS = {
  // These will be auto-calculated by zkSync
  // Don't set them manually to avoid "max fee" errors
};

