"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = __importStar(require("@prisma/client/runtime/client"));
const config = {
    "previewFeatures": [],
    "clientVersion": "7.2.0",
    "engineVersion": "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3",
    "activeProvider": "mysql",
    "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = \"prisma-client\"\n  output   = \"../generated/prisma\"\n}\n\ndatasource db {\n  provider = \"mysql\"\n}\n\nmodel Audit {\n  id        Int      @id @default(autoincrement())\n  name      String\n  type      String\n  status    String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  findings Finding[] // <- reverse relation\n}\n\nmodel Finding {\n  id          Int      @id @default(autoincrement())\n  auditId     Int\n  description String\n  severity    String\n  status      String\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  audit       Audit        @relation(fields: [auditId], references: [id])\n  actionPlans ActionPlan[] // <- reverse relation\n}\n\nmodel ActionPlan {\n  id        Int      @id @default(autoincrement())\n  findingId Int\n  owner     String\n  dueDate   DateTime\n  status    String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  finding Finding @relation(fields: [findingId], references: [id])\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"Audit\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"findings\",\"kind\":\"object\",\"type\":\"Finding\",\"relationName\":\"AuditToFinding\"}],\"dbName\":null},\"Finding\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"auditId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"severity\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"audit\",\"kind\":\"object\",\"type\":\"Audit\",\"relationName\":\"AuditToFinding\"},{\"name\":\"actionPlans\",\"kind\":\"object\",\"type\":\"ActionPlan\",\"relationName\":\"ActionPlanToFinding\"}],\"dbName\":null},\"ActionPlan\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"findingId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"owner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"dueDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"finding\",\"kind\":\"object\",\"type\":\"Finding\",\"relationName\":\"ActionPlanToFinding\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}");
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await import('node:buffer');
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await import("@prisma/client/runtime/query_compiler_bg.mysql.mjs"),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await import("@prisma/client/runtime/query_compiler_bg.mysql.wasm-base64.mjs");
        return await decodeBase64AsWasm(wasm);
    }
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map