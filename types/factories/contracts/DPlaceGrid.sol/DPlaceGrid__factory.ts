/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  DPlaceGrid,
  DPlaceGridInterface,
} from "../../../contracts/DPlaceGrid.sol/DPlaceGrid";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
    ],
    name: "PlaceChanged",
    type: "event",
  },
  {
    inputs: [],
    name: "basePrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "calculatePlacePrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "x",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "y",
        type: "uint256[]",
      },
    ],
    name: "calculatePlacesPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "claimPlace",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "x",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "y",
        type: "uint256[]",
      },
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
    ],
    name: "claimPlaces",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
    ],
    name: "getPlace",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "lastUpdateTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "contested",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "purchasePrice",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct DPlaceGrid.Place",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "grid",
    outputs: [
      {
        internalType: "uint256",
        name: "lastUpdateTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "contested",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "purchasePrice",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gridSize",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_basePrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_priceDecayInterval",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_priceVelocity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_gridSize",
        type: "uint256",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "isDataValid",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceDecayInterval",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceVelocity",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_basePrice",
        type: "uint256",
      },
    ],
    name: "setBasePrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gridSize",
        type: "uint256",
      },
    ],
    name: "setGridSize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_priceVelocity",
        type: "uint256",
      },
    ],
    name: "setPriceVelocity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_priceDecayInterval",
        type: "uint256",
      },
    ],
    name: "setpPriceDecayInterval",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506126c6806100206000396000f3fe6080604052600436106101145760003560e01c8063715018a6116100a0578063c7876ea411610064578063c7876ea414610397578063de315d90146103c2578063de4b3262146103ed578063e9e3acc014610416578063f2fde38b1461044157610114565b8063715018a6146102b057806372f2719a146102c757806379f9607d146103045780638da5cb5b1461032f57806396ae3e281461035a57610114565b8063261770a8116100e7578063261770a8146101dc578063266b08c21461020557806334a4313f1461022e5780635391bbe11461026b57806360a2da441461028757610114565b8063033848b314610119578063045d7c8814610142578063146008e31461017f5780631b5e9799146101c0575b600080fd5b34801561012557600080fd5b50610140600480360381019061013b91906113cb565b61046a565b005b34801561014e57600080fd5b50610169600480360381019061016491906113f8565b61047c565b6040516101769190611597565b60405180910390f35b34801561018b57600080fd5b506101a660048036038101906101a191906113f8565b6105c1565b6040516101b7959493929190611621565b60405180910390f35b6101da60048036038101906101d59190611959565b6106ac565b005b3480156101e857600080fd5b5061020360048036038101906101fe91906113cb565b610776565b005b34801561021157600080fd5b5061022c600480360381019061022791906113cb565b610788565b005b34801561023a57600080fd5b5061025560048036038101906102509190611a00565b61079a565b6040516102629190611a78565b60405180910390f35b61028560048036038101906102809190611a93565b610816565b005b34801561029357600080fd5b506102ae60048036038101906102a99190611b02565b610a96565b005b3480156102bc57600080fd5b506102c5610bf4565b005b3480156102d357600080fd5b506102ee60048036038101906102e991906113f8565b610c08565b6040516102fb9190611a78565b60405180910390f35b34801561031057600080fd5b50610319610d46565b6040516103269190611a78565b60405180910390f35b34801561033b57600080fd5b50610344610d4c565b6040516103519190611b69565b60405180910390f35b34801561036657600080fd5b50610381600480360381019061037c9190611b84565b610d76565b60405161038e9190611be8565b60405180910390f35b3480156103a357600080fd5b506103ac610f73565b6040516103b99190611a78565b60405180910390f35b3480156103ce57600080fd5b506103d7610f79565b6040516103e49190611a78565b60405180910390f35b3480156103f957600080fd5b50610414600480360381019061040f91906113cb565b610f7f565b005b34801561042257600080fd5b5061042b610f91565b6040516104389190611a78565b60405180910390f35b34801561044d57600080fd5b5061046860048036038101906104639190611c2f565b610f97565b005b61047261101a565b8060658190555050565b61048461133c565b6069600084815260200190815260200160002060008381526020019081526020016000206040518060a00160405290816000820154815260200160018201548152602001600282015481526020016003820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200160048201805461053790611c8b565b80601f016020809104026020016040519081016040528092919081815260200182805461056390611c8b565b80156105b05780601f10610585576101008083540402835291602001916105b0565b820191906000526020600020905b81548152906001019060200180831161059357829003601f168201915b505050505081525050905092915050565b6069602052816000526040600020602052806000526040600020600091509150508060000154908060010154908060020154908060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169080600401805461062990611c8b565b80601f016020809104026020016040519081016040528092919081815260200182805461065590611c8b565b80156106a25780601f10610677576101008083540402835291602001916106a2565b820191906000526020600020905b81548152906001019060200180831161068557829003601f168201915b5050505050905085565b6106b6838361079a565b3410156106f8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106ef90611d3f565b60405180910390fd5b60005b83518110156107705761075d84828151811061071a57610719611d5f565b5b602002602001015184838151811061073557610734611d5f565b5b60200260200101518484815181106107505761074f611d5f565b5b6020026020010151610816565b808061076890611dbd565b9150506106fb565b50505050565b61077e61101a565b8060688190555050565b61079061101a565b8060678190555050565b6000806000905060005b845181101561080b576107eb8582815181106107c3576107c2611d5f565b5b60200260200101518583815181106107de576107dd611d5f565b5b6020026020010151610c08565b826107f69190611e05565b9150808061080390611dbd565b9150506107a4565b508091505092915050565b60006108228484610c08565b905080341015610867576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161085e90611d3f565b60405180910390fd5b60655484108015610879575060655483105b6108b8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108af90611ea7565b60405180910390fd5b61093160696000868152602001908152602001600020600085815260200190815260200160002060030160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166069600087815260200190815260200160002060008681526020019081526020016000206002015483611098565b6040518060a001604052804281526020016001606960008881526020019081526020016000206000878152602001908152602001600020600101546109769190611e05565b8152602001828152602001610989611191565b73ffffffffffffffffffffffffffffffffffffffff1681526020018381525060696000868152602001908152602001600020600085815260200190815260200160002060008201518160000155602082015181600101556040820151816002015560608201518160030160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506080820151816004019081610a469190612073565b509050507fa403f203a3cf9c782eaca5f8897e82f465b868848f1e243f4cc59bed28677ec48484610a75611191565b8585604051610a88959493929190612145565b60405180910390a150505050565b60008060019054906101000a900460ff16159050808015610ac75750600160008054906101000a900460ff1660ff16105b80610af45750610ad630611199565b158015610af35750600160008054906101000a900460ff1660ff16145b5b610b33576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b2a90612211565b60405180910390fd5b60016000806101000a81548160ff021916908360ff1602179055508015610b70576001600060016101000a81548160ff0219169083151502179055505b610b786111bc565b846066819055508160658190555083606781905550826068819055508015610bed5760008060016101000a81548160ff0219169083151502179055507f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024986001604051610be49190612279565b60405180910390a15b5050505050565b610bfc61101a565b610c066000611215565b565b6000806067546069600086815260200190815260200160002060008581526020019081526020016000206000015442610c419190612294565b610c4b91906122f7565b905060006069600086815260200190815260200160002060008581526020019081526020016000206001015490506000606654905060008203610c9357809350505050610d40565b60008303610cd55781612710610ca9919061245b565b82606854610cb7919061245b565b606654610cc491906124a6565b610cce91906122f7565b9050610d22565b81612710610ce3919061245b565b836002610cf091906124a6565b83610cfb91906122f7565b606854610d08919061245b565b606654610d1591906124a6565b610d1f91906122f7565b90505b606654811015610d39576066549350505050610d40565b8093505050505b92915050565b60655481565b6000603360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000600382511080610d89575060088251115b15610d975760009050610f6e565b602360f81b82600081518110610db057610daf611d5f565b5b602001015160f81c60f81b7effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614610deb5760009050610f6e565b6000600190505b8251811015610f68576000838281518110610e1057610e0f611d5f565b5b602001015160f81c60f81b9050603060f81b817effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191610158015610e795750603960f81b817effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191611155b158015610edf5750604160f81b817effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191610158015610edd5750604660f81b817effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191611155b155b8015610f445750606160f81b817effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191610158015610f425750606660f81b817effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191611155b155b15610f5457600092505050610f6e565b508080610f6090611dbd565b915050610df2565b50600190505b919050565b60665481565b60685481565b610f8761101a565b8060668190555050565b60675481565b610f9f61101a565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff160361100e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161100590612572565b60405180910390fd5b61101781611215565b50565b611022611191565b73ffffffffffffffffffffffffffffffffffffffff16611040610d4c565b73ffffffffffffffffffffffffffffffffffffffff1614611096576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161108d906125de565b60405180910390fd5b565b818110611144578273ffffffffffffffffffffffffffffffffffffffff166108fc839081150290604051600060405180830381858888f193505050501580156110e5573d6000803e3d6000fd5b506110ee610d4c565b73ffffffffffffffffffffffffffffffffffffffff166108fc83836111139190612294565b9081150290604051600060405180830381858888f1935050505015801561113e573d6000803e3d6000fd5b5061118c565b8273ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f1935050505015801561118a573d6000803e3d6000fd5b505b505050565b600033905090565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b600060019054906101000a900460ff1661120b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161120290612670565b60405180910390fd5b6112136112db565b565b6000603360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081603360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600060019054906101000a900460ff1661132a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161132190612670565b60405180910390fd5b61133a611335611191565b611215565b565b6040518060a00160405280600081526020016000815260200160008152602001600073ffffffffffffffffffffffffffffffffffffffff168152602001606081525090565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b6113a881611395565b81146113b357600080fd5b50565b6000813590506113c58161139f565b92915050565b6000602082840312156113e1576113e061138b565b5b60006113ef848285016113b6565b91505092915050565b6000806040838503121561140f5761140e61138b565b5b600061141d858286016113b6565b925050602061142e858286016113b6565b9150509250929050565b61144181611395565b82525050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061147282611447565b9050919050565b61148281611467565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b838110156114c25780820151818401526020810190506114a7565b838111156114d1576000848401525b50505050565b6000601f19601f8301169050919050565b60006114f382611488565b6114fd8185611493565b935061150d8185602086016114a4565b611516816114d7565b840191505092915050565b600060a0830160008301516115396000860182611438565b50602083015161154c6020860182611438565b50604083015161155f6040860182611438565b5060608301516115726060860182611479565b506080830151848203608086015261158a82826114e8565b9150508091505092915050565b600060208201905081810360008301526115b18184611521565b905092915050565b6115c281611395565b82525050565b6115d181611467565b82525050565b600082825260208201905092915050565b60006115f382611488565b6115fd81856115d7565b935061160d8185602086016114a4565b611616816114d7565b840191505092915050565b600060a08201905061163660008301886115b9565b61164360208301876115b9565b61165060408301866115b9565b61165d60608301856115c8565b818103608083015261166f81846115e8565b90509695505050505050565b600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6116b8826114d7565b810181811067ffffffffffffffff821117156116d7576116d6611680565b5b80604052505050565b60006116ea611381565b90506116f682826116af565b919050565b600067ffffffffffffffff82111561171657611715611680565b5b602082029050602081019050919050565b600080fd5b600061173f61173a846116fb565b6116e0565b9050808382526020820190506020840283018581111561176257611761611727565b5b835b8181101561178b578061177788826113b6565b845260208401935050602081019050611764565b5050509392505050565b600082601f8301126117aa576117a961167b565b5b81356117ba84826020860161172c565b91505092915050565b600067ffffffffffffffff8211156117de576117dd611680565b5b602082029050602081019050919050565b600080fd5b600067ffffffffffffffff82111561180f5761180e611680565b5b611818826114d7565b9050602081019050919050565b82818337600083830152505050565b6000611847611842846117f4565b6116e0565b905082815260208101848484011115611863576118626117ef565b5b61186e848285611825565b509392505050565b600082601f83011261188b5761188a61167b565b5b813561189b848260208601611834565b91505092915050565b60006118b76118b2846117c3565b6116e0565b905080838252602082019050602084028301858111156118da576118d9611727565b5b835b8181101561192157803567ffffffffffffffff8111156118ff576118fe61167b565b5b80860161190c8982611876565b855260208501945050506020810190506118dc565b5050509392505050565b600082601f8301126119405761193f61167b565b5b81356119508482602086016118a4565b91505092915050565b6000806000606084860312156119725761197161138b565b5b600084013567ffffffffffffffff8111156119905761198f611390565b5b61199c86828701611795565b935050602084013567ffffffffffffffff8111156119bd576119bc611390565b5b6119c986828701611795565b925050604084013567ffffffffffffffff8111156119ea576119e9611390565b5b6119f68682870161192b565b9150509250925092565b60008060408385031215611a1757611a1661138b565b5b600083013567ffffffffffffffff811115611a3557611a34611390565b5b611a4185828601611795565b925050602083013567ffffffffffffffff811115611a6257611a61611390565b5b611a6e85828601611795565b9150509250929050565b6000602082019050611a8d60008301846115b9565b92915050565b600080600060608486031215611aac57611aab61138b565b5b6000611aba868287016113b6565b9350506020611acb868287016113b6565b925050604084013567ffffffffffffffff811115611aec57611aeb611390565b5b611af886828701611876565b9150509250925092565b60008060008060808587031215611b1c57611b1b61138b565b5b6000611b2a878288016113b6565b9450506020611b3b878288016113b6565b9350506040611b4c878288016113b6565b9250506060611b5d878288016113b6565b91505092959194509250565b6000602082019050611b7e60008301846115c8565b92915050565b600060208284031215611b9a57611b9961138b565b5b600082013567ffffffffffffffff811115611bb857611bb7611390565b5b611bc484828501611876565b91505092915050565b60008115159050919050565b611be281611bcd565b82525050565b6000602082019050611bfd6000830184611bd9565b92915050565b611c0c81611467565b8114611c1757600080fd5b50565b600081359050611c2981611c03565b92915050565b600060208284031215611c4557611c4461138b565b5b6000611c5384828501611c1a565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680611ca357607f821691505b602082108103611cb657611cb5611c5c565b5b50919050565b600082825260208201905092915050565b7f44506c616365477269643a20496e76616c69642070757263686173652070726960008201527f63652073656e7400000000000000000000000000000000000000000000000000602082015250565b6000611d29602783611cbc565b9150611d3482611ccd565b604082019050919050565b60006020820190508181036000830152611d5881611d1c565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000611dc882611395565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203611dfa57611df9611d8e565b5b600182019050919050565b6000611e1082611395565b9150611e1b83611395565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115611e5057611e4f611d8e565b5b828201905092915050565b7f44506c616365477269643a20506c616365206f7574206f6620626f756e647300600082015250565b6000611e91601f83611cbc565b9150611e9c82611e5b565b602082019050919050565b60006020820190508181036000830152611ec081611e84565b9050919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302611f297fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82611eec565b611f338683611eec565b95508019841693508086168417925050509392505050565b6000819050919050565b6000611f70611f6b611f6684611395565b611f4b565b611395565b9050919050565b6000819050919050565b611f8a83611f55565b611f9e611f9682611f77565b848454611ef9565b825550505050565b600090565b611fb3611fa6565b611fbe818484611f81565b505050565b5b81811015611fe257611fd7600082611fab565b600181019050611fc4565b5050565b601f82111561202757611ff881611ec7565b61200184611edc565b81016020851015612010578190505b61202461201c85611edc565b830182611fc3565b50505b505050565b600082821c905092915050565b600061204a6000198460080261202c565b1980831691505092915050565b60006120638383612039565b9150826002028217905092915050565b61207c82611488565b67ffffffffffffffff81111561209557612094611680565b5b61209f8254611c8b565b6120aa828285611fe6565b600060209050601f8311600181146120dd57600084156120cb578287015190505b6120d58582612057565b86555061213d565b601f1984166120eb86611ec7565b60005b82811015612113578489015182556001820191506020850194506020810190506120ee565b86831015612130578489015161212c601f891682612039565b8355505b6001600288020188555050505b505050505050565b600060a08201905061215a60008301886115b9565b61216760208301876115b9565b61217460408301866115c8565b818103606083015261218681856115e8565b905061219560808301846115b9565b9695505050505050565b7f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160008201527f647920696e697469616c697a6564000000000000000000000000000000000000602082015250565b60006121fb602e83611cbc565b91506122068261219f565b604082019050919050565b6000602082019050818103600083015261222a816121ee565b9050919050565b6000819050919050565b600060ff82169050919050565b600061226361225e61225984612231565b611f4b565b61223b565b9050919050565b61227381612248565b82525050565b600060208201905061228e600083018461226a565b92915050565b600061229f82611395565b91506122aa83611395565b9250828210156122bd576122bc611d8e565b5b828203905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600061230282611395565b915061230d83611395565b92508261231d5761231c6122c8565b5b828204905092915050565b60008160011c9050919050565b6000808291508390505b600185111561237f5780860481111561235b5761235a611d8e565b5b600185161561236a5780820291505b808102905061237885612328565b945061233f565b94509492505050565b6000826123985760019050612454565b816123a65760009050612454565b81600181146123bc57600281146123c6576123f5565b6001915050612454565b60ff8411156123d8576123d7611d8e565b5b8360020a9150848211156123ef576123ee611d8e565b5b50612454565b5060208310610133831016604e8410600b841016171561242a5782820a90508381111561242557612424611d8e565b5b612454565b6124378484846001612335565b9250905081840481111561244e5761244d611d8e565b5b81810290505b9392505050565b600061246682611395565b915061247183611395565b925061249e7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8484612388565b905092915050565b60006124b182611395565b91506124bc83611395565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156124f5576124f4611d8e565b5b828202905092915050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b600061255c602683611cbc565b915061256782612500565b604082019050919050565b6000602082019050818103600083015261258b8161254f565b9050919050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b60006125c8602083611cbc565b91506125d382612592565b602082019050919050565b600060208201905081810360008301526125f7816125bb565b9050919050565b7f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960008201527f6e697469616c697a696e67000000000000000000000000000000000000000000602082015250565b600061265a602b83611cbc565b9150612665826125fe565b604082019050919050565b600060208201905081810360008301526126898161264d565b905091905056fea26469706673582212207264ba719bb86588622dc2afb03964eade9dc03e26f5db4b319759b47035301d64736f6c634300080f0033";

type DPlaceGridConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DPlaceGridConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DPlaceGrid__factory extends ContractFactory {
  constructor(...args: DPlaceGridConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<DPlaceGrid> {
    return super.deploy(overrides || {}) as Promise<DPlaceGrid>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): DPlaceGrid {
    return super.attach(address) as DPlaceGrid;
  }
  override connect(signer: Signer): DPlaceGrid__factory {
    return super.connect(signer) as DPlaceGrid__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DPlaceGridInterface {
    return new utils.Interface(_abi) as DPlaceGridInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DPlaceGrid {
    return new Contract(address, _abi, signerOrProvider) as DPlaceGrid;
  }
}
