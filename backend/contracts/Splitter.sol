// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
 
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Splitter
 * @dev A smart contract for splitting expenses among a group of friends. 
 */
contract Splitter is Ownable {

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

    // --- Mappings ---
    mapping(uint256 => Group) public groups;
    mapping(uint256 => Expense) public expenses;
 
    mapping(uint256 => mapping(address => mapping(address => uint256))) public debts;

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

        bool creatorIncluded = false;
        for (uint i = 0; i < _initialMembers.length; i++) {
            require(_initialMembers[i] != address(0), "Splitter: Invalid member address");
            if (_initialMembers[i] == msg.sender) {
                creatorIncluded = true;
            } 
        }
        require(creatorIncluded, "Splitter: Creator (msg.sender) must be in initial members list");

        uint256 groupId = nextGroupId;
        groups[groupId] = Group({
            id: groupId,
            name: _name,
            creator: msg.sender,
            members: _initialMembers,
            isActive: true,
            expenseIds: new uint256[](0)
        });

        nextGroupId++;
        emit GroupCreated(groupId, _name, msg.sender, _initialMembers);
    }

    /**
     * @dev Adds a new expense to a group and splits it equally among members.
     * The `msg.sender` is the payer.
     * @param _groupId ID of the group for the expense.
     * @param _totalAmount Total amount of the expense (in native MNT).
     * @param _description Description of the expense.
     */
    function addExpense(uint256 _groupId, uint256 _totalAmount, string memory _description) external {
        Group storage group = groups[_groupId]; // Use 'storage' to modify it
        require(group.id == _groupId && group.creator != address(0), "Splitter: Group does not exist");
        require(group.isActive, "Splitter: Group is not active");
        require(_totalAmount > 0, "Splitter: Amount must be greater than zero");
        require(bytes(_description).length > 0, "Splitter: Description cannot be empty");

        bool isPayerMember = false;
        for (uint i = 0; i < group.members.length; i++) {
            if (group.members[i] == msg.sender) {
                isPayerMember = true;
                break;
            }
        }
        require(isPayerMember, "Splitter: Payer is not a member of the group");

        uint256 expenseId = nextExpenseId;
        expenses[expenseId] = Expense({
            id: expenseId,
            groupId: _groupId,
            payer: msg.sender,
            totalAmount: _totalAmount,
            description: _description,
            timestamp: block.timestamp
        });
        group.expenseIds.push(expenseId);  

        uint256 numMembers = group.members.length;
        require(numMembers > 0, "Splitter: Group has no members to split with");

        uint256 sharePerMember = 0;
        if (numMembers > 0) { // Avoid division by zero 
            sharePerMember = _totalAmount / numMembers;
        }

        // For the event, collect the debtors
        address[] memory debtorsArray = new address[](numMembers > 0 ? numMembers - 1 : 0);
        uint debtorsCount = 0;

        if (sharePerMember > 0) {
            for (uint i = 0; i < numMembers; i++) {
                address member = group.members[i];
                if (member != msg.sender) { // Payer does not owe themselves
                    debts[_groupId][member][msg.sender] += sharePerMember;
                    if(debtorsCount < debtorsArray.length){ // Safety check
                         debtorsArray[debtorsCount] = member;
                         debtorsCount++;
                    }
                }
            }
        }

         
        address[] memory finalDebtorsArray = new address[](debtorsCount);
        for(uint j=0; j < debtorsCount; j++){
            finalDebtorsArray[j] = debtorsArray[j];
        }

        nextExpenseId++;
        emit ExpenseAdded(expenseId, _groupId, msg.sender, _totalAmount, _description, finalDebtorsArray);
    }

    /**
     * @dev Allows a debtor (msg.sender) to pay a specific debt to a creditor in a group.
     * The debtor must send MNT (native token) equal to `msg.value` along with this call.
     * @param _groupId ID of the group where the debt exists.
     * @param _creditor Address of the creditor.
     */
    function payDebt(uint256 _groupId, address _creditor) external payable { // Mark as payable
        require(groups[_groupId].id == _groupId && groups[_groupId].creator != address(0), "Splitter: Group does not exist");
        require(groups[_groupId].isActive, "Splitter: Group is not active");
        require(msg.value > 0, "Splitter: Amount to pay (msg.value) must be greater than zero");

        uint256 amountToPay = msg.value; // The amount sent with the transaction
        uint256 currentDebt = debts[_groupId][msg.sender][_creditor];
        require(currentDebt >= amountToPay, "Splitter: Payment amount exceeds debt or no debt exists for this amount");

        debts[_groupId][msg.sender][_creditor] = currentDebt - amountToPay; 
        (bool success, ) = _creditor.call{value: amountToPay}("");
        require(success, "Splitter: MNT transfer failed");

        emit DebtPaid(_groupId, msg.sender, _creditor, amountToPay);
    }

    // --- View Functions ---

    function getGroupDetails(uint256 _groupId) external view returns (Group memory) {
        require(groups[_groupId].id == _groupId && groups[_groupId].creator != address(0), "Splitter: Group does not exist");
        return groups[_groupId];
    }

    function getExpenseDetails(uint256 _expenseId) external view returns (Expense memory) {
        require(expenses[_expenseId].id == _expenseId && expenses[_expenseId].payer != address(0) , "Splitter: Expense does not exist");
        return expenses[_expenseId];
    }

    function getDebt(uint256 _groupId, address _debtor, address _creditor) external view returns (uint256) {
        return debts[_groupId][_debtor][_creditor];
    }

    /**
     * @dev Retrieves all debts a user owes within a specific group.
     * @param _groupId ID of the group.
     * @param _debtor Address of the user whose debts are being queried.
     * @return creditors Array of addresses the _debtor owes to.
     * @return amounts Array of corresponding debt amounts.
     */
    function getMyOwedDebtsInGroup(uint256 _groupId, address _debtor)
        external
        view
        returns (address[] memory creditors, uint256[] memory amounts)
    {
        Group storage group = groups[_groupId];
        require(group.id == _groupId && group.creator != address(0), "Splitter: Group does not exist");

        uint count = 0;
        for (uint i = 0; i < group.members.length; i++) {
            if (group.members[i] != _debtor && debts[_groupId][_debtor][group.members[i]] > 0) {
                count++;
            }
        }

        creditors = new address[](count);
        amounts = new uint256[](count);
        uint k = 0;
        for (uint i = 0; i < group.members.length; i++) {
            address potentialCreditor = group.members[i];
            if (potentialCreditor != _debtor) {
                uint256 debtAmount = debts[_groupId][_debtor][potentialCreditor];
                if (debtAmount > 0) {
                    creditors[k] = potentialCreditor;
                    amounts[k] = debtAmount;
                    k++;
                }
            }
        }
        return (creditors, amounts);
    }

    /**
     * @dev Retrieves all amounts owed to a user within a specific group.
     * @param _groupId ID of the group.
     * @param _creditor Address of the user whose credits are being queried.
     * @return debtors Array of addresses that owe the _creditor.
     * @return amounts Array of corresponding amounts owed.
     */
    function getMyCreditDebtsInGroup(uint256 _groupId, address _creditor)
        external
        view
        returns (address[] memory debtors, uint256[] memory amounts)
    {
        Group storage group = groups[_groupId];
        require(group.id == _groupId && group.creator != address(0), "Splitter: Group does not exist");

        uint count = 0;
        for (uint i = 0; i < group.members.length; i++) {
            if (group.members[i] != _creditor && debts[_groupId][group.members[i]][_creditor] > 0) {
                count++;
            }
        }

        debtors = new address[](count);
        amounts = new uint256[](count);
        uint k = 0;
        for (uint i = 0; i < group.members.length; i++) {
            address potentialDebtor = group.members[i];
            if (potentialDebtor != _creditor) {
                uint256 debtAmount = debts[_groupId][potentialDebtor][_creditor];
                if (debtAmount > 0) {
                    debtors[k] = potentialDebtor;
                    amounts[k] = debtAmount;
                    k++;
                }
            }
        }
        return (debtors, amounts);
    }

    // --- Owner-Only Functions ---
    // (Example: a function to withdraw any MNT accidentally sent to the contract directly)
    // This is generally good practice for payable contracts.
    /**
     * @dev Allows the owner to withdraw any MNT balance accidentally sent to this contract.
     */
    function withdrawAccidentalMNT() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
