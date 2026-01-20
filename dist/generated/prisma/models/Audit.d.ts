import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type AuditModel = runtime.Types.Result.DefaultSelection<Prisma.$AuditPayload>;
export type AggregateAudit = {
    _count: AuditCountAggregateOutputType | null;
    _avg: AuditAvgAggregateOutputType | null;
    _sum: AuditSumAggregateOutputType | null;
    _min: AuditMinAggregateOutputType | null;
    _max: AuditMaxAggregateOutputType | null;
};
export type AuditAvgAggregateOutputType = {
    id: number | null;
};
export type AuditSumAggregateOutputType = {
    id: number | null;
};
export type AuditMinAggregateOutputType = {
    id: number | null;
    name: string | null;
    type: string | null;
    status: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AuditMaxAggregateOutputType = {
    id: number | null;
    name: string | null;
    type: string | null;
    status: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AuditCountAggregateOutputType = {
    id: number;
    name: number;
    type: number;
    status: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type AuditAvgAggregateInputType = {
    id?: true;
};
export type AuditSumAggregateInputType = {
    id?: true;
};
export type AuditMinAggregateInputType = {
    id?: true;
    name?: true;
    type?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AuditMaxAggregateInputType = {
    id?: true;
    name?: true;
    type?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AuditCountAggregateInputType = {
    id?: true;
    name?: true;
    type?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type AuditAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuditWhereInput;
    orderBy?: Prisma.AuditOrderByWithRelationInput | Prisma.AuditOrderByWithRelationInput[];
    cursor?: Prisma.AuditWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | AuditCountAggregateInputType;
    _avg?: AuditAvgAggregateInputType;
    _sum?: AuditSumAggregateInputType;
    _min?: AuditMinAggregateInputType;
    _max?: AuditMaxAggregateInputType;
};
export type GetAuditAggregateType<T extends AuditAggregateArgs> = {
    [P in keyof T & keyof AggregateAudit]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAudit[P]> : Prisma.GetScalarType<T[P], AggregateAudit[P]>;
};
export type AuditGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuditWhereInput;
    orderBy?: Prisma.AuditOrderByWithAggregationInput | Prisma.AuditOrderByWithAggregationInput[];
    by: Prisma.AuditScalarFieldEnum[] | Prisma.AuditScalarFieldEnum;
    having?: Prisma.AuditScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AuditCountAggregateInputType | true;
    _avg?: AuditAvgAggregateInputType;
    _sum?: AuditSumAggregateInputType;
    _min?: AuditMinAggregateInputType;
    _max?: AuditMaxAggregateInputType;
};
export type AuditGroupByOutputType = {
    id: number;
    name: string;
    type: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    _count: AuditCountAggregateOutputType | null;
    _avg: AuditAvgAggregateOutputType | null;
    _sum: AuditSumAggregateOutputType | null;
    _min: AuditMinAggregateOutputType | null;
    _max: AuditMaxAggregateOutputType | null;
};
type GetAuditGroupByPayload<T extends AuditGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AuditGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AuditGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AuditGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AuditGroupByOutputType[P]>;
}>>;
export type AuditWhereInput = {
    AND?: Prisma.AuditWhereInput | Prisma.AuditWhereInput[];
    OR?: Prisma.AuditWhereInput[];
    NOT?: Prisma.AuditWhereInput | Prisma.AuditWhereInput[];
    id?: Prisma.IntFilter<"Audit"> | number;
    name?: Prisma.StringFilter<"Audit"> | string;
    type?: Prisma.StringFilter<"Audit"> | string;
    status?: Prisma.StringFilter<"Audit"> | string;
    createdAt?: Prisma.DateTimeFilter<"Audit"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Audit"> | Date | string;
    findings?: Prisma.FindingListRelationFilter;
};
export type AuditOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    findings?: Prisma.FindingOrderByRelationAggregateInput;
    _relevance?: Prisma.AuditOrderByRelevanceInput;
};
export type AuditWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.AuditWhereInput | Prisma.AuditWhereInput[];
    OR?: Prisma.AuditWhereInput[];
    NOT?: Prisma.AuditWhereInput | Prisma.AuditWhereInput[];
    name?: Prisma.StringFilter<"Audit"> | string;
    type?: Prisma.StringFilter<"Audit"> | string;
    status?: Prisma.StringFilter<"Audit"> | string;
    createdAt?: Prisma.DateTimeFilter<"Audit"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Audit"> | Date | string;
    findings?: Prisma.FindingListRelationFilter;
}, "id">;
export type AuditOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.AuditCountOrderByAggregateInput;
    _avg?: Prisma.AuditAvgOrderByAggregateInput;
    _max?: Prisma.AuditMaxOrderByAggregateInput;
    _min?: Prisma.AuditMinOrderByAggregateInput;
    _sum?: Prisma.AuditSumOrderByAggregateInput;
};
export type AuditScalarWhereWithAggregatesInput = {
    AND?: Prisma.AuditScalarWhereWithAggregatesInput | Prisma.AuditScalarWhereWithAggregatesInput[];
    OR?: Prisma.AuditScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AuditScalarWhereWithAggregatesInput | Prisma.AuditScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Audit"> | number;
    name?: Prisma.StringWithAggregatesFilter<"Audit"> | string;
    type?: Prisma.StringWithAggregatesFilter<"Audit"> | string;
    status?: Prisma.StringWithAggregatesFilter<"Audit"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Audit"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Audit"> | Date | string;
};
export type AuditCreateInput = {
    name: string;
    type: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    findings?: Prisma.FindingCreateNestedManyWithoutAuditInput;
};
export type AuditUncheckedCreateInput = {
    id?: number;
    name: string;
    type: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    findings?: Prisma.FindingUncheckedCreateNestedManyWithoutAuditInput;
};
export type AuditUpdateInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    findings?: Prisma.FindingUpdateManyWithoutAuditNestedInput;
};
export type AuditUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    findings?: Prisma.FindingUncheckedUpdateManyWithoutAuditNestedInput;
};
export type AuditCreateManyInput = {
    id?: number;
    name: string;
    type: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AuditUpdateManyMutationInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AuditUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AuditOrderByRelevanceInput = {
    fields: Prisma.AuditOrderByRelevanceFieldEnum | Prisma.AuditOrderByRelevanceFieldEnum[];
    sort: Prisma.SortOrder;
    search: string;
};
export type AuditCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AuditAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type AuditMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AuditMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AuditSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type AuditScalarRelationFilter = {
    is?: Prisma.AuditWhereInput;
    isNot?: Prisma.AuditWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type AuditCreateNestedOneWithoutFindingsInput = {
    create?: Prisma.XOR<Prisma.AuditCreateWithoutFindingsInput, Prisma.AuditUncheckedCreateWithoutFindingsInput>;
    connectOrCreate?: Prisma.AuditCreateOrConnectWithoutFindingsInput;
    connect?: Prisma.AuditWhereUniqueInput;
};
export type AuditUpdateOneRequiredWithoutFindingsNestedInput = {
    create?: Prisma.XOR<Prisma.AuditCreateWithoutFindingsInput, Prisma.AuditUncheckedCreateWithoutFindingsInput>;
    connectOrCreate?: Prisma.AuditCreateOrConnectWithoutFindingsInput;
    upsert?: Prisma.AuditUpsertWithoutFindingsInput;
    connect?: Prisma.AuditWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.AuditUpdateToOneWithWhereWithoutFindingsInput, Prisma.AuditUpdateWithoutFindingsInput>, Prisma.AuditUncheckedUpdateWithoutFindingsInput>;
};
export type AuditCreateWithoutFindingsInput = {
    name: string;
    type: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AuditUncheckedCreateWithoutFindingsInput = {
    id?: number;
    name: string;
    type: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AuditCreateOrConnectWithoutFindingsInput = {
    where: Prisma.AuditWhereUniqueInput;
    create: Prisma.XOR<Prisma.AuditCreateWithoutFindingsInput, Prisma.AuditUncheckedCreateWithoutFindingsInput>;
};
export type AuditUpsertWithoutFindingsInput = {
    update: Prisma.XOR<Prisma.AuditUpdateWithoutFindingsInput, Prisma.AuditUncheckedUpdateWithoutFindingsInput>;
    create: Prisma.XOR<Prisma.AuditCreateWithoutFindingsInput, Prisma.AuditUncheckedCreateWithoutFindingsInput>;
    where?: Prisma.AuditWhereInput;
};
export type AuditUpdateToOneWithWhereWithoutFindingsInput = {
    where?: Prisma.AuditWhereInput;
    data: Prisma.XOR<Prisma.AuditUpdateWithoutFindingsInput, Prisma.AuditUncheckedUpdateWithoutFindingsInput>;
};
export type AuditUpdateWithoutFindingsInput = {
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AuditUncheckedUpdateWithoutFindingsInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AuditCountOutputType = {
    findings: number;
};
export type AuditCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    findings?: boolean | AuditCountOutputTypeCountFindingsArgs;
};
export type AuditCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditCountOutputTypeSelect<ExtArgs> | null;
};
export type AuditCountOutputTypeCountFindingsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.FindingWhereInput;
};
export type AuditSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    type?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    findings?: boolean | Prisma.Audit$findingsArgs<ExtArgs>;
    _count?: boolean | Prisma.AuditCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["audit"]>;
export type AuditSelectScalar = {
    id?: boolean;
    name?: boolean;
    type?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type AuditOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "type" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["audit"]>;
export type AuditInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    findings?: boolean | Prisma.Audit$findingsArgs<ExtArgs>;
    _count?: boolean | Prisma.AuditCountOutputTypeDefaultArgs<ExtArgs>;
};
export type $AuditPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Audit";
    objects: {
        findings: Prisma.$FindingPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        name: string;
        type: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["audit"]>;
    composites: {};
};
export type AuditGetPayload<S extends boolean | null | undefined | AuditDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AuditPayload, S>;
export type AuditCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AuditFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AuditCountAggregateInputType | true;
};
export interface AuditDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Audit'];
        meta: {
            name: 'Audit';
        };
    };
    findUnique<T extends AuditFindUniqueArgs>(args: Prisma.SelectSubset<T, AuditFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AuditClient<runtime.Types.Result.GetResult<Prisma.$AuditPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends AuditFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AuditFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AuditClient<runtime.Types.Result.GetResult<Prisma.$AuditPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends AuditFindFirstArgs>(args?: Prisma.SelectSubset<T, AuditFindFirstArgs<ExtArgs>>): Prisma.Prisma__AuditClient<runtime.Types.Result.GetResult<Prisma.$AuditPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends AuditFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AuditFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AuditClient<runtime.Types.Result.GetResult<Prisma.$AuditPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends AuditFindManyArgs>(args?: Prisma.SelectSubset<T, AuditFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuditPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends AuditCreateArgs>(args: Prisma.SelectSubset<T, AuditCreateArgs<ExtArgs>>): Prisma.Prisma__AuditClient<runtime.Types.Result.GetResult<Prisma.$AuditPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends AuditCreateManyArgs>(args?: Prisma.SelectSubset<T, AuditCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    delete<T extends AuditDeleteArgs>(args: Prisma.SelectSubset<T, AuditDeleteArgs<ExtArgs>>): Prisma.Prisma__AuditClient<runtime.Types.Result.GetResult<Prisma.$AuditPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends AuditUpdateArgs>(args: Prisma.SelectSubset<T, AuditUpdateArgs<ExtArgs>>): Prisma.Prisma__AuditClient<runtime.Types.Result.GetResult<Prisma.$AuditPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends AuditDeleteManyArgs>(args?: Prisma.SelectSubset<T, AuditDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends AuditUpdateManyArgs>(args: Prisma.SelectSubset<T, AuditUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    upsert<T extends AuditUpsertArgs>(args: Prisma.SelectSubset<T, AuditUpsertArgs<ExtArgs>>): Prisma.Prisma__AuditClient<runtime.Types.Result.GetResult<Prisma.$AuditPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends AuditCountArgs>(args?: Prisma.Subset<T, AuditCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AuditCountAggregateOutputType> : number>;
    aggregate<T extends AuditAggregateArgs>(args: Prisma.Subset<T, AuditAggregateArgs>): Prisma.PrismaPromise<GetAuditAggregateType<T>>;
    groupBy<T extends AuditGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AuditGroupByArgs['orderBy'];
    } : {
        orderBy?: AuditGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AuditGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: AuditFieldRefs;
}
export interface Prisma__AuditClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    findings<T extends Prisma.Audit$findingsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Audit$findingsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$FindingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface AuditFieldRefs {
    readonly id: Prisma.FieldRef<"Audit", 'Int'>;
    readonly name: Prisma.FieldRef<"Audit", 'String'>;
    readonly type: Prisma.FieldRef<"Audit", 'String'>;
    readonly status: Prisma.FieldRef<"Audit", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Audit", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Audit", 'DateTime'>;
}
export type AuditFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditSelect<ExtArgs> | null;
    omit?: Prisma.AuditOmit<ExtArgs> | null;
    include?: Prisma.AuditInclude<ExtArgs> | null;
    where: Prisma.AuditWhereUniqueInput;
};
export type AuditFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditSelect<ExtArgs> | null;
    omit?: Prisma.AuditOmit<ExtArgs> | null;
    include?: Prisma.AuditInclude<ExtArgs> | null;
    where: Prisma.AuditWhereUniqueInput;
};
export type AuditFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditSelect<ExtArgs> | null;
    omit?: Prisma.AuditOmit<ExtArgs> | null;
    include?: Prisma.AuditInclude<ExtArgs> | null;
    where?: Prisma.AuditWhereInput;
    orderBy?: Prisma.AuditOrderByWithRelationInput | Prisma.AuditOrderByWithRelationInput[];
    cursor?: Prisma.AuditWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AuditScalarFieldEnum | Prisma.AuditScalarFieldEnum[];
};
export type AuditFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditSelect<ExtArgs> | null;
    omit?: Prisma.AuditOmit<ExtArgs> | null;
    include?: Prisma.AuditInclude<ExtArgs> | null;
    where?: Prisma.AuditWhereInput;
    orderBy?: Prisma.AuditOrderByWithRelationInput | Prisma.AuditOrderByWithRelationInput[];
    cursor?: Prisma.AuditWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AuditScalarFieldEnum | Prisma.AuditScalarFieldEnum[];
};
export type AuditFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditSelect<ExtArgs> | null;
    omit?: Prisma.AuditOmit<ExtArgs> | null;
    include?: Prisma.AuditInclude<ExtArgs> | null;
    where?: Prisma.AuditWhereInput;
    orderBy?: Prisma.AuditOrderByWithRelationInput | Prisma.AuditOrderByWithRelationInput[];
    cursor?: Prisma.AuditWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AuditScalarFieldEnum | Prisma.AuditScalarFieldEnum[];
};
export type AuditCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditSelect<ExtArgs> | null;
    omit?: Prisma.AuditOmit<ExtArgs> | null;
    include?: Prisma.AuditInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AuditCreateInput, Prisma.AuditUncheckedCreateInput>;
};
export type AuditCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.AuditCreateManyInput | Prisma.AuditCreateManyInput[];
    skipDuplicates?: boolean;
};
export type AuditUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditSelect<ExtArgs> | null;
    omit?: Prisma.AuditOmit<ExtArgs> | null;
    include?: Prisma.AuditInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AuditUpdateInput, Prisma.AuditUncheckedUpdateInput>;
    where: Prisma.AuditWhereUniqueInput;
};
export type AuditUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.AuditUpdateManyMutationInput, Prisma.AuditUncheckedUpdateManyInput>;
    where?: Prisma.AuditWhereInput;
    limit?: number;
};
export type AuditUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditSelect<ExtArgs> | null;
    omit?: Prisma.AuditOmit<ExtArgs> | null;
    include?: Prisma.AuditInclude<ExtArgs> | null;
    where: Prisma.AuditWhereUniqueInput;
    create: Prisma.XOR<Prisma.AuditCreateInput, Prisma.AuditUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.AuditUpdateInput, Prisma.AuditUncheckedUpdateInput>;
};
export type AuditDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditSelect<ExtArgs> | null;
    omit?: Prisma.AuditOmit<ExtArgs> | null;
    include?: Prisma.AuditInclude<ExtArgs> | null;
    where: Prisma.AuditWhereUniqueInput;
};
export type AuditDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuditWhereInput;
    limit?: number;
};
export type Audit$findingsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AuditDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditSelect<ExtArgs> | null;
    omit?: Prisma.AuditOmit<ExtArgs> | null;
    include?: Prisma.AuditInclude<ExtArgs> | null;
};
export {};
