"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import AI_Input_Search from "@/app/components/agent/ai-input-search"
import { cn } from "@/app/lib/utils"
import { useWriteContract, usePublicClient } from "wagmi"
import { useAppKitAccount } from "@reown/appkit/react"
import tokenAbi from "@/app/contract/abi.json"
import swapAbi from "@/app/contract/swap-abi.json"
import propabi2 from "@/app/contract/abi2.json"
import bridgeAbi from "@/app/contract/bridge-abi.json"
import sepoliaBridgeAbi from "@/app/contract/sepolia-bridge-abi.json"
import { ethers } from "ethers"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { ScratchCard } from "@/app/components/rewards/scratch-card"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function AgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I’m your Agent. Ask me anything about Bazigr.",
    },
  ])
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const [openCongrats, setOpenCongrats] = useState(false)
  const [reward, setReward] = useState<number>(() => Math.floor(Math.random() * 10) + 1)
  const [canClaim, setCanClaim] = useState(false)

  const { address, isConnected } = useAppKitAccount()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const TOKEN_ADDRESS = useMemo(() => (
    "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9" as `0x${string}`
  ), [])
  const SWAP_ADDRESS = useMemo(() => (
    "0xfE053B49CE20845E6c492A575daCDD5ab7d3038D" as `0x${string}`
  ), [])
  // Bridge constants (same as manual bridge)
  const CELO_BRIDGE_ADDRESS = useMemo(() => (
    "0x118b30B86500239442744A73F1384D97F8C9B63C" as `0x${string}`
  ), [])
  const SEPOLIA_BRIDGE_ADDRESS = useMemo(() => (
    "0xE8aDCF38C12cB70CcEAcE6cb7fbB1e6e5305550B" as `0x${string}`
  ), [])
  const U2U_BRIDGE_ADDRESS = useMemo(() => (
    "0xEA41526ac190C2521e046D98159eCCcC7a05F218" as `0x${string}`
  ), [])
  const CELO_TOKEN_ADDRESS = useMemo(() => (
    "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9" as `0x${string}`
  ), [])
  const SEPOLIA_TOKEN_ADDRESS = useMemo(() => (
    "0xDf2eEe4b129EA759500c7aDbc748b09cE8487e9c" as `0x${string}`
  ), [])
  const U2U_TOKEN_ADDRESS = useMemo(() => (
    "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80" as `0x${string}`
  ), [])

  async function writeWithFallback(params: {
    abi: any
    address: `0x${string}`
    functionName: string
    args?: any[]
    value?: bigint
  }): Promise<`0x${string}`> {
    try {
      const hash = await writeContractAsync({
        abi: params.abi,
        functionName: params.functionName as any,
        address: params.address,
        args: (params.args || []) as any,
        value: params.value,
      })
      return hash as `0x${string}`
    } catch (e: any) {
      // Fallback for any write error: call via ethers directly to avoid viem circuit breaker/coalesce issues
      const eth = (globalThis as any).ethereum
      if (!eth) throw e
      const provider = new ethers.BrowserProvider(eth)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(params.address, params.abi as any, signer)
      const method = (contract as any)[params.functionName]
      const tx = params.value !== undefined
        ? await method(...(params.args || []), { value: params.value })
        : await method(...(params.args || []))
      await tx.wait()
      return tx.hash as `0x${string}`
    }
  }

  function parseAmountToWei(amt: string): bigint {
    const cleaned = (amt || "0").trim()
    const parts = cleaned.split(".")
    const whole = BigInt(parts[0] || "0")
    const frac = (parts[1] || "").replace(/[^0-9]/g, "").padEnd(18, "0").slice(0, 18)
    return whole * 10n ** 18n + BigInt(frac || "0")
  }

  // Helper function to switch networks
  async function switchToNetwork(targetNetwork: string) {
    const eth = (globalThis as any).ethereum
    if (!eth) {
      throw new Error("Wallet provider not found")
    }

    let chainId: string
    let chainName: string
    let nativeCurrency: { name: string; symbol: string; decimals: number }
    let rpcUrls: string[]
    let blockExplorerUrls: string[]

    if (targetNetwork === "u2u") {
      chainId = "0x27" // U2U Mainnet chainId 39
      chainName = "U2U Solaris Mainnet"
      nativeCurrency = { name: "U2U", symbol: "U2U", decimals: 18 }
      rpcUrls = ["https://rpc-mainnet.u2u.xyz"]
      blockExplorerUrls = ["https://u2uscan.xyz/"]
    } else if (targetNetwork === "celo") {
      chainId = "0xAA044C" // Celo Sepolia chainId 11142220
      chainName = "Celo Sepolia Testnet"
      nativeCurrency = { name: "CELO", symbol: "CELO", decimals: 18 }
      rpcUrls = ["https://forno.celo-sepolia.celo-testnet.org/"]
      blockExplorerUrls = ["https://celo-sepolia.blockscout.com/"]
    } else if (targetNetwork === "sepolia") {
      chainId = "0xAA36A7" // Sepolia chainId 11155111
      chainName = "Sepolia"
      nativeCurrency = { name: "SepoliaETH", symbol: "ETH", decimals: 18 }
      rpcUrls = ["https://ethereum-sepolia.publicnode.com"]
      blockExplorerUrls = ["https://sepolia.etherscan.io"]
    } else {
      throw new Error("Unsupported network")
    }

    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId }] })
    } catch (switchErr: any) {
      if (switchErr?.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId,
              chainName,
              nativeCurrency,
              rpcUrls,
              blockExplorerUrls,
            },
          ],
        })
      } else {
        throw switchErr
      }
    }
  }

  async function handleClaim(currentReward: number) {
    try {
      const eth = (globalThis as any).ethereum
      if (!eth) throw new Error("Wallet not found")
      const targetChainIdHex = "0xAA044C" // CELO Sepolia chainId 11142220
      try {
        await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: targetChainIdHex }] })
      } catch (switchErr: any) {
        if (switchErr?.code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: targetChainIdHex, // Celo Sepolia chainId 11142220
                chainName: "Celo Sepolia Testnet",
                nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
                rpcUrls: ["https://forno.celo-sepolia.celo-testnet.org/"],
                blockExplorerUrls: ["https://celo-sepolia.blockscout.com/"],
              },
            ],
          })
        } else {
          throw switchErr
        }
      }
      const provider = new ethers.BrowserProvider(eth)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi as any, signer)
      const to = (address as `0x${string}`) || (await signer.getAddress())
      const tx = await contract.mint(to, String(currentReward))
      await tx.wait()
      setOpenCongrats(false)
      setCanClaim(false)
    } catch (err) {
      // keep modal open on failure
    }
  }

  function parseIntent(input: string):
    | { kind: "swap"; from: "CELO" | "BAZ"; toToken: "CELO" | "BAZ"; amount?: string }
    | { kind: "send"; token?: "BAZ" | "CELO"; to?: `0x${string}`; amount?: string }
    | { kind: "bridge"; amount?: string; fromNet?: "u2u" | "celo" | "sepolia"; toNet?: "u2u" | "celo" | "sepolia" }
    | { kind: "unknown" } {
    const text = input.toLowerCase()
    const amountMatch = input.match(/(\d+\.?\d*)/)
    const addrMatch = input.match(/0x[a-fA-F0-9]{40}/)
    const hasSwap = /(\bswap\b|\bexchange\b)/.test(text)
    const hasSend = /(\bsend\b|\btransfer\b)/.test(text)
    const hasBridge = /(\bbridge\b)/.test(text)
    const toBaz = /(to\s+baz|for\s+baz|\sbaz\b)/.test(text)
    const toCELO = /(to\s+celo|for\s+celo|\bcelo\b)/.test(text)
    const fromBaz = /(from\s+baz)/.test(text)
    const fromCELO = /(from\s+celo)/.test(text)
    const bazToCELO = /(baz\s*(->|to)\s*celo)/.test(text)
    const celoToBaz = /(celo\s*(->|to)\s*baz)/.test(text)
    const amount = amountMatch ? amountMatch[1] : undefined
    const to = (addrMatch ? (addrMatch[0] as `0x${string}`) : undefined)
    if (hasSwap) {
      let from: "CELO" | "BAZ" | undefined
      if (fromBaz || bazToCELO || (toCELO && !toBaz)) from = "BAZ"
      else if (fromCELO || celoToBaz || (toBaz && !toCELO)) from = "CELO"
      else if (toCELO && toBaz) from = undefined
      if (!from) from = "CELO" // sensible default
      const dest = from === "CELO" ? "BAZ" : "CELO"
      return { kind: "swap", from, toToken: dest, amount }
    }
    if (hasSend) {
      const token: "BAZ" | "CELO" | undefined = toBaz ? "BAZ" : toCELO ? "CELO" : undefined
      return { kind: "send", token, to, amount }
    }
    if (hasBridge) {
      // Enhanced bridge parsing for network detection
      const fromNet: "u2u" | "celo" | "sepolia" | undefined =
        /from\s+u2u/.test(text) ? "u2u" :
          /from\s+celo/.test(text) ? "celo" :
            /from\s+sepolia/.test(text) ? "sepolia" :
              /u2u\s+to\s+sepolia/.test(text) ? "u2u" :
                /celo\s+to\s+sepolia/.test(text) ? "celo" :
                  /sepolia\s+to\s+(u2u|celo)/.test(text) ? "sepolia" : undefined

      const toNet: "u2u" | "celo" | "sepolia" | undefined =
        /to\s+u2u/.test(text) ? "u2u" :
          /to\s+celo/.test(text) ? "celo" :
            /to\s+sepolia/.test(text) ? "sepolia" :
              /u2u\s+to\s+sepolia/.test(text) ? "sepolia" :
                /celo\s+to\s+sepolia/.test(text) ? "sepolia" :
                  /sepolia\s+to\s+u2u/.test(text) ? "u2u" :
                    /sepolia\s+to\s+celo/.test(text) ? "celo" : undefined

      return { kind: "bridge", amount, fromNet, toNet }
    }
    return { kind: "unknown" }
  }

  async function bridgeFromCeloToSepolia(amount: number) {
    const eth = (globalThis as any).ethereum
    if (!eth) {
      throw new Error("Wallet provider not found")
    }

    const provider = new ethers.BrowserProvider(eth)
    const signer = await provider.getSigner()
    const amountWei = ethers.parseEther(amount.toString())

    // Check if we're on the correct network
    const network = await provider.getNetwork()
    if (Number(network.chainId) !== 11142220) {
      throw new Error("Please switch to CELO network to bridge from CELO")
    }

    // Step 1: Approve bridge to spend tokens
    const tokenContract = new ethers.Contract(CELO_TOKEN_ADDRESS, tokenAbi, signer)
    const approveTx = await tokenContract.approve(CELO_BRIDGE_ADDRESS, amountWei)
    await approveTx.wait()

    // Step 2: Lock tokens in bridge
    const bridgeContract = new ethers.Contract(CELO_BRIDGE_ADDRESS, bridgeAbi, signer)
    const lockTx = await bridgeContract.lockTokens(amountWei)
    const lockReceipt = await lockTx.wait()
    console.log("Lock transaction confirmed:", lockTx.hash)

    // Extract the nonce from the TokensLocked event
    const lockEvent = lockReceipt.logs.find((log: any) => {
      try {
        const parsed = bridgeContract.interface.parseLog(log)
        return parsed?.name === "TokensLocked"
      } catch {
        return false
      }
    })

    if (!lockEvent) {
      throw new Error("Failed to find TokensLocked event")
    }

    const parsedEvent = bridgeContract.interface.parseLog(lockEvent)
    const nonce = parsedEvent?.args.nonce

    // Step 3: Immediately trigger MetaMask network switch popup
    const sepoliaChainId = "0xAA36A7" // Sepolia chainId 11155111
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: sepoliaChainId }] })
    } catch (switchErr: any) {
      if (switchErr?.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: sepoliaChainId,
              chainName: "Sepolia",
              nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://ethereum-sepolia.publicnode.com"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        })
      } else {
        throw switchErr
      }
    }

    // Brief wait for network switch to propagate
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Verify we're on Sepolia
    const sepoliaProvider = new ethers.BrowserProvider(eth)
    const sepoliaNetwork = await sepoliaProvider.getNetwork()

    if (Number(sepoliaNetwork.chainId) !== 11155111) {
      throw new Error("Failed to switch to Sepolia network")
    }

    // Step 4: Unlock tokens on Sepolia
    const sepoliaSigner = await sepoliaProvider.getSigner()
    const sepoliaBridgeContract = new ethers.Contract(SEPOLIA_BRIDGE_ADDRESS, sepoliaBridgeAbi.abi, sepoliaSigner)

    // Check bridge balance first
    console.log("Checking Sepolia bridge balance...")
    const bridgeBalance = await sepoliaBridgeContract.getBridgeBalance()
    console.log("Sepolia bridge balance:", ethers.formatEther(bridgeBalance))

    if (bridgeBalance < amountWei) {
      throw new Error(`Insufficient bridge balance. Bridge has ${ethers.formatEther(bridgeBalance)} BAZ, need ${ethers.formatEther(amountWei)} BAZ`)
    }

    // Check if nonce is already processed
    console.log("Checking if nonce is processed...")
    const isProcessed = await sepoliaBridgeContract.isNonceProcessed(nonce)
    console.log("Nonce processed:", isProcessed)
    if (isProcessed) {
      throw new Error("This nonce has already been processed")
    }

    // Use selfUnlockTokens function (recommended for user-initiated unlocks)
    try {
      console.log("Attempting selfUnlockTokens with:", {
        amount: ethers.formatEther(amountWei),
        nonce: nonce.toString(),
        user: address
      })

      const selfUnlockTx = await sepoliaBridgeContract.selfUnlockTokens(amountWei, nonce)
      console.log("Self-unlock transaction sent:", selfUnlockTx.hash)
      await selfUnlockTx.wait()
      console.log("Self-unlock transaction confirmed:", selfUnlockTx.hash)
    } catch (selfUnlockError: any) {
      console.log("Self-unlock failed, trying unlockTokens...", selfUnlockError)

      // Try unlockTokens as fallback
      try {
        console.log("Attempting unlockTokens with:", {
          user: address,
          amount: ethers.formatEther(amountWei),
          nonce: nonce.toString()
        })

        const unlockTx = await sepoliaBridgeContract.unlockTokens(address, amountWei, nonce)
        console.log("Unlock transaction sent:", unlockTx.hash)
        await unlockTx.wait()
        console.log("Unlock transaction confirmed:", unlockTx.hash)
      } catch (unlockError: any) {
        console.log("Both unlock methods failed:", unlockError)
        throw new Error(`Failed to unlock tokens: ${unlockError?.shortMessage || unlockError?.message || "Unknown error"}`)
      }
    }
  }

  async function bridgeFromSepoliaToCelo(amount: number) {
    const eth = (globalThis as any).ethereum
    if (!eth) {
      throw new Error("Wallet provider not found")
    }

    const provider = new ethers.BrowserProvider(eth)
    const signer = await provider.getSigner()
    const amountWei = ethers.parseEther(amount.toString())

    // Check if we're on the correct network
    const network = await provider.getNetwork()
    if (Number(network.chainId) !== 11155111) {
      throw new Error("Please switch to Sepolia network to bridge from Sepolia")
    }

    // Step 1: Approve bridge to spend tokens
    const tokenContract = new ethers.Contract(SEPOLIA_TOKEN_ADDRESS, tokenAbi, signer)
    const approveTx = await tokenContract.approve(SEPOLIA_BRIDGE_ADDRESS, amountWei)
    await approveTx.wait()

    // Step 2: Lock tokens in bridge
    const bridgeContract = new ethers.Contract(SEPOLIA_BRIDGE_ADDRESS, sepoliaBridgeAbi.abi, signer)
    const lockTx = await bridgeContract.lockTokens(amountWei)
    const lockReceipt = await lockTx.wait()
    console.log("Lock transaction confirmed:", lockTx.hash)

    // Extract the nonce from the TokensLocked event
    const lockEvent = lockReceipt.logs.find((log: any) => {
      try {
        const parsed = bridgeContract.interface.parseLog(log)
        return parsed?.name === "TokensLocked"
      } catch {
        return false
      }
    })

    if (!lockEvent) {
      throw new Error("Failed to find TokensLocked event")
    }

    const parsedEvent = bridgeContract.interface.parseLog(lockEvent)
    const nonce = parsedEvent?.args.nonce

    // Step 3: Immediately trigger MetaMask network switch popup
    const celoChainId = "0xAA044C" // Celo Sepolia chainId 11142220
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: celoChainId }] })
    } catch (switchErr: any) {
      if (switchErr?.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: celoChainId,
              chainName: "Celo Sepolia Testnet",
              nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
              rpcUrls: ["https://forno.celo-sepolia.celo-testnet.org/"],
              blockExplorerUrls: ["https://celo-sepolia.blockscout.com/"],
            },
          ],
        })
      } else {
        throw switchErr
      }
    }

    // Brief wait for network switch to propagate
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Verify we're on CELO
    const celoProvider = new ethers.BrowserProvider(eth)
    const celoNetwork = await celoProvider.getNetwork()

    if (Number(celoNetwork.chainId) !== 11142220) {
      throw new Error("Failed to switch to CELO network")
    }

    // Step 4: Unlock tokens on CELO
    const celoSigner = await celoProvider.getSigner()
    const celoBridgeContract = new ethers.Contract(CELO_BRIDGE_ADDRESS, sepoliaBridgeAbi.abi, celoSigner)

    // Check bridge balance first
    const bridgeBalance = await celoBridgeContract.getBridgeBalance()
    console.log("CELO bridge balance:", ethers.formatEther(bridgeBalance))

    if (bridgeBalance < amountWei) {
      throw new Error(`Insufficient bridge balance. Bridge has ${ethers.formatEther(bridgeBalance)} BAZ, need ${ethers.formatEther(amountWei)} BAZ`)
    }

    // Check if nonce is already processed
    const isProcessed = await celoBridgeContract.isNonceProcessed(nonce)
    console.log("Nonce processed:", isProcessed)
    if (isProcessed) {
      throw new Error("This nonce has already been processed")
    }

    // Use selfUnlockTokens function (recommended for user-initiated unlocks)
    try {
      console.log("Attempting selfUnlockTokens with:", {
        amount: ethers.formatEther(amountWei),
        nonce: nonce.toString()
      })

      const selfUnlockTx = await celoBridgeContract.selfUnlockTokens(amountWei, nonce)
      await selfUnlockTx.wait()
      console.log("Self-unlock transaction confirmed:", selfUnlockTx.hash)
    } catch (selfUnlockError: any) {
      console.log("Self-unlock failed, trying unlockTokens...", selfUnlockError)

      // Try unlockTokens as fallback
      try {
        console.log("Attempting unlockTokens with:", {
          user: address,
          amount: ethers.formatEther(amountWei),
          nonce: nonce.toString()
        })

        const unlockTx = await celoBridgeContract.unlockTokens(address, amountWei, nonce)
        await unlockTx.wait()
        console.log("Unlock transaction confirmed:", unlockTx.hash)
      } catch (unlockError: any) {
        console.log("Both unlock methods failed:", unlockError)
        throw new Error(`Failed to unlock tokens: ${unlockError?.shortMessage || unlockError?.message || "Unknown error"}`)
      }
    }
  }

  async function bridgeFromU2UToSepolia(amount: number) {
    const eth = (globalThis as any).ethereum
    if (!eth) {
      throw new Error("Wallet provider not found")
    }

    const provider = new ethers.BrowserProvider(eth)
    const signer = await provider.getSigner()
    const amountWei = ethers.parseEther(amount.toString())

    // Check if we're on the correct network
    const network = await provider.getNetwork()
    if (Number(network.chainId) !== 39) {
      throw new Error("Please switch to U2U network to bridge from U2U")
    }

    // Step 1: Approve bridge to spend tokens
    const tokenContract = new ethers.Contract(U2U_TOKEN_ADDRESS, tokenAbi, signer)
    const approveTx = await tokenContract.approve(U2U_BRIDGE_ADDRESS, amountWei)
    await approveTx.wait()

    // Step 2: Lock tokens in bridge
    const bridgeContract = new ethers.Contract(U2U_BRIDGE_ADDRESS, bridgeAbi, signer)
    const lockTx = await bridgeContract.lockTokens(amountWei)
    const lockReceipt = await lockTx.wait()
    console.log("Lock transaction confirmed:", lockTx.hash)

    // Extract the nonce from the TokensLocked event
    const lockEvent = lockReceipt.logs.find((log: any) => {
      try {
        const parsed = bridgeContract.interface.parseLog(log)
        return parsed?.name === "TokensLocked"
      } catch {
        return false
      }
    })

    if (!lockEvent) {
      throw new Error("Failed to find TokensLocked event")
    }

    const parsedEvent = bridgeContract.interface.parseLog(lockEvent)
    const nonce = parsedEvent?.args.nonce

    // Step 3: Immediately trigger MetaMask network switch popup
    const sepoliaChainId = "0xAA36A7" // Sepolia chainId 11155111
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: sepoliaChainId }] })
    } catch (switchErr: any) {
      if (switchErr?.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: sepoliaChainId,
              chainName: "Sepolia",
              nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://ethereum-sepolia.publicnode.com"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        })
      } else {
        throw switchErr
      }
    }

    // Brief wait for network switch to propagate
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Verify we're on Sepolia
    const sepoliaProvider = new ethers.BrowserProvider(eth)
    const sepoliaNetwork = await sepoliaProvider.getNetwork()

    if (Number(sepoliaNetwork.chainId) !== 11155111) {
      throw new Error("Failed to switch to Sepolia network")
    }

    // Step 4: Unlock tokens on Sepolia
    const sepoliaSigner = await sepoliaProvider.getSigner()
    const sepoliaBridgeContract = new ethers.Contract(SEPOLIA_BRIDGE_ADDRESS, sepoliaBridgeAbi.abi, sepoliaSigner)

    // Check bridge balance first
    console.log("Checking Sepolia bridge balance...")
    const bridgeBalance = await sepoliaBridgeContract.getBridgeBalance()
    console.log("Sepolia bridge balance:", ethers.formatEther(bridgeBalance))

    if (bridgeBalance < amountWei) {
      throw new Error(`Insufficient bridge balance. Bridge has ${ethers.formatEther(bridgeBalance)} BAZ, need ${ethers.formatEther(amountWei)} BAZ`)
    }

    // Check if nonce is already processed
    console.log("Checking if nonce is processed...")
    const isProcessed = await sepoliaBridgeContract.isNonceProcessed(nonce)
    console.log("Nonce processed:", isProcessed)
    if (isProcessed) {
      throw new Error("This nonce has already been processed")
    }

    // Use selfUnlockTokens function (recommended for user-initiated unlocks)
    try {
      console.log("Attempting selfUnlockTokens with:", {
        amount: ethers.formatEther(amountWei),
        nonce: nonce.toString(),
        user: address
      })

      const selfUnlockTx = await sepoliaBridgeContract.selfUnlockTokens(amountWei, nonce)
      console.log("Self-unlock transaction sent:", selfUnlockTx.hash)
      await selfUnlockTx.wait()
      console.log("Self-unlock transaction confirmed:", selfUnlockTx.hash)
    } catch (selfUnlockError: any) {
      console.log("Self-unlock failed, trying unlockTokens...", selfUnlockError)

      // Try unlockTokens as fallback
      try {
        console.log("Attempting unlockTokens with:", {
          user: address,
          amount: ethers.formatEther(amountWei),
          nonce: nonce.toString()
        })

        const unlockTx = await sepoliaBridgeContract.unlockTokens(address, amountWei, nonce)
        console.log("Unlock transaction sent:", unlockTx.hash)
        await unlockTx.wait()
        console.log("Unlock transaction confirmed:", unlockTx.hash)
      } catch (unlockError: any) {
        console.log("Both unlock methods failed:", unlockError)
        throw new Error(`Failed to unlock tokens: ${unlockError?.shortMessage || unlockError?.message || "Unknown error"}`)
      }
    }
  }

  async function bridgeFromSepoliaToU2U(amount: number) {
    const eth = (globalThis as any).ethereum
    if (!eth) {
      throw new Error("Wallet provider not found")
    }

    const provider = new ethers.BrowserProvider(eth)
    const signer = await provider.getSigner()
    const amountWei = ethers.parseEther(amount.toString())

    // Check if we're on the correct network
    const network = await provider.getNetwork()
    if (Number(network.chainId) !== 11155111) {
      throw new Error("Please switch to Sepolia network to bridge from Sepolia")
    }

    // Step 1: Approve bridge to spend tokens
    const tokenContract = new ethers.Contract(SEPOLIA_TOKEN_ADDRESS, tokenAbi, signer)
    const approveTx = await tokenContract.approve(SEPOLIA_BRIDGE_ADDRESS, amountWei)
    await approveTx.wait()

    // Step 2: Lock tokens in bridge
    const bridgeContract = new ethers.Contract(SEPOLIA_BRIDGE_ADDRESS, sepoliaBridgeAbi.abi, signer)
    const lockTx = await bridgeContract.lockTokens(amountWei)
    const lockReceipt = await lockTx.wait()
    console.log("Lock transaction confirmed:", lockTx.hash)

    // Extract the nonce from the TokensLocked event
    const lockEvent = lockReceipt.logs.find((log: any) => {
      try {
        const parsed = bridgeContract.interface.parseLog(log)
        return parsed?.name === "TokensLocked"
      } catch {
        return false
      }
    })

    if (!lockEvent) {
      throw new Error("Failed to find TokensLocked event")
    }

    const parsedEvent = bridgeContract.interface.parseLog(lockEvent)
    const nonce = parsedEvent?.args.nonce

    // Step 3: Immediately trigger MetaMask network switch popup
    const u2uChainId = "0x27" // U2U Mainnet chainId 39
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: u2uChainId }] })
    } catch (switchErr: any) {
      if (switchErr?.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: u2uChainId,
              chainName: "U2U Solaris Mainnet",
              nativeCurrency: { name: "U2U", symbol: "U2U", decimals: 18 },
              rpcUrls: ["https://rpc-mainnet.u2u.xyz"],
              blockExplorerUrls: ["https://u2uscan.xyz/"],
            },
          ],
        })
      } else {
        throw switchErr
      }
    }

    // Brief wait for network switch to propagate
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Step 4: Unlock tokens on U2U
    const u2uProvider = new ethers.BrowserProvider(eth)
    const u2uSigner = await u2uProvider.getSigner()
    const u2uBridgeContract = new ethers.Contract(U2U_BRIDGE_ADDRESS, sepoliaBridgeAbi.abi, u2uSigner)

    // Check bridge balance first
    const bridgeBalance = await u2uBridgeContract.getBridgeBalance()
    console.log("U2U bridge balance:", ethers.formatEther(bridgeBalance))

    if (bridgeBalance < amountWei) {
      throw new Error(`Insufficient bridge balance. Bridge has ${ethers.formatEther(bridgeBalance)} BAZ, need ${ethers.formatEther(amountWei)} BAZ`)
    }

    // Check if nonce is already processed
    const isProcessed = await u2uBridgeContract.isNonceProcessed(nonce)
    console.log("Nonce processed:", isProcessed)
    if (isProcessed) {
      throw new Error("This nonce has already been processed")
    }

    // Use selfUnlockTokens function (recommended for user-initiated unlocks)
    try {
      console.log("Attempting selfUnlockTokens with:", {
        amount: ethers.formatEther(amountWei),
        nonce: nonce.toString()
      })

      const selfUnlockTx = await u2uBridgeContract.selfUnlockTokens(amountWei, nonce)
      await selfUnlockTx.wait()
      console.log("Self-unlock transaction confirmed:", selfUnlockTx.hash)
    } catch (selfUnlockError: any) {
      console.log("Self-unlock failed, trying unlockTokens...", selfUnlockError)

      // Try unlockTokens as fallback
      try {
        console.log("Attempting unlockTokens with:", {
          user: address,
          amount: ethers.formatEther(amountWei),
          nonce: nonce.toString()
        })

        const unlockTx = await u2uBridgeContract.unlockTokens(address, amountWei, nonce)
        await unlockTx.wait()
        console.log("Unlock transaction confirmed:", unlockTx.hash)
      } catch (unlockError: any) {
        console.log("Both unlock methods failed:", unlockError)
        throw new Error(`Failed to unlock tokens: ${unlockError?.shortMessage || unlockError?.message || "Unknown error"}`)
      }
    }
  }

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, loading])

  async function sendMessage(input: string) {
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    const intent = parseIntent(input)
    if (intent.kind === "swap" && intent.amount) {
      const performing: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "Performing swap…" }
      setMessages((prev) => [...prev, performing])
      try {
        if (!isConnected || !address) throw new Error("Wallet not connected")
        const wei = parseAmountToWei(intent.amount)
        if (intent.from === "CELO") {
          // Native -> BAZ
          try {
            await publicClient?.estimateContractGas({
              abi: (swapAbi as any).abi || (swapAbi as any),
              functionName: "swapNativeForBaz",
              address: SWAP_ADDRESS,
              args: [],
              value: wei,
              account: address as `0x${string}`,
            })
          } catch { }
          const hash = await writeWithFallback({
            abi: (swapAbi as any).abi || (swapAbi as any),
            functionName: "swapNativeForBaz",
            address: SWAP_ADDRESS,
            args: [],
            value: wei,
          })
          await publicClient?.waitForTransactionReceipt({ hash })
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: `Swap successful: ${intent.amount} CELO → ${Number(intent.amount) * 20} BAZ` }])
          setReward(Math.floor(Math.random() * 10) + 1)
          setOpenCongrats(true)
        } else {
          // BAZ -> CELO
          try {
            await publicClient?.estimateContractGas({
              abi: tokenAbi as any,
              functionName: "approve",
              address: TOKEN_ADDRESS,
              args: [SWAP_ADDRESS, wei],
              account: address as `0x${string}`,
            })
          } catch { }
          const approveHash = await writeWithFallback({
            abi: tokenAbi as any,
            functionName: "approve",
            address: TOKEN_ADDRESS,
            args: [SWAP_ADDRESS, wei],
          })
          await publicClient?.waitForTransactionReceipt({ hash: approveHash })
          const swapHash = await writeWithFallback({
            abi: (swapAbi as any).abi || (swapAbi as any),
            functionName: "swapBazForNative",
            address: SWAP_ADDRESS,
            args: [wei],
          })
          await publicClient?.waitForTransactionReceipt({ hash: swapHash })
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: `Swap successful: ${intent.amount} BAZ → ${(Number(intent.amount) / 20).toString()} CELO` }])
          setReward(Math.floor(Math.random() * 10) + 1)
          setOpenCongrats(true)
        }
      } catch (e: any) {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: e?.message || "Swap failed" }])
      }
      return
    }

    if (intent.kind === "send" && intent.amount && intent.to) {
      const performing: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "Performing send…" }
      setMessages((prev) => [...prev, performing])
      try {
        if (!isConnected || !address) throw new Error("Wallet not connected")
        if (intent.token === "BAZ") {
          // Bazigr.send expects whole tokens (mints 1e18 internally)
          const txHash = await writeWithFallback({
            abi: tokenAbi as any,
            functionName: "send",
            address: TOKEN_ADDRESS,
            args: [intent.to, intent.amount],
          })
          await publicClient?.waitForTransactionReceipt({ hash: txHash })
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: `Sent ${intent.amount} BAZ to ${intent.to}` }])
          setReward(Math.floor(Math.random() * 10) + 1)
          setOpenCongrats(true)
        } else {
          // Native CELO send via ethers
          const wei = parseAmountToWei(intent.amount)
          const eth = (globalThis as any).ethereum
          if (!eth) throw new Error("Wallet not found")
          const provider = new ethers.BrowserProvider(eth)
          const signer = await provider.getSigner()
          const tx = await signer.sendTransaction({ to: intent.to, value: wei })
          await tx.wait()
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: `Sent ${intent.amount} CELO to ${intent.to}` }])
          setReward(Math.floor(Math.random() * 10) + 1)
          setOpenCongrats(true)
        }
      } catch (e: any) {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: e?.message || "Send failed" }])
      }
      return
    }

    if (intent.kind === "bridge" && intent.amount) {
      const performing: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "Performing bridge…" }
      setMessages((prev) => [...prev, performing])
      try {
        if (!isConnected || !address) throw new Error("Wallet not connected")
        const amount = parseFloat(intent.amount)
        if (amount <= 0) throw new Error("Amount must be greater than 0")

        if (intent.fromNet === "celo" && intent.toNet === "sepolia") {
          // Bridge from CELO to Sepolia
          await bridgeFromCeloToSepolia(amount)
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: `Bridged ${intent.amount} BAZ from CELO → Sepolia` }])
          setReward(Math.floor(Math.random() * 10) + 1)
          setOpenCongrats(true)
        } else if (intent.fromNet === "sepolia" && intent.toNet === "celo") {
          // Bridge from Sepolia to CELO
          await bridgeFromSepoliaToCelo(amount)
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: `Bridged ${intent.amount} BAZ from Sepolia → CELO` }])
          setReward(Math.floor(Math.random() * 10) + 1)
          setOpenCongrats(true)
        } else if (intent.fromNet === "u2u" && intent.toNet === "sepolia") {
          // Bridge from U2U to Sepolia
          await bridgeFromU2UToSepolia(amount)
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: `Bridged ${intent.amount} BAZ from U2U → Sepolia` }])
          setReward(Math.floor(Math.random() * 10) + 1)
          setOpenCongrats(true)
        } else if (intent.fromNet === "sepolia" && intent.toNet === "u2u") {
          // Bridge from Sepolia to U2U
          await bridgeFromSepoliaToU2U(amount)
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: `Bridged ${intent.amount} BAZ from Sepolia → U2U` }])
          setReward(Math.floor(Math.random() * 10) + 1)
          setOpenCongrats(true)
        } else {
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Specify networks like: bridge 10 BAZ from celo to sepolia or bridge 5 BAZ from sepolia to celo" }])
        }
      } catch (e: any) {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: e?.message || "Bridge failed" }])
      }
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages.concat(userMsg).map(({ role, content }) => ({ role, content })) }),
      })
      const data = await res.json()
      const botMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: data.text ?? "…" }
      setMessages((prev) => [...prev, botMsg])
    } catch (e) {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I ran into an error. Please try again.",
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div
        className={cn("backdrop-blur-xl bg-black/30 border border-white/10 rounded-2xl", "min-h-[70vh] flex flex-col")}
      >
        {/* Heading */}
        <div className="px-5 py-4 border-b border-white/10">
          <h1 className="text-lg font-semibold text-center">Agent</h1>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[80%] px-4 py-3 rounded-xl border border-white/10",
                m.role === "user" ? "ml-auto bg-white/20 text-white" : "mr-auto bg-white/10 text-white/90",
              )}
            >
              <div
                className="text-sm leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: m.content }}
              />
            </div>
          ))}
          {loading && (
            <div className="mr-auto max-w-[60%] px-4 py-3 rounded-xl border border-white/10 bg-white/10 text-white/90">
              <p className="text-sm">Thinking…</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-4">
          <AI_Input_Search onSubmit={sendMessage} placeholder="Type your question and press Enter…" />
        </div>
      </div>
      {/* Scratch modal after successful actions */}
      <Dialog open={openCongrats} onOpenChange={setOpenCongrats}>
        <DialogContent className="bg-card/20 backdrop-blur-xl border border-border/60 max-w-lg text-foreground">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Congratulations!</DialogTitle>
            <DialogDescription className="text-center">Scratch to reveal your bonus</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <ScratchCard
              rewardText={`${reward} BAZ`}
              width={360}
              height={200}
              onRevealComplete={() => setCanClaim(true)}
            />
            <Button
              className={cn(
                "mt-2 w-full",
                canClaim ? "bg-pink-600 hover:bg-pink-500 text-white" : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
              disabled={!canClaim}
              onClick={() => handleClaim(reward)}
            >
              Claim
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
