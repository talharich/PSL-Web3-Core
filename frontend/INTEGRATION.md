# Dynamic Fantasy Moments — Frontend Integration Guide

## Backend API Mapping

| Frontend Service       | NestJS Controller          | Base Path           |
|------------------------|---------------------------|---------------------|
| `auth.*`               | `auth_controller.ts`      | `/api/auth`         |
| `nft.*`                | `nft_controller.ts`       | `/api/nft`          |
| `marketplace.*`        | `marketplace_controller.ts`| `/api/marketplace` |
| `oracle.*`             | `oracle_controller.ts`    | `/api/oracle`       |
| `payment.*`            | `payment_controller.ts`   | `/api/payment`      |
| `metadata.*`           | `metadata_controller.ts`  | `/api/metadata`     |

## Dev Setup

```bash
npm install
cp .env.example .env
npm run dev   # Vite proxies /api → localhost:3001
```

## Key Integration Points

### Auth Flow
1. `POST /api/auth/signup` or `/api/auth/login` → get `{ token, user }`
2. `AuthContext` stores token in localStorage as `dfm_token`
3. All authenticated requests include `Authorization: Bearer <token>`

### Buying a Moment (Demo Flow)
1. `GET /api/payment/moments` — load purchasable moments
2. User selects a moment → `POST /api/payment/demo-confirm { eventId }` (auth required)
3. Backend mints NFT, returns `{ tokenId, tier, txHash, ... }`

### Oracle / Live Upgrades
- `useNFTList()` hook polls `GET /api/marketplace/listings` every 3s
- When an NFT's tier changes, the card animates the upgrade
- Admin can trigger upgrades via `POST /api/oracle/trigger/:eventId`

### Known Backend Route Note
- `GET /marketplace/yield/accumulated` is defined after `GET /marketplace/yield/:tokenId`
  in the controller. NestJS (Express) resolves static routes before parameterised ones,
  so this should work. If you hit a 400, check NestJS version / route registration order.
