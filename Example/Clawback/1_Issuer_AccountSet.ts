import dotenv from "dotenv"
import path from "path"
import { Client, Wallet, Transaction } from "xrpl"

dotenv.config({ path: path.join(process.cwd(), ".env") })

export async function Issuer_AccountSet() {
  const client = new Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()

  const ADMIN_SEED = process.env.ADMIN_SEED
  if (!ADMIN_SEED) throw new Error("Missing env: ADMIN_SEED")

  const admin = Wallet.fromSeed(ADMIN_SEED.trim())

  // AccountSet으로 발행자 계정에 Clawback 플래그 설정
  // - Account: 발행자 주소
  // - SetFlag: 16 (asfAllowTrustlineClawback) → 발행자가 이후 Clawback 트랜잭션을 사용할 수 있게 함
  const tx: Transaction = {
    TransactionType: "AccountSet",
    Account: admin.address,
    SetFlag: 16,
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
  Issuer_AccountSet().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
