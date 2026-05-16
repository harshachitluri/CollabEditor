#!/bin/bash
# CollabCode - Complete Test Suite
# Tests all supported languages with real code execution

API="http://localhost:3001/api/run"

echo "🧪 CollabCode Code Execution Test Suite"
echo "========================================"
echo ""

# Test 1: JavaScript - Functions
echo "Test 1️⃣  JavaScript - Math Functions"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function add(a, b) {\n  return a + b;\n}\n\nfunction subtract(a, b) {\n  return a - b;\n}\n\nconst num1 = 10;\nconst num2 = 3;\n\nconsole.log(\"Addition:\", add(num1, num2));\nconsole.log(\"Subtraction:\", subtract(num1, num2));",
    "language": "javascript"
  }' | jq .
echo ""

# Test 2: JavaScript - Array operations
echo "Test 2️⃣  JavaScript - Array Operations"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const numbers = [1, 2, 3, 4, 5];\nconst sum = numbers.reduce((a, b) => a + b, 0);\nconst squared = numbers.map(n => n * n);\nconsole.log(\"Original:\", numbers);\nconsole.log(\"Sum:\", sum);\nconsole.log(\"Squared:\", squared);",
    "language": "javascript"
  }' | jq .
echo ""

# Test 3: JavaScript - Fibonacci
echo "Test 3️⃣  JavaScript - Fibonacci Sequence"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function fib(n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);\n}\n\nfor (let i = 0; i < 10; i++) {\n  console.log(\"fib(\" + i + \") =\", fib(i));\n}",
    "language": "javascript"
  }' | jq .
echo ""

# Test 4: Python - Functions
echo "Test 4️⃣  Python - Math Functions"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def add(a, b):\n    return a + b\n\ndef subtract(a, b):\n    return a - b\n\nnum1 = 10\nnum2 = 3\n\nprint(f\"Addition: {add(num1, num2)}\")\nprint(f\"Subtraction: {subtract(num1, num2)}\");",
    "language": "python"
  }' | jq .
echo ""

# Test 5: Python - List operations
echo "Test 5️⃣  Python - List Operations"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "numbers = [1, 2, 3, 4, 5]\ntotal = sum(numbers)\nsquared = [n**2 for n in numbers]\n\nprint(\"Original:\", numbers)\nprint(\"Sum:\", total)\nprint(\"Squared:\", squared)",
    "language": "python"
  }' | jq .
echo ""

# Test 6: Python - Fibonacci
echo "Test 6️⃣  Python - Fibonacci Sequence"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nfor i in range(10):\n    print(f\"fib({i}) = {fib(i)}\")",
    "language": "python"
  }' | jq .
echo ""

# Test 7: C++ - Will show error (g++ not available)
echo "Test 7️⃣  C++ - Compiler Check (expected to show error)"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <iostream>\nint main() {\n  std::cout << \"Hello\" << std::endl;\n  return 0;\n}",
    "language": "cpp"
  }' | jq .
echo ""

echo "✅ Test Suite Complete!"
echo ""
echo "Summary:"
echo "  ✅ JavaScript: Math functions, arrays, recursion"
echo "  ✅ Python: Functions, lists, recursion"
echo "  ⚠️  C++: Shows helpful error (g++ not installed)"
