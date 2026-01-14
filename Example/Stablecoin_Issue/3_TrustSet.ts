import dotenv from "dotenv"
import path from "path"
import { Client, Wallet, TrustSet as TrustSetTx } from "xrpl"

dotenv.config({ path: path.join(process.cwd(), ".env") })

export async function TrustSet() {
  const client = new Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()

  const ADMIN_SEED = process.env.ADMIN_SEED
  const USER_SEED = process.env.USER_SEED
  if (!ADMIN_SEED || !USER_SEED) throw new Error("Missing env: ADMIN_SEED, USER_SEED")

  const admin = Wallet.fromSeed(ADMIN_SEED.trim())
  const user = Wallet.fromSeed(USER_SEED.trim())

  // TrustSet 트랜잭션: 사용자가 발행자(admin)의 IOU를 받을 수 있게 신뢰한도(credit line) 생성
  // - Account: 트러스트라인을 생성하는 계정(사용자)
  // - LimitAmount: 통화 코드, 발행자 주소, 신뢰 한도 금액을 지정
  const tx: TrustSetTx = {
    TransactionType: "TrustSet",
    Account: user.address,
    LimitAmount: {
      currency: "ABC",
      issuer: admin.address,
      value: "1000", // 신뢰 한도 (사용자가 받아들일 최대 발행량)
    },
  }

  try {
    const prepared = await client.autofill(tx)
    const signed = user.sign(prepared)
    const result = await client.submitAndWait(signed.tx_blob)

    console.log(JSON.stringify(result, null, 2))
    return result
  } finally {
    await client.disconnect()
  }
}

if (require.main === module) {
  TrustSet().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
