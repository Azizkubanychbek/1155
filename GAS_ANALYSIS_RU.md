# 🔥 Анализ расхода газа в Backpack Guilds

## Почему при минте почти не тратится газ, а при крафтинге и депозите очень дорого?

### 📊 Сравнение операций

| Операция | Примерный газ | Почему |
|----------|---------------|--------|
| **Mint** (создание предметов) | ~40-60k газ | Простая операция - только запись в storage |
| **Deposit** (депозит в PartyBackpack) | ~90-120k газ | Transfer ERC1155 + дополнительные записи |
| **Craft** (крафтинг предметов) | ~150-250k газ | Множественные transfers + проверки + mint |

---

## 🔍 Детальный анализ

### 1. **MINT - Самая дешевая операция**

```solidity
// UsageRights1155.mint()
function mint(address to, uint256 id, uint256 amount) external {
    _mint(to, id, amount, "");  // Просто запись в mapping
}
```

**Что происходит:**
- ✅ Одна запись в `mapping(uint256 => mapping(address => uint256)) balances`
- ✅ Emit одного события `TransferSingle`
- ✅ Базовая стоимость транзакции (21k газ)

**Почему дешево:**
- Нет внешних вызовов контрактов
- Нет сложной логики
- Только одна запись в storage

**Расход газа:**
```
21,000 (base transaction)
+ 20,000 (storage write для нового значения)
+ 3,000 (emit event)
≈ 44,000 газ
```

---

### 2. **DEPOSIT - Средняя стоимость**

```solidity
// PartyBackpack.deposit()
function deposit(uint256 id, uint256 amount) external {
    // 1. Вызов safeTransferFrom (дорого!)
    usageRights.safeTransferFrom(msg.sender, address(this), id, amount, "");
    
    // 2. Обновление party balance
    partyBalance[id] += amount;
    
    // 3. Emit события
    emit PartyDeposit(msg.sender, id, amount);
}
```

**Что происходит:**
1. ⚠️ **ERC1155 safeTransferFrom** - самая дорогая часть!
   - Проверка баланса отправителя
   - Уменьшение баланса отправителя
   - Увеличение баланса получателя (контракта)
   - Вызов `onERC1155Received` callback
   - Emit события `TransferSingle`

2. ✅ Запись в `partyBalance` mapping
3. ✅ Emit события `PartyDeposit`

**Расход газа:**
```
21,000 (base transaction)
+ 43,000 (safeTransferFrom - 2 storage writes + проверки + callback)
+ 20,000 (storage write для partyBalance)
+ 3,000 (emit event)
≈ 87,000 газ
```

**Почему дороже минта:**
- `safeTransferFrom` делает ДВЕ записи в storage (sender и receiver)
- Вызывает callback функцию `onERC1155Received`
- Дополнительные проверки безопасности

---

### 3. **CRAFT - Самая дорогая операция**

```solidity
// RecipeRegistry.craft()
function craft(uint256 recipeId, address receiver) external {
    // 1. Загрузка рецепта из storage
    Recipe memory recipe = recipes[recipeId];
    
    // 2. ЦИКЛ по всем ингредиентам (может быть много!)
    for (uint256 i = 0; i < recipe.inputs.length; i++) {
        Ingredient memory ingredient = recipe.inputs[i];
        
        // 3. Transfer КАЖДОГО ингредиента (ОЧЕНЬ ДОРОГО!)
        IERC1155(ingredient.token).safeTransferFrom(
            msg.sender,
            address(this),
            ingredient.id,
            ingredient.amount,
            ""
        );
    }
    
    // 4. Mint выходного предмета
    IERC1155(recipe.outputToken).mint(receiver, recipe.outputId, recipe.outputAmount);
    
    // 5. Emit события
    emit Crafted(msg.sender, recipeId, recipe.outputToken, recipe.outputId, recipe.outputAmount);
}
```

**Что происходит:**
1. ⚠️ Чтение рецепта из storage (включая динамический массив)
2. ⚠️ **ЦИКЛ по ингредиентам** - каждая итерация дорогая!
3. ⚠️ **N x safeTransferFrom** - для каждого ингредиента (burn входных токенов)
4. ⚠️ **Mint выходного токена**
5. ✅ Emit события

**Пример: Рецепт "Blessed Shield" (3 Herb + 1 Shield → 1 Blessed Shield)**

**Расход газа:**
```
21,000 (base transaction)
+ 10,000 (чтение recipe struct из storage)
+ 5,000 (загрузка массива inputs)

// Цикл по 2 ингредиентам:
+ 43,000 (safeTransferFrom для Herb)
+ 43,000 (safeTransferFrom для Shield)

+ 40,000 (mint Blessed Shield)
+ 3,000 (emit Crafted event)

≈ 165,000 газ
```

**Если рецепт имеет 3 ингредиента:**
```
165,000 + 43,000 = 208,000 газ
```

**Почему ТАК дорого:**
- 🔥 **Множественные safeTransferFrom** - каждый стоит ~43k газ
- 🔥 **Цикл по массиву** - газ растет с количеством ингредиентов
- 🔥 **Чтение сложных структур** из storage (Recipe с массивами)
- 🔥 **Дополнительный mint** в конце

---

## 💡 Как работает zkSync и почему комиссии все равно высокие

### zkSync оптимизирует, но НЕ все:

✅ **Что zkSync оптимизирует:**
- Batch обработку транзакций
- Сжатие данных calldata
- Доказательства (proofs) вне цепи

❌ **Что zkSync НЕ может оптимизировать:**
- Количество операций в контракте
- Сложность логики (циклы, проверки)
- Количество storage reads/writes
- Количество внешних вызовов контрактов

### 🎯 Ваш случай:

**Минт:**
- 1 операция = дешево ✅

**Депозит:**
- 1 transfer + 1 storage write = средне ⚠️

**Крафтинг:**
- N transfers + циклы + проверки = дорого 🔥

---

## 🛠️ Как можно оптимизировать (требует изменения контрактов)

### Вариант 1: Batch операции

Вместо:
```solidity
deposit(tokenId1, amount1);  // 87k газ
deposit(tokenId2, amount2);  // 87k газ
deposit(tokenId3, amount3);  // 87k газ
// Всего: 261k газ
```

Сделать:
```solidity
depositBatch([tokenId1, tokenId2, tokenId3], [amount1, amount2, amount3]);
// Всего: ~120k газ (экономия ~50%)
```

### Вариант 2: Упрощение крафтинга

Вместо `safeTransferFrom` использовать прямое изменение балансов (если контракт - owner):
```solidity
// Вместо:
usageRights.safeTransferFrom(user, address(this), id, amount, "");  // 43k газ

// Можно (если есть разрешения):
usageRights.burnFrom(user, id, amount);  // 25k газ
```

### Вариант 3: Оптимизация структур данных

- Использовать `uint64` вместо `uint256` где возможно
- Упаковать несколько переменных в один slot
- Кешировать часто используемые значения

---

## 📝 Выводы

### Почему такая разница:

1. **Минт** - простейшая операция, только запись баланса
2. **Депозит** - включает transfer (2 записи storage + callback)
3. **Крафтинг** - множественные transfers + сложная логика + циклы

### Это нормально для:
- ✅ ERC1155 стандарта
- ✅ Сложных игровых механик
- ✅ zkSync (оптимизирует batch, но не отдельные операции)

### Реальные цифры в ETH (при цене газа 0.1 gwei):

| Операция | Газ | Стоимость в ETH | Стоимость в USD (@$2000) |
|----------|-----|-----------------|-------------------------|
| Mint | ~50k | 0.000005 ETH | $0.01 |
| Deposit | ~90k | 0.000009 ETH | $0.018 |
| Craft (2 ингредиента) | ~165k | 0.0000165 ETH | $0.033 |
| Craft (3 ингредиента) | ~208k | 0.0000208 ETH | $0.042 |

**На zkSync Sepolia testnet** - это еще дешевле, так как L2 обычно в 10-100 раз дешевле mainnet.

---

## 🚀 Рекомендации

Для снижения комиссий:

1. **Batch операции** - депозить/крафтить несколько предметов одной транзакцией
2. **Минимизировать количество ингредиентов** в рецептах
3. **Кешировать результаты** - если крафтите часто один и тот же предмет
4. **Использовать events вместо storage** где возможно

Без изменения контрактов:
- ✅ Группируйте операции
- ✅ Крафтите в пакетах
- ✅ Используйте gasPrice в низкое время

С изменением контрактов:
- 🛠️ Добавить `depositBatch` и `craftBatch` функции
- 🛠️ Использовать `burn` вместо `safeTransferFrom` где возможно
- 🛠️ Оптимизировать структуры данных (slot packing)

