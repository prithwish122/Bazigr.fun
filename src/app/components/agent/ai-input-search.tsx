"use client";

/**
 * @author: @kokonutui
 * @description: AI Input Search
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Globe, Paperclip, Send } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Textarea } from "@/app/components/ui/textarea";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/app/lib/utils";
import { useAutoResizeTextarea } from "@/app/hooks/use-auto-resize-textarea";
import { useWriteContract, usePublicClient } from "wagmi";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "@/app/toasts/use-toast";
import tokenAbi from "@/app/contract/abi.json";
import swapAbi from "@/app/contract/swap-abi.json";

type Props = {
    onSubmit?: (text: string) => void | Promise<void>
    placeholder?: string
}

export default function AI_Input_Search({ onSubmit, placeholder }: Props) {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 52,
        maxHeight: 200,
    });
    const [showSearch, setShowSearch] = useState(true);
    const [isFocused, setIsFocused] = useState(false);

    const { address, isConnected } = useAppKitAccount();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();

    // Deployed addresses on CELO
    const TOKEN_ADDRESS = useMemo(() => (
        "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9" as `0x${string}`
    ), []);
    const SWAP_ADDRESS = useMemo(() => (
        "0xfE053B49CE20845E6c492A575daCDD5ab7d3038D" as `0x${string}`
    ), []);
    const RATE = 20n;

    const parseAmountToWei = useCallback((amt: string): bigint => {
        const cleaned = (amt || "0").trim();
        const parts = cleaned.split(".");
        const whole = BigInt(parts[0] || "0");
        const frac = (parts[1] || "").replace(/[^0-9]/g, "").padEnd(18, "0").slice(0, 18);
        return whole * 10n ** 18n + BigInt(frac || "0");
    }, []);

    const parseIntent = useCallback((input: string) => {
        const text = input.toLowerCase();
        const addressMatch = input.match(/0x[a-fA-F0-9]{40}/);
        const amountMatch = input.match(/(\d+\.?\d*)/);
        const hasSwap = /(swap|exchange)/.test(text);
        const hasBridge = /(bridge)/.test(text);
        const hasSend = /(send|transfer)/.test(text);
        const toBaz = /(to\s+baz|for\s+baz|baz)/.test(text);
        const toU2U = /(to\s+u2u|for\s+u2u|u2u)/.test(text);

        const to = (addressMatch ? addressMatch[0] : undefined) as `0x${string}` | undefined;
        const amount = amountMatch ? amountMatch[1] : undefined;

        if (hasSwap) {
            // default direction if ambiguous: U2U -> BAZ when both tokens present
            const from = toU2U && !toBaz ? "U2U" : (!toU2U && toBaz ? "BAZ" : (text.includes("from baz") ? "BAZ" : "U2U"));
            const dest = from === "U2U" ? "BAZ" : "U2U";
            return { kind: "swap" as const, from, toToken: dest, amount };
        }
        if (hasBridge) {
            return { kind: "bridge" as const, to, amount };
        }
        if (hasSend) {
            // If mentions BAZ, use token send; else default to native U2U
            const token = toBaz ? "BAZ" : (text.includes("token baz") ? "BAZ" : undefined);
            return { kind: "send" as const, to, amount, token };
        }
        return { kind: "unknown" as const };
    }, []);

    const handleSubmit = async () => {
        const input = value.trim();
        if (!input) return;
        // If parent provided onSubmit (chat mode), delegate to it
        if (onSubmit) {
            try { await onSubmit(input); } catch {}
            setValue("");
            adjustHeight(true);
            return;
        }

        if (!isConnected || !address) {
            toast({ title: "Wallet not connected", description: "Connect your wallet to perform actions." });
            return;
        }

        const intent = parseIntent(input);
        try {
            if (intent.kind === "swap") {
                if (!intent.amount) throw new Error("No amount found");
                const wei = parseAmountToWei(intent.amount);
                if (intent.from === "U2U") {
                    // U2U -> BAZ
                    if (publicClient) {
                        try {
                            await publicClient.estimateContractGas({
                                abi: (swapAbi as any).abi || (swapAbi as any),
                                functionName: "swapNativeForBaz",
                                address: SWAP_ADDRESS,
                                args: [],
                                value: wei,
                                account: address as `0x${string}`,
                            });
                        } catch {}
                    }
                    const hash = await writeContractAsync({
                        abi: (swapAbi as any).abi || (swapAbi as any),
                        functionName: "swapNativeForBaz",
                        address: SWAP_ADDRESS,
                        args: [],
                        value: wei,
                    });
                    if (publicClient) await publicClient.waitForTransactionReceipt({ hash });
                    toast({ title: "Swap submitted", description: `Swapped ${intent.amount} U2U → ${Number(intent.amount) * 20} BAZ` });
                } else {
                    // BAZ -> U2U
                    if (publicClient) {
                        try {
                            await publicClient.estimateContractGas({
                                abi: tokenAbi as any,
                                functionName: "approve",
                                address: TOKEN_ADDRESS,
                                args: [SWAP_ADDRESS, wei],
                                account: address as `0x${string}`,
                            });
                        } catch {}
                    }
                    const approveHash = await writeContractAsync({
                        abi: tokenAbi as any,
                        functionName: "approve",
                        address: TOKEN_ADDRESS,
                        args: [SWAP_ADDRESS, wei],
                    });
                    if (publicClient) await publicClient.waitForTransactionReceipt({ hash: approveHash });

                    const swapHash = await writeContractAsync({
                        abi: (swapAbi as any).abi || (swapAbi as any),
                        functionName: "swapBazForNative",
                        address: SWAP_ADDRESS,
                        args: [wei],
                    });
                    if (publicClient) await publicClient.waitForTransactionReceipt({ hash: swapHash });
                    toast({ title: "Swap submitted", description: `Swapped ${intent.amount} BAZ → ${(Number(intent.amount) / 20).toString()} U2U` });
                }
            } else if (intent.kind === "bridge") {
                if (!intent.to) throw new Error("No recipient address found");
                if (!intent.amount) throw new Error("No amount found");
                // Bazigr.bridge expects whole tokens (multiplies by 1e18 internally)
                const txHash = await writeContractAsync({
                    abi: tokenAbi as any,
                    functionName: "bridge",
                    address: TOKEN_ADDRESS,
                    args: [intent.to, intent.amount],
                });
                if (publicClient) await publicClient.waitForTransactionReceipt({ hash: txHash });
                toast({ title: "Bridge submitted", description: `Bridging ${intent.amount} BAZ to ${intent.to}` });
            } else if (intent.kind === "send") {
                if (!intent.to) throw new Error("No recipient address found");
                if (!intent.amount) throw new Error("No amount found");
                if (/(baz)/.test(value.toLowerCase()) || intent.token === "BAZ") {
                    // Bazigr.send expects whole tokens (multiplies by 1e18 internally)
                    const txHash = await writeContractAsync({
                        abi: tokenAbi as any,
                        functionName: "send",
                        address: TOKEN_ADDRESS,
                        args: [intent.to, intent.amount],
                    });
                    if (publicClient) await publicClient.waitForTransactionReceipt({ hash: txHash });
                    toast({ title: "Token sent", description: `Sent ${intent.amount} BAZ to ${intent.to}` });
                } else {
                    // Native U2U send
                    const wei = parseAmountToWei(intent.amount);
                    if (!publicClient) throw new Error("No client");
                    const hash = await publicClient.sendTransaction({
                        account: address as `0x${string}`,
                        to: intent.to,
                        value: wei,
                    });
                    await publicClient.waitForTransactionReceipt({ hash });
                    toast({ title: "U2U sent", description: `Sent ${intent.amount} U2U to ${intent.to}` });
                }
            } else {
                toast({ title: "Unrecognized instruction", description: "Try: swap 1 U2U to BAZ, send 5 BAZ to 0x..., bridge 10 BAZ to 0x..." });
                return;
            }
        } catch (err: any) {
            toast({ title: "Action failed", description: err?.shortMessage || err?.message || "Transaction failed" });
        } finally {
            setValue("");
            adjustHeight(true);
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleContainerClick = () => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    return (
        <div className="w-full py-4">
            <div className="relative max-w-xl w-full mx-auto">
                <div
                    role="textbox"
                    tabIndex={0}
                    aria-label="Search input container"
                    className={cn(
                        "relative flex flex-col rounded-xl transition-all duration-200 w-full text-left cursor-text",
                        "ring-1 ring-black/10 dark:ring-white/10",
                        isFocused && "ring-black/20 dark:ring-white/20"
                    )}
                    onClick={handleContainerClick}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            handleContainerClick();
                        }
                    }}
                >
                    <div className="overflow-y-auto max-h-[200px]">
                        <Textarea
                            id="ai-input-04"
                            value={value}
                            placeholder={placeholder ?? "Type a command…"}
                            className="w-full rounded-xl rounded-b-none px-4 py-3 bg-black/5 dark:bg-white/5 border-none dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 leading-[1.2]"
                            ref={textareaRef}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                        />
                    </div>

                    <div className="h-12 bg-black/5 dark:bg-white/5 rounded-b-xl">
                        <div className="absolute left-3 bottom-3 flex items-center gap-2">
                            <label className="cursor-pointer rounded-lg p-2 bg-black/5 dark:bg-white/5">
                                <input type="file" className="hidden" />
                                <Paperclip className="w-4 h-4 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors" />
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSearch(!showSearch);
                                }}
                                className={cn(
                                    "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8 cursor-pointer",
                                    showSearch
                                        ? "bg-sky-500/15 border-sky-400 text-sky-500"
                                        : "bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white "
                                )}
                            >
                                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    <motion.div
                                        animate={{
                                            rotate: showSearch ? 180 : 0,
                                            scale: showSearch ? 1.1 : 1,
                                        }}
                                        whileHover={{
                                            rotate: showSearch ? 180 : 15,
                                            scale: 1.1,
                                            transition: {
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 10,
                                            },
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 25,
                                        }}
                                    >
                                        <Globe
                                            className={cn(
                                                "w-4 h-4",
                                                showSearch
                                                    ? "text-sky-500"
                                                    : "text-inherit"
                                            )}
                                        />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {showSearch && (
                                        <motion.span
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{
                                                width: "auto",
                                                opacity: 1,
                                            }}
                                            exit={{ width: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-sm overflow-hidden whitespace-nowrap text-sky-500 shrink-0"
                                        >
                                            Search
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                        <div className="absolute right-3 bottom-3">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className={cn(
                                    "rounded-lg p-2 transition-colors",
                                    value
                                        ? "bg-sky-500/15 text-sky-500"
                                        : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white cursor-pointer"
                                )}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
