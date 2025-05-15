# Splitter DApp - Expense Sharing on Mantle

## Project Status: In Progress (Approx. 50% Complete)

This project is a decentralized application (DApp) for splitting expenses among friends.

✅ Figma Design  [URL](https://www.figma.com/design/A1sSjGq47lp0HrIczUl0lx/Splitter-Dapp?node-id=0-1&t=gs3B9HhM1uZfUH3E-1)

🌐 Live Web App Video [https://youtu.be/ebPEFQ-A77Y](https://youtu.be/ebPEFQ-A77Y)

🌐 Live Web App URL [https://split-app-mu-nine.vercel.app/](https://split-app-mu-nine.vercel.app/)

**Current Progress:**

*   **Smart Contract Core Logic (Splitter.sol):**
    *   Group creation with member management (on-chain wallet addresses).
    *   Functionality for adding expenses with equitable division among group members.
    *   Mechanism for tracking debts directly between members within each group.
    *   Secure debt settlement process using Mantle's native MNT token (payable functions, direct MNT transfers).
    *   Implementation of Ownable pattern for administrative controls.
    *   Event emissions for key actions (GroupCreated, ExpenseAdded, DebtPaid) to facilitate frontend updates.
*   **Development Environment & Deployment:**
    *   Hardhat environment configured for Solidity smart contract development.
    *   Successful deployment of the `Splitter` contract to the **Mantle Sepolia 
*   **Frontend Progress:**
    *  Completed implementation of the three main user flows:
    *   Creating a group
    *   Adding an expense
    *   Paying a debt
    *   Full transition from Figma design to a responsive Next.js frontend.
    *   Functional login and navigation across all available pages.


**Next Steps (Remaining 50%):**

*   **Automation & Advanced Features:**
    *   Integrate Gelato to enable automated recurring payments (e.g., splitting and scheduling monthly payments for shared services like Netflix).
    *   Explore a new group balance feature to allow debt settlement through a single aggregated transaction rather than individual payments to each member.

