"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { prizePopAbi } from "@/lib/abi";
import { Header } from "@/components/Header";
import { DrawCard } from "@/components/DrawCard";
import { ParticipantList } from "@/components/ParticipantList";
import { WinnerSection } from "@/components/WinnerSection";
import { OwnerControls } from "@/components/OwnerControls";
import { DrawHistory, HistoryItem } from "@/components/DrawHistory";
import { Footer } from "@/components/Footer";
import { AlertCircle, Terminal, RefreshCw, Trophy, Layers } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

const MULTI_ROUND_CONTRACT_ADDRESS: `0x${string}` =
  "0x48ef5c6348e349A9694579Fb1f2f8828f3a3f929";
const OLD_V1_CONTRACT_ADDRESS =
  "0xfe4998f06642223ad57e9cfa6609415c9d11e9e3";

export default function Home() {
  const envAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const contractAddress: `0x${string}` =
    envAddress && envAddress.toLowerCase() !== OLD_V1_CONTRACT_ADDRESS
      ? (envAddress as `0x${string}`)
      : MULTI_ROUND_CONTRACT_ADDRESS;

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
        functionName: "currentDrawId",
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
      {
        address: contractAddress,
        abi: prizePopAbi,
        functionName: "getDrawHistory",
      },
    ],
    query: {
      enabled: Boolean(contractAddress),
      refetchInterval: 8000, // Background poll every 8s
    },
  });

  // Check if current connected user has entered the active draw round
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
  const currentDrawId = contractData?.[1]?.result !== undefined
    ? Number(contractData[1].result)
    : 1;
  const drawStatus = contractData?.[2]?.result !== undefined
    ? Number(contractData[2].result)
    : undefined;
  const participantCount = contractData?.[3]?.result !== undefined
    ? Number(contractData[3].result)
    : 0;
  const participants = (contractData?.[4]?.result as readonly `0x${string}`[]) || [];
  const winner = contractData?.[5]?.result as `0x${string}` | undefined;
  const isFinalized = Boolean(contractData?.[6]?.result);

  // Parse history items safely
  const rawHistory = (contractData?.[7]?.result as any[]) || [];
  const history: HistoryItem[] = rawHistory.map((item: any) => ({
    drawId: Number(item.drawId),
    status: Number(item.status),
    winner: item.winner,
    isFinalized: Boolean(item.isFinalized),
    participantCount: Number(item.participantCount),
  }));

  // Identify most recent completed winner across all rounds
  const latestCompletedRound = [...history]
    .filter((r) => r.isFinalized && r.winner && r.winner !== "0x0000000000000000000000000000000000000000")
    .sort((a, b) => b.drawId - a.drawId)[0];

  const mostRecentWinner = latestCompletedRound?.winner;
  const mostRecentDrawId = latestCompletedRound?.drawId;

  const hasUserEntered = Boolean(hasUserEnteredData);
  const isOwner = Boolean(
    address &&
    contractOwner &&
    address.toLowerCase() === contractOwner.toLowerCase()
  );

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

        {/* Top Control Bar with Draw Badge & Quick Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              <Layers className="w-3 h-3" />
              Round #{currentDrawId}
            </span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing || !contractAddress}
            className="flex items-center gap-1.5 text-xs text-mutedText hover:text-mainText px-3 py-1.5 rounded-lg bg-card border border-border hover:border-border/80 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
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
          currentDrawId={currentDrawId}
          drawStatus={drawStatus}
          participantCount={participantCount || participants.length}
          hasUserEntered={hasUserEntered}
          isOwner={isOwner}
          onRefresh={handleManualRefresh}
        />

        {/* Owner Controls (Only visible to deployer/owner) */}
        <OwnerControls
          contractAddress={contractAddress}
          contractOwner={contractOwner}
          currentDrawId={currentDrawId}
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
            currentDrawId={currentDrawId}
          />

          <WinnerSection
            currentDrawId={currentDrawId}
            winner={winner}
            isFinalized={isFinalized}
            drawStatus={drawStatus}
            participantCount={participantCount || participants.length}
            mostRecentWinner={mostRecentWinner}
            mostRecentDrawId={mostRecentDrawId}
            currentUserAddress={isMounted ? address : undefined}
          />
        </div>

        {/* Consecutive Draws History Section */}
        <DrawHistory
          history={history}
          currentDrawId={currentDrawId}
          currentUserAddress={isMounted ? address : undefined}
        />
      </main>

      <Footer />
    </div>
  );
}
