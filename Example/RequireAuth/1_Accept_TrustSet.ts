import dotenv from "dotenv"
import path from "path"
import { Client, Transaction, Wallet } from "xrpl"

dotenv.config({ path: path.join(process.cwd(), ".env") })

async function allowTrust() {
  const client = new Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()

  const ADMIN_SEED = process.env.ADMIN_SEED
  const USER_SEED = process.env.USER_SEED
  if (!ADMIN_SEED || !USER_SEED) throw new Error("Missing env: ADMIN_SEED, USER_SEED")

  const admin = Wallet.fromSeed(ADMIN_SEED.trim())
  const user = Wallet.fromSeed(USER_SEED.trim())

  // RequireAuth 시나리오: 발행자(admin)가 특정 계정(user)의 신뢰요청을 승인
  // - Account: 발행자 주소
  // - LimitAmount: 승인할 트러스트라인 (통화코드/발행자/한도)
  // - Flags: tfSetfAuth(0x00010000) → RequireAuth 켠 발행자가 trust line을 승인할 때 사용
  const tx: Transaction = {
    TransactionType: "TrustSet",
    Account: admin.address,
    LimitAmount: {
      currency: "ABC",
      issuer: user.address,
      value: "0",
    },
    Flags: 0x00010000,
  }

  const prepared = await client.autofill(tx)
  const signed = admin.sign(prepared)
  const result = await client.submitAndWait(signed.tx_blob)

  console.log(JSON.stringify(result, null, 2))

  await client.disconnect()
}

allowTrust()
