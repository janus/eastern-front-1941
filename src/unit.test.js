import {oobVariants} from './unit-data.js';
import {Oob} from './oob.js';
import {Mapboard} from './map.js';
import {Game} from './game.js';


const game = Game(),
    oob = game.oob;

game.turn = 1;
game.oob.reinforce();

// the second last column of raw data is CORPT for both apx and cart,
// and indexes the main unit name.  the high bit of low nibble is unused
test("CORPT bit 4 is unused", () => {
    Object.values(oobVariants).forEach(xs => expect(xs[xs.len - 2] & 0x08).toBe(0));
})

test("Unit counts", () => {
    let counts = [0, 0];
    game.oob.forEach(u => counts[u.player]++);
    expect(counts).toEqual([55, 104])
});

test("ZoC is calculated correctly", () => {
    /*
    set up a config like

        . O .       0 0 2
        . . X   =>  3 5 5
        X X .       6 7 4
    */

    let locs = game.mapboard.squareSpiral({lon: 20, lat: 20}, 3),
        p0 = 0, p1 = 0;

    while(oob[p0].player != 0) p0++;
    while(oob[p1].player != 1) p1++;

    locs[1].unitid = p0;
    locs[3].unitid = p1;
    locs[5].unitid = p1;
    locs[6].unitid = p1;
    let zocs = locs.map(loc => oob.zocAffecting(0, loc));
    expect(zocs).toEqual([5,0,2,5,4,7,6,3,0]);
});
