// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PrizePop
 * @dev A multi-round Web3 prize draw contract deployed on Botchain Testnet.
 *
 * NOTE ON WINNER SELECTION:
 * This contract is designed as a portfolio showcase. The winner selection mechanism
 * implemented herein is purely for demonstration purposes and is NOT cryptographically secure.
 * It must NOT be used for real-money prizes, token distributions, or production drawings.
 * For production applications, integrate a verifiable randomness solution (e.g. Chainlink VRF).
 */
contract PrizePop {
    enum DrawStatus {
        Open,
        Closed,
        Completed
    }

    struct DrawRound {
        uint256 drawId;
        DrawStatus status;
        address winner;
        bool isFinalized;
    }

    struct DrawHistoryItem {
        uint256 drawId;
        DrawStatus status;
        address winner;
        bool isFinalized;
        uint256 participantCount;
    }

    // Contract state
    address public owner;
    uint256 public currentDrawId;

    // Per-draw state
    mapping(uint256 => DrawRound) public draws;
    mapping(uint256 => address[]) internal drawParticipants;
    mapping(uint256 => mapping(address => bool)) public hasEnteredRound;

    // Events
    event DrawStarted(uint256 indexed drawId);
    event ParticipantEntered(uint256 indexed drawId, address indexed participant);
    event DrawClosed(uint256 indexed drawId);
    event WinnerSelected(uint256 indexed drawId, address indexed winner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
        currentDrawId = 1;
        draws[1] = DrawRound({
            drawId: 1,
            status: DrawStatus.Open,
            winner: address(0),
            isFinalized: false
        });
        emit DrawStarted(1);
    }

    /**
     * @notice Enter the current prize draw for free.
     * Only callable while the draw is open. A wallet can only enter once per round.
     */
    function enterDraw() external {
        DrawRound storage currentDraw = draws[currentDrawId];
        require(currentDraw.status == DrawStatus.Open, "Draw is not open");
        require(!hasEnteredRound[currentDrawId][msg.sender], "Already entered");

        hasEnteredRound[currentDrawId][msg.sender] = true;
        drawParticipants[currentDrawId].push(msg.sender);

        emit ParticipantEntered(currentDrawId, msg.sender);
    }

    /**
     * @notice Close the current draw so that no further participants can enter.
     * Can only be called by the owner while the draw is currently open.
     */
    function closeDraw() external onlyOwner {
        DrawRound storage currentDraw = draws[currentDrawId];
        require(currentDraw.status == DrawStatus.Open, "Draw is not open");

        currentDraw.status = DrawStatus.Closed;
        emit DrawClosed(currentDrawId);
    }

    /**
     * @notice Finalize the winner for the current draw round from registered participants.
     * Can only be called by the owner after the draw has been closed.
     * Requires at least one participant. Cannot be finalized twice.
     */
    function finalizeWinner() external onlyOwner {
        DrawRound storage currentDraw = draws[currentDrawId];
        require(currentDraw.status == DrawStatus.Closed, "Draw must be closed before finalization");
        require(!currentDraw.isFinalized, "Draw already finalized");
        require(drawParticipants[currentDrawId].length > 0, "No participants in the draw");

        uint256 winningIndex = _selectDemoWinnerIndex(currentDrawId);
        address selectedWinner = drawParticipants[currentDrawId][winningIndex];

        currentDraw.winner = selectedWinner;
        currentDraw.isFinalized = true;
        currentDraw.status = DrawStatus.Completed;

        emit WinnerSelected(currentDrawId, selectedWinner);
    }

    /**
     * @notice Start a new consecutive draw round (Draw #2, Draw #3, etc.)
     * Can only be called by the owner after the current draw is completed.
     * Resets active participant list and winner for the new round while preserving historical records.
     */
    function startNewDraw() external onlyOwner {
        require(draws[currentDrawId].status == DrawStatus.Completed, "Current draw is not completed");

        currentDrawId++;
        draws[currentDrawId] = DrawRound({
            drawId: currentDrawId,
            status: DrawStatus.Open,
            winner: address(0),
            isFinalized: false
        });

        emit DrawStarted(currentDrawId);
    }

    /**
     * @dev DEMO ONLY: Predictable pseudo-random selection mechanism for testnet demonstration.
     * WARNING: This is NOT cryptographically secure and must NEVER be used for real-value prizes.
     * Kept isolated so it can be swapped for a verifiable randomness provider (e.g., Chainlink VRF) in the future.
     */
    function _selectDemoWinnerIndex(uint256 drawId) internal view returns (uint256) {
        uint256 count = drawParticipants[drawId].length;
        return uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, drawId, count))) % count;
    }

    // ==========================================
    // View Functions (Current Round)
    // ==========================================

    function drawStatus() external view returns (DrawStatus) {
        return draws[currentDrawId].status;
    }

    function getDrawStatus() external view returns (DrawStatus) {
        return draws[currentDrawId].status;
    }

    function getParticipantCount() external view returns (uint256) {
        return drawParticipants[currentDrawId].length;
    }

    function getParticipant(uint256 index) external view returns (address) {
        require(index < drawParticipants[currentDrawId].length, "Index out of bounds");
        return drawParticipants[currentDrawId][index];
    }

    function getAllParticipants() external view returns (address[] memory) {
        return drawParticipants[currentDrawId];
    }

    function checkHasEntered(address user) external view returns (bool) {
        return hasEnteredRound[currentDrawId][user];
    }

    function hasEntered(address user) external view returns (bool) {
        return hasEnteredRound[currentDrawId][user];
    }

    function winner() external view returns (address) {
        return draws[currentDrawId].winner;
    }

    function getWinner() external view returns (address) {
        return draws[currentDrawId].winner;
    }

    function isDrawFinalized() external view returns (bool) {
        return draws[currentDrawId].isFinalized;
    }

    function isFinalized() external view returns (bool) {
        return draws[currentDrawId].isFinalized;
    }

    // ==========================================
    // View Functions (History & Multi-Round)
    // ==========================================

    function getDrawDetails(uint256 drawId) external view returns (
        uint256 id,
        DrawStatus status,
        address roundWinner,
        bool finalized,
        uint256 participantCount
    ) {
        require(drawId > 0 && drawId <= currentDrawId, "Invalid draw ID");
        DrawRound storage d = draws[drawId];
        return (
            d.drawId,
            d.status,
            d.winner,
            d.isFinalized,
            drawParticipants[drawId].length
        );
    }

    function getRoundParticipants(uint256 drawId) external view returns (address[] memory) {
        require(drawId > 0 && drawId <= currentDrawId, "Invalid draw ID");
        return drawParticipants[drawId];
    }

    function checkHasEnteredRound(uint256 drawId, address user) external view returns (bool) {
        return hasEnteredRound[drawId][user];
    }

    /**
     * @notice Returns all draw rounds history from #1 up to currentDrawId
     */
    function getDrawHistory() external view returns (DrawHistoryItem[] memory) {
        DrawHistoryItem[] memory items = new DrawHistoryItem[](currentDrawId);
        for (uint256 i = 1; i <= currentDrawId; i++) {
            items[i - 1] = DrawHistoryItem({
                drawId: i,
                status: draws[i].status,
                winner: draws[i].winner,
                isFinalized: draws[i].isFinalized,
                participantCount: drawParticipants[i].length
            });
        }
        return items;
    }
}
