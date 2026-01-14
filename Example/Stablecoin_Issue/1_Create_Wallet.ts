import { Wallet } from "xrpl"

export async function createWallet() {
  try {
    // 새 지갑을 생성하고 기본 정보(주소, 시드, 공개키)를 출력
    const newWallet = Wallet.generate()
    console.log("새 지갑 생성 완료")
    console.log(`주소: ${newWallet.address}`)
    console.log(`시드: ${newWallet.seed}`)
    console.log(`공개키: ${newWallet.publicKey}`)
    return {
      wallet: newWallet,
      address: newWallet.address,
      seed: newWallet.seed!,
    }
  } catch (error) {
    console.error("지갑 생성 실패:", error)
    throw new Error(`지갑 생성 실패: ${error}`)
  }
}

if (require.main === module) {
  createWallet()
}
