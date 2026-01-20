import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type FindingModel = runtime.Types.Result.DefaultSelection<Prisma.$FindingPayload>;
export type AggregateFinding = {
    _count: FindingCountAggregateOutputType | null;
    _avg: FindingAvgAggregateOutputType | null;
    _sum: FindingSumAggregateOutputType | null;
    _min: FindingMinAggregateOutputType | null;
    _max: FindingMaxAggregateOutputType | null;
};
export type FindingAvgAggregateOutputType = {
    id: number | null;
    auditId: number | null;
};
export type FindingSumAggregateOutputType = {
    id: number | null;
    auditId: number | null;
};
export type FindingMinAggregateOutputType = {
    id: number | null;
    auditId: number | null;
    description: string | null;
    severity: string | null;
    status: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type FindingMaxAggregateOutputType = {
    id: number | null;
    auditId: number | null;
    description: string | null;
    severity: string | null;
    status: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type FindingCountAggregateOutputType = {
    id: number;
    auditId: number;
    description: number;
    severity: number;
    status: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type FindingAvgAggregateInputType = {
    id?: true;
    auditId?: true;
};
export type FindingSumAggregateInputType = {
    id?: true;
    auditId?: true;
};
export type FindingMinAggregateInputType = {
    id?: true;
    auditId?: true;
    description?: true;
    severity?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type FindingMaxAggregateInputType = {
    id?: true;
    auditId?: true;
    description?: true;
    severity?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type FindingCountAggregateInputType = {
    id?: true;
    auditId?: true;
    description?: true;
    severity?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type FindingAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FindingWhereInput;
    orderBy?: Prisma.FindingOrderByWithRelationInput | Prisma.FindingOrderByWithRelationInput[];
    cursor?: Prisma.FindingWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | FindingCountAggregateInputType;
    _avg?: FindingAvgAggregateInputType;
    _sum?: FindingSumAggregateInputType;
    _min?: FindingMinAggregateInputType;
    _max?: FindingMaxAggregateInputType;
};
export type GetFindingAggregateType<T extends FindingAggregateArgs> = {
    [P in keyof T & keyof AggregateFinding]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateFinding[P]> : Prisma.GetScalarType<T[P], AggregateFinding[P]>;
};
export type FindingGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FindingWhereInput;
    orderBy?: Prisma.FindingOrderByWithAggregationInput | Prisma.FindingOrderByWithAggregationInput[];
    by: Prisma.FindingScalarFieldEnum[] | Prisma.FindingScalarFieldEnum;
    having?: Prisma.FindingScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: FindingCountAggregateInputType | true;
    _avg?: FindingAvgAggregateInputType;
    _sum?: FindingSumAggregateInputType;
    _min?: FindingMinAggregateInputType;
    _max?: FindingMaxAggregateInputType;
};
export type FindingGroupByOutputType = {
    id: number;
    auditId: number;
    description: string;
    severity: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    _count: FindingCountAggregateOutputType | null;
    _avg: FindingAvgAggregateOutputType | null;
    _sum: FindingSumAggregateOutputType | null;
    _min: FindingMinAggregateOutputType | null;
    _max: FindingMaxAggregateOutputType | null;
};
type GetFindingGroupByPayload<T extends FindingGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<FindingGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof FindingGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], FindingGroupByOutputType[P]> : Prisma.GetScalarType<T[P], FindingGroupByOutputType[P]>;
}>>;
export type FindingWhereInput = {
    AND?: Prisma.FindingWhereInput | Prisma.FindingWhereInput[];
    OR?: Prisma.FindingWhereInput[];
    NOT?: Prisma.FindingWhereInput | Prisma.FindingWhereInput[];
    id?: Prisma.IntFilter<"Finding"> | number;
    auditId?: Prisma.IntFilter<"Finding"> | number;
    description?: Prisma.StringFilter<"Finding"> | string;
    severity?: Prisma.StringFilter<"Finding"> | string;
    status?: Prisma.StringFilter<"Finding"> | string;
    createdAt?: Prisma.DateTimeFilter<"Finding"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Finding"> | Date | string;
    audit?: Prisma.XOR<Prisma.AuditScalarRelationFilter, Prisma.AuditWhereInput>;
    actionPlans?: Prisma.ActionPlanListRelationFilter;
};
export type FindingOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    auditId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    audit?: Prisma.AuditOrderByWithRelationInput;
    actionPlans?: Prisma.ActionPlanOrderByRelationAggregateInput;
    _relevance?: Prisma.FindingOrderByRelevanceInput;
};
export type FindingWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.FindingWhereInput | Prisma.FindingWhereInput[];
    OR?: Prisma.FindingWhereInput[];
    NOT?: Prisma.FindingWhereInput | Prisma.FindingWhereInput[];
    auditId?: Prisma.IntFilter<"Finding"> | number;
    description?: Prisma.StringFilter<"Finding"> | string;
    severity?: Prisma.StringFilter<"Finding"> | string;
    status?: Prisma.StringFilter<"Finding"> | string;
    createdAt?: Prisma.DateTimeFilter<"Finding"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Finding"> | Date | string;
    audit?: Prisma.XOR<Prisma.AuditScalarRelationFilter, Prisma.AuditWhereInput>;
    actionPlans?: Prisma.ActionPlanListRelationFilter;
}, "id">;
export type FindingOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    auditId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.FindingCountOrderByAggregateInput;
    _avg?: Prisma.FindingAvgOrderByAggregateInput;
    _max?: Prisma.FindingMaxOrderByAggregateInput;
    _min?: Prisma.FindingMinOrderByAggregateInput;
    _sum?: Prisma.FindingSumOrderByAggregateInput;
};
export type FindingScalarWhereWithAggregatesInput = {
    AND?: Prisma.FindingScalarWhereWithAggregatesInput | Prisma.FindingScalarWhereWithAggregatesInput[];
    OR?: Prisma.FindingScalarWhereWithAggregatesInput[];
    NOT?: Prisma.FindingScalarWhereWithAggregatesInput | Prisma.FindingScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Finding"> | number;
    auditId?: Prisma.IntWithAggregatesFilter<"Finding"> | number;
    description?: Prisma.StringWithAggregatesFilter<"Finding"> | string;
    severity?: Prisma.StringWithAggregatesFilter<"Finding"> | string;
    status?: Prisma.StringWithAggregatesFilter<"Finding"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Finding"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Finding"> | Date | string;
};
export type FindingCreateInput = {
    description: string;
    severity: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    audit: Prisma.AuditCreateNestedOneWithoutFindingsInput;
    actionPlans?: Prisma.ActionPlanCreateNestedManyWithoutFindingInput;
};
export type FindingUncheckedCreateInput = {
    id?: number;
    auditId: number;
    description: string;
    severity: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    actionPlans?: Prisma.ActionPlanUncheckedCreateNestedManyWithoutFindingInput;
};
export type FindingUpdateInput = {
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    audit?: Prisma.AuditUpdateOneRequiredWithoutFindingsNestedInput;
    actionPlans?: Prisma.ActionPlanUpdateManyWithoutFindingNestedInput;
};
export type FindingUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    auditId?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    actionPlans?: Prisma.ActionPlanUncheckedUpdateManyWithoutFindingNestedInput;
};
export type FindingCreateManyInput = {
    id?: number;
    auditId: number;
    description: string;
    severity: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type FindingUpdateManyMutationInput = {
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FindingUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    auditId?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FindingListRelationFilter = {
    every?: Prisma.FindingWhereInput;
    some?: Prisma.FindingWhereInput;
    none?: Prisma.FindingWhereInput;
};
export type FindingOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type FindingOrderByRelevanceInput = {
    fields: Prisma.FindingOrderByRelevanceFieldEnum | Prisma.FindingOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type FindingCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    auditId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type FindingAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    auditId?: Prisma.SortOrder;
};
export type FindingMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    auditId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type FindingMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    auditId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    severity?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type FindingSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    auditId?: Prisma.SortOrder;
};
export type FindingScalarRelationFilter = {
    is?: Prisma.FindingWhereInput;
    isNot?: Prisma.FindingWhereInput;
};
export type FindingCreateNestedManyWithoutAuditInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutAuditInput, Prisma.FindingUncheckedCreateWithoutAuditInput> | Prisma.FindingCreateWithoutAuditInput[] | Prisma.FindingUncheckedCreateWithoutAuditInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutAuditInput | Prisma.FindingCreateOrConnectWithoutAuditInput[];
    createMany?: Prisma.FindingCreateManyAuditInputEnvelope;
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
};
export type FindingUncheckedCreateNestedManyWithoutAuditInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutAuditInput, Prisma.FindingUncheckedCreateWithoutAuditInput> | Prisma.FindingCreateWithoutAuditInput[] | Prisma.FindingUncheckedCreateWithoutAuditInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutAuditInput | Prisma.FindingCreateOrConnectWithoutAuditInput[];
    createMany?: Prisma.FindingCreateManyAuditInputEnvelope;
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
};
export type FindingUpdateManyWithoutAuditNestedInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutAuditInput, Prisma.FindingUncheckedCreateWithoutAuditInput> | Prisma.FindingCreateWithoutAuditInput[] | Prisma.FindingUncheckedCreateWithoutAuditInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutAuditInput | Prisma.FindingCreateOrConnectWithoutAuditInput[];
    upsert?: Prisma.FindingUpsertWithWhereUniqueWithoutAuditInput | Prisma.FindingUpsertWithWhereUniqueWithoutAuditInput[];
    createMany?: Prisma.FindingCreateManyAuditInputEnvelope;
    set?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    disconnect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    delete?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    update?: Prisma.FindingUpdateWithWhereUniqueWithoutAuditInput | Prisma.FindingUpdateWithWhereUniqueWithoutAuditInput[];
    updateMany?: Prisma.FindingUpdateManyWithWhereWithoutAuditInput | Prisma.FindingUpdateManyWithWhereWithoutAuditInput[];
    deleteMany?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
};
export type FindingUncheckedUpdateManyWithoutAuditNestedInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutAuditInput, Prisma.FindingUncheckedCreateWithoutAuditInput> | Prisma.FindingCreateWithoutAuditInput[] | Prisma.FindingUncheckedCreateWithoutAuditInput[];
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutAuditInput | Prisma.FindingCreateOrConnectWithoutAuditInput[];
    upsert?: Prisma.FindingUpsertWithWhereUniqueWithoutAuditInput | Prisma.FindingUpsertWithWhereUniqueWithoutAuditInput[];
    createMany?: Prisma.FindingCreateManyAuditInputEnvelope;
    set?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    disconnect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    delete?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    connect?: Prisma.FindingWhereUniqueInput | Prisma.FindingWhereUniqueInput[];
    update?: Prisma.FindingUpdateWithWhereUniqueWithoutAuditInput | Prisma.FindingUpdateWithWhereUniqueWithoutAuditInput[];
    updateMany?: Prisma.FindingUpdateManyWithWhereWithoutAuditInput | Prisma.FindingUpdateManyWithWhereWithoutAuditInput[];
    deleteMany?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
};
export type FindingCreateNestedOneWithoutActionPlansInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutActionPlansInput, Prisma.FindingUncheckedCreateWithoutActionPlansInput>;
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutActionPlansInput;
    connect?: Prisma.FindingWhereUniqueInput;
};
export type FindingUpdateOneRequiredWithoutActionPlansNestedInput = {
    create?: Prisma.XOR<Prisma.FindingCreateWithoutActionPlansInput, Prisma.FindingUncheckedCreateWithoutActionPlansInput>;
    connectOrCreate?: Prisma.FindingCreateOrConnectWithoutActionPlansInput;
    upsert?: Prisma.FindingUpsertWithoutActionPlansInput;
    connect?: Prisma.FindingWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.FindingUpdateToOneWithWhereWithoutActionPlansInput, Prisma.FindingUpdateWithoutActionPlansInput>, Prisma.FindingUncheckedUpdateWithoutActionPlansInput>;
};
export type FindingCreateWithoutAuditInput = {
    description: string;
    severity: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    actionPlans?: Prisma.ActionPlanCreateNestedManyWithoutFindingInput;
};
export type FindingUncheckedCreateWithoutAuditInput = {
    id?: number;
    description: string;
    severity: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    actionPlans?: Prisma.ActionPlanUncheckedCreateNestedManyWithoutFindingInput;
};
export type FindingCreateOrConnectWithoutAuditInput = {
    where: Prisma.FindingWhereUniqueInput;
    create: Prisma.XOR<Prisma.FindingCreateWithoutAuditInput, Prisma.FindingUncheckedCreateWithoutAuditInput>;
};
export type FindingCreateManyAuditInputEnvelope = {
    data: Prisma.FindingCreateManyAuditInput | Prisma.FindingCreateManyAuditInput[];
    skipDuplicates?: boolean;
};
export type FindingUpsertWithWhereUniqueWithoutAuditInput = {
    where: Prisma.FindingWhereUniqueInput;
    update: Prisma.XOR<Prisma.FindingUpdateWithoutAuditInput, Prisma.FindingUncheckedUpdateWithoutAuditInput>;
    create: Prisma.XOR<Prisma.FindingCreateWithoutAuditInput, Prisma.FindingUncheckedCreateWithoutAuditInput>;
};
export type FindingUpdateWithWhereUniqueWithoutAuditInput = {
    where: Prisma.FindingWhereUniqueInput;
    data: Prisma.XOR<Prisma.FindingUpdateWithoutAuditInput, Prisma.FindingUncheckedUpdateWithoutAuditInput>;
};
export type FindingUpdateManyWithWhereWithoutAuditInput = {
    where: Prisma.FindingScalarWhereInput;
    data: Prisma.XOR<Prisma.FindingUpdateManyMutationInput, Prisma.FindingUncheckedUpdateManyWithoutAuditInput>;
};
export type FindingScalarWhereInput = {
    AND?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
    OR?: Prisma.FindingScalarWhereInput[];
    NOT?: Prisma.FindingScalarWhereInput | Prisma.FindingScalarWhereInput[];
    id?: Prisma.IntFilter<"Finding"> | number;
    auditId?: Prisma.IntFilter<"Finding"> | number;
    description?: Prisma.StringFilter<"Finding"> | string;
    severity?: Prisma.StringFilter<"Finding"> | string;
    status?: Prisma.StringFilter<"Finding"> | string;
    createdAt?: Prisma.DateTimeFilter<"Finding"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Finding"> | Date | string;
};
export type FindingCreateWithoutActionPlansInput = {
    description: string;
    severity: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    audit: Prisma.AuditCreateNestedOneWithoutFindingsInput;
};
export type FindingUncheckedCreateWithoutActionPlansInput = {
    id?: number;
    auditId: number;
    description: string;
    severity: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type FindingCreateOrConnectWithoutActionPlansInput = {
    where: Prisma.FindingWhereUniqueInput;
    create: Prisma.XOR<Prisma.FindingCreateWithoutActionPlansInput, Prisma.FindingUncheckedCreateWithoutActionPlansInput>;
};
export type FindingUpsertWithoutActionPlansInput = {
    update: Prisma.XOR<Prisma.FindingUpdateWithoutActionPlansInput, Prisma.FindingUncheckedUpdateWithoutActionPlansInput>;
    create: Prisma.XOR<Prisma.FindingCreateWithoutActionPlansInput, Prisma.FindingUncheckedCreateWithoutActionPlansInput>;
    where?: Prisma.FindingWhereInput;
};
export type FindingUpdateToOneWithWhereWithoutActionPlansInput = {
    where?: Prisma.FindingWhereInput;
    data: Prisma.XOR<Prisma.FindingUpdateWithoutActionPlansInput, Prisma.FindingUncheckedUpdateWithoutActionPlansInput>;
};
export type FindingUpdateWithoutActionPlansInput = {
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    audit?: Prisma.AuditUpdateOneRequiredWithoutFindingsNestedInput;
};
export type FindingUncheckedUpdateWithoutActionPlansInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    auditId?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FindingCreateManyAuditInput = {
    id?: number;
    description: string;
    severity: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type FindingUpdateWithoutAuditInput = {
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    actionPlans?: Prisma.ActionPlanUpdateManyWithoutFindingNestedInput;
};
export type FindingUncheckedUpdateWithoutAuditInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    actionPlans?: Prisma.ActionPlanUncheckedUpdateManyWithoutFindingNestedInput;
};
export type FindingUncheckedUpdateManyWithoutAuditInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    severity?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type FindingCountOutputType = {
    actionPlans: number;
};
export type FindingCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    actionPlans?: boolean | FindingCountOutputTypeCountActionPlansArgs;
};
export type FindingCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingCountOutputTypeSelect<ExtArgs> | null;
};
export type FindingCountOutputTypeCountActionPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ActionPlanWhereInput;
};
export type FindingSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    auditId?: boolean;
    description?: boolean;
    severity?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    audit?: boolean | Prisma.AuditDefaultArgs<ExtArgs>;
    actionPlans?: boolean | Prisma.Finding$actionPlansArgs<ExtArgs>;
    _count?: boolean | Prisma.FindingCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["finding"]>;
export type FindingSelectScalar = {
    id?: boolean;
    auditId?: boolean;
    description?: boolean;
    severity?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type FindingOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "auditId" | "description" | "severity" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["finding"]>;
export type FindingInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    audit?: boolean | Prisma.AuditDefaultArgs<ExtArgs>;
    actionPlans?: boolean | Prisma.Finding$actionPlansArgs<ExtArgs>;
    _count?: boolean | Prisma.FindingCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $FindingPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Finding";
    objects: {
        audit: Prisma.$AuditPayload<ExtArgs>;
        actionPlans: Prisma.$ActionPlanPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        auditId: number;
        description: string;
        severity: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["finding"]>;
    composites: {};
};
export type FindingGetPayload<S extends boolean | null | undefined | FindingDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$FindingPayload, S>;
export type FindingCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<FindingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: FindingCountAggregateInputType | true;
};
export interface FindingDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Finding'];
        meta: {
            name: 'Finding';
        };
    };
    findUnique<T extends FindingFindUniqueArgs>(args: Prisma.SelectSubset<T, FindingFindUniqueArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends FindingFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, FindingFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends FindingFindFirstArgs>(args?: Prisma.SelectSubset<T, FindingFindFirstArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends FindingFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, FindingFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends FindingFindManyArgs>(args?: Prisma.SelectSubset<T, FindingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends FindingCreateArgs>(args: Prisma.SelectSubset<T, FindingCreateArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends FindingCreateManyArgs>(args?: Prisma.SelectSubset<T, FindingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends FindingDeleteArgs>(args: Prisma.SelectSubset<T, FindingDeleteArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends FindingUpdateArgs>(args: Prisma.SelectSubset<T, FindingUpdateArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends FindingDeleteManyArgs>(args?: Prisma.SelectSubset<T, FindingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends FindingUpdateManyArgs>(args: Prisma.SelectSubset<T, FindingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends FindingUpsertArgs>(args: Prisma.SelectSubset<T, FindingUpsertArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends FindingCountArgs>(args?: Prisma.Subset<T, FindingCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], FindingCountAggregateOutputType> : number>;
    aggregate<T extends FindingAggregateArgs>(args: Prisma.Subset<T, FindingAggregateArgs>): Prisma.PrismaPromise<GetFindingAggregateType<T>>;
    groupBy<T extends FindingGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: FindingGroupByArgs['orderBy'];
    } : {
        orderBy?: FindingGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, FindingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFindingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: FindingFieldRefs;
}
export interface Prisma__FindingClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    audit<T extends Prisma.AuditDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.AuditDefaultArgs<ExtArgs>>): Prisma.Prisma__AuditClient<runtime.Types.Result.GetResult<Prisma.$AuditPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    actionPlans<T extends Prisma.Finding$actionPlansArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Finding$actionPlansArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface FindingFieldRefs {
    readonly id: Prisma.FieldRef<"Finding", 'Int'>;
    readonly auditId: Prisma.FieldRef<"Finding", 'Int'>;
    readonly description: Prisma.FieldRef<"Finding", 'String'>;
    readonly severity: Prisma.FieldRef<"Finding", 'String'>;
    readonly status: Prisma.FieldRef<"Finding", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Finding", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Finding", 'DateTime'>;
}
export type FindingFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where: Prisma.FindingWhereUniqueInput;
};
export type FindingFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where: Prisma.FindingWhereUniqueInput;
};
export type FindingFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where?: Prisma.FindingWhereInput;
    orderBy?: Prisma.FindingOrderByWithRelationInput | Prisma.FindingOrderByWithRelationInput[];
    cursor?: Prisma.FindingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FindingScalarFieldEnum | Prisma.FindingScalarFieldEnum[];
};
export type FindingFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where?: Prisma.FindingWhereInput;
    orderBy?: Prisma.FindingOrderByWithRelationInput | Prisma.FindingOrderByWithRelationInput[];
    cursor?: Prisma.FindingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FindingScalarFieldEnum | Prisma.FindingScalarFieldEnum[];
};
export type FindingFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where?: Prisma.FindingWhereInput;
    orderBy?: Prisma.FindingOrderByWithRelationInput | Prisma.FindingOrderByWithRelationInput[];
    cursor?: Prisma.FindingWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.FindingScalarFieldEnum | Prisma.FindingScalarFieldEnum[];
};
export type FindingCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FindingCreateInput, Prisma.FindingUncheckedCreateInput>;
};
export type FindingCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.FindingCreateManyInput | Prisma.FindingCreateManyInput[];
    skipDuplicates?: boolean;
};
export type FindingUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.FindingUpdateInput, Prisma.FindingUncheckedUpdateInput>;
    where: Prisma.FindingWhereUniqueInput;
};
export type FindingUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.FindingUpdateManyMutationInput, Prisma.FindingUncheckedUpdateManyInput>;
    where?: Prisma.FindingWhereInput;
    limit?: number;
};
export type FindingUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where: Prisma.FindingWhereUniqueInput;
    create: Prisma.XOR<Prisma.FindingCreateInput, Prisma.FindingUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.FindingUpdateInput, Prisma.FindingUncheckedUpdateInput>;
};
export type FindingDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
    where: Prisma.FindingWhereUniqueInput;
};
export type FindingDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FindingWhereInput;
    limit?: number;
};
export type Finding$actionPlansArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    where?: Prisma.ActionPlanWhereInput;
    orderBy?: Prisma.ActionPlanOrderByWithRelationInput | Prisma.ActionPlanOrderByWithRelationInput[];
    cursor?: Prisma.ActionPlanWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ActionPlanScalarFieldEnum | Prisma.ActionPlanScalarFieldEnum[];
};
export type FindingDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.FindingSelect<ExtArgs> | null;
    omit?: Prisma.FindingOmit<ExtArgs> | null;
    include?: Prisma.FindingInclude<ExtArgs> | null;
};
export {};
