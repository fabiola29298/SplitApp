// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// No necesitamos importar ERC20 ni EIP712 ahora
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GroupExpensesSimple
 * @dev Versión MVP simplificada para gestionar gastos compartidos.
 * - Owner gestiona miembros.
 * - Gastos añadidos por el pagador con división equitativa.
 * - Balances netos simples.
 * - Registro de liquidaciones P2P (hechas externamente con $MNT).
 * - Registro de liquidaciones generales (hechas externamente).
 */
contract GroupExpensesSimple {
    using Counters for Counters.Counter;

    // --- State Variables ---

    Counters.Counter private _groupIdCounter;

    struct Group {
        string name;
        address owner;
        mapping(address => bool) isMember; // Acceso rápido a membresía
        address[] members; // Lista de miembros (para iterar)
        mapping(address => int256) balances; // Balance neto: + grupo debe, - miembro debe
        uint256 memberCount; // Para división y chequeos
        bool exists; // Para validar IDs de grupo
    }

    // Mapping de ID de grupo a Struct de Grupo
    mapping(uint256 => Group) public groups;

    // --- Events ---

    event GroupCreated(uint256 indexed groupId, string name, address indexed owner);
    event MemberAdded(uint256 indexed groupId, address indexed member);
    event MemberRemoved(uint256 indexed groupId, address indexed member);
    event ExpenseAdded(
        uint256 indexed groupId,
        address indexed payer,
        uint256 amount,
        string description
    );
    // Evento para cuando alguien salda su deuda general (paga al "bote" off-chain)
    event SettlementRecorded(
        uint256 indexed groupId,
        address indexed member, // Quien registra el pago
        uint256 amount
    );
    // Evento para registrar un pago directo P2P ($MNT) hecho fuera del contrato
    event DebtSettledBetweenMembers(
        uint256 indexed groupId,
        address indexed payer,     // Quien pagó (y llama a la función)
        address indexed recipient, // Quien recibió el pago
        uint256 amount
    );

    // --- Modifiers ---

    modifier onlyGroupOwner(uint256 _groupId) {
        require(groups[_groupId].exists, "Grupo: No existe");
        require(msg.sender == groups[_groupId].owner, "Grupo: No eres el owner");
        _;
    }

    modifier onlyGroupMember(uint256 _groupId) {
        require(groups[_groupId].exists, "Grupo: No existe");
        require(groups[_groupId].isMember[msg.sender], "Grupo: No eres miembro");
        _;
    }

    // --- Constructor ---
    // No necesita parámetros en esta versión simple
    constructor() {}

    // --- Group Management Functions ---

    /**
     * @notice Crea un nuevo grupo de gastos.
     * @param _name Nombre del grupo.
     * @param _initialMembers Miembros iniciales (el owner se añade automáticamente).
     * @return groupId ID del nuevo grupo.
     */
    function createGroup(string memory _name, address[] memory _initialMembers) external returns (uint256) {
        _groupIdCounter.increment();
        uint256 groupId = _groupIdCounter.current();

        Group storage newGroup = groups[groupId];
        newGroup.name = _name;
        newGroup.owner = msg.sender;
        newGroup.exists = true;

        // Añadir owner como primer miembro
        if (!newGroup.isMember[msg.sender]) {
             newGroup.isMember[msg.sender] = true;
             newGroup.members.push(msg.sender);
             newGroup.balances[msg.sender] = 0;
             newGroup.memberCount = 1;
        }

        // Añadir miembros iniciales
        for (uint i = 0; i < _initialMembers.length; i++) {
            address member = _initialMembers[i];
            if (member != address(0) && member != msg.sender && !newGroup.isMember[member]) {
                newGroup.isMember[member] = true;
                newGroup.members.push(member);
                newGroup.balances[member] = 0;
                newGroup.memberCount++;
            }
        }

        emit GroupCreated(groupId, _name, msg.sender);
        return groupId;
    }

    /**
     * @notice Añade un miembro al grupo (solo owner).
     * @param _groupId ID del grupo.
     * @param _member Dirección a añadir.
     */
    function addMember(uint256 _groupId, address _member) external onlyGroupOwner(_groupId) {
        Group storage group = groups[_groupId];
        require(_member != address(0), "Grupo: Dirección inválida");
        require(!group.isMember[_member], "Grupo: Ya es miembro");

        group.isMember[_member] = true;
        group.members.push(_member);
        group.balances[_member] = 0;
        group.memberCount++;

        emit MemberAdded(_groupId, _member);
    }

   /**
    * @notice Elimina un miembro del grupo (solo owner).
    * @dev MVP: Requiere que el balance del miembro sea cero para simplificar.
    * @param _groupId ID del grupo.
    * @param _member Dirección a eliminar.
    */
    function removeMember(uint256 _groupId, address _member) external onlyGroupOwner(_groupId) {
        Group storage group = groups[_groupId];
        require(_member != address(0), "Grupo: Dirección inválida");
        require(_member != group.owner, "Grupo: No puedes eliminar al owner");
        require(group.isMember[_member], "Grupo: No es miembro");
        // --- Restricción MVP ---
        require(group.balances[_member] == 0, "Grupo: Balance debe ser cero para eliminar");
        // --- ---

        group.isMember[_member] = false; // Marcar como no miembro

        // Eliminar del array (costoso en gas, inevitable si necesitamos la lista)
        uint memberIndex = type(uint).max;
        for(uint i = 0; i < group.members.length; i++) {
            if (group.members[i] == _member) {
                memberIndex = i;
                break;
            }
        }
        require(memberIndex != type(uint).max, "Grupo: Error interno al buscar miembro");

        if (memberIndex < group.members.length - 1) {
            group.members[memberIndex] = group.members[group.members.length - 1];
        }
        group.members.pop();

        group.memberCount--;

        emit MemberRemoved(_groupId, _member);
    }

    // --- Expense Management Function ---

    /**
     * @notice Añade un gasto al grupo. El llamador (msg.sender) es el pagador.
     * @dev El coste se divide equitativamente entre TODOS los miembros actuales.
     * @param _groupId ID del grupo.
     * @param _description Descripción del gasto.
     * @param _amount Monto total del gasto.
     */
    function addExpense(uint256 _groupId, string memory _description, uint256 _amount)
        external
        onlyGroupMember(_groupId) // Solo miembros pueden añadir gastos
    {
        Group storage group = groups[_groupId]; // Carga en storage una vez
        address payer = msg.sender; // El pagador es quien llama

        require(_amount > 0, "Gasto: Monto debe ser positivo");
        require(group.memberCount > 0, "Gasto: Grupo sin miembros"); // Evitar división por cero

        // --- Lógica de Actualización de Balances ---
        // El balance del pagador aumenta por el total pagado
        group.balances[payer] += int256(_amount);

        // La parte que corresponde a cada miembro (división entera)
        uint256 share = _amount / group.memberCount;

        // Disminuir el balance de CADA miembro por su parte
        // Incluye al pagador, cuyo balance neto se ajustará correctamente
        for (uint i = 0; i < group.members.length; i++) {
            address member = group.members[i];
            if (group.isMember[member]) { // Chequeo extra por si acaso
                 group.balances[member] -= int256(share);
            }
        }
        // Nota: La pequeña diferencia por división entera la "absorbe" el pagador.

        emit ExpenseAdded(_groupId, payer, _amount, _description);
    }

    // --- Settlement Functions ---

    /**
     * @notice Registra que un miembro ha saldado una cantidad hacia el "bote" del grupo.
     * @dev Asume que el pago se hizo fuera de la cadena (ej. efectivo, transferencia bancaria).
     *      Ajusta el balance del miembro que llama (msg.sender).
     * @param _groupId ID del grupo.
     * @param _amount Monto saldado.
     */
    function recordGeneralSettlement(uint256 _groupId, uint256 _amount) external onlyGroupMember(_groupId) {
        require(_amount > 0, "Liquidación: Monto debe ser positivo");
        Group storage group = groups[_groupId];

        // Aumenta el balance del miembro, reduciendo su deuda (si era negativa)
        group.balances[msg.sender] += int256(_amount);

        emit SettlementRecorded(_groupId, msg.sender, _amount);
    }

    /**
     * @notice Registra un pago directo de $MNT (u otro token nativo) hecho entre dos miembros FUERA del contrato.
     * @dev El llamador (msg.sender) confirma que PAGÓ al _recipient.
     *      Esto ajusta los balances internos de ambos miembros en el contrato.
     *      NO TRANSFIERE tokens.
     * @param _groupId ID del grupo.
     * @param _recipient Miembro que recibió el pago $MNT externamente.
     * @param _amount Monto pagado externamente.
     */
    function recordSettlementBetweenMembers(uint256 _groupId, address _recipient, uint256 _amount)
        external
        onlyGroupMember(_groupId) // El pagador debe ser miembro
    {
        Group storage group = groups[_groupId];
        address payer = msg.sender;

        require(_recipient != address(0), "Liquidación P2P: Receptor inválido");
        require(group.isMember[_recipient], "Liquidación P2P: Receptor no es miembro");
        require(payer != _recipient, "Liquidación P2P: No puedes pagarte a ti mismo");
        require(_amount > 0, "Liquidación P2P: Monto debe ser positivo");

        // --- Actualización de Balances Internos ---
        // El balance del pagador aumenta (su deuda neta disminuye)
        group.balances[payer] += int256(_amount);
        // El balance del receptor disminuye (su crédito neto disminuye)
        group.balances[_recipient] -= int256(_amount);

        emit DebtSettledBetweenMembers(_groupId, payer, _recipient, _amount);
    }

    // --- View Functions ---

    /**
     * @notice Obtiene información básica del grupo.
     */
    function getGroupInfo(uint256 _groupId)
        external
        view
        returns (
            string memory name,
            address owner,
            uint256 memberCount,
            address[] memory members
        )
    {
        Group storage group = groups[_groupId];
        require(group.exists, "Grupo: No existe");
        return (group.name, group.owner, group.memberCount, group.members);
    }

   /**
    * @notice Obtiene el balance neto actual de un usuario en un grupo.
    * @return balance Balance neto (+ grupo le debe, - él debe al grupo).
    */
    function getBalance(uint256 _groupId, address _user) external view returns (int256 balance) {
        require(groups[_groupId].exists, "Grupo: No existe");
        return groups[_groupId].balances[_user]; // Devuelve 0 si nunca fue miembro
    }

   /**
    * @notice Verifica si una dirección es miembro actual del grupo.
    */
    function isGroupMember(uint256 _groupId, address _user) external view returns (bool) {
         return groups[_groupId].isMember[_user]; // Devuelve false si grupo no existe o no es miembro
    }
}