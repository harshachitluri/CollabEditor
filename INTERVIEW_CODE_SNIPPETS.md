# 🎯 Copy-Paste Ready Interview Code Snippets

## ✅ VERIFIED WORKING - Use These!

---

## JavaScript Snippets

### 1. Math Functions (YOUR ORIGINAL CODE - FIXED)
```javascript
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// Using hardcoded values (not prompt - which is browser-only)
const num1 = 15;
const num2 = 7;

console.log("Addition:", add(num1, num2));
console.log("Subtraction:", subtract(num1, num2));
```
**Output:** `Addition: 22` `Subtraction: 8` ✅

---

### 2. Array Operations
```javascript
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
const avg = sum / numbers.length;
const doubled = numbers.map(n => n * 2);

console.log("Array:", numbers);
console.log("Sum:", sum);
console.log("Avg:", avg);
console.log("Doubled:", doubled);
```
**Output:** Sum: 15, Avg: 3, Doubled: [2,4,6,8,10] ✅

---

### 3. Recursion - Factorial
```javascript
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

for (let i = 1; i <= 5; i++) {
  console.log(`${i}! = ${factorial(i)}`);
}
```
**Output:**
```
1! = 1
2! = 2
3! = 6
4! = 24
5! = 120
```
✅

---

### 4. Fibonacci Sequence
```javascript
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(`fib(${i}) = ${fib(i)}`);
}
```
**Output:** fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2... ✅

---

### 5. Object Methods
```javascript
const calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b
};

console.log("10 + 5 =", calculator.add(10, 5));
console.log("10 - 5 =", calculator.subtract(10, 5));
console.log("10 * 5 =", calculator.multiply(10, 5));
console.log("10 / 5 =", calculator.divide(10, 5));
```
**Output:** 15, 5, 50, 2 ✅

---

## Python Snippets

### 1. Math Functions
```python
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

num1 = 15
num2 = 7

print(f"Addition: {add(num1, num2)}")
print(f"Subtraction: {subtract(num1, num2)}")
```
**Output:** `Addition: 22` `Subtraction: 8` ✅

---

### 2. List Operations
```python
numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
avg = total / len(numbers)
squared = [n**2 for n in numbers]

print(f"List: {numbers}")
print(f"Sum: {total}")
print(f"Avg: {avg}")
print(f"Squared: {squared}")
```
**Output:** Sum: 15, Avg: 3.0, Squared: [1,4,9,16,25] ✅

---

### 3. Recursion - Factorial
```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print("Factorial sequence:")
for i in range(1, 6):
    print(f"{i}! = {factorial(i)}")
```
**Output:**
```
1! = 1
2! = 2
3! = 6
4! = 24
5! = 120
```
✅

---

### 4. Dictionary Operations
```python
student = {
    "name": "Alice",
    "math": 95,
    "science": 87,
    "english": 92
}

avg_score = sum(student[k] for k in ["math", "science", "english"]) / 3

print(f"Student: {student['name']}")
print(f"Subjects: {', '.join([k for k in student if k != 'name'])}")
print(f"Average Score: {avg_score:.1f}")
```
**Output:** Alice's average: 91.3 ✅

---

### 5. Using Libraries (math)
```python
import math

print("Math Library Examples:")
print(f"sqrt(16) = {math.sqrt(16)}")
print(f"factorial(5) = {math.factorial(5)}")
print(f"sin(π/2) = {math.sin(math.pi/2)}")
print(f"cos(0) = {math.cos(0)}")
print(f"floor(3.7) = {math.floor(3.7)}")
print(f"ceil(3.2) = {math.ceil(3.2)}")
```
**Output:** sqrt: 4.0, factorial: 120, sin: 1.0, cos: 1.0... ✅

---

## ⚠️ Things to AVOID

### ❌ DON'T USE - Browser-only features:
```javascript
// DON'T: prompt() - Not available in Node.js
let num = Number(prompt("Enter number:"));

// DO: Use hardcoded values
let num = 42;
```

### ❌ DON'T USE - Python input():
```python
# DON'T: User input - blocks execution
num = int(input("Enter number: "))

# DO: Hardcoded values
num = 42
```

### ❌ DON'T USE - C++ (compiler not available):
```cpp
// DON'T: Will show error
#include <iostream>
int main() { ... }

// DO: Use JavaScript or Python instead
```

---

## 🚀 How to Use in Interview

1. **Open room** in CollabCode
2. **Set language** to "JavaScript" or "Python" (dropdown)
3. **Copy one of the snippets above**
4. **Paste into editor**
5. **Click "Run Code"**
6. **Show output to interviewer**

---

## 🎯 Interview Talking Points

**"This code executes in real-time on the backend"**
- Show code → Click Run → See output appear
- Mention: Node.js child_process spawning

**"Real-time collaboration is happening"**
- Open URL in 2 tabs
- Type in one tab → See it sync in other
- Explain: Yjs CRDT + Socket.IO

**"Supports multiple languages"**
- Switch to Python
- Run Python code
- Show it works

---

**All snippets tested and verified ✅**
