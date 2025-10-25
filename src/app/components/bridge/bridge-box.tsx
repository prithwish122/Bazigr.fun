"use client"

import * as React from "react"
import { cn } from "@/app/lib/utils"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog"
import { useToast } from "../../toasts/use-toast"
import { ScratchCard } from "@/app/components/rewards/scratch-card"
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react"
import { ethers } from "ethers"
import bridgeAbi from "@/app/contract/bridge-abi.json"
import sepoliaBridgeAbi from "@/app/contract/sepolia-bridge-abi.json"
import bazigrAbi from "@/app/contract/abi.json"

const NETWORKS = [
  { id: "celo", label: "CELO" },
  { id: "sepolia", label: "Sepolia ETH" },
]

// Contract addresses - Updated bridge contracts with unlock functionality
const CELO_BRIDGE_ADDRESS = "0x118b30B86500239442744A73F1384D97F8C9B63C"; // Celo bridge address
const SEPOLIA_BRIDGE_ADDRESS = "0xE8aDCF38C12cB70CcEAcE6cb7fbB1e6e5305550B"; // Sepolia bridge address
const CELO_TOKEN_ADDRESS = "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9";
const SEPOLIA_TOKEN_ADDRESS = "0xDf2eEe4b129EA759500c7aDbc748b09cE8487e9c";

export function BridgeBox() {
  const [fromNetwork, setFromNetwork] = React.useState<string>("celo")
  const [toNetwork, setToNetwork] = React.useState<string>("sepolia")
  const [fromAmount, setFromAmount] = React.useState<string>("0")
  const [toAmount, setToAmount] = React.useState<string>("0")
  const [busy, setBusy] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const { toast } = useToast()
  const [reward, setReward] = React.useState<number>(() => Math.floor(Math.random() * 10) + 1)
  const [canClaim, setCanClaim] = React.useState(false)
  const [openCongrats, setOpenCongrats] = React.useState(false)

  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()

  // Auto-detect and set networks based on current chain
  React.useEffect(() => {
    if (chainId) {
      if (chainId === 11142220) {
        // Currently on Celo, set as from network
        setFromNetwork("celo")
        setToNetwork("sepolia")
      } else if (chainId === 11155111) {
        // Currently on Sepolia, set as from network
        setFromNetwork("sepolia")
        setToNetwork("celo")
      }
    }
  }, [chainId])

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

    if (targetNetwork === "celo") {
      chainId = "0xA9F8C8" // Celo Sepolia chainId 11142220
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

  // 1:1 mirror amounts
  function handleFromAmount(v: string) {
    const sanitized = v.replace(/[^\d.]/g, "")
    setFromAmount(sanitized)
    setToAmount(sanitized || "0")
  }

  function handleFromNetworkChange(id: string) {
    setFromNetwork(id)
    if (id === toNetwork) setToNetwork(id === "celo" ? "sepolia" : "celo")
  }
  
  function handleToNetworkChange(id: string) {
    setToNetwork(id)
    if (id === fromNetwork) setFromNetwork(id === "celo" ? "sepolia" : "celo")
  }

  async function handleClaim(reward: number) {
    try {
      const eth = (globalThis as any).ethereum
      if (!eth) {
        toast({ title: "Wallet not found", description: "Install or unlock your wallet." })
        return
      }
      
      // Switch to CELO network for claiming
      const targetChainIdHex = "0xA9F8C8" // Celo Sepolia chainId 11142220
      try {
        await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: targetChainIdHex }] })
      } catch (switchErr: any) {
        if (switchErr?.code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: targetChainIdHex,
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
      const contract = new ethers.Contract(CELO_TOKEN_ADDRESS as `0x${string}`, bazigrAbi as any, signer)
      const amtStr = String(reward)
      const to = (address as `0x${string}`) || (await signer.getAddress())
      const tx = await contract.mint(to, amtStr)
      await tx.wait()
      toast({ title: "Reward minted", description: `Minted ${reward} BAZ to your wallet.` })
      setOpenCongrats(false)
    } catch (err: any) {
      toast({ title: "Claim failed", description: err?.shortMessage || err?.message || "Mint failed" })
    }
  }

  async function onBridge(fromAmount: string) {
    if (busy) return
    setBusy(true)
    
    try {
      const amount = parseFloat(fromAmount)
      if (amount <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      if (!address) {
        throw new Error("Please connect your wallet")
      }

      // Show initial progress
      toast({ title: "Starting bridge process", description: "Please wait while we process your transaction..." })

      // Check if we need to switch networks first
      const currentChainId = chainId
      const needsNetworkSwitch = 
        (fromNetwork === "celo" && currentChainId !== 11142220) ||
        (fromNetwork === "sepolia" && currentChainId !== 11155111)

      if (needsNetworkSwitch) {
        toast({ title: "Switching Network", description: `Switching to ${fromNetwork === "celo" ? "CELO" : "Sepolia"} network...` })
        await switchToNetwork(fromNetwork)
        
        // Wait a moment for network switch to complete
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      if (fromNetwork === "celo" && toNetwork === "sepolia") {
        // Bridge from CELO to Sepolia
        await bridgeFromCeloToSepolia(amount)
      } else if (fromNetwork === "sepolia" && toNetwork === "celo") {
        // Bridge from Sepolia to CELO
        await bridgeFromSepoliaToCelo(amount)
      } else {
        throw new Error("Invalid bridge direction")
      }

      // Success UI
      toast({ title: "Bridge successful", description: "Your assets have been bridged successfully!" })
      setOpen(true)
    } catch (err: any) {
      console.error("Bridge error:", err)
      let errorMessage = "Transaction failed"
      
      if (err?.message?.includes("user rejected")) {
        errorMessage = "Transaction was cancelled by user"
      } else if (err?.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction"
      } else if (err?.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection"
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      toast({ title: "Bridge failed", description: errorMessage })
    } finally {
      setBusy(false)
    }
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
    toast({ title: "Step 1/4", description: "Approving bridge to spend your tokens..." })
    const tokenContract = new ethers.Contract(CELO_TOKEN_ADDRESS, bazigrAbi, signer)
    const approveTx = await tokenContract.approve(CELO_BRIDGE_ADDRESS, amountWei)
    await approveTx.wait()
    console.log("Approval transaction confirmed:", approveTx.hash)

    // Step 2: Lock tokens in bridge
    toast({ title: "Step 2/4", description: "Locking tokens in bridge..." })
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
    
    console.log("Lock event parsed:", {
      user: parsedEvent?.args.user,
      amount: parsedEvent?.args.amount?.toString(),
      nonce: nonce?.toString(),
      targetChain: parsedEvent?.args.targetChain
    })

    // Step 3: Switch to Sepolia and unlock tokens
    toast({ title: "Step 3/4", description: "Switching to Sepolia network..." })
    
    // Switch to Sepolia network
    const sepoliaChainId = "0xAA36A7" // Sepolia chainId 11155111
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: sepoliaChainId }] })
      console.log("Network switch requested to Sepolia")
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
        console.log("Sepolia network added")
      } else {
        throw switchErr
      }
    }

    // Wait for network switch to complete
    console.log("Waiting for network switch to complete...")
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Verify we're on Sepolia
    const sepoliaProvider = new ethers.BrowserProvider(eth)
    const sepoliaNetwork = await sepoliaProvider.getNetwork()
    console.log("Current network after switch:", Number(sepoliaNetwork.chainId))
    
    if (Number(sepoliaNetwork.chainId) !== 11155111) {
      throw new Error("Failed to switch to Sepolia network")
    }

    // Step 4: Unlock tokens on Sepolia
    toast({ title: "Step 4/4", description: "Unlocking tokens on Sepolia..." })
    const sepoliaSigner = await sepoliaProvider.getSigner()
    const sepoliaBridgeContract = new ethers.Contract(SEPOLIA_BRIDGE_ADDRESS, sepoliaBridgeAbi.abi, sepoliaSigner)
    
    console.log("Sepolia bridge contract created:", SEPOLIA_BRIDGE_ADDRESS)
    
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
      
      toast({ 
        title: "Bridge Successful!", 
        description: `Tokens bridged successfully! Lock: ${lockTx.hash.slice(0, 10)}... Unlock: ${selfUnlockTx.hash.slice(0, 10)}...` 
      })
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
        
        toast({ 
          title: "Bridge Successful!", 
          description: `Tokens bridged successfully! Lock: ${lockTx.hash.slice(0, 10)}... Unlock: ${unlockTx.hash.slice(0, 10)}...` 
        })
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
    toast({ title: "Step 1/4", description: "Approving bridge to spend your tokens..." })
    const tokenContract = new ethers.Contract(SEPOLIA_TOKEN_ADDRESS, bazigrAbi, signer)
    const approveTx = await tokenContract.approve(SEPOLIA_BRIDGE_ADDRESS, amountWei)
    await approveTx.wait()
    console.log("Approval transaction confirmed:", approveTx.hash)

    // Step 2: Lock tokens in bridge
    toast({ title: "Step 2/4", description: "Locking tokens in bridge..." })
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
    
    console.log("Lock event parsed:", {
      user: parsedEvent?.args.user,
      amount: parsedEvent?.args.amount?.toString(),
      nonce: nonce?.toString(),
      targetChain: parsedEvent?.args.targetChain
    })

    // Step 3: Switch to CELO and unlock tokens
    toast({ title: "Step 3/4", description: "Switching to CELO network..." })
    
    // Switch to CELO network
    const celoChainId = "0xA9F8C8" // Celo Sepolia chainId 11142220
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

    // Step 4: Unlock tokens on CELO
    toast({ title: "Step 4/4", description: "Unlocking tokens on CELO..." })
    const celoProvider = new ethers.BrowserProvider(eth)
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
      
      toast({ 
        title: "Bridge Successful!", 
        description: `Tokens bridged successfully! Lock: ${lockTx.hash.slice(0, 10)}... Unlock: ${selfUnlockTx.hash.slice(0, 10)}...` 
      })
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
        
        toast({ 
          title: "Bridge Successful!", 
          description: `Tokens bridged successfully! Lock: ${lockTx.hash.slice(0, 10)}... Unlock: ${unlockTx.hash.slice(0, 10)}...` 
        })
      } catch (unlockError: any) {
        console.log("Both unlock methods failed:", unlockError)
        throw new Error(`Failed to unlock tokens: ${unlockError?.shortMessage || unlockError?.message || "Unknown error"}`)
      }
    }
  }

  return (
    <>
      {/* Instructions */}
      <div className="w-full max-w-[560px] mx-auto mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <h3 className="text-sm font-medium text-blue-600 mb-2">How to use the bridge:</h3>
        <ol className="text-xs text-blue-500 space-y-1">
          <li>1. Connect your wallet and ensure you're on the correct network</li>
          <li>2. Select the source and destination networks</li>
          <li>3. Enter the amount of BAZ tokens to bridge</li>
          <li>4. Click "Bridge" to start the process</li>
          <li>5. Approve and confirm the transactions</li>
          <li>6. Wait for network switch and unlock confirmation</li>
        </ol>
        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-600">
            <strong>Note:</strong> Bridge contracts must have sufficient BAZ tokens to unlock. 
            If bridging fails, contact support to fund the bridge contracts.
          </p>
        </div>
      </div>

      <div
        className={cn(
          "w-full max-w-[560px] mx-auto",
          "rounded-3xl border border-border/50 bg-background/10 backdrop-blur-md",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_10px_40px_-12px_rgba(0,0,0,0.45)]",
        )}
      >
        {/* From */}
        <div className="p-5 md:p-6">
          <div className="text-sm font-medium text-foreground">From</div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Connected: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Select value={fromNetwork} onValueChange={handleFromNetworkChange}>
                <SelectTrigger className="h-11 w-[180px] rounded-xl bg-background/30 border-border/40">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent align="start" className="bg-background/95 backdrop-blur-md">
                  {NETWORKS.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1" />
              <Input
                value={fromAmount}
                onChange={(e) => handleFromAmount(e.target.value)}
                placeholder="0"
                className="h-11 w-[140px] text-right rounded-xl bg-background/30 border-border/40"
              />
            </div>
            <div className="text-xs text-muted-foreground">{fromAmount || "0"} BAZ</div>
            {chainId && (
              <div className="text-xs text-muted-foreground">
                Current network: {chainId === 39 ? "U2U" : chainId === 11155111 ? "Sepolia" : "Celo Sepolia Testnet"}
              </div>
            )}
          </div>
        </div>

        <div className="h-px w-full bg-border/40" />

        {/* To */}
        <div className="p-5 md:p-6">
          <div className="text-sm font-medium text-foreground">To</div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            {/* <Input
              placeholder="To account (e.g., 0x...)"
              className="h-11 rounded-xl bg-background/30 border-border/40"
            /> */}
            <div className="flex items-center justify-between gap-3">
              <Select value={toNetwork} onValueChange={handleToNetworkChange}>
                <SelectTrigger className="h-11 w-[180px] rounded-xl bg-background/30 border-border/40">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent align="start" className="bg-background/95 backdrop-blur-md">
                  {NETWORKS.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1" />
              <Input
                value={toAmount}
                onChange={(e) => handleFromAmount(e.target.value)}
                placeholder="0"
                className="h-11 w-[140px] text-right rounded-xl bg-background/30 border-border/40"
              />
            </div>
            <div className="text-xs text-muted-foreground">{toAmount || "0"} BAZ</div>
          </div>
        </div>

        {/* Network Validation Warning */}
        {chainId && (
          <div className="px-5 md:px-6 pb-3">
            {((fromNetwork === "u2u" && chainId !== 39) || (fromNetwork === "sepolia" && chainId !== 11155111)) && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-600">
                <div className="flex items-center justify-between">
                  <span>🔄 Network will be switched automatically to {fromNetwork === "u2u" ? "U2U" : "Sepolia"} when you click Bridge</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => switchToNetwork(fromNetwork)}
                    className="ml-2 h-6 px-2 text-xs"
                  >
                    Switch Now
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 p-5 md:p-6">
          <Button variant="secondary" className="rounded-xl bg-background/30 text-foreground">
            Cancel
          </Button>
          <Button
            onClick={() => onBridge(fromAmount)}
            disabled={busy || !address || !fromAmount || parseFloat(fromAmount) <= 0}
            className={cn("rounded-xl", "bg-[oklch(var(--primary))] text-[oklch(var(--primary-foreground))]")}
          >
            {busy ? "Bridging..." : "Bridge"}
          </Button>
        </div>
      </div>

      {/* Scratch modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border border-border/50 bg-background/20 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Congratulations</DialogTitle>
            <DialogDescription className="text-muted-foreground">Scratch to reveal your BAZ reward</DialogDescription>
          </DialogHeader>
          <div className="flex w-full justify-center py-2">
            <ScratchCard
              rewardText={`${reward} BAZ`}
              width={360}
              height={200}
              onRevealComplete={() => setCanClaim(true)}
            />
            
          </div>
          <Button
                          className={cn(
                            "mt-2 w-full",
                            canClaim
                              ? "bg-pink-600 hover:bg-pink-500 text-white"
                              : "bg-muted text-muted-foreground cursor-not-allowed",
                          )}
                          disabled={!canClaim}
                          onClick={() => handleClaim(reward)}
                        >
                          Claim
                        </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BridgeBox
