// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PrizePop
 * @dev A simple, beginner-friendly Web3 prize draw contract deployed on Botchain Testnet.
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

    // Contract state
    address public owner;
    DrawStatus public drawStatus;
    address[] public participants;
    mapping(address => bool) public hasEntered;
    address public winner;
    bool public isFinalized;

    // Events
    event ParticipantEntered(address indexed participant);
    event DrawClosed();
    event WinnerSelected(address indexed winner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
        drawStatus = DrawStatus.Open;
        winner = address(0);
        isFinalized = false;
    }

    /**
     * @notice Enter the prize draw for free.
     * Only callable while the draw is open. A wallet can only enter once.
     */
    function enterDraw() external {
        require(drawStatus == DrawStatus.Open, "Draw is not open");
        require(!hasEntered[msg.sender], "Already entered");

        hasEntered[msg.sender] = true;
        participants.push(msg.sender);

        emit ParticipantEntered(msg.sender);
    }

    /**
     * @notice Close the draw so that no further participants can enter.
     * Can only be called by the owner while the draw is currently open.
     */
    function closeDraw() external onlyOwner {
        require(drawStatus == DrawStatus.Open, "Draw is not open");

        drawStatus = DrawStatus.Closed;
        emit DrawClosed();
    }

    /**
     * @notice Finalize the winner from the registered participants.
     * Can only be called by the owner after the draw has been closed.
     * Requires at least one participant. Cannot be finalized twice.
     */
    function finalizeWinner() external onlyOwner {
        require(drawStatus == DrawStatus.Closed, "Draw must be closed before finalization");
        require(!isFinalized, "Draw already finalized");
        require(participants.length > 0, "No participants in the draw");

        uint256 winningIndex = _selectDemoWinnerIndex();
        winner = participants[winningIndex];
        isFinalized = true;
        drawStatus = DrawStatus.Completed;

        emit WinnerSelected(winner);
    }

    /**
     * @dev DEMO ONLY: Predictable pseudo-random selection mechanism for testnet demonstration.
     * WARNING: This is NOT cryptographically secure and must NEVER be used for real-value prizes.
     * Kept isolated so it can be swapped for a verifiable randomness provider (e.g., Chainlink VRF) in the future.
     */
    function _selectDemoWinnerIndex() internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, participants.length))) % participants.length;
    }

    // ==========================================
    // View Functions
    // ==========================================

    /**
     * @notice Returns the total count of participants.
     */
    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }

    /**
     * @notice Returns a participant's address by their index in the list.
     */
    function getParticipant(uint256 index) external view returns (address) {
        require(index < participants.length, "Index out of bounds");
        return participants[index];
    }

    /**
     * @notice Returns all registered participants.
     */
    function getAllParticipants() external view returns (address[] memory) {
        return participants;
    }

    /**
     * @notice Returns whether a specific address has entered the draw.
     */
    function checkHasEntered(address user) external view returns (bool) {
        return hasEntered[user];
    }

    /**
     * @notice Returns current draw status.
     * 0 = Open, 1 = Closed, 2 = Completed
     */
    function getDrawStatus() external view returns (DrawStatus) {
        return drawStatus;
    }

    /**
     * @notice Returns the selected winner address (address(0) if not finalized).
     */
    function getWinner() external view returns (address) {
        return winner;
    }

    /**
     * @notice Returns whether the draw has been finalized.
     */
    function isDrawFinalized() external view returns (bool) {
        return isFinalized;
    }
}
