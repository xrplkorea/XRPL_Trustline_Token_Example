import dotenv from "dotenv"
import path from "path"
import { Client, Wallet } from "xrpl"

dotenv.config({ path: path.join(process.cwd(), ".env") })

export async function faucet() {
  // 테스트넷 faucet API는 서명 없이 시드만 있으면 잔고를 채워준다.
  const client = new Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()

  try {
    if (process.env.ADMIN_SEED) {
      const adminWallet = Wallet.fromSeed(process.env.ADMIN_SEED.trim())
      await client.fundWallet(adminWallet)
      console.log(`ADMIN (${adminWallet.address}) 계정 faucet 충전 완료`)
    } else {
      console.warn("ADMIN_SEED 환경변수 없음")
    }

    if (process.env.USER_SEED) {
      const userWallet = Wallet.fromSeed(process.env.USER_SEED.trim())
      await client.fundWallet(userWallet)
      console.log(`USER (${userWallet.address}) 계정 faucet 충전 완료`)
    } else {
      console.warn("USER_SEED 환경변수 없음")
    }
  } catch (err) {
    console.error("계정 자금 충전 중 오류:", err)
  } finally {
    await client.disconnect()
    console.log("연결 종료")
  }
}

if (require.main === module) {
  faucet()
}
