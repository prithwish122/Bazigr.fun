"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { useToast } from "@/app/components/ui/use-toast";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseUnits, formatUnits, type Address } from "viem";
import { DEFI_CONTRACTS, DEFI_CONFIG } from "@/app/contract/defi-config";
import ROUTER_ABI from "@/app/contract/router-abi.json";
import MASTERCHEF_ABI from "@/app/contract/masterchef-abi.json";
import PAIR_ABI from "@/app/contract/pair-abi.json";
import WCELO_ABI from "@/app/contract/wcelo-abi.json";

const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default function DeFiPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();

  // Balances
  const [bazBalance, setBazBalance] = useState("0");
  const [wceloBalance, setWceloBalance] = useState("0");
  const [celoBalance, setCeloBalance] = useState("0");
  const [lpBalance, setLpBalance] = useState("0");

  // Liquidity state
  const [bazAmount, setBazAmount] = useState("");
  const [wceloAmount, setWceloAmount] = useState("");
  const [removeLpAmount, setRemoveLpAmount] = useState("");

  // Swap state
  const [swapFromToken, setSwapFromToken] = useState<"BAZ" | "WCELO">("BAZ");
  const [swapFromAmount, setSwapFromAmount] = useState("");
  const [swapToAmount, setSwapToAmount] = useState("");

  // Farm state
  const [stakedAmount, setStakedAmount] = useState("0");
  const [pendingRewards, setPendingRewards] = useState("0");
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  // Pool info
  const [poolReserves, setPoolReserves] = useState({ baz: "0", wcelo: "0" });
  const [totalStaked, setTotalStaked] = useState("0");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Fetch balances and pool data
  useEffect(() => {
    if (!isConnected || !address || !publicClient) return;

    const fetchData = async () => {
      try {
        // Fetch balances
        const [baz, wcelo, celo, lp] = await Promise.all([
          publicClient.readContract({
            address: DEFI_CONTRACTS.BAZ_TOKEN as Address,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address],
          }),
          publicClient.readContract({
            address: DEFI_CONTRACTS.WCELO as Address,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address],
          }),
          publicClient.getBalance({ address }),
          publicClient.readContract({
            address: DEFI_CONTRACTS.BAZ_WCELO_PAIR as Address,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address],
          }),
        ]);

        setBazBalance(formatUnits(baz, 18));
        setWceloBalance(formatUnits(wcelo, 18));
        setCeloBalance(formatUnits(celo, 18));
        setLpBalance(formatUnits(lp, 18));

        // Fetch pool reserves
        const reserves = await publicClient.readContract({
          address: DEFI_CONTRACTS.BAZ_WCELO_PAIR as Address,
          abi: PAIR_ABI,
          functionName: "getReserves",
        });

        const token0 = await publicClient.readContract({
          address: DEFI_CONTRACTS.BAZ_WCELO_PAIR as Address,
          abi: PAIR_ABI,
          functionName: "token0",
        });

        const isBazToken0 = (token0 as string).toLowerCase() === DEFI_CONTRACTS.BAZ_TOKEN.toLowerCase();
        const [reserve0, reserve1] = reserves as [bigint, bigint, number];
        setPoolReserves({
          baz: formatUnits(isBazToken0 ? reserve0 : reserve1, 18),
          wcelo: formatUnits(isBazToken0 ? reserve1 : reserve0, 18),
        });

        // Fetch farming data
        const [userStaked, pending, poolTotalStaked] = await Promise.all([
          publicClient.readContract({
            address: DEFI_CONTRACTS.MASTERCHEF as Address,
            abi: MASTERCHEF_ABI,
            functionName: "getUserStaked",
            args: [BigInt(0), address],
          }),
          publicClient.readContract({
            address: DEFI_CONTRACTS.MASTERCHEF as Address,
            abi: MASTERCHEF_ABI,
            functionName: "pendingBAZ",
            args: [BigInt(0), address],
          }),
          publicClient.readContract({
            address: DEFI_CONTRACTS.MASTERCHEF as Address,
            abi: MASTERCHEF_ABI,
            functionName: "getPoolTotalStaked",
            args: [BigInt(0)],
          }),
        ]);
        setStakedAmount(formatUnits(userStaked as bigint, 18));
        setPendingRewards(formatUnits(pending as bigint, 18));
        setTotalStaked(formatUnits(poolTotalStaked as bigint, 18));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [isConnected, address, publicClient]);

  // Calculate swap output
  useEffect(() => {
    if (!swapFromAmount || !publicClient || parseFloat(poolReserves.baz) === 0) {
      setSwapToAmount("");
      return;
    }

    const calculateOutput = async () => {
      try {
        const amountIn = parseUnits(swapFromAmount, 18);
        const path = swapFromToken === "BAZ"
          ? [DEFI_CONTRACTS.BAZ_TOKEN, DEFI_CONTRACTS.WCELO]
          : [DEFI_CONTRACTS.WCELO, DEFI_CONTRACTS.BAZ_TOKEN];

        const amounts = await publicClient.readContract({
          address: DEFI_CONTRACTS.ROUTER as Address,
          abi: ROUTER_ABI,
          functionName: "getAmountsOut",
          args: [amountIn, path as Address[]],
        });

        setSwapToAmount(formatUnits((amounts as bigint[])[1], 18));
      } catch (error) {
        console.error("Error calculating swap:", error);
        setSwapToAmount("");
      }
    };

    calculateOutput();
  }, [swapFromAmount, swapFromToken, poolReserves, publicClient]);

  // Wrap CELO to WCELO
  const handleWrapCelo = async () => {
    if (!walletClient || !address) return;
    
    try {
      setIsLoading(true);
      const amount = parseUnits(wceloAmount, 18);

      const hash = await walletClient.writeContract({
        address: DEFI_CONTRACTS.WCELO as Address,
        abi: WCELO_ABI,
        functionName: "deposit",
        value: amount,
      });

      toast({
        title: "Wrapping CELO...",
        description: `Transaction: ${hash}`,
      });

      await publicClient!.waitForTransactionReceipt({ hash });
      
      toast({
        title: "Success!",
        description: "CELO wrapped successfully",
      });
      
      setWceloAmount("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to wrap CELO",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add liquidity
  const handleAddLiquidity = async () => {
    if (!walletClient || !address) return;

    try {
      setIsLoading(true);
      const bazAmt = parseUnits(bazAmount, 18);
      const wceloAmt = parseUnits(wceloAmount, 18);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 minutes

      // Approve tokens
      const bazApproveHash = await walletClient.writeContract({
        address: DEFI_CONTRACTS.BAZ_TOKEN as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [DEFI_CONTRACTS.ROUTER as Address, bazAmt],
      });

      await publicClient!.waitForTransactionReceipt({ hash: bazApproveHash });

      const wceloApproveHash = await walletClient.writeContract({
        address: DEFI_CONTRACTS.WCELO as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [DEFI_CONTRACTS.ROUTER as Address, wceloAmt],
      });

      await publicClient!.waitForTransactionReceipt({ hash: wceloApproveHash });

      // Add liquidity
      const hash = await walletClient.writeContract({
        address: DEFI_CONTRACTS.ROUTER as Address,
        abi: ROUTER_ABI,
        functionName: "addLiquidity",
        args: [
          DEFI_CONTRACTS.BAZ_TOKEN as Address,
          DEFI_CONTRACTS.WCELO as Address,
          bazAmt,
          wceloAmt,
          (bazAmt * BigInt(95)) / BigInt(100), // 5% slippage
          (wceloAmt * BigInt(95)) / BigInt(100),
          address,
          deadline,
        ],
      });

      toast({
        title: "Adding Liquidity...",
        description: `Transaction: ${hash}`,
      });

      await publicClient!.waitForTransactionReceipt({ hash });

      toast({
        title: "Success!",
        description: "Liquidity added successfully",
      });

      setBazAmount("");
      setWceloAmount("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add liquidity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove liquidity
  const handleRemoveLiquidity = async () => {
    if (!walletClient || !address) return;

    try {
      setIsLoading(true);
      const lpAmt = parseUnits(removeLpAmount, 18);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

      // Approve LP tokens
      const approveHash = await walletClient.writeContract({
        address: DEFI_CONTRACTS.BAZ_WCELO_PAIR as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [DEFI_CONTRACTS.ROUTER as Address, lpAmt],
      });

      await publicClient!.waitForTransactionReceipt({ hash: approveHash });

      // Remove liquidity
      const hash = await walletClient.writeContract({
        address: DEFI_CONTRACTS.ROUTER as Address,
        abi: ROUTER_ABI,
        functionName: "removeLiquidity",
        args: [
          DEFI_CONTRACTS.BAZ_TOKEN as Address,
          DEFI_CONTRACTS.WCELO as Address,
          lpAmt,
          BigInt(0),
          BigInt(0),
          address,
          deadline,
        ],
      });

      toast({
        title: "Removing Liquidity...",
        description: `Transaction: ${hash}`,
      });

      await publicClient!.waitForTransactionReceipt({ hash });

      toast({
        title: "Success!",
        description: "Liquidity removed successfully",
      });

      setRemoveLpAmount("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove liquidity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Swap tokens
  const handleSwap = async () => {
    if (!walletClient || !address) return;

    try {
      setIsLoading(true);
      const amountIn = parseUnits(swapFromAmount, 18);
      const amountOutMin = parseUnits(swapToAmount, 18);
      const slippageAmount = (amountOutMin * BigInt(95)) / BigInt(100); // 5% slippage
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

      const tokenIn = swapFromToken === "BAZ" ? DEFI_CONTRACTS.BAZ_TOKEN : DEFI_CONTRACTS.WCELO;
      const path = swapFromToken === "BAZ"
        ? [DEFI_CONTRACTS.BAZ_TOKEN, DEFI_CONTRACTS.WCELO]
        : [DEFI_CONTRACTS.WCELO, DEFI_CONTRACTS.BAZ_TOKEN];

      // Approve
      const approveHash = await walletClient.writeContract({
        address: tokenIn as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [DEFI_CONTRACTS.ROUTER as Address, amountIn],
      });

      await publicClient!.waitForTransactionReceipt({ hash: approveHash });

      // Swap
      const hash = await walletClient.writeContract({
        address: DEFI_CONTRACTS.ROUTER as Address,
        abi: ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        args: [amountIn, slippageAmount, path as Address[], address, deadline],
      });

      toast({
        title: "Swapping...",
        description: `Transaction: ${hash}`,
      });

      await publicClient!.waitForTransactionReceipt({ hash });

      toast({
        title: "Success!",
        description: "Swap completed successfully",
      });

      setSwapFromAmount("");
      setSwapToAmount("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to swap",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Stake LP tokens
  const handleStake = async () => {
    if (!walletClient || !address) return;

    try {
      setIsLoading(true);
      const amount = parseUnits(stakeAmount, 18);

      // Approve
      const approveHash = await walletClient.writeContract({
        address: DEFI_CONTRACTS.BAZ_WCELO_PAIR as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [DEFI_CONTRACTS.MASTERCHEF as Address, amount],
      });

      await publicClient!.waitForTransactionReceipt({ hash: approveHash });

      // Stake
      const hash = await walletClient.writeContract({
        address: DEFI_CONTRACTS.MASTERCHEF as Address,
        abi: MASTERCHEF_ABI,
        functionName: "deposit",
        args: [BigInt(0), amount],
      });

      toast({
        title: "Staking...",
        description: `Transaction: ${hash}`,
      });

      await publicClient!.waitForTransactionReceipt({ hash });

      toast({
        title: "Success!",
        description: "LP tokens staked successfully",
      });

      setStakeAmount("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to stake",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Unstake LP tokens
  const handleUnstake = async () => {
    if (!walletClient || !address) return;

    try {
      setIsLoading(true);
      const amount = parseUnits(unstakeAmount, 18);

      const hash = await walletClient.writeContract({
        address: DEFI_CONTRACTS.MASTERCHEF as Address,
        abi: MASTERCHEF_ABI,
        functionName: "withdraw",
        args: [BigInt(0), amount],
      });

      toast({
        title: "Unstaking...",
        description: `Transaction: ${hash}`,
      });

      await publicClient!.waitForTransactionReceipt({ hash });

      toast({
        title: "Success!",
        description: "LP tokens unstaked successfully",
      });

      setUnstakeAmount("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unstake",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Harvest rewards
  const handleHarvest = async () => {
    if (!walletClient || !address) return;

    try {
      setIsLoading(true);

      const hash = await walletClient.writeContract({
        address: DEFI_CONTRACTS.MASTERCHEF as Address,
        abi: MASTERCHEF_ABI,
        functionName: "harvest",
        args: [BigInt(0)],
      });

      toast({
        title: "Harvesting...",
        description: `Transaction: ${hash}`,
      });

      await publicClient!.waitForTransactionReceipt({ hash });

      toast({
        title: "Success!",
        description: "Rewards harvested successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to harvest",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <main className="w-full h-full p-4 md:p-6">
        <div className="w-full mb-4 md:mb-6">
          <Image src="/images/pools-banner.png" alt="Pools" width={1400} height={200} className="w-full h-auto rounded-xl" priority />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md backdrop-blur-xl bg-white/5 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Connect Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60">
                Please connect your wallet to access DeFi features
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full h-full p-4 md:p-6">
      {/* Banner */}
      <div className="w-full mb-4 md:mb-6">
        <Image src="/images/pools-banner.png" alt="Pools" width={1400} height={200} className="w-full h-auto rounded-xl" priority />
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white/90">Bazigr DeFi</h1>
          <p className="text-white/60">
            Swap, provide liquidity, and earn rewards on Celo
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/60">
                BAZ Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{parseFloat(bazBalance).toFixed(4)}</p>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/60">
                WCELO Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{parseFloat(wceloBalance).toFixed(4)}</p>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/60">
                LP Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{parseFloat(lpBalance).toFixed(4)}</p>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/60">
                CELO Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-white">{parseFloat(celoBalance).toFixed(4)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="liquidity" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="swap">Swap</TabsTrigger>
            <TabsTrigger value="farm">Farm</TabsTrigger>
          </TabsList>

          {/* Liquidity Tab */}
          <TabsContent value="liquidity" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Add Liquidity */}
              <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Add Liquidity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">BAZ Amount</label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={bazAmount}
                      onChange={(e) => setBazAmount(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <p className="text-xs text-white/50">
                      Balance: {parseFloat(bazBalance).toFixed(4)} BAZ
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">WCELO Amount</label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={wceloAmount}
                      onChange={(e) => setWceloAmount(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <p className="text-xs text-white/50">
                      Balance: {parseFloat(wceloBalance).toFixed(4)} WCELO
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleWrapCelo}
                      variant="outline"
                      disabled={isLoading || !wceloAmount}
                      className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      Wrap CELO
                    </Button>
                    <Button
                      onClick={handleAddLiquidity}
                      disabled={isLoading || !bazAmount || !wceloAmount}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                    >
                      Add Liquidity
                    </Button>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/60">Pool Reserves:</p>
                    <p className="text-sm text-white/80">BAZ: {parseFloat(poolReserves.baz).toFixed(2)}</p>
                    <p className="text-sm text-white/80">WCELO: {parseFloat(poolReserves.wcelo).toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Remove Liquidity */}
              <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Remove Liquidity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">LP Token Amount</label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={removeLpAmount}
                      onChange={(e) => setRemoveLpAmount(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <p className="text-xs text-white/50">
                      Balance: {parseFloat(lpBalance).toFixed(4)} LP
                    </p>
                  </div>
                  <Button
                    onClick={handleRemoveLiquidity}
                    disabled={isLoading || !removeLpAmount}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  >
                    Remove Liquidity
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Swap Tab */}
          <TabsContent value="swap">
            <Card className="max-w-2xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Swap Tokens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">From</label>
                  <div className="flex gap-2">
                    <select
                      className="px-3 py-2 border rounded-md bg-white/5 border-white/10 text-white"
                      value={swapFromToken}
                      onChange={(e) => setSwapFromToken(e.target.value as "BAZ" | "WCELO")}
                    >
                      <option value="BAZ">BAZ</option>
                      <option value="WCELO">WCELO</option>
                    </select>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={swapFromAmount}
                      onChange={(e) => setSwapFromAmount(e.target.value)}
                      className="flex-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <p className="text-xs text-white/50">
                    Balance: {swapFromToken === "BAZ" ? parseFloat(bazBalance).toFixed(4) : parseFloat(wceloBalance).toFixed(4)}
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSwapFromToken(swapFromToken === "BAZ" ? "WCELO" : "BAZ")}
                    className="text-white hover:bg-white/10"
                  >
                    ↓
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">To</label>
                  <div className="flex gap-2">
                    <div className="px-3 py-2 border rounded-md bg-white/10 border-white/10 text-white/80">
                      {swapFromToken === "BAZ" ? "WCELO" : "BAZ"}
                    </div>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={swapToAmount}
                      disabled
                      className="flex-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                {swapToAmount && (
                  <div className="p-3 bg-white/10 rounded-md text-sm text-white/80">
                    <p>Rate: 1 {swapFromToken} ≈ {(parseFloat(swapToAmount) / parseFloat(swapFromAmount)).toFixed(6)} {swapFromToken === "BAZ" ? "WCELO" : "BAZ"}</p>
                    <p className="text-xs text-white/50 mt-1">
                      Trading fee: {DEFI_CONFIG.TRADING_FEE * 100}%
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleSwap}
                  disabled={isLoading || !swapFromAmount || !swapToAmount}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  Swap
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Farm Tab */}
          <TabsContent value="farm" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Stake */}
              <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Stake LP Tokens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white/10 rounded-md space-y-2">
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Your Staked:</span>
                      <span className="font-medium">{parseFloat(stakedAmount).toFixed(4)} LP</span>
                    </div>
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Pending Rewards:</span>
                      <span className="font-medium text-green-400">{parseFloat(pendingRewards).toFixed(4)} BAZ</span>
                    </div>
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Total Pool Staked:</span>
                      <span className="font-medium">{parseFloat(totalStaked).toFixed(2)} LP</span>
                    </div>
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Reward Rate:</span>
                      <span className="font-medium">{DEFI_CONFIG.REWARD_PER_BLOCK} BAZ/block</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Stake Amount</label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <p className="text-xs text-white/50">
                      Available: {parseFloat(lpBalance).toFixed(4)} LP
                    </p>
                  </div>

                  <Button
                    onClick={handleStake}
                    disabled={isLoading || !stakeAmount}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    Stake LP Tokens
                  </Button>
                </CardContent>
              </Card>

              {/* Unstake & Harvest */}
              <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Manage Stake</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Unstake Amount</label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <p className="text-xs text-white/50">
                      Staked: {parseFloat(stakedAmount).toFixed(4)} LP
                    </p>
                  </div>

                  <Button
                    onClick={handleUnstake}
                    disabled={isLoading || !unstakeAmount}
                    className="w-full bg-white/10 border border-white/10 text-white hover:bg-white/20"
                  >
                    Unstake
                  </Button>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white/80">Pending Rewards</span>
                      <span className="text-lg font-bold text-green-400">
                        {parseFloat(pendingRewards).toFixed(4)} BAZ
                      </span>
                    </div>
                    <Button
                      onClick={handleHarvest}
                      disabled={isLoading || parseFloat(pendingRewards) === 0}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      Harvest Rewards
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-white/10 text-xs text-white/50 space-y-1">
                    <p>• APR varies based on pool size and reward rate</p>
                    <p>• Rewards accrue every block (~5 seconds)</p>
                    <p>• No lock-up period, unstake anytime</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
