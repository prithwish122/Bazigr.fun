import { Button } from "@/app/components/ui/button"
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react"
import { Coins, HelpCircle, Crown } from "lucide-react"
import { useWriteContract } from "wagmi"
import propabi from "@/app/contract/abi.json"
import { toast } from "sonner"


export function Navbar() {
     const { address ,isConnected } = useAppKitAccount() // AppKit hook to get the address and check if the user is connected
    const { chainId } = useAppKitNetwork() // to get chainid
    const { writeContract, isSuccess } = useWriteContract() // to in

    // const contract_address = "0xdCe18eF3f99F35F6cb93d1C408367f6B5C4790A7" 
    const contract_address = "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9" 

    // replace with your contract address

    const handleClaim = () => {
      console.log("Claiming 10 BAZ tokens to address:", address);
      writeContract({
      abi: propabi,
      functionName: "mint",
      address: contract_address,
      args: [address, "10"], // minting 10 tokens to the connected address
    })
    // toast(`Withdrawal Successful: 10 BAZ tokens have been withdrawn to your wallet.`)
    }

  return (
    <header className="flex items-center justify-end px-6 py-4 relative z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md bg-black/40 border border-yellow-500/30">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-yellow-400">10</span>
        </div>

        <Button
          size="sm"
          className="bg-[#C71585] hover:bg-[#B31373] text-white font-medium text-xs px-4 border-0 rounded-lg"
          onClick={handleClaim}
        >
          claim now
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="text-white/80 hover:text-white hover:bg-white/10 text-xs backdrop-blur-md bg-black/20 rounded-lg"
        >
          <HelpCircle className="w-4 h-4 mr-1" />
          Help
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="border-white/20 text-white/80 hover:bg-white/10 bg-black/20 backdrop-blur-md text-xs rounded-lg"
        >
          <Crown className="w-4 h-4 mr-1" />
          Upgrade to Pro
        </Button>
      </div>
    </header>
  )
}
