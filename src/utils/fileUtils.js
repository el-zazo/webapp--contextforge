import { BINARY_EXTENSIONS } from './constants';

// ─── Binary / extension helpers ──────────────────────────────────────────────────

export function isBinaryFile(fileName) {
  const ext = getExtension(fileName);
  return BINARY_EXTENSIONS.has(ext);
}

export function getExtension(fileName) {
  const idx = fileName.lastIndexOf('.');
  if (idx === -1) return '';
  return fileName.slice(idx).toLowerCase();
}

// ─── Regex helpers ───────────────────────────────────────────────────────────────

function escapeRegex(str) {
  return str.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

/**
 * Convert a glob pattern to a RegExp string.
 *
 * @param {string} pattern  Glob pattern (already cleaned — no leading /).
 * @param {boolean} isPath  true → path mode (* = [^/]*, ** = cross-segment); false → name mode (* = .*)
 * @param {boolean} caseSensitive
 * @returns {RegExp}
 */
function globToRegex(pattern, isPath, caseSensitive) {
  // ── Name-only mode ──────────────────────────────────────────────────────
  if (!isPath) {
    let r = '';
    for (const ch of pattern) {
      if (ch === '*') r += '.*';
      else r += escapeRegex(ch);
    }
    return new RegExp('^' + r + '$', caseSensitive ? '' : 'i');
  }

  // ── Path mode — split by / and process segment by segment ───────────────
  const segments = pattern.split('/');
  let r = '';

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    if (seg === '**') {
      if (segments.length === 1) {
        // Lone ** — matches everything
        r += '.*';
      } else if (i === 0) {
        // ** at start: e.g. **/docs/README.md → matches docs/README.md or a/b/docs/README.md
        r += '(?:.*\\/)?';
      } else if (i === segments.length - 1) {
        // ** at end: e.g. src/** → matches src, src/file, src/a/b/file
        // Undo the separator we just appended in the previous iteration
        r = r.replace(/\\\/$/, '');
        r += '(?:\\/.*)?';
      } else {
        // ** in middle: e.g. src/**/file.js → matches src/file.js or src/a/b/file.js
        r += '(?:.*\\/)?';
      }
    } else {
      // Normal segment — * matches within one segment only ([^/]*)
      for (const ch of seg) {
        if (ch === '*') r += '[^/]*';
        else r += escapeRegex(ch);
      }

      // Append path separator unless next segment is ** (it handles its own separator)
      if (i < segments.length - 1 && segments[i + 1] !== '**') {
        r += '\\/';
      } else if (i < segments.length - 1 && segments[i + 1] === '**') {
        r += '\\/';
      }
    }
  }

  return new RegExp('^' + r + '$', caseSensitive ? '' : 'i');
}

/**
 * Test a string against a glob pattern.
 */
function matchGlob(str, pattern, isPath, caseSensitive) {
  const regex = globToRegex(pattern, isPath, caseSensitive);
  return regex.test(str);
}

// ─── Pattern classification ──────────────────────────────────────────────────────

// Determine whether a pattern is "name-only" or "path-based".
//
// Name-only: no slash at all, or only a trailing slash.
//   node_modules/   - name-only
//   *.log            - name-only
//   .env             - name-only
//
// Path-based: contains a slash somewhere other than only at the end.
//   src/auth/routes.js      - path-based
//   src/[double-star]/...   - path-based
//   [double-star]/docs/...  - path-based
function isNameOnlyPattern(cleanPattern) {
  return (
    !cleanPattern.includes('/') ||
    (cleanPattern.endsWith('/') &&
      cleanPattern.indexOf('/') === cleanPattern.length - 1)
  );
}

/**
 * Test a single file/folder object against a single exclusion pattern.
 *
 * @param {{ name: string, path: string }} file
 * @param {string}  pattern       Raw pattern string (may have leading /)
 * @param {boolean} caseSensitive
 * @returns {boolean}
 */
function matchesPattern(file, pattern, caseSensitive) {
  const cleanPattern = pattern.startsWith('/') ? pattern.slice(1) : pattern;
  if (!cleanPattern) return false;

  if (isNameOnlyPattern(cleanPattern)) {
    // Name-only: strip trailing / and match against file.name
    return matchGlob(
      file.name,
      cleanPattern.replace(/\/$/, ''),
      false,
      caseSensitive
    );
  }

  // Path-based: strip trailing / and match against file.path
  return matchGlob(
    file.path,
    cleanPattern.replace(/\/$/, ''),
    true,
    caseSensitive
  );
}

// ─── Public exclusion API ────────────────────────────────────────────────────────

/**
 * Check whether a file/folder object matches ANY of the given exclusion patterns.
 *
 * @param {{ name: string, path: string }} file
 * @param {string[]} patterns
 * @param {boolean}  caseSensitive  Default true.
 * @returns {boolean}
 */
export function isExcluded(file, patterns, caseSensitive = true) {
  for (const pattern of patterns) {
    if (matchesPattern(file, pattern, caseSensitive)) return true;
  }
  return false;
}

/**
 * Check whether a FILE is excluded, considering both:
 *   1. Patterns matched directly against the file (name-only + path-based)
 *   2. Name-only folder patterns matched against every parent folder in the path
 *
 * This is the primary function to use when determining whether a file in the
 * flat file list should be marked as excluded.
 *
 * @param {{ name: string, path: string }} file
 * @param {string[]} patterns
 * @param {boolean}  caseSensitive
 * @returns {boolean}
 */
export function isFileExcluded(file, patterns, caseSensitive = true) {
  // 1. Check the file itself against all patterns
  if (isExcluded(file, patterns, caseSensitive)) return true;

  // 2. For name-only folder patterns (like "node_modules/"), check each
  //    parent folder component in the file's path.
  const parts = file.path.split('/');
  for (let i = 0; i < parts.length - 1; i++) {
    const folderObj = {
      name: parts[i],
      path: parts.slice(0, i + 1).join('/'),
    };
    if (isExcluded(folderObj, patterns, caseSensitive)) return true;
  }

  return false;
}

// ─── Pattern validation (used by ExclusionManager) ───────────────────────────────

/**
 * Validate a user-entered exclusion pattern.
 * Returns an error string if invalid, or null if valid.
 */
export function validatePattern(pattern, existingPatterns) {
  const trimmed = pattern.trim();

  // Rule 1 — non-empty
  if (!trimmed) return 'Pattern cannot be empty';

  // Rule 2 — no spaces
  if (trimmed.includes(' ')) return 'Pattern cannot contain spaces';

  // Rule 3 — allowed characters
  if (!/^[a-zA-Z0-9._\-*/@#~+=\[\]()]+$/.test(trimmed)) {
    return 'Pattern contains invalid characters. Allowed: letters, digits, . _ - * / @ # ~ + = [ ] ( )';
  }

  // Rule 4 — no duplicates
  if (existingPatterns && existingPatterns.includes(trimmed)) {
    return 'Pattern already exists in the list';
  }

  // Strip leading / for the remaining checks
  let clean = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  if (!clean) return 'Pattern cannot be just a slash';

  // Rule 6 — no consecutive slashes
  if (clean.includes('//')) return 'Consecutive slashes (//) are not allowed';

  // Rule 5 — no triple wildcards
  if (clean.includes('***')) return 'Triple wildcard (***) is not allowed';

  // Classify pattern
  const nameOnly = isNameOnlyPattern(clean);

  if (nameOnly) {
    const name = clean.replace(/\/$/, '');
    if (!name) return 'Pattern cannot be empty';
    // ** is not meaningful in name-only context
    if (name.includes('**')) {
      return '** is not valid in name-only patterns (no slashes). Use a single * instead.';
    }
    // Check wildcard position
    if (hasWildcardInMiddleOfSegment(name)) {
      return 'Wildcard (*) can only appear at the start or end of the pattern';
    }
  } else {
    // Path-based — validate each segment
    const segments = clean.replace(/\/$/, '').split('/');
    for (const seg of segments) {
      // Rule 10 — each segment must be non-empty
      if (seg === '') return 'Empty path segments are not allowed (no consecutive slashes)';

      // ** must be a standalone segment
      if (seg.includes('**') && seg !== '**') {
        return '** must be a complete path segment, not part of a name (e.g., src/**/file.js)';
      }

      // Skip pure wildcard segments
      if (seg === '**' || seg === '*') continue;

      // Check * in middle of segment name
      if (hasWildcardInMiddleOfSegment(seg)) {
        return 'Each path segment must be a valid name or wildcard. Wildcards (*) cannot appear in the middle of a segment name (e.g., au*h is invalid)';
      }
    }
  }

  return null; // valid
}

/**
 * Returns true if `*` appears in the "middle" of a segment — i.e. not as a
 * prefix and/or suffix.  After stripping leading and trailing * characters,
 * if any * remains, it's in the middle.
 *
 *   *.js     → strip prefix * → .js   → no * → false ✓
 *   test*    → strip suffix * → test  → no * → false ✓
 *   *test*   → strip both     → test  → no * → false ✓
 *   na*me    → strip none     → na*me → has * → true  ✓
 *   routes.* → strip suffix: none → strip prefix: none → routes.* → has * after strip?
 *              strip prefix *: routes.* (no leading *) → strip suffix *: routes. → no * → false ✓
 */
function hasWildcardInMiddleOfSegment(segment) {
  let s = segment;
  while (s.startsWith('*')) s = s.slice(1);
  while (s.endsWith('*')) s = s.slice(0, -1);
  return s.includes('*');
}

// ─── Formatting helpers (unchanged) ──────────────────────────────────────────────

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatCharCount(count) {
  return count.toLocaleString() + ' chars';
}

// ─── Misc helpers ────────────────────────────────────────────────────────────────

export function buildFileTree(files, rootName) {
  const tree = {};
  const allNodes = [];

  files.forEach((file) => {
    const parts = file.path.split('/');
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!tree[currentPath]) {
        const node = {
          id: isLast ? file.id : `folder-${currentPath}`,
          name: part,
          path: currentPath,
          type: isLast ? 'file' : 'folder',
          parentPath: i === 0 ? '' : parts.slice(0, i).join('/'),
          depth: i,
          isBinary: isLast ? file.isBinary : false,
          isExcluded: false,
          extension: isLast ? file.extension : '',
          size: isLast ? file.size : 0,
          content: isLast ? file.content : '',
          childCount: 0,
        };
        tree[currentPath] = node;
        allNodes.push(node);
      }
    }
  });

  const folderMap = {};
  allNodes.forEach((node) => {
    if (node.type === 'folder') {
      folderMap[node.path] = node;
    }
  });

  files.forEach((file) => {
    const parts = file.path.split('/');
    let currentPath = '';
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
      if (folderMap[currentPath] && !file.isExcluded) {
        folderMap[currentPath].childCount++;
      }
    }
  });

  return { tree, allNodes, folderMap };
}

export function getUniqueExtensions(files) {
  const exts = new Set();
  files.forEach((f) => {
    if (f.extension && !f.isBinary) {
      exts.add(f.extension);
    }
  });
  return Array.from(exts).sort();
}
