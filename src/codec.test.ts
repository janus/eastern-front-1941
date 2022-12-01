import {lfsr24} from './rng';
import {
    str2seq, seq2str,
    wrap64, unwrap64,
    fletcher6,
    bitsencode, bitsdecode,
    fibencode, fibdecode,
    rlencode, rldecode,
    zigzag, zagzig,
    ravel, unravel,
} from './codec';


const fibs = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811],
    fibs2 = [-8, 5, -3, 2, -1, 1, 0, 1, 1, 2, 3, 5, 8];

test("ravel is reversible", () => {
    const vs = [3,4,5];
    expect(unravel(ravel(vs), vs.length)).toEqual(vs);
});

test("ravel is bijective", () => {
    const xs = Object.keys([...Array(100)]),
        vs = xs.flatMap(x => xs.map(y => ravel([+x, +y])));
    expect(vs.length).toBe(100*100);
    expect(new Set(vs).size).toBe(100*100);
});

test("zigzag+ravel is reversible", () => {
    const vs = fibs2.slice(0,5);
    expect(zagzig(unravel(ravel(zigzag(vs)),vs.length))).toEqual(vs);
});

test("zigzag is reversible", () => {
    expect(zagzig(zigzag(fibs2))).toEqual(fibs2);
})

test("zigzag is compact", () => {
    let xs: number[] = [], 
        ys: number[] = [];
    for (let k=0; k<31; k++) {
        xs.push(k-15);
        ys.push(k);
    }
    expect(zigzag(xs).sort((a, b) => (a - b))).toEqual(ys);
})

test("run-length is reversible", () => {
    let vs = [0, 1, 1, 1, 1, 2, 2, 3, 4, 5, 5, 6, 7, 8, 8, 8];
    expect(rldecode(rlencode(vs))).toEqual(vs);

    expect(rldecode(rlencode(vs, 4), 4)).toEqual(vs);
})

test("codec throws on negative", () => {
    expect(() => fibencode(fibs2)).toThrow();
})

test("codec uses 64 chrs", () => {
    // need to simulate a small-number-biased distrib with runs of zeros particularly
    // since that's the only way to get long sequences of 1s
    let rng = lfsr24(112358),
        vs = [...Array(1<<12).keys()]
            .map(k => Math.floor(Math.exp(10.*rng.bits(24)/(1<<24))) - 1),
        s = fibencode(vs),
        uniq = new Set(s);
    expect(uniq.size).toBe(64);
})

test("str2seq is reversible", () => {
    const vs = fibs.slice(0, 10);
    expect(str2seq(seq2str(vs))).toEqual(vs);
})

test("seq2str throws on bad value", () => {
    expect(() => seq2str(fibs)).toThrow();
})

test("str2seq throws on bad char", () => {
    expect(() => str2seq('abc/@')).toThrow();
})

test("codec is reversible", () => {
    expect(fibdecode(fibencode(fibs))).toEqual(fibs);
})

test("codec+zigzag is reversible", () => {
    expect(zagzig(fibdecode(fibencode(zigzag(fibs2))))).toEqual(fibs2);
})

test("bitsencode is reversible", () => {
    const v = 0xEF41CC;
    expect(bitsdecode(bitsencode(v, 24), 24)).toEqual(v);
})

test("fletcher6 is two chars", () => {
    expect(fletcher6(str2seq('abcdef')).length == 2);
})

test("fletcher6 variation", () => {
    expect(fletcher6(str2seq('abcdef'))).not.toEqual(fletcher6(str2seq('bcdefa')));
})

test("wrap+codec is reversible", () => {
    const s = wrap64(fibencode(fibs), 'EF41');
    expect(fibdecode(unwrap64(s, 'EF41'))).toEqual(fibs);
})

test("wrap+codec is urlsafe", () => {
    const s = wrap64(fibencode(fibs), 'EF41');
    expect(encodeURIComponent(s)).toEqual(s);
})

test("wrap+codec is robust to special characters", () => {
    const s = wrap64(fibencode(fibs), 'EF41'),
        s2 = s.slice(0,5) + '\n @' + s.slice(5, 10) + '|&\t  ' + s.slice(10) + 'asdblkajeaf';
    expect(fibdecode(unwrap64(s2, 'EF41'))).toEqual(fibs);
})


