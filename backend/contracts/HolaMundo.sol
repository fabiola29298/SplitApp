// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
contract HolaMundo {
    string private texto;
    address public propietario;

    modifier soloPropietario()
    {
        require (msg.sender == propietario, "El que llama no es el propietario");
        _;
    }

    constructor() {
        texto = "Hola Mundo";
        propietario = msg.sender;
    }

    function holaMundo() public view returns (string memory) {
        return texto;
    }

    function establecerTexto(string calldata nuevoTexto) public soloPropietario {
        texto = nuevoTexto;
    }

    function transferirPropiedad(address nuevoPropietario) public soloPropietario {
        propietario = nuevoPropietario;
    }
}
