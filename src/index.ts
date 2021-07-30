export class Subscription<
	Fn extends (...args: any[]) => any = () => void,
	Meta = {}
> {
	private subscribers: {
		fn: Fn;
		isCancelled?: true;
		label?: string;
	}[];
	private metaData: Meta;

	constructor(defaultMetaData?: Meta) {
		if (defaultMetaData !== undefined) {
			this.metaData = defaultMetaData;
		}
		this.subscribers = [];
	}

	setMetaData = (metaData: Meta) => {
		this.metaData = metaData;
	};

	getMetaData = () => {
		if (this.metaData === undefined) {
			throw new Error("meta data not set");
		}
		return this.metaData;
	};

	subscribe = (fn: Fn, debuggerLabel?: string): UnsubscribeFn => {
		this.subscribers = [...this.subscribers, { fn, label: debuggerLabel }];
		return this.getUnsubscribeFn(fn);
	};

	private cSubscribers: {
		fn: Fn;
		isCancelled?: true;
		label?: string;
		skipAsyncInitialCalling?: boolean;
	}[] = [];
	private planned?: number;

	asyncReverseOrderSubscribe = (fn: Fn, debuggerLabel?: string, skipAsyncInitialCalling?: boolean): UnsubscribeFn => {
		this.cSubscribers.push({ fn, label: debuggerLabel, skipAsyncInitialCalling });
		if (this.planned) {
			clearTimeout(this.planned);
		}
		this.planned = setTimeout(() => {
			this.subscribers = [
				...this.subscribers,
				...[...this.cSubscribers].reverse(),
			];
			this.cSubscribers = [];
		}, 0);
		return this.getUnsubscribeFn(fn);
	};

	private getUnsubscribeFn = (fn: () => void) => {
		return () => {
			this.subscribers = this.subscribers.filter(e => {
				if (e.isCancelled || e.fn === fn) {
					e.isCancelled = true;
					return false;
				}
				return true;
			});
		};
	};

	broadcast = <Par extends Parameters<Fn>>(
		...data: Par
	): ReturnType<Fn>[] => {
		const arr = this.subscribers = this.cSubscribers.length === 0 ? this.subscribers : [
			...this.subscribers,
			...this.cSubscribers.filter(e => !e.skipAsyncInitialCalling).reverse(),
		];
		const results: ReturnType<Fn>[] = [];
		for (const el of arr) {
			if (el.isCancelled) {
				continue;
			}
			results.push(el.fn(...data) as any);
		}
		this.subscribers = this.subscribers.filter(e => !e.isCancelled);
		return results;
	};

	clearSubscribers = () => {
		this.subscribers = [];
	};

	getSubscribersCount = () => {
		return this.subscribers.length;
	}
}

export type UnsubscribeFn = () => void;

export default Subscription;