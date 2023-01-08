const filePath = process.argv[1] || "";
const file = filePath.replaceAll("\\", "/").split("/").pop() || "";

export const isCLI = file.includes("akte.app") || file.includes("akte.config");
