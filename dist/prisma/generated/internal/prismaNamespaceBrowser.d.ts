import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models.js';
export type * from './prismaNamespace.js';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: any;
export declare const JsonNull: any;
export declare const AnyNull: any;
export declare const ModelName: {
    readonly Audit: "Audit";
    readonly Finding: "Finding";
    readonly ActionPlan: "ActionPlan";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const AuditScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly type: "type";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type AuditScalarFieldEnum = (typeof AuditScalarFieldEnum)[keyof typeof AuditScalarFieldEnum];
export declare const FindingScalarFieldEnum: {
    readonly id: "id";
    readonly auditId: "auditId";
    readonly description: "description";
    readonly severity: "severity";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type FindingScalarFieldEnum = (typeof FindingScalarFieldEnum)[keyof typeof FindingScalarFieldEnum];
export declare const ActionPlanScalarFieldEnum: {
    readonly id: "id";
    readonly findingId: "findingId";
    readonly owner: "owner";
    readonly dueDate: "dueDate";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ActionPlanScalarFieldEnum = (typeof ActionPlanScalarFieldEnum)[keyof typeof ActionPlanScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const AuditOrderByRelevanceFieldEnum: {
    readonly name: "name";
    readonly type: "type";
    readonly status: "status";
};
export type AuditOrderByRelevanceFieldEnum = (typeof AuditOrderByRelevanceFieldEnum)[keyof typeof AuditOrderByRelevanceFieldEnum];
export declare const FindingOrderByRelevanceFieldEnum: {
    readonly description: "description";
    readonly severity: "severity";
    readonly status: "status";
};
export type FindingOrderByRelevanceFieldEnum = (typeof FindingOrderByRelevanceFieldEnum)[keyof typeof FindingOrderByRelevanceFieldEnum];
export declare const ActionPlanOrderByRelevanceFieldEnum: {
    readonly owner: "owner";
    readonly status: "status";
};
export type ActionPlanOrderByRelevanceFieldEnum = (typeof ActionPlanOrderByRelevanceFieldEnum)[keyof typeof ActionPlanOrderByRelevanceFieldEnum];
