[![Continuous Integration](https://github.com/kaiosilveira/split-variable-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/split-variable-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my Refactoring catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Split Variable

**Formerly: Remove Assignments to Parameters**

**Formerly: Split Temp**

<table>
<thead>
<th>Before</th>
<th>After</th>
</thead>
<tbody>
<tr>
<td>

```javascript
let temp = 2 * (height + width);
console.log(temp);
temp = height * width;
console.log(temp);
```

</td>

<td>

```javascript
const perimeter = 2 * (height + width);
console.log(perimeter);
const area = height * width;
console.log(area);
```

</td>
</tr>
</tbody>
</table>

Variables are dynamic and may have many uses: holding a value, holding a reference, accumulating a result, and so on. This dynamism, though, can sometimes get in the way we understand code. For a variable to be both useful and understandable, it must be contained inside one, and only one, context, and should also have only one meaning/purpose within this context. This refactoring helps with fixing problems related to the violation of this principle.

## Working examples

Two examples were provided by the book for this refactoring. The first one is focused on removing double assignments/context switchings of a variable, while the second is focused on removing the reassignment of a function param.

### Working example #1: Removing double assignments / variable reuse

This example presents a program that calculates the distance traveled by a [haggis](https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://en.wikipedia.org/wiki/Haggis&ved=2ahUKEwj2i8Pa1pmFAxWk9LsIHb0dAwEQFnoECCIQAQ&usg=AOvVaw11CJgkmsrgmklBZCPBu_z9) (yeah, I had to look it up on Wikipedia and no, it doesn't seem tasty). The general formula is ruled by the assumption of an initial force being applied to the haggis, followed by a second force that's applied after some delay. The code looks like this:

```javascript
export function distanceTravelled(scenario, time) {
  let result;
  let acc = scenario.primaryForce / scenario.mass;
  let primaryTime = Math.min(time, scenario.delay);
  result = 0.5 * acc * primaryTime * primaryTime;
  let secondaryTime = time - scenario.delay;
  if (secondaryTime > 0) {
    let primaryVelocity = acc * scenario.delay;
    acc = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass;
    result += primaryVelocity * secondaryTime + 0.5 * acc * secondaryTime * secondaryTime;
  }
  return result;
}
```

The issue we want to fix here is the reuse of `acc` as the value holder for both calculations (primary and secondary accelerations).

#### Test suite

The test suite implemented for this program covers the following aspects of the code:

- making sure the logic for the first acceleration is in place before the second force kicks in
- making sure both forces are applied after the delay time is reached
- making sure that the acceleration caused by the initial force is correctly calculated, even after the second force is considered

```javascript
import { distanceTravelled } from './index';

describe('distanceTravelled', () => {
  it('should be accelerated by an initial force', () => {
    const time = 1;
    const scenario = { primaryForce: 10, secondaryForce: 20, mass: 5, delay: 2 };
    expect(distanceTravelled(scenario, time)).toBe(1);
  });

  it('should be accelerated by an initial force and a secondary force if delay time is reached', () => {
    const time = 3;
    const scenario = { primaryForce: 10, secondaryForce: 20, mass: 5, delay: 2 };
    expect(distanceTravelled(scenario, time)).toBe(11);
  });

  it('should use the delay time if provided time is greater than delay time', () => {
    const time = 5;
    const scenario = { primaryForce: 10, secondaryForce: 20, mass: 5, delay: 2 };
    expect(distanceTravelled(scenario, time)).toBe(43);
  });
});
```

With these tests in place, we should be good to go.

#### Steps

We start by renaming `acc` to `primaryAcceleration`, replacing its occurrences up to the point where it is assigned for the second time. At this point, we redeclare it:

```diff
diff --git a/src/distance-travelled/index.js b/src/distance-travelled/index.js
@@ -1,12 +1,12 @@
 export function distanceTravelled(scenario, time) {
   let result;
-  let acc = scenario.primaryForce / scenario.mass;
+  let primaryAcceleration = scenario.primaryForce / scenario.mass;
   let primaryTime = Math.min(time, scenario.delay);
-  result = 0.5 * acc * primaryTime * primaryTime;
+  result = 0.5 * primaryAcceleration * primaryTime * primaryTime;
   let secondaryTime = time - scenario.delay;
   if (secondaryTime > 0) {
-    let primaryVelocity = acc * scenario.delay;
-    acc = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass;
+    let primaryVelocity = primaryAcceleration * scenario.delay;
+    let acc = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass;
     result += primaryVelocity * secondaryTime + 0.5 * acc * secondaryTime * secondaryTime;
   }
   return result;
```

Then, since `primaryAcceleration` doesn't have any reassignments, we can make it a `const`:

```diff
diff --git a/src/distance-travelled/index.js b/src/distance-travelled/index.js
@@ -1,6 +1,6 @@
 export function distanceTravelled(scenario, time) {
   let result;
-  let primaryAcceleration = scenario.primaryForce / scenario.mass;
+  const primaryAcceleration = scenario.primaryForce / scenario.mass;
   let primaryTime = Math.min(time, scenario.delay);
   result = 0.5 * primaryAcceleration * primaryTime * primaryTime;
   let secondaryTime = time - scenario.delay;
```

We can now apply [Rename Variable](https://github.com/kaiosilveira/rename-variable-refactoring) to `acc`, changing its name to `secondaryAcceleration` and improving readability:

```diff
diff --git a/src/distance-travelled/index.js b/src/distance-travelled/index.js
@@ -6,8 +6,9 @@ export function distanceTravelled(scenario, time) {
   let secondaryTime = time - scenario.delay;
   if (secondaryTime > 0) {
     let primaryVelocity = primaryAcceleration * scenario.delay;
-    let acc = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass;
-    result += primaryVelocity * secondaryTime + 0.5 * acc * secondaryTime * secondaryTime;
+    let secondaryAcceleration = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass;
+    result +=
+      primaryVelocity * secondaryTime + 0.5 * secondaryAcceleration * secondaryTime * secondaryTime;
   }
   return result;
 }
```

Since `secondaryAcceleration` also isn't reassigned later on, we can also make it a `const`:

```diff
diff --git a/src/distance-travelled/index.js b/src/distance-travelled/index.js
@@ -6,7 +6,7 @@ export function distanceTravelled(scenario, time) {
   let secondaryTime = time - scenario.delay;
   if (secondaryTime > 0) {
     let primaryVelocity = primaryAcceleration * scenario.delay;
-    let secondaryAcceleration = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass;
+    const secondaryAcceleration = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass;
     result +=
       primaryVelocity * secondaryTime + 0.5 * secondaryAcceleration * secondaryTime * secondaryTime;
   }
```

And that's it for this one! Both variables live in their our context now.

#### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                            | Message                                                         |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [13b64a0](https://github.com/kaiosilveira/split-variable-refactoring/commit/13b64a068556a5b637c0e0e66d4382b5be0667dd) | rename `acc` to `primaryAcceleration` and redeclare `acc` later |
| [d9435cc](https://github.com/kaiosilveira/split-variable-refactoring/commit/d9435cc944a2a56f5e9241484fd2302980927b42) | make `primaryAcceleration` a `const`                            |
| [880c223](https://github.com/kaiosilveira/split-variable-refactoring/commit/880c2237b0aedb76c60dfe67a1742f1977b82f87) | rename `acc` to `secondaryAcceleration`                         |
| [03d9e46](https://github.com/kaiosilveira/split-variable-refactoring/commit/03d9e4690eceb16e986f9b0a3da62e77d00f87b6) | make `secondaryAcceleration` a `const`                          |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/split-variable-refactoring/commits/main).

### Working example #2: Removing assignments to input params

Our second example is a program that calculates the discount for a given `inputValue` and a `quantity`. The code looks like this:

```javascript
export function discount(inputValue, quantity) {
  if (inputValue > 50) inputValue = inputValue - 2;
  if (quantity > 100) inputValue = inputValue - 1;
  return inputValue;
}
```

The issue we want to change here is the reassignment to `inputValue` based on the discount rules. The `inputValue` param should be used only as a basis, but shouldn't be transformed.

#### Test suite

The test suite for this example covers the rules defined in the `discount` function, as well as the combination of both rules being applied at the same time:

```javascript
import { discount } from '.';

describe('discount', () => {
  it('should subtract 2 from the input value if it is greater than 50', () => {
    expect(discount(51, 10)).toBe(49);
  });

  it('should subtract 1 from the input value if the quantity is greater than 100', () => {
    expect(discount(50, 101)).toBe(49);
  });

  it('should subtract 2 from the input value if it is greater than 50 and subtract 1 if the quantity is greater than 100', () => {
    expect(discount(51, 101)).toBe(48);
  });
});
```

With these tests in place, we're safe to move forward with the refactorings.

#### Steps

We start by splitting `inputValue`, via renaming `inputValue` to `originalInputValue`, and declaring an inner `inputValue` variable:

```diff
diff --git a/src/assigning-to-input-param/index.js b/src/assigning-to-input-param/index.js
@@ -1,4 +1,5 @@
-export function discount(inputValue, quantity) {
+export function discount(originalInputValue, quantity) {
+  let inputValue = originalInputValue;
   if (inputValue > 50) inputValue = inputValue - 2;
   if (quantity > 100) inputValue = inputValue - 1;
   return inputValue;
```

Then, for readability, we can rename `inputValue` to `result`:

```diff
diff --git a/src/assigning-to-input-param/index.js b/src/assigning-to-input-param/index.js
@@ -1,6 +1,6 @@
 export function discount(originalInputValue, quantity) {
-  let inputValue = originalInputValue;
-  if (inputValue > 50) inputValue = inputValue - 2;
-  if (quantity > 100) inputValue = inputValue - 1;
-  return inputValue;
+  let result = originalInputValue;
+  if (result > 50) result = result - 2;
+  if (quantity > 100) result = result - 1;
+  return result;
 }
```

And now we're free to rename `originalInputValue` back to `inputValue`:

```diff
diff --git a/src/assigning-to-input-param/index.js b/src/assigning-to-input-param/index.js
@@ -1,5 +1,5 @@
-export function discount(originalInputValue, quantity) {
-  let result = originalInputValue;
+export function discount(inputValue, quantity) {
+  let result = inputValue;
   if (result > 50) result = result - 2;
   if (quantity > 100) result = result - 1;
   return result;
```

As a final touch, we can use `inputValue` instead of `result` as a basis for the first discount rule:

```diff
diff --git a/src/assigning-to-input-param/index.js b/src/assigning-to-input-param/index.js
index 4513371..2a85eac 100644
@@ -1,6 +1,6 @@
 export function discount(inputValue, quantity) {
   let result = inputValue;
-  if (result > 50) result = result - 2;
+  if (inputValue > 50) result = result - 2;
   if (quantity > 100) result = result - 1;
   return result;
 }
```

Although small, these changes improve the overall readability of the code, making it clear that a `result` will exist after some rules are evaluated against `inputValue` and a `quantity` provided as parameters.

#### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                            | Message                                                 |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [aa5a032](https://github.com/kaiosilveira/split-variable-refactoring/commit/aa5a0324e749d7ad51664c498b27a10685edd311) | split `inputValue` by introducing `originalInputValue`  |
| [bb3f237](https://github.com/kaiosilveira/split-variable-refactoring/commit/bb3f2372d9223ab5cec399173a29dfb4a7435294) | rename `inputValue` to `result`                         |
| [f27488c](https://github.com/kaiosilveira/split-variable-refactoring/commit/f27488c663e40627bb1a03a196e9c16e33ad6b66) | rename `originalInputValue` to `inputValue`             |
| [f5c8249](https://github.com/kaiosilveira/split-variable-refactoring/commit/f5c824991faa9f14459b5222bf79b2198e9fda38) | use `inputValue` as a basis for the first discount rule |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/split-variable-refactoring/commits/main).
