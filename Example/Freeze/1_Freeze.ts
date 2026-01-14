import dotenv from "dotenv"
import path from "path"
import { Client, Wallet, Transaction } from "xrpl"

dotenv.config({ path: path.join(process.cwd(), ".env") })

export async function FreezeTrustLine() {
  const client = new Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()

  const ADMIN_SEED = process.env.ADMIN_SEED
  const USER_SEED = process.env.USER_SEED
  if (!ADMIN_SEED || !USER_SEED) throw new Error("Missing env: ADMIN_SEED, USER_SEED")

  const admin = Wallet.fromSeed(ADMIN_SEED.trim()) // 발행자
  const user = Wallet.fromSeed(USER_SEED.trim())   // 동결 대상 보유자

  const freeze = true // true: 동결(tfSetFreeze), false: 해제(tfClearFreeze)
  const flag = freeze ? 0x00100000 : 0x00200000

  // TrustSet으로 특정 보유자와의 트러스트라인을 동결/해제
  // - Account: 발행자 주소
  // - LimitAmount: 통화/상대방 주소/한도 (한도는 0으로 두고 상대방 지정)
  // - Flags: tfSetFreeze(0x00100000) 또는 tfClearFreeze(0x00200000)
  const tx: Transaction = {
    TransactionType: "TrustSet",
    Account: admin.address,
    LimitAmount: {
      currency: "ABC",
      issuer: user.address,
      value: "0",
    },
    Flags: flag,
  }

  try {
    const prepared = await client.autofill(tx)
    const signed = admin.sign(prepared)
    const result = await client.submitAndWait(signed.tx_blob)

    console.log(JSON.stringify(result, null, 2))
    return result
  } finally {
    await client.disconnect()
  }
}

if (require.main === module) {
  FreezeTrustLine().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
