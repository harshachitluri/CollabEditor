# Post-Fix Verification Checklist

## Pre-Testing Setup

```bash
# Clean build to ensure all changes are applied
rm -rf .next
npm run build
npm run dev
```

---

## ✅ Verification Tests

### Test 1: Build Completes Without SSR Errors
- [ ] Run `npm run build`
- [ ] ✅ **PASS**: Build completes successfully
- [ ] ✅ **PASS**: No "window is not defined" errors
- [ ] ✅ **PASS**: No "ReferenceError" for browser APIs
- [ ] ❌ **FAIL**: If build has errors, check next.config.ts

**Debugging if fails:**
```bash
npm run build 2>&1 | grep -i "window\|reference\|ssr"
```

---

### Test 2: No Hydration Mismatches

**Steps:**
1. [ ] Start dev server: `npm run dev`
2. [ ] Open browser DevTools (F12)
3. [ ] Go to Room page: `http://localhost:3000/room/[any-slug]`
4. [ ] Open Console tab

**Expected Results:**
- [ ] ✅ No red errors in console
- [ ] ✅ No "Hydration failed" messages
- [ ] ✅ No "Text content did not match" warnings
- [ ] ✅ Page loads smoothly without flashing

**If you see hydration errors:**
```typescript
// Check CollabEditor.tsx has this:
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);  // ← Must exist
}, []);

// And in JSX:
{isClient && <Editor ... />}  // ← Must conditionally render
```

---

### Test 3: Editor Loads & Is Interactive

**Steps:**
1. [ ] Wait for page to fully load (look for "Loading editor..." then Editor appears)
2. [ ] Try typing in the editor
3. [ ] Try copying/pasting code

**Expected Results:**
- [ ] ✅ Editor appears after initial load
- [ ] ✅ Typing works immediately
- [ ] ✅ Copy/paste works without errors
- [ ] ✅ No console errors during interactions

**If editor doesn't appear:**
```bash
# Check if ClientOnly wrapper is in room page
grep -n "ClientOnly" app/room/\[slug\]/page.tsx
# Should show 2+ matches (import + wrapper)
```

---

### Test 4: No Clipboard Permission Errors

**Steps:**
1. [ ] Open DevTools Console
2. [ ] Focus editor
3. [ ] Paste some code (Ctrl+V or Cmd+V)
4. [ ] Copy text (Ctrl+C or Cmd+C)
5. [ ] Watch console for errors

**Expected Results:**
- [ ] ✅ No "NotAllowedError" messages
- [ ] ✅ No "clipboard permission denied" errors
- [ ] ✅ No "The request is not allowed" warnings
- [ ] ✅ Paste/copy operations work silently

**If you see clipboard errors:**
```typescript
// Verify these are in CollabEditor options:
options={{
  'editor.formatOnPaste': false,  // ← Must be false
  'editor.formatOnType': false,   // ← Must be false
}}
```

---

### Test 5: Hot Reload Works (Turbopack)

**Steps:**
1. [ ] Keep dev server running
2. [ ] Edit `app/components/CollabEditor.tsx` (e.g., add a comment)
3. [ ] Save the file
4. [ ] Watch browser automatically reload

**Expected Results:**
- [ ] ✅ Browser refreshes automatically
- [ ] ✅ No white flash or crash
- [ ] ✅ Page remains interactive after reload
- [ ] ✅ Editor still works after hot reload

**If hot reload doesn't work:**
- [ ] Check Turbopack is enabled in `next.config.ts`
- [ ] Clear `.next` folder: `rm -rf .next`
- [ ] Restart dev server

---

### Test 6: Theme Registration Works

**Steps:**
1. [ ] Open browser DevTools Console
2. [ ] Open the Room page
3. [ ] Change theme from "Monochrome Dark" to "High Contrast"

**Expected Results:**
- [ ] ✅ Theme selector dropdown works
- [ ] ✅ Theme changes immediately
- [ ] ✅ No errors in console about theme registration
- [ ] ✅ No "Failed to register custom theme" warnings

**If theme errors appear:**
```typescript
// Check onMount has try/catch:
onMount={async (ed) => {
  try {
    const monacoLib = await import('monaco-editor');
    monacoLib.editor.defineTheme('monochrome-dark', MONOCHROME_DARK_THEME);
    themeRegistered = true;
  } catch (err) {
    console.warn('Failed to register custom theme:', err);
  }
}}
```

---

### Test 7: Code Execution Works

**Steps:**
1. [ ] Write some simple code (e.g., `console.log("test")`)
2. [ ] Click "▶ Run" button
3. [ ] Verify output appears

**Expected Results:**
- [ ] ✅ Code runs without errors
- [ ] ✅ Output displays correctly
- [ ] ✅ No console errors during execution
- [ ] ✅ Runner still works after editor fix

---

### Test 8: Multi-Language Support

**Steps:**
1. [ ] Change language to JavaScript
2. [ ] Change language to Python
3. [ ] Change language to TypeScript
4. [ ] Change language to C++

**Expected Results:**
- [ ] ✅ All language switches work
- [ ] ✅ Syntax highlighting updates correctly
- [ ] ✅ No console errors on language switch
- [ ] ✅ Editor doesn't freeze or reload unnecessarily

---

### Test 9: Development Build Size (Optional)

**Steps:**
```bash
npm run build
# Check bundle analysis
```

**Expected Results:**
- [ ] ✅ Build time is reasonable (< 60s for full build)
- [ ] ✅ No duplicate Monaco code in bundle
- [ ] ✅ Monaco only in client bundle (not server)

**To verify Monaco is not duplicated:**
```bash
# After build, check for monaco in output
find .next -name "*.js" -type f | xargs grep -l "monaco-editor" | wc -l
# Should be minimal (1-2 chunks, not 10+)
```

---

## 🎯 Final Checklist

Before deploying to production:

- [ ] All 9 tests above pass ✅
- [ ] No red errors in browser console
- [ ] No "window is not defined" during build
- [ ] Hydration completes without warnings
- [ ] Clipboard operations work silently
- [ ] Theme registration works
- [ ] Code execution works
- [ ] Multi-language switching works
- [ ] Hot reload works properly
- [ ] Verified the 4 modified files exist:
  - [ ] `app/components/CollabEditor.tsx` - Updated
  - [ ] `app/components/ClientOnly.tsx` - NEW
  - [ ] `app/room/[slug]/page.tsx` - Updated
  - [ ] `next.config.ts` - Updated

---

## 🚨 Troubleshooting Guide

### Problem: "window is not defined" still appears
**Solution:**
1. Check CollabEditor has `dynamic(..., { ssr: false })`
2. Verify no `import * as monaco` at top of file
3. Clear `.next` and rebuild: `rm -rf .next && npm run build`

### Problem: Hydration mismatch errors
**Solution:**
1. Verify `[isClient, setIsClient]` exists in CollabEditor
2. Ensure `{isClient && <Editor />}` is in JSX
3. Check ClientOnly wrapper is around CollabEditor in room page

### Problem: Clipboard NotAllowedError still appears
**Solution:**
1. Check CollabEditor options have:
   - `'editor.formatOnPaste': false`
   - `'editor.formatOnType': false`
2. Clear browser cache (Ctrl+Shift+R)

### Problem: Editor doesn't appear at all
**Solution:**
1. Check browser console for JavaScript errors
2. Verify ClientOnly wrapper is in room page
3. Check if dynamic import is loading (Network tab in DevTools)

### Problem: Hot reload not working
**Solution:**
1. Check `next.config.ts` has webpack config
2. Restart dev server: Stop and run `npm run dev` again
3. Try accessing a different route then back

### Problem: Theme registration errors
**Solution:**
1. Check `onMount` callback has try/catch
2. Verify `await import('monaco-editor')` is inside onMount
3. Clear browser cache

---

## 📊 Success Metrics

Your fixes are complete and production-ready when:

| Metric | Target | Status |
|--------|--------|--------|
| Build errors | 0 | [ ] ✅ |
| Hydration warnings | 0 | [ ] ✅ |
| Console errors | 0 | [ ] ✅ |
| Clipboard errors | 0 | [ ] ✅ |
| Editor load time | < 2s | [ ] ✅ |
| Theme registration | Success | [ ] ✅ |
| Code execution | Works | [ ] ✅ |
| Hot reload | Works | [ ] ✅ |

---

## 📝 Log Entry Template

If issues persist, gather this information:

```
1. Node version: npm -v
2. Next.js version: grep next package.json
3. Browser: [Chrome/Firefox/Safari/Edge]
4. Error message: [exact error from console]
5. Steps to reproduce: [1, 2, 3...]
6. Build output: npm run build 2>&1 | head -50
7. Files modified: [list of changed files]
```

---

## ✅ All Tests Passed?

**Congratulations!** Your Monaco Editor is now:
- ✅ Fully client-side rendered
- ✅ SSR-safe with no hydration mismatches
- ✅ Clipboard-safe with no permission errors
- ✅ Turbopack-optimized
- ✅ Production-ready for Next.js 16.2.1

Your app is ready to deploy! 🚀
