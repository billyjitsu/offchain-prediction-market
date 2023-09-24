// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PhatRollupAnchor.sol";
import "hardhat/console.sol";

contract TestLensApiConsumerContract is PhatRollupAnchor, Ownable {
    event ResponseReceived(uint reqId, string pair, uint256 value);
    event ErrorReceived(uint reqId, string pair, uint256 errno);

    uint constant TYPE_RESPONSE = 0;
    uint constant TYPE_ERROR = 2;

    enum Range { OneTo100, Hundred1To1000, Thousand1To5000, Five001To10000, Ten001AndBeyond }
    
    struct Bet {
        address payable bettor;
        Range betRange;
    }
    
    Bet[] public bets;

    mapping(uint => string) requests;
    uint nextRequest = 1;

    constructor(address phatAttestor) {
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
    }

    function setAttestor(address phatAttestor) public {
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
    }

    function request(string calldata profileId) public {
        // assemble the request
        uint id = nextRequest;
        requests[id] = profileId;
        _pushMessage(abi.encode(id, profileId));
        nextRequest += 1;
    }

    // For test
    function malformedRequest(bytes calldata malformedData) public {
        uint id = nextRequest;
        requests[id] = "malformed_req";
        _pushMessage(malformedData);
        nextRequest += 1;
    }

    function _onMessageReceived(bytes calldata action) internal override {
        require(action.length == 32 * 3, "cannot parse action");
        (uint respType, uint id, uint256 data) = abi.decode(
            action,
            (uint, uint, uint256)
        );
        if (respType == TYPE_RESPONSE) {
            emit ResponseReceived(id, requests[id], data);
            delete requests[id];
            console.log("Response received: %s", data);
        } else if (respType == TYPE_ERROR) {
            emit ErrorReceived(id, requests[id], data);
            delete requests[id];
        }
    }

    function placeBet(Range _betRange) public payable {
        require(msg.value >= 0.001 ether, "Bet amount should be 0.001 ether");
        
        Bet memory newBet;
        newBet.bettor = payable(msg.sender);
        newBet.betRange = _betRange;
        
        bets.push(newBet);
    }

    function executeBets(uint256 number) internal {
        Range winningRange;
        console.log("Number: %s", number);
        if (number >= 1 && number <= 100) {
            winningRange = Range.OneTo100;
        } else if (number >= 101 && number <= 1000) {
            winningRange = Range.Hundred1To1000;
        } else if (number >= 1001 && number <= 5000) {
            winningRange = Range.Thousand1To5000;
        } else if (number >= 5001 && number <= 10000) {
            winningRange = Range.Five001To10000;
        } else {
            winningRange = Range.Ten001AndBeyond;
        }
        
        uint256 totalWinners = 0;
        
        for (uint i = 0; i < bets.length; i++) {
            if (bets[i].betRange == winningRange) {
                totalWinners++;
                console.log("Going through bets: %s", totalWinners);
            }
        }
        
        if (totalWinners == 0) {
            console.log("No winners");
            return;
        }
        uint256 prizePerWinner = address(this).balance / totalWinners;
        console.log("Prize per winner: %s", prizePerWinner);
        for (uint i = 0; i < bets.length; i++) {
            if (bets[i].betRange == winningRange) {
                bets[i].bettor.transfer(prizePerWinner);
            }
        }
        
        // Reset bets
        delete bets;
    }
}
