var ef1941 = (function (exports, node_crypto) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }

    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }

    function sum(xs) {
        return xs.reduce((s, x) => s + x, 0);
    }
    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }
    function memoize$1(fn) {
        const cache = new Map();
        const cached = function (x) {
            if (!cache.has(x))
                cache.set(x, fn(x));
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return cache.get(x);
        };
        return cached;
    }
    const directions = {
        [0 /* DirectionKey.north */]: { label: 'N', dlon: 0, dlat: 1, icon: 0x81 },
        [1 /* DirectionKey.east */]: { label: 'E', dlon: -1, dlat: 0, icon: 0x82 },
        [2 /* DirectionKey.south */]: { label: 'S', dlon: 0, dlat: -1, icon: 0x83 },
        [3 /* DirectionKey.west */]: { label: 'W', dlon: 1, dlat: 0, icon: 0x84 }, // left  1011 => 3
    };
    const weatherdata = {
        [0 /* WeatherKey.dry */]: { label: 'dry', earth: 0x10, contrast: 0x06 },
        [1 /* WeatherKey.mud */]: { label: 'mud', earth: 0x02, contrast: 0x06 },
        [2 /* WeatherKey.snow */]: { label: 'snow', earth: 0x0A, contrast: 0x04 },
    };
    const players = {
        [0 /* PlayerKey.German */]: {
            label: 'German', unit: 'CORPS', color: 0x0C, homedir: 3 /* DirectionKey.west */,
            supply: { sea: 1, maxfail: [24, 0, 16], freeze: 1 }
        },
        [1 /* PlayerKey.Russian */]: {
            label: 'Russian', unit: 'ARMY', color: 0x46, homedir: 1 /* DirectionKey.east */,
            supply: { sea: 0, maxfail: [24, 24, 24], freeze: 0 }
        },
    };
    const terraintypes = {
        [0 /* TerrainKey.clear */]: {
            label: 'clear', color: 0x02,
            offence: 0, defence: 0, movecost: [[6, 24, 10], [4, 30, 6]]
        },
        [1 /* TerrainKey.mountain_forest */]: {
            label: 'mountain/forest', color: 0x28, altcolor: 0xD6,
            offence: 0, defence: 1, movecost: [[12, 30, 16], [8, 30, 10]]
        },
        [2 /* TerrainKey.city */]: {
            label: 'city', color: 0x00,
            offence: 0, defence: 1, movecost: [[8, 24, 10], [6, 30, 8]]
        },
        [3 /* TerrainKey.frozen_swamp */]: {
            label: 'frozen swamp', color: 0x0C,
            offence: 0, defence: 0, movecost: [[0, 0, 12], [0, 0, 8]]
        },
        [4 /* TerrainKey.frozen_river */]: {
            label: 'frozen river', color: 0x0C,
            offence: 0, defence: 0, movecost: [[0, 0, 12], [0, 0, 8]]
        },
        [5 /* TerrainKey.swamp */]: {
            label: 'swamp', color: 0x94,
            offence: 0, defence: 0, movecost: [[18, 30, 24], [18, 30, 24]]
        },
        [6 /* TerrainKey.river */]: {
            label: 'river', color: 0x94,
            offence: -1, defence: -1, movecost: [[14, 30, 28], [13, 30, 28]]
        },
        [7 /* TerrainKey.coastline */]: {
            // strange that coastline acts like river but estuary doesn't?
            label: 'coastline', color: 0x94,
            offence: -1, defence: -1, movecost: [[8, 26, 12], [6, 30, 8]]
        },
        [8 /* TerrainKey.estuary */]: {
            label: 'estuary', color: 0x94,
            offence: 0, defence: 0, movecost: [[20, 28, 24], [16, 30, 20]],
        },
        [9 /* TerrainKey.impassable */]: {
            label: 'impassable', color: 0x94, altcolor: 0x0C,
            offence: 0, defence: 0, movecost: [[0, 0, 0], [0, 0, 0]]
        }
    };
    const waterstate = {
        [0 /* WaterStateKey.freeze */]: {
            dir: 2 /* DirectionKey.south */, terrain: [3 /* TerrainKey.frozen_swamp */, 4 /* TerrainKey.frozen_river */]
        },
        [1 /* WaterStateKey.thaw */]: {
            dir: 0 /* DirectionKey.north */, terrain: [5 /* TerrainKey.swamp */, 6 /* TerrainKey.river */]
        },
    };
    const monthdata = {
        [0 /* MonthKey.Jan */]: { label: "January", trees: 0x12, weather: 2 /* WeatherKey.snow */ },
        [1 /* MonthKey.Feb */]: { label: "February", trees: 0x12, weather: 2 /* WeatherKey.snow */ },
        [2 /* MonthKey.Mar */]: { label: "March", trees: 0x12, weather: 2 /* WeatherKey.snow */, water: 1 /* WaterStateKey.thaw */ },
        [3 /* MonthKey.Apr */]: { label: "April", trees: 0xD2, weather: 1 /* WeatherKey.mud */ },
        [4 /* MonthKey.May */]: { label: "May", trees: 0xD8, weather: 0 /* WeatherKey.dry */ },
        [5 /* MonthKey.Jun */]: { label: "June", trees: 0xD6, weather: 0 /* WeatherKey.dry */ },
        [6 /* MonthKey.Jul */]: { label: "July", trees: 0xC4, weather: 0 /* WeatherKey.dry */ },
        [7 /* MonthKey.Aug */]: { label: "August", trees: 0xD4, weather: 0 /* WeatherKey.dry */ },
        [8 /* MonthKey.Sep */]: { label: "September", trees: 0xC2, weather: 0 /* WeatherKey.dry */ },
        [9 /* MonthKey.Oct */]: { label: "October", trees: 0x12, weather: 1 /* WeatherKey.mud */ },
        [10 /* MonthKey.Nov */]: { label: "November", trees: 0x12, weather: 2 /* WeatherKey.snow */, water: 0 /* WaterStateKey.freeze */ },
        [11 /* MonthKey.Dec */]: { label: "December", trees: 0x12, weather: 2 /* WeatherKey.snow */ },
    };
    const unitkinds = {
        [0 /* UnitKindKey.infantry */]: { key: 'infantry', icon: 0x7d },
        [1 /* UnitKindKey.armor */]: { key: 'armor', icon: 0x7e },
        [2 /* UnitKindKey.air */]: { key: 'air', icon: 0x7c },
    };

    const scenarios = {
        [0 /* ScenarioKey.apx */]: {
            label: 'APX MODE', map: 0 /* MapVariantKey.apx */, oob: 0 /* OobVariantKey.apx */, start: '1941/6/22',
            //TODO fix me
            ncity: 18, mdmg: 1, cdmg: 5, cadj: 0, nunit: [0x37, 0x9f], endturn: 44,
            scoring: { win: 255, location: true },
            surprised: 1 /* PlayerKey.Russian */, repl: [0, 2]
        },
        [1 /* ScenarioKey.learner */]: {
            label: 'LEARNER', map: 1 /* MapVariantKey.cart */, oob: 1 /* OobVariantKey.cart41 */, start: '1941/6/22',
            ncity: 1, mdmg: 4, cdmg: 12, cadj: 255, nunit: [0x2, 0x31], endturn: 14,
            scoring: { win: 5, strength: [null, 'losses'] },
            surprised: 1 /* PlayerKey.Russian */, skipsupply: true, nozoc: true, simplebreak: true
        },
        [2 /* ScenarioKey.beginner */]: {
            label: 'BEGINNER', map: 1 /* MapVariantKey.cart */, oob: 1 /* OobVariantKey.cart41 */, start: '1941/6/22',
            ncity: 1, mdmg: 4, cdmg: 12, cadj: 150, nunit: [0x12, 0x50], endturn: 14,
            scoring: { win: 25, strength: [null, 'losses'] },
            surprised: 1 /* PlayerKey.Russian */, skipsupply: true, nozoc: true, simplebreak: true
        },
        [3 /* ScenarioKey.intermediate */]: {
            label: 'INTERMED', map: 1 /* MapVariantKey.cart */, oob: 1 /* OobVariantKey.cart41 */, start: '1941/6/22',
            ncity: 3, mdmg: 2, cdmg: 8, cadj: 75, nunit: [0x1f, 0x72], endturn: 40,
            surprised: 1 /* PlayerKey.Russian */, scoring: { win: 40, strength: ['losses', 'losses'] },
        },
        [4 /* ScenarioKey.advanced */]: {
            label: 'ADVANCED', map: 1 /* MapVariantKey.cart */, oob: 1 /* OobVariantKey.cart41 */, start: '1941/6/22',
            ncity: 18, mdmg: 1, cdmg: 5, cadj: 25, nunit: [0x2b, 0x90], endturn: 40,
            scoring: { win: 80, strength: ['losses', 'losses'] },
            surprised: 1 /* PlayerKey.Russian */, fog: 6,
        },
        [5 /* ScenarioKey.expert41 */]: {
            label: 'EXPERT41', map: 1 /* MapVariantKey.cart */, oob: 1 /* OobVariantKey.cart41 */, start: '1941/6/22',
            ncity: 18, mdmg: 1, cdmg: 4, cadj: 0, nunit: [0x30, 0xa8], endturn: 44,
            scoring: { win: 255, strength: ['losses', 'current'] },
            surprised: 1 /* PlayerKey.Russian */, mvmode: true, fog: 7, defmod: 1,
        },
        [6 /* ScenarioKey.expert42 */]: {
            //TODO arrival turns for '42 scenario seem to be calculated in cartridge.asm:3709
            label: 'EXPERT42', map: 1 /* MapVariantKey.cart */, oob: 2 /* OobVariantKey.cart42 */, start: '1942/5/24',
            ncity: 18, mdmg: 1, cdmg: 4, cadj: 0, nunit: [0x30, 0xa8], endturn: 44,
            // adjust by 9 here because cart measures losses wrt to 1941 start value
            scoring: { win: 255, strength: ['losses', 'current'], adjust: -9 },
            mvmode: true, fog: 7, defmod: 1,
            control: ['Riga', 'Rzhev', 'Smolensk', 'Minsk', 'Orel', 'Kharkov', 'Kiev', 'Dnepropetrovsk', 'Odessa']
        },
    };

    /**
     * Contains a bunch of routines to compact various integer data into
     * a sequence of six-bit unsigned ints (uint6) which we map to
     * a base64-like encoding
     */
    const chrs64 = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
        'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
        'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
        'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '-', '_'
    ];
    const chr2int = Object.fromEntries(chrs64.map((c, i) => [c, i])), int2chr = Object.fromEntries(chrs64.map((c, i) => [i, c]));
    function ischr64(c) {
        return chrs64.includes(c);
    }
    /** test v is unsigned integer */
    function isuint(v) {
        return Number.isInteger(v) && v >= 0;
    }
    // memoized Fibonacci numbers
    const fib = memoize$1((n) => n < 2 ? n : fib(n - 1) + fib(n - 2));
    function seq2str(seq) {
        if (seq.some(u => !isuint(u) || u >= 64))
            throw new Error(`seq2str: Invalid uint6 in input ${seq}`);
        return seq.map(u => int2chr[u]).join('');
    }
    function str2seq(s) {
        const chrs = s.split('');
        if (!chrs.every(ischr64))
            throw new Error(`str2seq: Unexpected characters in '${s}'`);
        return chrs.map(c => chr2int[c]);
    }
    /** convert payload to string, wrapping with optional prefix string, length marker, and CRC check */
    function wrap64(payload, prefix, length_maxbits = 12) {
        const seq = [].concat(bitsencode(payload.length, length_maxbits), payload, fletcher6(payload));
        return (prefix || '') + seq2str(seq);
    }
    /** unwrap payload to seqas wrapped by wrap64, ignoring garbage and trailing characters */
    function unwrap64(s, prefix, length_maxbits = 12) {
        prefix || (prefix = '');
        // check prefix
        if (!s.startsWith(prefix))
            throw new Error(`unwrap64: string didn't start with expected prefix '${prefix}'`);
        // remove prefix and extraenous characters, and convert to seq<uint64>
        const seq = str2seq(s.slice(prefix.length).replace(/[^-\w]/g, ''));
        // get payload length
        const n = bitsdecode(seq, length_maxbits);
        if (seq.length < n + 2) {
            throw new Error(`unwrap: expected at least ${n} + 2 characters after length marker, got ${seq.length}`);
        }
        // get payload and compute checksum
        const payload = seq.slice(0, n), chk = fletcher6(payload);
        // validate checksum
        if (!chk.every((u, i) => u == seq[n + i]))
            throw new Error(`unwrap64: checksum mismatch got ${s.slice(0, 2)}, expected ${chk}`);
        return payload;
    }
    /**
     * computes achecksum for sequence as a typle
     * using a six bit version of the Fletcher checksum
     */
    function fletcher6(seq, modulus = 61) {
        let x = 0, y = 0;
        seq.forEach(u => {
            x = (x + u) % modulus;
            y = (y + x) % modulus;
        });
        return [x, y];
    }
    /**
     * Encode a fixed-size uint of up to 1<<nbits as a seq of uint6
     */
    function bitsencode(n, nbits) {
        if (!isuint(n) || n >= (1 << nbits))
            throw new Error(`bitsencode: value ${n} exceeds max ${1 << nbits}`);
        const seq = [];
        for (let i = 0; i < Math.ceil(nbits / 6); i++) {
            seq.push(n & 0x3f);
            n >>= 6;
        }
        return seq;
    }
    /**
     * Decode a fixed-size value of up to nbits from a seq<uint6>
     * modifying seq in place
     */
    function bitsdecode(seq, nbits) {
        const nchars = Math.ceil(nbits / 6);
        if (nchars > seq.length) {
            throw new Error(`bitsdecode: expected at least ${nchars} characters, got ${seq.length}`);
        }
        let n = 0;
        seq.splice(0, nchars).reverse().forEach(u => { n = (n << 6) + u; });
        return n;
    }
    /** Fibnonacci encode a single uint to a uint with prefix-free bit pattern,
     * returned as a value >= 3 (b000011)
     * see https://en.wikipedia.org/wiki/Fibonacci_coding
     */
    function _fibencode_uint(n) {
        if (!isuint(n))
            throw new Error(`fibencode_uint: Invalid unsigned integer: ${n}`);
        let n1 = n + 1, // fib coding wants a natural number rather than a unit, i.e. 0 => 1
        k, bits = 1;
        for (k = 2; fib(k) <= n1; k++) /**/
            ; // k is index of largest fibonacci number in n1
        // create the fibonacci bit pattern by flagging presence/absence of each smaller number
        for (--k; k >= 2; k--) {
            bits <<= 1;
            const m = fib(k);
            if (n1 >= m) {
                bits |= 1;
                n1 -= m;
            }
        }
        return bits;
    }
    const fibencode_uint = memoize$1(_fibencode_uint);
    /** helper function estimating the size of an encoded value, used for run-length coding */
    function fibencsize(n) {
        return fibencode_uint(n).toString(2).length;
    }
    /** Fibonacci decode a prefix-free bit pattern to recover the original uint value */
    function _fibdecode_uint(bits) {
        if (!(isuint(bits) && bits >= 3))
            throw new Error(`fibdecode_uint: Invalid encoded integer: ${bits.toString(2)}`);
        // sum the fibonacci numbers represented by the bit pattern, ignoring the MSB flag
        let n = 0;
        for (let k = 2; bits > 1; k++) {
            if (bits & 0x1)
                n += fib(k);
            bits >>= 1;
        }
        return n - 1;
    }
    const fibdecode_uint = memoize$1(_fibdecode_uint);
    /** Fibonacci code a seq<uint> to a prefix free encoding chunked into seq<uint6> */
    function fibencode(vs) {
        if (typeof vs === 'number')
            return fibencode([vs]);
        if (!vs.every(isuint))
            throw new Error(`fibencode: Expected list of unsigned integers ${vs}`);
        const fibs = vs.map(fibencode_uint), seq = [];
        let bits = 0, k = 0, lead_bit = 0x1;
        while (fibs.length && k < 6) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            bits |= fibs.shift() << k;
            while (lead_bit <= bits) {
                k++;
                lead_bit <<= 1;
            }
            while (k >= 6) {
                seq.push(bits & 0x3f);
                bits >>= 6;
                lead_bit >>= 6;
                k -= 6;
            }
        }
        if (k)
            seq.push(bits);
        return seq;
    }
    /** Decode prefix-free Fibonacci coding chunked into seq<64> by fibencode() to recover original seq<uint> */
    function fibdecode(seq) {
        const vs = [];
        let bitseq = 0, m = 0, mask = 0x3, k = 2;
        while (seq.length) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            bitseq |= (seq.shift() << m);
            m += 6;
            while (k <= m) {
                if ((mask & bitseq) == mask) {
                    const bits = bitseq & ((1 << k) - 1), v = fibdecode_uint(bits);
                    vs.push(v);
                    bitseq >>= k;
                    m -= k;
                    k = 2;
                    mask = 0x3;
                }
                else {
                    k++;
                    mask <<= 1;
                }
            }
        }
        return vs;
    }
    /** run length code seq<uint> => seq<uint> (hopefully shorter) by replacing runs of consecutive
     * values by <marker> <value> <repeat - min_repeat>, returning a new array of unsigned integer.
     * @param {Array[uint]} vs - The list of values to encode
     * @param {uint} marker - value to use as repeat token; existing values >= marker are incremented
     * @param {function} vsize - Function returning the expected size of encoding a value
     */
    function rlencode(vs, marker = 0, vsize = fibencsize) {
        if (!vs.every(isuint))
            throw new Error(`rlencode: Expected list of unsigned integers: ${vs}`);
        if (!isuint(marker))
            throw new Error(`rlencode: Expected unsigned integer marker: ${marker}`);
        /*
        for efficient run coding we want len(<marker><value><0>) < len(<value><value>...)
        =>  len(<marker><0>) < len(<value>) * (repeat - 1)
        =>  repeat > len(<marker><0>) / len(<value>) + 1
        */
        const rptlen = vsize(marker) + vsize(0);
        const zs = [], seq = vs.map(v => v >= marker ? v + 1 : v);
        let prev = -1, repeat = 0;
        seq.push(-1); // dummy to make sure we flush final value(s)
        seq.forEach(v => {
            if (v == prev) {
                repeat++;
            }
            else {
                const prev_1 = prev > marker ? prev - 1 : prev, min_repeat = repeat > 1 ? Math.ceil(rptlen / vsize(prev_1)) + 1 : 2;
                if (repeat >= min_repeat) {
                    zs.push(marker);
                    zs.push(prev_1);
                    zs.push(repeat - min_repeat);
                }
                else {
                    while (repeat--)
                        zs.push(prev);
                }
                repeat = 1;
                prev = v;
            }
        });
        return zs;
    }
    /** run length decode seq<uint> => seq<uint> to recover original array provided to rlencode
     *  the marker and vsize function must match the original encoding
     */
    function rldecode(zs, marker = 0, vsize = fibencsize) {
        if (!zs.every(isuint))
            throw new Error(`rldecode: Expected list of unsigned integers: ${zs}`);
        if (!isuint(marker))
            throw new Error(`rldecode: Expected unsigned integer marker: ${marker}`);
        const rptlen = vsize(marker) + vsize(0), vs = [];
        while (zs.length) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            let v = zs.shift();
            if (v != marker) {
                vs.push(v > marker ? v - 1 : v);
            }
            else {
                if (zs.length < 2)
                    throw new Error('rldecode: Malformed run definition');
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                v = zs.shift();
                const min_repeat = Math.ceil(rptlen / vsize(v)) + 1;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                let repeat = zs.shift() + min_repeat;
                while (repeat--)
                    vs.push(v);
            }
        }
        return vs;
    }
    /** map a seq<int> (or singleton int) to seq<uint> */
    const zigzag1 = memoize$1((v) => v < 0 ? ((-v) << 1) - 1 : v << 1);
    function zigzag(vs) {
        if (!vs.every(Number.isInteger))
            throw new Error(`zigzag: Expected list of integers: ${vs}`);
        return vs.map(zigzag1);
    }
    /** recover seq<int> from a zigzag()d seq<uint> */
    const zagzig1 = memoize$1((v) => v & 0x1 ? -((v + 1) >> 1) : v >> 1);
    function zagzig(vs) {
        if (!vs.every(isuint))
            throw new Error(`zagzig: Expected list of unsigned integers: ${vs}`);
        return vs.map(zagzig1);
    }
    /** combine multiple small numbers into a single result by interleaving bits
     * this is not safe for large numbers / long lists without switching to bigint
     * since JS works with signed 32-bit integers for bitwise ops
     */
    function ravel0_(v) {
        v = (v | (v << 8)) & 0x00FF00FF;
        v = (v | (v << 4)) & 0x0F0F0F0F;
        v = (v | (v << 2)) & 0x33333333;
        v = (v | (v << 1)) & 0x55555555;
        return v;
    }
    const ravel0 = memoize$1(ravel0_);
    function unravel0_(v) {
        v &= 0x55555555;
        v = (v | (v >> 1)) & 0x33333333;
        v = (v | (v >> 2)) & 0x0F0F0F0F;
        v = (v | (v >> 4)) & 0x00FF00FF;
        v = (v | (v >> 8)) & 0x0000FFFF;
        return v;
    }
    const unravel0 = memoize$1(unravel0_);
    function ravel2(x, y) {
        if (!(isuint(x) && isuint(y)))
            throw new Error(`ravel: Expected pair of unsigned int, got ${x}, ${y}`);
        return ravel0(x) | (ravel0(y) << 1);
    }
    function unravel2(z) {
        if (!isuint(z))
            throw new Error(`unravel: Expected unsigned int: ${z}`);
        return [unravel0(z), unravel0(z >> 1)];
    }

    function toid(lon, lat) {
        return ravel2(zigzag1(lon), zigzag1(lat));
    }
    function byid_(gid) {
        const [lon, lat] = zagzig(unravel2(gid));
        return { lon, lat, gid };
    }
    const byid = memoize$1(byid_);
    function adjsbyid_(gid) {
        const { lon, lat } = Grid.byid(gid);
        return Object.values(directions)
            .map(({ dlon, dlat }) => Grid.lonlat(lon + dlon, lat + dlat).gid);
    }
    const adjsbyid = memoize$1(adjsbyid_);
    function directionsFrom(p, q) {
        // project all directions from p to q and rank them, ensuring tie breaking has no bias
        // returned pairs are like [ (q - p) . dir, key ], ordered by projection magnitude
        // if p == q an empty list is returned
        const dlat = (q.lat - p.lat), dlon = (q.lon - p.lon);
        if (dlat == 0 && dlon == 0)
            return [];
        return Object.entries(directions)
            .map(([k, d]) => [d.dlon * dlon + d.dlat * dlat, +k])
            // in case of tied dirs (which will be neighbors) pick the clockwise leader
            .sort(([a, i], [b, j]) => (b - a) || ((j - i + 4 + 2) % 4) - 2);
    }
    function directionFrom(p, q) {
        // return the index of the closest cardinal direction from p to q, null if p == q
        const projections = directionsFrom(p, q);
        return projections.length ? projections[0][1] : null;
    }
    function squareSpiral(center, radius) {
        // return list of the (2*radius+1)^2 locations spiraling out from loc
        // which form a square of given radius, based on a spiralpattern
        // that looks like N, E, S,S, W,W, N,N,N, E,E,E, S,S,S,S, W,W,W,W, ...
        let loc = center, dir = 0, i = 0, side = 1;
        const locs = [loc];
        while (++i < 2 * radius + 1) {
            loc = Grid.adjacent(loc, dir);
            locs.push(loc);
            if (i == side) {
                side += dir % 2;
                dir = (dir + 1) % 4;
                i = 0;
            }
        }
        return locs;
    }
    // hack to memoize squarespiral of radius 1 which get used a lot
    function squareSpira11_(gid) {
        return squareSpiral(Grid.byid(gid), 1).map(({ gid }) => gid);
    }
    const squareSpira11 = memoize$1(squareSpira11_);
    function diamondSpiral(center, radius, facing = 0 /* DirectionKey.north */) {
        // return list of GridPoints within radius manhattan distance of center,
        // spiraling out from the origin starting in direction facting
        // the 0th shell has a single point, with the i-th shell having 4*i points for i>1
        // so the result has 2*r*(r+1) + 1 points
        let loc = Grid.lonlat(center.lon, center.lat);
        // the zeroth shell
        const locs = [loc];
        for (let r = 1; r <= radius; r++) {
            // bump out one shell in the required direction
            loc = Grid.adjacent(loc, facing);
            // loop over the four sides of the shell
            for (let d = 0; d < 4; d++) {
                const d1 = (facing + d + 1) % 4, d2 = (facing + d + 2) % 4;
                for (let i = 0; i < r; i++) {
                    // push the point and make a diagonal step
                    locs.push(loc);
                    loc = Grid.adjacent(Grid.adjacent(loc, d1), d2);
                }
            }
        }
        return locs;
    }
    const Grid = {
        byid: byid,
        lonlat: (lon, lat) => byid(toid(lon, lat)),
        point: ({ lon, lat }) => byid(toid(lon, lat)),
        adjacencies: ({ gid }) => adjsbyid(gid).map(Grid.byid),
        adjacent: ({ gid }, d) => Grid.byid(adjsbyid(gid)[d]),
        // calculate the taxicab metric between two locations
        manhattanDistance: (p, q) => Math.abs(p.lat - q.lat) + Math.abs(p.lon - q.lon),
        directionsFrom: directionsFrom,
        directionFrom: directionFrom,
        squareSpiral: (center, radius) => {
            return (radius == 1) ? squareSpira11(center.gid).map(Grid.byid) : squareSpiral(center, radius);
        },
        diamondSpiral: diamondSpiral,
    };

    const mapVariants = {
        [0 /* MapVariantKey.apx */]: {
            font: 'apx',
            encoding: [
                ' |123456|@*0$|||,.;:|abcdefghijklmnopqrstuvwxyz|ABCDEFGHIJKLMNOPQR|{}??|~#',
                ' |123456|@*0$|||,.;:|abcdefghijklmnopqrst|ABCDEFGHIJKLMNOPQRSTUVW|{}<??|~#'
            ],
            ascii: `
################################################
#~~~A        L~~B                              #
#~~~GJ   MNPONK{H                              #
#~~~~GPOQ~~IH@om                               #
#~~~~~IDEF{}v;f.        ow nrtx                #
#~~~~~C   RJj:g15       fcsl  dqw    nv        #
#~~~~~B   LBe.h26       i      nz* oskcrw      #
#~~~~~GJ   Hg,i31              gcrqm   0dx     #
#~~~~~~A      j43             ol         g     #
#~~ID~~B*     f 2       2     h          btqy  #
#~~B KE}qrw             1     i            nk  #
#~~A      av     om   0   $  nk            g   #
#~~C       bsx  nl     36    j             e   #
#~~GJ        ctuk   2i412pusqm             h   #
#~~~B              ntk 34f                nl   #
#~~I}rqsv   265  oul@ 16 e  j             i$   #
#~IH    ct 1431 pm          i             f    #
#EH        26$ .h,          aty          pm    #
#        135   :bw;      @    h0         j     #
#       26    ;,:dy           cw         h     #
#x0     54  ,.:;. j            g         g     #
#dw     31  ;quw:,f       h    bsv       i     #
# ay   346 ,.:;crxi       cx     dx      f     #
#  g   25,:;,.,:.dz        i      auqsrx j     #
# nl     .,;:.   ,f       $f           e@aqrtw #
#ki       :      @g        bw          g     bx#
#16               ans       dnmolnr    f      d#
#2534               cmp           cop jh       #
#  1563  ns   nq      blr          ktmi        #
#    4315 cq   dop      doq       ji           #
#     246  amnlr als      ap     kh            #
#      135     bp  cr     *e   NC<0            #
#       264     ds  bq    kh ODHPL             #
#        516 r   aq  dp   g MI~QK              #
#        1243bs   cr0 e  ji B~~FR              #
#        53621aq   d{C}DE<TJ~~~PL $jlonq       #
#  451523614562cp  NH~~~PKUVVWASkomh   f       #
#  5364142 3416 d{EI~~~~FR  NH~G}DER           #
#               OJ~~~~~~~GSMI~~~~~~GCS542361621#
#               B~~~~~~~~~FJ~~~~~~~~~FDES123433#
################################################
`,
            // M.ASM:8630 MPTS / MOSCX / MOSCY - special city victory points; updated in CITYxxx for CART
            // oddly Sevastpol is assigned points but is not coded as a city in either version of the map?
            //TODO  create a variant that replaces F => @ in the bottom row of the map, and adds to city list
            cities: [
                { owner: 1 /* PlayerKey.Russian */, lon: 20, lat: 28, points: 20, label: 'Moscow' },
                { owner: 1 /* PlayerKey.Russian */, lon: 33, lat: 36, points: 10, label: 'Leningrad' },
                { owner: 1 /* PlayerKey.Russian */, lon: 6, lat: 15, points: 10, label: 'Stalingrad' },
                { owner: 1 /* PlayerKey.Russian */, lon: 12, lat: 4, points: 0, label: 'Krasnodar' },
                { owner: 1 /* PlayerKey.Russian */, lon: 13, lat: 33, points: 0, label: 'Gorky' },
                { owner: 1 /* PlayerKey.Russian */, lon: 7, lat: 32, points: 0, label: 'Kazan' },
                { owner: 1 /* PlayerKey.Russian */, lon: 38, lat: 30, points: 0, label: 'Riga' },
                { owner: 1 /* PlayerKey.Russian */, lon: 24, lat: 28, points: 0, label: 'Rzhev' },
                { owner: 1 /* PlayerKey.Russian */, lon: 26, lat: 24, points: 0, label: 'Smolensk' },
                { owner: 1 /* PlayerKey.Russian */, lon: 3, lat: 24, points: 0, label: 'Kuibishev' },
                { owner: 1 /* PlayerKey.Russian */, lon: 33, lat: 22, points: 0, label: 'Minsk' },
                { owner: 1 /* PlayerKey.Russian */, lon: 15, lat: 21, points: 0, label: 'Voronezh' },
                { owner: 1 /* PlayerKey.Russian */, lon: 21, lat: 21, points: 0, label: 'Orel' },
                { owner: 1 /* PlayerKey.Russian */, lon: 20, lat: 15, points: 0, label: 'Kharkov' },
                { owner: 1 /* PlayerKey.Russian */, lon: 29, lat: 14, points: 0, label: 'Kiev' },
                { owner: 1 /* PlayerKey.Russian */, lon: 12, lat: 8, points: 0, label: 'Rostov' },
                { owner: 1 /* PlayerKey.Russian */, lon: 20, lat: 8, points: 0, label: 'Dnepropetrovsk' },
                { owner: 1 /* PlayerKey.Russian */, lon: 26, lat: 5, points: 0, label: 'Odessa' },
                { owner: 1 /* PlayerKey.Russian */, lon: 20, lat: 0, points: 0, label: 'Sevastopol' },
                { owner: 0 /* PlayerKey.German */, lon: 44, lat: 19, points: 0, label: 'Warsaw' },
            ]
        },
        [1 /* MapVariantKey.cart */]: {
            font: 'cart',
            encoding: [
                " |123456|@*0$|||,.;:|abcdefghijklmnopqrstuvwxyz|ABCDEFGHIJKLMNOPQ|{}???|~#",
                " |123456|@*0$|||,.;:|abcdefghijklmnopqrst|ABCDEFGHIJKLMNOPQRSTUV|{}<???|~#"
            ],
            ascii: `
################################################
#~~~A        L~~B                              #
#~~~GJ   MNPONK{H                              #
#~~~~GPOO~~IH0om                               #
#~~~~~IDEF{}v;f.        ow nrtx                #
#~~~~~C   QJj:g15       fcsl  dqw    nv        #
#~~~~~B   LBe.h26       i      nz* oskcrw      #
#~~~~~GJ   Hg,i31              gcrqm   @dx     #
#~~~~~~A      j43             ol         g     #
#~~ID~~B*     f 2       2     h          btqy  #
#~~B KE}qrw             1     i            nk  #
#~~A      av     om   @   $  nk            g   #
#~~C       bsx  nl     36    j             e   #
#~~GJ        ctuk   2i412pusqm             h   #
#~~~B              ntk 34f                nl   #
#~~I}rqsv   265  oul@ 16 e  j             i*   #
#~IH    ct 1431 pm          i             f    #
#EH        26@ .h,          aty          pm    #
#        135   :bw;      @    h*         j     #
#       26    ;,:dy           cw         h     #
#x@     54  ,.:;. j            g         g     #
#dw     31  ;quw:,f       h    bsv       i     #
# ay   346 ,.:;crxi       cx     dx      f     #
#  g   25,:;,.,:.dz        i      auqsrx j     #
# nl     .,;:.   ,f       *f           e0aqrtw #
# i       :      @g        bw          g     bx#
#16               ans       dnmolnr    f      d#
#2534               cmp           cop jh       #
#  1563  ns   nq      blr          ktmi        #
#    4315 cq   dop      doq       ji           #
#     246  amnlr als      ap     kh            #
#      135     bp  cr     *e   NC<@            #
#       264     ds  bq    kh ODHPL             #
#        516 r   aq  dp   g MI~QK              #
#        1243bs   cr* e  ji B~~FR              #
#        53621aq   d{C}DE<TJ~~~PL 0jlonq       #
#  451523614562cp  NH~~~PKUVVVASkomh   f       #
#  5364142 3416 d{EI~~~~FR  NH~G}DER           #
#               OJ~~~~~~~GSMI~~~~~~GCS542361621#
#               B~~~~~~~~~FJ~~~~~~~~~FDES123433#
################################################
`,
            // M.ASM:8630 MPTS / MOSCX / MOSCY - special city victory points; updated in CITYxxx for CART
            // oddly Sevastpol is assigned points but is not coded as a city in either version of the map?
            //TODO  create a variant that replaces F => @ in the bottom row of the map, and adds to city list
            cities: [
                { owner: 1 /* PlayerKey.Russian */, lon: 20, lat: 28, points: 10, label: 'Moscow' },
                { owner: 1 /* PlayerKey.Russian */, lon: 33, lat: 36, points: 5, label: 'Leningrad' },
                { owner: 1 /* PlayerKey.Russian */, lon: 6, lat: 15, points: 5, label: 'Stalingrad' },
                { owner: 1 /* PlayerKey.Russian */, lon: 12, lat: 4, points: 5, label: 'Krasnodar' },
                { owner: 1 /* PlayerKey.Russian */, lon: 13, lat: 33, points: 5, label: 'Gorky' },
                { owner: 1 /* PlayerKey.Russian */, lon: 7, lat: 32, points: 5, label: 'Kazan' },
                { owner: 1 /* PlayerKey.Russian */, lon: 38, lat: 30, points: 2, label: 'Riga' },
                { owner: 1 /* PlayerKey.Russian */, lon: 24, lat: 28, points: 2, label: 'Rzhev' },
                { owner: 1 /* PlayerKey.Russian */, lon: 26, lat: 24, points: 2, label: 'Smolensk' },
                { owner: 1 /* PlayerKey.Russian */, lon: 3, lat: 24, points: 5, label: 'Kuibishev' },
                { owner: 1 /* PlayerKey.Russian */, lon: 33, lat: 22, points: 2, label: 'Minsk' },
                { owner: 1 /* PlayerKey.Russian */, lon: 15, lat: 21, points: 2, label: 'Voronezh' },
                { owner: 1 /* PlayerKey.Russian */, lon: 21, lat: 21, points: 2, label: 'Orel' },
                { owner: 1 /* PlayerKey.Russian */, lon: 20, lat: 15, points: 2, label: 'Kharkov' },
                { owner: 1 /* PlayerKey.Russian */, lon: 29, lat: 14, points: 2, label: 'Kiev' },
                { owner: 1 /* PlayerKey.Russian */, lon: 12, lat: 8, points: 2, label: 'Rostov' },
                { owner: 1 /* PlayerKey.Russian */, lon: 20, lat: 8, points: 2, label: 'Dnepropetrovsk' },
                { owner: 1 /* PlayerKey.Russian */, lon: 26, lat: 5, points: 2, label: 'Odessa' },
                { owner: 1 /* PlayerKey.Russian */, lon: 20, lat: 0, points: 0, label: 'Sevastopol' },
                { owner: 0 /* PlayerKey.German */, lon: 44, lat: 19, points: 5, label: 'Warsaw' },
            ]
        },
    };
    // D.ASM:5500 BHX1 .BYTE ... / BHY1 / BHX2 / BHY2
    // there are 11 impassable square-sides
    // the original game stores 22 sets of (x1,y1),(x2,y2) coordinates
    // to enumerate the to/from coordinates in both senses
    // but we can reduce from 88 to 22 bytes by storing a list of
    // squares you can't move north from (or south to), and likewise west from (or east to)
    const blocked = [
        // can't move north from here (or south into here)
        [
            { lon: 40, lat: 35 },
            { lon: 39, lat: 35 },
            { lon: 38, lat: 35 },
            { lon: 35, lat: 36 },
            { lon: 34, lat: 36 },
            { lon: 22, lat: 3 },
            { lon: 15, lat: 6 },
            { lon: 14, lat: 7 },
            { lon: 19, lat: 3 }
        ],
        // can't move west from here (or east into here)
        [
            { lon: 35, lat: 33 },
            { lon: 14, lat: 7 },
        ]
    ];

    //TODO these represent deviations from the original implementation
    // in general false reflects the original APX/cartridge condition
    // the values here show my current choices, but aren't actually configurable in code yet
    const options = {
        colorPalette: 'WikiNTSC',
        astarPathFinding: true,
        reduceInitialFogInContact: true,
        mapIncludesSevastopol: true,
        disperseEliminatedUnits: true,
        defenderFirstStrike: true,
        // hard-wired settings (these config options aren't referenced)
        mapIncludeSevastopol: true,
        germanReinforcementsMoveOnArrival: true,
        russianReinforcementsMoveOnArrival: false,
        moreRandomSupplyAndRetreat: true,
        shuffleUnitInitiative: false,
        shuffleThinkingOrder: false,
    };

    var _Mapboard_instances, _Mapboard_game, _Mapboard_maxlon, _Mapboard_maxlat, _Mapboard_icelat, _Mapboard_validlocs, _Mapboard_neighborids_, _Mapboard_neighborids, _Mapboard_freezeThaw;
    // mapboard constructor, used as a container of MapPoints
    class Mapboard {
        constructor(game, memento) {
            _Mapboard_instances.add(this);
            _Mapboard_game.set(this, void 0); //TODO only wants .month, .emit, .rand
            _Mapboard_maxlon.set(this, void 0);
            _Mapboard_maxlat.set(this, void 0);
            _Mapboard_icelat.set(this, 39); // via M.ASM:8600 PSXVAL initial value is 0x27
            _Mapboard_validlocs.set(this, new Map());
            // hack to memoize class method.  probably a better way to do it?
            _Mapboard_neighborids.set(this, memoize$1((gid) => __classPrivateFieldGet(this, _Mapboard_instances, "m", _Mapboard_neighborids_).call(this, gid)));
            const scenario = scenarios[game.scenario], variant = mapVariants[scenario.map], ncity = scenario.ncity, mapencoding = variant.encoding.map((enc, i) => {
                // convert the encoding table into a lookup of char => [icon, terraintype, alt-flag]
                const lookup = {};
                let ch = 0;
                enc.split('|').forEach((s, t) => s.split('').forEach(c => {
                    const alt = ((t == 1 && i == 0) || ch == 0x40) ? 1 : 0;
                    if (ch == 0x40)
                        ch--;
                    lookup[c] = {
                        icon: i * 0x40 + ch++,
                        terrain: t,
                        alt: alt
                    };
                }));
                return lookup;
            });
            let raw = variant.ascii;
            raw = raw.slice().replace('~~FJ~~', '~~$J~~');
            // decode the map into a 2-d array of rows x cols of  {lon: , lat:, icon:, terrain:, alt:}
            const mapdata = raw.split(/\n/).slice(1, -1).map((row, i) => row.split('').map(c => Object.assign({}, mapencoding[i <= 25 ? 0 : 1][c])));
            this.font = variant.font;
            // excluding the impassable border valid is 0..maxlon-1, 0..maxlat-1
            __classPrivateFieldSet(this, _Mapboard_maxlon, mapdata[0].length - 2, "f");
            __classPrivateFieldSet(this, _Mapboard_maxlat, mapdata.length - 2, "f");
            __classPrivateFieldSet(this, _Mapboard_game, game, "f");
            this.locations = mapdata.map((row, i) => row.map((data, j) => {
                const lon = __classPrivateFieldGet(this, _Mapboard_maxlon, "f") - j, lat = __classPrivateFieldGet(this, _Mapboard_maxlat, "f") - i, pt = Grid.lonlat(lon, lat), loc = Object.assign(Object.assign({}, pt), data);
                if (pt.lat >= 0 && pt.lat < __classPrivateFieldGet(this, _Mapboard_maxlat, "f") && pt.lon >= 0 && pt.lon < __classPrivateFieldGet(this, _Mapboard_maxlon, "f")) {
                    __classPrivateFieldGet(this, _Mapboard_validlocs, "f").set(pt.gid, loc);
                }
                return loc;
            }));
            this.cities = variant.cities
                .filter(c => options.mapIncludesSevastopol )
                .map(c => (Object.assign({}, c)));
            this.cities.forEach((city, i) => {
                var _a;
                city.points = i < ncity ? ((_a = city.points) !== null && _a !== void 0 ? _a : 0) : 0;
                const loc = this.locationOf(Grid.point(city));
                if (loc.terrain != 2 /* TerrainKey.city */)
                    throw new Error(`Mapboard: city at (${loc.lon}, ${loc.lat}) missing city terrain`);
                loc.cityid = i;
                if (scenario.control && scenario.control.includes(city.label)) {
                    city.owner = 1 - city.owner;
                }
            });
            // verify each city terrain has a cityid
            const missing = this.locations.map(row => row.filter(loc => loc.terrain == 2 /* TerrainKey.city */ && typeof loc.cityid === 'undefined')).flat();
            if (missing.length > 0)
                throw new Error(`Mapboard: city terrain missing city details, e.g. ${this.describe(missing[0])}`);
            // verify that any control cities exist
            if (scenario.control) {
                const labels = this.cities.map(c => c.label), diff = scenario.control.filter(label => !labels.includes(label));
                if (diff.length > 0)
                    throw new Error(`Mapboard: scenario.control has unknown cities ${diff}`);
            }
            if (memento) {
                if (memento.length < variant.cities.length + 1)
                    throw new Error("Mapboard: malformed save data");
                __classPrivateFieldGet(this, _Mapboard_instances, "m", _Mapboard_freezeThaw).call(this, 0 /* WaterStateKey.freeze */, memento.shift());
                this.cities.forEach((c, i) => {
                    c.owner = memento.shift();
                });
            }
        }
        get memento() {
            const scenario = scenarios[__classPrivateFieldGet(this, _Mapboard_game, "f").scenario]; mapVariants[scenario.map]; const control = this.cities.map(c => c.owner);
            return [].concat([__classPrivateFieldGet(this, _Mapboard_icelat, "f")], control);
        }
        nextTurn(startOrResume = false) {
            const mdata = monthdata[__classPrivateFieldGet(this, _Mapboard_game, "f").month];
            //TODO :grimace: update the tree color in place in the terrain data
            terraintypes[1 /* TerrainKey.mountain_forest */].altcolor = mdata.trees;
            if (!startOrResume && mdata.water != null)
                __classPrivateFieldGet(this, _Mapboard_instances, "m", _Mapboard_freezeThaw).call(this, mdata.water);
        }
        get extent() {
            // map dimension including impassable boundary
            return { width: this.locations[0].length, height: this.locations.length };
        }
        get bbox() {
            // bounding box for valid map area
            return {
                [0 /* DirectionKey.north */]: __classPrivateFieldGet(this, _Mapboard_maxlat, "f") - 1,
                [2 /* DirectionKey.south */]: 0,
                [3 /* DirectionKey.west */]: __classPrivateFieldGet(this, _Mapboard_maxlon, "f") - 1,
                [1 /* DirectionKey.east */]: 0,
            };
        }
        xy({ lon, lat }) {
            // return an x, y indexed from top, left rather than lon, lat indexed from bottom, right
            return { x: __classPrivateFieldGet(this, _Mapboard_maxlon, "f") - lon, y: __classPrivateFieldGet(this, _Mapboard_maxlat, "f") - lat };
        }
        describe(loc, debug = false) {
            var _a;
            const city = loc.cityid != null ? this.cities[loc.cityid] : undefined, label = city
                ? ` ${city.label} (${(_a = city.points) !== null && _a !== void 0 ? _a : 0})`
                : (terraintypes[loc.terrain].label + (loc.alt ? "-alt" : "")), unit = loc.unitid != null ? __classPrivateFieldGet(this, _Mapboard_game, "f").oob.at(loc.unitid).describe(debug) : "";
            return `[${loc.gid}] ${label}\nlon ${loc.lon}, lat ${loc.lat}\n\n${unit}`.trim();
        }
        valid(pt) {
            return __classPrivateFieldGet(this, _Mapboard_validlocs, "f").has(pt.gid);
        }
        locationOf(pt) {
            // nb throws for impassable boundary points
            const loc = __classPrivateFieldGet(this, _Mapboard_validlocs, "f").get(pt.gid);
            if (loc == null)
                throw new Error(`MapBoard.locationOf: invalid point ${pt.lon}, ${pt.lat}`);
            return loc;
        }
        boundaryDistance(pt, dir) {
            switch (dir) {
                case 0 /* DirectionKey.north */: return __classPrivateFieldGet(this, _Mapboard_maxlat, "f") - 1 - pt.lat;
                case 2 /* DirectionKey.south */: return pt.lat;
                case 1 /* DirectionKey.east */: return pt.lon;
                case 3 /* DirectionKey.west */: return __classPrivateFieldGet(this, _Mapboard_maxlon, "f") - 1 - pt.lon;
            }
        }
        neighborsOf({ gid }) {
            return __classPrivateFieldGet(this, _Mapboard_neighborids, "f").call(this, gid)
                .map(v => v == null ? v : __classPrivateFieldGet(this, _Mapboard_validlocs, "f").get(v));
        }
        neighborOf({ gid }, dir) {
            const nbrid = __classPrivateFieldGet(this, _Mapboard_neighborids, "f").call(this, gid)[dir];
            return nbrid == null ? undefined : __classPrivateFieldGet(this, _Mapboard_validlocs, "f").get(nbrid);
        }
        occupy(loc, player) {
            if (loc.cityid != null) {
                const c = this.cities[loc.cityid];
                if (c.owner != player) {
                    c.owner = player;
                    __classPrivateFieldGet(this, _Mapboard_game, "f").emit('map', 'citycontrol', loc);
                }
            }
        }
        directPath(p, q, costs) {
            /*
            implements a variation of Bresenham's algorith to get direct path from p to q
            returns the list of directions to step from p to q, along with the terrain cost
            similar to the original path algorithm described in the APX notes

            The straight line can be described by the equation A x + B y + C = 0 where
            A = (y1 - y0), B = -(x1 - x0) and C = x1 y0 - x0 y1.  (Here x is lon, y is lat)
            To follow the line most closely using grid point x*, y* we keep the error E = A x* + B y* + C
            as close to zero as possible.
            Taking a step in direction dx, dy will change E by A dx + B dy
            so we just keep choosing the step that moves E back towards zero.
            */
            let loc = this.locationOf(p);
            const goal = this.locationOf(q);
            if (loc.gid == goal.gid)
                return { cost: 0, orders: [] };
            const A = q.lat - p.lat, B = -(q.lon - p.lon), 
            // C = q.lon * p.lat - q.lat * p.lon,
            projections = Grid.directionsFrom(p, q), i = projections[0][1], j = projections[1][1], // best two directinoe
            s = directions[i], t = directions[j], ds = A * s.dlon + B * s.dlat, dt = A * t.dlon + B * t.dlat;
            let err = 0, cost = 0;
            const orders = [];
            while (loc.gid != goal.gid) {
                const [k, de] = Math.abs(err + ds) < Math.abs(err + dt) ? [i, ds] : [j, dt];
                err += de;
                orders.push(k);
                //NB. not validating that we can actually take this path
                loc = this.locationOf(Grid.adjacent(loc, k));
                cost += costs ? costs[loc.terrain] : 1;
            }
            return { cost, orders };
        }
        bestPath(p, q, costs) {
            // implements A* shortest path, e.g. see https://www.redblobgames.com/pathfinding/a-star/introduction.html
            // returns {cost: , orders: []} where cost is the movement cost (ticks), and orders is a seq of dir indices
            // or null if goal is unreachable
            const minCost = Math.min(...costs), _head = -1;
            let src = this.locationOf(p);
            const goal = this.locationOf(q), 
            // linked list of points to search next, ordered by estimated total cost via this point
            frontier = new Map([[_head, { id: src.gid, est: 0 }]]), 
            // dir arrived from and cost from start to here
            found = new Map([[src.gid, { dir: null, cost: 0 }]]);
            while (frontier.has(_head)) {
                const { id: next } = frontier.get(_head);
                src = this.locationOf(Grid.byid(next));
                if (src.gid == goal.gid)
                    break;
                if (frontier.has(next)) {
                    frontier.set(_head, frontier.get(next));
                    frontier.delete(next);
                }
                else {
                    frontier.delete(_head);
                }
                this.neighborsOf(src).forEach((dst, i) => {
                    if (!dst)
                        return;
                    const d = +i, cost = found.get(src.gid).cost + costs[dst.terrain];
                    if (!found.has(dst.gid)) { // with consistent estimate we always find best first
                        found.set(dst.gid, { dir: d, cost });
                        const est = cost + minCost * Grid.manhattanDistance(src, dst);
                        let tail = _head;
                        // insert point in linked list before tail to maintain asc sort by est
                        while (frontier.has(tail)) {
                            const { id: _next, est: _est } = frontier.get(tail);
                            if (est <= _est)
                                break;
                            tail = _next;
                        }
                        if (frontier.has(tail)) {
                            frontier.set(dst.gid, frontier.get(tail));
                        }
                        frontier.set(tail, { id: dst.gid, est: est });
                    }
                });
            }
            if (src.gid != goal.gid)
                throw new Error(`MapBoard.bestPath: no path from ${p} to ${q}`);
            const orders = [];
            let pt = goal;
            for (;;) {
                const dir = found.get(pt.gid).dir;
                if (dir == null)
                    break;
                orders.unshift(dir);
                pt = Grid.adjacent(pt, (dir + 2) % 4); // walk back in reverse direction
            }
            return { cost: found.get(goal.gid).cost, orders: orders };
        }
        reach(src, range, costs) {
            // find all squares accessible to unit within range, ignoring other units, zoc
            // returns a map of point ids => range
            let cost = 0;
            const start = this.locationOf(src), locs = { [start.gid]: 0 };
            while (cost < range) {
                Object.entries(locs).filter(([, v]) => v == cost).forEach(([k,]) => {
                    const src = Grid.byid(+k);
                    this.neighborsOf(src).forEach(dst => {
                        if (!dst)
                            return;
                        const curr = dst.gid in locs ? locs[dst.gid] : 255;
                        if (curr <= cost)
                            return;
                        const c = cost + costs[dst.terrain];
                        if (c <= range && c < curr)
                            locs[dst.gid] = c;
                    });
                });
                cost++;
            }
            return locs;
        }
    }
    _Mapboard_game = new WeakMap(), _Mapboard_maxlon = new WeakMap(), _Mapboard_maxlat = new WeakMap(), _Mapboard_icelat = new WeakMap(), _Mapboard_validlocs = new WeakMap(), _Mapboard_neighborids = new WeakMap(), _Mapboard_instances = new WeakSet(), _Mapboard_neighborids_ = function _Mapboard_neighborids_(gid) {
        const pt = __classPrivateFieldGet(this, _Mapboard_validlocs, "f").get(gid);
        if (pt == null)
            return [undefined, undefined, undefined, undefined];
        return Grid.adjacencies(pt).map((q, i) => {
            const nbr = __classPrivateFieldGet(this, _Mapboard_validlocs, "f").get(q.gid), dir = +i;
            if (nbr == null)
                return undefined;
            const legal = (nbr.terrain != 9 /* TerrainKey.impassable */
                && !((dir == 0 /* DirectionKey.north */ || dir == 2 /* DirectionKey.south */)
                    ? blocked[0].find(d => d.lon == pt.lon && d.lat == (dir == 0 /* DirectionKey.north */ ? pt.lat : nbr.lat))
                    : blocked[1].find(d => d.lon == (dir == 3 /* DirectionKey.west */ ? pt.lon : nbr.lon) && d.lat == pt.lat)));
            return legal ? nbr.gid : null;
        });
    }, _Mapboard_freezeThaw = function _Mapboard_freezeThaw(w, newlat) {
        // move ice by freeze/thaw rivers and swamps, where w is Water.freeze or Water.thaw
        // ICELAT -= [7,14] incl]; clamp 1-39 incl
        // small bug in APX code? freeze chrs $0B - $29 (exclusive, seems like it could freeze Kerch straight?)
        const state = waterstate[w], other = waterstate[1 - w], oldlat = __classPrivateFieldGet(this, _Mapboard_icelat, "f"), dlat = directions[state.dir].dlat;
        if (newlat != null) {
            // initial setup where we freeze to saved value
            __classPrivateFieldSet(this, _Mapboard_icelat, newlat, "f");
        }
        else {
            const change = __classPrivateFieldGet(this, _Mapboard_game, "f").rand.bits(3) + 7;
            __classPrivateFieldSet(this, _Mapboard_icelat, clamp(oldlat + dlat * change, 1, __classPrivateFieldGet(this, _Mapboard_maxlat, "f")), "f");
        }
        const skip = (w == 0 /* WaterStateKey.freeze */) ? oldlat : __classPrivateFieldGet(this, _Mapboard_icelat, "f"); // for freeze skip old line, for thaw skip new new
        for (let i = oldlat; i != __classPrivateFieldGet(this, _Mapboard_icelat, "f") + dlat; i += dlat) {
            if (i == skip)
                continue;
            this.locations[__classPrivateFieldGet(this, _Mapboard_maxlat, "f") - i].forEach(d => {
                const k = other.terrain.indexOf(d.terrain);
                if (k != -1)
                    d.terrain = state.terrain[k];
            });
        }
    };

    var _Unit_instances, _Unit_mode, _Unit_game, _Unit_resolveCombat, _Unit_takeDamage;
    const unittypes = {
        [0 /* UnitTypeKey.infantry */]: { label: "infantry", kind: 0 /* UnitKindKey.infantry */ },
        [1 /* UnitTypeKey.militia */]: { label: "militia", kind: 0 /* UnitKindKey.infantry */, immobile: 1 },
        [2 /* UnitTypeKey.unused */]: null,
        [3 /* UnitTypeKey.flieger */]: { label: "flieger", kind: 2 /* UnitKindKey.air */ },
        [4 /* UnitTypeKey.panzer */]: { label: "panzer", kind: 1 /* UnitKindKey.armor */ },
        [5 /* UnitTypeKey.tank */]: { label: "tank", kind: 1 /* UnitKindKey.armor */ },
        [6 /* UnitTypeKey.cavalry */]: { label: "cavalry", kind: 1 /* UnitKindKey.armor */ },
        [7 /* UnitTypeKey.pzgrndr */]: { label: "pzgrndr", kind: 1 /* UnitKindKey.armor */ }, // apx only
    };
    const apxXref = {
        0: 0 /* UnitTypeKey.infantry */,
        1: 5 /* UnitTypeKey.tank */,
        2: 6 /* UnitTypeKey.cavalry */,
        3: 4 /* UnitTypeKey.panzer */,
        4: 1 /* UnitTypeKey.militia */,
        5: 2 /* UnitTypeKey.unused */ /* shock */,
        6: 2 /* UnitTypeKey.unused */ /* paratrp */,
        7: 7 /* UnitTypeKey.pzgrndr */,
    }, modifiers = [
        { key: '' },
        { key: 'ss' },
        { key: 'finnish', canAttack: 0 },
        { key: 'rumanian' },
        { key: 'italian' },
        { key: 'hungarian' },
        { key: 'mountain' },
        { key: 'guards' },
    ];
    // output-only status flags persisted during turn processing and emitted as events
    const unitFlag = {
        orders: 1 << 0,
        attack: 1 << 1,
        defend: 1 << 2,
        damage: 1 << 3,
        move: 1 << 4,
        enter: 1 << 5,
        exit: 1 << 6,
        oos: 1 << 7,
    };
    const unitModes = {
        [0 /* UnitMode.standard */]: { label: 'STANDARD' },
        [1 /* UnitMode.assault */]: { label: 'ASSAULT' },
        [2 /* UnitMode.march */]: { label: 'MARCH' },
        [3 /* UnitMode.entrench */]: { label: 'ENTRENCH' },
    };
    // random bytes to use for deterministic fog of war matching
    const fogTable = `
e6 63 03 60 39 b0 1a 5f 1b 2f 95 2c 37 0d 1c 09 08 a5 35 22 4f c5 fe fe c5 49 75 95 34 22 f8 37
c5 39 0c 51 48 53 d6 c2 c6 d8 1f 48 ac 2f f2 fb 91 06 34 86 a7 93 af f1 0a 3a 42 22 8b b4 e1 af
b4 21 93 60 85 f1 62 5c 11 f8 2f 7a 79 79 f0 9d cd 05 40 ae 2b d1 e2 94 bc d0 d1 88 dc 22 7d 93
61 bd cb 7f 64 79 a9 86 47 ee 6f a5 08 70 05 2f 01 2e b0 a5 8a 1e a5 00 c5 fa 0e 18 83 34 af 49
6b 2a 25 aa 30 64 d6 4c 79 03 7b d7 25 fe 88 04 f5 0f a1 af b3 18 dd f0 10 ca 69 08 07 0e a2 73
4b 27 4e ba 15 8a 5b d1 65 c1 3e 04 b2 13 2b f7 97 7e e7 e9 6f b8 5c 18 28 e5 65 d9 d7 65 26 4c
c6 5e 1f 3a 88 0a f4 54 ac 9f 04 d6 ab 83 c5 bf 38 0a 93 e4 76 46 15 0b 24 fb b4 ba e6 55 4f 45
aa ad d7 cd aa 70 ef 5c 0d 9f 12 84 ca b9 36 fa 72 26 f9 ae 6d af af cf 57 4c cc 62 6f e5 e3 b1
`.trim().split(/\s+/).map(s => parseInt(s, 16));
    class Unit {
        constructor(game, id, ...args) {
            var _a, _b, _c;
            _Unit_instances.add(this);
            this.immobile = 0;
            this.canAttack = 1;
            this.resolute = 0;
            this.cadj = 0;
            _Unit_mode.set(this, void 0);
            this.orders = []; // WHORDRS, HMORDS
            this.tick = 255;
            this.ifr = 0;
            this.ifrdir = [0, 0, 0, 0];
            this.flags = 0;
            _Unit_game.set(this, void 0);
            let corpsx, corpsy, mstrng, arrive, corpt, corpno;
            switch (args.length) {
                case 7: { // apx
                    let swap, corptapx;
                    [corpsx, corpsy, mstrng, swap, arrive, corptapx, corpno] = args;
                    // translate apx => cart format
                    corpt = (swap & 0x80) | (corptapx & 0x70) | apxXref[corptapx & 0x7];
                    break;
                }
                case 6: { // cart
                    [corpsx, corpsy, mstrng, arrive, corpt, corpno] = args;
                    break;
                }
                default:
                    throw new Error("Expected 6 or 7 args for cartridge or apx unit definition respectively");
            }
            this.id = id;
            this.player = (corpt & 0x80) ? 1 /* PlayerKey.Russian */ : 0 /* PlayerKey.German */; // german=0, russian=1; equiv i >= 55
            this.unitno = corpno;
            this.type = corpt & 0x7;
            const ut = unittypes[this.type];
            if (ut == null)
                throw new Error(`Unused unit type for unit id ${id}`);
            this.kind = ut.kind;
            __classPrivateFieldSet(this, _Unit_mode, (this.kind == 2 /* UnitKindKey.air */) ? 1 /* UnitMode.assault */ : 0 /* UnitMode.standard */, "f");
            this.modifier = (corpt >> 4) & 0x7;
            this.arrive = arrive;
            this.scheduled = arrive;
            this.lon = corpsx;
            this.lat = corpsy;
            this.mstrng = mstrng;
            this.cstrng = mstrng;
            this.fog = (_a = scenarios[game.scenario].fog) !== null && _a !== void 0 ? _a : 0;
            this.immobile = (_b = ut.immobile) !== null && _b !== void 0 ? _b : 0;
            this.canAttack = (_c = modifiers[this.modifier].canAttack) !== null && _c !== void 0 ? _c : 1;
            this.resolute = this.player == 0 /* PlayerKey.German */ && !this.modifier ? 1 : 0;
            this.label = [
                this.unitno,
                modifiers[this.modifier].key,
                ut.label,
                players[this.player].unit
            ].filter(Boolean).join(' ').toUpperCase().trim();
            __classPrivateFieldSet(this, _Unit_game, game, "f");
        }
        get active() {
            return this.arrive <= __classPrivateFieldGet(this, _Unit_game, "f").turn && this.cstrng > 0;
        }
        get movable() {
            if (this.immobile)
                return 0;
            // game logic seems to be that German reinforcements can move on arrival turn but Russians can't,
            // including initially placed units because of surprise attack.
            // allow initially placed Russians to move for post 6/22 scenarios
            const start = __classPrivateFieldGet(this, _Unit_game, "f").turn == 0, green = this.arrive == __classPrivateFieldGet(this, _Unit_game, "f").turn && !start;
            if ((green && 1 /* PlayerKey.Russian */)
                || (start && this.player == scenarios[__classPrivateFieldGet(this, _Unit_game, "f").scenario].surprised)) {
                return 0;
            }
            return 1;
        }
        get human() {
            return this.player == __classPrivateFieldGet(this, _Unit_game, "f").human;
        }
        get location() {
            return __classPrivateFieldGet(this, _Unit_game, "f").mapboard.locationOf(Grid.point(this));
        }
        get path() {
            let loc = this.location;
            const path = [loc];
            this.orders.forEach(dir => {
                const dst = __classPrivateFieldGet(this, _Unit_game, "f").mapboard.neighborOf(loc, dir);
                if (!dst)
                    return;
                path.push(loc = dst);
            });
            return path;
        }
        emit(event) {
            this.flags |= unitFlag[event];
            if (event == 'move') {
                // clear attack and defend status after movement
                this.flags &= ~(unitFlag.attack | unitFlag.defend);
            }
            __classPrivateFieldGet(this, _Unit_game, "f").emit('unit', event, this);
        }
        get mode() { return __classPrivateFieldGet(this, _Unit_mode, "f"); }
        set mode(mode) {
            if (this.kind == 2 /* UnitKindKey.air */ && ![1 /* UnitMode.assault */, 2 /* UnitMode.march */].includes(mode)) {
                __classPrivateFieldGet(this, _Unit_game, "f").emit('message', 'error', 'AIRPLANES CANNOT DO THAT');
            }
            else {
                __classPrivateFieldSet(this, _Unit_mode, mode, "f");
                this.resetOrders();
            }
        }
        nextmode() {
            this.mode = this.kind == 2 /* UnitKindKey.air */
                ? (this.mode == 1 /* UnitMode.assault */ ? 2 /* UnitMode.march */ : 1 /* UnitMode.assault */)
                : (this.mode + 1) % 4;
        }
        foggyStrength(observer) {
            let { mstrng, cstrng } = this;
            if (this.fog && this.player != observer) {
                // with fog of k bits, we apply noise with total range 2^k - 1,
                // between 2^(k-1), -2^(k-1)+1
                // we use the same offset for both cstrng and mstrng,
                // and predictable pseudo-random values that stay fixed given unit & turn
                // (and don't affect the core sequence of random values from the game's rng)
                const mask = (1 << this.fog) - 1, randbyte = fogTable[this.id & 0xff] ^ fogTable[(~__classPrivateFieldGet(this, _Unit_game, "f").turn) & 0xff], delta = (randbyte & mask) - (mask >> 1);
                //TODO use as offset not a simple random fill
                mstrng = clamp(mstrng + delta, 1, 255);
                cstrng = clamp(cstrng + delta, 1, 255);
            }
            return { mstrng, cstrng };
        }
        addOrder(dir) {
            let dst, err;
            if (this.mode == 3 /* UnitMode.entrench */) {
                err = "THAT UNIT IS ENTRENCHED";
            }
            else if (!this.movable) {
                err = this.immobile ? "MILITIA UNITS CAN'T MOVE" : "NEW ARRIVALS CAN'T MOVE";
            }
            else if (this.orders.length == 8) {
                err = "ONLY 8 ORDERS ARE ALLOWED";
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                dst = __classPrivateFieldGet(this, _Unit_game, "f").mapboard.neighborOf(this.path.pop(), dir);
                if (!dst) {
                    err = "IMPASSABLE";
                }
                else {
                    this.orders.push(dir);
                }
            }
            if (err) {
                __classPrivateFieldGet(this, _Unit_game, "f").emit('message', 'error', err);
            }
            else {
                this.emit('orders');
            }
            return dst;
        }
        delOrder() {
            if (this.orders.length) {
                this.orders.pop();
                this.emit('orders');
            }
        }
        setOrders(dirs) {
            this.orders = dirs;
            this.emit('orders');
        }
        resetOrders() {
            this.orders = [];
            this.tick = 255;
            this.emit('orders');
        }
        setOrdersSupportingFriendlyFurther(dir) {
            const mb = __classPrivateFieldGet(this, _Unit_game, "f").mapboard;
            let loc = Grid.point(this);
            this.orders.forEach(d => loc = Grid.adjacent(loc, d));
            const { dlon, dlat } = directions[dir], target = Grid.diamondSpiral(loc, 8, dir)
                .find(p => {
                if ((p.lon - loc.lon) * dlon + (p.lat - loc.lat) * dlat <= 0
                    || Grid.manhattanDistance(p, this) > 8
                    || !mb.valid(p)) {
                    return false;
                }
                else {
                    const mp = mb.locationOf(p);
                    return (mp.unitid != null && mp.unitid != this.id
                        && __classPrivateFieldGet(this, _Unit_game, "f").oob.at(mp.unitid).player == this.player);
                }
            });
            if (target == null) {
                __classPrivateFieldGet(this, _Unit_game, "f").emit('message', 'error', 'NO FRIENDLY UNIT IN RANGE THAT WAY');
            }
            else {
                this.setOrders(__classPrivateFieldGet(this, _Unit_game, "f").mapboard.directPath(Grid.point(this), target).orders);
            }
        }
        moveCost(terrain, weather) {
            // cost to enter given terrain in weather
            if (this.mode == 3 /* UnitMode.entrench */) {
                return 255;
            }
            const notInfantry = this.kind == 0 /* UnitKindKey.infantry */ ? 0 : 1;
            let cost = terraintypes[terrain].movecost[notInfantry][weather] || 255;
            if (cost == 255) {
                return cost;
            }
            if (this.mode == 2 /* UnitMode.march */)
                cost = (cost >> 1) + 2;
            else if (this.mode == 1 /* UnitMode.assault */)
                cost += cost >> 1;
            return cost;
        }
        moveCosts(weather) {
            // return a table of movement costs based on armor/inf and weather
            return Object.keys(terraintypes).map(t => this.moveCost(+t, weather));
        }
        orderCost(dir) {
            if (!this.movable)
                return 255;
            const dst = __classPrivateFieldGet(this, _Unit_game, "f").mapboard.neighborOf(Grid.point(this), dir);
            if (!dst)
                return 255;
            return this.moveCost(dst.terrain, __classPrivateFieldGet(this, _Unit_game, "f").weather);
        }
        scheduleOrder(startTurn = false) {
            if (startTurn) {
                this.tick = 0;
                if (this.mode == 2 /* UnitMode.march */ && this.orders.length && this.cstrng > 1) {
                    // cstrng halved (min 1) before movement (cartridge.asm:4153)
                    this.cstrng >>= 1;
                }
                if (this.kind == 2 /* UnitKindKey.air */ && this.mode == 1 /* UnitMode.assault */ && this.orders.length) {
                    // add air strength to target cadj (cartridge.asm:4180)
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const dst = this.path.pop();
                    if (dst.unitid != null && dst.gid != this.location.gid) {
                        const u = __classPrivateFieldGet(this, _Unit_game, "f").oob.at(dst.unitid);
                        if (u.player == this.player) {
                            const halfDistance = Math.max(1, this.orders.length >> 1);
                            u.cadj += Math.floor(this.cstrng / halfDistance);
                        }
                    }
                    this.resetOrders(); // clear orders: air mission flown
                }
            }
            this.tick = this.orders.length
                ? this.tick + this.orderCost(this.orders[0])
                : 255;
        }
        pathTo(goal) {
            const m = __classPrivateFieldGet(this, _Unit_game, "f").mapboard, costs = this.moveCosts(__classPrivateFieldGet(this, _Unit_game, "f").weather), p = Grid.point(goal);
            return m.bestPath(Grid.point(this), p, costs)
                ;
        }
        reach(range = 32) {
            // return a list of grid points within range of this unit
            if (this.mode == 3 /* UnitMode.entrench */) {
                return [Grid.point(this)];
            }
            else if (this.kind == 2 /* UnitKindKey.air */ && this.mode == 1 /* UnitMode.assault */) {
                return Grid.diamondSpiral(this, range / 4)
                    .filter(p => __classPrivateFieldGet(this, _Unit_game, "f").mapboard.valid(p));
            }
            else {
                const costs = this.moveCosts(__classPrivateFieldGet(this, _Unit_game, "f").weather);
                return Object.keys(__classPrivateFieldGet(this, _Unit_game, "f").mapboard.reach(Grid.point(this), range, costs))
                    .map(id => Grid.byid(+id));
            }
        }
        moveTo(dst, notify = true) {
            let action = 'move';
            if (this.location.unitid) {
                if (this.location.unitid != this.id) {
                    throw (`moveTo from square occupied by both:\n${this.describe()}\nand:\n${__classPrivateFieldGet(this, _Unit_game, "f").oob.at(this.location.unitid).describe()}`);
                }
                this.location.unitid = undefined; // leave the current location
            }
            else {
                action = 'enter';
            }
            if (dst != null) {
                if (dst.unitid != null)
                    throw new Error(`moveTo into occupied square:\n${__classPrivateFieldGet(this, _Unit_game, "f").mapboard.describe(dst)}\nby:\n${this.describe()}\nfrom lon: ${this.lon}, lat: ${this.lat}`);
                // occupy the new one and repaint
                this.lon = dst.lon;
                this.lat = dst.lat;
                dst.unitid = this.id;
                __classPrivateFieldGet(this, _Unit_game, "f").mapboard.occupy(dst, this.player);
            }
            else {
                action = 'exit';
            }
            if (notify)
                this.emit(action);
        }
        tryOrder() {
            // if we decided to try before this unit retreated (say), skip
            if (this.tick == 255 || this.orders.length == 0)
                return;
            const src = this.location, dst = __classPrivateFieldGet(this, _Unit_game, "f").mapboard.neighborOf(src, this.orders[0]); // assumes already validated
            if (dst == null)
                throw new Error("Unit.tryOrder: invalid order");
            if (dst.unitid != null) {
                const opp = __classPrivateFieldGet(this, _Unit_game, "f").oob.at(dst.unitid);
                if (opp.player != this.player) {
                    if (!__classPrivateFieldGet(this, _Unit_instances, "m", _Unit_resolveCombat).call(this, opp)) {
                        this.tick++;
                        return;
                    }
                    // otherwise fall through to advance after combat, ignoring ZoC
                }
                else {
                    // traffic jam
                    this.tick += 2;
                    return;
                }
            }
            else if (__classPrivateFieldGet(this, _Unit_game, "f").oob.zocBlocked(this.player, src, dst)) {
                // moving between enemy ZOC M.ASM:5740
                this.tick += 2;
                return;
            }
            this.orders.shift();
            this.moveTo(dst);
            this.scheduleOrder();
        }
        recover() {
            // units recover a little each tick
            if (this.type == 1 /* UnitTypeKey.militia */ && this.lon == 20 && this.lat == 0) {
                // Sevastopol militia fully recovers each turn
                this.cstrng = this.mstrng;
            }
            else if (this.mstrng - this.cstrng >= 2) {
                // M.ASM:5070 recover one plus coin-flip combat strength
                this.cstrng += 1 + __classPrivateFieldGet(this, _Unit_game, "f").rand.bit();
            }
        }
        eliminate(disperse) {
            if (disperse) {
                // eliminated units disperse nearby (cartridge.asm:2509)
                __classPrivateFieldGet(this, _Unit_game, "f").mapboard
                    .neighborsOf(this.location)
                    .forEach(loc => {
                    if ((loc === null || loc === void 0 ? void 0 : loc.unitid) == null)
                        return;
                    const u = __classPrivateFieldGet(this, _Unit_game, "f").oob.at(loc.unitid);
                    if (u.player == this.player) {
                        u.mstrng = Math.min(255, u.mstrng + (this.mstrng >> 2));
                    }
                });
            }
            this.mstrng = 0;
            this.cstrng = 0;
            this.arrive = 255;
            this.flags = 0;
            this.resetOrders();
        }
        nextTurn(startOrResume) {
            var _a;
            // called for active (or potentially active) units
            const scenario = scenarios[__classPrivateFieldGet(this, _Unit_game, "f").scenario];
            if (startOrResume) {
                // place units on map but don't emit events
                this.moveTo(this.location, false);
                if (__classPrivateFieldGet(this, _Unit_game, "f").turn == 0 && scenario.fog) {
                    this.fog = scenario.fog;
                    {
                        // a unit completely surrounded sees zoc = 12, unit with seven units on a corner sees 7
                        this.fog >>= __classPrivateFieldGet(this, _Unit_game, "f").oob.zocAffecting(this.player, this.location, true) / 2;
                    }
                }
            }
            else {
                // M.ASM:3720 delay reinforcements scheduled for an occuplied square
                if (this.arrive == __classPrivateFieldGet(this, _Unit_game, "f").turn) {
                    if (this.location.unitid != null) {
                        this.arrive++;
                        return; // early return
                    }
                    this.moveTo(this.location); // place unit on the map
                }
                // supply check includes any new arrivals
                const inSupply = scenario.skipsupply || this.traceSupply();
                if (scenario.repl && inSupply) {
                    // possibly receive replacements
                    this.mstrng = Math.min(255, this.mstrng + scenario.repl[this.player]);
                }
                if (!this.active)
                    return; // quit if eliminated OoS
                if (scenario.fog) {
                    const change = __classPrivateFieldGet(this, _Unit_game, "f").oob.zocAffects(this.player, this.location, true) ? -1 : 1;
                    this.fog = clamp(this.fog + change, 0, scenario.fog);
                }
            }
            this.flags = 0;
            this.cadj = this.player == 0 /* PlayerKey.German */ ? ((_a = scenarios[__classPrivateFieldGet(this, _Unit_game, "f").scenario].cadj) !== null && _a !== void 0 ? _a : 0) : 0;
        }
        traceSupply() {
            // implement the supply check from C.ASM:3430
            // loses half cstr (rounding up) if OoS, returning 1 if supplied, 0 if not
            const player = players[this.player], supply = player.supply, mb = __classPrivateFieldGet(this, _Unit_game, "f").mapboard;
            let fail = 0, loc = this.location, dir = player.homedir;
            if (supply.freeze && __classPrivateFieldGet(this, _Unit_game, "f").weather == 2 /* WeatherKey.snow */) {
                // C.ASM:3620
                if (__classPrivateFieldGet(this, _Unit_game, "f").rand.byte() >= 74 + 4 * (mb.boundaryDistance(loc, dir) + (dir == 1 /* DirectionKey.east */ ? 1 : 0))) {
                    fail = 255;
                }
            }
            while (fail < supply.maxfail[__classPrivateFieldGet(this, _Unit_game, "f").weather]) {
                if (dir == player.homedir && mb.boundaryDistance(loc, player.homedir) == 0) {
                    // hit an impassable boundary on our home boundary?
                    return 1;
                }
                let dst = mb.neighborOf(loc, dir);
                if (dst == null && supply.sea) {
                    const adj = Grid.adjacent(loc, dir);
                    if (mb.valid(adj)) {
                        const sea = mb.locationOf(adj);
                        if (sea.terrain == 9 /* TerrainKey.impassable */ && sea.alt == 0)
                            dst = sea;
                    }
                }
                let cost = 0;
                if (dst == null) {
                    cost = 1;
                }
                else if (__classPrivateFieldGet(this, _Unit_game, "f").oob.zocAffects(this.player, dst)) {
                    cost = 2;
                }
                else {
                    loc = dst;
                }
                if (cost) {
                    fail += cost;
                    // either flip a coin or try the opposite direction (potentially repeatedly until failure)
                    if (dir != player.homedir)
                        dir = (dir + 2) % 4;
                    else
                        dir = __classPrivateFieldGet(this, _Unit_game, "f").rand.bit() ? 0 /* DirectionKey.north */ : 2 /* DirectionKey.south */;
                }
                else {
                    dir = player.homedir;
                }
            }
            __classPrivateFieldGet(this, _Unit_instances, "m", _Unit_takeDamage).call(this, 0, Math.ceil(this.cstrng / 2));
            this.emit('oos');
            return 0;
        }
        locScore() {
            const dist = __classPrivateFieldGet(this, _Unit_game, "f").mapboard.boundaryDistance(this, players[this.player].homedir);
            let v = 0;
            // see M.ASM:4050 - note even inactive units are scored based on future arrival/strength
            if (this.player == 0 /* PlayerKey.German */) {
                // maxlon + 2 == #$30 per M.ASM:4110
                v = (dist + 3) * (this.mstrng >> 1);
            }
            else {
                v = dist * (this.cstrng >> 3);
            }
            return v >> 8;
        }
        describe(debug = false) {
            const { cstrng, mstrng } = this.foggyStrength(__classPrivateFieldGet(this, _Unit_game, "f").human);
            let s = `[${this.id}] ${cstrng} / ${mstrng}`;
            if (debug && scenarios[__classPrivateFieldGet(this, _Unit_game, "f").scenario].fog && this.player != __classPrivateFieldGet(this, _Unit_game, "f").human) {
                s += ` (actual ${this.cstrng} / ${this.mstrng}; fog ${this.fog})`;
            }
            s += `\n${this.label}\n`;
            if (debug && this.ifr !== undefined && this.ifrdir !== undefined) {
                if (this.orders.length) {
                    s += 'orders: ' + this.orders.map(d => directions[d].label).join('') + '\n';
                }
                s += `ifr: ${this.ifr}; `;
                s += Object.entries(directions)
                    .map(([i, d]) => `${d.label}: ${this.ifrdir[+i]}`).join(' ') + '\n';
            }
            return s;
        }
    }
    _Unit_mode = new WeakMap(), _Unit_game = new WeakMap(), _Unit_instances = new WeakSet(), _Unit_resolveCombat = function _Unit_resolveCombat(opp) {
        var _a;
        // returns 1 if target square becomes vacant
        if (!this.canAttack)
            return 0;
        // Air suffers 75% loss and resetOrders if attack or defend, plus normal combat (cartridge.asm:1968)
        [this, opp].forEach(u => {
            if (u.kind == 2 /* UnitKindKey.air */) {
                u.cstrng >>= 2;
                u.resetOrders();
            }
        });
        const scenario = scenarios[__classPrivateFieldGet(this, _Unit_game, "f").scenario];
        this.emit('attack');
        opp.emit('defend');
        let modifier = terraintypes[opp.location.terrain].defence;
        // expert scenario defense bonus
        modifier += (_a = scenario.defmod) !== null && _a !== void 0 ? _a : 0;
        if (opp.orders.length)
            modifier--; // movement penalty
        if (opp.mode == 3 /* UnitMode.entrench */)
            modifier++; // entrench bonus
        // opponent attacks
        let strength = multiplier(opp.cstrng, modifier) + opp.cadj;
        if (strength >= __classPrivateFieldGet(this, _Unit_game, "f").rand.byte()) {
            // attacker in assault mode takes triple damage
            const mult = this.mode == 1 /* UnitMode.assault */ ? 3 : 1;
            __classPrivateFieldGet(this, _Unit_instances, "m", _Unit_takeDamage).call(this, mult * scenario.mdmg, mult * scenario.cdmg, true);
            // cartridge prevents attack if attacker breaks
            if (!this.orders && options.defenderFirstStrike)
                return 0;
        }
        // modifier based on attacker's square (cartridge.asm:2035)
        modifier = terraintypes[this.location.terrain].offence;
        strength = multiplier(this.cstrng, modifier) + this.cadj;
        if (strength >= __classPrivateFieldGet(this, _Unit_game, "f").rand.byte()) {
            // defender takes double damange
            const mult = this.mode == 1 /* UnitMode.assault */ ? 2 : 1;
            return __classPrivateFieldGet(opp, _Unit_instances, "m", _Unit_takeDamage).call(opp, mult * scenario.mdmg, mult * scenario.cdmg, true, this.orders[0]);
        }
        else {
            return 0;
        }
    }, _Unit_takeDamage = function _Unit_takeDamage(mdmg, cdmg, checkBreak = false, retreatDir) {
        // return 1 if this square is vacated, 0 otherwise
        const scenario = scenarios[__classPrivateFieldGet(this, _Unit_game, "f").scenario];
        // apply mdmg/cdmg to unit
        this.mstrng -= mdmg;
        this.cstrng -= cdmg;
        // dead?
        if (this.cstrng <= 0) {
            this.eliminate(options.disperseEliminatedUnits);
            this.moveTo(null);
            return 1;
        }
        this.emit('damage');
        if (!checkBreak)
            return 0;
        let brkpt; // calculate the strength value to check for unit breaking point
        if (scenario.simplebreak) {
            // simplified break check at 25% strength
            brkpt = this.mstrng >> 2;
        }
        else {
            if (this.resolute) {
                // german regulars break if cstrng < 1/2 mstrng
                brkpt = this.mstrng >> 1;
            }
            else {
                // russian (& ger allies) break if cstrng < 7/8 mstrng
                brkpt = this.mstrng - (this.mstrng >> 3);
            }
            brkpt = this.mstrng - (this.mstrng >> (this.resolute ? 1 : 3));
            switch (this.mode) {
                case 2 /* UnitMode.march */:
                    brkpt <<= 1;
                    break;
                case 1 /* UnitMode.assault */:
                case 3 /* UnitMode.entrench */:
                    brkpt >>= 1;
                    break;
            }
        }
        if (this.cstrng < brkpt) {
            this.mode = this.kind == 2 /* UnitKindKey.air */ ? 2 /* UnitMode.march */ : 0 /* UnitMode.standard */;
            this.resetOrders();
            if (retreatDir != null) {
                const homedir = players[this.player].homedir, nxtdir = __classPrivateFieldGet(this, _Unit_game, "f").rand.bit() ? 0 /* DirectionKey.north */ : 2 /* DirectionKey.south */, dirs = [retreatDir, homedir, nxtdir, (nxtdir + 2) % 4, (homedir + 2) % 4];
                for (const dir of dirs) {
                    const src = this.location, dst = __classPrivateFieldGet(this, _Unit_game, "f").mapboard.neighborOf(src, dir);
                    if (!dst || dst.unitid != null || __classPrivateFieldGet(this, _Unit_game, "f").oob.zocBlocked(this.player, src, dst)) {
                        // ZoC block deals only CSTR dmg (cartridge:2159)
                        if (__classPrivateFieldGet(this, _Unit_instances, "m", _Unit_takeDamage).call(this, 0, scenario.cdmg))
                            return 1; // dead
                    }
                    else {
                        this.moveTo(dst);
                        return 1;
                    }
                }
            }
        }
        // otherwise square still occupied (no break or all retreats blocked but defender remains)
        return 0;
    };
    function multiplier(strength, modifier) {
        if (modifier > 0) {
            strength <<= modifier;
        }
        else {
            strength >>= (-modifier);
        }
        return clamp(strength, 1, 255);
    }

    const oobVariants = {
        [0 /* OobVariantKey.apx */]: [
            // CORPSX, CORPSY, MSTRNG, SWAP, ARRIVE, CORPT, CORPNO
            // German
            [0, 0, 0, 0, 255, 0, 0],
            [40, 20, 203, 126, 0, 3, 24],
            [40, 19, 205, 126, 255, 3, 39],
            [40, 18, 192, 126, 0, 3, 46],
            [40, 17, 199, 126, 0, 3, 47],
            [40, 16, 184, 126, 0, 3, 57],
            [41, 20, 136, 125, 0, 0, 5],
            [40, 19, 127, 125, 0, 0, 6],
            [41, 18, 150, 125, 0, 0, 7],
            [41, 17, 129, 125, 0, 0, 8],
            [41, 16, 136, 125, 0, 0, 9],
            [42, 20, 109, 125, 255, 0, 12],
            [42, 19, 72, 125, 255, 0, 13],
            [42, 18, 70, 125, 255, 0, 20],
            [42, 17, 81, 125, 255, 0, 42],
            [43, 19, 131, 125, 255, 0, 43],
            [43, 18, 102, 125, 255, 0, 53],
            [43, 17, 53, 125, 255, 64, 3],
            [41, 23, 198, 126, 0, 3, 41],
            [40, 22, 194, 126, 0, 3, 56],
            [40, 21, 129, 125, 0, 0, 1],
            [41, 21, 123, 125, 0, 0, 2],
            [41, 22, 101, 125, 0, 0, 10],
            [42, 22, 104, 125, 0, 0, 26],
            [42, 23, 112, 125, 0, 0, 28],
            [42, 24, 120, 125, 0, 0, 38],
            [40, 15, 202, 126, 0, 3, 3],
            [41, 14, 195, 126, 0, 3, 14],
            [42, 13, 191, 126, 0, 3, 48],
            [41, 15, 72, 126, 255, 3, 52],
            [42, 14, 140, 125, 0, 0, 49],
            [42, 12, 142, 125, 0, 0, 4],
            [43, 13, 119, 125, 0, 0, 17],
            [41, 15, 111, 125, 0, 0, 29],
            [42, 16, 122, 125, 255, 0, 44],
            [43, 16, 77, 125, 255, 0, 55],
            [30, 2, 97, 125, 0, 48, 1],
            [30, 3, 96, 125, 0, 48, 2],
            [31, 4, 92, 125, 0, 48, 4],
            [33, 6, 125, 125, 0, 0, 11],
            [35, 7, 131, 125, 0, 0, 30],
            [37, 8, 106, 125, 0, 0, 54],
            [35, 38, 112, 125, 0, 32, 2],
            [36, 37, 104, 125, 0, 32, 4],
            [36, 38, 101, 125, 255, 32, 6],
            [45, 20, 210, 126, 2, 3, 40],
            [45, 15, 97, 125, 255, 0, 27],
            [38, 8, 98, 126, 2, 83, 1],
            [45, 16, 95, 125, 5, 0, 23],
            [31, 1, 52, 125, 6, 48, 5],
            [45, 20, 98, 125, 9, 0, 34],
            [45, 19, 96, 125, 10, 0, 35],
            [32, 1, 55, 125, 11, 64, 4],
            [45, 17, 104, 125, 20, 0, 51],
            [45, 18, 101, 126, 24, 7, 50],
            // Russian
            [29, 32, 100, 253, 4, 4, 7],
            [27, 31, 103, 253, 5, 4, 11],
            [24, 38, 110, 253, 7, 0, 41],
            [23, 38, 101, 253, 9, 0, 42],
            [20, 38, 92, 253, 11, 0, 43],
            [15, 38, 103, 253, 13, 0, 44],
            [0, 20, 105, 253, 7, 0, 45],
            [0, 8, 107, 253, 12, 0, 46],
            [0, 18, 111, 253, 8, 0, 47],
            [0, 10, 88, 253, 10, 0, 48],
            [0, 14, 117, 254, 10, 1, 9],
            [0, 33, 84, 254, 14, 1, 13],
            [0, 11, 109, 254, 15, 1, 14],
            [0, 15, 89, 254, 16, 1, 15],
            [0, 20, 105, 254, 18, 1, 16],
            [0, 10, 93, 254, 7, 2, 7],
            [21, 28, 62, 254, 0, 1, 2],
            [21, 27, 104, 253, 0, 0, 19],
            [30, 14, 101, 253, 0, 0, 18],
            [30, 13, 67, 254, 0, 2, 1],
            [39, 28, 104, 253, 0, 0, 27],
            [38, 28, 84, 254, 0, 1, 10],
            [23, 31, 127, 253, 0, 0, 22],
            [19, 24, 112, 253, 0, 0, 21],
            [34, 22, 111, 253, 0, 0, 13],
            [34, 21, 91, 254, 0, 1, 6],
            [31, 34, 79, 253, 0, 4, 9],
            [27, 6, 69, 253, 0, 0, 2],
            [33, 37, 108, 253, 0, 4, 1],
            [41, 24, 118, 253, 0, 0, 8],
            [40, 23, 137, 253, 0, 0, 11],
            [39, 23, 70, 254, 0, 1, 1],
            [42, 25, 85, 254, 0, 1, 7],
            [39, 20, 130, 253, 0, 0, 3],
            [39, 22, 91, 253, 0, 0, 4],
            [39, 18, 131, 253, 0, 0, 10],
            [39, 17, 71, 254, 0, 1, 5],
            [39, 21, 86, 254, 0, 1, 8],
            [37, 20, 75, 254, 0, 2, 3],
            [39, 19, 90, 254, 0, 2, 6],
            [39, 16, 123, 253, 0, 0, 5],
            [39, 15, 124, 253, 0, 0, 6],
            [40, 14, 151, 253, 0, 0, 12],
            [41, 13, 128, 253, 0, 0, 26],
            [41, 12, 88, 254, 0, 1, 3],
            [39, 11, 77, 254, 0, 1, 4],
            [36, 9, 79, 254, 0, 1, 11],
            [34, 8, 80, 254, 0, 2, 5],
            [32, 6, 126, 253, 0, 0, 9],
            [35, 9, 79, 254, 0, 1, 12],
            [30, 4, 91, 254, 0, 2, 4],
            [28, 2, 84, 254, 0, 2, 2],
            [25, 6, 72, 253, 1, 0, 7],
            [29, 14, 86, 253, 1, 4, 2],
            [32, 22, 76, 253, 1, 0, 14],
            [33, 36, 99, 253, 1, 4, 4],
            [26, 23, 67, 253, 1, 0, 15],
            [21, 8, 78, 253, 2, 0, 16],
            [29, 33, 121, 253, 2, 0, 20],
            [0, 28, 114, 253, 2, 0, 6],
            [28, 30, 105, 253, 3, 0, 24],
            [21, 20, 122, 253, 3, 0, 40],
            [21, 28, 127, 253, 4, 0, 29],
            [21, 33, 129, 253, 4, 0, 30],
            [20, 27, 105, 253, 5, 0, 31],
            [20, 30, 111, 253, 5, 0, 32],
            [12, 8, 112, 253, 6, 0, 33],
            [0, 10, 127, 253, 6, 0, 37],
            [0, 32, 119, 253, 7, 0, 43],
            [0, 11, 89, 253, 8, 0, 49],
            [0, 25, 108, 253, 8, 0, 50],
            [0, 12, 113, 253, 8, 0, 52],
            [0, 23, 105, 253, 9, 0, 54],
            [0, 13, 94, 253, 9, 0, 55],
            [21, 29, 103, 254, 5, 114, 1],
            [25, 30, 97, 253, 5, 0, 34],
            [0, 31, 108, 253, 2, 112, 1],
            [0, 15, 110, 253, 9, 112, 2],
            [0, 27, 111, 253, 10, 112, 3],
            [0, 17, 96, 253, 10, 112, 4],
            [0, 25, 109, 253, 6, 0, 39],
            [0, 11, 112, 253, 11, 0, 59],
            [0, 23, 95, 253, 5, 0, 60],
            [0, 19, 93, 253, 17, 0, 61],
            [0, 21, 114, 254, 2, 114, 2],
            [0, 33, 103, 254, 11, 1, 1],
            [0, 28, 107, 254, 20, 113, 1],
            [0, 13, 105, 253, 21, 112, 5],
            [0, 26, 92, 254, 22, 1, 2],
            [0, 10, 109, 253, 23, 112, 6],
            [0, 29, 101, 254, 24, 1, 3],
            [0, 35, 106, 254, 26, 1, 4],
            [0, 27, 95, 253, 28, 0, 38],
            [0, 15, 99, 254, 30, 0, 36],
            [38, 30, 101, 253, 2, 0, 35],
            [21, 22, 118, 253, 3, 0, 28],
            [12, 8, 106, 253, 3, 0, 25],
            [20, 13, 112, 253, 3, 0, 23],
            [21, 14, 104, 253, 3, 0, 17],
            [20, 28, 185, 253, 6, 4, 8],
            [15, 3, 108, 253, 6, 4, 10],
            [21, 3, 94, 253, 4, 4, 3],
            [20, 3, 102, 253, 4, 4, 5],
            [19, 2, 98, 253, 4, 4, 6],
        ],
        [1 /* OobVariantKey.cart41 */]: [
            // ["CORPSX", "CORPSY", "MSTRNG", "ARRIVE", "CORPT", "CORPNO"]
            [0, 0, 0, 255, 0, 0],
            [40, 20, 223, 0, 4, 24],
            [40, 18, 192, 0, 4, 46],
            [40, 17, 199, 0, 4, 47],
            [40, 16, 184, 0, 4, 57],
            [41, 20, 136, 0, 0, 5],
            [40, 19, 127, 0, 0, 6],
            [41, 18, 150, 0, 0, 7],
            [41, 17, 129, 0, 0, 8],
            [41, 16, 136, 0, 0, 9],
            [41, 23, 198, 0, 4, 41],
            [40, 22, 194, 0, 4, 56],
            [40, 21, 129, 0, 0, 1],
            [41, 21, 123, 0, 0, 2],
            [41, 22, 101, 0, 0, 10],
            [42, 22, 104, 0, 0, 26],
            [42, 23, 112, 0, 0, 28],
            [42, 24, 120, 0, 0, 38],
            [40, 15, 202, 0, 4, 3],
            [41, 14, 195, 0, 4, 14],
            [42, 13, 191, 0, 4, 48],
            [42, 14, 140, 0, 0, 49],
            [42, 12, 142, 0, 0, 4],
            [43, 13, 119, 0, 0, 17],
            [41, 15, 111, 0, 0, 29],
            [30, 2, 97, 0, 48, 1],
            [30, 3, 96, 0, 48, 2],
            [31, 4, 92, 0, 48, 4],
            [33, 6, 125, 0, 0, 11],
            [35, 7, 131, 0, 0, 30],
            [37, 8, 106, 0, 0, 54],
            [35, 38, 112, 0, 32, 2],
            [36, 37, 104, 0, 32, 4],
            [45, 20, 210, 2, 4, 40],
            [38, 8, 98, 3, 84, 1],
            [45, 15, 97, 4, 0, 27],
            [45, 16, 95, 5, 0, 23],
            [31, 1, 52, 6, 48, 5],
            [45, 17, 97, 7, 0, 12],
            [45, 18, 109, 8, 0, 13],
            [45, 20, 98, 9, 0, 34],
            [45, 19, 96, 10, 0, 35],
            [32, 1, 55, 11, 64, 4],
            [44, 20, 219, 0, 3, 1],
            [44, 18, 183, 0, 3, 2],
            [44, 17, 206, 0, 3, 3],
            [44, 16, 237, 0, 3, 4],
            [44, 14, 191, 0, 3, 5],
            // Russian starting offset +48 hex #$3034
            [20, 28, 185, 0, 129, 1],
            [21, 28, 62, 0, 133, 2],
            [21, 27, 104, 0, 128, 19],
            [30, 14, 101, 0, 128, 18],
            [30, 13, 67, 0, 134, 1],
            [39, 28, 104, 0, 128, 27],
            [38, 28, 84, 0, 133, 10],
            [23, 31, 127, 0, 128, 22],
            [19, 24, 112, 0, 128, 21],
            [34, 22, 111, 0, 128, 13],
            [34, 21, 91, 0, 133, 6],
            [31, 34, 79, 0, 129, 9],
            [41, 24, 118, 0, 128, 8],
            [40, 23, 137, 0, 128, 11],
            [39, 23, 70, 0, 133, 1],
            [42, 25, 85, 0, 133, 7],
            [39, 20, 130, 0, 128, 3],
            [39, 22, 91, 0, 128, 4],
            [39, 18, 131, 0, 128, 10],
            [39, 17, 71, 0, 133, 5],
            [39, 21, 86, 0, 133, 8],
            [37, 20, 75, 0, 134, 3],
            [39, 19, 90, 0, 134, 6],
            [39, 16, 123, 0, 128, 5],
            [39, 15, 124, 0, 128, 6],
            [40, 14, 151, 0, 128, 12],
            [41, 13, 128, 0, 128, 26],
            [32, 22, 76, 1, 128, 14],
            [26, 23, 97, 1, 128, 15],
            [29, 33, 121, 2, 128, 20],
            [28, 30, 106, 3, 128, 24],
            [21, 20, 122, 3, 128, 40],
            [21, 28, 127, 4, 128, 29],
            [21, 33, 129, 4, 128, 30],
            [20, 27, 105, 5, 128, 31],
            [20, 30, 111, 5, 128, 32],
            [27, 6, 84, 0, 128, 2],
            [33, 37, 108, 0, 129, 8],
            [41, 12, 89, 0, 133, 3],
            [39, 11, 94, 0, 133, 4],
            [36, 9, 98, 0, 133, 11],
            [34, 8, 82, 0, 134, 5],
            [32, 6, 126, 0, 128, 9],
            [35, 9, 101, 0, 133, 12],
            [30, 4, 91, 0, 134, 4],
            [28, 2, 84, 0, 134, 2],
            [25, 6, 88, 1, 128, 7],
            [29, 14, 91, 1, 129, 2],
            [33, 36, 99, 1, 129, 4],
            [24, 38, 110, 6, 128, 41],
            [23, 38, 105, 8, 128, 42],
            [20, 38, 97, 10, 128, 43],
            [21, 8, 126, 2, 128, 16],
            [0, 28, 119, 2, 128, 56],
            [12, 8, 122, 6, 128, 33],
            [21, 29, 113, 5, 246, 1],
            [25, 30, 97, 5, 128, 34],
            [38, 30, 99, 2, 128, 35],
            [21, 22, 121, 3, 128, 28],
            [12, 8, 118, 3, 128, 25],
            [20, 13, 112, 3, 128, 23],
            [29, 32, 108, 4, 129, 7],
            [27, 31, 123, 5, 129, 11],
            [15, 3, 138, 6, 129, 10],
            [21, 3, 126, 2, 129, 3],
            [20, 3, 119, 2, 129, 5],
            [21, 14, 144, 9, 128, 17],
            [15, 38, 133, 12, 128, 44],
            [0, 20, 135, 10, 128, 45],
            [0, 8, 137, 18, 128, 46],
            [0, 18, 141, 11, 128, 47],
            [0, 10, 128, 15, 128, 48],
            [0, 14, 157, 13, 133, 9],
            [0, 33, 124, 19, 133, 13],
            [0, 11, 159, 20, 133, 14],
            [0, 15, 129, 22, 133, 15],
            [0, 20, 135, 24, 133, 16],
            [0, 10, 123, 11, 134, 7],
            [0, 10, 167, 10, 128, 37],
            [0, 32, 149, 7, 128, 43],
            [0, 11, 139, 6, 128, 49],
            [0, 25, 138, 8, 128, 50],
            [0, 12, 153, 11, 128, 52],
            [0, 23, 165, 9, 128, 54],
            [0, 13, 124, 12, 128, 55],
            [0, 31, 178, 3, 240, 1],
            [0, 15, 150, 9, 240, 2],
            [0, 27, 141, 13, 240, 3],
            [0, 17, 206, 14, 240, 4],
            [0, 7, 130, 1, 128, 79],
            [0, 10, 112, 2, 133, 18],
            [0, 8, 139, 3, 133, 19],
            [0, 9, 113, 4, 128, 95],
            [0, 18, 152, 5, 133, 20],
            [0, 16, 131, 6, 128, 67],
            [0, 12, 127, 7, 128, 66],
            [0, 14, 166, 8, 133, 28],
            [0, 25, 219, 7, 128, 39],
            [0, 11, 202, 12, 128, 59],
            [0, 23, 185, 6, 128, 60],
            [0, 19, 233, 10, 128, 61],
            [0, 21, 244, 11, 246, 2],
            [0, 33, 223, 12, 133, 31],
            [0, 28, 237, 13, 245, 1],
            [0, 13, 245, 14, 240, 5],
            [0, 26, 242, 15, 133, 32],
            [0, 10, 239, 16, 240, 6],
            [0, 29, 251, 17, 133, 33],
            [0, 35, 246, 18, 133, 34],
            [0, 27, 235, 19, 128, 38],
            [0, 22, 247, 20, 128, 36],
            [0, 32, 241, 21, 133, 8],
            [0, 26, 236, 21, 133, 12],
            [0, 8, 223, 22, 240, 7],
            [0, 28, 202, 23, 240, 8],
            [0, 16, 222, 23, 133, 11],
            [0, 12, 224, 24, 240, 9],
            [0, 30, 235, 25, 240, 10],
            [0, 24, 225, 25, 133, 7],
        ],
        // cart defines lat, lon, mstr for '42, but corpt & corpno duplicate '41, and arrive is calculated
        [2 /* OobVariantKey.cart42 */]: [
            // ["CORPSX42", "CORPSY42", "MSTRNG42", "ARRIVE42", "CORPT", "CORPNO"]
            [0, 0, 0, 255, 0, 0],
            [20, 20, 150, 0, 4, 24],
            [35, 29, 131, 0, 4, 46],
            [26, 26, 108, 0, 4, 47],
            [20, 21, 146, 0, 4, 57],
            [32, 36, 90, 0, 0, 5],
            [32, 35, 116, 0, 0, 6],
            [32, 34, 120, 0, 0, 7],
            [32, 32, 96, 0, 0, 8],
            [33, 31, 82, 0, 0, 9],
            [20, 19, 142, 0, 4, 41],
            [19, 16, 169, 0, 4, 56],
            [33, 29, 87, 0, 0, 1],
            [32, 28, 91, 0, 0, 2],
            [30, 28, 101, 0, 0, 10],
            [28, 28, 104, 0, 0, 26],
            [26, 28, 112, 0, 0, 28],
            [24, 27, 120, 0, 0, 38],
            [17, 12, 182, 0, 4, 3],
            [14, 11, 130, 0, 4, 14],
            [14, 9, 142, 0, 4, 48],
            [24, 28, 140, 0, 0, 49],
            [24, 26, 124, 0, 0, 4],
            [24, 24, 119, 0, 0, 17],
            [23, 23, 111, 0, 0, 29],
            [19, 15, 97, 0, 48, 1],
            [19, 13, 96, 0, 48, 2],
            [18, 12, 92, 0, 48, 4],
            [14, 12, 125, 0, 0, 11],
            [14, 10, 131, 0, 0, 30],
            [14, 8, 106, 0, 0, 54],
            [35, 38, 112, 0, 32, 2],
            [36, 37, 104, 0, 32, 4],
            [19, 14, 201, 0, 4, 40],
            [20, 18, 98, 0, 84, 1],
            [22, 23, 110, 0, 0, 27],
            [21, 22, 95, 0, 0, 23],
            [16, 12, 52, 0, 48, 5],
            [20, 17, 97, 0, 0, 12],
            [20, 1, 106, 0, 0, 13],
            [19, 0, 101, 0, 0, 34],
            [18, 3, 96, 0, 0, 35],
            [17, 2, 55, 0, 64, 4],
            [27, 26, 102, 0, 3, 1],
            [22, 20, 138, 0, 3, 2],
            [16, 10, 142, 0, 3, 3],
            [20, 2, 124, 0, 3, 4],
            [20, 15, 115, 0, 3, 5],
            // Russian offset +48 hex #$30
            [20, 28, 242, 0, 129, 1],
            [21, 29, 128, 0, 133, 2],
            [32, 37, 104, 0, 128, 19],
            [31, 34, 92, 0, 128, 18],
            [31, 35, 84, 0, 134, 1],
            [31, 32, 138, 0, 128, 27],
            [31, 33, 114, 0, 133, 10],
            [31, 31, 147, 0, 128, 22],
            [32, 31, 132, 0, 128, 21],
            [32, 30, 136, 0, 128, 13],
            [28, 30, 141, 0, 133, 6],
            [33, 36, 236, 0, 129, 9],
            [32, 29, 141, 0, 128, 8],
            [31, 29, 137, 0, 128, 11],
            [30, 29, 125, 0, 133, 1],
            [29, 29, 135, 0, 133, 7],
            [28, 29, 130, 0, 128, 3],
            [27, 29, 122, 0, 128, 4],
            [26, 29, 105, 0, 128, 10],
            [25, 29, 101, 0, 133, 5],
            [24, 29, 126, 0, 133, 8],
            [23, 29, 115, 0, 134, 3],
            [23, 28, 119, 0, 134, 6],
            [23, 27, 123, 0, 128, 5],
            [23, 26, 124, 0, 128, 6],
            [23, 25, 118, 0, 128, 12],
            [23, 24, 128, 0, 128, 26],
            [22, 24, 136, 0, 128, 14],
            [21, 24, 137, 0, 128, 15],
            [21, 23, 121, 0, 128, 20],
            [20, 23, 126, 0, 128, 24],
            [20, 22, 122, 0, 128, 40],
            [19, 22, 113, 0, 128, 29],
            [19, 21, 112, 0, 128, 30],
            [19, 20, 121, 0, 128, 31],
            [19, 19, 111, 0, 128, 32],
            [19, 18, 104, 0, 128, 2],
            [33, 37, 108, 0, 129, 8],
            [19, 17, 115, 0, 133, 3],
            [18, 16, 112, 0, 133, 4],
            [18, 15, 108, 0, 133, 11],
            [14, 19, 112, 0, 134, 5],
            [13, 16, 126, 0, 128, 9],
            [17, 14, 136, 0, 133, 12],
            [16, 14, 108, 0, 134, 4],
            [15, 14, 119, 0, 134, 2],
            [14, 14, 117, 0, 128, 7],
            [31, 37, 121, 0, 129, 2],
            [31, 36, 110, 0, 129, 4],
            [13, 13, 110, 0, 128, 41],
            [13, 12, 105, 0, 128, 42],
            [13, 11, 127, 0, 128, 43],
            [13, 10, 126, 0, 128, 16],
            [13, 9, 119, 0, 128, 56],
            [13, 8, 122, 0, 128, 33],
            [13, 7, 113, 0, 246, 1],
            [30, 30, 123, 0, 128, 34],
            [19, 25, 124, 0, 128, 35],
            [17, 23, 121, 0, 128, 28],
            [14, 18, 118, 0, 128, 25],
            [15, 21, 112, 0, 128, 23],
            [20, 0, 70, 0, 129, 7],
            [12, 4, 160, 0, 129, 11],
            [12, 8, 138, 0, 129, 10],
            [6, 15, 230, 0, 129, 3],
            [16, 3, 192, 0, 129, 5],
            [0, 20, 144, 2, 128, 17],
            [0, 12, 133, 3, 128, 44],
            [0, 30, 135, 3, 128, 45],
            [0, 10, 137, 4, 128, 46],
            [0, 6, 141, 4, 128, 47],
            [0, 22, 128, 5, 128, 48],
            [0, 15, 157, 5, 133, 9],
            [0, 24, 124, 6, 133, 13],
            [0, 16, 159, 6, 133, 14],
            [0, 18, 129, 7, 133, 15],
            [0, 35, 135, 7, 133, 16],
            [0, 10, 123, 8, 134, 7],
            [0, 20, 167, 8, 128, 37],
            [0, 26, 149, 9, 128, 43],
            [0, 5, 139, 9, 128, 49],
            [0, 11, 138, 10, 128, 50],
            [0, 14, 153, 10, 128, 52],
            [0, 22, 165, 11, 128, 54],
            [0, 33, 124, 11, 128, 55],
            [0, 19, 178, 12, 240, 1],
            [0, 8, 150, 12, 240, 2],
            [0, 28, 141, 13, 240, 3],
            [0, 15, 206, 13, 240, 4],
            [0, 13, 150, 14, 128, 79],
            [0, 35, 132, 14, 133, 18],
            [0, 6, 149, 15, 133, 19],
            [0, 10, 161, 15, 128, 95],
            [0, 30, 152, 16, 133, 20],
            [0, 15, 141, 16, 128, 67],
            [0, 25, 137, 17, 128, 66],
            [0, 11, 176, 17, 133, 28],
            [0, 22, 219, 18, 128, 39],
            [0, 19, 192, 18, 128, 59],
            [0, 30, 195, 19, 128, 60],
            [0, 21, 233, 19, 128, 61],
            [0, 15, 244, 20, 246, 2],
            [0, 7, 223, 20, 133, 31],
            [0, 28, 227, 21, 245, 1],
            [0, 10, 245, 21, 240, 5],
            [0, 33, 242, 22, 133, 32],
            [0, 12, 229, 22, 240, 6],
            [0, 26, 251, 23, 133, 33],
            [0, 14, 246, 23, 133, 34],
            [0, 24, 235, 24, 128, 38],
            [0, 16, 237, 24, 128, 36],
            [0, 6, 221, 25, 133, 8],
            [0, 35, 236, 25, 133, 12],
            [0, 10, 203, 26, 240, 7],
            [0, 30, 202, 26, 240, 8],
            [0, 19, 222, 27, 133, 11],
            [0, 37, 204, 27, 240, 9],
            [0, 23, 215, 28, 240, 10],
            [0, 31, 245, 28, 133, 7],
        ],
    };

    var _Oob_game, _Oob_units;
    class Oob {
        constructor(game, memento) {
            _Oob_game.set(this, void 0);
            _Oob_units.set(this, void 0);
            this.startmstrng = [0, 0]; // sum all mstrng for scoring
            const scenario = scenarios[game.scenario], maxunit = scenario.nunit;
            __classPrivateFieldSet(this, _Oob_units, oobVariants[scenario.oob]
                .map((vs, i) => {
                const u = new Unit(game, i, ...vs);
                // exclude units not in the scenario, but leave them in array
                if (u.id >= maxunit[u.player])
                    u.eliminate();
                this.startmstrng[u.player] += u.mstrng;
                return u;
            }), "f");
            __classPrivateFieldSet(this, _Oob_game, game, "f");
            if (memento) {
                const scheduled = this.filter(u => u.scheduled <= game.turn);
                if (memento.length < scheduled.length)
                    throw new Error('Oob: malformed save data for scheduled unit status');
                scheduled.forEach(u => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const status = memento.shift();
                    if (status == 1) { // eliminated
                        u.eliminate();
                    }
                    else if (status == 2) { // delayed
                        u.arrive = game.turn + 1;
                    }
                });
                const active = this.activeUnits(), human = active.filter(u => u.human), expected = (scenario.fog ? 5 : 4) * active.length + human.length * (scenario.mvmode ? 2 : 1);
                if (memento.length < expected)
                    throw new Error('oob: malformed save data for active unit properties');
                const dlats = zagzig(memento.splice(0, active.length)), dlons = zagzig(memento.splice(0, active.length)), dmstrs = zagzig(memento.splice(0, active.length)), cdmgs = memento.splice(0, active.length), dfogs = scenario.fog ? memento.splice(0, active.length) : [], modes = scenario.mvmode ? memento.splice(0, human.length) : [], nords = memento.splice(0, human.length);
                let lat = 0, lon = 0, mstr = 255;
                active.forEach(u => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    lat += dlats.shift();
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    lon += dlons.shift();
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    mstr += dmstrs.shift();
                    [u.lat, u.lon, u.mstrng] = [lat, lon, mstr];
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    u.cstrng = u.mstrng - cdmgs.shift();
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    if (scenario.fog)
                        u.fog -= dfogs.shift();
                });
                if (memento.length < sum(nords))
                    throw new Error('oob: malformed save data for unit orders');
                human.forEach(u => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    if (scenario.mvmode)
                        u.mode = modes.shift();
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    u.orders = memento.splice(0, nords.shift());
                });
            }
        }
        at(index) {
            const u = __classPrivateFieldGet(this, _Oob_units, "f").at(index);
            if (!u)
                throw new Error(`Oob.at(${index}): Invalid unit index`);
            return u;
        }
        every(f) { return __classPrivateFieldGet(this, _Oob_units, "f").every(f); }
        some(f) { return __classPrivateFieldGet(this, _Oob_units, "f").some(f); }
        filter(f) { return __classPrivateFieldGet(this, _Oob_units, "f").filter(f); }
        find(f) { return __classPrivateFieldGet(this, _Oob_units, "f").find(f); }
        findIndex(f) { return __classPrivateFieldGet(this, _Oob_units, "f").findIndex(f); }
        forEach(f) { __classPrivateFieldGet(this, _Oob_units, "f").forEach(f); }
        map(f) { return __classPrivateFieldGet(this, _Oob_units, "f").map(f); }
        slice(start, end) { return __classPrivateFieldGet(this, _Oob_units, "f").slice(start, end); }
        get memento() {
            const scenario = scenarios[__classPrivateFieldGet(this, _Oob_game, "f").scenario], dlats = [], dlons = [], dmstrs = [], cdmgs = [], modes = [], dfogs = [], nords = [], ords = [];
            let lat = 0, lon = 0, mstr = 255;
            // for scheduled units, status = 0 (active), 1 (dead), 2 (delayed)
            const scheduled = this.filter(u => u.scheduled <= __classPrivateFieldGet(this, _Oob_game, "f").turn), status = scheduled.map(u => u.active ? 0 : (u.cstrng == 0 ? 1 : 2)), active = scheduled.filter(u => u.active);
            active.forEach(u => {
                dlats.push(u.lat - lat);
                dlons.push(u.lon - lon);
                dmstrs.push(u.mstrng - mstr);
                [lat, lon, mstr] = [u.lat, u.lon, u.mstrng];
                if (scenario.fog)
                    dfogs.push(scenario.fog - u.fog);
                cdmgs.push(u.mstrng - u.cstrng);
                if (u.human) {
                    nords.push(u.orders.length);
                    ords.push(...u.orders);
                    if (scenario.mvmode)
                        modes.push(u.mode);
                }
            });
            return status.concat(zigzag(dlats), zigzag(dlons), zigzag(dmstrs), cdmgs, dfogs, modes, nords, ords);
        }
        scoreStrengths(player) {
            var _a;
            const scenario = __classPrivateFieldGet(this, _Oob_game, "f").scenario, scoring = scenarios[scenario].scoring, current = Object.keys(players).map(p => sum(__classPrivateFieldGet(this, _Oob_units, "f").filter(u => (u.player == +p)).map(u => u.cstrng)) >> 7), losses = Object.keys(players).map(p => (this.startmstrng[+p] >> 7) - current[+p]);
            let score = 0;
            ((_a = scoring.strength) !== null && _a !== void 0 ? _a : []).forEach((mode, p) => {
                if (mode)
                    score += ((p == player) ? 1 : -1) * (mode == 'current' ? current[p] : -losses[p]);
            });
            return (player == 0 /* PlayerKey.German */ ? 1 : -1) * score;
        }
        nextTurn(startOrResume) {
            this.activeUnits().forEach(u => u.nextTurn(startOrResume));
        }
        activeUnits(player) {
            return this.filter((u) => u.active && (player == null || u.player == player));
        }
        centerOfGravity(player) {
            const units = this.activeUnits(player), { lat, lon } = units.reduce(({ lat, lon }, u) => ({ lat: lat + u.lat, lon: lon + u.lon }), { lat: 0, lon: 0 });
            // note this usually returns fractional lat/lon which is ok for scroll management
            return { lat: lat / units.length, lon: lon / units.length };
        }
        scheduleOrders() {
            // M.asm:4950 movement execution
            this.activeUnits().forEach(u => u.scheduleOrder(true));
        }
        executeOrders(tick) {
            // original code processes movement in reverse-oob order
            //TODO config to randomize order, or allow a delay/no-op order type to manage traffic?
            this.activeUnits().forEach(u => u.recover());
            this.activeUnits()
                .filter(u => u.tick == tick)
                .reverse()
                .forEach(u => u.tryOrder());
        }
        zocAffects(player, loc, omitSelf = false) {
            return this.zocAffecting(player, loc, omitSelf, 2) >= 2;
        }
        zocAffecting(player, loc, omitSelf = false, threshold) {
            // evaluate zoc experienced by player (eg. exerted by !player) in the square at loc
            let zoc = 0;
            // same player in target square negates any zoc, enemy exerts 4
            if (loc.unitid != null) {
                if (this.at(loc.unitid).player == player) {
                    if (!omitSelf)
                        return 0;
                }
                else {
                    zoc += 4;
                    if (threshold && zoc >= threshold)
                        return zoc;
                }
            }
            if (scenarios[__classPrivateFieldGet(this, _Oob_game, "f").scenario].nozoc)
                return zoc;
            // look at square spiral excluding center, so even squares are adj, odd are corners
            Grid.squareSpiral(loc, 1).slice(1).forEach((p, i) => {
                if (!__classPrivateFieldGet(this, _Oob_game, "f").mapboard.valid(p))
                    return;
                const pt = __classPrivateFieldGet(this, _Oob_game, "f").mapboard.locationOf(p);
                // center-adjacent (even) exert 2, corners (odd) exert 1
                if (pt.unitid != null && this.at(pt.unitid).player != player) {
                    zoc += (i % 2) ? 1 : 2;
                    if (threshold && zoc >= threshold)
                        return zoc;
                }
            });
            return zoc;
        }
        zocBlocked(player, src, dst) {
            // does enemy ZoC block player move from src to dst?
            return this.zocAffects(player, src, true) && this.zocAffects(player, dst);
        }
    }
    _Oob_game = new WeakMap(), _Oob_units = new WeakMap();

    // Atari had a memory location that could be read for a byte of random noise
    const _crypto = node_crypto.webcrypto !== null && node_crypto.webcrypto !== void 0 ? node_crypto.webcrypto : (window && window.crypto);
    function lfsr24(seed) {
        const beforezero = 0xEF41CC; // arbitrary location to insert zero in the sequence
        seed !== null && seed !== void 0 ? seed : (seed = _crypto.getRandomValues(new Uint32Array(1))[0]);
        let r;
        function bit() {
            const v = r & 0x1;
            if (r == beforezero) {
                r = 0;
            }
            else {
                if (r == 0)
                    r = beforezero; // continue on
                // constant via // https://en.wikipedia.org/wiki/Linear-feedback_shift_register
                r = (r >> 1) ^ (-(r & 1) & 0xe10000);
            }
            return v;
        }
        function bits(k) {
            let v = 0;
            for (let i = 0; i < k; i++)
                v = (v << 1) | bit();
            return v;
        }
        function state(seed) {
            if (seed != null)
                r = seed & 0xffffff;
            return r;
        }
        state(seed);
        return {
            state: state,
            bit: bit,
            bits: bits,
            byte: () => bits(8),
        };
    }

    var domain;

    // This constructor is used to store event handlers. Instantiating this is
    // faster than explicitly calling `Object.create(null)` to get a "clean" empty
    // object (tested with v8 v4.9).
    function EventHandlers() {}
    EventHandlers.prototype = Object.create(null);

    function EventEmitter() {
      EventEmitter.init.call(this);
    }

    // nodejs oddity
    // require('events') === require('events').EventEmitter
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.usingDomains = false;

    EventEmitter.prototype.domain = undefined;
    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._maxListeners = undefined;

    // By default EventEmitters will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    EventEmitter.defaultMaxListeners = 10;

    EventEmitter.init = function() {
      this.domain = null;
      if (EventEmitter.usingDomains) {
        // if there is an active domain, then attach to it.
        if (domain.active ) ;
      }

      if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
        this._events = new EventHandlers();
        this._eventsCount = 0;
      }

      this._maxListeners = this._maxListeners || undefined;
    };

    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== 'number' || n < 0 || isNaN(n))
        throw new TypeError('"n" argument must be a positive number');
      this._maxListeners = n;
      return this;
    };

    function $getMaxListeners(that) {
      if (that._maxListeners === undefined)
        return EventEmitter.defaultMaxListeners;
      return that._maxListeners;
    }

    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
      return $getMaxListeners(this);
    };

    // These standalone emit* functions are used to optimize calling of event
    // handlers for fast cases because emit() itself often has a variable number of
    // arguments and can be deoptimized because of that. These functions always have
    // the same number of arguments and thus do not get deoptimized, so the code
    // inside them can execute faster.
    function emitNone(handler, isFn, self) {
      if (isFn)
        handler.call(self);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self);
      }
    }
    function emitOne(handler, isFn, self, arg1) {
      if (isFn)
        handler.call(self, arg1);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1);
      }
    }
    function emitTwo(handler, isFn, self, arg1, arg2) {
      if (isFn)
        handler.call(self, arg1, arg2);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1, arg2);
      }
    }
    function emitThree(handler, isFn, self, arg1, arg2, arg3) {
      if (isFn)
        handler.call(self, arg1, arg2, arg3);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].call(self, arg1, arg2, arg3);
      }
    }

    function emitMany(handler, isFn, self, args) {
      if (isFn)
        handler.apply(self, args);
      else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          listeners[i].apply(self, args);
      }
    }

    EventEmitter.prototype.emit = function emit(type) {
      var er, handler, len, args, i, events, domain;
      var doError = (type === 'error');

      events = this._events;
      if (events)
        doError = (doError && events.error == null);
      else if (!doError)
        return false;

      domain = this.domain;

      // If there is no 'error' event listener then throw.
      if (doError) {
        er = arguments[1];
        if (domain) {
          if (!er)
            er = new Error('Uncaught, unspecified "error" event');
          er.domainEmitter = this;
          er.domain = domain;
          er.domainThrown = false;
          domain.emit('error', er);
        } else if (er instanceof Error) {
          throw er; // Unhandled 'error' event
        } else {
          // At least give some kind of context to the user
          var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
          err.context = er;
          throw err;
        }
        return false;
      }

      handler = events[type];

      if (!handler)
        return false;

      var isFn = typeof handler === 'function';
      len = arguments.length;
      switch (len) {
        // fast cases
        case 1:
          emitNone(handler, isFn, this);
          break;
        case 2:
          emitOne(handler, isFn, this, arguments[1]);
          break;
        case 3:
          emitTwo(handler, isFn, this, arguments[1], arguments[2]);
          break;
        case 4:
          emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
          break;
        // slower
        default:
          args = new Array(len - 1);
          for (i = 1; i < len; i++)
            args[i - 1] = arguments[i];
          emitMany(handler, isFn, this, args);
      }

      return true;
    };

    function _addListener(target, type, listener, prepend) {
      var m;
      var events;
      var existing;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = target._events;
      if (!events) {
        events = target._events = new EventHandlers();
        target._eventsCount = 0;
      } else {
        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (events.newListener) {
          target.emit('newListener', type,
                      listener.listener ? listener.listener : listener);

          // Re-assign `events` because a newListener handler could have caused the
          // this._events to be assigned to a new object
          events = target._events;
        }
        existing = events[type];
      }

      if (!existing) {
        // Optimize the case of one listener. Don't need the extra array object.
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === 'function') {
          // Adding the second element, need to change to array.
          existing = events[type] = prepend ? [listener, existing] :
                                              [existing, listener];
        } else {
          // If we've already got an array, just append.
          if (prepend) {
            existing.unshift(listener);
          } else {
            existing.push(listener);
          }
        }

        // Check for listener leak
        if (!existing.warned) {
          m = $getMaxListeners(target);
          if (m && m > 0 && existing.length > m) {
            existing.warned = true;
            var w = new Error('Possible EventEmitter memory leak detected. ' +
                                existing.length + ' ' + type + ' listeners added. ' +
                                'Use emitter.setMaxListeners() to increase limit');
            w.name = 'MaxListenersExceededWarning';
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            emitWarning(w);
          }
        }
      }

      return target;
    }
    function emitWarning(e) {
      typeof console.warn === 'function' ? console.warn(e) : console.log(e);
    }
    EventEmitter.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.prependListener =
        function prependListener(type, listener) {
          return _addListener(this, type, listener, true);
        };

    function _onceWrap(target, type, listener) {
      var fired = false;
      function g() {
        target.removeListener(type, g);
        if (!fired) {
          fired = true;
          listener.apply(target, arguments);
        }
      }
      g.listener = listener;
      return g;
    }

    EventEmitter.prototype.once = function once(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };

    EventEmitter.prototype.prependOnceListener =
        function prependOnceListener(type, listener) {
          if (typeof listener !== 'function')
            throw new TypeError('"listener" argument must be a function');
          this.prependListener(type, _onceWrap(this, type, listener));
          return this;
        };

    // emits a 'removeListener' event iff the listener was removed
    EventEmitter.prototype.removeListener =
        function removeListener(type, listener) {
          var list, events, position, i, originalListener;

          if (typeof listener !== 'function')
            throw new TypeError('"listener" argument must be a function');

          events = this._events;
          if (!events)
            return this;

          list = events[type];
          if (!list)
            return this;

          if (list === listener || (list.listener && list.listener === listener)) {
            if (--this._eventsCount === 0)
              this._events = new EventHandlers();
            else {
              delete events[type];
              if (events.removeListener)
                this.emit('removeListener', type, list.listener || listener);
            }
          } else if (typeof list !== 'function') {
            position = -1;

            for (i = list.length; i-- > 0;) {
              if (list[i] === listener ||
                  (list[i].listener && list[i].listener === listener)) {
                originalListener = list[i].listener;
                position = i;
                break;
              }
            }

            if (position < 0)
              return this;

            if (list.length === 1) {
              list[0] = undefined;
              if (--this._eventsCount === 0) {
                this._events = new EventHandlers();
                return this;
              } else {
                delete events[type];
              }
            } else {
              spliceOne(list, position);
            }

            if (events.removeListener)
              this.emit('removeListener', type, originalListener || listener);
          }

          return this;
        };
        
    // Alias for removeListener added in NodeJS 10.0
    // https://nodejs.org/api/events.html#events_emitter_off_eventname_listener
    EventEmitter.prototype.off = function(type, listener){
        return this.removeListener(type, listener);
    };

    EventEmitter.prototype.removeAllListeners =
        function removeAllListeners(type) {
          var listeners, events;

          events = this._events;
          if (!events)
            return this;

          // not listening for removeListener, no need to emit
          if (!events.removeListener) {
            if (arguments.length === 0) {
              this._events = new EventHandlers();
              this._eventsCount = 0;
            } else if (events[type]) {
              if (--this._eventsCount === 0)
                this._events = new EventHandlers();
              else
                delete events[type];
            }
            return this;
          }

          // emit removeListener for all listeners on all events
          if (arguments.length === 0) {
            var keys = Object.keys(events);
            for (var i = 0, key; i < keys.length; ++i) {
              key = keys[i];
              if (key === 'removeListener') continue;
              this.removeAllListeners(key);
            }
            this.removeAllListeners('removeListener');
            this._events = new EventHandlers();
            this._eventsCount = 0;
            return this;
          }

          listeners = events[type];

          if (typeof listeners === 'function') {
            this.removeListener(type, listeners);
          } else if (listeners) {
            // LIFO order
            do {
              this.removeListener(type, listeners[listeners.length - 1]);
            } while (listeners[0]);
          }

          return this;
        };

    EventEmitter.prototype.listeners = function listeners(type) {
      var evlistener;
      var ret;
      var events = this._events;

      if (!events)
        ret = [];
      else {
        evlistener = events[type];
        if (!evlistener)
          ret = [];
        else if (typeof evlistener === 'function')
          ret = [evlistener.listener || evlistener];
        else
          ret = unwrapListeners(evlistener);
      }

      return ret;
    };

    EventEmitter.listenerCount = function(emitter, type) {
      if (typeof emitter.listenerCount === 'function') {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };

    EventEmitter.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;

      if (events) {
        var evlistener = events[type];

        if (typeof evlistener === 'function') {
          return 1;
        } else if (evlistener) {
          return evlistener.length;
        }
      }

      return 0;
    }

    EventEmitter.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
    };

    // About 1.5x faster than the two-arg version of Array#splice().
    function spliceOne(list, index) {
      for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
        list[i] = list[k];
      list.pop();
    }

    function arrayClone(arr, i) {
      var copy = new Array(i);
      while (i--)
        copy[i] = arr[i];
      return copy;
    }

    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
      }
      return ret;
    }

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const tokenPrefix = 'EF41', tokenVersion = 1, rlSigil = 6; // highest 5-bit coded value, so values 0..3 (& 4,5) are unchanged by rlencode
    class Game extends EventEmitter {
        constructor(tokenOrScenario, seed) {
            super(); // init EventEmitter
            this.scenario = 1 /* ScenarioKey.learner */;
            this.human = 0 /* PlayerKey.German */;
            this.turn = 0; // 0-based turn index
            // flags
            this.handicap = 0; // whether the game is handicapped
            let memento;
            if (typeof tokenOrScenario === 'number') {
                this.scenario = tokenOrScenario;
            }
            else if (typeof tokenOrScenario === 'string') {
                const payload = unwrap64(tokenOrScenario, tokenPrefix);
                seed = bitsdecode(payload, 24);
                memento = rldecode(fibdecode(payload), rlSigil);
                if (memento.length < 7)
                    throw new Error('Game: malformed save data');
                const version = memento.shift();
                if (version != tokenVersion)
                    throw new Error(`Game: unrecognized save version ${version}`);
                this.scenario = memento.shift();
                this.human = memento.shift();
                this.turn = memento.shift();
                this.handicap = memento.shift();
            }
            // create the oob and maboard, using memento if there was one
            this.mapboard = new Mapboard(this, memento);
            this.oob = new Oob(this, memento);
            this.rand = lfsr24(seed);
            if (memento && memento.length != 0) {
                throw new Error("Game: unexpected save data overflow");
            }
            this.nextTurn(true);
        }
        get memento() {
            // return a list of uint representing the state of the game
            return [
                tokenVersion,
                this.scenario,
                this.human,
                this.turn,
                +this.handicap,
            ].concat(this.mapboard.memento, this.oob.memento);
        }
        get token() {
            const payload = [].concat(bitsencode(this.rand.state(), 24), fibencode(rlencode(this.memento, rlSigil)));
            return wrap64(payload, tokenPrefix);
        }
        get over() {
            const scenario = scenarios[this.scenario];
            return (this.turn >= scenario.endturn
                || this.score(0 /* PlayerKey.German */) >= scenario.scoring.win
                // special end condition for learner mode
                || (this.scenario == 1 /* ScenarioKey.learner */ && this.mapboard.cities[0].owner == 0 /* PlayerKey.German */));
        }
        resolveTurn(delay) {
            // external entry for nextTurn to process orders for this turn
            // and advance to next
            // if delay is provided we tick asynchrnously,
            // otherwise we resolve synchronously
            let tick = 0;
            this.oob.scheduleOrders();
            // Set up for a sync or async loop
            const tickTock = () => {
                this.oob.executeOrders(tick);
                this.emit('game', 'tick');
                const next = tick++ < 32 ? tickTock : () => this.nextTurn();
                if (!delay)
                    next();
                else
                    setTimeout(next, delay);
            };
            tickTock();
        }
        nextTurn(startOrResume = false) {
            const dt = new Date(scenarios[this.scenario].start), ongoing = !this.over;
            if (!startOrResume && ongoing)
                this.turn++;
            this.date = new Date(dt.setDate(dt.getDate() + 7 * this.turn));
            this.month = this.date.getMonth(); // note JS getMonth is 0-indexed
            this.weather = monthdata[this.month].weather;
            if (startOrResume || ongoing) {
                this.mapboard.nextTurn(startOrResume);
                this.oob.nextTurn(startOrResume);
            }
            this.emit('game', ongoing ? 'turn' : 'over');
        }
        score(player) {
            var _a;
            // M.asm:4050
            const scoring = scenarios[this.scenario].scoring;
            const eastwest = sum(this.oob.map(u => u.locScore() * (u.player == player ? 1 : -1))), strng = this.oob.scoreStrengths(player), cities = sum(this.mapboard.cities.filter(c => c.owner == player).map(c => c.points));
            let score = cities + (scoring.location ? Math.max(0, eastwest) : 0) + strng + ((_a = scoring.adjust) !== null && _a !== void 0 ? _a : 0);
            if (this.handicap)
                score >>= 1;
            return score;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        emit(event, ...args) {
            return super.emit(event, ...args);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        on(event, listener) {
            return super.on(event, listener);
        }
    }

    var _Thinker_instances, _Thinker_game, _Thinker_player, _Thinker_trainOfThought, _Thinker_depth, _Thinker_delay, _Thinker_recur, _Thinker_findBeleaguered, _Thinker_evalLocation;
    class Thinker {
        constructor(game, player) {
            _Thinker_instances.add(this);
            _Thinker_game.set(this, void 0);
            _Thinker_player.set(this, void 0);
            _Thinker_trainOfThought.set(this, 0);
            _Thinker_depth.set(this, 0);
            _Thinker_delay.set(this, 0);
            this.finalized = true;
            __classPrivateFieldSet(this, _Thinker_game, game, "f");
            __classPrivateFieldSet(this, _Thinker_player, player, "f");
        }
        thinkRecurring(delay) {
            __classPrivateFieldSet(this, _Thinker_delay, (delay == null) ? 250 : delay, "f");
            this.finalized = false;
            __classPrivateFieldGet(this, _Thinker_instances, "m", _Thinker_recur).call(this, __classPrivateFieldGet(this, _Thinker_trainOfThought, "f"));
        }
        finalize() {
            var _a;
            console.debug("Finalizing...");
            __classPrivateFieldSet(this, _Thinker_trainOfThought, (_a = __classPrivateFieldGet(this, _Thinker_trainOfThought, "f"), _a++, _a), "f");
            __classPrivateFieldSet(this, _Thinker_depth, 0, "f");
            this.finalized = true;
            __classPrivateFieldGet(this, _Thinker_game, "f").oob.activeUnits(__classPrivateFieldGet(this, _Thinker_player, "f")).forEach(u => u.setOrders(u.orders.slice(0, 8)));
        }
        think() {
            const firstpass = __classPrivateFieldGet(this, _Thinker_depth, "f") == 0, pinfo = players[__classPrivateFieldGet(this, _Thinker_player, "f")], friends = __classPrivateFieldGet(this, _Thinker_game, "f").oob.activeUnits(__classPrivateFieldGet(this, _Thinker_player, "f")), foes = __classPrivateFieldGet(this, _Thinker_game, "f").oob.activeUnits(1 - __classPrivateFieldGet(this, _Thinker_player, "f"));
            // set up the ghost army
            let ofr = 0; // only used in first pass
            if (firstpass) {
                ofr = calcForceRatios(__classPrivateFieldGet(this, _Thinker_game, "f").oob, __classPrivateFieldGet(this, _Thinker_player, "f")).ofr;
                friends.forEach(u => { u.objective = { lon: u.lon, lat: u.lat }; });
            }
            friends.filter(u => u.movable).forEach(u => {
                var _a;
                //TODO these first two checks don't seem to depend on ghost army so are fixed on first pass?
                if (firstpass && u.ifr == (ofr >> 1)) {
                    // head to reinforce if no local threat since (Local + OFR) / 2 = OFR / 2
                    //TODO this tends to send most units to same beleagured square
                    const v = __classPrivateFieldGet(this, _Thinker_instances, "m", _Thinker_findBeleaguered).call(this, u, friends);
                    if (v)
                        u.objective = { lon: v.lon, lat: v.lat };
                }
                else if (firstpass && (u.cstrng <= (u.mstrng >> 1) || u.ifrdir[pinfo.homedir] >= 16)) {
                    // run home if hurting or outnumbered in the rear
                    // for Russian the whole eastern edge is valid, but generalize to support German AI or variant maps
                    const bbox = __classPrivateFieldGet(this, _Thinker_game, "f").mapboard.bbox, lon = bbox[pinfo.homedir], south = bbox[2 /* DirectionKey.south */], north = bbox[0 /* DirectionKey.north */], lat = (_a = [...Array(north - south + 1).keys()]
                        .map(k => k + south)
                        .sort((a, b) => (Math.abs(a - u.lat) - Math.abs(b - u.lat)) || a - b)
                        .find(lat => __classPrivateFieldGet(this, _Thinker_game, "f").mapboard.locationOf(Grid.lonlat(lon, lat)).terrain != 9 /* TerrainKey.impassable */)) !== null && _a !== void 0 ? _a : u.lat;
                    u.objective = { lon, lat };
                }
                else {
                    // find nearest best square
                    const start = __classPrivateFieldGet(this, _Thinker_game, "f").mapboard.locationOf(Grid.point(u.objective));
                    let bestval = __classPrivateFieldGet(this, _Thinker_instances, "m", _Thinker_evalLocation).call(this, u, start, friends, foes);
                    __classPrivateFieldGet(this, _Thinker_game, "f").mapboard.neighborsOf(start).forEach(loc => {
                        if (!loc)
                            return;
                        const sqval = __classPrivateFieldGet(this, _Thinker_instances, "m", _Thinker_evalLocation).call(this, u, loc, friends, foes);
                        if (sqval > bestval) {
                            bestval = sqval;
                            u.objective = { lon: loc.lon, lat: loc.lat };
                        }
                    });
                }
                if (!u.objective)
                    return;
                const result = u.pathTo(u.objective);
                if (!result)
                    return;
                u.setOrders(result.orders); // We'll prune to 8 later
            });
            return friends.filter(u => u.objective);
        }
    }
    _Thinker_game = new WeakMap(), _Thinker_player = new WeakMap(), _Thinker_trainOfThought = new WeakMap(), _Thinker_depth = new WeakMap(), _Thinker_delay = new WeakMap(), _Thinker_instances = new WeakSet(), _Thinker_recur = function _Thinker_recur(train) {
        var _a;
        if (train != __classPrivateFieldGet(this, _Thinker_trainOfThought, "f")) {
            // skip pre-scheduled old train of thought
            console.debug(`Skipped passing thought, train ${train}`);
            return;
        }
        const t0 = performance.now();
        this.think();
        const dt = performance.now() - t0;
        __classPrivateFieldSet(this, _Thinker_delay, __classPrivateFieldGet(this, _Thinker_delay, "f") * 1.1, "f"); // gradually back off thinking rate
        console.debug(`Think.#recur ${train}-${__classPrivateFieldGet(this, _Thinker_depth, "f")} took ${Math.round(dt)}ms; waiting ${Math.round(__classPrivateFieldGet(this, _Thinker_delay, "f"))}ms`);
        __classPrivateFieldSet(this, _Thinker_depth, (_a = __classPrivateFieldGet(this, _Thinker_depth, "f"), _a++, _a), "f");
        setTimeout(() => __classPrivateFieldGet(this, _Thinker_instances, "m", _Thinker_recur).call(this, train), __classPrivateFieldGet(this, _Thinker_delay, "f"));
    }, _Thinker_findBeleaguered = function _Thinker_findBeleaguered(u, friends) {
        let best = null, score = 0;
        friends.filter(v => v.ifr > u.ifr).forEach(v => {
            const d = Grid.manhattanDistance(u, v);
            if (d <= 8)
                return; // APX code does weird bit 3 check
            const s = v.ifr - (d >> 3);
            if (s > score) {
                score = s;
                best = v;
            }
        });
        return best;
    }, _Thinker_evalLocation = function _Thinker_evalLocation(u, loc, friends, foes) {
        const ghosts = {}, range = Grid.manhattanDistance(u, loc);
        // too far, early exit
        if (range >= 8)
            return 0;
        const nbval = Math.min(...foes.map(v => Grid.manhattanDistance(loc, v)));
        // on the defensive and square is occupied by an enemy
        if (u.ifr >= 16 && nbval == 0)
            return 0;
        friends.filter(v => v.id != u.id)
            .forEach(v => { ghosts[Grid.point(v.objective).gid] = v.id; });
        const isOccupied = (pt) => !!ghosts[pt.gid];
        let dibs = false;
        if (isOccupied(loc))
            dibs = true; // someone else have dibs already?
        else
            ghosts[loc.gid] = u.id;
        const square = Grid.squareSpiral(loc, 2), linepts = Object.keys(directions).map(d => linePoints(sortSquareFacing(loc, 5, +d, square), 5, isOccupied)), tadj = terraintypes[loc.terrain].defence + 2; // our 0 adj is equiv to his 2
        let sqval = sum(linepts.map((scr, i) => scr * u.ifrdir[i])) >> 8;
        sqval += u.ifr >= 16 ? u.ifr * (nbval + tadj) : 2 * (15 - u.ifr) * (9 - nbval + tadj);
        if (dibs)
            sqval -= 32;
        sqval -= 1 << range;
        return sqval < 0 ? 0 : sqval;
    };
    function calcForceRatios(oob, player) {
        const active = oob.activeUnits(), friend = sum(active.filter(u => u.player == player).map(u => u.cstrng)), foe = sum(active.filter(u => u.player != player).map(u => u.cstrng)), ofr = Math.floor((foe << 4) / friend), ofropp = Math.floor((friend << 4) / foe);
        active.forEach(u => {
            const nearby = active.filter(v => Grid.manhattanDistance(u, v) <= 8), p = Grid.point(u);
            let friend = 0;
            u.ifrdir = [0, 0, 0, 0];
            nearby.forEach(v => {
                const inc = v.cstrng >> 4;
                if (v.player == u.player)
                    friend += inc;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                else
                    u.ifrdir[Grid.directionFrom(p, Grid.point(v))] += inc; // enemy can't be in same square
            });
            // individual and overall ifr max 255
            const ifr = Math.floor((sum(u.ifrdir) << 4) / friend);
            // we actually work with average of IFR + OFR
            u.ifr = (ifr + (u.player == player ? ofr : ofropp)) >> 1;
        });
        return { ofr, friend, foe };
    }
    function sortSquareFacing(center, diameter, dir, locs) {
        if (diameter % 2 != 1)
            throw (`sortSquareFacing: diameter should be odd, got ${diameter}`);
        if (!locs || locs.length != diameter * diameter)
            throw (`sortSquareFacing: diameter : size mismatch ${locs.length} != ${diameter}^2`);
        const r = (diameter - 1) / 2, minor = directions[(dir + 1) % 4], major = directions[(dir + 2) % 4], out = new Array(locs.length);
        locs.forEach(loc => {
            const dlat = loc.lat - center.lat, dlon = loc.lon - center.lon, idx = (r + dlat * major.dlat + dlon * major.dlon
                + diameter * (r + dlat * minor.dlat + dlon * minor.dlon));
            out[idx] = loc;
        });
        return out;
    }
    function linePoints(locs, diameter, occupied) {
        // curious that this doesn't consider terrain, e.g. a line ending at the coast will get penalized heavily?
        const r = (diameter - 1) / 2, frontline = Array(diameter).fill(diameter), counts = Array(diameter).fill(0);
        let row = -1, col = -1, score = 0;
        locs.forEach(loc => {
            row = (row + 1) % diameter;
            if (row == 0)
                col++;
            if (occupied(loc)) {
                counts[col] += 1;
                if (frontline[col] == diameter)
                    frontline[col] = row;
            }
        });
        frontline.forEach((row, col) => {
            if (row < diameter)
                score += 40;
            if (row < diameter - 1 && occupied(locs[row + 1 + diameter * col]))
                score -= 32;
        });
        if (frontline[r] == r && counts[r] == 1)
            score += 48;
        // also curious that we look at all pairs not just adjacent ones?
        for (let i = 1; i < diameter; i++)
            for (let j = 0; j < i; j++) {
                const delta = Math.abs(frontline[i] - frontline[j]);
                if (delta)
                    score -= 1 << delta;
            }
        return score;
    }

    const atascii = (c) => c.charCodeAt(0) & 0x7f, atasciiFont = fontMap('static/fontmap-atascii.png', 128);
    function fontMap(maskImage, numGlyphs, glyphSize = 8, glyphsPerRow = 16) {
        return { maskImage, numGlyphs, glyphSize, glyphsPerRow };
    }
    class DisplayLayer {
        constructor(width, height, fontmap, opts = {}) {
            this.dirty = true;
            // explicitly set foregroundColor: undefined for transparent glyphs
            if (!('foregroundColor' in opts))
                opts.foregroundColor = 0x0f;
            this.width = width;
            this.height = height;
            this.fontmap = fontmap;
            this.setcolors(opts);
        }
        get opts() {
            return {
                foregroundColor: this.foregroundColor,
                backgroundColor: this.backgroundColor,
                layerColor: this.layerColor,
                opacity: this.opacity,
            };
        }
        setcolors(opts) {
            this.dirty = true;
            this.foregroundColor = opts.foregroundColor;
            this.backgroundColor = opts.backgroundColor;
            this.layerColor = opts.layerColor;
            this.opacity = opts.opacity;
        }
        cls() {
            this.dirty = true;
        }
    }
    class MappedDisplayLayer extends DisplayLayer {
        constructor(width, height, fontmap, opts = {}) {
            super(width, height, fontmap, opts);
            this.x = 0;
            this.y = 0;
            this.endLine = 'newline';
            this.endScreen = 'wraparound';
            this.glyphs = new Array(height).fill(undefined).map(() => new Array(width).fill(undefined));
        }
        spritelist() {
            return this.glyphs.flatMap((row, y) => row.map((g, x) => g && Object.assign({ key: `${x},${y}`, x, y }, g)).filter(d => d));
        }
        cls(c) {
            super.cls();
            // with no argument, clear all glyphs (so we see the container layer)
            // otherwise set all glyphs to a specific character
            this.x = 0;
            this.y = 0;
            this.glyphs = this.glyphs.map(row => row.map(() => c != null ? { c } : undefined));
        }
        scroll(dx, dy, c) {
            // scroll screen by dx, dy, filling with character c (blank for undefined)
            this.dirty = true;
            const xs = [...Array(this.width).keys()], ys = [...Array(this.height).keys()], g = c != null ? { c } : undefined;
            this.glyphs = ys.map(y => {
                const y_ = y + dy;
                return (y_ < 0 || y_ >= this.height)
                    ? new Array(this.width).fill(g)
                    : xs.map(x => {
                        const x_ = x + dx;
                        return (x_ < 0 || x_ >= this.width) ? g : this.glyphs[y_][x_];
                    });
            });
            this.setpos(this.x - dx, this.y - dy);
        }
        roll(dx, dy) {
            this.dirty = true;
            // roll screen by dx, dy
            const xs = [...Array(this.width).keys()], ys = [...Array(this.height).keys()];
            this.glyphs = ys.map(y => xs.map(x => this.glyphs[(y + dy) % this.height][(x + dx) % this.width]));
            this.setpos(this.x - dx, this.y - dy);
        }
        setpos(x, y) {
            this.x = clamp(x, 0, this.width - 1);
            this.y = clamp(y, 0, this.height - 1);
        }
        putc(c, opts = {}) {
            // put a character at current position, with options.  put undefined to clear current chr
            this.dirty = true;
            const { x, y } = opts, rest = __rest(opts, ["x", "y"]);
            this.setpos(x !== null && x !== void 0 ? x : this.x, y !== null && y !== void 0 ? y : this.y);
            this.glyphs[this.y][this.x] = c != null ? Object.assign({ c }, rest) : undefined;
            this.x = (this.x + 1) % this.width;
            if (this.x == 0 && this.endLine == 'newline') {
                this.y++;
                if (this.y == this.height) {
                    if (this.endScreen == 'wraparound')
                        this.y = 0;
                    else
                        this.scroll(0, 1);
                }
            }
        }
        puts(s, opts = {}) {
            var _a;
            const { x, y } = opts, rest = __rest(opts, ["x", "y"]), cs = s.split(''), charMap = (_a = opts.charMap) !== null && _a !== void 0 ? _a : atascii, stops = { '<': 0, '>': this.width, '^': Math.floor(this.width / 2) };
            this.setpos(x !== null && x !== void 0 ? x : this.x, y !== null && y !== void 0 ? y : this.y);
            let justify = undefined, jlen = 0;
            opts = Object.assign({}, rest);
            function nextch() {
                return cs.shift();
            }
            function nextval() {
                return nextch().charCodeAt(0);
            }
            const outch = (c) => {
                const eol = this.endLine;
                if ('>^'.includes(justify !== null && justify !== void 0 ? justify : 'X')) {
                    this.endLine = 'wraparound'; // disable non-explicit newline while center/right justify
                    let x0, xoff;
                    const row = this.glyphs[this.y];
                    if (justify == '>') {
                        x0 = stops['>'] - 1;
                        xoff = Math.max(0, x0 - jlen);
                        row.splice(xoff, 1);
                        row.splice(x0, 0, undefined);
                    }
                    else /* justify == '^' */ {
                        x0 = stops['^'] + Math.floor((jlen + 1) / 2) - 1;
                        xoff = Math.max(0, x0 - jlen);
                        if (x0 > this.width)
                            return;
                        if (jlen % 2 == 0) {
                            row.splice(xoff, 1); // remove one char @ xoff
                            row.splice(x0, 0, undefined); // add placeholder at x0
                        }
                    }
                    opts.x = x0;
                }
                else {
                    opts.x = undefined;
                }
                jlen++;
                this.putc(charMap(c), opts);
                this.endLine = eol;
            };
            while (cs.length) {
                const c = nextch(), x0 = this.x, y0 = this.y;
                switch (c) {
                    case '\n': // hex 0a
                        this.setpos(justify != null ? stops[justify] : 0, this.y);
                        jlen = 0;
                        this.y++;
                        if (this.y == this.height) {
                            if (this.endScreen == 'wraparound')
                                this.y = 0;
                            else
                                this.scroll(0, 1);
                        }
                        break;
                    case '\f': { // hex 0c
                        const k = nextch();
                        switch (k) {
                            // emit literal \f or \n character with \ff, \fn
                            case 'f':
                                outch('\f');
                                break;
                            case 'n':
                                outch('\n');
                                break;
                            // set/unset glyph style
                            case '-':
                                opts.animate = undefined;
                                opts.invert = undefined;
                                break;
                            case '.':
                                opts.animate = 0 /* GlyphAnimation.blink */;
                                break;
                            case ':':
                                opts.animate = 1 /* GlyphAnimation.flash */;
                                break;
                            case '#':
                                opts.invert = true;
                                break;
                            // set/unset glyph color
                            case 'C':
                                opts.foregroundColor = undefined;
                                break;
                            case 'B':
                                opts.backgroundColor = undefined;
                                break;
                            case 'c':
                                opts.foregroundColor = nextval();
                                break;
                            case 'b':
                                opts.backgroundColor = nextval();
                                break;
                            // home, clear+home
                            case 'H':
                                this.x = this.y = 0;
                                break;
                            case 'h':
                                this.cls();
                                break;
                            // move cursor up/down/left/right
                            case 'I':
                                if (this.y > 0)
                                    this.y--;
                                break;
                            case 'J':
                                if (this.x > 0)
                                    this.x--;
                                break;
                            case 'K':
                                if (this.y < this.height - 1)
                                    this.y++;
                                break;
                            case 'L':
                                if (this.x < this.width - 1)
                                    this.x++;
                                break;
                            case 'i':
                                this.y = 0;
                                break;
                            case 'j':
                                this.x = 0;
                                break;
                            case 'k':
                                this.y = this.height - 1;
                                break;
                            case 'l':
                                this.x = this.width - 1;
                                break;
                            // set cursor, e.g. \fx\06
                            case 'x':
                                this.setpos(nextval(), 0);
                                break;
                            case 'y':
                                this.setpos(0, nextval());
                                break;
                            case 'z':
                                this.setpos(nextval(), nextval());
                                break;
                            // clear to start/end of line/screen
                            case 'S':
                                for (let x = 0; x < x0; x++)
                                    this.putc(undefined, { x });
                                this.setpos(x0, y0);
                                break;
                            case 'E':
                                for (let x = x0; x < this.width; x++)
                                    this.putc(undefined, { x });
                                this.setpos(x0, y0);
                                break;
                            case 's':
                                for (let y = 0; y <= y0; y++)
                                    for (let x = 0; x < ((y == y0) ? x0 : this.width); x++)
                                        this.putc(undefined, { x, y });
                                this.setpos(x0, y0);
                                break;
                            case 'e':
                                for (let y = y0; y < this.height; y++)
                                    for (let x = ((y == y0) ? x0 : 0); x < this.width; x++)
                                        this.putc(undefined, { x, y });
                                this.setpos(x0, y0);
                                break;
                            // justify left/center/right, with default or explicit stop
                            // explicitly justified text is delimited with matching paren
                            // or arbitrary matching character
                            // use \f@ to specify explicit tab stop, eg:
                            //   \f>/dexter\ndroit/ => justify 'dexter' and 'droit' to right-hand edge
                            //   \f^(centrist) => center-align 'centrist'
                            //   \f@\x04>[indent\n\some\n\lines] => left-justify text @ indent 4
                            case '@': // follow with single byte tab stop value and tab type
                            case '^': // follow ^,>,< with delimited text block
                            case '>':
                            case '<': {
                                if (k == '@') { // \f@\x3^...
                                    const stop = nextval(), ch = nextch();
                                    if (!Object.keys(stops).includes(ch))
                                        throw new Error('Bad @ sequence, expected value followed by one of ^<>');
                                    justify = ch;
                                    stops[justify] = stop;
                                    this.setpos(stop, this.y);
                                }
                                else {
                                    justify = k;
                                }
                                jlen = 0;
                                break;
                            }
                            case '/': // stop justifying
                                justify = undefined;
                                break;
                            default:
                                throw new Error(`Unknown formatting character '${k}'`);
                        }
                        break;
                    }
                    default:
                        outch(c);
                }
            }
        }
    }
    class SpriteDisplayLayer extends DisplayLayer {
        constructor() {
            super(...arguments);
            this.sprites = {};
        }
        cls() {
            super.cls();
            this.sprites = {};
        }
        put(key, c, x, y, opts = {}) {
            this.dirty = true;
            this.sprites[key] = Object.assign({ key, c, x, y }, opts);
        }
        moveto(key, x, y) {
            if (!(key in this.sprites)) {
                throw new Error(`SpriteDisplayLayer.moveto: key error for '${key}'`);
            }
            this.dirty = true;
            Object.assign(this.sprites[key], { x: x, y: y });
        }
        delete(key) {
            if (!(key in this.sprites)) {
                throw new Error(`SpriteDisplayLayer.delete: key error for '${key}'`);
            }
            this.dirty = true;
            delete this.sprites[key];
        }
        spritelist() {
            return Object.values(this.sprites);
        }
    }

    var _AppModel_extras, _AppModel_debug, _AppModel_game, _AppModel_id, _AppModel_active;
    class AppModel {
        constructor() {
            this.uimode = 0 /* UIModeKey.setup */;
            this.help = true; // whether help is displayed
            // managed by setter/getter so we can repaint
            _AppModel_extras.set(this, true); // whether to show extras
            _AppModel_debug.set(this, false); // whether to show debug info
            this.zoom = true; // zoom 2x or not?
            _AppModel_game.set(this, new Game(1 /* ScenarioKey.learner */));
            _AppModel_id.set(this, -1); // most-recently focused unit
            _AppModel_active.set(this, false); // focus currently active?
            this.dateWindow = new MappedDisplayLayer(21, 2, atasciiFont, { foregroundColor: 0x6A, layerColor: 0xB0 });
            this.infoWindow = new MappedDisplayLayer(42, 2, atasciiFont, { foregroundColor: 0x28, layerColor: 0x22 });
            this.errorWindow = new MappedDisplayLayer(42, 1, atasciiFont, { foregroundColor: 0x22, layerColor: 0x3A });
        }
        set game(g) {
            if (__classPrivateFieldGet(this, _AppModel_game, "f") == g)
                return;
            const font = fontMap(`static/fontmap-custom-${g.mapboard.font}.png`, 128 + 6), { width, height } = g.mapboard.extent;
            this.mapLayer = new MappedDisplayLayer(width, height, font);
            this.labelLayer = new SpriteDisplayLayer(width, height, font, { foregroundColor: undefined });
            this.unitLayer = new SpriteDisplayLayer(width, height, font);
            this.kreuzeLayer = new SpriteDisplayLayer(width, height, font);
            this.maskLayer = new MappedDisplayLayer(width, height, font, { backgroundColor: 0x00 });
            __classPrivateFieldSet(this, _AppModel_game, g, "f");
            this.paintMap();
            this.paintCityLabels();
            this.paintUnits();
        }
        // repaint units when extras or debug flags change to trigger redraw
        get extras() { return __classPrivateFieldGet(this, _AppModel_extras, "f"); }
        set extras(on) {
            __classPrivateFieldSet(this, _AppModel_extras, on, "f");
            this.paintUnits();
        }
        get debug() { return __classPrivateFieldGet(this, _AppModel_debug, "f"); }
        set debug(on) {
            __classPrivateFieldSet(this, _AppModel_debug, on, "f");
            if (__classPrivateFieldGet(this, _AppModel_debug, "f"))
                this.extras = true; // extras layers required to see debug info
            this.paintUnits();
        }
        get mvmode() {
            var _a;
            return (_a = scenarios[__classPrivateFieldGet(this, _AppModel_game, "f").scenario].mvmode) !== null && _a !== void 0 ? _a : false;
        }
        focussed() {
            return __classPrivateFieldGet(this, _AppModel_active, "f") ? __classPrivateFieldGet(this, _AppModel_game, "f").oob.at(__classPrivateFieldGet(this, _AppModel_id, "f")) : undefined;
        }
        focusOn(u) {
            this.focusOff();
            __classPrivateFieldSet(this, _AppModel_id, u.id, "f");
            __classPrivateFieldSet(this, _AppModel_active, true, "f");
            this.paintUnit(u);
            this.paintReach(u);
        }
        focusOff() {
            const u = this.focussed();
            __classPrivateFieldSet(this, _AppModel_active, false, "f");
            this.infoWindow.cls();
            if (u) {
                this.paintUnit(u); // repaint to clear blink etc
                this.maskLayer.cls(); // remove all mask glyphs
                this.kreuzeLayer.cls(); // remove any order animation
            }
        }
        focusShift(offset) {
            const g = __classPrivateFieldGet(this, _AppModel_game, "f"), locid = (u) => u.location.gid, humanUnits = g.oob.activeUnits(g.human).sort((a, b) => locid(b) - locid(a)), n = humanUnits.length;
            let i;
            if (__classPrivateFieldGet(this, _AppModel_id, "f") >= 0) {
                i = humanUnits.findIndex(u => u.id == __classPrivateFieldGet(this, _AppModel_id, "f"));
                if (i < 0) {
                    // if last unit no longer active, find the nearest active unit
                    const id = locid(g.oob.at(__classPrivateFieldGet(this, _AppModel_id, "f")));
                    while (++i < n && locid(humanUnits[i]) > id) { /**/ }
                }
            }
            else {
                i = offset > 0 ? -1 : 0;
            }
            i = (i + n + offset) % n;
            this.focusOn(humanUnits[i]);
        }
        paintCityLabels() {
            // these are static so never need redrawn, color changes via paintMap
            __classPrivateFieldGet(this, _AppModel_game, "f").mapboard.cities.forEach((c, i) => {
                const { x, y } = __classPrivateFieldGet(this, _AppModel_game, "f").mapboard.xy(c);
                this.labelLayer.put(i.toString(), 32, x, y, {
                    props: { label: c.label, points: c.points }
                });
            });
        }
        paintMap() {
            const g = __classPrivateFieldGet(this, _AppModel_game, "f"), { earth, contrast } = weatherdata[__classPrivateFieldGet(this, _AppModel_game, "f").weather];
            this.labelLayer.setcolors({ foregroundColor: contrast });
            this.mapLayer.setcolors({ layerColor: earth });
            //TODO tree colors are updated in place in terrain defs :-(
            g.mapboard.locations.forEach(row => row.forEach(loc => {
                const t = terraintypes[loc.terrain], city = loc.cityid != null ? g.mapboard.cities[loc.cityid] : null, color = city ? players[city === null || city === void 0 ? void 0 : city.owner].color : (loc.alt ? t.altcolor : t.color);
                this.mapLayer.putc(loc.icon, {
                    foregroundColor: color,
                    onclick: () => {
                        if (this.uimode != 1 /* UIModeKey.orders */)
                            return;
                        this.errorWindow.puts(`\fx\x06\fe`);
                        this.focusOff();
                        if (city)
                            this.infoWindow.puts(`\f^${city.label.toUpperCase()}`);
                    },
                    onmouseover: (e) => {
                        e.currentTarget.title = g.mapboard.describe(loc);
                        e.redraw = false; // prevent mithril redraw
                    },
                });
            }));
        }
        paintUnits() {
            __classPrivateFieldGet(this, _AppModel_game, "f").oob.forEach(u => this.paintUnit(u));
        }
        paintReach(u) {
            this.maskLayer.cls(0); // mask everything with block char, then clear reach squares
            u.reach().forEach(pt => this.maskLayer.putc(undefined, __classPrivateFieldGet(this, _AppModel_game, "f").mapboard.xy(pt)));
        }
        paintUnit(u) {
            const g = __classPrivateFieldGet(this, _AppModel_game, "f"), { earth, contrast } = weatherdata[g.weather], { x, y } = g.mapboard.xy(u);
            let animation = undefined;
            if (u === this.focussed()) {
                const f = u.foggyStrength(g.human);
                this.infoWindow.puts(`\fh\f@\x06<${u.label}\n\feMUSTER: ${f.mstrng}  COMBAT: ${f.cstrng}`);
                animation = 0 /* GlyphAnimation.blink */;
                if (u.player == g.human) {
                    if (scenarios[g.scenario].mvmode)
                        this.infoWindow.puts(`\fH\f>${unitModes[u.mode].label} \nMODE   `);
                    const props = { orders: u.orders };
                    this.kreuzeLayer.cls();
                    this.kreuzeLayer.put('#', 0x80, x, y, { foregroundColor: 0x1A, props });
                    if (u.orders.length) {
                        Object.values(directions).forEach(d => this.kreuzeLayer.put(d.label, d.icon, x, y, { foregroundColor: 0xDC, props }));
                    }
                }
            }
            else if (u.active) {
                if (u.flags & unitFlag.attack) {
                    animation = 1 /* GlyphAnimation.flash */;
                }
                else if (u.flags & unitFlag.defend) {
                    animation = 2 /* GlyphAnimation.flash_reverse */;
                }
            }
            const opts = {
                backgroundColor: earth,
                foregroundColor: players[u.player].color,
                opacity: u.active ? 1 : 0,
                animate: animation,
                onmouseover: (e) => {
                    e.currentTarget.title = g.mapboard.describe(u.location, u.player == g.human || this.debug);
                    e.redraw = false; // prevent mithril redraw
                },
                onclick: () => {
                    if (this.uimode != 1 /* UIModeKey.orders */ || !u.active)
                        return;
                    this.errorWindow.puts(`\fx\x06\fe`);
                    (this.uimode == 1 /* UIModeKey.orders */ && this.focussed() !== u) ? this.focusOn(u) : this.focusOff();
                }
            };
            if (this.extras) {
                opts.props = u.foggyStrength(g.human); // cstrng, mstrng
                opts.props.oos = (u.flags & unitFlag.oos) ? true : false;
                opts.props.enter = (u.flags & unitFlag.enter) && g.turn > 0 ? true : false;
                if (u.player == g.human || this.debug) {
                    opts.props.orders = u.orders;
                    opts.props.fly = u.kind == 2 /* UnitKindKey.air */ && u.mode == 1 /* UnitMode.assault */;
                    opts.props.mode = u.mode;
                }
                if (u.player == 0 /* PlayerKey.German */) {
                    opts.props.contrast = contrast;
                }
            }
            else {
                opts.props = {};
            }
            this.unitLayer.put(`${__classPrivateFieldGet(this, _AppModel_game, "f").scenario}:${u.id}`, unitkinds[u.kind].icon, x, y, opts);
        }
    }
    _AppModel_extras = new WeakMap(), _AppModel_debug = new WeakMap(), _AppModel_game = new WeakMap(), _AppModel_id = new WeakMap(), _AppModel_active = new WeakMap();

    const keymap = {
        help: '?/',
        prev: '<,p',
        next: '>.n',
        cancel: ['Escape', ' '],
        scenario: Object.keys(scenarios).join(''),
        extras: 'xX',
        zoom: 'zZ',
        debug: 'gG',
        mode: 'mM',
        modes: '1234',
    }, arrowdirs = {
        ArrowUp: 0 /* DirectionKey.north */,
        ArrowDown: 2 /* DirectionKey.south */,
        ArrowRight: 1 /* DirectionKey.east */,
        ArrowLeft: 3 /* DirectionKey.west */,
    }, modeHandlers = {
        [0 /* UIModeKey.setup */]: setupHandler,
        [1 /* UIModeKey.orders */]: ordersHandler,
        [2 /* UIModeKey.resolve */]: resolveHandler,
    };
    const modifier = {
        shift: 1 << 0,
        ctrl: 1 << 1,
        alt: 1 << 2,
        meta: 1 << 3,
    };
    function keyModifiers(event) {
        return ((event.shiftKey ? modifier.shift : 0)
            | (event.ctrlKey ? modifier.ctrl : 0)
            | (event.altKey ? modifier.alt : 0)
            | (event.metaKey ? modifier.meta : 0));
    }
    function globalHandler(key, modifiers, ctrl) {
        if (ctrl.app.help || keymap.help.includes(key)) {
            ctrl.app.help = !ctrl.app.help;
        }
        else if (keymap.zoom.includes(key)) {
            ctrl.view.pinMapCenter();
            ctrl.app.zoom = !ctrl.app.zoom;
        }
        else if (keymap.extras.includes(key)) {
            ctrl.app.extras = !ctrl.app.extras;
        }
        else if (keymap.debug.includes(key)) {
            ctrl.app.debug = !ctrl.app.debug;
        }
        else {
            return false;
        }
        return true;
    }
    function setupHandler(key, modifiers, ctrl) {
        if (keymap.prev.includes(key) || key == 'ArrowLeft') {
            ctrl.setScenario(undefined, -1);
        }
        else if (keymap.next.includes(key) || key == 'ArrowRight') {
            ctrl.setScenario(undefined, +1);
        }
        else if (keymap.scenario.includes(key)) {
            ctrl.setScenario(parseInt(key));
        }
        else if (key == 'Enter') {
            ctrl.setMode(1 /* UIModeKey.orders */);
        }
        else {
            return false;
        }
        return true;
    }
    function ordersHandler(key, modifiers, ctrl) {
        if (keymap.prev.includes(key)) {
            ctrl.app.focusShift(-1);
        }
        else if (keymap.next.includes(key) || (key == 'Enter' && !modifiers)) {
            if (ctrl.game.over)
                ctrl.setMode(0 /* UIModeKey.setup */);
            else
                ctrl.app.focusShift(+1);
        }
        else if (ctrl.app.mvmode && keymap.mode.includes(key)) {
            ctrl.editUnitMode(null);
        }
        else if (ctrl.app.mvmode && keymap.modes.includes(key)) {
            ctrl.editUnitMode(keymap.modes.indexOf(key));
        }
        else if (key in arrowdirs) {
            ctrl.editOrders(arrowdirs[key]);
        }
        else if (keymap.cancel.includes(key)) {
            ctrl.editOrders(null);
        }
        else if (key == 'Backspace') {
            ctrl.editOrders(-1);
        }
        else if (key == 'End' || (key == 'Enter' && (modifiers & (modifier.ctrl | modifier.shift)))) {
            ctrl.setMode(2 /* UIModeKey.resolve */);
        }
        else {
            return false;
        }
        return true;
    }
    function resolveHandler(key, modifiers, ctrl) {
        if (keymap.prev.includes(key)) {
            ctrl.app.focusShift(-1);
        }
        else if (keymap.next.includes(key) || key == 'Enter') {
            ctrl.app.focusShift(+1);
        }
        else {
            return false;
        }
        return true;
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var vnode;
    var hasRequiredVnode;

    function requireVnode () {
    	if (hasRequiredVnode) return vnode;
    	hasRequiredVnode = 1;

    	function Vnode(tag, key, attrs, children, text, dom) {
    		return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, events: undefined, instance: undefined}
    	}
    	Vnode.normalize = function(node) {
    		if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
    		if (node == null || typeof node === "boolean") return null
    		if (typeof node === "object") return node
    		return Vnode("#", undefined, undefined, String(node), undefined, undefined)
    	};
    	Vnode.normalizeChildren = function(input) {
    		var children = [];
    		if (input.length) {
    			var isKeyed = input[0] != null && input[0].key != null;
    			// Note: this is a *very* perf-sensitive check.
    			// Fun fact: merging the loop like this is somehow faster than splitting
    			// it, noticeably so.
    			for (var i = 1; i < input.length; i++) {
    				if ((input[i] != null && input[i].key != null) !== isKeyed) {
    					throw new TypeError(
    						isKeyed && (input[i] != null || typeof input[i] === "boolean")
    							? "In fragments, vnodes must either all have keys or none have keys. You may wish to consider using an explicit keyed empty fragment, m.fragment({key: ...}), instead of a hole."
    							: "In fragments, vnodes must either all have keys or none have keys."
    					)
    				}
    			}
    			for (var i = 0; i < input.length; i++) {
    				children[i] = Vnode.normalize(input[i]);
    			}
    		}
    		return children
    	};

    	vnode = Vnode;
    	return vnode;
    }

    var Vnode$4 = requireVnode();

    // Call via `hyperscriptVnode.apply(startOffset, arguments)`
    //
    // The reason I do it this way, forwarding the arguments and passing the start
    // offset in `this`, is so I don't have to create a temporary array in a
    // performance-critical path.
    //
    // In native ES6, I'd instead add a final `...args` parameter to the
    // `hyperscript` and `fragment` factories and define this as
    // `hyperscriptVnode(...args)`, since modern engines do optimize that away. But
    // ES5 (what Mithril.js requires thanks to IE support) doesn't give me that luxury,
    // and engines aren't nearly intelligent enough to do either of these:
    //
    // 1. Elide the allocation for `[].slice.call(arguments, 1)` when it's passed to
    //    another function only to be indexed.
    // 2. Elide an `arguments` allocation when it's passed to any function other
    //    than `Function.prototype.apply` or `Reflect.apply`.
    //
    // In ES6, it'd probably look closer to this (I'd need to profile it, though):
    // module.exports = function(attrs, ...children) {
    //     if (attrs == null || typeof attrs === "object" && attrs.tag == null && !Array.isArray(attrs)) {
    //         if (children.length === 1 && Array.isArray(children[0])) children = children[0]
    //     } else {
    //         children = children.length === 0 && Array.isArray(attrs) ? attrs : [attrs, ...children]
    //         attrs = undefined
    //     }
    //
    //     if (attrs == null) attrs = {}
    //     return Vnode("", attrs.key, attrs, children)
    // }
    var hyperscriptVnode$2 = function() {
    	var attrs = arguments[this], start = this + 1, children;

    	if (attrs == null) {
    		attrs = {};
    	} else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
    		attrs = {};
    		start = this;
    	}

    	if (arguments.length === start + 1) {
    		children = arguments[start];
    		if (!Array.isArray(children)) children = [children];
    	} else {
    		children = [];
    		while (start < arguments.length) children.push(arguments[start++]);
    	}

    	return Vnode$4("", attrs.key, attrs, children)
    };

    var hasOwn$2 = {}.hasOwnProperty;

    var Vnode$3 = requireVnode();
    var hyperscriptVnode$1 = hyperscriptVnode$2;
    var hasOwn$1 = hasOwn$2;

    var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g;
    var selectorCache = {};

    function isEmpty(object) {
    	for (var key in object) if (hasOwn$1.call(object, key)) return false
    	return true
    }

    function compileSelector(selector) {
    	var match, tag = "div", classes = [], attrs = {};
    	while (match = selectorParser.exec(selector)) {
    		var type = match[1], value = match[2];
    		if (type === "" && value !== "") tag = value;
    		else if (type === "#") attrs.id = value;
    		else if (type === ".") classes.push(value);
    		else if (match[3][0] === "[") {
    			var attrValue = match[6];
    			if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\");
    			if (match[4] === "class") classes.push(attrValue);
    			else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true;
    		}
    	}
    	if (classes.length > 0) attrs.className = classes.join(" ");
    	return selectorCache[selector] = {tag: tag, attrs: attrs}
    }

    function execSelector(state, vnode) {
    	var attrs = vnode.attrs;
    	var hasClass = hasOwn$1.call(attrs, "class");
    	var className = hasClass ? attrs.class : attrs.className;

    	vnode.tag = state.tag;
    	vnode.attrs = {};

    	if (!isEmpty(state.attrs) && !isEmpty(attrs)) {
    		var newAttrs = {};

    		for (var key in attrs) {
    			if (hasOwn$1.call(attrs, key)) newAttrs[key] = attrs[key];
    		}

    		attrs = newAttrs;
    	}

    	for (var key in state.attrs) {
    		if (hasOwn$1.call(state.attrs, key) && key !== "className" && !hasOwn$1.call(attrs, key)){
    			attrs[key] = state.attrs[key];
    		}
    	}
    	if (className != null || state.attrs.className != null) attrs.className =
    		className != null
    			? state.attrs.className != null
    				? String(state.attrs.className) + " " + String(className)
    				: className
    			: state.attrs.className != null
    				? state.attrs.className
    				: null;

    	if (hasClass) attrs.class = null;

    	for (var key in attrs) {
    		if (hasOwn$1.call(attrs, key) && key !== "key") {
    			vnode.attrs = attrs;
    			break
    		}
    	}

    	return vnode
    }

    function hyperscript$2(selector) {
    	if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
    		throw Error("The selector must be either a string or a component.");
    	}

    	var vnode = hyperscriptVnode$1.apply(1, arguments);

    	if (typeof selector === "string") {
    		vnode.children = Vnode$3.normalizeChildren(vnode.children);
    		if (selector !== "[") return execSelector(selectorCache[selector] || compileSelector(selector), vnode)
    	}

    	vnode.tag = selector;
    	return vnode
    }

    var hyperscript_1$1 = hyperscript$2;

    var Vnode$2 = requireVnode();

    var trust = function(html) {
    	if (html == null) html = "";
    	return Vnode$2("<", undefined, undefined, html, undefined, undefined)
    };

    var Vnode$1 = requireVnode();
    var hyperscriptVnode = hyperscriptVnode$2;

    var fragment = function() {
    	var vnode = hyperscriptVnode.apply(0, arguments);

    	vnode.tag = "[";
    	vnode.children = Vnode$1.normalizeChildren(vnode.children);
    	return vnode
    };

    var hyperscript$1 = hyperscript_1$1;

    hyperscript$1.trust = trust;
    hyperscript$1.fragment = fragment;

    var hyperscript_1 = hyperscript$1;

    var promise = {exports: {}};

    var polyfill;
    var hasRequiredPolyfill;

    function requirePolyfill () {
    	if (hasRequiredPolyfill) return polyfill;
    	hasRequiredPolyfill = 1;
    	/** @constructor */
    	var PromisePolyfill = function(executor) {
    		if (!(this instanceof PromisePolyfill)) throw new Error("Promise must be called with 'new'.")
    		if (typeof executor !== "function") throw new TypeError("executor must be a function.")

    		var self = this, resolvers = [], rejectors = [], resolveCurrent = handler(resolvers, true), rejectCurrent = handler(rejectors, false);
    		var instance = self._instance = {resolvers: resolvers, rejectors: rejectors};
    		var callAsync = typeof setImmediate === "function" ? setImmediate : setTimeout;
    		function handler(list, shouldAbsorb) {
    			return function execute(value) {
    				var then;
    				try {
    					if (shouldAbsorb && value != null && (typeof value === "object" || typeof value === "function") && typeof (then = value.then) === "function") {
    						if (value === self) throw new TypeError("Promise can't be resolved with itself.")
    						executeOnce(then.bind(value));
    					}
    					else {
    						callAsync(function() {
    							if (!shouldAbsorb && list.length === 0) console.error("Possible unhandled promise rejection:", value);
    							for (var i = 0; i < list.length; i++) list[i](value);
    							resolvers.length = 0, rejectors.length = 0;
    							instance.state = shouldAbsorb;
    							instance.retry = function() {execute(value);};
    						});
    					}
    				}
    				catch (e) {
    					rejectCurrent(e);
    				}
    			}
    		}
    		function executeOnce(then) {
    			var runs = 0;
    			function run(fn) {
    				return function(value) {
    					if (runs++ > 0) return
    					fn(value);
    				}
    			}
    			var onerror = run(rejectCurrent);
    			try {then(run(resolveCurrent), onerror);} catch (e) {onerror(e);}
    		}

    		executeOnce(executor);
    	};
    	PromisePolyfill.prototype.then = function(onFulfilled, onRejection) {
    		var self = this, instance = self._instance;
    		function handle(callback, list, next, state) {
    			list.push(function(value) {
    				if (typeof callback !== "function") next(value);
    				else try {resolveNext(callback(value));} catch (e) {if (rejectNext) rejectNext(e);}
    			});
    			if (typeof instance.retry === "function" && state === instance.state) instance.retry();
    		}
    		var resolveNext, rejectNext;
    		var promise = new PromisePolyfill(function(resolve, reject) {resolveNext = resolve, rejectNext = reject;});
    		handle(onFulfilled, instance.resolvers, resolveNext, true), handle(onRejection, instance.rejectors, rejectNext, false);
    		return promise
    	};
    	PromisePolyfill.prototype.catch = function(onRejection) {
    		return this.then(null, onRejection)
    	};
    	PromisePolyfill.prototype.finally = function(callback) {
    		return this.then(
    			function(value) {
    				return PromisePolyfill.resolve(callback()).then(function() {
    					return value
    				})
    			},
    			function(reason) {
    				return PromisePolyfill.resolve(callback()).then(function() {
    					return PromisePolyfill.reject(reason);
    				})
    			}
    		)
    	};
    	PromisePolyfill.resolve = function(value) {
    		if (value instanceof PromisePolyfill) return value
    		return new PromisePolyfill(function(resolve) {resolve(value);})
    	};
    	PromisePolyfill.reject = function(value) {
    		return new PromisePolyfill(function(resolve, reject) {reject(value);})
    	};
    	PromisePolyfill.all = function(list) {
    		return new PromisePolyfill(function(resolve, reject) {
    			var total = list.length, count = 0, values = [];
    			if (list.length === 0) resolve([]);
    			else for (var i = 0; i < list.length; i++) {
    				(function(i) {
    					function consume(value) {
    						count++;
    						values[i] = value;
    						if (count === total) resolve(values);
    					}
    					if (list[i] != null && (typeof list[i] === "object" || typeof list[i] === "function") && typeof list[i].then === "function") {
    						list[i].then(consume, reject);
    					}
    					else consume(list[i]);
    				})(i);
    			}
    		})
    	};
    	PromisePolyfill.race = function(list) {
    		return new PromisePolyfill(function(resolve, reject) {
    			for (var i = 0; i < list.length; i++) {
    				list[i].then(resolve, reject);
    			}
    		})
    	};

    	polyfill = PromisePolyfill;
    	return polyfill;
    }

    /* global window */

    var PromisePolyfill$1 = requirePolyfill();

    if (typeof window !== "undefined") {
    	if (typeof window.Promise === "undefined") {
    		window.Promise = PromisePolyfill$1;
    	} else if (!window.Promise.prototype.finally) {
    		window.Promise.prototype.finally = PromisePolyfill$1.prototype.finally;
    	}
    	promise.exports = window.Promise;
    } else if (typeof commonjsGlobal !== "undefined") {
    	if (typeof commonjsGlobal.Promise === "undefined") {
    		commonjsGlobal.Promise = PromisePolyfill$1;
    	} else if (!commonjsGlobal.Promise.prototype.finally) {
    		commonjsGlobal.Promise.prototype.finally = PromisePolyfill$1.prototype.finally;
    	}
    	promise.exports = commonjsGlobal.Promise;
    } else {
    	promise.exports = PromisePolyfill$1;
    }

    var render$2;
    var hasRequiredRender;

    function requireRender () {
    	if (hasRequiredRender) return render$2;
    	hasRequiredRender = 1;

    	var Vnode = requireVnode();

    	render$2 = function($window) {
    		var $doc = $window && $window.document;
    		var currentRedraw;

    		var nameSpace = {
    			svg: "http://www.w3.org/2000/svg",
    			math: "http://www.w3.org/1998/Math/MathML"
    		};

    		function getNameSpace(vnode) {
    			return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
    		}

    		//sanity check to discourage people from doing `vnode.state = ...`
    		function checkState(vnode, original) {
    			if (vnode.state !== original) throw new Error("'vnode.state' must not be modified.")
    		}

    		//Note: the hook is passed as the `this` argument to allow proxying the
    		//arguments without requiring a full array allocation to do so. It also
    		//takes advantage of the fact the current `vnode` is the first argument in
    		//all lifecycle methods.
    		function callHook(vnode) {
    			var original = vnode.state;
    			try {
    				return this.apply(original, arguments)
    			} finally {
    				checkState(vnode, original);
    			}
    		}

    		// IE11 (at least) throws an UnspecifiedError when accessing document.activeElement when
    		// inside an iframe. Catch and swallow this error, and heavy-handidly return null.
    		function activeElement() {
    			try {
    				return $doc.activeElement
    			} catch (e) {
    				return null
    			}
    		}
    		//create
    		function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
    			for (var i = start; i < end; i++) {
    				var vnode = vnodes[i];
    				if (vnode != null) {
    					createNode(parent, vnode, hooks, ns, nextSibling);
    				}
    			}
    		}
    		function createNode(parent, vnode, hooks, ns, nextSibling) {
    			var tag = vnode.tag;
    			if (typeof tag === "string") {
    				vnode.state = {};
    				if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks);
    				switch (tag) {
    					case "#": createText(parent, vnode, nextSibling); break
    					case "<": createHTML(parent, vnode, ns, nextSibling); break
    					case "[": createFragment(parent, vnode, hooks, ns, nextSibling); break
    					default: createElement(parent, vnode, hooks, ns, nextSibling);
    				}
    			}
    			else createComponent(parent, vnode, hooks, ns, nextSibling);
    		}
    		function createText(parent, vnode, nextSibling) {
    			vnode.dom = $doc.createTextNode(vnode.children);
    			insertNode(parent, vnode.dom, nextSibling);
    		}
    		var possibleParents = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"};
    		function createHTML(parent, vnode, ns, nextSibling) {
    			var match = vnode.children.match(/^\s*?<(\w+)/im) || [];
    			// not using the proper parent makes the child element(s) vanish.
    			//     var div = document.createElement("div")
    			//     div.innerHTML = "<td>i</td><td>j</td>"
    			//     console.log(div.innerHTML)
    			// --> "ij", no <td> in sight.
    			var temp = $doc.createElement(possibleParents[match[1]] || "div");
    			if (ns === "http://www.w3.org/2000/svg") {
    				temp.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\">" + vnode.children + "</svg>";
    				temp = temp.firstChild;
    			} else {
    				temp.innerHTML = vnode.children;
    			}
    			vnode.dom = temp.firstChild;
    			vnode.domSize = temp.childNodes.length;
    			// Capture nodes to remove, so we don't confuse them.
    			vnode.instance = [];
    			var fragment = $doc.createDocumentFragment();
    			var child;
    			while (child = temp.firstChild) {
    				vnode.instance.push(child);
    				fragment.appendChild(child);
    			}
    			insertNode(parent, fragment, nextSibling);
    		}
    		function createFragment(parent, vnode, hooks, ns, nextSibling) {
    			var fragment = $doc.createDocumentFragment();
    			if (vnode.children != null) {
    				var children = vnode.children;
    				createNodes(fragment, children, 0, children.length, hooks, null, ns);
    			}
    			vnode.dom = fragment.firstChild;
    			vnode.domSize = fragment.childNodes.length;
    			insertNode(parent, fragment, nextSibling);
    		}
    		function createElement(parent, vnode, hooks, ns, nextSibling) {
    			var tag = vnode.tag;
    			var attrs = vnode.attrs;
    			var is = attrs && attrs.is;

    			ns = getNameSpace(vnode) || ns;

    			var element = ns ?
    				is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
    				is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag);
    			vnode.dom = element;

    			if (attrs != null) {
    				setAttrs(vnode, attrs, ns);
    			}

    			insertNode(parent, element, nextSibling);

    			if (!maybeSetContentEditable(vnode)) {
    				if (vnode.children != null) {
    					var children = vnode.children;
    					createNodes(element, children, 0, children.length, hooks, null, ns);
    					if (vnode.tag === "select" && attrs != null) setLateSelectAttrs(vnode, attrs);
    				}
    			}
    		}
    		function initComponent(vnode, hooks) {
    			var sentinel;
    			if (typeof vnode.tag.view === "function") {
    				vnode.state = Object.create(vnode.tag);
    				sentinel = vnode.state.view;
    				if (sentinel.$$reentrantLock$$ != null) return
    				sentinel.$$reentrantLock$$ = true;
    			} else {
    				vnode.state = void 0;
    				sentinel = vnode.tag;
    				if (sentinel.$$reentrantLock$$ != null) return
    				sentinel.$$reentrantLock$$ = true;
    				vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode);
    			}
    			initLifecycle(vnode.state, vnode, hooks);
    			if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks);
    			vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode));
    			if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
    			sentinel.$$reentrantLock$$ = null;
    		}
    		function createComponent(parent, vnode, hooks, ns, nextSibling) {
    			initComponent(vnode, hooks);
    			if (vnode.instance != null) {
    				createNode(parent, vnode.instance, hooks, ns, nextSibling);
    				vnode.dom = vnode.instance.dom;
    				vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0;
    			}
    			else {
    				vnode.domSize = 0;
    			}
    		}

    		//update
    		/**
    		 * @param {Element|Fragment} parent - the parent element
    		 * @param {Vnode[] | null} old - the list of vnodes of the last `render()` call for
    		 *                               this part of the tree
    		 * @param {Vnode[] | null} vnodes - as above, but for the current `render()` call.
    		 * @param {Function[]} hooks - an accumulator of post-render hooks (oncreate/onupdate)
    		 * @param {Element | null} nextSibling - the next DOM node if we're dealing with a
    		 *                                       fragment that is not the last item in its
    		 *                                       parent
    		 * @param {'svg' | 'math' | String | null} ns) - the current XML namespace, if any
    		 * @returns void
    		 */
    		// This function diffs and patches lists of vnodes, both keyed and unkeyed.
    		//
    		// We will:
    		//
    		// 1. describe its general structure
    		// 2. focus on the diff algorithm optimizations
    		// 3. discuss DOM node operations.

    		// ## Overview:
    		//
    		// The updateNodes() function:
    		// - deals with trivial cases
    		// - determines whether the lists are keyed or unkeyed based on the first non-null node
    		//   of each list.
    		// - diffs them and patches the DOM if needed (that's the brunt of the code)
    		// - manages the leftovers: after diffing, are there:
    		//   - old nodes left to remove?
    		// 	 - new nodes to insert?
    		// 	 deal with them!
    		//
    		// The lists are only iterated over once, with an exception for the nodes in `old` that
    		// are visited in the fourth part of the diff and in the `removeNodes` loop.

    		// ## Diffing
    		//
    		// Reading https://github.com/localvoid/ivi/blob/ddc09d06abaef45248e6133f7040d00d3c6be853/packages/ivi/src/vdom/implementation.ts#L617-L837
    		// may be good for context on longest increasing subsequence-based logic for moving nodes.
    		//
    		// In order to diff keyed lists, one has to
    		//
    		// 1) match nodes in both lists, per key, and update them accordingly
    		// 2) create the nodes present in the new list, but absent in the old one
    		// 3) remove the nodes present in the old list, but absent in the new one
    		// 4) figure out what nodes in 1) to move in order to minimize the DOM operations.
    		//
    		// To achieve 1) one can create a dictionary of keys => index (for the old list), then iterate
    		// over the new list and for each new vnode, find the corresponding vnode in the old list using
    		// the map.
    		// 2) is achieved in the same step: if a new node has no corresponding entry in the map, it is new
    		// and must be created.
    		// For the removals, we actually remove the nodes that have been updated from the old list.
    		// The nodes that remain in that list after 1) and 2) have been performed can be safely removed.
    		// The fourth step is a bit more complex and relies on the longest increasing subsequence (LIS)
    		// algorithm.
    		//
    		// the longest increasing subsequence is the list of nodes that can remain in place. Imagine going
    		// from `1,2,3,4,5` to `4,5,1,2,3` where the numbers are not necessarily the keys, but the indices
    		// corresponding to the keyed nodes in the old list (keyed nodes `e,d,c,b,a` => `b,a,e,d,c` would
    		//  match the above lists, for example).
    		//
    		// In there are two increasing subsequences: `4,5` and `1,2,3`, the latter being the longest. We
    		// can update those nodes without moving them, and only call `insertNode` on `4` and `5`.
    		//
    		// @localvoid adapted the algo to also support node deletions and insertions (the `lis` is actually
    		// the longest increasing subsequence *of old nodes still present in the new list*).
    		//
    		// It is a general algorithm that is fireproof in all circumstances, but it requires the allocation
    		// and the construction of a `key => oldIndex` map, and three arrays (one with `newIndex => oldIndex`,
    		// the `LIS` and a temporary one to create the LIS).
    		//
    		// So we cheat where we can: if the tails of the lists are identical, they are guaranteed to be part of
    		// the LIS and can be updated without moving them.
    		//
    		// If two nodes are swapped, they are guaranteed not to be part of the LIS, and must be moved (with
    		// the exception of the last node if the list is fully reversed).
    		//
    		// ## Finding the next sibling.
    		//
    		// `updateNode()` and `createNode()` expect a nextSibling parameter to perform DOM operations.
    		// When the list is being traversed top-down, at any index, the DOM nodes up to the previous
    		// vnode reflect the content of the new list, whereas the rest of the DOM nodes reflect the old
    		// list. The next sibling must be looked for in the old list using `getNextSibling(... oldStart + 1 ...)`.
    		//
    		// In the other scenarios (swaps, upwards traversal, map-based diff),
    		// the new vnodes list is traversed upwards. The DOM nodes at the bottom of the list reflect the
    		// bottom part of the new vnodes list, and we can use the `v.dom`  value of the previous node
    		// as the next sibling (cached in the `nextSibling` variable).


    		// ## DOM node moves
    		//
    		// In most scenarios `updateNode()` and `createNode()` perform the DOM operations. However,
    		// this is not the case if the node moved (second and fourth part of the diff algo). We move
    		// the old DOM nodes before updateNode runs because it enables us to use the cached `nextSibling`
    		// variable rather than fetching it using `getNextSibling()`.
    		//
    		// The fourth part of the diff currently inserts nodes unconditionally, leading to issues
    		// like #1791 and #1999. We need to be smarter about those situations where adjascent old
    		// nodes remain together in the new list in a way that isn't covered by parts one and
    		// three of the diff algo.

    		function updateNodes(parent, old, vnodes, hooks, nextSibling, ns) {
    			if (old === vnodes || old == null && vnodes == null) return
    			else if (old == null || old.length === 0) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns);
    			else if (vnodes == null || vnodes.length === 0) removeNodes(parent, old, 0, old.length);
    			else {
    				var isOldKeyed = old[0] != null && old[0].key != null;
    				var isKeyed = vnodes[0] != null && vnodes[0].key != null;
    				var start = 0, oldStart = 0;
    				if (!isOldKeyed) while (oldStart < old.length && old[oldStart] == null) oldStart++;
    				if (!isKeyed) while (start < vnodes.length && vnodes[start] == null) start++;
    				if (isOldKeyed !== isKeyed) {
    					removeNodes(parent, old, oldStart, old.length);
    					createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
    				} else if (!isKeyed) {
    					// Don't index past the end of either list (causes deopts).
    					var commonLength = old.length < vnodes.length ? old.length : vnodes.length;
    					// Rewind if necessary to the first non-null index on either side.
    					// We could alternatively either explicitly create or remove nodes when `start !== oldStart`
    					// but that would be optimizing for sparse lists which are more rare than dense ones.
    					start = start < oldStart ? start : oldStart;
    					for (; start < commonLength; start++) {
    						o = old[start];
    						v = vnodes[start];
    						if (o === v || o == null && v == null) continue
    						else if (o == null) createNode(parent, v, hooks, ns, getNextSibling(old, start + 1, nextSibling));
    						else if (v == null) removeNode(parent, o);
    						else updateNode(parent, o, v, hooks, getNextSibling(old, start + 1, nextSibling), ns);
    					}
    					if (old.length > commonLength) removeNodes(parent, old, start, old.length);
    					if (vnodes.length > commonLength) createNodes(parent, vnodes, start, vnodes.length, hooks, nextSibling, ns);
    				} else {
    					// keyed diff
    					var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling;

    					// bottom-up
    					while (oldEnd >= oldStart && end >= start) {
    						oe = old[oldEnd];
    						ve = vnodes[end];
    						if (oe.key !== ve.key) break
    						if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
    						if (ve.dom != null) nextSibling = ve.dom;
    						oldEnd--, end--;
    					}
    					// top-down
    					while (oldEnd >= oldStart && end >= start) {
    						o = old[oldStart];
    						v = vnodes[start];
    						if (o.key !== v.key) break
    						oldStart++, start++;
    						if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns);
    					}
    					// swaps and list reversals
    					while (oldEnd >= oldStart && end >= start) {
    						if (start === end) break
    						if (o.key !== ve.key || oe.key !== v.key) break
    						topSibling = getNextSibling(old, oldStart, nextSibling);
    						moveNodes(parent, oe, topSibling);
    						if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns);
    						if (++start <= --end) moveNodes(parent, o, nextSibling);
    						if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns);
    						if (ve.dom != null) nextSibling = ve.dom;
    						oldStart++; oldEnd--;
    						oe = old[oldEnd];
    						ve = vnodes[end];
    						o = old[oldStart];
    						v = vnodes[start];
    					}
    					// bottom up once again
    					while (oldEnd >= oldStart && end >= start) {
    						if (oe.key !== ve.key) break
    						if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
    						if (ve.dom != null) nextSibling = ve.dom;
    						oldEnd--, end--;
    						oe = old[oldEnd];
    						ve = vnodes[end];
    					}
    					if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1);
    					else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
    					else {
    						// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
    						var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices;
    						for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1;
    						for (i = end; i >= start; i--) {
    							if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1);
    							ve = vnodes[i];
    							var oldIndex = map[ve.key];
    							if (oldIndex != null) {
    								pos = (oldIndex < pos) ? oldIndex : -1; // becomes -1 if nodes were re-ordered
    								oldIndices[i-start] = oldIndex;
    								oe = old[oldIndex];
    								old[oldIndex] = null;
    								if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns);
    								if (ve.dom != null) nextSibling = ve.dom;
    								matched++;
    							}
    						}
    						nextSibling = originalNextSibling;
    						if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1);
    						if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns);
    						else {
    							if (pos === -1) {
    								// the indices of the indices of the items that are part of the
    								// longest increasing subsequence in the oldIndices list
    								lisIndices = makeLisIndices(oldIndices);
    								li = lisIndices.length - 1;
    								for (i = end; i >= start; i--) {
    									v = vnodes[i];
    									if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling);
    									else {
    										if (lisIndices[li] === i - start) li--;
    										else moveNodes(parent, v, nextSibling);
    									}
    									if (v.dom != null) nextSibling = vnodes[i].dom;
    								}
    							} else {
    								for (i = end; i >= start; i--) {
    									v = vnodes[i];
    									if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling);
    									if (v.dom != null) nextSibling = vnodes[i].dom;
    								}
    							}
    						}
    					}
    				}
    			}
    		}
    		function updateNode(parent, old, vnode, hooks, nextSibling, ns) {
    			var oldTag = old.tag, tag = vnode.tag;
    			if (oldTag === tag) {
    				vnode.state = old.state;
    				vnode.events = old.events;
    				if (shouldNotUpdate(vnode, old)) return
    				if (typeof oldTag === "string") {
    					if (vnode.attrs != null) {
    						updateLifecycle(vnode.attrs, vnode, hooks);
    					}
    					switch (oldTag) {
    						case "#": updateText(old, vnode); break
    						case "<": updateHTML(parent, old, vnode, ns, nextSibling); break
    						case "[": updateFragment(parent, old, vnode, hooks, nextSibling, ns); break
    						default: updateElement(old, vnode, hooks, ns);
    					}
    				}
    				else updateComponent(parent, old, vnode, hooks, nextSibling, ns);
    			}
    			else {
    				removeNode(parent, old);
    				createNode(parent, vnode, hooks, ns, nextSibling);
    			}
    		}
    		function updateText(old, vnode) {
    			if (old.children.toString() !== vnode.children.toString()) {
    				old.dom.nodeValue = vnode.children;
    			}
    			vnode.dom = old.dom;
    		}
    		function updateHTML(parent, old, vnode, ns, nextSibling) {
    			if (old.children !== vnode.children) {
    				removeHTML(parent, old);
    				createHTML(parent, vnode, ns, nextSibling);
    			}
    			else {
    				vnode.dom = old.dom;
    				vnode.domSize = old.domSize;
    				vnode.instance = old.instance;
    			}
    		}
    		function updateFragment(parent, old, vnode, hooks, nextSibling, ns) {
    			updateNodes(parent, old.children, vnode.children, hooks, nextSibling, ns);
    			var domSize = 0, children = vnode.children;
    			vnode.dom = null;
    			if (children != null) {
    				for (var i = 0; i < children.length; i++) {
    					var child = children[i];
    					if (child != null && child.dom != null) {
    						if (vnode.dom == null) vnode.dom = child.dom;
    						domSize += child.domSize || 1;
    					}
    				}
    				if (domSize !== 1) vnode.domSize = domSize;
    			}
    		}
    		function updateElement(old, vnode, hooks, ns) {
    			var element = vnode.dom = old.dom;
    			ns = getNameSpace(vnode) || ns;

    			if (vnode.tag === "textarea") {
    				if (vnode.attrs == null) vnode.attrs = {};
    			}
    			updateAttrs(vnode, old.attrs, vnode.attrs, ns);
    			if (!maybeSetContentEditable(vnode)) {
    				updateNodes(element, old.children, vnode.children, hooks, null, ns);
    			}
    		}
    		function updateComponent(parent, old, vnode, hooks, nextSibling, ns) {
    			vnode.instance = Vnode.normalize(callHook.call(vnode.state.view, vnode));
    			if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
    			updateLifecycle(vnode.state, vnode, hooks);
    			if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks);
    			if (vnode.instance != null) {
    				if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling);
    				else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, ns);
    				vnode.dom = vnode.instance.dom;
    				vnode.domSize = vnode.instance.domSize;
    			}
    			else if (old.instance != null) {
    				removeNode(parent, old.instance);
    				vnode.dom = undefined;
    				vnode.domSize = 0;
    			}
    			else {
    				vnode.dom = old.dom;
    				vnode.domSize = old.domSize;
    			}
    		}
    		function getKeyMap(vnodes, start, end) {
    			var map = Object.create(null);
    			for (; start < end; start++) {
    				var vnode = vnodes[start];
    				if (vnode != null) {
    					var key = vnode.key;
    					if (key != null) map[key] = start;
    				}
    			}
    			return map
    		}
    		// Lifted from ivi https://github.com/ivijs/ivi/
    		// takes a list of unique numbers (-1 is special and can
    		// occur multiple times) and returns an array with the indices
    		// of the items that are part of the longest increasing
    		// subsequence
    		var lisTemp = [];
    		function makeLisIndices(a) {
    			var result = [0];
    			var u = 0, v = 0, i = 0;
    			var il = lisTemp.length = a.length;
    			for (var i = 0; i < il; i++) lisTemp[i] = a[i];
    			for (var i = 0; i < il; ++i) {
    				if (a[i] === -1) continue
    				var j = result[result.length - 1];
    				if (a[j] < a[i]) {
    					lisTemp[i] = j;
    					result.push(i);
    					continue
    				}
    				u = 0;
    				v = result.length - 1;
    				while (u < v) {
    					// Fast integer average without overflow.
    					// eslint-disable-next-line no-bitwise
    					var c = (u >>> 1) + (v >>> 1) + (u & v & 1);
    					if (a[result[c]] < a[i]) {
    						u = c + 1;
    					}
    					else {
    						v = c;
    					}
    				}
    				if (a[i] < a[result[u]]) {
    					if (u > 0) lisTemp[i] = result[u - 1];
    					result[u] = i;
    				}
    			}
    			u = result.length;
    			v = result[u - 1];
    			while (u-- > 0) {
    				result[u] = v;
    				v = lisTemp[v];
    			}
    			lisTemp.length = 0;
    			return result
    		}

    		function getNextSibling(vnodes, i, nextSibling) {
    			for (; i < vnodes.length; i++) {
    				if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
    			}
    			return nextSibling
    		}

    		// This covers a really specific edge case:
    		// - Parent node is keyed and contains child
    		// - Child is removed, returns unresolved promise in `onbeforeremove`
    		// - Parent node is moved in keyed diff
    		// - Remaining children still need moved appropriately
    		//
    		// Ideally, I'd track removed nodes as well, but that introduces a lot more
    		// complexity and I'm not exactly interested in doing that.
    		function moveNodes(parent, vnode, nextSibling) {
    			var frag = $doc.createDocumentFragment();
    			moveChildToFrag(parent, frag, vnode);
    			insertNode(parent, frag, nextSibling);
    		}
    		function moveChildToFrag(parent, frag, vnode) {
    			// Dodge the recursion overhead in a few of the most common cases.
    			while (vnode.dom != null && vnode.dom.parentNode === parent) {
    				if (typeof vnode.tag !== "string") {
    					vnode = vnode.instance;
    					if (vnode != null) continue
    				} else if (vnode.tag === "<") {
    					for (var i = 0; i < vnode.instance.length; i++) {
    						frag.appendChild(vnode.instance[i]);
    					}
    				} else if (vnode.tag !== "[") {
    					// Don't recurse for text nodes *or* elements, just fragments
    					frag.appendChild(vnode.dom);
    				} else if (vnode.children.length === 1) {
    					vnode = vnode.children[0];
    					if (vnode != null) continue
    				} else {
    					for (var i = 0; i < vnode.children.length; i++) {
    						var child = vnode.children[i];
    						if (child != null) moveChildToFrag(parent, frag, child);
    					}
    				}
    				break
    			}
    		}

    		function insertNode(parent, dom, nextSibling) {
    			if (nextSibling != null) parent.insertBefore(dom, nextSibling);
    			else parent.appendChild(dom);
    		}

    		function maybeSetContentEditable(vnode) {
    			if (vnode.attrs == null || (
    				vnode.attrs.contenteditable == null && // attribute
    				vnode.attrs.contentEditable == null // property
    			)) return false
    			var children = vnode.children;
    			if (children != null && children.length === 1 && children[0].tag === "<") {
    				var content = children[0].children;
    				if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content;
    			}
    			else if (children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted.")
    			return true
    		}

    		//remove
    		function removeNodes(parent, vnodes, start, end) {
    			for (var i = start; i < end; i++) {
    				var vnode = vnodes[i];
    				if (vnode != null) removeNode(parent, vnode);
    			}
    		}
    		function removeNode(parent, vnode) {
    			var mask = 0;
    			var original = vnode.state;
    			var stateResult, attrsResult;
    			if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeremove === "function") {
    				var result = callHook.call(vnode.state.onbeforeremove, vnode);
    				if (result != null && typeof result.then === "function") {
    					mask = 1;
    					stateResult = result;
    				}
    			}
    			if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
    				var result = callHook.call(vnode.attrs.onbeforeremove, vnode);
    				if (result != null && typeof result.then === "function") {
    					// eslint-disable-next-line no-bitwise
    					mask |= 2;
    					attrsResult = result;
    				}
    			}
    			checkState(vnode, original);

    			// If we can, try to fast-path it and avoid all the overhead of awaiting
    			if (!mask) {
    				onremove(vnode);
    				removeChild(parent, vnode);
    			} else {
    				if (stateResult != null) {
    					var next = function () {
    						// eslint-disable-next-line no-bitwise
    						if (mask & 1) { mask &= 2; if (!mask) reallyRemove(); }
    					};
    					stateResult.then(next, next);
    				}
    				if (attrsResult != null) {
    					var next = function () {
    						// eslint-disable-next-line no-bitwise
    						if (mask & 2) { mask &= 1; if (!mask) reallyRemove(); }
    					};
    					attrsResult.then(next, next);
    				}
    			}

    			function reallyRemove() {
    				checkState(vnode, original);
    				onremove(vnode);
    				removeChild(parent, vnode);
    			}
    		}
    		function removeHTML(parent, vnode) {
    			for (var i = 0; i < vnode.instance.length; i++) {
    				parent.removeChild(vnode.instance[i]);
    			}
    		}
    		function removeChild(parent, vnode) {
    			// Dodge the recursion overhead in a few of the most common cases.
    			while (vnode.dom != null && vnode.dom.parentNode === parent) {
    				if (typeof vnode.tag !== "string") {
    					vnode = vnode.instance;
    					if (vnode != null) continue
    				} else if (vnode.tag === "<") {
    					removeHTML(parent, vnode);
    				} else {
    					if (vnode.tag !== "[") {
    						parent.removeChild(vnode.dom);
    						if (!Array.isArray(vnode.children)) break
    					}
    					if (vnode.children.length === 1) {
    						vnode = vnode.children[0];
    						if (vnode != null) continue
    					} else {
    						for (var i = 0; i < vnode.children.length; i++) {
    							var child = vnode.children[i];
    							if (child != null) removeChild(parent, child);
    						}
    					}
    				}
    				break
    			}
    		}
    		function onremove(vnode) {
    			if (typeof vnode.tag !== "string" && typeof vnode.state.onremove === "function") callHook.call(vnode.state.onremove, vnode);
    			if (vnode.attrs && typeof vnode.attrs.onremove === "function") callHook.call(vnode.attrs.onremove, vnode);
    			if (typeof vnode.tag !== "string") {
    				if (vnode.instance != null) onremove(vnode.instance);
    			} else {
    				var children = vnode.children;
    				if (Array.isArray(children)) {
    					for (var i = 0; i < children.length; i++) {
    						var child = children[i];
    						if (child != null) onremove(child);
    					}
    				}
    			}
    		}

    		//attrs
    		function setAttrs(vnode, attrs, ns) {
    			// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
    			//
    			// Also, the DOM does things to inputs based on the value, so it needs set first.
    			// See: https://github.com/MithrilJS/mithril.js/issues/2622
    			if (vnode.tag === "input" && attrs.type != null) vnode.dom.setAttribute("type", attrs.type);
    			var isFileInput = attrs != null && vnode.tag === "input" && attrs.type === "file";
    			for (var key in attrs) {
    				setAttr(vnode, key, null, attrs[key], ns, isFileInput);
    			}
    		}
    		function setAttr(vnode, key, old, value, ns, isFileInput) {
    			if (key === "key" || key === "is" || value == null || isLifecycleMethod(key) || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object" || key === "type" && vnode.tag === "input") return
    			if (key[0] === "o" && key[1] === "n") return updateEvent(vnode, key, value)
    			if (key.slice(0, 6) === "xlink:") vnode.dom.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(6), value);
    			else if (key === "style") updateStyle(vnode.dom, old, value);
    			else if (hasPropertyKey(vnode, key, ns)) {
    				if (key === "value") {
    					// Only do the coercion if we're actually going to check the value.
    					/* eslint-disable no-implicit-coercion */
    					//setting input[value] to same value by typing on focused element moves cursor to end in Chrome
    					//setting input[type=file][value] to same value causes an error to be generated if it's non-empty
    					if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === "" + value && (isFileInput || vnode.dom === activeElement())) return
    					//setting select[value] to same value while having select open blinks select dropdown in Chrome
    					if (vnode.tag === "select" && old !== null && vnode.dom.value === "" + value) return
    					//setting option[value] to same value while having select open blinks select dropdown in Chrome
    					if (vnode.tag === "option" && old !== null && vnode.dom.value === "" + value) return
    					//setting input[type=file][value] to different value is an error if it's non-empty
    					// Not ideal, but it at least works around the most common source of uncaught exceptions for now.
    					if (isFileInput && "" + value !== "") { console.error("`value` is read-only on file inputs!"); return }
    					/* eslint-enable no-implicit-coercion */
    				}
    				vnode.dom[key] = value;
    			} else {
    				if (typeof value === "boolean") {
    					if (value) vnode.dom.setAttribute(key, "");
    					else vnode.dom.removeAttribute(key);
    				}
    				else vnode.dom.setAttribute(key === "className" ? "class" : key, value);
    			}
    		}
    		function removeAttr(vnode, key, old, ns) {
    			if (key === "key" || key === "is" || old == null || isLifecycleMethod(key)) return
    			if (key[0] === "o" && key[1] === "n") updateEvent(vnode, key, undefined);
    			else if (key === "style") updateStyle(vnode.dom, old, null);
    			else if (
    				hasPropertyKey(vnode, key, ns)
    				&& key !== "className"
    				&& key !== "title" // creates "null" as title
    				&& !(key === "value" && (
    					vnode.tag === "option"
    					|| vnode.tag === "select" && vnode.dom.selectedIndex === -1 && vnode.dom === activeElement()
    				))
    				&& !(vnode.tag === "input" && key === "type")
    			) {
    				vnode.dom[key] = null;
    			} else {
    				var nsLastIndex = key.indexOf(":");
    				if (nsLastIndex !== -1) key = key.slice(nsLastIndex + 1);
    				if (old !== false) vnode.dom.removeAttribute(key === "className" ? "class" : key);
    			}
    		}
    		function setLateSelectAttrs(vnode, attrs) {
    			if ("value" in attrs) {
    				if(attrs.value === null) {
    					if (vnode.dom.selectedIndex !== -1) vnode.dom.value = null;
    				} else {
    					var normalized = "" + attrs.value; // eslint-disable-line no-implicit-coercion
    					if (vnode.dom.value !== normalized || vnode.dom.selectedIndex === -1) {
    						vnode.dom.value = normalized;
    					}
    				}
    			}
    			if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined);
    		}
    		function updateAttrs(vnode, old, attrs, ns) {
    			if (old && old === attrs) {
    				console.warn("Don't reuse attrs object, use new object for every redraw, this will throw in next major");
    			}
    			if (attrs != null) {
    				// If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
    				//
    				// Also, the DOM does things to inputs based on the value, so it needs set first.
    				// See: https://github.com/MithrilJS/mithril.js/issues/2622
    				if (vnode.tag === "input" && attrs.type != null) vnode.dom.setAttribute("type", attrs.type);
    				var isFileInput = vnode.tag === "input" && attrs.type === "file";
    				for (var key in attrs) {
    					setAttr(vnode, key, old && old[key], attrs[key], ns, isFileInput);
    				}
    			}
    			var val;
    			if (old != null) {
    				for (var key in old) {
    					if (((val = old[key]) != null) && (attrs == null || attrs[key] == null)) {
    						removeAttr(vnode, key, val, ns);
    					}
    				}
    			}
    		}
    		function isFormAttribute(vnode, attr) {
    			return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === activeElement() || vnode.tag === "option" && vnode.dom.parentNode === $doc.activeElement
    		}
    		function isLifecycleMethod(attr) {
    			return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
    		}
    		function hasPropertyKey(vnode, key, ns) {
    			// Filter out namespaced keys
    			return ns === undefined && (
    				// If it's a custom element, just keep it.
    				vnode.tag.indexOf("-") > -1 || vnode.attrs != null && vnode.attrs.is ||
    				// If it's a normal element, let's try to avoid a few browser bugs.
    				key !== "href" && key !== "list" && key !== "form" && key !== "width" && key !== "height"// && key !== "type"
    				// Defer the property check until *after* we check everything.
    			) && key in vnode.dom
    		}

    		//style
    		var uppercaseRegex = /[A-Z]/g;
    		function toLowerCase(capital) { return "-" + capital.toLowerCase() }
    		function normalizeKey(key) {
    			return key[0] === "-" && key[1] === "-" ? key :
    				key === "cssFloat" ? "float" :
    					key.replace(uppercaseRegex, toLowerCase)
    		}
    		function updateStyle(element, old, style) {
    			if (old === style) ; else if (style == null) {
    				// New style is missing, just clear it.
    				element.style.cssText = "";
    			} else if (typeof style !== "object") {
    				// New style is a string, let engine deal with patching.
    				element.style.cssText = style;
    			} else if (old == null || typeof old !== "object") {
    				// `old` is missing or a string, `style` is an object.
    				element.style.cssText = "";
    				// Add new style properties
    				for (var key in style) {
    					var value = style[key];
    					if (value != null) element.style.setProperty(normalizeKey(key), String(value));
    				}
    			} else {
    				// Both old & new are (different) objects.
    				// Update style properties that have changed
    				for (var key in style) {
    					var value = style[key];
    					if (value != null && (value = String(value)) !== String(old[key])) {
    						element.style.setProperty(normalizeKey(key), value);
    					}
    				}
    				// Remove style properties that no longer exist
    				for (var key in old) {
    					if (old[key] != null && style[key] == null) {
    						element.style.removeProperty(normalizeKey(key));
    					}
    				}
    			}
    		}

    		// Here's an explanation of how this works:
    		// 1. The event names are always (by design) prefixed by `on`.
    		// 2. The EventListener interface accepts either a function or an object
    		//    with a `handleEvent` method.
    		// 3. The object does not inherit from `Object.prototype`, to avoid
    		//    any potential interference with that (e.g. setters).
    		// 4. The event name is remapped to the handler before calling it.
    		// 5. In function-based event handlers, `ev.target === this`. We replicate
    		//    that below.
    		// 6. In function-based event handlers, `return false` prevents the default
    		//    action and stops event propagation. We replicate that below.
    		function EventDict() {
    			// Save this, so the current redraw is correctly tracked.
    			this._ = currentRedraw;
    		}
    		EventDict.prototype = Object.create(null);
    		EventDict.prototype.handleEvent = function (ev) {
    			var handler = this["on" + ev.type];
    			var result;
    			if (typeof handler === "function") result = handler.call(ev.currentTarget, ev);
    			else if (typeof handler.handleEvent === "function") handler.handleEvent(ev);
    			if (this._ && ev.redraw !== false) (0, this._)();
    			if (result === false) {
    				ev.preventDefault();
    				ev.stopPropagation();
    			}
    		};

    		//event
    		function updateEvent(vnode, key, value) {
    			if (vnode.events != null) {
    				vnode.events._ = currentRedraw;
    				if (vnode.events[key] === value) return
    				if (value != null && (typeof value === "function" || typeof value === "object")) {
    					if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false);
    					vnode.events[key] = value;
    				} else {
    					if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false);
    					vnode.events[key] = undefined;
    				}
    			} else if (value != null && (typeof value === "function" || typeof value === "object")) {
    				vnode.events = new EventDict();
    				vnode.dom.addEventListener(key.slice(2), vnode.events, false);
    				vnode.events[key] = value;
    			}
    		}

    		//lifecycle
    		function initLifecycle(source, vnode, hooks) {
    			if (typeof source.oninit === "function") callHook.call(source.oninit, vnode);
    			if (typeof source.oncreate === "function") hooks.push(callHook.bind(source.oncreate, vnode));
    		}
    		function updateLifecycle(source, vnode, hooks) {
    			if (typeof source.onupdate === "function") hooks.push(callHook.bind(source.onupdate, vnode));
    		}
    		function shouldNotUpdate(vnode, old) {
    			do {
    				if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") {
    					var force = callHook.call(vnode.attrs.onbeforeupdate, vnode, old);
    					if (force !== undefined && !force) break
    				}
    				if (typeof vnode.tag !== "string" && typeof vnode.state.onbeforeupdate === "function") {
    					var force = callHook.call(vnode.state.onbeforeupdate, vnode, old);
    					if (force !== undefined && !force) break
    				}
    				return false
    			} while (false); // eslint-disable-line no-constant-condition
    			vnode.dom = old.dom;
    			vnode.domSize = old.domSize;
    			vnode.instance = old.instance;
    			// One would think having the actual latest attributes would be ideal,
    			// but it doesn't let us properly diff based on our current internal
    			// representation. We have to save not only the old DOM info, but also
    			// the attributes used to create it, as we diff *that*, not against the
    			// DOM directly (with a few exceptions in `setAttr`). And, of course, we
    			// need to save the children and text as they are conceptually not
    			// unlike special "attributes" internally.
    			vnode.attrs = old.attrs;
    			vnode.children = old.children;
    			vnode.text = old.text;
    			return true
    		}

    		var currentDOM;

    		return function(dom, vnodes, redraw) {
    			if (!dom) throw new TypeError("DOM element being rendered to does not exist.")
    			if (currentDOM != null && dom.contains(currentDOM)) {
    				throw new TypeError("Node is currently being rendered to and thus is locked.")
    			}
    			var prevRedraw = currentRedraw;
    			var prevDOM = currentDOM;
    			var hooks = [];
    			var active = activeElement();
    			var namespace = dom.namespaceURI;

    			currentDOM = dom;
    			currentRedraw = typeof redraw === "function" ? redraw : undefined;
    			try {
    				// First time rendering into a node clears it out
    				if (dom.vnodes == null) dom.textContent = "";
    				vnodes = Vnode.normalizeChildren(Array.isArray(vnodes) ? vnodes : [vnodes]);
    				updateNodes(dom, dom.vnodes, vnodes, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace);
    				dom.vnodes = vnodes;
    				// `document.activeElement` can return null: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-activeelement
    				if (active != null && activeElement() !== active && typeof active.focus === "function") active.focus();
    				for (var i = 0; i < hooks.length; i++) hooks[i]();
    			} finally {
    				currentRedraw = prevRedraw;
    				currentDOM = prevDOM;
    			}
    		}
    	};
    	return render$2;
    }

    var render$1 = requireRender()(typeof window !== "undefined" ? window : null);

    var Vnode = requireVnode();

    var mountRedraw$3 = function(render, schedule, console) {
    	var subscriptions = [];
    	var pending = false;
    	var offset = -1;

    	function sync() {
    		for (offset = 0; offset < subscriptions.length; offset += 2) {
    			try { render(subscriptions[offset], Vnode(subscriptions[offset + 1]), redraw); }
    			catch (e) { console.error(e); }
    		}
    		offset = -1;
    	}

    	function redraw() {
    		if (!pending) {
    			pending = true;
    			schedule(function() {
    				pending = false;
    				sync();
    			});
    		}
    	}

    	redraw.sync = sync;

    	function mount(root, component) {
    		if (component != null && component.view == null && typeof component !== "function") {
    			throw new TypeError("m.mount expects a component, not a vnode.")
    		}

    		var index = subscriptions.indexOf(root);
    		if (index >= 0) {
    			subscriptions.splice(index, 2);
    			if (index <= offset) offset -= 2;
    			render(root, []);
    		}

    		if (component != null) {
    			subscriptions.push(root, component);
    			render(root, Vnode(component), redraw);
    		}
    	}

    	return {mount: mount, redraw: redraw}
    };

    var render = render$1;

    var mountRedraw$2 = mountRedraw$3(render, typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : null, typeof console !== "undefined" ? console : null);

    var build$1;
    var hasRequiredBuild$1;

    function requireBuild$1 () {
    	if (hasRequiredBuild$1) return build$1;
    	hasRequiredBuild$1 = 1;

    	build$1 = function(object) {
    		if (Object.prototype.toString.call(object) !== "[object Object]") return ""

    		var args = [];
    		for (var key in object) {
    			destructure(key, object[key]);
    		}

    		return args.join("&")

    		function destructure(key, value) {
    			if (Array.isArray(value)) {
    				for (var i = 0; i < value.length; i++) {
    					destructure(key + "[" + i + "]", value[i]);
    				}
    			}
    			else if (Object.prototype.toString.call(value) === "[object Object]") {
    				for (var i in value) {
    					destructure(key + "[" + i + "]", value[i]);
    				}
    			}
    			else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""));
    		}
    	};
    	return build$1;
    }

    var assign;
    var hasRequiredAssign;

    function requireAssign () {
    	if (hasRequiredAssign) return assign;
    	hasRequiredAssign = 1;

    	var hasOwn = hasOwn$2;

    	assign = Object.assign || function(target, source) {
    		for (var key in source) {
    			if (hasOwn.call(source, key)) target[key] = source[key];
    		}
    	};
    	return assign;
    }

    var build;
    var hasRequiredBuild;

    function requireBuild () {
    	if (hasRequiredBuild) return build;
    	hasRequiredBuild = 1;

    	var buildQueryString = requireBuild$1();
    	var assign = requireAssign();

    	// Returns `path` from `template` + `params`
    	build = function(template, params) {
    		if ((/:([^\/\.-]+)(\.{3})?:/).test(template)) {
    			throw new SyntaxError("Template parameter names must be separated by either a '/', '-', or '.'.")
    		}
    		if (params == null) return template
    		var queryIndex = template.indexOf("?");
    		var hashIndex = template.indexOf("#");
    		var queryEnd = hashIndex < 0 ? template.length : hashIndex;
    		var pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
    		var path = template.slice(0, pathEnd);
    		var query = {};

    		assign(query, params);

    		var resolved = path.replace(/:([^\/\.-]+)(\.{3})?/g, function(m, key, variadic) {
    			delete query[key];
    			// If no such parameter exists, don't interpolate it.
    			if (params[key] == null) return m
    			// Escape normal parameters, but not variadic ones.
    			return variadic ? params[key] : encodeURIComponent(String(params[key]))
    		});

    		// In case the template substitution adds new query/hash parameters.
    		var newQueryIndex = resolved.indexOf("?");
    		var newHashIndex = resolved.indexOf("#");
    		var newQueryEnd = newHashIndex < 0 ? resolved.length : newHashIndex;
    		var newPathEnd = newQueryIndex < 0 ? newQueryEnd : newQueryIndex;
    		var result = resolved.slice(0, newPathEnd);

    		if (queryIndex >= 0) result += template.slice(queryIndex, queryEnd);
    		if (newQueryIndex >= 0) result += (queryIndex < 0 ? "?" : "&") + resolved.slice(newQueryIndex, newQueryEnd);
    		var querystring = buildQueryString(query);
    		if (querystring) result += (queryIndex < 0 && newQueryIndex < 0 ? "?" : "&") + querystring;
    		if (hashIndex >= 0) result += template.slice(hashIndex);
    		if (newHashIndex >= 0) result += (hashIndex < 0 ? "" : "&") + resolved.slice(newHashIndex);
    		return result
    	};
    	return build;
    }

    var buildPathname = requireBuild();
    var hasOwn = hasOwn$2;

    var request$2 = function($window, Promise, oncompletion) {
    	var callbackCount = 0;

    	function PromiseProxy(executor) {
    		return new Promise(executor)
    	}

    	// In case the global Promise is some userland library's where they rely on
    	// `foo instanceof this.constructor`, `this.constructor.resolve(value)`, or
    	// similar. Let's *not* break them.
    	PromiseProxy.prototype = Promise.prototype;
    	PromiseProxy.__proto__ = Promise; // eslint-disable-line no-proto

    	function makeRequest(factory) {
    		return function(url, args) {
    			if (typeof url !== "string") { args = url; url = url.url; }
    			else if (args == null) args = {};
    			var promise = new Promise(function(resolve, reject) {
    				factory(buildPathname(url, args.params), args, function (data) {
    					if (typeof args.type === "function") {
    						if (Array.isArray(data)) {
    							for (var i = 0; i < data.length; i++) {
    								data[i] = new args.type(data[i]);
    							}
    						}
    						else data = new args.type(data);
    					}
    					resolve(data);
    				}, reject);
    			});
    			if (args.background === true) return promise
    			var count = 0;
    			function complete() {
    				if (--count === 0 && typeof oncompletion === "function") oncompletion();
    			}

    			return wrap(promise)

    			function wrap(promise) {
    				var then = promise.then;
    				// Set the constructor, so engines know to not await or resolve
    				// this as a native promise. At the time of writing, this is
    				// only necessary for V8, but their behavior is the correct
    				// behavior per spec. See this spec issue for more details:
    				// https://github.com/tc39/ecma262/issues/1577. Also, see the
    				// corresponding comment in `request/tests/test-request.js` for
    				// a bit more background on the issue at hand.
    				promise.constructor = PromiseProxy;
    				promise.then = function() {
    					count++;
    					var next = then.apply(promise, arguments);
    					next.then(complete, function(e) {
    						complete();
    						if (count === 0) throw e
    					});
    					return wrap(next)
    				};
    				return promise
    			}
    		}
    	}

    	function hasHeader(args, name) {
    		for (var key in args.headers) {
    			if (hasOwn.call(args.headers, key) && key.toLowerCase() === name) return true
    		}
    		return false
    	}

    	return {
    		request: makeRequest(function(url, args, resolve, reject) {
    			var method = args.method != null ? args.method.toUpperCase() : "GET";
    			var body = args.body;
    			var assumeJSON = (args.serialize == null || args.serialize === JSON.serialize) && !(body instanceof $window.FormData || body instanceof $window.URLSearchParams);
    			var responseType = args.responseType || (typeof args.extract === "function" ? "" : "json");

    			var xhr = new $window.XMLHttpRequest(), aborted = false, isTimeout = false;
    			var original = xhr, replacedAbort;
    			var abort = xhr.abort;

    			xhr.abort = function() {
    				aborted = true;
    				abort.call(this);
    			};

    			xhr.open(method, url, args.async !== false, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined);

    			if (assumeJSON && body != null && !hasHeader(args, "content-type")) {
    				xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    			}
    			if (typeof args.deserialize !== "function" && !hasHeader(args, "accept")) {
    				xhr.setRequestHeader("Accept", "application/json, text/*");
    			}
    			if (args.withCredentials) xhr.withCredentials = args.withCredentials;
    			if (args.timeout) xhr.timeout = args.timeout;
    			xhr.responseType = responseType;

    			for (var key in args.headers) {
    				if (hasOwn.call(args.headers, key)) {
    					xhr.setRequestHeader(key, args.headers[key]);
    				}
    			}

    			xhr.onreadystatechange = function(ev) {
    				// Don't throw errors on xhr.abort().
    				if (aborted) return

    				if (ev.target.readyState === 4) {
    					try {
    						var success = (ev.target.status >= 200 && ev.target.status < 300) || ev.target.status === 304 || (/^file:\/\//i).test(url);
    						// When the response type isn't "" or "text",
    						// `xhr.responseText` is the wrong thing to use.
    						// Browsers do the right thing and throw here, and we
    						// should honor that and do the right thing by
    						// preferring `xhr.response` where possible/practical.
    						var response = ev.target.response, message;

    						if (responseType === "json") {
    							// For IE and Edge, which don't implement
    							// `responseType: "json"`.
    							if (!ev.target.responseType && typeof args.extract !== "function") {
    								// Handle no-content which will not parse.
    								try { response = JSON.parse(ev.target.responseText); }
    								catch (e) { response = null; }
    							}
    						} else if (!responseType || responseType === "text") {
    							// Only use this default if it's text. If a parsed
    							// document is needed on old IE and friends (all
    							// unsupported), the user should use a custom
    							// `config` instead. They're already using this at
    							// their own risk.
    							if (response == null) response = ev.target.responseText;
    						}

    						if (typeof args.extract === "function") {
    							response = args.extract(ev.target, args);
    							success = true;
    						} else if (typeof args.deserialize === "function") {
    							response = args.deserialize(response);
    						}
    						if (success) resolve(response);
    						else {
    							var completeErrorResponse = function() {
    								try { message = ev.target.responseText; }
    								catch (e) { message = response; }
    								var error = new Error(message);
    								error.code = ev.target.status;
    								error.response = response;
    								reject(error);
    							};

    							if (xhr.status === 0) {
    								// Use setTimeout to push this code block onto the event queue
    								// This allows `xhr.ontimeout` to run in the case that there is a timeout
    								// Without this setTimeout, `xhr.ontimeout` doesn't have a chance to reject
    								// as `xhr.onreadystatechange` will run before it
    								setTimeout(function() {
    									if (isTimeout) return
    									completeErrorResponse();
    								});
    							} else completeErrorResponse();
    						}
    					}
    					catch (e) {
    						reject(e);
    					}
    				}
    			};

    			xhr.ontimeout = function (ev) {
    				isTimeout = true;
    				var error = new Error("Request timed out");
    				error.code = ev.target.status;
    				reject(error);
    			};

    			if (typeof args.config === "function") {
    				xhr = args.config(xhr, args, url) || xhr;

    				// Propagate the `abort` to any replacement XHR as well.
    				if (xhr !== original) {
    					replacedAbort = xhr.abort;
    					xhr.abort = function() {
    						aborted = true;
    						replacedAbort.call(this);
    					};
    				}
    			}

    			if (body == null) xhr.send();
    			else if (typeof args.serialize === "function") xhr.send(args.serialize(body));
    			else if (body instanceof $window.FormData || body instanceof $window.URLSearchParams) xhr.send(body);
    			else xhr.send(JSON.stringify(body));
    		}),
    		jsonp: makeRequest(function(url, args, resolve, reject) {
    			var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++;
    			var script = $window.document.createElement("script");
    			$window[callbackName] = function(data) {
    				delete $window[callbackName];
    				script.parentNode.removeChild(script);
    				resolve(data);
    			};
    			script.onerror = function() {
    				delete $window[callbackName];
    				script.parentNode.removeChild(script);
    				reject(new Error("JSONP request failed"));
    			};
    			script.src = url + (url.indexOf("?") < 0 ? "?" : "&") +
    				encodeURIComponent(args.callbackKey || "callback") + "=" +
    				encodeURIComponent(callbackName);
    			$window.document.documentElement.appendChild(script);
    		}),
    	}
    };

    var PromisePolyfill = promise.exports;
    var mountRedraw$1 = mountRedraw$2;

    var request$1 = request$2(typeof window !== "undefined" ? window : null, PromisePolyfill, mountRedraw$1.redraw);

    var parse$1;
    var hasRequiredParse$1;

    function requireParse$1 () {
    	if (hasRequiredParse$1) return parse$1;
    	hasRequiredParse$1 = 1;

    	function decodeURIComponentSave(str) {
    		try {
    			return decodeURIComponent(str)
    		} catch(err) {
    			return str
    		}
    	}

    	parse$1 = function(string) {
    		if (string === "" || string == null) return {}
    		if (string.charAt(0) === "?") string = string.slice(1);

    		var entries = string.split("&"), counters = {}, data = {};
    		for (var i = 0; i < entries.length; i++) {
    			var entry = entries[i].split("=");
    			var key = decodeURIComponentSave(entry[0]);
    			var value = entry.length === 2 ? decodeURIComponentSave(entry[1]) : "";

    			if (value === "true") value = true;
    			else if (value === "false") value = false;

    			var levels = key.split(/\]\[?|\[/);
    			var cursor = data;
    			if (key.indexOf("[") > -1) levels.pop();
    			for (var j = 0; j < levels.length; j++) {
    				var level = levels[j], nextLevel = levels[j + 1];
    				var isNumber = nextLevel == "" || !isNaN(parseInt(nextLevel, 10));
    				if (level === "") {
    					var key = levels.slice(0, j).join();
    					if (counters[key] == null) {
    						counters[key] = Array.isArray(cursor) ? cursor.length : 0;
    					}
    					level = counters[key]++;
    				}
    				// Disallow direct prototype pollution
    				else if (level === "__proto__") break
    				if (j === levels.length - 1) cursor[level] = value;
    				else {
    					// Read own properties exclusively to disallow indirect
    					// prototype pollution
    					var desc = Object.getOwnPropertyDescriptor(cursor, level);
    					if (desc != null) desc = desc.value;
    					if (desc == null) cursor[level] = desc = isNumber ? [] : {};
    					cursor = desc;
    				}
    			}
    		}
    		return data
    	};
    	return parse$1;
    }

    var parse;
    var hasRequiredParse;

    function requireParse () {
    	if (hasRequiredParse) return parse;
    	hasRequiredParse = 1;

    	var parseQueryString = requireParse$1();

    	// Returns `{path, params}` from `url`
    	parse = function(url) {
    		var queryIndex = url.indexOf("?");
    		var hashIndex = url.indexOf("#");
    		var queryEnd = hashIndex < 0 ? url.length : hashIndex;
    		var pathEnd = queryIndex < 0 ? queryEnd : queryIndex;
    		var path = url.slice(0, pathEnd).replace(/\/{2,}/g, "/");

    		if (!path) path = "/";
    		else {
    			if (path[0] !== "/") path = "/" + path;
    			if (path.length > 1 && path[path.length - 1] === "/") path = path.slice(0, -1);
    		}
    		return {
    			path: path,
    			params: queryIndex < 0
    				? {}
    				: parseQueryString(url.slice(queryIndex + 1, queryEnd)),
    		}
    	};
    	return parse;
    }

    var compileTemplate;
    var hasRequiredCompileTemplate;

    function requireCompileTemplate () {
    	if (hasRequiredCompileTemplate) return compileTemplate;
    	hasRequiredCompileTemplate = 1;

    	var parsePathname = requireParse();

    	// Compiles a template into a function that takes a resolved path (without query
    	// strings) and returns an object containing the template parameters with their
    	// parsed values. This expects the input of the compiled template to be the
    	// output of `parsePathname`. Note that it does *not* remove query parameters
    	// specified in the template.
    	compileTemplate = function(template) {
    		var templateData = parsePathname(template);
    		var templateKeys = Object.keys(templateData.params);
    		var keys = [];
    		var regexp = new RegExp("^" + templateData.path.replace(
    			// I escape literal text so people can use things like `:file.:ext` or
    			// `:lang-:locale` in routes. This is all merged into one pass so I
    			// don't also accidentally escape `-` and make it harder to detect it to
    			// ban it from template parameters.
    			/:([^\/.-]+)(\.{3}|\.(?!\.)|-)?|[\\^$*+.()|\[\]{}]/g,
    			function(m, key, extra) {
    				if (key == null) return "\\" + m
    				keys.push({k: key, r: extra === "..."});
    				if (extra === "...") return "(.*)"
    				if (extra === ".") return "([^/]+)\\."
    				return "([^/]+)" + (extra || "")
    			}
    		) + "$");
    		return function(data) {
    			// First, check the params. Usually, there isn't any, and it's just
    			// checking a static set.
    			for (var i = 0; i < templateKeys.length; i++) {
    				if (templateData.params[templateKeys[i]] !== data.params[templateKeys[i]]) return false
    			}
    			// If no interpolations exist, let's skip all the ceremony
    			if (!keys.length) return regexp.test(data.path)
    			var values = regexp.exec(data.path);
    			if (values == null) return false
    			for (var i = 0; i < keys.length; i++) {
    				data.params[keys[i].k] = keys[i].r ? values[i + 1] : decodeURIComponent(values[i + 1]);
    			}
    			return true
    		}
    	};
    	return compileTemplate;
    }

    var censor;
    var hasRequiredCensor;

    function requireCensor () {
    	if (hasRequiredCensor) return censor;
    	hasRequiredCensor = 1;

    	// Note: this is mildly perf-sensitive.
    	//
    	// It does *not* use `delete` - dynamic `delete`s usually cause objects to bail
    	// out into dictionary mode and just generally cause a bunch of optimization
    	// issues within engines.
    	//
    	// Ideally, I would've preferred to do this, if it weren't for the optimization
    	// issues:
    	//
    	// ```js
    	// const hasOwn = require("./hasOwn")
    	// const magic = [
    	//     "key", "oninit", "oncreate", "onbeforeupdate", "onupdate",
    	//     "onbeforeremove", "onremove",
    	// ]
    	// module.exports = (attrs, extras) => {
    	//     const result = Object.assign(Object.create(null), attrs)
    	//     for (const key of magic) delete result[key]
    	//     if (extras != null) for (const key of extras) delete result[key]
    	//     return result
    	// }
    	// ```

    	var hasOwn = hasOwn$2;
    	// Words in RegExp literals are sometimes mangled incorrectly by the internal bundler, so use RegExp().
    	var magic = new RegExp("^(?:key|oninit|oncreate|onbeforeupdate|onupdate|onbeforeremove|onremove)$");

    	censor = function(attrs, extras) {
    		var result = {};

    		if (extras != null) {
    			for (var key in attrs) {
    				if (hasOwn.call(attrs, key) && !magic.test(key) && extras.indexOf(key) < 0) {
    					result[key] = attrs[key];
    				}
    			}
    		} else {
    			for (var key in attrs) {
    				if (hasOwn.call(attrs, key) && !magic.test(key)) {
    					result[key] = attrs[key];
    				}
    			}
    		}

    		return result
    	};
    	return censor;
    }

    var router;
    var hasRequiredRouter;

    function requireRouter () {
    	if (hasRequiredRouter) return router;
    	hasRequiredRouter = 1;

    	var Vnode = requireVnode();
    	var m = hyperscript_1$1;
    	var Promise = promise.exports;

    	var buildPathname = requireBuild();
    	var parsePathname = requireParse();
    	var compileTemplate = requireCompileTemplate();
    	var assign = requireAssign();
    	var censor = requireCensor();

    	var sentinel = {};

    	function decodeURIComponentSave(component) {
    		try {
    			return decodeURIComponent(component)
    		} catch(e) {
    			return component
    		}
    	}

    	router = function($window, mountRedraw) {
    		var callAsync = $window == null
    			// In case Mithril.js' loaded globally without the DOM, let's not break
    			? null
    			: typeof $window.setImmediate === "function" ? $window.setImmediate : $window.setTimeout;
    		var p = Promise.resolve();

    		var scheduled = false;

    		// state === 0: init
    		// state === 1: scheduled
    		// state === 2: done
    		var ready = false;
    		var state = 0;

    		var compiled, fallbackRoute;

    		var currentResolver = sentinel, component, attrs, currentPath, lastUpdate;

    		var RouterRoot = {
    			onbeforeupdate: function() {
    				state = state ? 2 : 1;
    				return !(!state || sentinel === currentResolver)
    			},
    			onremove: function() {
    				$window.removeEventListener("popstate", fireAsync, false);
    				$window.removeEventListener("hashchange", resolveRoute, false);
    			},
    			view: function() {
    				if (!state || sentinel === currentResolver) return
    				// Wrap in a fragment to preserve existing key semantics
    				var vnode = [Vnode(component, attrs.key, attrs)];
    				if (currentResolver) vnode = currentResolver.render(vnode[0]);
    				return vnode
    			},
    		};

    		var SKIP = route.SKIP = {};

    		function resolveRoute() {
    			scheduled = false;
    			// Consider the pathname holistically. The prefix might even be invalid,
    			// but that's not our problem.
    			var prefix = $window.location.hash;
    			if (route.prefix[0] !== "#") {
    				prefix = $window.location.search + prefix;
    				if (route.prefix[0] !== "?") {
    					prefix = $window.location.pathname + prefix;
    					if (prefix[0] !== "/") prefix = "/" + prefix;
    				}
    			}
    			// This seemingly useless `.concat()` speeds up the tests quite a bit,
    			// since the representation is consistently a relatively poorly
    			// optimized cons string.
    			var path = prefix.concat()
    				.replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponentSave)
    				.slice(route.prefix.length);
    			var data = parsePathname(path);

    			assign(data.params, $window.history.state);

    			function reject(e) {
    				console.error(e);
    				setPath(fallbackRoute, null, {replace: true});
    			}

    			loop(0);
    			function loop(i) {
    				// state === 0: init
    				// state === 1: scheduled
    				// state === 2: done
    				for (; i < compiled.length; i++) {
    					if (compiled[i].check(data)) {
    						var payload = compiled[i].component;
    						var matchedRoute = compiled[i].route;
    						var localComp = payload;
    						var update = lastUpdate = function(comp) {
    							if (update !== lastUpdate) return
    							if (comp === SKIP) return loop(i + 1)
    							component = comp != null && (typeof comp.view === "function" || typeof comp === "function")? comp : "div";
    							attrs = data.params, currentPath = path, lastUpdate = null;
    							currentResolver = payload.render ? payload : null;
    							if (state === 2) mountRedraw.redraw();
    							else {
    								state = 2;
    								mountRedraw.redraw.sync();
    							}
    						};
    						// There's no understating how much I *wish* I could
    						// use `async`/`await` here...
    						if (payload.view || typeof payload === "function") {
    							payload = {};
    							update(localComp);
    						}
    						else if (payload.onmatch) {
    							p.then(function () {
    								return payload.onmatch(data.params, path, matchedRoute)
    							}).then(update, path === fallbackRoute ? null : reject);
    						}
    						else update("div");
    						return
    					}
    				}

    				if (path === fallbackRoute) {
    					throw new Error("Could not resolve default route " + fallbackRoute + ".")
    				}
    				setPath(fallbackRoute, null, {replace: true});
    			}
    		}

    		// Set it unconditionally so `m.route.set` and `m.route.Link` both work,
    		// even if neither `pushState` nor `hashchange` are supported. It's
    		// cleared if `hashchange` is used, since that makes it automatically
    		// async.
    		function fireAsync() {
    			if (!scheduled) {
    				scheduled = true;
    				// TODO: just do `mountRedraw.redraw()` here and elide the timer
    				// dependency. Note that this will muck with tests a *lot*, so it's
    				// not as easy of a change as it sounds.
    				callAsync(resolveRoute);
    			}
    		}

    		function setPath(path, data, options) {
    			path = buildPathname(path, data);
    			if (ready) {
    				fireAsync();
    				var state = options ? options.state : null;
    				var title = options ? options.title : null;
    				if (options && options.replace) $window.history.replaceState(state, title, route.prefix + path);
    				else $window.history.pushState(state, title, route.prefix + path);
    			}
    			else {
    				$window.location.href = route.prefix + path;
    			}
    		}

    		function route(root, defaultRoute, routes) {
    			if (!root) throw new TypeError("DOM element being rendered to does not exist.")

    			compiled = Object.keys(routes).map(function(route) {
    				if (route[0] !== "/") throw new SyntaxError("Routes must start with a '/'.")
    				if ((/:([^\/\.-]+)(\.{3})?:/).test(route)) {
    					throw new SyntaxError("Route parameter names must be separated with either '/', '.', or '-'.")
    				}
    				return {
    					route: route,
    					component: routes[route],
    					check: compileTemplate(route),
    				}
    			});
    			fallbackRoute = defaultRoute;
    			if (defaultRoute != null) {
    				var defaultData = parsePathname(defaultRoute);

    				if (!compiled.some(function (i) { return i.check(defaultData) })) {
    					throw new ReferenceError("Default route doesn't match any known routes.")
    				}
    			}

    			if (typeof $window.history.pushState === "function") {
    				$window.addEventListener("popstate", fireAsync, false);
    			} else if (route.prefix[0] === "#") {
    				$window.addEventListener("hashchange", resolveRoute, false);
    			}

    			ready = true;
    			mountRedraw.mount(root, RouterRoot);
    			resolveRoute();
    		}
    		route.set = function(path, data, options) {
    			if (lastUpdate != null) {
    				options = options || {};
    				options.replace = true;
    			}
    			lastUpdate = null;
    			setPath(path, data, options);
    		};
    		route.get = function() {return currentPath};
    		route.prefix = "#!";
    		route.Link = {
    			view: function(vnode) {
    				// Omit the used parameters from the rendered element - they are
    				// internal. Also, censor the various lifecycle methods.
    				//
    				// We don't strip the other parameters because for convenience we
    				// let them be specified in the selector as well.
    				var child = m(
    					vnode.attrs.selector || "a",
    					censor(vnode.attrs, ["options", "params", "selector", "onclick"]),
    					vnode.children
    				);
    				var options, onclick, href;

    				// Let's provide a *right* way to disable a route link, rather than
    				// letting people screw up accessibility on accident.
    				//
    				// The attribute is coerced so users don't get surprised over
    				// `disabled: 0` resulting in a button that's somehow routable
    				// despite being visibly disabled.
    				if (child.attrs.disabled = Boolean(child.attrs.disabled)) {
    					child.attrs.href = null;
    					child.attrs["aria-disabled"] = "true";
    					// If you *really* do want add `onclick` on a disabled link, use
    					// an `oncreate` hook to add it.
    				} else {
    					options = vnode.attrs.options;
    					onclick = vnode.attrs.onclick;
    					// Easier to build it now to keep it isomorphic.
    					href = buildPathname(child.attrs.href, vnode.attrs.params);
    					child.attrs.href = route.prefix + href;
    					child.attrs.onclick = function(e) {
    						var result;
    						if (typeof onclick === "function") {
    							result = onclick.call(e.currentTarget, e);
    						} else if (onclick == null || typeof onclick !== "object") ; else if (typeof onclick.handleEvent === "function") {
    							onclick.handleEvent(e);
    						}

    						// Adapted from React Router's implementation:
    						// https://github.com/ReactTraining/react-router/blob/520a0acd48ae1b066eb0b07d6d4d1790a1d02482/packages/react-router-dom/modules/Link.js
    						//
    						// Try to be flexible and intuitive in how we handle links.
    						// Fun fact: links aren't as obvious to get right as you
    						// would expect. There's a lot more valid ways to click a
    						// link than this, and one might want to not simply click a
    						// link, but right click or command-click it to copy the
    						// link target, etc. Nope, this isn't just for blind people.
    						if (
    							// Skip if `onclick` prevented default
    							result !== false && !e.defaultPrevented &&
    							// Ignore everything but left clicks
    							(e.button === 0 || e.which === 0 || e.which === 1) &&
    							// Let the browser handle `target=_blank`, etc.
    							(!e.currentTarget.target || e.currentTarget.target === "_self") &&
    							// No modifier keys
    							!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
    						) {
    							e.preventDefault();
    							e.redraw = false;
    							route.set(href, null, options);
    						}
    					};
    				}
    				return child
    			},
    		};
    		route.param = function(key) {
    			return attrs && key != null ? attrs[key] : attrs
    		};

    		return route
    	};
    	return router;
    }

    var route;
    var hasRequiredRoute;

    function requireRoute () {
    	if (hasRequiredRoute) return route;
    	hasRequiredRoute = 1;

    	var mountRedraw = mountRedraw$2;

    	route = requireRouter()(typeof window !== "undefined" ? window : null, mountRedraw);
    	return route;
    }

    var hyperscript = hyperscript_1;
    var request = request$1;
    var mountRedraw = mountRedraw$2;

    var m = function m() { return hyperscript.apply(this, arguments) };
    m.m = hyperscript;
    m.trust = hyperscript.trust;
    m.fragment = hyperscript.fragment;
    m.Fragment = "[";
    m.mount = mountRedraw.mount;
    m.route = requireRoute();
    m.render = render$1;
    m.redraw = mountRedraw.redraw;
    m.request = request.request;
    m.jsonp = request.jsonp;
    m.parseQueryString = requireParse$1();
    m.buildQueryString = requireBuild$1();
    m.parsePathname = requireParse();
    m.buildPathname = requireBuild();
    m.vnode = requireVnode();
    m.PromisePolyfill = requirePolyfill();
    m.censor = requireCensor();

    var mithril = m;

    var global$1 = (typeof global !== "undefined" ? global :
      typeof self !== "undefined" ? self :
      typeof window !== "undefined" ? window : {});

    // shim for using process in browser
    // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    var cachedSetTimeout = defaultSetTimout;
    var cachedClearTimeout = defaultClearTimeout;
    if (typeof global$1.setTimeout === 'function') {
        cachedSetTimeout = setTimeout;
    }
    if (typeof global$1.clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout;
    }

    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }


    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }



    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }

    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    function nextTick(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    }
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    var title = 'browser';
    var platform = 'browser';
    var browser = true;
    var env = {};
    var argv = [];
    var version = ''; // empty string to avoid regexp issues
    var versions = {};
    var release = {};
    var config = {};

    function noop() {}

    var on = noop;
    var addListener = noop;
    var once = noop;
    var off = noop;
    var removeListener = noop;
    var removeAllListeners = noop;
    var emit = noop;

    function binding(name) {
        throw new Error('process.binding is not supported');
    }

    function cwd () { return '/' }
    function chdir (dir) {
        throw new Error('process.chdir is not supported');
    }function umask() { return 0; }

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance$1 = global$1.performance || {};
    var performanceNow =
      performance$1.now        ||
      performance$1.mozNow     ||
      performance$1.msNow      ||
      performance$1.oNow       ||
      performance$1.webkitNow  ||
      function(){ return (new Date()).getTime() };

    // generate timestamp or delta
    // see http://nodejs.org/api/process.html#process_process_hrtime
    function hrtime(previousTimestamp){
      var clocktime = performanceNow.call(performance$1)*1e-3;
      var seconds = Math.floor(clocktime);
      var nanoseconds = Math.floor((clocktime%1)*1e9);
      if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds<0) {
          seconds--;
          nanoseconds += 1e9;
        }
      }
      return [seconds,nanoseconds]
    }

    var startTime = new Date();
    function uptime() {
      var currentTime = new Date();
      var dif = currentTime - startTime;
      return dif / 1000;
    }

    var browser$1 = {
      nextTick: nextTick,
      title: title,
      browser: browser,
      env: env,
      argv: argv,
      version: version,
      versions: versions,
      on: on,
      addListener: addListener,
      once: once,
      off: off,
      removeListener: removeListener,
      removeAllListeners: removeAllListeners,
      emit: emit,
      binding: binding,
      cwd: cwd,
      chdir: chdir,
      umask: umask,
      hrtime: hrtime,
      platform: platform,
      release: release,
      config: config,
      uptime: uptime
    };

    /*

    Based off glamor's StyleSheet, thanks Sunil ❤️

    high performance StyleSheet for css-in-js systems

    - uses multiple style tags behind the scenes for millions of rules
    - uses `insertRule` for appending in production for *much* faster performance

    // usage

    import { StyleSheet } from '@emotion/sheet'

    let styleSheet = new StyleSheet({ key: '', container: document.head })

    styleSheet.insert('#box { border: 1px solid red; }')
    - appends a css rule into the stylesheet

    styleSheet.flush()
    - empties the stylesheet of all its contents

    */
    // $FlowFixMe
    function sheetForTag(tag) {
      if (tag.sheet) {
        // $FlowFixMe
        return tag.sheet;
      } // this weirdness brought to you by firefox

      /* istanbul ignore next */


      for (var i = 0; i < document.styleSheets.length; i++) {
        if (document.styleSheets[i].ownerNode === tag) {
          // $FlowFixMe
          return document.styleSheets[i];
        }
      }
    }

    function createStyleElement(options) {
      var tag = document.createElement('style');
      tag.setAttribute('data-emotion', options.key);

      if (options.nonce !== undefined) {
        tag.setAttribute('nonce', options.nonce);
      }

      tag.appendChild(document.createTextNode(''));
      tag.setAttribute('data-s', '');
      return tag;
    }

    var StyleSheet = /*#__PURE__*/function () {
      // Using Node instead of HTMLElement since container may be a ShadowRoot
      function StyleSheet(options) {
        var _this = this;

        this._insertTag = function (tag) {
          var before;

          if (_this.tags.length === 0) {
            if (_this.insertionPoint) {
              before = _this.insertionPoint.nextSibling;
            } else if (_this.prepend) {
              before = _this.container.firstChild;
            } else {
              before = _this.before;
            }
          } else {
            before = _this.tags[_this.tags.length - 1].nextSibling;
          }

          _this.container.insertBefore(tag, before);

          _this.tags.push(tag);
        };

        this.isSpeedy = options.speedy === undefined ? browser$1.env.NODE_ENV === 'production' : options.speedy;
        this.tags = [];
        this.ctr = 0;
        this.nonce = options.nonce; // key is the value of the data-emotion attribute, it's used to identify different sheets

        this.key = options.key;
        this.container = options.container;
        this.prepend = options.prepend;
        this.insertionPoint = options.insertionPoint;
        this.before = null;
      }

      var _proto = StyleSheet.prototype;

      _proto.hydrate = function hydrate(nodes) {
        nodes.forEach(this._insertTag);
      };

      _proto.insert = function insert(rule) {
        // the max length is how many rules we have per style tag, it's 65000 in speedy mode
        // it's 1 in dev because we insert source maps that map a single rule to a location
        // and you can only have one source map per style tag
        if (this.ctr % (this.isSpeedy ? 65000 : 1) === 0) {
          this._insertTag(createStyleElement(this));
        }

        var tag = this.tags[this.tags.length - 1];

        if (browser$1.env.NODE_ENV !== 'production') {
          var isImportRule = rule.charCodeAt(0) === 64 && rule.charCodeAt(1) === 105;

          if (isImportRule && this._alreadyInsertedOrderInsensitiveRule) {
            // this would only cause problem in speedy mode
            // but we don't want enabling speedy to affect the observable behavior
            // so we report this error at all times
            console.error("You're attempting to insert the following rule:\n" + rule + '\n\n`@import` rules must be before all other types of rules in a stylesheet but other rules have already been inserted. Please ensure that `@import` rules are before all other rules.');
          }
          this._alreadyInsertedOrderInsensitiveRule = this._alreadyInsertedOrderInsensitiveRule || !isImportRule;
        }

        if (this.isSpeedy) {
          var sheet = sheetForTag(tag);

          try {
            // this is the ultrafast version, works across browsers
            // the big drawback is that the css won't be editable in devtools
            sheet.insertRule(rule, sheet.cssRules.length);
          } catch (e) {
            if (browser$1.env.NODE_ENV !== 'production' && !/:(-moz-placeholder|-moz-focus-inner|-moz-focusring|-ms-input-placeholder|-moz-read-write|-moz-read-only|-ms-clear|-ms-expand|-ms-reveal){/.test(rule)) {
              console.error("There was a problem inserting the following rule: \"" + rule + "\"", e);
            }
          }
        } else {
          tag.appendChild(document.createTextNode(rule));
        }

        this.ctr++;
      };

      _proto.flush = function flush() {
        // $FlowFixMe
        this.tags.forEach(function (tag) {
          return tag.parentNode && tag.parentNode.removeChild(tag);
        });
        this.tags = [];
        this.ctr = 0;

        if (browser$1.env.NODE_ENV !== 'production') {
          this._alreadyInsertedOrderInsensitiveRule = false;
        }
      };

      return StyleSheet;
    }();

    var stylis = {exports: {}};

    (function (module, exports) {
    	(function(e,r){r(exports);})(commonjsGlobal,(function(e){var r="-ms-";var a="-moz-";var c="-webkit-";var t="comm";var n="rule";var s="decl";var i="@page";var u="@media";var o="@import";var f="@charset";var l="@viewport";var p="@supports";var h="@document";var v="@namespace";var d="@keyframes";var b="@font-face";var w="@counter-style";var m="@font-feature-values";var g=Math.abs;var k=String.fromCharCode;var $=Object.assign;function x(e,r){return A(e,0)^45?(((r<<2^A(e,0))<<2^A(e,1))<<2^A(e,2))<<2^A(e,3):0}function E(e){return e.trim()}function y(e,r){return (e=r.exec(e))?e[0]:e}function T(e,r,a){return e.replace(r,a)}function O(e,r){return e.indexOf(r)}function A(e,r){return e.charCodeAt(r)|0}function M(e,r,a){return e.slice(r,a)}function C(e){return e.length}function S(e){return e.length}function R(e,r){return r.push(e),e}function z(e,r){return e.map(r).join("")}e.line=1;e.column=1;e.length=0;e.position=0;e.character=0;e.characters="";function N(r,a,c,t,n,s,i){return {value:r,root:a,parent:c,type:t,props:n,children:s,line:e.line,column:e.column,length:i,return:""}}function P(e,r){return $(N("",null,null,"",null,null,0),e,{length:-e.length},r)}function j(){return e.character}function U(){e.character=e.position>0?A(e.characters,--e.position):0;if(e.column--,e.character===10)e.column=1,e.line--;return e.character}function _(){e.character=e.position<e.length?A(e.characters,e.position++):0;if(e.column++,e.character===10)e.column=1,e.line++;return e.character}function F(){return A(e.characters,e.position)}function I(){return e.position}function L(r,a){return M(e.characters,r,a)}function D(e){switch(e){case 0:case 9:case 10:case 13:case 32:return 5;case 33:case 43:case 44:case 47:case 62:case 64:case 126:case 59:case 123:case 125:return 4;case 58:return 3;case 34:case 39:case 40:case 91:return 2;case 41:case 93:return 1}return 0}function K(r){return e.line=e.column=1,e.length=C(e.characters=r),e.position=0,[]}function V(r){return e.characters="",r}function W(r){return E(L(e.position-1,Z(r===91?r+2:r===40?r+1:r)))}function Y(e){return V(G(K(e)))}function B(r){while(e.character=F())if(e.character<33)_();else break;return D(r)>2||D(e.character)>3?"":" "}function G(r){while(_())switch(D(e.character)){case 0:R(J(e.position-1),r);break;case 2:R(W(e.character),r);break;default:R(k(e.character),r);}return r}function H(r,a){while(--a&&_())if(e.character<48||e.character>102||e.character>57&&e.character<65||e.character>70&&e.character<97)break;return L(r,I()+(a<6&&F()==32&&_()==32))}function Z(r){while(_())switch(e.character){case r:return e.position;case 34:case 39:if(r!==34&&r!==39)Z(e.character);break;case 40:if(r===41)Z(r);break;case 92:_();break}return e.position}function q(r,a){while(_())if(r+e.character===47+10)break;else if(r+e.character===42+42&&F()===47)break;return "/*"+L(a,e.position-1)+"*"+k(r===47?r:_())}function J(r){while(!D(F()))_();return L(r,e.position)}function Q(e){return V(X("",null,null,null,[""],e=K(e),0,[0],e))}function X(e,r,a,c,t,n,s,i,u){var o=0;var f=0;var l=s;var p=0;var h=0;var v=0;var d=1;var b=1;var w=1;var m=0;var g="";var $=t;var x=n;var E=c;var y=g;while(b)switch(v=m,m=_()){case 40:if(v!=108&&A(y,l-1)==58){if(O(y+=T(W(m),"&","&\f"),"&\f")!=-1)w=-1;break}case 34:case 39:case 91:y+=W(m);break;case 9:case 10:case 13:case 32:y+=B(v);break;case 92:y+=H(I()-1,7);continue;case 47:switch(F()){case 42:case 47:R(re(q(_(),I()),r,a),u);break;default:y+="/";}break;case 123*d:i[o++]=C(y)*w;case 125*d:case 59:case 0:switch(m){case 0:case 125:b=0;case 59+f:if(h>0&&C(y)-l)R(h>32?ae(y+";",c,a,l-1):ae(T(y," ","")+";",c,a,l-2),u);break;case 59:y+=";";default:R(E=ee(y,r,a,o,f,t,i,g,$=[],x=[],l),n);if(m===123)if(f===0)X(y,r,E,E,$,n,l,i,x);else switch(p===99&&A(y,3)===110?100:p){case 100:case 109:case 115:X(e,E,E,c&&R(ee(e,E,E,0,0,t,i,g,t,$=[],l),x),t,x,l,i,c?$:x);break;default:X(y,E,E,E,[""],x,0,i,x);}}o=f=h=0,d=w=1,g=y="",l=s;break;case 58:l=1+C(y),h=v;default:if(d<1)if(m==123)--d;else if(m==125&&d++==0&&U()==125)continue;switch(y+=k(m),m*d){case 38:w=f>0?1:(y+="\f",-1);break;case 44:i[o++]=(C(y)-1)*w,w=1;break;case 64:if(F()===45)y+=W(_());p=F(),f=l=C(g=y+=J(I())),m++;break;case 45:if(v===45&&C(y)==2)d=0;}}return n}function ee(e,r,a,c,t,s,i,u,o,f,l){var p=t-1;var h=t===0?s:[""];var v=S(h);for(var d=0,b=0,w=0;d<c;++d)for(var m=0,k=M(e,p+1,p=g(b=i[d])),$=e;m<v;++m)if($=E(b>0?h[m]+" "+k:T(k,/&\f/g,h[m])))o[w++]=$;return N(e,r,a,t===0?n:u,o,f,l)}function re(e,r,a){return N(e,r,a,t,k(j()),M(e,2,-2),0)}function ae(e,r,a,c){return N(e,r,a,s,M(e,0,c),M(e,c+1,-1),c)}function ce(e,t,n){switch(x(e,t)){case 5103:return c+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 6391:case 5879:case 5623:case 6135:case 4599:case 4855:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:return c+e+e;case 4789:return a+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return c+e+a+e+r+e+e;case 5936:switch(A(e,t+11)){case 114:return c+e+r+T(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return c+e+r+T(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return c+e+r+T(e,/[svh]\w+-[tblr]{2}/,"lr")+e}case 6828:case 4268:case 2903:return c+e+r+e+e;case 6165:return c+e+r+"flex-"+e+e;case 5187:return c+e+T(e,/(\w+).+(:[^]+)/,c+"box-$1$2"+r+"flex-$1$2")+e;case 5443:return c+e+r+"flex-item-"+T(e,/flex-|-self/g,"")+(!y(e,/flex-|baseline/)?r+"grid-row-"+T(e,/flex-|-self/g,""):"")+e;case 4675:return c+e+r+"flex-line-pack"+T(e,/align-content|flex-|-self/g,"")+e;case 5548:return c+e+r+T(e,"shrink","negative")+e;case 5292:return c+e+r+T(e,"basis","preferred-size")+e;case 6060:return c+"box-"+T(e,"-grow","")+c+e+r+T(e,"grow","positive")+e;case 4554:return c+T(e,/([^-])(transform)/g,"$1"+c+"$2")+e;case 6187:return T(T(T(e,/(zoom-|grab)/,c+"$1"),/(image-set)/,c+"$1"),e,"")+e;case 5495:case 3959:return T(e,/(image-set\([^]*)/,c+"$1"+"$`$1");case 4968:return T(T(e,/(.+:)(flex-)?(.*)/,c+"box-pack:$3"+r+"flex-pack:$3"),/s.+-b[^;]+/,"justify")+c+e+e;case 4200:if(!y(e,/flex-|baseline/))return r+"grid-column-align"+M(e,t)+e;break;case 2592:case 3360:return r+T(e,"template-","")+e;case 4384:case 3616:if(n&&n.some((function(e,r){return t=r,y(e.props,/grid-\w+-end/)}))){return ~O(e+(n=n[t].value),"span")?e:r+T(e,"-start","")+e+r+"grid-row-span:"+(~O(n,"span")?y(n,/\d+/):+y(n,/\d+/)-+y(e,/\d+/))+";"}return r+T(e,"-start","")+e;case 4896:case 4128:return n&&n.some((function(e){return y(e.props,/grid-\w+-start/)}))?e:r+T(T(e,"-end","-span"),"span ","")+e;case 4095:case 3583:case 4068:case 2532:return T(e,/(.+)-inline(.+)/,c+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(C(e)-1-t>6)switch(A(e,t+1)){case 109:if(A(e,t+4)!==45)break;case 102:return T(e,/(.+:)(.+)-([^]+)/,"$1"+c+"$2-$3"+"$1"+a+(A(e,t+3)==108?"$3":"$2-$3"))+e;case 115:return ~O(e,"stretch")?ce(T(e,"stretch","fill-available"),t,n)+e:e}break;case 5152:case 5920:return T(e,/(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/,(function(a,c,t,n,s,i,u){return r+c+":"+t+u+(n?r+c+"-span:"+(s?i:+i-+t)+u:"")+e}));case 4949:if(A(e,t+6)===121)return T(e,":",":"+c)+e;break;case 6444:switch(A(e,A(e,14)===45?18:11)){case 120:return T(e,/(.+:)([^;\s!]+)(;|(\s+)?!.+)?/,"$1"+c+(A(e,14)===45?"inline-":"")+"box$3"+"$1"+c+"$2$3"+"$1"+r+"$2box$3")+e;case 100:return T(e,":",":"+r)+e}break;case 5719:case 2647:case 2135:case 3927:case 2391:return T(e,"scroll-","scroll-snap-")+e}return e}function te(e,r){var a="";var c=S(e);for(var t=0;t<c;t++)a+=r(e[t],t,e,r)||"";return a}function ne(e,r,a,c){switch(e.type){case o:case s:return e.return=e.return||e.value;case t:return "";case d:return e.return=e.value+"{"+te(e.children,c)+"}";case n:e.value=e.props.join(",");}return C(a=te(e.children,c))?e.return=e.value+"{"+a+"}":""}function se(e){var r=S(e);return function(a,c,t,n){var s="";for(var i=0;i<r;i++)s+=e[i](a,c,t,n)||"";return s}}function ie(e){return function(r){if(!r.root)if(r=r.return)e(r);}}function ue(e,t,i,u){if(e.length>-1)if(!e.return)switch(e.type){case s:e.return=ce(e.value,e.length,i);return;case d:return te([P(e,{value:T(e.value,"@","@"+c)})],u);case n:if(e.length)return z(e.props,(function(t){switch(y(t,/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":return te([P(e,{props:[T(t,/:(read-\w+)/,":"+a+"$1")]})],u);case"::placeholder":return te([P(e,{props:[T(t,/:(plac\w+)/,":"+c+"input-$1")]}),P(e,{props:[T(t,/:(plac\w+)/,":"+a+"$1")]}),P(e,{props:[T(t,/:(plac\w+)/,r+"input-$1")]})],u)}return ""}))}}function oe(e){switch(e.type){case n:e.props=e.props.map((function(r){return z(Y(r),(function(r,a,c){switch(A(r,0)){case 12:return M(r,1,C(r));case 0:case 40:case 43:case 62:case 126:return r;case 58:if(c[++a]==="global")c[a]="",c[++a]="\f"+M(c[a],a=1,-1);case 32:return a===1?"":r;default:switch(a){case 0:e=r;return S(c)>1?"":r;case a=S(c)-1:case 2:return a===2?r+e+e:r+e;default:return r}}}))}));}}e.CHARSET=f;e.COMMENT=t;e.COUNTER_STYLE=w;e.DECLARATION=s;e.DOCUMENT=h;e.FONT_FACE=b;e.FONT_FEATURE_VALUES=m;e.IMPORT=o;e.KEYFRAMES=d;e.MEDIA=u;e.MOZ=a;e.MS=r;e.NAMESPACE=v;e.PAGE=i;e.RULESET=n;e.SUPPORTS=p;e.VIEWPORT=l;e.WEBKIT=c;e.abs=g;e.alloc=K;e.append=R;e.assign=$;e.caret=I;e.char=j;e.charat=A;e.combine=z;e.comment=re;e.commenter=q;e.compile=Q;e.copy=P;e.dealloc=V;e.declaration=ae;e.delimit=W;e.delimiter=Z;e.escaping=H;e.from=k;e.hash=x;e.identifier=J;e.indexof=O;e.match=y;e.middleware=se;e.namespace=oe;e.next=_;e.node=N;e.parse=X;e.peek=F;e.prefix=ce;e.prefixer=ue;e.prev=U;e.replace=T;e.ruleset=ee;e.rulesheet=ie;e.serialize=te;e.sizeof=S;e.slice=L;e.stringify=ne;e.strlen=C;e.substr=M;e.token=D;e.tokenize=Y;e.tokenizer=G;e.trim=E;e.whitespace=B;Object.defineProperty(e,"__esModule",{value:true});}));
    	
    } (stylis, stylis.exports));

    var weakMemoize = function weakMemoize(func) {
      // $FlowFixMe flow doesn't include all non-primitive types as allowed for weakmaps
      var cache = new WeakMap();
      return function (arg) {
        if (cache.has(arg)) {
          // $FlowFixMe
          return cache.get(arg);
        }

        var ret = func(arg);
        cache.set(arg, ret);
        return ret;
      };
    };

    function memoize(fn) {
      var cache = Object.create(null);
      return function (arg) {
        if (cache[arg] === undefined) cache[arg] = fn(arg);
        return cache[arg];
      };
    }

    var identifierWithPointTracking = function identifierWithPointTracking(begin, points, index) {
      var previous = 0;
      var character = 0;

      while (true) {
        previous = character;
        character = stylis.exports.peek(); // &\f

        if (previous === 38 && character === 12) {
          points[index] = 1;
        }

        if (stylis.exports.token(character)) {
          break;
        }

        stylis.exports.next();
      }

      return stylis.exports.slice(begin, stylis.exports.position);
    };

    var toRules = function toRules(parsed, points) {
      // pretend we've started with a comma
      var index = -1;
      var character = 44;

      do {
        switch (stylis.exports.token(character)) {
          case 0:
            // &\f
            if (character === 38 && stylis.exports.peek() === 12) {
              // this is not 100% correct, we don't account for literal sequences here - like for example quoted strings
              // stylis inserts \f after & to know when & where it should replace this sequence with the context selector
              // and when it should just concatenate the outer and inner selectors
              // it's very unlikely for this sequence to actually appear in a different context, so we just leverage this fact here
              points[index] = 1;
            }

            parsed[index] += identifierWithPointTracking(stylis.exports.position - 1, points, index);
            break;

          case 2:
            parsed[index] += stylis.exports.delimit(character);
            break;

          case 4:
            // comma
            if (character === 44) {
              // colon
              parsed[++index] = stylis.exports.peek() === 58 ? '&\f' : '';
              points[index] = parsed[index].length;
              break;
            }

          // fallthrough

          default:
            parsed[index] += stylis.exports.from(character);
        }
      } while (character = stylis.exports.next());

      return parsed;
    };

    var getRules = function getRules(value, points) {
      return stylis.exports.dealloc(toRules(stylis.exports.alloc(value), points));
    }; // WeakSet would be more appropriate, but only WeakMap is supported in IE11


    var fixedElements = /* #__PURE__ */new WeakMap();
    var compat = function compat(element) {
      if (element.type !== 'rule' || !element.parent || // positive .length indicates that this rule contains pseudo
      // negative .length indicates that this rule has been already prefixed
      element.length < 1) {
        return;
      }

      var value = element.value,
          parent = element.parent;
      var isImplicitRule = element.column === parent.column && element.line === parent.line;

      while (parent.type !== 'rule') {
        parent = parent.parent;
        if (!parent) return;
      } // short-circuit for the simplest case


      if (element.props.length === 1 && value.charCodeAt(0) !== 58
      /* colon */
      && !fixedElements.get(parent)) {
        return;
      } // if this is an implicitly inserted rule (the one eagerly inserted at the each new nested level)
      // then the props has already been manipulated beforehand as they that array is shared between it and its "rule parent"


      if (isImplicitRule) {
        return;
      }

      fixedElements.set(element, true);
      var points = [];
      var rules = getRules(value, points);
      var parentRules = parent.props;

      for (var i = 0, k = 0; i < rules.length; i++) {
        for (var j = 0; j < parentRules.length; j++, k++) {
          element.props[k] = points[i] ? rules[i].replace(/&\f/g, parentRules[j]) : parentRules[j] + " " + rules[i];
        }
      }
    };
    var removeLabel = function removeLabel(element) {
      if (element.type === 'decl') {
        var value = element.value;

        if ( // charcode for l
        value.charCodeAt(0) === 108 && // charcode for b
        value.charCodeAt(2) === 98) {
          // this ignores label
          element["return"] = '';
          element.value = '';
        }
      }
    };
    var ignoreFlag = 'emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason';

    var isIgnoringComment = function isIgnoringComment(element) {
      return element.type === 'comm' && element.children.indexOf(ignoreFlag) > -1;
    };

    var createUnsafeSelectorsAlarm = function createUnsafeSelectorsAlarm(cache) {
      return function (element, index, children) {
        if (element.type !== 'rule' || cache.compat) return;
        var unsafePseudoClasses = element.value.match(/(:first|:nth|:nth-last)-child/g);

        if (unsafePseudoClasses) {
          var isNested = element.parent === children[0]; // in nested rules comments become children of the "auto-inserted" rule
          //
          // considering this input:
          // .a {
          //   .b /* comm */ {}
          //   color: hotpink;
          // }
          // we get output corresponding to this:
          // .a {
          //   & {
          //     /* comm */
          //     color: hotpink;
          //   }
          //   .b {}
          // }

          var commentContainer = isNested ? children[0].children : // global rule at the root level
          children;

          for (var i = commentContainer.length - 1; i >= 0; i--) {
            var node = commentContainer[i];

            if (node.line < element.line) {
              break;
            } // it is quite weird but comments are *usually* put at `column: element.column - 1`
            // so we seek *from the end* for the node that is earlier than the rule's `element` and check that
            // this will also match inputs like this:
            // .a {
            //   /* comm */
            //   .b {}
            // }
            //
            // but that is fine
            //
            // it would be the easiest to change the placement of the comment to be the first child of the rule:
            // .a {
            //   .b { /* comm */ }
            // }
            // with such inputs we wouldn't have to search for the comment at all
            // TODO: consider changing this comment placement in the next major version


            if (node.column < element.column) {
              if (isIgnoringComment(node)) {
                return;
              }

              break;
            }
          }

          unsafePseudoClasses.forEach(function (unsafePseudoClass) {
            console.error("The pseudo class \"" + unsafePseudoClass + "\" is potentially unsafe when doing server-side rendering. Try changing it to \"" + unsafePseudoClass.split('-child')[0] + "-of-type\".");
          });
        }
      };
    };

    var isImportRule = function isImportRule(element) {
      return element.type.charCodeAt(1) === 105 && element.type.charCodeAt(0) === 64;
    };

    var isPrependedWithRegularRules = function isPrependedWithRegularRules(index, children) {
      for (var i = index - 1; i >= 0; i--) {
        if (!isImportRule(children[i])) {
          return true;
        }
      }

      return false;
    }; // use this to remove incorrect elements from further processing
    // so they don't get handed to the `sheet` (or anything else)
    // as that could potentially lead to additional logs which in turn could be overhelming to the user


    var nullifyElement = function nullifyElement(element) {
      element.type = '';
      element.value = '';
      element["return"] = '';
      element.children = '';
      element.props = '';
    };

    var incorrectImportAlarm = function incorrectImportAlarm(element, index, children) {
      if (!isImportRule(element)) {
        return;
      }

      if (element.parent) {
        console.error("`@import` rules can't be nested inside other rules. Please move it to the top level and put it before regular rules. Keep in mind that they can only be used within global styles.");
        nullifyElement(element);
      } else if (isPrependedWithRegularRules(index, children)) {
        console.error("`@import` rules can't be after other rules. Please put your `@import` rules before your other rules.");
        nullifyElement(element);
      }
    };

    /* eslint-disable no-fallthrough */

    function prefix(value, length) {
      switch (stylis.exports.hash(value, length)) {
        // color-adjust
        case 5103:
          return stylis.exports.WEBKIT + 'print-' + value + value;
        // animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)

        case 5737:
        case 4201:
        case 3177:
        case 3433:
        case 1641:
        case 4457:
        case 2921: // text-decoration, filter, clip-path, backface-visibility, column, box-decoration-break

        case 5572:
        case 6356:
        case 5844:
        case 3191:
        case 6645:
        case 3005: // mask, mask-image, mask-(mode|clip|size), mask-(repeat|origin), mask-position, mask-composite,

        case 6391:
        case 5879:
        case 5623:
        case 6135:
        case 4599:
        case 4855: // background-clip, columns, column-(count|fill|gap|rule|rule-color|rule-style|rule-width|span|width)

        case 4215:
        case 6389:
        case 5109:
        case 5365:
        case 5621:
        case 3829:
          return stylis.exports.WEBKIT + value + value;
        // appearance, user-select, transform, hyphens, text-size-adjust

        case 5349:
        case 4246:
        case 4810:
        case 6968:
        case 2756:
          return stylis.exports.WEBKIT + value + stylis.exports.MOZ + value + stylis.exports.MS + value + value;
        // flex, flex-direction

        case 6828:
        case 4268:
          return stylis.exports.WEBKIT + value + stylis.exports.MS + value + value;
        // order

        case 6165:
          return stylis.exports.WEBKIT + value + stylis.exports.MS + 'flex-' + value + value;
        // align-items

        case 5187:
          return stylis.exports.WEBKIT + value + stylis.exports.replace(value, /(\w+).+(:[^]+)/, stylis.exports.WEBKIT + 'box-$1$2' + stylis.exports.MS + 'flex-$1$2') + value;
        // align-self

        case 5443:
          return stylis.exports.WEBKIT + value + stylis.exports.MS + 'flex-item-' + stylis.exports.replace(value, /flex-|-self/, '') + value;
        // align-content

        case 4675:
          return stylis.exports.WEBKIT + value + stylis.exports.MS + 'flex-line-pack' + stylis.exports.replace(value, /align-content|flex-|-self/, '') + value;
        // flex-shrink

        case 5548:
          return stylis.exports.WEBKIT + value + stylis.exports.MS + stylis.exports.replace(value, 'shrink', 'negative') + value;
        // flex-basis

        case 5292:
          return stylis.exports.WEBKIT + value + stylis.exports.MS + stylis.exports.replace(value, 'basis', 'preferred-size') + value;
        // flex-grow

        case 6060:
          return stylis.exports.WEBKIT + 'box-' + stylis.exports.replace(value, '-grow', '') + stylis.exports.WEBKIT + value + stylis.exports.MS + stylis.exports.replace(value, 'grow', 'positive') + value;
        // transition

        case 4554:
          return stylis.exports.WEBKIT + stylis.exports.replace(value, /([^-])(transform)/g, '$1' + stylis.exports.WEBKIT + '$2') + value;
        // cursor

        case 6187:
          return stylis.exports.replace(stylis.exports.replace(stylis.exports.replace(value, /(zoom-|grab)/, stylis.exports.WEBKIT + '$1'), /(image-set)/, stylis.exports.WEBKIT + '$1'), value, '') + value;
        // background, background-image

        case 5495:
        case 3959:
          return stylis.exports.replace(value, /(image-set\([^]*)/, stylis.exports.WEBKIT + '$1' + '$`$1');
        // justify-content

        case 4968:
          return stylis.exports.replace(stylis.exports.replace(value, /(.+:)(flex-)?(.*)/, stylis.exports.WEBKIT + 'box-pack:$3' + stylis.exports.MS + 'flex-pack:$3'), /s.+-b[^;]+/, 'justify') + stylis.exports.WEBKIT + value + value;
        // (margin|padding)-inline-(start|end)

        case 4095:
        case 3583:
        case 4068:
        case 2532:
          return stylis.exports.replace(value, /(.+)-inline(.+)/, stylis.exports.WEBKIT + '$1$2') + value;
        // (min|max)?(width|height|inline-size|block-size)

        case 8116:
        case 7059:
        case 5753:
        case 5535:
        case 5445:
        case 5701:
        case 4933:
        case 4677:
        case 5533:
        case 5789:
        case 5021:
        case 4765:
          // stretch, max-content, min-content, fill-available
          if (stylis.exports.strlen(value) - 1 - length > 6) switch (stylis.exports.charat(value, length + 1)) {
            // (m)ax-content, (m)in-content
            case 109:
              // -
              if (stylis.exports.charat(value, length + 4) !== 45) break;
            // (f)ill-available, (f)it-content

            case 102:
              return stylis.exports.replace(value, /(.+:)(.+)-([^]+)/, '$1' + stylis.exports.WEBKIT + '$2-$3' + '$1' + stylis.exports.MOZ + (stylis.exports.charat(value, length + 3) == 108 ? '$3' : '$2-$3')) + value;
            // (s)tretch

            case 115:
              return ~stylis.exports.indexof(value, 'stretch') ? prefix(stylis.exports.replace(value, 'stretch', 'fill-available'), length) + value : value;
          }
          break;
        // position: sticky

        case 4949:
          // (s)ticky?
          if (stylis.exports.charat(value, length + 1) !== 115) break;
        // display: (flex|inline-flex)

        case 6444:
          switch (stylis.exports.charat(value, stylis.exports.strlen(value) - 3 - (~stylis.exports.indexof(value, '!important') && 10))) {
            // stic(k)y
            case 107:
              return stylis.exports.replace(value, ':', ':' + stylis.exports.WEBKIT) + value;
            // (inline-)?fl(e)x

            case 101:
              return stylis.exports.replace(value, /(.+:)([^;!]+)(;|!.+)?/, '$1' + stylis.exports.WEBKIT + (stylis.exports.charat(value, 14) === 45 ? 'inline-' : '') + 'box$3' + '$1' + stylis.exports.WEBKIT + '$2$3' + '$1' + stylis.exports.MS + '$2box$3') + value;
          }

          break;
        // writing-mode

        case 5936:
          switch (stylis.exports.charat(value, length + 11)) {
            // vertical-l(r)
            case 114:
              return stylis.exports.WEBKIT + value + stylis.exports.MS + stylis.exports.replace(value, /[svh]\w+-[tblr]{2}/, 'tb') + value;
            // vertical-r(l)

            case 108:
              return stylis.exports.WEBKIT + value + stylis.exports.MS + stylis.exports.replace(value, /[svh]\w+-[tblr]{2}/, 'tb-rl') + value;
            // horizontal(-)tb

            case 45:
              return stylis.exports.WEBKIT + value + stylis.exports.MS + stylis.exports.replace(value, /[svh]\w+-[tblr]{2}/, 'lr') + value;
          }

          return stylis.exports.WEBKIT + value + stylis.exports.MS + value + value;
      }

      return value;
    }

    var prefixer = function prefixer(element, index, children, callback) {
      if (element.length > -1) if (!element["return"]) switch (element.type) {
        case stylis.exports.DECLARATION:
          element["return"] = prefix(element.value, element.length);
          break;

        case stylis.exports.KEYFRAMES:
          return stylis.exports.serialize([stylis.exports.copy(element, {
            value: stylis.exports.replace(element.value, '@', '@' + stylis.exports.WEBKIT)
          })], callback);

        case stylis.exports.RULESET:
          if (element.length) return stylis.exports.combine(element.props, function (value) {
            switch (stylis.exports.match(value, /(::plac\w+|:read-\w+)/)) {
              // :read-(only|write)
              case ':read-only':
              case ':read-write':
                return stylis.exports.serialize([stylis.exports.copy(element, {
                  props: [stylis.exports.replace(value, /:(read-\w+)/, ':' + stylis.exports.MOZ + '$1')]
                })], callback);
              // :placeholder

              case '::placeholder':
                return stylis.exports.serialize([stylis.exports.copy(element, {
                  props: [stylis.exports.replace(value, /:(plac\w+)/, ':' + stylis.exports.WEBKIT + 'input-$1')]
                }), stylis.exports.copy(element, {
                  props: [stylis.exports.replace(value, /:(plac\w+)/, ':' + stylis.exports.MOZ + '$1')]
                }), stylis.exports.copy(element, {
                  props: [stylis.exports.replace(value, /:(plac\w+)/, stylis.exports.MS + 'input-$1')]
                })], callback);
            }

            return '';
          });
      }
    };

    var isBrowser$1 = typeof document !== 'undefined';
    var getServerStylisCache = isBrowser$1 ? undefined : weakMemoize(function () {
      return memoize(function () {
        var cache = {};
        return function (name) {
          return cache[name];
        };
      });
    });
    var defaultStylisPlugins = [prefixer];

    var createCache = function createCache(options) {
      var key = options.key;

      if (browser$1.env.NODE_ENV !== 'production' && !key) {
        throw new Error("You have to configure `key` for your cache. Please make sure it's unique (and not equal to 'css') as it's used for linking styles to your cache.\n" + "If multiple caches share the same key they might \"fight\" for each other's style elements.");
      }

      if (isBrowser$1 && key === 'css') {
        var ssrStyles = document.querySelectorAll("style[data-emotion]:not([data-s])"); // get SSRed styles out of the way of React's hydration
        // document.head is a safe place to move them to(though note document.head is not necessarily the last place they will be)
        // note this very very intentionally targets all style elements regardless of the key to ensure
        // that creating a cache works inside of render of a React component

        Array.prototype.forEach.call(ssrStyles, function (node) {
          // we want to only move elements which have a space in the data-emotion attribute value
          // because that indicates that it is an Emotion 11 server-side rendered style elements
          // while we will already ignore Emotion 11 client-side inserted styles because of the :not([data-s]) part in the selector
          // Emotion 10 client-side inserted styles did not have data-s (but importantly did not have a space in their data-emotion attributes)
          // so checking for the space ensures that loading Emotion 11 after Emotion 10 has inserted some styles
          // will not result in the Emotion 10 styles being destroyed
          var dataEmotionAttribute = node.getAttribute('data-emotion');

          if (dataEmotionAttribute.indexOf(' ') === -1) {
            return;
          }
          document.head.appendChild(node);
          node.setAttribute('data-s', '');
        });
      }

      var stylisPlugins = options.stylisPlugins || defaultStylisPlugins;

      if (browser$1.env.NODE_ENV !== 'production') {
        // $FlowFixMe
        if (/[^a-z-]/.test(key)) {
          throw new Error("Emotion key must only contain lower case alphabetical characters and - but \"" + key + "\" was passed");
        }
      }

      var inserted = {};
      var container;
      var nodesToHydrate = [];

      if (isBrowser$1) {
        container = options.container || document.head;
        Array.prototype.forEach.call( // this means we will ignore elements which don't have a space in them which
        // means that the style elements we're looking at are only Emotion 11 server-rendered style elements
        document.querySelectorAll("style[data-emotion^=\"" + key + " \"]"), function (node) {
          var attrib = node.getAttribute("data-emotion").split(' '); // $FlowFixMe

          for (var i = 1; i < attrib.length; i++) {
            inserted[attrib[i]] = true;
          }

          nodesToHydrate.push(node);
        });
      }

      var _insert;

      var omnipresentPlugins = [compat, removeLabel];

      if (browser$1.env.NODE_ENV !== 'production') {
        omnipresentPlugins.push(createUnsafeSelectorsAlarm({
          get compat() {
            return cache.compat;
          }

        }), incorrectImportAlarm);
      }

      if (isBrowser$1) {
        var currentSheet;
        var finalizingPlugins = [stylis.exports.stringify, browser$1.env.NODE_ENV !== 'production' ? function (element) {
          if (!element.root) {
            if (element["return"]) {
              currentSheet.insert(element["return"]);
            } else if (element.value && element.type !== stylis.exports.COMMENT) {
              // insert empty rule in non-production environments
              // so @emotion/jest can grab `key` from the (JS)DOM for caches without any rules inserted yet
              currentSheet.insert(element.value + "{}");
            }
          }
        } : stylis.exports.rulesheet(function (rule) {
          currentSheet.insert(rule);
        })];
        var serializer = stylis.exports.middleware(omnipresentPlugins.concat(stylisPlugins, finalizingPlugins));

        var stylis$1 = function stylis$1(styles) {
          return stylis.exports.serialize(stylis.exports.compile(styles), serializer);
        };

        _insert = function insert(selector, serialized, sheet, shouldCache) {
          currentSheet = sheet;

          if (browser$1.env.NODE_ENV !== 'production' && serialized.map !== undefined) {
            currentSheet = {
              insert: function insert(rule) {
                sheet.insert(rule + serialized.map);
              }
            };
          }

          stylis$1(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);

          if (shouldCache) {
            cache.inserted[serialized.name] = true;
          }
        };
      } else {
        var _finalizingPlugins = [stylis.exports.stringify];

        var _serializer = stylis.exports.middleware(omnipresentPlugins.concat(stylisPlugins, _finalizingPlugins));

        var _stylis = function _stylis(styles) {
          return stylis.exports.serialize(stylis.exports.compile(styles), _serializer);
        }; // $FlowFixMe


        var serverStylisCache = getServerStylisCache(stylisPlugins)(key);

        var getRules = function getRules(selector, serialized) {
          var name = serialized.name;

          if (serverStylisCache[name] === undefined) {
            serverStylisCache[name] = _stylis(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);
          }

          return serverStylisCache[name];
        };

        _insert = function _insert(selector, serialized, sheet, shouldCache) {
          var name = serialized.name;
          var rules = getRules(selector, serialized);

          if (cache.compat === undefined) {
            // in regular mode, we don't set the styles on the inserted cache
            // since we don't need to and that would be wasting memory
            // we return them so that they are rendered in a style tag
            if (shouldCache) {
              cache.inserted[name] = true;
            }

            if ( // using === development instead of !== production
            // because if people do ssr in tests, the source maps showing up would be annoying
            browser$1.env.NODE_ENV === 'development' && serialized.map !== undefined) {
              return rules + serialized.map;
            }

            return rules;
          } else {
            // in compat mode, we put the styles on the inserted cache so
            // that emotion-server can pull out the styles
            // except when we don't want to cache it which was in Global but now
            // is nowhere but we don't want to do a major right now
            // and just in case we're going to leave the case here
            // it's also not affecting client side bundle size
            // so it's really not a big deal
            if (shouldCache) {
              cache.inserted[name] = rules;
            } else {
              return rules;
            }
          }
        };
      }

      var cache = {
        key: key,
        sheet: new StyleSheet({
          key: key,
          container: container,
          nonce: options.nonce,
          speedy: options.speedy,
          prepend: options.prepend,
          insertionPoint: options.insertionPoint
        }),
        nonce: options.nonce,
        inserted: inserted,
        registered: {},
        insert: _insert
      };
      cache.sheet.hydrate(nodesToHydrate);
      return cache;
    };

    /* eslint-disable */
    // Inspired by https://github.com/garycourt/murmurhash-js
    // Ported from https://github.com/aappleby/smhasher/blob/61a0530f28277f2e850bfc39600ce61d02b518de/src/MurmurHash2.cpp#L37-L86
    function murmur2(str) {
      // 'm' and 'r' are mixing constants generated offline.
      // They're not really 'magic', they just happen to work well.
      // const m = 0x5bd1e995;
      // const r = 24;
      // Initialize the hash
      var h = 0; // Mix 4 bytes at a time into the hash

      var k,
          i = 0,
          len = str.length;

      for (; len >= 4; ++i, len -= 4) {
        k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;
        k =
        /* Math.imul(k, m): */
        (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16);
        k ^=
        /* k >>> r: */
        k >>> 24;
        h =
        /* Math.imul(k, m): */
        (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16) ^
        /* Math.imul(h, m): */
        (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
      } // Handle the last few bytes of the input array


      switch (len) {
        case 3:
          h ^= (str.charCodeAt(i + 2) & 0xff) << 16;

        case 2:
          h ^= (str.charCodeAt(i + 1) & 0xff) << 8;

        case 1:
          h ^= str.charCodeAt(i) & 0xff;
          h =
          /* Math.imul(h, m): */
          (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
      } // Do a few final mixes of the hash to ensure the last few
      // bytes are well-incorporated.


      h ^= h >>> 13;
      h =
      /* Math.imul(h, m): */
      (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
      return ((h ^ h >>> 15) >>> 0).toString(36);
    }

    var unitlessKeys = {
      animationIterationCount: 1,
      borderImageOutset: 1,
      borderImageSlice: 1,
      borderImageWidth: 1,
      boxFlex: 1,
      boxFlexGroup: 1,
      boxOrdinalGroup: 1,
      columnCount: 1,
      columns: 1,
      flex: 1,
      flexGrow: 1,
      flexPositive: 1,
      flexShrink: 1,
      flexNegative: 1,
      flexOrder: 1,
      gridRow: 1,
      gridRowEnd: 1,
      gridRowSpan: 1,
      gridRowStart: 1,
      gridColumn: 1,
      gridColumnEnd: 1,
      gridColumnSpan: 1,
      gridColumnStart: 1,
      msGridRow: 1,
      msGridRowSpan: 1,
      msGridColumn: 1,
      msGridColumnSpan: 1,
      fontWeight: 1,
      lineHeight: 1,
      opacity: 1,
      order: 1,
      orphans: 1,
      tabSize: 1,
      widows: 1,
      zIndex: 1,
      zoom: 1,
      WebkitLineClamp: 1,
      // SVG-related properties
      fillOpacity: 1,
      floodOpacity: 1,
      stopOpacity: 1,
      strokeDasharray: 1,
      strokeDashoffset: 1,
      strokeMiterlimit: 1,
      strokeOpacity: 1,
      strokeWidth: 1
    };

    var ILLEGAL_ESCAPE_SEQUENCE_ERROR = "You have illegal escape sequence in your template literal, most likely inside content's property value.\nBecause you write your CSS inside a JavaScript string you actually have to do double escaping, so for example \"content: '\\00d7';\" should become \"content: '\\\\00d7';\".\nYou can read more about this here:\nhttps://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences";
    var UNDEFINED_AS_OBJECT_KEY_ERROR = "You have passed in falsy value as style object's key (can happen when in example you pass unexported component as computed key).";
    var hyphenateRegex = /[A-Z]|^ms/g;
    var animationRegex = /_EMO_([^_]+?)_([^]*?)_EMO_/g;

    var isCustomProperty = function isCustomProperty(property) {
      return property.charCodeAt(1) === 45;
    };

    var isProcessableValue = function isProcessableValue(value) {
      return value != null && typeof value !== 'boolean';
    };

    var processStyleName = /* #__PURE__ */memoize(function (styleName) {
      return isCustomProperty(styleName) ? styleName : styleName.replace(hyphenateRegex, '-$&').toLowerCase();
    });

    var processStyleValue = function processStyleValue(key, value) {
      switch (key) {
        case 'animation':
        case 'animationName':
          {
            if (typeof value === 'string') {
              return value.replace(animationRegex, function (match, p1, p2) {
                cursor = {
                  name: p1,
                  styles: p2,
                  next: cursor
                };
                return p1;
              });
            }
          }
      }

      if (unitlessKeys[key] !== 1 && !isCustomProperty(key) && typeof value === 'number' && value !== 0) {
        return value + 'px';
      }

      return value;
    };

    if (browser$1.env.NODE_ENV !== 'production') {
      var contentValuePattern = /(var|attr|counters?|url|element|(((repeating-)?(linear|radial))|conic)-gradient)\(|(no-)?(open|close)-quote/;
      var contentValues = ['normal', 'none', 'initial', 'inherit', 'unset'];
      var oldProcessStyleValue = processStyleValue;
      var msPattern = /^-ms-/;
      var hyphenPattern = /-(.)/g;
      var hyphenatedCache = {};

      processStyleValue = function processStyleValue(key, value) {
        if (key === 'content') {
          if (typeof value !== 'string' || contentValues.indexOf(value) === -1 && !contentValuePattern.test(value) && (value.charAt(0) !== value.charAt(value.length - 1) || value.charAt(0) !== '"' && value.charAt(0) !== "'")) {
            throw new Error("You seem to be using a value for 'content' without quotes, try replacing it with `content: '\"" + value + "\"'`");
          }
        }

        var processed = oldProcessStyleValue(key, value);

        if (processed !== '' && !isCustomProperty(key) && key.indexOf('-') !== -1 && hyphenatedCache[key] === undefined) {
          hyphenatedCache[key] = true;
          console.error("Using kebab-case for css properties in objects is not supported. Did you mean " + key.replace(msPattern, 'ms-').replace(hyphenPattern, function (str, _char) {
            return _char.toUpperCase();
          }) + "?");
        }

        return processed;
      };
    }

    var noComponentSelectorMessage = 'Component selectors can only be used in conjunction with ' + '@emotion/babel-plugin, the swc Emotion plugin, or another Emotion-aware ' + 'compiler transform.';

    function handleInterpolation(mergedProps, registered, interpolation) {
      if (interpolation == null) {
        return '';
      }

      if (interpolation.__emotion_styles !== undefined) {
        if (browser$1.env.NODE_ENV !== 'production' && interpolation.toString() === 'NO_COMPONENT_SELECTOR') {
          throw new Error(noComponentSelectorMessage);
        }

        return interpolation;
      }

      switch (typeof interpolation) {
        case 'boolean':
          {
            return '';
          }

        case 'object':
          {
            if (interpolation.anim === 1) {
              cursor = {
                name: interpolation.name,
                styles: interpolation.styles,
                next: cursor
              };
              return interpolation.name;
            }

            if (interpolation.styles !== undefined) {
              var next = interpolation.next;

              if (next !== undefined) {
                // not the most efficient thing ever but this is a pretty rare case
                // and there will be very few iterations of this generally
                while (next !== undefined) {
                  cursor = {
                    name: next.name,
                    styles: next.styles,
                    next: cursor
                  };
                  next = next.next;
                }
              }

              var styles = interpolation.styles + ";";

              if (browser$1.env.NODE_ENV !== 'production' && interpolation.map !== undefined) {
                styles += interpolation.map;
              }

              return styles;
            }

            return createStringFromObject(mergedProps, registered, interpolation);
          }

        case 'function':
          {
            if (mergedProps !== undefined) {
              var previousCursor = cursor;
              var result = interpolation(mergedProps);
              cursor = previousCursor;
              return handleInterpolation(mergedProps, registered, result);
            } else if (browser$1.env.NODE_ENV !== 'production') {
              console.error('Functions that are interpolated in css calls will be stringified.\n' + 'If you want to have a css call based on props, create a function that returns a css call like this\n' + 'let dynamicStyle = (props) => css`color: ${props.color}`\n' + 'It can be called directly with props or interpolated in a styled call like this\n' + "let SomeComponent = styled('div')`${dynamicStyle}`");
            }

            break;
          }

        case 'string':
          if (browser$1.env.NODE_ENV !== 'production') {
            var matched = [];
            var replaced = interpolation.replace(animationRegex, function (match, p1, p2) {
              var fakeVarName = "animation" + matched.length;
              matched.push("const " + fakeVarName + " = keyframes`" + p2.replace(/^@keyframes animation-\w+/, '') + "`");
              return "${" + fakeVarName + "}";
            });

            if (matched.length) {
              console.error('`keyframes` output got interpolated into plain string, please wrap it with `css`.\n\n' + 'Instead of doing this:\n\n' + [].concat(matched, ["`" + replaced + "`"]).join('\n') + '\n\nYou should wrap it with `css` like this:\n\n' + ("css`" + replaced + "`"));
            }
          }

          break;
      } // finalize string values (regular strings and functions interpolated into css calls)


      if (registered == null) {
        return interpolation;
      }

      var cached = registered[interpolation];
      return cached !== undefined ? cached : interpolation;
    }

    function createStringFromObject(mergedProps, registered, obj) {
      var string = '';

      if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
          string += handleInterpolation(mergedProps, registered, obj[i]) + ";";
        }
      } else {
        for (var _key in obj) {
          var value = obj[_key];

          if (typeof value !== 'object') {
            if (registered != null && registered[value] !== undefined) {
              string += _key + "{" + registered[value] + "}";
            } else if (isProcessableValue(value)) {
              string += processStyleName(_key) + ":" + processStyleValue(_key, value) + ";";
            }
          } else {
            if (_key === 'NO_COMPONENT_SELECTOR' && browser$1.env.NODE_ENV !== 'production') {
              throw new Error(noComponentSelectorMessage);
            }

            if (Array.isArray(value) && typeof value[0] === 'string' && (registered == null || registered[value[0]] === undefined)) {
              for (var _i = 0; _i < value.length; _i++) {
                if (isProcessableValue(value[_i])) {
                  string += processStyleName(_key) + ":" + processStyleValue(_key, value[_i]) + ";";
                }
              }
            } else {
              var interpolated = handleInterpolation(mergedProps, registered, value);

              switch (_key) {
                case 'animation':
                case 'animationName':
                  {
                    string += processStyleName(_key) + ":" + interpolated + ";";
                    break;
                  }

                default:
                  {
                    if (browser$1.env.NODE_ENV !== 'production' && _key === 'undefined') {
                      console.error(UNDEFINED_AS_OBJECT_KEY_ERROR);
                    }

                    string += _key + "{" + interpolated + "}";
                  }
              }
            }
          }
        }
      }

      return string;
    }

    var labelPattern = /label:\s*([^\s;\n{]+)\s*(;|$)/g;
    var sourceMapPattern;

    if (browser$1.env.NODE_ENV !== 'production') {
      sourceMapPattern = /\/\*#\ssourceMappingURL=data:application\/json;\S+\s+\*\//g;
    } // this is the cursor for keyframes
    // keyframes are stored on the SerializedStyles object as a linked list


    var cursor;
    var serializeStyles = function serializeStyles(args, registered, mergedProps) {
      if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && args[0].styles !== undefined) {
        return args[0];
      }

      var stringMode = true;
      var styles = '';
      cursor = undefined;
      var strings = args[0];

      if (strings == null || strings.raw === undefined) {
        stringMode = false;
        styles += handleInterpolation(mergedProps, registered, strings);
      } else {
        if (browser$1.env.NODE_ENV !== 'production' && strings[0] === undefined) {
          console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
        }

        styles += strings[0];
      } // we start at 1 since we've already handled the first arg


      for (var i = 1; i < args.length; i++) {
        styles += handleInterpolation(mergedProps, registered, args[i]);

        if (stringMode) {
          if (browser$1.env.NODE_ENV !== 'production' && strings[i] === undefined) {
            console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
          }

          styles += strings[i];
        }
      }

      var sourceMap;

      if (browser$1.env.NODE_ENV !== 'production') {
        styles = styles.replace(sourceMapPattern, function (match) {
          sourceMap = match;
          return '';
        });
      } // using a global regex with .exec is stateful so lastIndex has to be reset each time


      labelPattern.lastIndex = 0;
      var identifierName = '';
      var match; // https://esbench.com/bench/5b809c2cf2949800a0f61fb5

      while ((match = labelPattern.exec(styles)) !== null) {
        identifierName += '-' + // $FlowFixMe we know it's not null
        match[1];
      }

      var name = murmur2(styles) + identifierName;

      if (browser$1.env.NODE_ENV !== 'production') {
        // $FlowFixMe SerializedStyles type doesn't have toString property (and we don't want to add it)
        return {
          name: name,
          styles: styles,
          map: sourceMap,
          next: cursor,
          toString: function toString() {
            return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
          }
        };
      }

      return {
        name: name,
        styles: styles,
        next: cursor
      };
    };

    var isBrowser = typeof document !== 'undefined';
    function getRegisteredStyles(registered, registeredStyles, classNames) {
      var rawClassName = '';
      classNames.split(' ').forEach(function (className) {
        if (registered[className] !== undefined) {
          registeredStyles.push(registered[className] + ";");
        } else {
          rawClassName += className + " ";
        }
      });
      return rawClassName;
    }
    var registerStyles = function registerStyles(cache, serialized, isStringTag) {
      var className = cache.key + "-" + serialized.name;

      if ( // we only need to add the styles to the registered cache if the
      // class name could be used further down
      // the tree but if it's a string tag, we know it won't
      // so we don't have to add it to registered cache.
      // this improves memory usage since we can avoid storing the whole style string
      (isStringTag === false || // we need to always store it if we're in compat mode and
      // in node since emotion-server relies on whether a style is in
      // the registered cache to know whether a style is global or not
      // also, note that this check will be dead code eliminated in the browser
      isBrowser === false && cache.compat !== undefined) && cache.registered[className] === undefined) {
        cache.registered[className] = serialized.styles;
      }
    };
    var insertStyles = function insertStyles(cache, serialized, isStringTag) {
      registerStyles(cache, serialized, isStringTag);
      var className = cache.key + "-" + serialized.name;

      if (cache.inserted[serialized.name] === undefined) {
        var stylesForSSR = '';
        var current = serialized;

        do {
          var maybeStyles = cache.insert(serialized === current ? "." + className : '', current, cache.sheet, true);

          if (!isBrowser && maybeStyles !== undefined) {
            stylesForSSR += maybeStyles;
          }

          current = current.next;
        } while (current !== undefined);

        if (!isBrowser && stylesForSSR.length !== 0) {
          return stylesForSSR;
        }
      }
    };

    function insertWithoutScoping(cache, serialized) {
      if (cache.inserted[serialized.name] === undefined) {
        return cache.insert('', serialized, cache.sheet, true);
      }
    }

    function merge(registered, css, className) {
      var registeredStyles = [];
      var rawClassName = getRegisteredStyles(registered, registeredStyles, className);

      if (registeredStyles.length < 2) {
        return className;
      }

      return rawClassName + css(registeredStyles);
    }

    var createEmotion = function createEmotion(options) {
      var cache = createCache(options); // $FlowFixMe

      cache.sheet.speedy = function (value) {
        if (browser$1.env.NODE_ENV !== 'production' && this.ctr !== 0) {
          throw new Error('speedy must be changed before any rules are inserted');
        }

        this.isSpeedy = value;
      };

      cache.compat = true;

      var css = function css() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var serialized = serializeStyles(args, cache.registered, undefined);
        insertStyles(cache, serialized, false);
        return cache.key + "-" + serialized.name;
      };

      var keyframes = function keyframes() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var serialized = serializeStyles(args, cache.registered);
        var animation = "animation-" + serialized.name;
        insertWithoutScoping(cache, {
          name: serialized.name,
          styles: "@keyframes " + animation + "{" + serialized.styles + "}"
        });
        return animation;
      };

      var injectGlobal = function injectGlobal() {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        var serialized = serializeStyles(args, cache.registered);
        insertWithoutScoping(cache, serialized);
      };

      var cx = function cx() {
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        return merge(cache.registered, css, classnames(args));
      };

      return {
        css: css,
        cx: cx,
        injectGlobal: injectGlobal,
        keyframes: keyframes,
        hydrate: function hydrate(ids) {
          ids.forEach(function (key) {
            cache.inserted[key] = true;
          });
        },
        flush: function flush() {
          cache.registered = {};
          cache.inserted = {};
          cache.sheet.flush();
        },
        // $FlowFixMe
        sheet: cache.sheet,
        cache: cache,
        getRegisteredStyles: getRegisteredStyles.bind(null, cache.registered),
        merge: merge.bind(null, cache.registered, css)
      };
    };

    var classnames = function classnames(args) {
      var cls = '';

      for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (arg == null) continue;
        var toAdd = void 0;

        switch (typeof arg) {
          case 'boolean':
            break;

          case 'object':
            {
              if (Array.isArray(arg)) {
                toAdd = classnames(arg);
              } else {
                toAdd = '';

                for (var k in arg) {
                  if (arg[k] && k) {
                    toAdd && (toAdd += ' ');
                    toAdd += k;
                  }
                }
              }

              break;
            }

          default:
            {
              toAdd = arg;
            }
        }

        if (toAdd) {
          cls && (cls += ' ');
          cls += toAdd;
        }
      }

      return cls;
    };

    var _createEmotion = createEmotion({
      key: 'css'
    }),
        cx = _createEmotion.cx,
        keyframes = _createEmotion.keyframes,
        css = _createEmotion.css;

    // various colour palettes to map the 128 color antic display to RGB
    // WikiNTSC and (very similar) Atari800MacXnewStellaNTSC seem to work well in practice
    function rgbs(strs) {
        const rgbs = strs[0].trim().split(/\s+/).map(s => '#' + s);
        if (rgbs.length == 128) {
            return rgbs;
        }
        else if (rgbs.length == 256) {
            return rgbs.filter((_, i) => i % 2 == 0);
        }
        else {
            throw new Error("rgbs: Expected 128 or 256 rgb triples");
        }
    }
    // from .act dump via: xxd -c24 -g3 Atari\ 128\ \(NTSC\).act | cut -c11-65 | head -16
    // 128 colors indexed via high 7 bits, e.g. 0x00 and 0x01 refer to the first entry
    const colorPalettes = {
        // See Antic NTSC palette via https://en.wikipedia.org/wiki/List_of_video_game_console_palettes#NTSC
        WikiNTSC: rgbs `
000000 404040 6c6c6c 909090 b0b0b0 c8c8c8 dcdcdc ececec
444400 646410 848424 a0a034 b8b840 d0d050 e8e85c fcfc68
702800 844414 985c28 ac783c bc8c4c cca05c dcb468 ecc878
841800 983418 ac5030 c06848 d0805c e09470 eca880 fcbc94
880000 9c2020 b03c3c c05858 d07070 e08888 eca0a0 fcb4b4
78005c 8c2074 a03c88 b0589c c070b0 d084c0 dc9cd0 ecb0e0
480078 602090 783ca4 8c58b8 a070cc b484dc c49cec d4b0fc
140084 302098 4c3cac 6858c0 7c70d0 9488e0 a8a0ec bcb4fc
000088 1c209c 3840b0 505cc0 6874d0 7c8ce0 90a4ec a4b8fc
00187c 1c3890 3854a8 5070bc 6888cc 7c9cdc 90b4ec a4c8fc
002c5c 1c4c78 386890 5084ac 689cc0 7cb4d4 90cce8 a4e0fc
003c2c 1c5c48 387c64 509c80 68b494 7cd0ac 90e4c0 a4fcd4
003c00 205c20 407c40 5c9c5c 74b474 8cd08c a4e4a4 b8fcb8
143800 345c1c 507c38 6c9850 84b468 9ccc7c b4e490 c8fca4
2c3000 4c501c 687034 848c4c 9ca864 b4c078 ccd488 e0ec9c
442800 644818 846830 a08444 b89c58 d0b46c e8cc7c fce08c
`,
        // from https://forums.atariage.com/topic/243369-atari-128-color-palettes/
        AltirraNTSC: rgbs `
000000 101010 393939 636363 7b7b7b a5a5a5 c6c6c6 efefef
100000 312100 5a4200 846b00 9c8400 c6ad00 e7d629 fff74a
310000 5a0800 7b2900 a55200 bd6b00 e79429 ffb552 ffde73
4a0000 6b0000 941000 bd3929 d65242 ff7b6b ffa594 ffc6b5
4a0000 730029 94004a bd2973 d64294 ff6bb5 ff94de ffb5ff
39004a 630073 8c0094 ad21bd ce42d6 ef63ff ff8cff ffb5ff
21007b 4200a5 6b00c6 9429ef ad42ff d66bff f794ff ffb5ff
000094 2100bd 4210de 6b39ff 8452ff ad7bff ce9cff f7c6ff
00008c 0000b5 1829d6 4252ff 5a6bff 8494ff a5b5ff cedeff
000063 00218c 0042ad 186bd6 3984f7 5aadff 84ceff adf7ff
001021 00394a 005a73 008494 219cb5 4ac6de 6be7ff 94ffff
002100 004a00 006b21 00944a 18ad6b 42d68c 63f7b5 8cffde
002900 004a00 007300 109c08 29b521 52de4a 73ff6b 9cff94
002100 004a00 006b00 299400 42ad00 6bd610 94ff39 b5ff5a
001000 083900 296300 528400 6ba500 94c600 b5ef18 deff42
080000 312100 524a00 7b6b00 948c00 bdb500 e7d621 ffff4a
`,
        AltirraPAL: rgbs `
000000 212121 4a4a4a 6b6b6b 848484 a5a5a5 cecece efefef
420000 631800 843900 ad5a08 c67321 e79c42 ffbd63 ffde8c
520000 730800 942918 bd4a39 d66352 f78c7b ffad9c ffcebd
520000 7b0029 9c184a bd426b d65a84 ff7bad ff9cce ffc6ef
520031 73005a 94107b bd399c d652b5 f773de ff94ff ffbdff
39006b 63008c 8410ad a539d6 bd52ef e773ff ff94ff ffbdff
21008c 4200ad 6318ce 8c42f7 a55aff c67bff e79cff ffc6ff
00008c 0018ad 2139ce 4a63f7 637bff 849cff a5bdff cee7ff
000863 00318c 0852ad 2973ce 4294e7 6bb5ff 8cd6ff adffff
002131 004252 006373 188c9c 31a5b5 5ac6d6 7be7f7 9cffff
002900 005221 007342 18946b 31ad84 52d6a5 73f7c6 9cffef
003100 005a00 087b00 319c00 4ab518 6bde42 8cff63 b5ff84
002900 005200 297300 4a9400 63ad00 8cd621 adf742 ceff63
001800 294200 4a6300 6b8400 849c00 adc610 cee731 efff5a
210800 4a2900 6b5200 8c7300 a58c00 ceb521 efd642 fff763
420000 631800 843900 ad5a08 c67321 e79c42 ffbd63 ffde8c
`,
        // 256 color palettes from Atari800MacX
        Atari800MacXreal: rgbs `
323132 3f3e3f 4d4c4d 5b5b5b 6a696a 797879 888788 979797
a1a0a1 afafaf bebebe cecdce dbdbdb ebeaeb fafafa ffffff
612e00 6c3b00 7a4a00 885800 94670c a5761b b2842a c1943a
ca9d43 daad53 e8bb62 f8cb72 ffd87f ffe88f fff79f ffffae
6c2400 773000 844003 924e11 9e5d22 af6c31 bc7b41 cc8a50
d5935b e4a369 f2b179 ffc289 ffcf97 ffdfa6 ffedb5 fffdc4
751618 812324 8f3134 9d4043 aa4e50 b85e60 c66d6f d57d7f
de8787 ed9596 fca4a5 ffb4b5 ffc2c4 ffd1d3 ffe0e1 ffeff0
620e71 6e1b7c 7b2a8a 8a3998 9647a5 a557b5 b365c3 c375d1
cd7eda dc8de9 ea97f7 f9acff ffbaff ffc9ff ffd9ff ffe8ff
560f87 611d90 712c9e 7f3aac 8d48ba 9b58c7 a967d5 b877e5
c280ed d090fc df9fff eeafff fcbdff ffccff ffdbff ffeaff
461695 5122a0 6032ac 6e41bb 7c4fc8 8a5ed6 996de3 a87cf2
b185fb c095ff cfa3ff dfb3ff eec1ff fcd0ff ffdfff ffefff
212994 2d359f 3d44ad 4b53ba 5961c7 686fd5 777ee2 878ef2
9097fa 96a6ff aeb5ff bfc4ff cdd2ff dae3ff eaf1ff fafeff
0f3584 1c418d 2c509b 3a5eaa 486cb7 587bc5 678ad2 7699e2
80a2eb 8fb2f9 9ec0ff add0ff bdddff cbecff dbfcff eaffff
043f70 114b79 215988 2f6896 3e75a4 4d83b2 5c92c1 6ca1d2
74abd9 83bae7 93c9f6 a2d8ff b1e6ff c0f5ff d0ffff deffff
005918 006526 0f7235 1d8144 2c8e50 3b9d60 4aac6f 59bb7e
63c487 72d396 82e2a5 92f1b5 9ffec3 aeffd2 beffe2 cefff1
075c00 146800 227500 328300 3f910b 4fa01b 5eae2a 6ebd3b
77c644 87d553 96e363 a7f373 b3fe80 c3ff8f d3ffa0 e3ffb0
1a5600 286200 367000 457e00 538c00 629b07 70a916 80b926
89c22f 99d13e a8df4d b7ef5c c5fc6b d5ff7b e3ff8b f3ff99
334b00 405700 4d6500 5d7300 6a8200 7a9100 889e0f 98ae1f
a1b728 bac638 bfd548 cee458 dcf266 ebff75 faff85 ffff95
4b3c00 584900 655700 746500 817400 908307 9f9116 aea126
b7aa2e c7ba3e d5c74d e5d75d f2e56b fef47a ffff8b ffff9a
602e00 6d3a00 7a4900 895800 95670a a4761b b2832a c2943a
cb9d44 daac53 e8ba62 f8cb73 ffd77f ffe791 fff69f ffffaf
`,
        Atari800MacXdefault: rgbs `
000000 1c1c1c 393939 595959 797979 929292 ababab bcbcbc
cdcdcd d9d9d9 e6e6e6 ececec f2f2f2 f8f8f8 ffffff ffffff
391701 5e2304 833008 a54716 c85f24 e37820 ff911d ffab1d
ffc51d ffce34 ffd84c ffe651 fff456 fff977 ffff98 ffff98
451904 721e11 9f241e b33a20 c85122 e36920 ff811e ff8c25
ff982c ffae38 ffc545 ffc559 ffc66d ffd587 ffe4a1 ffe4a1
4a1704 7e1a0d b21d17 c82119 df251c ec3b38 fa5255 fc6161
ff706e ff7f7e ff8f8f ff9d9e ffabad ffb9bd ffc7ce ffc7ce
050568 3b136d 712272 8b2a8c a532a6 b938ba cd3ecf db47dd
ea51eb f45ff5 fe6dff fe7afd ff87fb ff95fd ffa4ff ffa4ff
280479 400984 590f90 70249d 8839aa a441c3 c04adc d054ed
e05eff e96dff f27cff f88aff ff98ff fea1ff feabff feabff
35088a 420aad 500cd0 6428d0 7945d0 8d4bd4 a251d9 b058ec
be60ff c56bff cc77ff d183ff d790ff db9dff dfaaff dfaaff
051e81 0626a5 082fca 263dd4 444cde 4f5aee 5a68ff 6575ff
7183ff 8091ff 90a0ff 97a9ff 9fb2ff afbeff c0cbff c0cbff
0c048b 2218a0 382db5 483ec7 584fda 6159ec 6b64ff 7a74ff
8a84ff 918eff 9998ff a5a3ff b1aeff b8b8ff c0c2ff c0c2ff
1d295a 1d3876 1d4892 1c5cac 1c71c6 3286cf 489bd9 4ea8ec
55b6ff 70c7ff 8cd8ff 93dbff 9bdfff afe4ff c3e9ff c3e9ff
2f4302 395202 446103 417a12 3e9421 4a9f2e 57ab3b 5cbd55
61d070 69e27a 72f584 7cfa8d 87ff97 9affa6 adffb6 adffb6
0a4108 0d540a 10680d 137d0f 169212 19a514 1cb917 1ec919
21d91b 47e42d 6ef040 78f74d 83ff5b 9aff7a b2ff9a b2ff9a
04410b 05530e 066611 077714 088817 099b1a 0baf1d 48c41f
86d922 8fe924 99f927 a8fc41 b7ff5b c9ff6e dcff81 dcff81
02350f 073f15 0c4a1c 2d5f1e 4f7420 598324 649228 82a12e
a1b034 a9c13a b2d241 c4d945 d6e149 e4f04e f2ff53 f2ff53
263001 243803 234005 51541b 806931 978135 af993a c2a73e
d5b543 dbc03d e1cb38 e2d836 e3e534 eff258 fbff7d fbff7d
401a02 581f05 702408 8d3a13 ab511f b56427 bf7730 d0853a
e19344 eda04e f9ad58 fcb75c ffc160 ffc671 ffcb83 ffcb83
`,
        Atari800MacXnewStellaNTSC: rgbs `
000000 000000 4a4a4a 4a4a4a 6f6f6f 6f6f6f 8e8e8e 8e8e8e
aaaaaa aaaaaa c0c0c0 c0c0c0 d6d6d6 d6d6d6 ececec ececec
484800 484800 69690f 69690f 86861d 86861d a2a22a a2a22a
bbbb35 bbbb35 d2d240 d2d240 e8e84a e8e84a fcfc54 fcfc54
7c2c00 7c2c00 904811 904811 a26221 a26221 b47a30 b47a30
c3903d c3903d d2a44a d2a44a dfb755 dfb755 ecc860 ecc860
901c00 901c00 a33915 a33915 b55328 b55328 c66c3a c66c3a
d5824a d5824a e39759 e39759 f0aa67 f0aa67 fcbc74 fcbc74
940000 940000 a71a1a a71a1a b83232 b83232 c84848 c84848
d65c5c d65c5c e46f6f e46f6f f08080 f08080 fc9090 fc9090
840064 840064 97197a 97197a a8308f a8308f b846a2 b846a2
c659b3 c659b3 d46cc3 d46cc3 e07cd2 e07cd2 ec8ce0 ec8ce0
500084 500084 68199a 68199a 7d30ad 7d30ad 9246c0 9246c0
a459d0 a459d0 b56ce0 b56ce0 c57cee c57cee d48cfc d48cfc
140090 140090 331aa3 331aa3 4e32b5 4e32b5 6848c6 6848c6
7f5cd5 7f5cd5 956fe3 956fe3 a980f0 a980f0 bc90fc bc90fc
000094 000094 181aa7 181aa7 2d32b8 2d32b8 4248c8 4248c8
545cd6 545cd6 656fe4 656fe4 7580f0 7580f0 8490fc 8490fc
001c88 001c88 183b9d 183b9d 2d57b0 2d57b0 4272c2 4272c2
548ad2 548ad2 65a0e1 65a0e1 75b5ef 75b5ef 84c8fc 84c8fc
003064 003064 185080 185080 2d6d98 2d6d98 4288b0 4288b0
54a0c5 54a0c5 65b7d9 65b7d9 75cceb 75cceb 84e0fc 84e0fc
004030 004030 18624e 18624e 2d8169 2d8169 429e82 429e82
54b899 54b899 65d1ae 65d1ae 75e7c2 75e7c2 84fcd4 84fcd4
004400 004400 1a661a 1a661a 328432 328432 48a048 48a048
5cba5c 5cba5c 6fd26f 6fd26f 80e880 80e880 90fc90 90fc90
143c00 143c00 355f18 355f18 527e2d 527e2d 6e9c42 6e9c42
87b754 87b754 9ed065 9ed065 b4e775 b4e775 c8fc84 c8fc84
303800 303800 505916 505916 6d762b 6d762b 88923e 88923e
a0ab4f a0ab4f b7c25f b7c25f ccd86e ccd86e e0ec7c e0ec7c
482c00 482c00 694d14 694d14 866a26 866a26 a28638 a28638
bb9f47 bb9f47 d2b656 d2b656 e8cc63 e8cc63 fce070 fce070
`,
        Atari800MacXz26NTSC: rgbs `
000000 000000 505050 505050 646464 646464 787878 787878
8c8c8c 8c8c8c a0a0a0 a0a0a0 b4b4b4 b4b4b4 c8c8c8 c8c8c8
445400 445400 586800 586800 6c7c00 6c7c00 809000 809000
94a414 94a414 a8b828 a8b828 bccc3c bccc3c d0e050 d0e050
673900 673900 7b4d00 7b4d00 8f6100 8f6100 a37513 a37513
b78927 b78927 cb9d3b cb9d3b dfb14f dfb14f f3c563 f3c563
7b2504 7b2504 8f3918 8f3918 a34d2c a34d2c b76140 b76140
cb7554 cb7554 df8968 df8968 f39d7c f39d7c ffb190 ffb190
7d122c 7d122c 912640 912640 a53a54 a53a54 b94e68 b94e68
cd627c cd627c e17690 e17690 f58aa4 f58aa4 ff9eb8 ff9eb8
730871 730871 871c85 871c85 9b3099 9b3099 af44ad af44ad
c358c1 c358c1 d76cd5 d76cd5 eb80e9 eb80e9 ff94fd ff94fd
5d0b92 5d0b92 711fa6 711fa6 8533ba 8533ba 9947ce 9947ce
ad5be2 ad5be2 c16ff6 c16ff6 d583ff d583ff e997ff e997ff
401599 401599 5429ad 5429ad 683dc1 683dc1 7c51d5 7c51d5
9065e9 9065e9 a479fd a479fd b88dff b88dff cca1ff cca1ff
252593 252593 3939a7 3939a7 4d4dbb 4d4dbb 6161cf 6161cf
7575e3 7575e3 8989f7 8989f7 9d9dff 9d9dff b1b1ff b1b1ff
0f3480 0f3480 234894 234894 375ca8 375ca8 4b70bc 4b70bc
5f84d0 5f84d0 7398e4 7398e4 87acf8 87acf8 9bc0ff 9bc0ff
04425a 04425a 18566e 18566e 2c6a82 2c6a82 407e96 407e96
5492aa 5492aa 68a6be 68a6be 7cbad2 7cbad2 90cee6 90cee6
044f30 044f30 186344 186344 2c7758 2c7758 408b6c 408b6c
549f80 549f80 68b394 68b394 7cc7a8 7cc7a8 90dbbc 90dbbc
0f550a 0f550a 23691e 23691e 377d32 377d32 4b9146 4b9146
5fa55a 5fa55a 73b96e 73b96e 87cd82 87cd82 9be196 9be196
1f5100 1f5100 336505 336505 477919 477919 5b8d2d 5b8d2d
6fa141 6fa141 83b555 83b555 97c969 97c969 abdd7d abdd7d
344600 344600 485a00 485a00 5c6e14 5c6e14 708228 708228
84963c 84963c 98aa50 98aa50 acbe64 acbe64 c0d278 c0d278
463e00 463e00 5a5205 5a5205 6e6619 6e6619 827a2d 827a2d
968e41 968e41 aaa255 aaa255 beb669 beb669 d2ca7d d2ca7d
`,
        Atari800MacXxformer: rgbs `
000000 202020 404040 606060 7c7c7c 909090 a0a0a0 b0b0b0
bcbcbc c8c8c8 d4d4d4 e0e0e0 e8e8e8 f0f0f0 f8f8f8 fcfcfc
181400 302800 603c04 785008 8c6c0c 9c8418 b0a830 bcb044
c4c050 d0cc5c d8d468 dcdc74 e0e084 e4e490 e8e89c ececa4
241400 382400 503400 705000 907004 ac8404 bc9c28 c4ac44
ccb860 d4bc68 dcc470 e4c878 eccc80 f0d490 f4dc9c f8e0a0
2c0c04 481408 6c1c10 902c20 b05034 b86040 c47054 cc7864
d48c78 d89888 dca894 e0ac98 e4b09c e4b8a0 e8c0a8 ecc4b0
2c040c 581824 942844 a83c58 b45470 c06078 c86880 d07088
d47890 d88498 dc8ca0 e094a8 e49cb0 e8a4b4 eca8b8 f0acbc
30002c 500848 701068 9c2094 c048c4 d460d4 dc74dc e080e0
e48ce4 e894e8 ec9cec eca4ec eca8ec ecacec ecb0ec f0b4f0
140440 280880 5828b8 6c3cc4 8054cc 8c64d0 9870d4 a080d8
a88cdc b094e0 b898e4 bca0e4 c0a4e8 c4ace8 c8b0ec ccb4ec
000034 101068 2828b8 4848c4 6060d4 6c6cd8 7878dc 8484e0
9090e4 9c9ce4 a4a4e8 acace8 b0b0ec b8b8f0 c0c0f4 c4c4f8
041c48 083478 0c4ca8 1060a8 2470b4 3880c0 448ccc 5094d4
609cdc 70a4e0 7cb0e4 88b8e4 94bce8 9cc0e8 a4c4ec a8c8f0
041030 081858 0c2880 143c90 205098 3c64b0 5478bc 6088c4
6c98d0 74a8d8 7cb0dc 84b8e0 90bce4 98c4e8 a0c8ec a8ccf0
00241c 044838 086850 0c8c6c 10a884 18bc98 38ccb0 48d4b8
58dcc4 64e0cc 70e4d0 80e8d4 90ecdc a0f0e0 b0f4e4 b4f8e8
002804 00400c 045814 14841c 24b040 38c054 4ccc60 58d070
60d47c 78dc8c 90e498 9ce8a4 a4ecb0 acecbc b8ecc4 bcf0c8
0c2800 185000 247804 389410 48b01c 58b830 68c044 74c858
84d068 90d870 98dc78 a0e084 a8e490 b4e89c c0eca8 c4f0ac
142400 2c5800 448c04 5ca808 74c020 88c830 98cc44 a0d054
a8d460 b0d86c b8dc74 bce07c c0e488 c8e894 d0eca0 d4f0a8
201c00 4c4000 706010 847c18 c09820 d0b030 dcc83c e4d04c
e8d858 e8e060 ece468 ece874 f0e884 f4ec8c f4ec90 f8f098
201400 342400 583804 80540c a87414 b4841c c09030 c89c48
d4a860 d8b46c dcb878 e0bc84 e4c490 e8c898 e8d49c ecd8a0
`,
    };

    const palette = colorPalettes[options.colorPalette];
    function antic2rgb(color) {
        if (color == null)
            return undefined;
        if (!Number.isInteger(color) || color < 0 || color > 255) {
            throw new Error(`DisplayLayer: Invalid antic color ${color}`);
        }
        return palette[color >> 1];
    }
    const DisplayComponent = {
        onbeforeupdate({ attrs: { display } }) {
            // false prevents diff for current element
            return display.dirty;
        },
        view: ({ attrs: { class: kls = [], display, glyphComponent } }) => {
            var _a;
            const gc = glyphComponent !== null && glyphComponent !== void 0 ? glyphComponent : GlyphComponent, f = display.fontmap, sz = f.glyphSize, mx = f.glyphsPerRow * sz, my = Math.ceil(f.numGlyphs / f.glyphsPerRow) * sz, 
            // emulate pointer-events: visible https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events
            visible = ((_a = display.opacity) !== null && _a !== void 0 ? _a : 1) > 0;
            //TODO clean up the styles here
            return mithril('.display-layer', {
                class: cx(css `
                        position: relative;
                        width: ${sz * display.width}px;
                        height: ${sz * display.height}px;
                        opacity: ${display.opacity};
                        background-color: ${antic2rgb(display.layerColor)};
                        pointer-events: ${display.layerColor != null ? 'auto' : 'none'};
                        /* set default glyph fg/bg colors to be overridden as needed */
                        .glyph {
                            position: absolute;
                            width: ${sz}px;
                            height: ${sz}px;
                            background-color: ${antic2rgb(display.backgroundColor)};
                            pointer-events: ${visible && display.backgroundColor != null ? 'auto' : 'none'}
                        }
                        .glyph-foreground {
                            width: 100%;
                            height: 100%;
                            position: absolute;
                            image-rendering: pixelated;
                            -webkit-mask-image: url(${f.maskImage});
                            mask-image: url(${f.maskImage});
                            -webkit-mask-size: ${mx}px ${my}px;
                            mask-size: ${mx}px ${my}px;
                            background-color: ${antic2rgb(display.foregroundColor)};
                            pointer-events: ${visible && display.foregroundColor != null ? 'auto' : 'none'}
                        }
                    `, ...(typeof (kls) === 'string' ? [kls] : kls)),
            }, display.spritelist().map(g => mithril(SpriteComponent, { key: g.key, g, f, gc, defaults: display.opts })));
        }
    };
    function maybeAnimate(elt, animate, f) {
        if (!elt)
            return;
        if (animate == null) {
            elt.getAnimations().forEach(a => a.cancel());
            // also deal with the class-based animation we're using as a workaround
            const kids = elt.getElementsByClassName('glyph-foreground');
            if (kids.length) {
                const kid = kids[0], animClass = kid.dataset.animClass;
                if (animClass)
                    kid.classList.remove(animClass);
            }
            return;
        }
        switch (animate) {
            case 0 /* GlyphAnimation.blink */:
                elt.animate([
                    { opacity: 0.0 },
                    { opacity: 0.0 },
                    { opacity: 1.0 },
                    { opacity: 1.0 },
                ], { duration: 1000, easing: 'ease-in', iterations: Infinity });
                break;
            case 1 /* GlyphAnimation.flash */:
            case 2 /* GlyphAnimation.flash_reverse */:
                {
                    const kids = elt.getElementsByClassName('glyph-foreground');
                    if (!kids.length)
                        break;
                    const kid = kids[0], dir = animate == 1 /* GlyphAnimation.flash */ ? 'normal' : 'reverse', flashFrames = keyframes `
                        0% {
                            -webkit-mask-image: none;
                            mask-image: none
                        }
                        100% {
                            -webkit-mask-image: url(${f.maskImage});
                            mask-image: url(${f.maskImage});
                        }
                    `, anim = css `animation: ${flashFrames} 250ms infinite ${dir};`;
                    kid.classList.add(anim);
                    kid.dataset.animClass = anim;
                    // Chrome bug: doesn't work in WAAPI, see https://stackoverflow.com/questions/74966631/how-do-i-use-chromes-webkit-mask-image-in-the-web-animations-api
                    /*
                    kids[0].animate(
                        [
                            {
                                webkitMaskImage: 'none',
                                maskImage: 'none',
                            },
                            {
                                webkitMaskImage: `url(${f.maskImage})`,
                                maskImage: `url(${f.maskImage})`,
                            },
                        ],
                        {duration: 125, iterations: Infinity, direction: dir}
                    );
                    */
                }
                break;
            default: {
                const fail = animate;
                throw new Error(`Unhandled animation type: ${fail}`);
            }
        }
    }
    // background block that positions the glyph
    const SpriteComponent = {
        oncreate: ({ dom, attrs: { g: { animate }, f } }) => maybeAnimate(dom, animate, f),
        onupdate: ({ dom, attrs: { g: { animate }, f } }) => maybeAnimate(dom, animate, f),
        view: ({ attrs: { g, f, gc, defaults } }) => {
            var _a, _b;
            if (((_a = g.opacity) !== null && _a !== void 0 ? _a : 1) == 0) {
                return; // skip invisible glyphs
            }
            const sz = f.glyphSize;
            return mithril('.glyph', {
                onclick: g.onclick,
                onmouseover: g.onmouseover,
                style: {
                    opacity: g.opacity,
                    'background-color': antic2rgb(g.invert
                        ? ((_b = g.foregroundColor) !== null && _b !== void 0 ? _b : defaults.foregroundColor)
                        : g.backgroundColor),
                    'pointer-events': g.backgroundColor != null ? 'auto' : null,
                    transform: `translate(${g.x * sz}px, ${g.y * sz}px)`,
                },
            }, mithril(gc, { g, f, defaults }));
        }
    };
    // a nil glyph which draws blocks of backgroundColor ignoring font and foreground
    const BlockComponent = {
        view: () => null,
    };
    // foreground masked block that draws the character within a block
    const GlyphComponent = {
        view: ({ attrs: { g, f, defaults } }) => {
            var _a, _b, _c;
            if (((_a = g.opacity) !== null && _a !== void 0 ? _a : 1) == 0) {
                return;
            }
            const { glyphSize: sz, glyphsPerRow: nc } = f;
            return mithril('.glyph-foreground', {
                style: {
                    'background-color': antic2rgb(g.invert
                        ? ((_c = (_b = g.backgroundColor) !== null && _b !== void 0 ? _b : defaults.backgroundColor) !== null && _c !== void 0 ? _c : defaults.layerColor)
                        : g.foregroundColor),
                    'pointer-events': g.foregroundColor != null ? 'auto' : null,
                    '-webkit-mask-position': `${-(g.c % nc) * sz}px ${-Math.floor(g.c / nc) * sz}px`,
                    'mask-position': `${-(g.c % nc) * sz}px ${-Math.floor(g.c / nc) * sz}px`,
                }
            });
        }
    };

    var _AppView_pinmap;
    const screenWidth = 42, screenHeight = 24, mapHeight = 18;
    class AppView {
        constructor(app, help) {
            _AppView_pinmap.set(this, void 0); // the glyph coordinate to pin at map center
            this.app = app;
            this.help = help;
            mithril.mount(document.body, { view: () => mithril(Layout, { view: this }) });
            window.addEventListener('resize', () => this.redraw());
        }
        redraw() {
            mithril.redraw();
        }
        scrollForMapCenter() {
            if (!__classPrivateFieldGet(this, _AppView_pinmap, "f"))
                return;
            const { x, y } = __classPrivateFieldGet(this, _AppView_pinmap, "f"), z = this.app.zoom ? 2 : 1, sz = z * this.app.mapLayer.fontmap.glyphSize, xc = screenWidth / 2 / z, yc = mapHeight / 2 / z;
            return { left: (x - xc) * sz, top: (y - yc) * sz };
        }
        unpinMap() {
            __classPrivateFieldSet(this, _AppView_pinmap, undefined, "f");
        }
        pinMapCenter(x, y) {
            if (x != null && y != null) {
                __classPrivateFieldSet(this, _AppView_pinmap, { x, y }, "f");
                return;
            }
            const z = (this.app.zoom ? 2 : 1), sz = z * this.app.mapLayer.fontmap.glyphSize, xc = screenWidth / 2 / z, yc = mapHeight / 2 / z;
            const elts = document.getElementsByClassName('map-scroller');
            if (elts.length == 0)
                return;
            const elt = elts[0];
            __classPrivateFieldSet(this, _AppView_pinmap, {
                x: elt.scrollLeft / sz + xc,
                y: elt.scrollTop / sz + yc,
            }, "f");
        }
    }
    _AppView_pinmap = new WeakMap();
    document.body.style.backgroundColor = antic2rgb(0xD4);
    const Layout = {
        view: ({ attrs: { view } }) => {
            // find the max integer scaling we can use based on (screenWidth x screenHeight) 8 pix chars
            const scale = Math.floor(Math.min(window.innerWidth / screenWidth, window.innerHeight / screenHeight) / 8) || 1;
            return mithril('.layout', {
                class: css `
                    padding: 12px;
                    height: 100vh;
                    width: 100vw;
                `
            }, mithril('.screen', {
                class: css `
                        width: ${screenWidth * 8}px;
                        height: ${screenHeight * 8}px;
                        transform: translate(-50%, -50%) scale(${scale});
                        position: fixed;
                        top: 50%;
                        left: 50%;
                    `,
            }, view.app.help ? mithril(HelpComponent, { help: view.help }) : mithril(GameComponent, { view })));
        }
    };
    const HelpComponent = {
        onupdate: ({ attrs: { help: { window } } }) => {
            window.dirty = false;
        },
        view: ({ attrs: { help: { window } } }) => {
            return mithril(DisplayComponent, {
                display: window,
                class: 'help',
            });
        },
    };
    const GameComponent = {
        // called after DOM element is updated,  guaranteed to run at the end of the render cycle
        onupdate: ({ attrs: { view: { app } } }) => {
            Object.values(app)
                .filter(v => v instanceof DisplayLayer)
                .forEach(layer => layer.dirty = false);
        },
        view: ({ attrs: { view } }) => {
            return [
                // double-width date-window at the top
                mithril(DisplayComponent, {
                    display: view.app.dateWindow,
                    class: ['game', css `
                    transform-origin: top left;
                    transform: scale(2, 1);
                `],
                }),
                mithril(DividerComponent, { color: 0x1A }),
                mithril(MapComponent, { view }),
                mithril(DividerComponent, { color: 0x02 }),
                mithril(DisplayComponent, { display: view.app.infoWindow }),
                mithril(DividerComponent, { color: 0x8A }),
                mithril(DisplayComponent, { display: view.app.errorWindow }),
                mithril(DividerComponent, { color: 0x8A }),
            ];
        }
    };
    const MapComponent = {
        onupdate: ({ attrs: { view }, dom: elt }) => {
            // possibly center the map on a target x,y square
            const pin = view.scrollForMapCenter();
            if (!pin)
                return;
            elt.scrollTo(pin.left, pin.top);
            view.unpinMap();
        },
        view: ({ attrs: { view: { app } } }) => {
            // central fixed-size window containing the scrollable map
            return mithril('.map-scroller', {
                class: css `
                    height: ${mapHeight * 8}px;
                    overflow: scroll;
                `,
            }, 
            // the full-sized map
            mithril('.map-panel', {
                class: css `
                        width: ${app.mapLayer.width * 8}px;
                        height: ${app.mapLayer.height * 8}px;
                        overflow: hidden;
                        position: relative;
                        transform-origin: top left;

                        /* stack the layers */
                        .display-layer {
                            position: absolute;
                            top: 0;
                        }
                    `,
                style: { transform: app.zoom ? 'scale(2)' : null },
            }, [
                // bottom layer showing terrain
                mithril(DisplayComponent, {
                    display: app.mapLayer,
                    class: [
                        'terrain',
                        css `
                                .display-layer, .glyph-foreground {
                                    transition: background-color 1s linear;
                                }
                            `
                    ],
                }),
                // conditionally show text labels near cities
                app.extras && mithril(DisplayComponent, {
                    display: app.labelLayer,
                    glyphComponent: LabelComponent,
                    class: [
                        'labels',
                        css `
                                pointer-events: none;
                            `
                    ],
                }),
                // layer with unit icons as sprites
                mithril(DisplayComponent, {
                    display: app.unitLayer,
                    glyphComponent: UnitComponent,
                    class: [
                        'units',
                        css `
                                .glyph {
                                    transition: transform 250ms linear;
                                    transition: opacity 500ms linear;
                                }
                                .glyph-background, .glyph-foreground {
                                    transition: background-color 1s linear;
                                }
                            `
                    ],
                }),
                // conditionally show current order paths for all units
                app.extras && mithril(OrdersOverlayComponent, {
                    display: app.unitLayer,
                }),
                // conditionally show a semit-transparent mask to highlight unit reach
                app.extras && mithril(DisplayComponent, {
                    display: app.maskLayer,
                    glyphComponent: BlockComponent,
                    class: [
                        'mask',
                        css `
                                opacity: 0.33;
                                .glyph {
                                    pointer-events: none;
                                }
                            `
                    ]
                }),
                // show animated orders for focussed unit
                mithril(DisplayComponent, {
                    display: app.kreuzeLayer,
                    glyphComponent: KreuzeComponent,
                    class: ['kreuze'],
                }),
            ]));
        }
    };
    const DividerComponent = {
        view: ({ attrs: { color } }) => {
            return mithril('.' + css `
            height: 2px;
            background-color: ${antic2rgb(color)};
        `);
        }
    };
    const LabelComponent = {
        view: ({ attrs: { g: { props }, defaults: { foregroundColor } } }) => {
            const label = props === null || props === void 0 ? void 0 : props.label, points = props === null || props === void 0 ? void 0 : props.points;
            return mithril('.' + css `
                transform: translate(4px, 0);
                font-family: verdana;
                width: 0;
                white-space: nowrap;
                div {
                    justify-content: center;
                    display: flex;
                }
            `, [
                mithril('.' + css `
                        transform: translate(0, -4px);
                        font-size: 2pt;
                        color: ${antic2rgb(foregroundColor)};
                    `, label),
                (points || null) && mithril('.' + css `
                        transform: translate(0, -2.5px);
                        text-shadow: 0 0 0.5px ${antic2rgb(0x02)};
                        font-weight: bold;
                        font-size: 5px;
                        color: ${antic2rgb(0x96)}
                    `, points),
            ]);
        }
    };
    const modeIcons = {
        // mdi icons, all with viewBox="0 0 24 24" and icon in [6,18] square
        [1 /* UnitMode.assault */]: "M5,5V19H8V5M10,5V19L21,12",
        [2 /* UnitMode.march */]: "M13,6V18L21.5,12M4,18L12.5,12L4,6V18Z",
        [3 /* UnitMode.entrench */]: "M18,18H6V6H18V18Z", // mdi-stop
    };
    // extend Glyph component to conditionally overlay unit annotations
    const UnitComponent = {
        view: ({ attrs }) => {
            const { g: { props }, f: { glyphSize: sz } } = attrs;
            const cstrng = props === null || props === void 0 ? void 0 : props.cstrng, mstrng = props === null || props === void 0 ? void 0 : props.mstrng, mode = props === null || props === void 0 ? void 0 : props.mode, oos = props === null || props === void 0 ? void 0 : props.oos, enter = props === null || props === void 0 ? void 0 : props.enter, ramp = [0x68, 0x38, 0x18, 0xc8].map(antic2rgb), cutoff = [1 / 4, 1 / 2, 3 / 4];
            let cfill = '';
            if (cstrng != null && mstrng != null) {
                let i = 0;
                while (i < cutoff.length && cstrng / mstrng > cutoff[i])
                    i++;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                cfill = ramp[i];
            }
            return [
                mithril(GlyphComponent, attrs),
                mithril('svg[version="1.1"][xmlns="http://www.w3.org/2000/svg"].unit-overlay', {
                    width: sz + 3,
                    height: sz + 3,
                    viewBox: `-1 -1 ${sz + 3} ${sz + 3}`,
                    class: css `
                        position: absolute;
                        top: -1px;
                        left: -1px;
                        filter: drop-shadow(0 0 0.5px ${antic2rgb(0x02)});
                    `
                }, mithril('g', {
                    transform: 'scale(8)',
                }, [
                    // movement mode symbol
                    (mode != null && mode != 0 /* UnitMode.standard */) &&
                        mithril('path', {
                            transform: `translate(1, 0) scale(.04) translate(-15, -6)`,
                            d: modeIcons[mode],
                            fill: antic2rgb(0x96),
                        }),
                    // indicator dot for new entry or OoS
                    (oos || enter) &&
                        mithril('circle', { cx: 1 / 8, cy: 1 / 8, r: 1 / 8, fill: oos ? ramp[0] : ramp[3] }),
                    // health bar
                    (cstrng != null && mstrng != null) &&
                        mithril('g', [
                            mithril('rect', { x: 1 / 8, y: 7 / 8, height: 1 / 8, width: 7 / 8 * mstrng / 255, rx: 1 / 16, opacity: 0.5, fill: cfill }),
                            mithril('rect', { x: 1 / 8, y: 7 / 8, height: 1 / 8, width: 7 / 8 * cstrng / 255, rx: 1 / 16, fill: cfill }),
                        ]),
                ]))
            ];
        }
    };
    const OrdersOverlayComponent = {
        onbeforeupdate({ attrs: { display } }) {
            // false prevents diff for current element
            return display.dirty;
        },
        view: ({ attrs: { display } }) => {
            const f = display.fontmap, sz = f.glyphSize, sprites = display.spritelist().filter(g => g.opacity);
            return mithril('svg[version="1.1"][xmlns="http://www.w3.org/2000/svg"].unit-overlay', {
                width: sz * display.width,
                height: sz * display.height,
                class: css `
                    position: relative;
                    pointer-events: ${display.layerColor != null ? 'auto' : 'none'};
                    filter: drop-shadow(0 0 0.5px ${antic2rgb(0x02)});
                `
            }, [
                mithril('g', {
                    transform: 'scale(8)',
                    opacity: 0.5
                }, sprites.filter(g => { var _a; return (_a = g.props) === null || _a === void 0 ? void 0 : _a.orders; }).map(g => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const { orders, contrast, fly } = g.props, fg = antic2rgb(contrast !== null && contrast !== void 0 ? contrast : g.foregroundColor);
                    return mithril('g', {
                        key: g.key,
                        // unit icon centers are 1 pixel offset, so adjust by 1/16
                        transform: `translate(${g.x + 0.5625},${g.y + 0.5625}) scale(-1)`,
                        class: css `
                                    fill: ${fg};
                                    stroke: ${fg};
                                    stroke-linecap: round;
                                    stroke-width: 1px;
                                `
                    }, mithril(UnitPathComponent, { orders, fly }));
                })),
            ]);
        }
    };
    function kreuzeAnimation(elt, g) {
        var _a, _b;
        // animate the path arrows, and transform the kreuze itself to the unit position
        // we cheat a bit with arrow and kreuze position so they align with the unit's 1px offest in the 8x8 square
        const orders = ((_b = (_a = g.props) === null || _a === void 0 ? void 0 : _a.orders) !== null && _b !== void 0 ? _b : []), arrow = Object.values(directions).findIndex(d => d.icon == g.c), steps = [{
                transform: 'translate(1px, 1px)',
                opacity: orders.length && orders[0] == arrow ? 1 : 0
            }];
        let dx = 0, dy = 0;
        orders.forEach(d => {
            const { dlon, dlat } = directions[d];
            for (let i = 0; i < 2; i++) {
                // take two half steps so opacity transition is quicker
                dx -= dlon / 2;
                dy -= dlat / 2;
                steps.push({ transform: `translate(${dx * 8 + 1}px, ${dy * 8 + 1}px)`, opacity: d == arrow ? 1 : 0 });
            }
        });
        if (arrow == -1) { // the Kreuze
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            elt.style.transform = `translate(${dx * 8 + 0.5}px, ${dy * 8 + 0.5}px)`;
        }
        else {
            elt.getAnimations().forEach(a => a.cancel());
            if (orders.length) {
                elt.animate(steps, { duration: 500 * orders.length, iterations: Infinity });
            }
        }
    }
    const KreuzeComponent = {
        oncreate: ({ dom, attrs: { g } }) => kreuzeAnimation(dom, g),
        onupdate: ({ dom, attrs: { g } }) => kreuzeAnimation(dom, g),
        view: GlyphComponent.view,
    };
    const UnitPathComponent = {
        view: ({ attrs: { orders, fly } }) => {
            // form the path element from the list of orders
            const r = 0.25;
            let x = 0, y = 0, lastd = null, s = "M0,0";
            orders.forEach(d => {
                const { dlon: dx, dlat: dy } = directions[d];
                // add prev corner
                if (lastd == null) {
                    s = `M${dx * r},${dy * r}`;
                }
                else {
                    const turn = (lastd - d + 4) % 4;
                    if (turn == 0) {
                        s += ` l${dx * 2 * r},${dy * 2 * r}`;
                    }
                    else if (turn % 2) {
                        const cx = (dx + directions[lastd].dlon) * r, cy = (dy + directions[lastd].dlat) * r;
                        s += ` a${r},${r} 0 0 ${turn == 1 ? 0 : 1} ${cx},${cy}`;
                    }
                }
                lastd = d;
                s += ` l${dx * (1 - 2 * r)},${dy * (1 - 2 * r)}`;
                x += dx;
                y += dy;
            });
            if (orders.length)
                s += ` L${x},${y}`;
            return [
                mithril('path', {
                    d: s,
                    class: css `
                    fill: none;
                    stroke-dasharray: ${fly ? '1 2' : null};
                    vector-effect: non-scaling-stroke;
                `
                }),
                orders.length
                    ? mithril('circle', {
                        r, cx: x, cy: y,
                        class: css `
                        stroke: none;
                    `
                    })
                    : undefined
            ];
        }
    };

    var _HelpModel_init;
    const helpScrambleMillis = 2000, helpUrl = 'https://github.com/patricksurry/eastern-front-1941', helpText = ('\fh\fb\x94' + ' '.repeat(42 * 12)
        + '\fb\x1a' + ' '.repeat(42 * 12)
        + `\fH\fb\x94\f^

Eastern Front  1941
by Chris Crawford


\fc\x08Redux\fc\x90}\fc\x08 by Patrick Surry\fC


\f^Press any key to start!


\fb\x1a\fc\x94\f@\x03<
Pick unit: \f#Click\f-, \f#<\f- \f#>\f- or \f#p\f-rev \f#n\f-ext

Give orders: \f#\x1c\f- \f#\x1f\f- \f#\x1d\f- \f#\x1e\f- \f#Bksp\f-, \f#Esc\f-, \f#Enter\f-

Execute move: \f#End\f- or \f#Shift\f-+\f#Enter\f-

Expert: change move \f#m\f-ode or \f#1\f- \f#2\f- \f#3\f- \f#4\f-

Toggle: help \f#?\f-, \f#z\f-oom, e\f#x\f-tras, debu\f#g\f-
`);
    class HelpModel {
        constructor(clickHandler) {
            this.window = new MappedDisplayLayer(42, 24, atasciiFont);
            _HelpModel_init.set(this, false);
            this.clickHandler = clickHandler;
        }
        paint(p, scramble) {
            if (!__classPrivateFieldGet(this, _HelpModel_init, "f")) {
                __classPrivateFieldSet(this, _HelpModel_init, true, "f");
                const t0 = +new Date();
                p = 0;
                scramble = this.window.glyphs.map(row => row.map(() => Math.random()));
                const paintScrambled = setInterval(() => {
                    const pp = (+new Date() - t0) / helpScrambleMillis;
                    this.paint(pp, scramble);
                    mithril.redraw();
                    if (pp >= 1)
                        clearInterval(paintScrambled);
                }, 250);
            }
            this.window.cls();
            this.window.puts(helpText, { onclick: this.clickHandler });
            this.window.glyphs.forEach(line => line.forEach(g => {
                if (g === null || g === void 0 ? void 0 : g.foregroundColor)
                    g.onclick = () => window.open(helpUrl);
            }));
            if (p != null && scramble != null) {
                scramble.forEach((line, y) => line.forEach((v, x) => {
                    if (p < v) {
                        this.window.putc(Math.floor(Math.random() * 128), {
                            x, y,
                            foregroundColor: Math.floor(Math.random() * 256),
                            backgroundColor: Math.floor(Math.random() * 256),
                        });
                    }
                }));
            }
        }
    }
    _HelpModel_init = new WeakMap();

    var _AppCtrl_game, _AppCtrl_ai;
    const errctr = '\fx\x06\fe\f@\x16^'; // fmt code to clear window from x=6, then center @ $16 = 22, see antic model
    class AppCtrl {
        constructor() {
            _AppCtrl_game.set(this, void 0);
            // placeholder to allow AI v AI, human Russian or both human play
            _AppCtrl_ai.set(this, void 0);
            this.app = new AppModel();
            this.help = new HelpModel(() => this.app.help = !this.app.help);
            this.view = new AppView(this.app, this.help);
            const token = window.location.hash.slice(1) || undefined;
            if (token) {
                this.game = new Game(token);
                this.setMode(1 /* UIModeKey.orders */);
                this.app.help = false;
            }
            else {
                this.setMode(0 /* UIModeKey.setup */);
            }
            this.help.paint();
            document.addEventListener('keydown', (e) => this.keyHandler(e));
        }
        get game() { return __classPrivateFieldGet(this, _AppCtrl_game, "f"); }
        set game(g) {
            __classPrivateFieldSet(this, _AppCtrl_game, g, "f");
            this.app.game = g;
            //TODO need to kill/stop old ones?
            __classPrivateFieldSet(this, _AppCtrl_ai, Object.keys(players)
                .filter(player => +player != __classPrivateFieldGet(this, _AppCtrl_game, "f").human)
                .map(player => new Thinker(__classPrivateFieldGet(this, _AppCtrl_game, "f"), +player)), "f");
            // scroll the map to the center of mass of the human player's
            const p = this.game.oob.centerOfGravity(this.game.human), { x, y } = this.game.mapboard.xy(p);
            this.view.pinMapCenter(x + 0.5, y + 0.5);
            this.view.redraw();
            g.on('game', (action) => {
                switch (action) {
                    case 'turn':
                    case 'over':
                        this.app.paintMap();
                        this.app.paintUnits();
                        if (this.app.uimode == 2 /* UIModeKey.resolve */)
                            this.setMode(1 /* UIModeKey.orders */);
                        break;
                    case 'tick':
                        this.app.paintUnits();
                        break;
                    default: {
                        const fail = action;
                        throw new Error(`Unhandled game action: ${fail}`);
                    }
                }
                this.view.redraw();
            }).on('map', (action, loc) => {
                switch (action) {
                    case 'citycontrol':
                        if (this.app.extras) {
                            const city = this.game.mapboard.cities[loc.cityid], playerName = players[city.owner].label.toUpperCase() + 'S', cityName = city.label.toUpperCase();
                            this.app.infoWindow.puts(`\fh\f^${playerName} CAPTURE ${cityName}!`);
                            this.app.paintMap();
                        }
                        break;
                    default: {
                        const fail = action;
                        throw new Error(`Unhandled map action: ${fail}`);
                    }
                }
            }).on('unit', (action, u) => {
                if (action == 'orders') {
                    this.app.paintUnit(u);
                    // update game state if human modified orders
                    if (u.human)
                        window.location.hash = g.token;
                }
                else if (action == 'exit' && this.app.extras) {
                    this.app.infoWindow.puts(`\fh\f^${u.label}\nELIMINATED!`);
                }
                // the rest of the actions happen during turn processing, which we pick up via game.tick
            }).on('message', (_, message) => {
                this.app.errorWindow.puts(`${errctr}${message}`);
            });
        }
        keyHandler(event) {
            const modifiers = keyModifiers(event);
            let handled = globalHandler(event.key, modifiers, this);
            if (!handled) {
                handled = modeHandlers[this.app.uimode](event.key, modifiers, this);
            }
            if (handled) {
                if (this.app.uimode == 1 /* UIModeKey.orders */ && !this.app.errorWindow.dirty) {
                    // in orders mode, clear error past score if nothing else wrote to the err window
                    this.app.errorWindow.puts(errctr);
                }
                this.view.redraw();
                event.preventDefault(); // eat event if handled
            }
        }
        setMode(m) {
            this.app.uimode = m;
            switch (m) {
                case 0 /* UIModeKey.setup */:
                    this.app.dateWindow.puts('\fh\n\f^EASTERN FRONT 1941');
                    this.app.infoWindow.puts('\fh\f^COPYRIGHT 1982 ATARI\nALL RIGHTS RESERVED');
                    this.setScenario(1 /* ScenarioKey.learner */);
                    break;
                case 1 /* UIModeKey.orders */: {
                    // save the new game state
                    window.location.hash = __classPrivateFieldGet(this, _AppCtrl_game, "f").token;
                    // start thinking...
                    __classPrivateFieldGet(this, _AppCtrl_ai, "f").forEach(t => t.thinkRecurring(250));
                    const date = __classPrivateFieldGet(this, _AppCtrl_game, "f").date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
                    this.app.dateWindow.puts(`\fh\n\f^${date}`);
                    this.app.infoWindow.cls();
                    this.app.errorWindow.puts(`\fh\f@\x05>${__classPrivateFieldGet(this, _AppCtrl_game, "f").score(__classPrivateFieldGet(this, _AppCtrl_game, "f").human)}`);
                    if (this.game.over) {
                        const g = __classPrivateFieldGet(this, _AppCtrl_game, "f"), advice = g.score(g.human) >= scenarios[g.scenario].scoring.win
                            ? 'ADVANCE TO NEXT LEVEL'
                            : 'TRY AGAIN';
                        this.app.infoWindow.puts(`\fh\f^GAME OVER\n${advice}`);
                        this.app.errorWindow.puts(`${errctr}PRESS \f#ENTER\f- TO CONTINUE`);
                    }
                    else {
                        this.app.errorWindow.puts(`${errctr}PLEASE ENTER YOUR ORDERS NOW`);
                    }
                    break;
                }
                case 2 /* UIModeKey.resolve */: {
                    // finalize AI orders
                    __classPrivateFieldGet(this, _AppCtrl_ai, "f").forEach(t => t.finalize());
                    this.app.focusOff();
                    this.app.infoWindow.cls();
                    this.app.errorWindow.puts(`${errctr}EXECUTING MOVE`);
                    console.log(`Executing turn ${__classPrivateFieldGet(this, _AppCtrl_game, "f").turn} from state ${__classPrivateFieldGet(this, _AppCtrl_game, "f").token}`);
                    __classPrivateFieldGet(this, _AppCtrl_game, "f").resolveTurn(100);
                    break;
                }
            }
        }
        setScenario(scenario, inc) {
            inc !== null && inc !== void 0 ? inc : (inc = 0);
            const n = Object.keys(scenarios).length;
            if (scenario == null) {
                scenario = (__classPrivateFieldGet(this, _AppCtrl_game, "f").scenario + inc + n) % n;
            }
            this.game = new Game(scenario);
            const label = scenarios[__classPrivateFieldGet(this, _AppCtrl_game, "f").scenario].label.padEnd(8, ' ');
            this.app.errorWindow.puts(`\fh\f^\f#<\f- ${label} \f#>\f-    \f#ENTER\f- TO START`);
        }
        editUnitMode(mode) {
            const u = this.app.focussed();
            if (!u)
                return;
            if (mode == null)
                u.nextmode();
            else
                u.mode = mode;
            this.app.focusOn(u); // redraw reach
        }
        editOrders(dir) {
            // dir => add step, -1 => remove step, null => clear or unfocus
            const u = this.app.focussed();
            if (!u)
                return;
            if (!u.human) {
                this.app.errorWindow.puts(`${errctr}THAT IS A ${players[u.player].label.toUpperCase()} UNIT!`);
                return;
            }
            if (dir == null) {
                if (u.orders.length == 0) {
                    this.app.focusOff();
                    return;
                }
                u.resetOrders();
            }
            else if (u.kind == 2 /* UnitKindKey.air */ && u.mode == 1 /* UnitMode.assault */) {
                if (!(dir in directions)) {
                    u.resetOrders();
                }
                else {
                    // air support towards next unit in given direction
                    u.setOrdersSupportingFriendlyFurther(dir);
                }
            }
            else if (dir == -1) {
                u.delOrder();
            }
            else {
                u.addOrder(dir);
            }
        }
    }
    _AppCtrl_game = new WeakMap(), _AppCtrl_ai = new WeakMap();

    function start() {
        new AppCtrl();
    }

    exports.start = start;

    return exports;

})({}, window);
//# sourceMappingURL=ef1941.js.map
