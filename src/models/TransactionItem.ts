import { nanoid } from 'nanoid';
import { IContentItem, IItemTransactionCfg, SearchConfig } from './types';
import { PropTreeProps } from '../components/PropTree';
import { Entry } from 'har-format';
import { isVisible } from 'react-inspector';
import { isMimeType } from '../components/InspectorWrapper';
import { ItemType } from 'models/enums';

export abstract class TransactionItemAbstract implements IContentItem<unknown> {
    public readonly id: string = 'someId';
    public readonly type: ItemType = ItemType.Transaction;
    public readonly timestamp: number = 0;

    abstract getName(): string;

    abstract getTag(): string;

    abstract isError(): boolean;

    abstract getParams(): Record<string, unknown>;

    abstract getContent(): unknown;

    abstract getMeta(): PropTreeProps['data'] | null;

    abstract getDuration(): number;
}

type TContent = IItemTransactionCfg['result'];
export default class TransactionItem
    implements TransactionItemAbstract, IContentItem<TContent>
{
    public readonly id: string;
    public readonly type: ItemType = ItemType.Transaction;
    public readonly timestamp: number;
    private readonly _name: string;
    private readonly _result: TContent;
    private readonly _params: IItemTransactionCfg['params'];
    private readonly _tag: string;
    private readonly _meta: PropTreeProps['data'] | null;
    private readonly _duration: number;

    constructor(cfg: IItemTransactionCfg) {
        this.id = nanoid();
        this.timestamp = cfg.timestamp;
        this._name = cfg.name || 'No name';
        this._params = cfg.params;
        this._result = cfg.result;
        this._tag = cfg.tag || '';
        this._meta = cfg.meta || null;
        this._duration = cfg.duration || 0;
    }

    setComputedFields(): void {
        // pass
    }

    shouldShow(cfg: SearchConfig = {}): boolean {
        const { searchValue, marker, filterValue } = cfg;
        const byFilterValue = filterValue
            ? this.getName().includes(filterValue)
            : true;
        if (searchValue && marker) {
            //2 params match
            // TODO mutation is bad
            const content = this.getContent();
            return (
                byFilterValue &&
                (isVisible({ params: this.getParams() }, 'params', marker) ||
                    isVisible(
                        {
                            content: isMimeType(content)
                                ? content.__getRaw()
                                : content
                        },
                        'content',
                        marker
                    ))
            );
        }
        return byFilterValue;
    }

    getName(): string {
        return this._name || 'No name';
    }

    getTag(): string {
        return '';
    }

    isError(): boolean {
        return false;
    }

    static fromJSON(input: Entry): TransactionItem {
        return new TransactionItem({
            tag: input.request.method,
            timestamp: new Date(input.startedDateTime).getTime(),
            name: input.request.url,
            params: input.request.postData?.text
                ? JSON.parse(input.request.postData.text)
                : {},
            result: input.response.content.text
                ? JSON.parse(input.response.content.text)
                : {},
            meta: null // TODO
        });
    }

    toJSON(): Entry {
        return {
            startedDateTime: new Date(this.timestamp).toISOString(),
            time: 0,
            comment: this.type,
            request: {
                method: this._tag,
                url: this._name,
                httpVersion: '',
                cookies: [],
                headers: [],
                queryString: [],
                postData: {
                    mimeType: 'application/json',
                    text: JSON.stringify(this._params)
                },
                headersSize: -1,
                bodySize: -1
            },
            response: {
                status: 200,
                statusText: '200 OK',
                httpVersion: '',
                cookies: [],
                headers: [],
                content: {
                    size: -1,
                    mimeType: 'text/plain',
                    text: JSON.stringify(this._result)
                },
                redirectURL: '',
                headersSize: -1,
                bodySize: -1
            },
            cache: {},
            timings: {
                wait: 0,
                receive: 0
            }
        };
    }

    getParams(): IItemTransactionCfg['params'] {
        return this._params;
    }

    getMeta(): PropTreeProps['data'] | null {
        return this._meta;
    }

    getContent(): TContent {
        return this._result;
    }

    getDuration(): number {
        return this._duration || 0;
    }
}
