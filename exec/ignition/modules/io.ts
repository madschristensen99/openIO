import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ioModule", (m) => {
  const io = m.contract("io");

  return { io };
});

