# Wallet Information

## Кошелек для разработки

**Адрес кошелька:** `0xB468B3837e185B59594A100c1583a98C79b524F3`

**Приватный ключ:** `cbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c`

## Важные замечания

⚠️ **ВНИМАНИЕ:** Этот файл содержит приватный ключ! 
- НЕ коммитьте этот файл в git
- НЕ делитесь приватным ключом с другими
- Используйте только для разработки и тестирования

## Настройка переменных окружения

Добавьте приватный ключ в файл `packages/contracts/.env`:

```env
XSOLLA_ZK_SEPOLIA_RPC=https://sepolia.era.zksync.dev
XSOLLA_ZK_CHAIN_ID=300
ETH_SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=cbd0632c261aa3c4724616833151488df591ee1372c9982cac661ad773d8f42c
```

## Получение тестовых токенов

Для работы с zkSync Sepolia вам понадобятся тестовые ETH:
- [zkSync Faucet](https://portal.zksync.io/faucet)
- [Sepolia Faucet](https://sepoliafaucet.com/)

## Развертывание контрактов

После настройки переменных окружения можно развернуть контракты:

```bash
cd packages/contracts
pnpm deploy:xsolla
```

## Обновление адресов фронтенда

После развертывания обновите адреса контрактов в `packages/frontend/.env.local`:

```env
NEXT_PUBLIC_XSOLLA_ZK_RPC=https://sepolia.era.zksync.dev
NEXT_PUBLIC_CHAIN_ID=300
NEXT_PUBLIC_USAGE_RIGHTS_ADDRESS=<deployed_contract_address>
NEXT_PUBLIC_PARTY_BACKPACK_ADDRESS=<deployed_contract_address>
NEXT_PUBLIC_RECIPE_REGISTRY_ADDRESS=<deployed_contract_address>
NEXT_PUBLIC_RENTAL_ESCROW_ADDRESS=<deployed_contract_address>
```
