# Simple Subscriptions

Simple usage

```ts
import { Subscription } from "simple-subscriptions";

interface User {
	id: number;
	name: string;
}

const userSubscriber = new Subscription<(user: User) => void>();

//.......

userSubscriber.subscribe((user) => {
	console.log(`new user`, user);
});

//.......

const unsubscribe = userSubscriber.subscribe((user) => {
	console.log(`user id on first call`, user.id);
	unsubscribe();
});

//.......

userSubscriber.broadcast({
	id: 1,
	name: "John",
});

// to unsubscribe all subscribers
userSubscriber.clearSubscribers();

```


You can also collect information from subscribers

```ts

const userSubscriber = new Subscription<
	(userId: number, username: string) => { isBlocked: boolean }
>();

//.......

userSubscriber.subscribe((userId, username) => {
	return { isBlocked: false }; // some logic
});

//.......

userSubscriber.subscribe((userId, username) => {
	return { isBlocked: true }; // some logic
});

//.......

const callbackResults = userSubscriber.broadcast(1, "John");

const isBlocked = callbackResults.some((res) => res.isBlocked);
console.log(`user ${isBlocked ? "is" : "is not"} blocked`);


```