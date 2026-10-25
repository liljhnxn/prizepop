"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { prizePopAbi } from "@/lib/abi";
import { Header } from "@/components/Header";
import { DrawCard } from "@/components/DrawCard";
import { ParticipantList } from "@/components/ParticipantList";
import { WinnerSection } from "@/components/WinnerSection";
import { OwnerControls } from "@/components/OwnerControls";
import { Footer } from "@/components/Footer";
import { AlertCircle, Terminal, RefreshCw } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

export default function Home() {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as
    | `0x${string}`
    | undefined;

  const { address } = useAccount();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Read multiple view methods from contract
  const {
    data: contractData,
    isLoading: isLoadingData,
    refetch: refetchContractData,
  } = useReadContracts({
    contracts: [
      {
        address: contractAddress,
        abi: prizePopAbi,
        functionName: "owner",
      },
      {
        address: contractAddress,
        abi: prizePopAbi,
        functionName: "getDrawStatus",
      },
      {
        address: contractAddress,
        abi: prizePopAbi,
        functionName: "getParticipantCount",
      },
      {
        address: contractAddress,
        abi: prizePopAbi,
        functionName: "getAllParticipants",
      },
      {
        address: contractAddress,
        abi: prizePopAbi,
        functionName: "getWinner",
      },
      {
        address: contractAddress,
        abi: prizePopAbi,
        functionName: "isDrawFinalized",
      },
    ],
    query: {
      enabled: Boolean(contractAddress),
      refetchInterval: 10000, // Background poll every 10s
    },
  });

  // Check if current connected user has entered
  const { data: hasUserEnteredData, refetch: refetchUserEntered } =
    useReadContract({
      address: contractAddress,
      abi: prizePopAbi,
      functionName: "checkHasEntered",
      args: address ? [address] : undefined,
      query: {
        enabled: Boolean(contractAddress && address),
      },
    });

  // Extract values
  const contractOwner = contractData?.[0]?.result as `0x${string}` | undefined;
  const drawStatus = contractData?.[1]?.result !== undefined
    ? Number(contractData[1].result)
    : undefined;
  const participantCount = contractData?.[2]?.result
    ? Number(contractData[2].result)
    : 0;
  const participants = (contractData?.[3]?.result as readonly `0x${string}`[]) || [];
  const winner = contractData?.[4]?.result as `0x${string}` | undefined;
  const isFinalized = Boolean(contractData?.[5]?.result);
  const hasUserEntered = Boolean(hasUserEnteredData);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refetchContractData(), refetchUserEntered()]);
    setTimeout(() => setIsRefreshing(false), 600);
  }, [refetchContractData, refetchUserEntered]);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30 selection:text-white">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* If contract address is missing, show helpful onboarding setup banner */}
        {!contractAddress && (
          <div className="bg-card border-2 border-primary/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-primary/20 text-primary shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-mainText mb-1">
                  Contract Address Not Configured
                </h3>
                <p className="text-sm text-mutedText mb-4 leading-relaxed">
                  To interact with the smart contract on Botchain Testnet, deploy the contract and configure your{" "}
                  <code className="text-primary font-mono bg-background px-1.5 py-0.5 rounded text-xs">
                    NEXT_PUBLIC_CONTRACT_ADDRESS
                  </code>{" "}
                  in <code className="text-secondary font-mono bg-background px-1.5 py-0.5 rounded text-xs">.env.local</code>.
                </p>

                <div className="bg-background rounded-xl p-4 border border-border text-xs font-mono space-y-2 text-mainText/90">
                  <div className="flex items-center gap-2 text-mutedText mb-1">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span>Deployment Commands:</span>
                  </div>
                  <div className="text-mutedText"># 1. Run tests</div>
                  <div className="text-secondary">npx hardhat test</div>
                  <div className="text-mutedText mt-2"># 2. Deploy to Botchain Testnet</div>
                  <div className="text-secondary">npx hardhat run scripts/deploy.js --network botchainTestnet</div>
                  <div className="text-mutedText mt-2"># 3. Add to .env.local</div>
                  <div className="text-primary">NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedAddress</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Control Bar with Quick Refresh */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-mutedText font-mono">
            <span>Contract:</span>
            {contractAddress ? (
              <span className="text-primary font-medium">
                {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
              </span>
            ) : (
              <span className="text-error">Not Configured</span>
            )}
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing || !contractAddress}
            className="flex items-center gap-1.5 text-xs text-mutedText hover:text-mainText px-3 py-1.5 rounded-lg bg-card border border-border hover:border-border/80 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-primary ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>Refresh State</span>
          </button>
        </div>

        {/* Main Draw Card */}
        <DrawCard
          contractAddress={contractAddress}
          drawStatus={drawStatus}
          participantCount={participantCount || participants.length}
          hasUserEntered={hasUserEntered}
          onRefresh={handleManualRefresh}
        />

        {/* Owner Controls (Only visible to deployer/owner) */}
        <OwnerControls
          contractAddress={contractAddress}
          contractOwner={contractOwner}
          drawStatus={drawStatus}
          participantCount={participantCount || participants.length}
          onRefresh={handleManualRefresh}
        />

        {/* Two-column layout: Participant List & Winner Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <ParticipantList
            participants={participants}
            currentUserAddress={isMounted ? address : undefined}
            isLoading={isLoadingData && !contractData}
          />

          <WinnerSection
            winner={winner}
            isFinalized={isFinalized}
            currentUserAddress={isMounted ? address : undefined}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
