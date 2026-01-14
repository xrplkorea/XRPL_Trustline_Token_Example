import dotenv from "dotenv"
import path from "path"
import { Client, Wallet } from "xrpl"

dotenv.config({ path: path.join(process.cwd(), ".env") })

export async function Clawback() {
  const client = new Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()

  const ADMIN_SEED = process.env.ADMIN_SEED
  const USER_SEED = process.env.USER_SEED
  if (!ADMIN_SEED || !USER_SEED) throw new Error("Missing env: ADMIN_SEED, USER_SEED")

  const admin = Wallet.fromSeed(ADMIN_SEED.trim()) // 발행자 (Clawback 플래그 설정된 계정)
  const user = Wallet.fromSeed(USER_SEED.trim())   // 회수 대상 보유자

  // Clawback 트랜잭션: 발행자가 특정 보유자의 IOU를 강제 회수(감액)
  // 전제: 발행자 계정은 asfClawback(16) 플래그가 설정되어 있어야 함.
  // - Account: 발행자 주소
  // - Amount: 회수할 IOU {currency, issuer(회수 대상 계정 = user), value}
  const tx = {
    TransactionType: "Clawback",
    Account: admin.address,
    Amount: {
      currency: "ABC",
      issuer: user.address,
      value: "500",
    },
  } as any

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
  Clawback().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
