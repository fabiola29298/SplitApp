// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
 
import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
/**
 * @title Splitter
 * @dev A smart contract for splitting expenses among a group of friends. 
 */
contract Splitter is Ownable {

    using EnumerableSet for EnumerableSet.UintSet;

    // --- State Variables ---
    uint256 public nextGroupId;
    uint256 public nextExpenseId;

    // --- Structs ---

    /**
     * @dev Represents a group of users for expense splitting.
     * @param id Unique identifier for the group.
     * @param name Name of the group (stored on-chain).
     * @param creator Address of the user who created the group.
     * @param members Array of addresses of the group members.
     * @param isActive Flag to indicate if the group is active (true by default).
     * @param expenseIds Array of IDs for expenses belonging to this group.
     */
    struct Group {
        uint256 id;
        string name;
        address creator;
        address[] members;
        bool isActive;
        uint256[] expenseIds;
    }

    /**
     * @dev Represents an expense paid by a user within a group.
     * @param id Unique identifier for the expense.
     * @param groupId ID of the group this expense belongs to.
     * @param payer Address of the user who paid the expense.
     * @param totalAmount Total amount of the expense in MNT (smallest unit, e.g., wei).
     * @param description Description or reference for the expense (stored on-chain).
     * @param timestamp Timestamp of when the expense was created.
     */
    struct Expense {
        uint256 id;
        uint256 groupId;
        address payer;
        uint256 totalAmount;
        string description;
        uint256 timestamp;
    }
    struct DebtItem { // Helper struct for returning debt information
        uint256 groupId;
        address debtor;
        address creditor;
        uint256 amount;
    }

    // --- Mappings ---
    mapping(uint256 => Group) public groups;
    mapping(uint256 => Expense) public expenses;
 
    mapping(uint256 => mapping(address => mapping(address => uint256))) public debts;

    mapping(address => EnumerableSet.UintSet) private _userExpenseIds; // IDs of expenses paid by a user
    mapping(address => EnumerableSet.UintSet) private _userGroupIds; // IDs of groups a user belongs to
    // --- Events ---
    event GroupCreated(
        uint256 indexed groupId,
        string name,
        address indexed creator,
        address[] members
    );

    event ExpenseAdded(
        uint256 indexed expenseId,
        uint256 indexed groupId,
        address indexed payer,
        uint256 totalAmount,
        string description,
        address[] debtors // Who owes for this expense (all members except the payer)
    );

    event DebtPaid(
        uint256 indexed groupId,
        address indexed debtor,
        address indexed creditor,
        uint256 amount
    );

    // --- Constructor ---
    /**
     * @dev Initializes the contract. The deployer becomes the owner.
     */
    constructor() Ownable(msg.sender) { 
    }

    // --- Main Functions ---

    /**
     * @dev Creates a new expense-splitting group.
     * @param _name Name of the group.
     * @param _initialMembers Initial list of members (must include msg.sender).
     */
    function createGroup(string memory _name, address[] memory _initialMembers) external {
        require(bytes(_name).length > 0, "Splitter: Group name cannot be empty");
        require(_initialMembers.length > 0, "Splitter: Group must have at least one member");
 
        uint256 currentGroupId = nextGroupId;
        Group storage newGroup = groups[currentGroupId];

        newGroup.id = currentGroupId;
        newGroup.name = _name;
        newGroup.creator = msg.sender;
        newGroup.isActive = true;

        // Adding msg.sender
        if (msg.sender != address(0)) {
            newGroup.members.push(msg.sender);
        } else {
            revert("Splitter: El creador (msg.sender) es una direccion invalida.");
        }
        // Adding _initialMembers
        for (uint i = 0; i < _initialMembers.length; i++) {
            address member = _initialMembers[i];
            newGroup.members.push(member); 
        } 
         
        nextGroupId++;
        
        emit GroupCreated(
            currentGroupId,
            newGroup.name,
            newGroup.creator,
            newGroup.members  
        );
        
    }

    /**
     * @dev Adds a new expense to a group and splits it equally among members.
     * The `msg.sender` is the payer.
     * @param _groupId ID of the group for the expense.
     * @param _totalAmount Total amount of the expense (in native MNT).
     * @param _description Description of the expense.
     */
    function addExpense(uint256 _groupId, uint256 _totalAmount, string memory _description) external {
        Group storage group = groups[_groupId]; 

        uint256 expenseId = nextExpenseId;

        // Create a expense
        expenses[expenseId] = Expense({
            id: expenseId,
            groupId: _groupId,
            payer: msg.sender,
            totalAmount: _totalAmount,
            description: _description,
            timestamp: block.timestamp
        });

        group.expenseIds.push(expenseId);
        _userExpenseIds[msg.sender].add(expenseId);


        uint256 numMembers = group.members.length;
        uint256 sharePerMember = 0;

        // protección de tiempo de ejecución. Si numMembers es 0, _totalAmount / 0 revertiría.
        if (numMembers > 0) {
            sharePerMember = _totalAmount / numMembers;
        }
        // Si numMembers es 0, sharePerMember seguirá siendo 0.

        
        address[] memory debtorsForEvent;

        if (numMembers > 1 && sharePerMember > 0) {
            debtorsForEvent = new address[](numMembers - 1); // Asume que el pagador es uno de los miembros.
            uint debtorsCount = 0;
            for (uint i = 0; i < numMembers; i++) {
                address member = group.members[i];
                if (member != msg.sender) {
                    debts[_groupId][member][msg.sender] += sharePerMember;
                    if (debtorsCount < debtorsForEvent.length) { 
                        debtorsForEvent[debtorsCount] = member;
                    }
                    debtorsCount++; 
                                   
                }
            }
            
            if (debtorsCount < debtorsForEvent.length) {
                address[] memory actualDebtors = new address[](debtorsCount);
                for(uint j=0; j < debtorsCount; j++){
                    actualDebtors[j] = debtorsForEvent[j];
                }
                debtorsForEvent = actualDebtors;
            }

        } else {
            
            debtorsForEvent = new address[](0);
        }


        nextExpenseId++;
        emit ExpenseAdded(expenseId, _groupId, msg.sender, _totalAmount, _description, debtorsForEvent);
    }

    /**
     * @dev Allows a debtor (msg.sender) to pay a specific debt to a creditor in a group.
     * The debtor must send MNT (native token) equal to `msg.value` along with this call.
     * @param _groupId ID of the group where the debt exists.
     * @param _creditor Address of the creditor.
     */
    function payDebt(uint256 _groupId, address _creditor) external payable { // Mark as payable
        require(groups[_groupId].id == _groupId && groups[_groupId].creator != address(0), "Splitter: Group does not exist");

        uint256 amountToPay = msg.value; // The amount sent with the transaction
        uint256 currentDebt = debts[_groupId][msg.sender][_creditor];
        require(currentDebt >= amountToPay, "Splitter: Payment amount exceeds debt or no debt exists for this amount");

        debts[_groupId][msg.sender][_creditor] = currentDebt - amountToPay; 
        (bool success, ) = _creditor.call{value: amountToPay}("");
        require(success, "Splitter: MNT transfer failed");

        emit DebtPaid(_groupId, msg.sender, _creditor, amountToPay);
    }
    function getExpenseIdsByPayer(address _payer) external view returns (uint256[] memory) {
        return _userExpenseIds[_payer].values();
    }
    function getExpensesByPayer(address _payer) external view returns (Expense[] memory) {
        uint256[] memory expenseIds = _userExpenseIds[_payer].values();
        Expense[] memory userExpenses = new Expense[](expenseIds.length);
        for (uint i = 0; i < expenseIds.length; i++) {
            userExpenses[i] = expenses[expenseIds[i]];
        }
        return userExpenses;
    }    
    
 
}
