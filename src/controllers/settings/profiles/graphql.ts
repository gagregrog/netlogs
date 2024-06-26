import { NetworkRequest } from '../../../models/types';
import { defaultProfile } from './default';
import { IProfile } from '../types';

const queryRegex = new RegExp(
    '(?<type>query|mutation)\\s?(?:\\s(?<name>[aA-zZ0-9]+?))?[({]'
);

export const graphqlProfile: IProfile = {
    functions: {
        getName(request: NetworkRequest): string {
            const params = defaultProfile.functions.getParams(request);
            let name = '';
            if (!params) {
                return name;
            }
            name =
                (typeof params.operationName === 'string' &&
                    params.operationName) ||
                '';
            if (!name && params.query && typeof params.query === 'string') {
                const match = params.query.match(queryRegex);
                if (match) {
                    name = `${match.groups?.type || 'query'}::${
                        match.groups?.name || 'Unnamed'
                    }`;
                }
            }
            if (
                !name &&
                params.query_hash &&
                typeof params.query_hash === 'string'
            ) {
                name = params.query_hash;
            }
            return name;
        },
        getTag(request: NetworkRequest): string {
            const params = this.getParams(request);
            if (isBatchedGraphqlParams(params)) {
                return 'BGQL';
            }
            return 'GQL';
        },
        getParams: defaultProfile.functions.getParams,
        getMeta: defaultProfile.functions.getMeta,
        isError(request: NetworkRequest): boolean {
            const errorByCode = defaultProfile.functions.isError(request);
            const result = defaultProfile.functions.getResult(
                request,
                request.response.content.text
            );
            const errorByResult =
                result &&
                typeof result === 'object' &&
                Object.prototype.hasOwnProperty.call(result, 'errors');
            return Boolean(errorByResult || errorByCode);
        },
        shouldShow(_request: NetworkRequest): boolean {
            return true;
        },
        getResult: function (
            request: NetworkRequest,
            content: string | undefined
        ): Record<string, unknown> | unknown {
            const wrapper = defaultProfile.functions.getResult(
                request,
                content
            );
            let returnValue = wrapper;
            if (isGraphqlResult(wrapper)) {
                if (!wrapper.errors) {
                    if ('data' in wrapper) {
                        returnValue = wrapper.data;
                    }
                }
            } else if (isBatchedGraphqlResult(wrapper)) {
                const allData: unknown[] = [];
                const allErrors = [];
                wrapper.forEach(({ data, errors }) => {
                    if (errors) {
                        allErrors.push(errors);
                    } else {
                        allData.push(data);
                    }
                });
                if (allErrors.length === 0) {
                    returnValue = allData;
                }
            }
            return returnValue;
        }
    }
};

// https://graphql.org/learn/serving-over-http/#post-request
type graphqlParams = {
    query: string;
    operationName?: string;
    variables?: Record<string, unknown>;
};

export type batchGraphqlParams = {
    graphqlBatch: graphqlParams[];
};

type graphqlResult = {
    data: unknown;
    errors?: unknown;
};

function isGraphqlParams(
    params: Record<string, unknown>
): params is graphqlParams {
    if (!params) {
        return false;
    }
    const hasQuery =
        params.query &&
        typeof params.query === 'string' &&
        params.query.match('query|mutation');
    // instagram uses query_hash
    const hasHash = 'query_hash' in params;
    return Boolean(hasQuery || hasHash);
}

function isGraphqlParamsWeak(
    params: Record<string, unknown>
): params is graphqlParams {
    if (!params) {
        return false;
    }
    // airbnb does not send query but has operationName+variables
    return Boolean('operationName' in params && 'variables' in params);
}

function isGraphqlResultWeak(resultText?: string): boolean {
    return typeof resultText === 'string' && resultText.includes('__typename');
}

function isGraphqlResult(
    result: Record<string, unknown> | unknown
): result is graphqlResult {
    return Boolean(
        result &&
            typeof result === 'object' &&
            ('data' in result || 'errors' in result)
    );
}

function isBatchedGraphqlResult(
    result: Record<string, unknown> | unknown
): result is graphqlResult[] {
    return Array.isArray(result) && result.every(isGraphqlResult);
}

export function isBatchedGraphqlParams(
    params: Record<string, unknown> | unknown
): params is batchGraphqlParams {
    if (!params) {
        return false;
    }
    return (params as batchGraphqlParams).graphqlBatch?.every(isGraphqlParams);
}

export function isGraphql(
    params: Record<string, unknown>,
    _result: unknown,
    resultText?: string
): boolean {
    return (
        isBatchedGraphqlParams(params) ||
        isGraphqlParams(params) ||
        (isGraphqlParamsWeak(params) &&
            (isGraphqlResultWeak(resultText) || !resultText))
    );
}
