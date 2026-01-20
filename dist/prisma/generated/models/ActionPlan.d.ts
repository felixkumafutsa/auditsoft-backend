import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ActionPlanModel = runtime.Types.Result.DefaultSelection<Prisma.$ActionPlanPayload>;
export type AggregateActionPlan = {
    _count: ActionPlanCountAggregateOutputType | null;
    _avg: ActionPlanAvgAggregateOutputType | null;
    _sum: ActionPlanSumAggregateOutputType | null;
    _min: ActionPlanMinAggregateOutputType | null;
    _max: ActionPlanMaxAggregateOutputType | null;
};
export type ActionPlanAvgAggregateOutputType = {
    id: number | null;
    findingId: number | null;
};
export type ActionPlanSumAggregateOutputType = {
    id: number | null;
    findingId: number | null;
};
export type ActionPlanMinAggregateOutputType = {
    id: number | null;
    findingId: number | null;
    owner: string | null;
    dueDate: Date | null;
    status: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ActionPlanMaxAggregateOutputType = {
    id: number | null;
    findingId: number | null;
    owner: string | null;
    dueDate: Date | null;
    status: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ActionPlanCountAggregateOutputType = {
    id: number;
    findingId: number;
    owner: number;
    dueDate: number;
    status: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ActionPlanAvgAggregateInputType = {
    id?: true;
    findingId?: true;
};
export type ActionPlanSumAggregateInputType = {
    id?: true;
    findingId?: true;
};
export type ActionPlanMinAggregateInputType = {
    id?: true;
    findingId?: true;
    owner?: true;
    dueDate?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ActionPlanMaxAggregateInputType = {
    id?: true;
    findingId?: true;
    owner?: true;
    dueDate?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ActionPlanCountAggregateInputType = {
    id?: true;
    findingId?: true;
    owner?: true;
    dueDate?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ActionPlanAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ActionPlanWhereInput;
    orderBy?: Prisma.ActionPlanOrderByWithRelationInput | Prisma.ActionPlanOrderByWithRelationInput[];
    cursor?: Prisma.ActionPlanWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ActionPlanCountAggregateInputType;
    _avg?: ActionPlanAvgAggregateInputType;
    _sum?: ActionPlanSumAggregateInputType;
    _min?: ActionPlanMinAggregateInputType;
    _max?: ActionPlanMaxAggregateInputType;
};
export type GetActionPlanAggregateType<T extends ActionPlanAggregateArgs> = {
    [P in keyof T & keyof AggregateActionPlan]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateActionPlan[P]> : Prisma.GetScalarType<T[P], AggregateActionPlan[P]>;
};
export type ActionPlanGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ActionPlanWhereInput;
    orderBy?: Prisma.ActionPlanOrderByWithAggregationInput | Prisma.ActionPlanOrderByWithAggregationInput[];
    by: Prisma.ActionPlanScalarFieldEnum[] | Prisma.ActionPlanScalarFieldEnum;
    having?: Prisma.ActionPlanScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ActionPlanCountAggregateInputType | true;
    _avg?: ActionPlanAvgAggregateInputType;
    _sum?: ActionPlanSumAggregateInputType;
    _min?: ActionPlanMinAggregateInputType;
    _max?: ActionPlanMaxAggregateInputType;
};
export type ActionPlanGroupByOutputType = {
    id: number;
    findingId: number;
    owner: string;
    dueDate: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    _count: ActionPlanCountAggregateOutputType | null;
    _avg: ActionPlanAvgAggregateOutputType | null;
    _sum: ActionPlanSumAggregateOutputType | null;
    _min: ActionPlanMinAggregateOutputType | null;
    _max: ActionPlanMaxAggregateOutputType | null;
};
type GetActionPlanGroupByPayload<T extends ActionPlanGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ActionPlanGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ActionPlanGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ActionPlanGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ActionPlanGroupByOutputType[P]>;
}>>;
export type ActionPlanWhereInput = {
    AND?: Prisma.ActionPlanWhereInput | Prisma.ActionPlanWhereInput[];
    OR?: Prisma.ActionPlanWhereInput[];
    NOT?: Prisma.ActionPlanWhereInput | Prisma.ActionPlanWhereInput[];
    id?: Prisma.IntFilter<"ActionPlan"> | number;
    findingId?: Prisma.IntFilter<"ActionPlan"> | number;
    owner?: Prisma.StringFilter<"ActionPlan"> | string;
    dueDate?: Prisma.DateTimeFilter<"ActionPlan"> | Date | string;
    status?: Prisma.StringFilter<"ActionPlan"> | string;
    createdAt?: Prisma.DateTimeFilter<"ActionPlan"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ActionPlan"> | Date | string;
    finding?: Prisma.XOR<Prisma.FindingScalarRelationFilter, Prisma.FindingWhereInput>;
};
export type ActionPlanOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    findingId?: Prisma.SortOrder;
    owner?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    finding?: Prisma.FindingOrderByWithRelationInput;
    _relevance?: Prisma.ActionPlanOrderByRelevanceInput;
};
export type ActionPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.ActionPlanWhereInput | Prisma.ActionPlanWhereInput[];
    OR?: Prisma.ActionPlanWhereInput[];
    NOT?: Prisma.ActionPlanWhereInput | Prisma.ActionPlanWhereInput[];
    findingId?: Prisma.IntFilter<"ActionPlan"> | number;
    owner?: Prisma.StringFilter<"ActionPlan"> | string;
    dueDate?: Prisma.DateTimeFilter<"ActionPlan"> | Date | string;
    status?: Prisma.StringFilter<"ActionPlan"> | string;
    createdAt?: Prisma.DateTimeFilter<"ActionPlan"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ActionPlan"> | Date | string;
    finding?: Prisma.XOR<Prisma.FindingScalarRelationFilter, Prisma.FindingWhereInput>;
}, "id">;
export type ActionPlanOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    findingId?: Prisma.SortOrder;
    owner?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ActionPlanCountOrderByAggregateInput;
    _avg?: Prisma.ActionPlanAvgOrderByAggregateInput;
    _max?: Prisma.ActionPlanMaxOrderByAggregateInput;
    _min?: Prisma.ActionPlanMinOrderByAggregateInput;
    _sum?: Prisma.ActionPlanSumOrderByAggregateInput;
};
export type ActionPlanScalarWhereWithAggregatesInput = {
    AND?: Prisma.ActionPlanScalarWhereWithAggregatesInput | Prisma.ActionPlanScalarWhereWithAggregatesInput[];
    OR?: Prisma.ActionPlanScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ActionPlanScalarWhereWithAggregatesInput | Prisma.ActionPlanScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"ActionPlan"> | number;
    findingId?: Prisma.IntWithAggregatesFilter<"ActionPlan"> | number;
    owner?: Prisma.StringWithAggregatesFilter<"ActionPlan"> | string;
    dueDate?: Prisma.DateTimeWithAggregatesFilter<"ActionPlan"> | Date | string;
    status?: Prisma.StringWithAggregatesFilter<"ActionPlan"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ActionPlan"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ActionPlan"> | Date | string;
};
export type ActionPlanCreateInput = {
    owner: string;
    dueDate: Date | string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    finding: Prisma.FindingCreateNestedOneWithoutActionPlansInput;
};
export type ActionPlanUncheckedCreateInput = {
    id?: number;
    findingId: number;
    owner: string;
    dueDate: Date | string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ActionPlanUpdateInput = {
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    finding?: Prisma.FindingUpdateOneRequiredWithoutActionPlansNestedInput;
};
export type ActionPlanUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    findingId?: Prisma.IntFieldUpdateOperationsInput | number;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ActionPlanCreateManyInput = {
    id?: number;
    findingId: number;
    owner: string;
    dueDate: Date | string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ActionPlanUpdateManyMutationInput = {
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ActionPlanUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    findingId?: Prisma.IntFieldUpdateOperationsInput | number;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ActionPlanListRelationFilter = {
    every?: Prisma.ActionPlanWhereInput;
    some?: Prisma.ActionPlanWhereInput;
    none?: Prisma.ActionPlanWhereInput;
};
export type ActionPlanOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ActionPlanOrderByRelevanceInput = {
    fields: Prisma.ActionPlanOrderByRelevanceFieldEnum | Prisma.ActionPlanOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type ActionPlanCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    findingId?: Prisma.SortOrder;
    owner?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ActionPlanAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    findingId?: Prisma.SortOrder;
};
export type ActionPlanMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    findingId?: Prisma.SortOrder;
    owner?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ActionPlanMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    findingId?: Prisma.SortOrder;
    owner?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ActionPlanSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    findingId?: Prisma.SortOrder;
};
export type ActionPlanCreateNestedManyWithoutFindingInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutFindingInput, Prisma.ActionPlanUncheckedCreateWithoutFindingInput> | Prisma.ActionPlanCreateWithoutFindingInput[] | Prisma.ActionPlanUncheckedCreateWithoutFindingInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutFindingInput | Prisma.ActionPlanCreateOrConnectWithoutFindingInput[];
    createMany?: Prisma.ActionPlanCreateManyFindingInputEnvelope;
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
};
export type ActionPlanUncheckedCreateNestedManyWithoutFindingInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutFindingInput, Prisma.ActionPlanUncheckedCreateWithoutFindingInput> | Prisma.ActionPlanCreateWithoutFindingInput[] | Prisma.ActionPlanUncheckedCreateWithoutFindingInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutFindingInput | Prisma.ActionPlanCreateOrConnectWithoutFindingInput[];
    createMany?: Prisma.ActionPlanCreateManyFindingInputEnvelope;
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
};
export type ActionPlanUpdateManyWithoutFindingNestedInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutFindingInput, Prisma.ActionPlanUncheckedCreateWithoutFindingInput> | Prisma.ActionPlanCreateWithoutFindingInput[] | Prisma.ActionPlanUncheckedCreateWithoutFindingInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutFindingInput | Prisma.ActionPlanCreateOrConnectWithoutFindingInput[];
    upsert?: Prisma.ActionPlanUpsertWithWhereUniqueWithoutFindingInput | Prisma.ActionPlanUpsertWithWhereUniqueWithoutFindingInput[];
    createMany?: Prisma.ActionPlanCreateManyFindingInputEnvelope;
    set?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    disconnect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    delete?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    update?: Prisma.ActionPlanUpdateWithWhereUniqueWithoutFindingInput | Prisma.ActionPlanUpdateWithWhereUniqueWithoutFindingInput[];
    updateMany?: Prisma.ActionPlanUpdateManyWithWhereWithoutFindingInput | Prisma.ActionPlanUpdateManyWithWhereWithoutFindingInput[];
    deleteMany?: Prisma.ActionPlanScalarWhereInput | Prisma.ActionPlanScalarWhereInput[];
};
export type ActionPlanUncheckedUpdateManyWithoutFindingNestedInput = {
    create?: Prisma.XOR<Prisma.ActionPlanCreateWithoutFindingInput, Prisma.ActionPlanUncheckedCreateWithoutFindingInput> | Prisma.ActionPlanCreateWithoutFindingInput[] | Prisma.ActionPlanUncheckedCreateWithoutFindingInput[];
    connectOrCreate?: Prisma.ActionPlanCreateOrConnectWithoutFindingInput | Prisma.ActionPlanCreateOrConnectWithoutFindingInput[];
    upsert?: Prisma.ActionPlanUpsertWithWhereUniqueWithoutFindingInput | Prisma.ActionPlanUpsertWithWhereUniqueWithoutFindingInput[];
    createMany?: Prisma.ActionPlanCreateManyFindingInputEnvelope;
    set?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    disconnect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    delete?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    connect?: Prisma.ActionPlanWhereUniqueInput | Prisma.ActionPlanWhereUniqueInput[];
    update?: Prisma.ActionPlanUpdateWithWhereUniqueWithoutFindingInput | Prisma.ActionPlanUpdateWithWhereUniqueWithoutFindingInput[];
    updateMany?: Prisma.ActionPlanUpdateManyWithWhereWithoutFindingInput | Prisma.ActionPlanUpdateManyWithWhereWithoutFindingInput[];
    deleteMany?: Prisma.ActionPlanScalarWhereInput | Prisma.ActionPlanScalarWhereInput[];
};
export type ActionPlanCreateWithoutFindingInput = {
    owner: string;
    dueDate: Date | string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ActionPlanUncheckedCreateWithoutFindingInput = {
    id?: number;
    owner: string;
    dueDate: Date | string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ActionPlanCreateOrConnectWithoutFindingInput = {
    where: Prisma.ActionPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.ActionPlanCreateWithoutFindingInput, Prisma.ActionPlanUncheckedCreateWithoutFindingInput>;
};
export type ActionPlanCreateManyFindingInputEnvelope = {
    data: Prisma.ActionPlanCreateManyFindingInput | Prisma.ActionPlanCreateManyFindingInput[];
    skipDuplicates?: boolean;
};
export type ActionPlanUpsertWithWhereUniqueWithoutFindingInput = {
    where: Prisma.ActionPlanWhereUniqueInput;
    update: Prisma.XOR<Prisma.ActionPlanUpdateWithoutFindingInput, Prisma.ActionPlanUncheckedUpdateWithoutFindingInput>;
    create: Prisma.XOR<Prisma.ActionPlanCreateWithoutFindingInput, Prisma.ActionPlanUncheckedCreateWithoutFindingInput>;
};
export type ActionPlanUpdateWithWhereUniqueWithoutFindingInput = {
    where: Prisma.ActionPlanWhereUniqueInput;
    data: Prisma.XOR<Prisma.ActionPlanUpdateWithoutFindingInput, Prisma.ActionPlanUncheckedUpdateWithoutFindingInput>;
};
export type ActionPlanUpdateManyWithWhereWithoutFindingInput = {
    where: Prisma.ActionPlanScalarWhereInput;
    data: Prisma.XOR<Prisma.ActionPlanUpdateManyMutationInput, Prisma.ActionPlanUncheckedUpdateManyWithoutFindingInput>;
};
export type ActionPlanScalarWhereInput = {
    AND?: Prisma.ActionPlanScalarWhereInput | Prisma.ActionPlanScalarWhereInput[];
    OR?: Prisma.ActionPlanScalarWhereInput[];
    NOT?: Prisma.ActionPlanScalarWhereInput | Prisma.ActionPlanScalarWhereInput[];
    id?: Prisma.IntFilter<"ActionPlan"> | number;
    findingId?: Prisma.IntFilter<"ActionPlan"> | number;
    owner?: Prisma.StringFilter<"ActionPlan"> | string;
    dueDate?: Prisma.DateTimeFilter<"ActionPlan"> | Date | string;
    status?: Prisma.StringFilter<"ActionPlan"> | string;
    createdAt?: Prisma.DateTimeFilter<"ActionPlan"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ActionPlan"> | Date | string;
};
export type ActionPlanCreateManyFindingInput = {
    id?: number;
    owner: string;
    dueDate: Date | string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ActionPlanUpdateWithoutFindingInput = {
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ActionPlanUncheckedUpdateWithoutFindingInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ActionPlanUncheckedUpdateManyWithoutFindingInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    owner?: Prisma.StringFieldUpdateOperationsInput | string;
    dueDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ActionPlanSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    findingId?: boolean;
    owner?: boolean;
    dueDate?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    finding?: boolean | Prisma.FindingDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["actionPlan"]>;
export type ActionPlanSelectScalar = {
    id?: boolean;
    findingId?: boolean;
    owner?: boolean;
    dueDate?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ActionPlanOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "findingId" | "owner" | "dueDate" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["actionPlan"]>;
export type ActionPlanInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    finding?: boolean | Prisma.FindingDefaultArgs<ExtArgs>;
};
export type $ActionPlanPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ActionPlan";
    objects: {
        finding: Prisma.$FindingPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        findingId: number;
        owner: string;
        dueDate: Date;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["actionPlan"]>;
    composites: {};
};
export type ActionPlanGetPayload<S extends boolean | null | undefined | ActionPlanDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload, S>;
export type ActionPlanCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ActionPlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ActionPlanCountAggregateInputType | true;
};
export interface ActionPlanDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ActionPlan'];
        meta: {
            name: 'ActionPlan';
        };
    };
    findUnique<T extends ActionPlanFindUniqueArgs>(args: Prisma.SelectSubset<T, ActionPlanFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ActionPlanFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ActionPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ActionPlanFindFirstArgs>(args?: Prisma.SelectSubset<T, ActionPlanFindFirstArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ActionPlanFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ActionPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ActionPlanFindManyArgs>(args?: Prisma.SelectSubset<T, ActionPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ActionPlanCreateArgs>(args: Prisma.SelectSubset<T, ActionPlanCreateArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ActionPlanCreateManyArgs>(args?: Prisma.SelectSubset<T, ActionPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends ActionPlanDeleteArgs>(args: Prisma.SelectSubset<T, ActionPlanDeleteArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ActionPlanUpdateArgs>(args: Prisma.SelectSubset<T, ActionPlanUpdateArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ActionPlanDeleteManyArgs>(args?: Prisma.SelectSubset<T, ActionPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ActionPlanUpdateManyArgs>(args: Prisma.SelectSubset<T, ActionPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends ActionPlanUpsertArgs>(args: Prisma.SelectSubset<T, ActionPlanUpsertArgs<ExtArgs>>): Prisma.Prisma__ActionPlanClient<runtime.Types.Result.GetResult<Prisma.$ActionPlanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ActionPlanCountArgs>(args?: Prisma.Subset<T, ActionPlanCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ActionPlanCountAggregateOutputType> : number>;
    aggregate<T extends ActionPlanAggregateArgs>(args: Prisma.Subset<T, ActionPlanAggregateArgs>): Prisma.PrismaPromise<GetActionPlanAggregateType<T>>;
    groupBy<T extends ActionPlanGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ActionPlanGroupByArgs['orderBy'];
    } : {
        orderBy?: ActionPlanGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ActionPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetActionPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ActionPlanFieldRefs;
}
export interface Prisma__ActionPlanClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    finding<T extends Prisma.FindingDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.FindingDefaultArgs<ExtArgs>>): Prisma.Prisma__FindingClient<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ActionPlanFieldRefs {
    readonly id: Prisma.FieldRef<"ActionPlan", 'Int'>;
    readonly findingId: Prisma.FieldRef<"ActionPlan", 'Int'>;
    readonly owner: Prisma.FieldRef<"ActionPlan", 'String'>;
    readonly dueDate: Prisma.FieldRef<"ActionPlan", 'DateTime'>;
    readonly status: Prisma.FieldRef<"ActionPlan", 'String'>;
    readonly createdAt: Prisma.FieldRef<"ActionPlan", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ActionPlan", 'DateTime'>;
}
export type ActionPlanFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    where: Prisma.ActionPlanWhereUniqueInput;
};
export type ActionPlanFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    where: Prisma.ActionPlanWhereUniqueInput;
};
export type ActionPlanFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ActionPlanFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ActionPlanFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ActionPlanCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ActionPlanCreateInput, Prisma.ActionPlanUncheckedCreateInput>;
};
export type ActionPlanCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ActionPlanCreateManyInput | Prisma.ActionPlanCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ActionPlanUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ActionPlanUpdateInput, Prisma.ActionPlanUncheckedUpdateInput>;
    where: Prisma.ActionPlanWhereUniqueInput;
};
export type ActionPlanUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ActionPlanUpdateManyMutationInput, Prisma.ActionPlanUncheckedUpdateManyInput>;
    where?: Prisma.ActionPlanWhereInput;
    limit?: number;
};
export type ActionPlanUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    where: Prisma.ActionPlanWhereUniqueInput;
    create: Prisma.XOR<Prisma.ActionPlanCreateInput, Prisma.ActionPlanUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ActionPlanUpdateInput, Prisma.ActionPlanUncheckedUpdateInput>;
};
export type ActionPlanDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
    where: Prisma.ActionPlanWhereUniqueInput;
};
export type ActionPlanDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ActionPlanWhereInput;
    limit?: number;
};
export type ActionPlanDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ActionPlanSelect<ExtArgs> | null;
    omit?: Prisma.ActionPlanOmit<ExtArgs> | null;
    include?: Prisma.ActionPlanInclude<ExtArgs> | null;
};
export {};
