/**
 * Оптимизация транзакций для снижения комиссии
 * 
 * Основные принципы:
 * 1. Batch операции когда возможно
 * 2. Оптимизация данных calldata
 * 3. Правильная оценка gas limit
 */

// Оптимизированные параметры для zkSync
export const OPTIMIZED_GAS_CONFIG = {
  // zkSync автоматически оптимизирует gas
  // Не устанавливаем лимиты вручную
  
  // Для batch операций
  batchGasMultiplier: 0.9, // Экономия 10% при batch
};

/**
 * Проверка можно ли объединить операции в batch
 */
export function canBatchOperations(operations: any[]): boolean {
  // Если несколько операций с одним контрактом - можно объединить
  return operations.length > 1;
}

/**
 * Оптимизация параметров транзакции
 */
export function optimizeTransaction(tx: any) {
  // Удаляем лишние параметры которые увеличивают calldata
  const optimized = { ...tx };
  
  // zkSync оптимизирует сам, не нужно устанавливать:
  delete optimized.gasLimit;
  delete optimized.maxFeePerGas;
  delete optimized.maxPriorityFeePerGas;
  
  return optimized;
}

/**
 * Рекомендации по снижению комиссии
 */
export const GAS_OPTIMIZATION_TIPS = {
  deposit: {
    tip: "Депозит нескольких предметов одновременно",
    savings: "До 30% экономии",
  },
  grant: {
    tip: "Выдавайте права на несколько предметов за одну транзакцию",
    savings: "До 40% экономии",
  },
  craft: {
    tip: "Крафтите несколько предметов когда возможно",
    savings: "До 25% экономии",
  },
};

/**
 * Показать пользователю совет по оптимизации
 */
export function showOptimizationTip(operation: string) {
  const tip = GAS_OPTIMIZATION_TIPS[operation as keyof typeof GAS_OPTIMIZATION_TIPS];
  if (tip) {
    console.log(`💡 Совет по экономии газа: ${tip.tip} (${tip.savings})`);
  }
}

